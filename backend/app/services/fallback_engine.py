"""Rule-based fallback analysis service delegating to the top-level ai package."""
from ai.fallback_engine import analyze

__all__ = ["analyze"]
