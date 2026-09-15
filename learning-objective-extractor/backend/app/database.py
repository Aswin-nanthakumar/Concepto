"""SQLite database setup (file-based, zero-config, Render-friendly)."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

os.makedirs(settings.STORAGE_DIR, exist_ok=True)

# Normalize Render/Heroku postgres:// to postgresql:// for SQLAlchemy
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("sqlite:///"):
    sqlite_path = db_url.replace("sqlite:///", "")
    if os.path.dirname(sqlite_path):
        os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app import models  # noqa: F401  (register models)
    Base.metadata.create_all(bind=engine)
