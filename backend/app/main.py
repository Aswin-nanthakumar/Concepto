"""Learning Objective Extractor — FastAPI application entrypoint."""
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routers import analyze, health, upload

logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger("loe")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Transform unstructured educational content into structured learning outcomes.",
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()] or ["*"]
allow_all = "*" in origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not allow_all else ["*"],
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    logger.info("%s v%s started (ai_configured=%s)", settings.APP_NAME,
                settings.APP_VERSION, bool(settings.GEMINI_API_KEY))


@app.exception_handler(Exception)
async def unhandled_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={
        "detail": "Something went wrong on our end. Please try again in a moment.",
        "code": "internal_error"})


app.include_router(health.router)
app.include_router(upload.router)
app.include_router(analyze.router)


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION,
            "docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

