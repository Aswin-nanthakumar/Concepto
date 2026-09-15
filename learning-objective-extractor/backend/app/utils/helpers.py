"""Shared helpers: JSON repair, stats, ids."""
import json
import re
import uuid

FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


def new_id(prefix: str = "o") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def extract_json(raw: str) -> dict:
    """Robust JSON extraction: handles fences, preamble, trailing commas."""
    if not raw:
        raise ValueError("Empty AI response")
    text = raw.strip()
    m = FENCE_RE.search(text)
    if m:
        text = m.group(1).strip()
    # Find outermost JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in AI response")
    candidate = text[start : end + 1]
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        # Repair: remove trailing commas, fix smart quotes
        fixed = re.sub(r",\s*([}\]])", r"\1", candidate)
        fixed = fixed.replace("\u201c", '"').replace("\u201d", '"').replace("\u2019", "'")
        return json.loads(fixed)


def safe_float(v, default: float = 0.8, lo: float = 0.0, hi: float = 1.0) -> float:
    try:
        f = float(v)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, f))


def bloom_distribution(objectives: list) -> dict:
    levels = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    dist = {lvl: 0 for lvl in levels}
    for o in objectives:
        lvl = o.get("bloom_level") if isinstance(o, dict) else getattr(o, "bloom_level", None)
        if lvl in dist:
            dist[lvl] += 1
    return dist


def coverage_score(dist: dict, objective_count: int) -> float:
    """0-100: rewards Bloom breadth + objective volume."""
    levels_covered = sum(1 for v in dist.values() if v > 0)
    breadth = levels_covered / 6
    volume = min(objective_count / 15, 1.0)
    balance = 1.0
    if levels_covered > 1:
        vals = [v for v in dist.values() if v > 0]
        balance = 1 - (max(vals) - min(vals)) / max(sum(vals), 1)
    return round((breadth * 0.45 + volume * 0.25 + balance * 0.30) * 100, 1)
