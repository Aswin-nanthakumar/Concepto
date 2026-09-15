"""Gemini LLM Client for educational analysis.

Handles Google Gemini 2.5 Flash / 2.0 Flash calls, structured JSON extraction,
exponential backoff retries, and normalization.
"""
import json
import logging
import re
import time
from typing import Any, Dict, List, Optional
from ai.prompts import ANALYSIS_PROMPT_TEMPLATE, SYSTEM_INSTRUCTION

logger = logging.getLogger("concepto.ai")

VALID_BLOOMS = {"remember", "understand", "apply", "analyze", "evaluate", "create"}
VALID_CONTENT_TYPES = {"chapter", "lesson", "syllabus", "course", "transcript"}


def extract_json_from_text(raw: str) -> Dict[str, Any]:
    """Robustly extract a JSON object from raw LLM output, handling code fences or stray text."""
    text = raw.strip()
    # Strip markdown fences if present
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()

    # Find the outermost JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Simple cleanup attempt (trailing commas)
        cleaned = re.sub(r",\s*([}\]])", r"\1", text)
        return json.loads(cleaned)


def normalize_ai_output(data: dict) -> dict:
    """Validate and coerce raw AI JSON into the expected schema."""
    data = data if isinstance(data, dict) else {}
    out: dict = {}
    out["title"] = str(data.get("title") or "Untitled analysis")[:80]
    out["summary"] = str(data.get("summary") or "")
    ct = str(data.get("content_type") or "lesson").lower().strip()
    out["content_type"] = ct if ct in VALID_CONTENT_TYPES else "lesson"

    objectives = []
    for o in (data.get("objectives") or []):
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
         "confidence": max(0.0, min(1.0, float(s.get("confidence", 0.8) or 0.8))),
         "bloom_levels": [b for b in (s.get("bloom_levels") or []) if b in VALID_BLOOMS][:3]}
        for s in (data.get("skills") or []) if isinstance(s, dict) and s.get("name")
    ][:20]

    out["concepts"] = [
        {"name": str(c.get("name", ""))[:80],
         "definition": str(c.get("definition", ""))[:300],
         "importance": max(0.0, min(1.0, float(c.get("importance", 0.7) or 0.7)))}
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
        mcqs.append({
            "question": str(m["question"])[:400],
            "options": opts,
            "answer_index": max(0, min(3, ans)),
            "explanation": str(m.get("explanation", ""))[:400],
            "bloom_level": str(m.get("bloom_level", "understand")),
        })
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


def generate_analysis(
    content: str,
    api_key: str,
    primary_model: str = "gemini-2.5-flash",
    fallback_model: str = "gemini-2.0-flash",
    max_retries: int = 3,
    timeout_seconds: int = 90,
    max_objectives: int = 18,
    difficulty: str = "auto",
) -> Dict[str, Any]:
    """Execute Gemini analysis with model failover and JSON normalization."""
    if not api_key:
        raise ValueError("Gemini API key is required")

    import google.generativeai as genai
    genai.configure(api_key=api_key)

    prompt = ANALYSIS_PROMPT_TEMPLATE.format(
        content=content[:60000],
        min_obj=max(4, min(max_objectives - 4, 10)),
        max_obj=max_objectives,
        difficulty=difficulty,
    )

    last_err: Optional[Exception] = None
    for attempt in range(1, max_retries + 1):
        model_name = primary_model if attempt <= 2 else fallback_model
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_INSTRUCTION,
                generation_config={"temperature": 0.3, "response_mime_type": "application/json"},
            )
            resp = model.generate_content(prompt, request_options={"timeout": timeout_seconds})
            raw = (getattr(resp, "text", "") or "").strip()
            if not raw:
                raise RuntimeError("Empty response received from Gemini model")

            data = normalize_ai_output(extract_json_from_text(raw))
            if len(data["objectives"]) < 3:
                raise RuntimeError("AI returned fewer than 3 objectives")

            logger.info("Gemini analysis successful (attempt %d, model %s)", attempt, model_name)
            data["engine"] = "gemini"
            return data
        except Exception as e:
            last_err = e
            logger.warning("Gemini attempt %d failed: %s", attempt, e)
            time.sleep(min(2 ** attempt, 8))

    raise RuntimeError(f"AI analysis failed after {max_retries} attempts: {last_err}")
