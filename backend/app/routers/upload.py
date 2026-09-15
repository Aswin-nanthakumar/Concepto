"""Upload endpoints: file upload + manual text input."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import schemas
from app.config import settings
from app.database import get_db
from app.models import Job
from app.services.analysis_service import refresh_stats
from app.services.document_service import detect_content_type, extract_title, parse_upload
from app.utils.validators import sanitize_text, validate_extension, validate_size

router = APIRouter(prefix="/api", tags=["upload"])


def _make_response(job: Job) -> schemas.UploadResponse:
    return schemas.UploadResponse(
        job_id=job.id, filename=job.filename or "content.txt", source_type=job.source_type,
        content_type=job.content_type, title=job.title, preview=job.preview,
        word_count=job.word_count, char_count=job.char_count,
        reading_minutes=job.reading_minutes, status=job.status,
    )


@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or "upload.txt"
    try:
        validate_extension(filename)
        data = await file.read()
        validate_size(len(data), settings.MAX_UPLOAD_MB)
        if not data:
            raise ValueError("The uploaded file is empty.")
        text, source_type = parse_upload(filename, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read this file. Please try a different format.")

    job = Job(filename=filename, source_type=source_type, content_text=text,
              preview=text[:600], status="uploaded")
    job.content_type = detect_content_type(text)
    job.title = extract_title(text, filename)
    refresh_stats(job)
    db.add(job)
    db.commit()
    db.refresh(job)
    return _make_response(job)


@router.post("/upload-text", response_model=schemas.UploadResponse)
def upload_text(payload: schemas.TextUploadRequest, db: Session = Depends(get_db)):
    text = sanitize_text(payload.text, settings.MAX_TEXT_CHARS)
    if len(text) < 50:
        raise HTTPException(status_code=400,
                            detail="Please provide at least 50 characters of content for meaningful analysis.")
    filename = payload.filename or "pasted-content.txt"
    job = Job(filename=filename, source_type="text", content_text=text,
              preview=text[:600], status="uploaded")
    job.content_type = detect_content_type(text)
    job.title = payload.title.strip()[:80] if payload.title and payload.title.strip() else extract_title(text, filename)
    refresh_stats(job)
    db.add(job)
    db.commit()
    db.refresh(job)
    return _make_response(job)


@router.get("/job/{job_id}", response_model=schemas.UploadResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Document not found.")
    return _make_response(job)
