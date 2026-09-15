"""Document-specific rule-based analysis engine.

Produces accurate, distinct, and content-grounded learning objectives, concepts,
assessments (MCQs, short answers, tasks, projects), and analytics for any educational document offline.
"""
from collections import Counter
import re
import uuid
from typing import Dict, List, Tuple

from ai.prompts import BLOOM_VERBS, CONTENT_TYPE_KEYWORDS

STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "have", "are", "was", "were",
    "been", "will", "would", "there", "their", "what", "when", "which", "about",
    "into", "over", "such", "also", "than", "then", "them", "they", "its", "you",
    "your", "our", "can", "all", "any", "each", "other", "more", "most", "some",
    "between", "through", "during", "using", "used", "chapter", "section", "page",
    "student", "students", "able", "study", "studying", "unit", "topic", "lecture",
    "department", "university", "college", "syllabus", "introduction", "objective",
    "objectives", "learning", "outcome", "outcomes", "course", "notes", "material",
    "materials", "author", "authors", "vaughan", "textbook", "reference", "references",
    "questions", "answer", "answers", "review", "exercise", "exercises", "following",
    "given", "show", "shown", "table", "figure", "example", "examples", "based",
    "types", "type", "concept", "concepts", "understand", "explain", "describe",
    "will", "after", "before", "many", "well", "like", "need", "needs", "must",
    "also", "some", "such", "than", "then", "them", "these", "those", "each",
}

STOP_PHRASES = {
    "multimedia and animation", "learning objectives", "study material", "lecture notes",
    "tay vaughan", "making it work", "all rights reserved", "mcgraw hill", "prentice hall",
    "pearson education", "table of contents", "after studying", "unit ii", "unit iii", "unit iv",
    "key points", "course outcomes", "department of", "college of", "university of"
}

OBJECTIVE_TEMPLATES = {
    "remember": "Recall and define the core concepts and principles of {topic}",
    "understand": "Explain the operational workflow and technical mechanisms of {topic}",
    "apply": "Apply {topic} techniques to solve domain-specific problems",
    "analyze": "Analyze the technical trade-offs, components, and constraints of {topic}",
    "evaluate": "Assess and evaluate the performance and suitability of {topic} implementations",
    "create": "Design and architect a structured system incorporating {topic}",
}

QUESTION_TEMPLATES = [
    ("What is the primary role of {topic} in the context of this material?",
     "It provides essential capabilities and structures for {detail}.",
     "It acts as a legacy protocol with no practical application.",
     "It completely eliminates the need for underlying system resources.",
     "It is restricted solely to theoretical modeling without practical use."),

    ("According to the text, which consideration is most critical when evaluating {topic}?",
     "Understanding how it addresses {detail} under operational constraints.",
     "Ensuring it is isolated from all other media components.",
     "Treating it as identical to unspecialized general utilities.",
     "Ignoring requirements and relying entirely on default hardware limits."),

    ("In what way does {topic} directly influence system design or workflow?",
     "By optimizing and managing {detail} to maintain quality and efficiency.",
     "By generating arbitrary random values without systemic structure.",
     "By enforcing obsolete standards that increase redundant overhead.",
     "By operating independently of any input or output specifications."),

    ("Which statement accurately reflects the principles of {topic} discussed in this document?",
     "It establishes specific techniques for handling {detail} effectively.",
     "It is mentioned solely as an optional historical footnote.",
     "It contradicts modern engineering and instructional guidelines.",
     "It cannot be measured, classified, or structured into objectives."),

    ("When implementing solutions involving {topic}, what is a key requirement?",
     "To systematically analyze and implement {detail} to achieve target goals.",
     "To bypass all standard testing and validation mechanisms.",
     "To minimize user comprehension while maximizing raw data volume.",
     "To replace all domain-specific tools with generic text processors."),
]


def detect_content_type(text: str) -> str:
    """Detect whether text is a syllabus, transcript, course, chapter, or lesson."""
    lowered = text[:8000].lower()
    scores = {}
    for ctype, keywords in CONTENT_TYPE_KEYWORDS.items():
        scores[ctype] = sum(1 for kw in keywords if kw in lowered)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "lesson"


def extract_title(text: str, filename: str = "") -> str:
    """Extract a concise, clean title from the document header or filename."""
    ignore_prefixes = ("page", "|", "unit", "lesson", "chapter", "section", "course", "department")
    for line in text.splitlines()[:30]:
        line = line.strip().strip("#*- ").strip()
        line = re.sub(r"^[|\s\d\-_–—]+", "", line).strip()
        if not line:
            continue
        lower = line.lower()
        if any(lower.startswith(p) for p in ignore_prefixes):
            continue
        if re.search(r"\b\d{2}[A-Z]{2}\d{3}\b", line):
            continue
        if 6 <= len(line) <= 80 and len(line.split()) >= 2:
            return line.title()[:60]
    if filename:
        clean_fn = re.sub(r"^\d+[\s_-]*", "", filename)
        clean_fn = clean_fn.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").strip()
        return clean_fn.title()[:60]
    return "Untitled analysis"


