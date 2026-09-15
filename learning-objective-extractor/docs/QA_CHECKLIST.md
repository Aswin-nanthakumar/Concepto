# QA Checklist — pre-release review (all passing)

## Architecture
- [x] Single `AnalysisResult` contract shared by API, UI, and all 4 exporters
- [x] Routers thin; logic in services; prompts isolated in `prompts.py`
- [x] No circular imports; startup creates DB tables automatically

## UI consistency
- [x] Bloom colors identical in constants.js, tailwind.config, charts, badges
- [x] 8px spacing; shared `.card/.btn/.input` classes; one empty/loading/error pattern
- [x] Responsive: sidebar→drawer, grids collapse, tables scroll horizontally

## API
- [x] Every frontend call maps to an implemented endpoint (upload/text/analyze/results/history/delete/export/dashboard/health)
- [x] Correct status codes: 400 validation, 404 missing, 409 not-ready, 500 wrapped
- [x] Exports use right MIME + filename headers

## Error handling
- [x] Empty/corrupt/oversize/unsupported files → friendly 400s
- [x] AI failure → retry → fallback engine (never a dead end)
- [x] Backend unreachable → UI banner + toast guidance
- [x] Malformed AI JSON → fence-strip + repair + normalize + validate

## Deployment
- [x] `render.yaml` Blueprint + Dockerfile for backend; `vercel.json` SPA rewrites
- [x] `.env.example` files; no secrets in repo; CORS configurable
- [x] SQLite auto-creates; Render disk mount for persistence

## Manual test script
1. `cd backend && pip install -r requirements.txt && uvicorn app.main:app` → /docs loads
2. `cd frontend && npm install && npm run dev` → landing renders
3. Paste sample text → preview shows → Analyze → extraction page populates
4. Visit all 11 pages — no dead links, counts consistent
5. Export JSON + PDF — contents match screen
6. Stop backend → UI shows friendly errors; restart → history persists
