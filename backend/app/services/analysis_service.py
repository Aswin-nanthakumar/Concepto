"""Orchestrates the 7-step pipeline: parse -> detect -> concepts -> objectives
-> bloom -> assessments -> gaps. Gemini first, rule-based fallback second."""
import json
import logging

from sqlalchemy.orm import Session

from app import schemas
from app.models import Job
from app.services import fallback_engine
from app.services.ai_service import analyze_with_gemini
from app.services.document_service import detect_content_type
from app.utils.helpers import bloom_distribution, coverage_score, new_id
from app.utils.validators import reading_minutes, word_count

logger = logging.getLogger("loe.analysis")


def run_analysis(db: Session, job: Job, options: schemas.AnalyzeOptions) -> schemas.AnalysisResult:
    job.status = "processing"
    db.commit()
    try:
        try:
            data = analyze_with_gemini(job.content_text, options.max_objectives, options.difficulty)
            engine = "gemini"
        except Exception as e:  # noqa: BLE001 - graceful degradation
            logger.warning("Gemini unavailable (%s); using fallback engine", e)
            data = fallback_engine.analyze(job.content_text, job.filename or "",
                                           options.max_objectives, options.difficulty)
            engine = "fallback"

        # Attach stable IDs + related objective links
        for o in data["objectives"]:
            o.setdefault("id", new_id("o"))
        name_to_ids: dict[str, list[str]] = {}
        for c in data.get("concepts", []):
            c.setdefault("related_objectives", [])
        for o in data["objectives"]:
            for cname in o.get("concepts", []):
                name_to_ids.setdefault(str(cname).lower(), []).append(o["id"])
        for c in data.get("concepts", []):
            if not c["related_objectives"]:
                c["related_objectives"] = name_to_ids.get(str(c["name"]).lower(), [])[:3]

        if not options.include_assessments:
            data["assessments"] = {"mcqs": [], "short_answers": [], "practical_tasks": [], "projects": []}
        if not options.include_gaps:
            data["gaps"] = []

        dist = bloom_distribution(data["objectives"])
        avg_conf = round(sum(o["confidence"] for o in data["objectives"]) / max(len(data["objectives"]), 1), 3)
        coverage = coverage_score(dist, len(data["objectives"]))
        ctype = data.get("content_type") or detect_content_type(job.content_text)

        result = schemas.AnalysisResult(
            job_id=job.id,
            title=data.get("title") or job.title,
            summary=data.get("summary") or "",
            content_type=ctype,
            stats=schemas.Stats(word_count=job.word_count, char_count=job.char_count,
                                reading_minutes=job.reading_minutes, content_type=ctype),
            objectives=[schemas.Objective(**o) for o in data["objectives"]],
            bloom_distribution=dist,
            skills=[schemas.Skill(**s) for s in data.get("skills", [])],
            concepts=[schemas.Concept(**c) for c in data.get("concepts", [])],
            assessments=schemas.Assessments(
                mcqs=[schemas.MCQ(**m) for m in data["assessments"]["mcqs"]],
                short_answers=[schemas.ShortAnswer(**s) for s in data["assessments"]["short_answers"]],
                practical_tasks=[schemas.PracticalTask(**t) for t in data["assessments"]["practical_tasks"]],
                projects=[schemas.ProjectSuggestion(**p) for p in data["assessments"]["projects"]],
            ),
            gaps=[schemas.Gap(**g) for g in data.get("gaps", [])],
            coverage_score=coverage,
            avg_confidence=avg_conf,
            engine=engine,
        )

        job.status = "completed"
        job.title = result.title
        job.content_type = ctype
        job.result_json = result.model_dump_json()
        job.coverage_score = coverage
        job.avg_confidence = avg_conf
        job.objective_count = len(result.objectives)
        job.error = ""
        db.commit()
        return result
    except Exception as e:  # noqa: BLE001
        job.status = "failed"
        job.error = str(e)[:500]
        db.commit()
        raise


def result_from_job(job: Job) -> schemas.AnalysisResult:
    if job.status != "completed" or not job.result_json:
        raise ValueError("Analysis is not ready yet. Run analysis first.")
    data = json.loads(job.result_json)
    data["job_id"] = job.id
    return schemas.AnalysisResult(**data)


def refresh_stats(job: Job) -> Job:
    job.word_count = word_count(job.content_text)
    job.char_count = len(job.content_text)
    job.reading_minutes = reading_minutes(job.content_text)
    return job
