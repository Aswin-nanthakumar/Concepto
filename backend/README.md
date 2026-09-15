# LOE Backend (FastAPI)

## Run locally
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

## Notes
- Without `GEMINI_API_KEY`, the API still works via the built-in rule-based
  fallback engine (`engine: "fallback"` in results) — ideal for demos.
- SQLite database file `loe.db` is created automatically.
- Deploy to Render with `render.yaml` (Blueprint) or the Dockerfile.
