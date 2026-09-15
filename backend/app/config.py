"""Application configuration. All secrets come from environment variables."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Concepto"
    APP_VERSION: str = "1.0.0"
    ENV: str = "production"  # development | production
    DEBUG: bool = False

    # AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-2.0-flash"
    AI_MAX_RETRIES: int = 3
    AI_TIMEOUT_SECONDS: int = 90

    # Uploads
    MAX_UPLOAD_MB: int = 15
    ALLOWED_EXTENSIONS: str = "pdf,docx,txt"
    MAX_TEXT_CHARS: int = 120000

    # CORS (comma-separated origins, * allowed for demo)
    CORS_ORIGINS: str = "*"

    # Storage
    DATABASE_URL: str = "sqlite:///./loe.db"
    STORAGE_DIR: str = "./storage"

    # Frontend URL (used in CORS + docs)
    FRONTEND_URL: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
