# Concepto AI Engine

This module powers the extraction, classification, and gap analysis pipeline for **Concepto**.

## Features

1. **Google Gemini LLM Integration** (`ai.gemini_client`):
   - Structured JSON output with schema coercion and error recovery.
   - Exponential backoff retry logic and automatic model failover (`gemini-2.5-flash` → `gemini-2.0-flash`).
2. **Bloom's Taxonomy Engine** (`ai.bloom_engine`):
   - Measurable cognitive action verb classification.
   - Distribution analytics across 6 Bloom cognitive levels:
     - Remember
     - Understand
     - Apply
     - Analyze
     - Evaluate
     - Create
   - Higher-Order Thinking Skills (HOTS) vs Lower-Order (LOTS) balance scoring.
3. **Offline Fallback Engine** (`ai.fallback_engine`):
   - Deterministic NLP keyword extraction, document topic detection, and gap analysis.
   - Runs fully offline without an API key.
4. **Structured Prompts** (`ai.prompts`):
   - Prompts for single-pass objective, concept, skill, MCQ, and project generation.
