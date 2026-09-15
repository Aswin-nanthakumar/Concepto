@echo off
title Concepto Service Launcher
echo =======================================================
echo Launching Backend and Frontend in Separate Terminals...
echo =======================================================
start "Concepto Backend (FastAPI - Port 8000)" cmd /k ""%~dp0run_backend.bat""
timeout /t 2 /nobreak >nul
start "Concepto Frontend (Vite - Port 5173)" cmd /k ""%~dp0run_frontend.bat""
echo Both services launched in separate terminal windows!
