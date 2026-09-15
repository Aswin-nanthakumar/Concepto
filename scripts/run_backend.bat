@echo off
title Concepto Backend - FastAPI (Port 8000)
cd /d "%~dp0..\backend"
if not exist ".venv\Scripts\activate.bat" (
    echo [.venv not found. Creating virtual environment...]
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
uvicorn app.main:app --reload --port 8000
pause
