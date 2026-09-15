"""SQLAlchemy models."""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database import Base


def _uid() -> str:
    return uuid.uuid4().hex[:12]


class Job(Base):
    """One uploaded / analyzed content job."""

    __tablename__ = "jobs"

    id = Column(String(16), primary_key=True, default=_uid)
    filename = Column(String(255), nullable=True)
    source_type = Column(String(20), default="text")  # pdf | docx | txt | text
    content_type = Column(String(40), default="lesson")  # chapter|lesson|syllabus|course|transcript
    status = Column(String(20), default="uploaded")  # uploaded|processing|completed|failed
    word_count = Column(Integer, default=0)
    reading_minutes = Column(Float, default=0.0)
    char_count = Column(Integer, default=0)
    title = Column(String(255), default="Untitled analysis")
    preview = Column(Text, default="")
    content_text = Column(Text, default="")
    result_json = Column(Text, default="")  # serialized AnalysisResult
    error = Column(Text, default="")
    coverage_score = Column(Float, default=0.0)
    avg_confidence = Column(Float, default=0.0)
    objective_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
