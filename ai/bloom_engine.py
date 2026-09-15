"""Bloom's Revised Taxonomy Engine.

Provides cognitive level classifications, measurable verb mappings,
and statistical distribution metrics across Bloom's levels:
1. Remember
2. Understand
3. Apply
4. Analyze
5. Evaluate
6. Create
"""
from typing import Dict, List, Optional
from ai.prompts import BLOOM_VERBS

BLOOM_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"]

BLOOM_DESCRIPTIONS = {
    "remember": "Retrieving, recognizing, and recalling relevant knowledge from long-term memory.",
    "understand": "Constructing meaning from oral, written, and graphic messages through interpreting, exemplifying, classifying, summarizing, inferring, comparing, and explaining.",
    "apply": "Carrying out or using a procedure through executing, or implementing.",
    "analyze": "Breaking material into constituent parts, determining how the parts relate to one another and to an overall structure or purpose through differentiating, organizing, and attributing.",
    "evaluate": "Making judgments based on criteria and standards through checking and critiquing.",
    "create": "Putting elements together to form a coherent or functional whole; reorganizing elements into a new pattern or structure through generating, planning, or producing.",
}


def classify_verb(verb: str) -> str:
    """Return the Bloom cognitive level for a given action verb, or 'understand' as default."""
    v = verb.lower().strip()
    for level, verbs in BLOOM_VERBS.items():
        if v in verbs:
            return level
    return "understand"


def calculate_distribution(objectives: List[dict]) -> Dict[str, int]:
    """Calculate the count of objectives per Bloom cognitive level."""
    dist = {lvl: 0 for lvl in BLOOM_LEVELS}
    for obj in objectives:
        lvl = str(obj.get("bloom_level", "understand")).lower()
        if lvl in dist:
            dist[lvl] += 1
        else:
            dist["understand"] += 1
    return dist


def assess_bloom_balance(distribution: Dict[str, int]) -> Dict[str, any]:
    """Assess whether higher-order thinking skills (HOTS) and lower-order (LOTS) are balanced."""
    total = sum(distribution.values()) or 1
    lots = distribution.get("remember", 0) + distribution.get("understand", 0) + distribution.get("apply", 0)
    hots = distribution.get("analyze", 0) + distribution.get("evaluate", 0) + distribution.get("create", 0)
    lots_pct = round((lots / total) * 100, 1)
    hots_pct = round((hots / total) * 100, 1)

    is_balanced = 30 <= hots_pct <= 70
    recommendation = (
        "Balanced distribution across lower and higher-order thinking skills."
        if is_balanced else
        "High concentration of foundational skills. Consider adding more analytical and creative objectives."
        if lots_pct > 70 else
        "Advanced cognitive load. Ensure foundational concepts and memory retrieval are adequately supported."
    )
    return {
        "total": total,
        "lots_percentage": lots_pct,
        "hots_percentage": hots_pct,
        "is_balanced": is_balanced,
        "recommendation": recommendation,
    }
