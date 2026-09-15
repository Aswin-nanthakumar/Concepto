# Learning Objective Extractor

> Turn any lesson, chapter, syllabus, or transcript into **measurable learning objectives** —
> Bloom-classified, confidence-scored, with skills, concepts, assessments, and gap analysis.

**Stack**: React · Vite · Tailwind · FastAPI · Gemini 2.5 Flash · Vercel + Render

## ✨ What it does

Upload educational content (PDF / DOCX / TXT / paste) → a 7-step AI pipeline produces:

- 📌 Measurable objectives (every one starts with a Bloom verb)
- 🔺 Bloom's taxonomy classification + distribution analytics
- 🧠 Skills acquired + key concepts + relationships
- 📝 Assessments: MCQs, short answers, practical tasks, projects
- 🎯 Gap analysis: missing foundations, Bloom imbalance, weak coverage
- 📊 Confidence scores + coverage metrics
- 📦 Exports: JSON / CSV / Markdown / PDF (matching displayed data)

**11 fully functional pages**: Landing · Dashboard · Upload · Extraction · Bloom · Concepts · Assessments · Analytics · Export · History · Settings.

## 🚀 Quick start (local)

**Backend** (http://localhost:8000):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # add GEMINI_API_KEY (optional — offline engine works without it)
uvicorn app.main:app --reload --port 8000
```

**Frontend** (http://localhost:5173):
```bash
cd frontend
npm install
cp .env.example .env          # leave VITE_API_URL empty for local (uses Vite proxy)
npm run dev
```

Open http://localhost:5173 → **Try it free** → click a sample → **Extract learning objectives**.

## ☁️ Deploy

**Backend → Render** (pick one):
- Blueprint: push repo → Render Dashboard → *New +* → *Blueprint* → select repo (uses `backend/render.yaml`) → set `GEMINI_API_KEY`.
- Manual: *New Web Service* → root `backend` → build `pip install -r requirements.txt` → start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

**Frontend → Vercel**:
- Import repo → root `frontend` → framework Vite → env `VITE_API_URL=https://<your-render-app>.onrender.com` → Deploy.

## 🔑 Environment variables

| where | var | required | notes |
|---|---|---|---|
| backend | `GEMINI_API_KEY` | No* | [Google AI Studio](https://aistudio.google.com/apikey). *Without it, the offline engine still returns full results (`engine: "fallback"`). |
| backend | `GEMINI_MODEL` | No | default `gemini-2.5-flash` |
| backend | `CORS_ORIGINS` | No | default `*`; set your Vercel URL in prod |
| frontend | `VITE_API_URL` | Prod only | Render backend URL; empty = same-origin/proxy |

## 📚 Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, DB schema, API table, pipeline, state, security
- [`docs/SRS.md`](docs/SRS.md) — requirements + acceptance criteria
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — 5-minute judged-demo script
- [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md) — release review + manual test script

## 🛡️ Notes

- Secrets live only in backend env — the frontend never sees API keys.
- AI output is validated JSON only; malformed responses are repaired or fall back gracefully.
- SQLite persists history; on Render attach the 1 GB disk from `render.yaml`.
