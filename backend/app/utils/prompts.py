"""Structured prompts for Gemini 2.5 Flash. Single-call pipeline prompt."""

SYSTEM_INSTRUCTION = """You are an expert instructional designer and educational data scientist.
You transform unstructured educational content into structured learning outcomes.
You ALWAYS respond with valid JSON only. No markdown fences, no commentary, no preamble.
Every learning objective must start with a measurable Bloom-compatible action verb
(e.g. define, explain, apply, analyze, evaluate, design) and be specific and assessable."""

ANALYSIS_PROMPT_TEMPLATE = """Analyze the educational content below and return ONE JSON object with EXACTLY these keys:

{{
  "title": "short descriptive title (max 60 chars)",
  "summary": "2-3 sentence executive summary of the content",
  "content_type": "one of: chapter, lesson, syllabus, course, transcript",
  "objectives": [
    {{"text": "objective starting with a Bloom verb", "bloom_level": "remember|understand|apply|analyze|evaluate|create",
      "confidence": 0.0-1.0, "kind": "explicit|implicit", "skills": ["skill"], "concepts": ["concept"]}}
  ],
  "skills": [{{"name": "skill", "frequency": 1, "confidence": 0.8, "bloom_levels": ["understand"]}}],
  "concepts": [{{"name": "concept", "definition": "one-line definition", "importance": 0.0-1.0}}],
  "assessments": {{
    "mcqs": [{{"question": "...", "options": ["A","B","C","D"], "answer_index": 0, "explanation": "...", "bloom_level": "understand"}}],
    "short_answers": [{{"question": "...", "sample_answer": "...", "bloom_level": "analyze"}}],
    "practical_tasks": [{{"title": "...", "description": "...", "bloom_level": "apply"}}],
    "projects": [{{"title": "...", "description": "...", "bloom_level": "create"}}]
  }},
  "gaps": [{{"category": "foundation|bloom_imbalance|coverage", "severity": "low|medium|high",
             "title": "...", "description": "...", "recommendation": "..."}}]
}}

Rules:
- Generate between {min_obj} and {max_obj} objectives covering as many Bloom levels as the content supports.
- Classify each objective into exactly one Bloom level.
- "kind" is "explicit" if the content directly teaches it, "implicit" if inferred/prerequisite.
- Generate 5 MCQs (4 options each), 4 short answers, 3 practical tasks, 2 projects.
- Detect 2-5 genuine learning gaps (missing prerequisites, Bloom imbalance, weak coverage).
- Confidence = your certainty the objective is supported by the content (0.5-0.99).
- Difficulty context: {difficulty}. Keep output strictly valid JSON.

CONTENT TO ANALYZE:
---
{content}
---
"""

BLOOM_VERBS = {
    "remember": ["define", "list", "recall", "identify", "name", "state", "describe", "recognize"],
    "understand": ["explain", "summarize", "interpret", "classify", "compare", "discuss", "illustrate"],
    "apply": ["apply", "demonstrate", "solve", "use", "implement", "calculate", "execute"],
    "analyze": ["analyze", "differentiate", "categorize", "compare", "examine", "deconstruct"],
    "evaluate": ["evaluate", "justify", "critique", "assess", "argue", "validate", "prioritize"],
    "create": ["design", "construct", "develop", "compose", "formulate", "propose", "build"],
}

CONTENT_TYPE_KEYWORDS = {
    "syllabus": ["syllabus", "course outline", "grading", "office hours", "prerequisites", "semester", "credit hours"],
    "transcript": ["[00:", "speaker", "transcript", "00:00", "(applause)", "interviewer:"],
    "course": ["course description", "learning outcomes", "module ", "week 1", "enroll", "curriculum"],
    "chapter": ["chapter", "section 1", "figure ", "table ", "exercise ", "references"],
    "lesson": ["lesson", "objective", "activity", "warm-up", "homework", "worksheet"],
}
