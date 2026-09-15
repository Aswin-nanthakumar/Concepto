"""Gemini integration service delegating to the top-level ai package."""
import logging
from app.config import settings

# Import from top-level ai module
from ai.gemini_client import generate_analysis

logger = logging.getLogger("loe.ai")


def analyze_with_gemini(
    content: str,
    max_objectives: int = 18,
    difficulty: str = "auto",
) -> dict:
    """Delegate LLM analysis to the dedicated ai module."""
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    return generate_analysis(
        content=content,
        api_key=settings.GEMINI_API_KEY,
        primary_model=settings.GEMINI_MODEL,
        fallback_model=settings.GEMINI_FALLBACK_MODEL,
        max_retries=settings.AI_MAX_RETRIES,
        timeout_seconds=settings.AI_TIMEOUT_SECONDS,
        max_objectives=max_objectives,
        difficulty=difficulty,
    )
