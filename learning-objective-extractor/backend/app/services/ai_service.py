"""Gemini 2.5 Flash integration with retries, validation, and fallback."""
import logging
import time

from app.config import settings
from app.utils.helpers import extract_json
from app.utils.prompts import ANALYSIS_PROMPT_TEMPLATE, SYSTEM_INSTRUCTION

logger = logging.getLogger("loe.ai")

VALID_BLOOMS = {"remember", "understand", "apply", "analyze", "evaluate", "create"}
VALID_CONTENT_TYPES = {"chapter", "lesson", "syllabus", "course", "transcript"}


def _get_model(name: str):
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(
        model_name=name,
        system_instruction=SYSTEM_INSTRUCTION,
        generation_config={"temperature": 0.3, "response_mime_type": "application/json"},
    )


def _normalize(data: dict) -> dict:
    """Validate + coerce raw AI JSON into the expected shape. Never raises fatally."""
    data = data if isinstance(data, dict) else {}
    out: dict = {}
    out["title"] = str(data.get("title") or "Untitled analysis")[:80]
    out["summary"] = str(data.get("summary") or "")
    ct = str(data.get("content_type") or "lesson").lower().strip()
    out["content_type"] = ct if ct in VALID_CONTENT_TYPES else "lesson"

    objectives = []
    for i, o in enumerate(data.get("objectives") or []):
        if not isinstance(o, dict) or not o.get("text"):
            continue
        lvl = str(o.get("bloom_level") or "understand").lower().strip()
        try:
            conf = float(o.get("confidence", 0.8))
        except (TypeError, ValueError):
            conf = 0.8
        objectives.append({
            "text": str(o["text"]).strip()[:300],
            "bloom_level": lvl if lvl in VALID_BLOOMS else "understand",
            "confidence": max(0.0, min(1.0, conf)),
            "kind": "implicit" if str(o.get("kind")).lower() == "implicit" else "explicit",
            "skills": [str(s)[:60] for s in (o.get("skills") or []) if s][:5],
            "concepts": [str(c)[:60] for c in (o.get("concepts") or []) if c][:5],
        })
    out["objectives"] = objectives

    out["skills"] = [
        {"name": str(s.get("name", ""))[:60],
         "frequency": int(s.get("frequency", 1) or 1),
         "confidence": max(0, min(1, float(s.get("confidence", 0.8) or 0.8))),
         "bloom_levels": [b for b in (s.get("bloom_levels") or []) if b in VALID_BLOOMS][:3]}
        for s in (data.get("skills") or []) if isinstance(s, dict) and s.get("name")
    ][:20]

    out["concepts"] = [
        {"name": str(c.get("name", ""))[:80],
         "definition": str(c.get("definition", ""))[:300],
         "importance": max(0, min(1, float(c.get("importance", 0.7) or 0.7)))}
        for c in (data.get("concepts") or []) if isinstance(c, dict) and c.get("name")
    ][:20]

    a = data.get("assessments") or {}
    mcqs = []
    for m in (a.get("mcqs") or []):
        if not isinstance(m, dict) or not m.get("question"):
            continue
        opts = [str(x)[:200] for x in (m.get("options") or [])][:4]
        while len(opts) < 4:
            opts.append(f"Option {len(opts) + 1}")
        try:
            ans = int(m.get("answer_index", 0))
        except (TypeError, ValueError):
            ans = 0
        mcqs.append({"question": str(m["question"])[:400], "options": opts,
                     "answer_index": max(0, min(3, ans)),
                     "explanation": str(m.get("explanation", ""))[:400],
                     "bloom_level": str(m.get("bloom_level", "understand"))})
    out["assessments"] = {
        "mcqs": mcqs[:8],
        "short_answers": [
            {"question": str(s.get("question", ""))[:400],
             "sample_answer": str(s.get("sample_answer", ""))[:600],
             "bloom_level": str(s.get("bloom_level", "understand"))}
            for s in (a.get("short_answers") or []) if isinstance(s, dict) and s.get("question")
        ][:6],
        "practical_tasks": [
            {"title": str(t.get("title", ""))[:140],
             "description": str(t.get("description", ""))[:600],
             "bloom_level": str(t.get("bloom_level", "apply"))}
            for t in (a.get("practical_tasks") or []) if isinstance(t, dict) and t.get("title")
        ][:5],
        "projects": [
            {"title": str(p.get("title", ""))[:140],
             "description": str(p.get("description", ""))[:600],
             "bloom_level": str(p.get("bloom_level", "create"))}
            for p in (a.get("projects") or []) if isinstance(p, dict) and p.get("title")
        ][:4],
    }

    out["gaps"] = [
        {"category": str(g.get("category", "coverage")),
         "severity": str(g.get("severity", "medium")).lower()
         if str(g.get("severity", "")).lower() in ("low", "medium", "high") else "medium",
         "title": str(g.get("title", ""))[:140],
         "description": str(g.get("description", ""))[:500],
         "recommendation": str(g.get("recommendation", ""))[:500]}
        for g in (data.get("gaps") or []) if isinstance(g, dict) and g.get("title")
    ][:8]
    return out


def analyze_with_gemini(content: str, max_objectives: int = 18,
                        difficulty: str = "auto") -> dict:
    """Call Gemini with retry. Raises RuntimeError on total failure (caller falls back)."""
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    prompt = ANALYSIS_PROMPT_TEMPLATE.format(
        content=content[:60000],
        min_obj=max(4, min(max_objectives - 4, 10)),
        max_obj=max_objectives,
        difficulty=difficulty,
    )
    last_err: Exception | None = None
    for attempt in range(1, settings.AI_MAX_RETRIES + 1):
        model_name = settings.GEMINI_MODEL if attempt <= 2 else settings.GEMINI_FALLBACK_MODEL
        try:
            model = _get_model(model_name)
            resp = model.generate_content(prompt, request_options={"timeout": settings.AI_TIMEOUT_SECONDS})
            raw = (getattr(resp, "text", "") or "").strip()
            if not raw:
                raise RuntimeError("Empty response from AI model")
            data = _normalize(extract_json(raw))
            if len(data["objectives"]) < 3:
                raise RuntimeError("AI returned too few objectives")
            logger.info("Gemini analysis OK (attempt %d, model %s)", attempt, model_name)
            data["engine"] = "gemini"
            return data
        except Exception as e:  # noqa: BLE001 - retry then escalate
            last_err = e
            logger.warning("Gemini attempt %d failed: %s", attempt, e)
            time.sleep(min(2 ** attempt, 8))
    raise RuntimeError(f"AI analysis failed after retries: {last_err}")
