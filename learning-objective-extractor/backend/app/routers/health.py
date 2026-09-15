"""Health + readiness endpoints."""
from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION,
            "ai_configured": bool(settings.GEMINI_API_KEY)}


@router.get("/api/health")
def api_health():
    return {"status": "ok", "version": settings.APP_VERSION,
            "ai_configured": bool(settings.GEMINI_API_KEY),
            "model": settings.GEMINI_MODEL}
