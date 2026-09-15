"""Pydantic request/response schemas (API contract)."""
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

BloomLevel = Literal["remember", "understand", "apply", "analyze", "evaluate", "create"]


# ---------- Upload ----------
class TextUploadRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=120000)
    filename: Optional[str] = "pasted-content.txt"
    title: Optional[str] = None


class UploadResponse(BaseModel):
    job_id: str
    filename: str
    source_type: str
    content_type: str
    title: str
    preview: str
    word_count: int
    char_count: int
    reading_minutes: float
    status: str


# ---------- Analysis ----------
class AnalyzeOptions(BaseModel):
    include_assessments: bool = True
    include_gaps: bool = True
    max_objectives: int = Field(default=18, ge=4, le=40)
    difficulty: Literal["auto", "beginner", "intermediate", "advanced"] = "auto"


class Objective(BaseModel):
    id: str
    text: str
    bloom_level: BloomLevel
    confidence: float = Field(ge=0, le=1)
    kind: Literal["explicit", "implicit"] = "explicit"
    skills: List[str] = []
    concepts: List[str] = []


class Skill(BaseModel):
    name: str
    frequency: int = 1
    confidence: float = 0.8
    bloom_levels: List[str] = []


class Concept(BaseModel):
    name: str
    definition: str = ""
    importance: float = 0.7
    related_objectives: List[str] = []


class MCQ(BaseModel):
    question: str
    options: List[str]
    answer_index: int
    explanation: str = ""
    bloom_level: str = "understand"


class ShortAnswer(BaseModel):
    question: str
    sample_answer: str = ""
    bloom_level: str = "understand"


class PracticalTask(BaseModel):
    title: str
    description: str = ""
    bloom_level: str = "apply"


class ProjectSuggestion(BaseModel):
    title: str
    description: str = ""
    bloom_level: str = "create"


class Assessments(BaseModel):
    mcqs: List[MCQ] = []
    short_answers: List[ShortAnswer] = []
    practical_tasks: List[PracticalTask] = []
    projects: List[ProjectSuggestion] = []


class Gap(BaseModel):
    category: str  # foundation | bloom_imbalance | coverage
    severity: Literal["low", "medium", "high"] = "medium"
    title: str
    description: str = ""
    recommendation: str = ""


class Stats(BaseModel):
    word_count: int = 0
    char_count: int = 0
    reading_minutes: float = 0.0
    content_type: str = "lesson"


class AnalysisResult(BaseModel):
    job_id: str
    title: str
    summary: str = ""
    content_type: str = "lesson"
    stats: Stats
    objectives: List[Objective] = []
    bloom_distribution: Dict[str, int] = {}
    skills: List[Skill] = []
    concepts: List[Concept] = []
    assessments: Assessments = Assessments()
    gaps: List[Gap] = []
    coverage_score: float = 0.0
    avg_confidence: float = 0.0
    engine: str = "gemini"  # gemini | fallback


# ---------- History ----------
class HistoryItem(BaseModel):
    job_id: str
    title: str
    filename: str
    status: str
    content_type: str
    word_count: int
    objective_count: int
    coverage_score: float
    avg_confidence: float
    created_at: str


class ErrorResponse(BaseModel):
    detail: str
    code: str = "error"
