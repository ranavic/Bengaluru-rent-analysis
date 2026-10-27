@echo off
echo Starting Bengaluru Rental Intelligence...

:: Start Backend in a new window
start "Backend (FastAPI)" cmd /k "cd backend && ..\venv\Scripts\python.exe -m uvicorn main:app --reload"

:: Start Frontend in a new window
start "Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo Both Backend (http://localhost:8000) and Frontend (http://localhost:5173) are launching!
