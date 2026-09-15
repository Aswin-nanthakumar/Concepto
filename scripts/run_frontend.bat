@echo off
title Concepto Frontend - Vite (Port 5173)
cd /d "%~dp0..\frontend"
if not exist "node_modules" (
    echo [node_modules not found. Installing dependencies...]
    call npm.cmd install
)
echo Starting Vite Frontend on http://localhost:5173 ...
call npm.cmd run dev
pause