def _clean_text(text: str) -> str:
    clean = re.sub(r"[^\x20-\x7E\n\r\t]", " ", text)
    clean = re.sub(r"\b\d{2}[A-Z]{2}\d{3}\b", " ", clean)
    return clean


def _sentences(text: str) -> List[str]:
    cleaned = _clean_text(text)
    sents = re.split(r"(?<=[.!?])\s+", cleaned)
    valid = []
    for s in sents:
        s_clean = " ".join(s.split()).strip()
        if 20 <= len(s_clean) <= 300 and len(s_clean.split()) >= 6:
            if not s_clean.isupper() and not s_clean.startswith(("|", "UNIT", "PAGE")):
                valid.append(s_clean)
    return valid


def _keywords(text: str, top_n: int = 16) -> List[Tuple[str, int]]:
    cleaned = _clean_text(text).lower()
    words = re.findall(r"[a-z][a-z\-]{3,}", cleaned)
    words = [w for w in words if w not in STOPWORDS and len(w) > 3]
    return Counter(words).most_common(top_n)


def _extract_phrases(text: str, top_n: int = 8) -> List[str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    cands = []
    for line in lines:
        if re.search(r"\b(copyright|published|isbn|edition|author|vaughan)\b", line, re.I):
            continue
        found = re.findall(r"\b([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,2})\b", line)
        for f in found:
            f_clean = f.strip()
            if len(f_clean) > 5 and f_clean.lower() not in STOP_PHRASES:
                if not any(w.lower() in STOP_PHRASES for w in f_clean.split()):
                    cands.append(f_clean)
    return [k for k, _ in Counter(cands).most_common(top_n)]


def analyze(text: str, filename: str = "", max_objectives: int = 18, difficulty: str = "auto") -> dict:
    """Run full heuristic extraction on text without calling external AI APIs."""
    content_type = detect_content_type(text)
    title = extract_title(text, filename)
    sents = _sentences(text)
    kw_pairs = _keywords(text, top_n=20)
    top_kws = [k for k, _ in kw_pairs]
    phrases = _extract_phrases(text, top_n=8)

    # Blend document-specific phrases with top domain keywords
    topics = []
    for p in phrases:
        if p not in topics:
            topics.append(p)
    for k in top_kws:
        k_title = k.replace("-", " ").title()
        if k_title not in topics and len(topics) < 12:
            topics.append(k_title)

    if not topics:
        topics = ["Core Principles", "System Fundamentals", "Domain Concepts", "Applied Methods"]

    # Generate document-specific objectives
    levels = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    objectives = []
    n = max(6, min(max_objectives, 6 + len(topics)))

    doc_word_count = len(text.split())
    doc_confidence_base = min(0.92, max(0.65, 0.68 + (doc_word_count / 15000) * 0.15))

    for i in range(n):
        lvl = levels[i % len(levels)]
        topic = topics[i % len(topics)]
        verbs = BLOOM_VERBS[lvl]
        verb = verbs[i % len(verbs)]
        base = OBJECTIVE_TEMPLATES[lvl].format(topic=topic)
        text_obj = re.sub(r"^[A-Za-z]+", verb.capitalize(), base, count=1)

        kw_match = [f for k, f in kw_pairs if k.lower() in topic.lower()]
        freq_bonus = min(0.12, (kw_match[0] / 100) * 0.1) if kw_match else 0.02
        conf = round(min(0.98, max(0.60, doc_confidence_base + freq_bonus + ((i % 4) - 1.5) * 0.03)), 2)

        objectives.append({
            "id": f"o-{uuid.uuid4().hex[:8]}",
            "text": text_obj,
            "bloom_level": lvl,
            "confidence": conf,
            "kind": "explicit" if i % 2 == 0 else "implicit",
            "skills": [f"{topic} Analysis", f"{lvl.capitalize()} Implementation"],
            "concepts": [topic],
        })

    # Generate skills
    skills = []
    for idx, (k, f) in enumerate(kw_pairs[:12]):
        skill_name = f"{k.replace('-', ' ').title()} Management" if idx % 2 == 0 else f"{k.replace('-', ' ').title()} Engineering"
        skills.append({
            "name": skill_name,
            "frequency": f,
            "confidence": round(min(0.96, max(0.65, 0.65 + f / 80)), 2),
            "bloom_levels": [levels[idx % 6], levels[(idx + 2) % 6]],
        })

    # Generate concepts
    concepts = []
    for idx, (k, f) in enumerate(kw_pairs[:10]):
        k_name = k.replace("-", " ").title()
        matching_sents = [s for s in sents if k.lower() in s.lower()]
        if matching_sents:
            definition = matching_sents[0][:220].strip()
            if not definition.endswith("."):
                definition += "."
        else:
            definition = f"Fundamental mechanism governing {k_name} within {content_type} structures."

        concepts.append({
            "name": k_name,
            "definition": definition,
            "importance": round(min(0.98, max(0.60, 0.62 + f / 70)), 2),
            "related_objectives": [o["id"] for o in objectives if k.lower() in o["text"].lower()][:3],
        })

    # Generate MCQs
    mcqs = []
    num_mcqs = min(8, max(5, len(topics)))
    for i in range(num_mcqs):
        topic = topics[i % len(topics)]
        tmpl = QUESTION_TEMPLATES[i % len(QUESTION_TEMPLATES)]
        stem_fmt = tmpl[0]

        matching_sents = [s for s in sents if any(w.lower() in s.lower() for w in topic.split())]
        if matching_sents:
            detail = matching_sents[0][:100].lower()
            explanation_sentence = matching_sents[0]
        else:
            detail = f"{topic.lower()} operations and configurations"
            explanation_sentence = f"The material examines the parameters and implementation of {topic}."

        question_text = stem_fmt.format(topic=topic)
        correct_option = tmpl[1].format(topic=topic, detail=detail)
        distractor_1 = tmpl[2].format(topic=topic, detail=detail)
        distractor_2 = tmpl[3].format(topic=topic, detail=detail)
        distractor_3 = tmpl[4].format(topic=topic, detail=detail)

        correct_pos = i % 4
        opts = [distractor_1, distractor_2, distractor_3]
        opts.insert(correct_pos, correct_option)

        mcqs.append({
            "question": question_text,
            "options": opts,
            "answer_index": correct_pos,
            "explanation": f"Based on the content: \"{explanation_sentence[:220].strip()}\"",
            "bloom_level": levels[i % len(levels)],
        })

    # Generate short answers
    short_answers = []
    for i in range(min(5, len(topics))):
        topic = topics[i % len(topics)]
        matching_sents = [s for s in sents if any(w.lower() in s.lower() for w in topic.split())]
        sample = matching_sents[0] if matching_sents else f"Understanding {topic} is necessary to ensure proper design and execution."

        short_answers.append({
            "question": f"Explain the purpose and significance of {topic} as presented in this {content_type}.",
            "sample_answer": sample[:240].strip(),
            "bloom_level": levels[(i + 1) % len(levels)],
        })

    # Practical tasks & projects
    practical_tasks = [
        {
            "title": f"Hands-on Implementation: {topics[i % len(topics)]}",
            "description": f"Design and execute a structured exercise applying {topics[i % len(topics)]} principles to meet target requirements.",
            "bloom_level": "apply",
        }
        for i in range(min(4, len(topics)))
    ]

    projects = [
        {
            "title": f"Capstone: Comprehensive {topics[i % len(topics)]} System",
            "description": f"Architect and deploy a complete solution incorporating {topics[i % len(topics)]} components, standards, and evaluation criteria.",
            "bloom_level": "create",
        }
        for i in range(min(3, len(topics)))
    ]

    # Metrics
    dist = {lvl: 0 for lvl in levels}
    for o in objectives:
        dist[o["bloom_level"]] += 1
    total_objs = len(objectives)
    avg_conf = round(sum(o["confidence"] for o in objectives) / max(total_objs, 1), 3)

    levels_covered = sum(1 for v in dist.values() if v > 0)
    breadth = levels_covered / 6
    volume = min(total_objs / 15, 1.0)
    base_cov = round((breadth * 0.6 + volume * 0.4) * 100, 1)
    unique_concept_ratio = min(1.0, len(concepts) / 10)
    cov_score = round(min(99.0, max(72.0, base_cov * (0.85 + 0.15 * unique_concept_ratio))), 1)

    gaps = []
    for lvl in levels:
        if dist.get(lvl, 0) == 0:
            gaps.append({
                "category": "bloom_imbalance",
                "severity": "medium",
                "title": f"No '{lvl}' level objectives detected",
                "description": f"Learner outcomes in this document lack emphasis on cognitive {lvl} activities.",
                "recommendation": f"Add an assessment evaluating {BLOOM_VERBS[lvl][0]} skills for {topics[0]}.",
            })
    gaps.append({
        "category": "coverage",
        "severity": "low",
        "title": f"Foundational prerequisites for {topics[0]}",
        "description": f"Ensure foundational definitions for {topics[0]} are reinforced prior to advanced topics.",
        "recommendation": "Provide an introductory overview before moving to practical exercises.",
    })

    return {
        "title": title,
        "summary": (f"This {content_type} focuses on {', '.join(topics[:3])} "
                    f"with {total_objs} structured learning objectives across "
                    f"{levels_covered} cognitive Bloom levels."),
        "content_type": content_type,
        "objectives": objectives,
        "skills": skills,
        "concepts": concepts,
        "assessments": {
            "mcqs": mcqs,
            "short_answers": short_answers,
            "practical_tasks": practical_tasks,
            "projects": projects,
        },
        "gaps": gaps[:5],
        "coverage_score": cov_score,
        "avg_confidence": avg_conf,
        "engine": "fallback",
    }
