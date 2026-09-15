"""Analysis + results + history endpoints."""
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import Job
from app.services import export_service
from app.services.analysis_service import result_from_job, run_analysis

router = APIRouter(prefix="/api", tags=["analysis"])


def _get_job(db: Session, job_id: str) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis not found. It may have been deleted.")
    return job


@router.post("/analyze/{job_id}", response_model=schemas.AnalysisResult)
def analyze(job_id: str, options: schemas.AnalyzeOptions | None = None, db: Session = Depends(get_db)):
    job = _get_job(db, job_id)
    opts = options or schemas.AnalyzeOptions()
    try:
        return run_analysis(db, job, opts)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)[:300]}")


@router.get("/results/{job_id}", response_model=schemas.AnalysisResult)
def get_results(job_id: str, db: Session = Depends(get_db)):
    job = _get_job(db, job_id)
    try:
        return result_from_job(job)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/history", response_model=list[schemas.HistoryItem])
def list_history(limit: int = Query(default=50, le=200), db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).limit(limit).all()
    return [
        schemas.HistoryItem(
            job_id=j.id, title=j.title or "Untitled analysis", filename=j.filename or "",
            status=j.status, content_type=j.content_type, word_count=j.word_count,
            objective_count=j.objective_count, coverage_score=j.coverage_score,
            avg_confidence=j.avg_confidence,
            created_at=j.created_at.isoformat() if j.created_at else "",
        )
        for j in jobs
    ]


@router.delete("/history/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = _get_job(db, job_id)
    db.delete(job)
    db.commit()
    return {"ok": True, "deleted": job_id}


@router.get("/export/{job_id}")
def export_result(job_id: str, format: str = Query(default="json"), db: Session = Depends(get_db)):
    fmt = format.lower()
    if fmt not in export_service.EXPORTERS:
        raise HTTPException(status_code=400, detail="Unsupported export format. Use json, csv, md, or pdf.")
    job = _get_job(db, job_id)
    try:
        result = result_from_job(job)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    payload, mime = export_service.EXPORTERS[fmt](result)
    ext = export_service.EXTENSIONS[fmt]
    safe_title = "".join(c if c.isalnum() or c in ("-", "_") else "-" for c in result.title[:40]).strip("-") or "analysis"
    return StreamingResponse(
        iter([payload]), media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{safe_title}.{ext}"'},
    )


@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    completed = [j for j in jobs if j.status == "completed"]
    total_objectives = sum(j.objective_count for j in completed)
    avg_cov = round(sum(j.coverage_score for j in completed) / len(completed), 1) if completed else 0
    avg_conf = round(sum(j.avg_confidence for j in completed) / len(completed), 3) if completed else 0
    bloom_totals = {lvl: 0 for lvl in ("remember", "understand", "apply", "analyze", "evaluate", "create")}
    for j in completed:
        try:
            dist = json.loads(j.result_json).get("bloom_distribution", {})
            for k in bloom_totals:
                bloom_totals[k] += int(dist.get(k, 0))
        except Exception:
            continue
    recent = [
        {"job_id": j.id, "title": j.title, "status": j.status, "objective_count": j.objective_count,
         "coverage_score": j.coverage_score, "created_at": j.created_at.isoformat() if j.created_at else ""}
        for j in sorted(jobs, key=lambda x: x.created_at or "", reverse=True)[:6]
    ]
    return {"total_analyses": len(jobs), "completed": len(completed),
            "total_objectives": total_objectives, "avg_coverage": avg_cov,
            "avg_confidence": avg_conf, "bloom_totals": bloom_totals, "recent": recent}
