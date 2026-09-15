"""Re-export prompts from the top-level ai package for backwards compatibility."""
from ai.prompts import (
    ANALYSIS_PROMPT_TEMPLATE,
    BLOOM_VERBS,
    CONTENT_TYPE_KEYWORDS,
    SYSTEM_INSTRUCTION,
)

__all__ = [
    "ANALYSIS_PROMPT_TEMPLATE",
    "BLOOM_VERBS",
    "CONTENT_TYPE_KEYWORDS",
    "SYSTEM_INSTRUCTION",
]
