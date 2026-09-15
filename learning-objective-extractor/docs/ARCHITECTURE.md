# System Architecture — Learning Objective Extractor

## 1. High-level overview

```
┌─────────────┐   HTTPS/JSON   ┌──────────────────┐   JSON mode   ┌─────────────────┐
│  React SPA  │ ◄────────────► │  FastAPI backend │ ◄───────────► │ Gemini 2.5 Flash│
│  (Vercel)   │   multipart    │  (Render)        │   + fallback  │  (Google AI)    │
└─────────────┘                └────────┬─────────┘               └─────────────────┘
                                        │ SQLAlchemy
                                        ▼
                               ┌──────────────────┐
                               │ SQLite (loe.db)  │  jobs + results
                               └──────────────────┘
```

- **Frontend**: React 18 + Vite + Tailwind + React Router + TanStack Query + Framer Motion. Fully static, deployed to Vercel.
- **Backend**: FastAPI + Pydantic v2 + SQLAlchemy (SQLite). Deployed to Render via Blueprint (`render.yaml`) or Dockerfile.
- **AI**: Gemini 2.5 Flash with structured JSON output, 3-attempt retry, JSON repair, and a deterministic **rule-based fallback engine** so the product works with no API key (demo-safe).

## 2. Folder structure

```
learning-objective-extractor/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, error handler
│   │   ├── config.py               # pydantic-settings (env only, no secrets in code)
│   │   ├── database.py             # SQLite engine + session
│   │   ├── models.py               # Job table
│   │   ├── schemas.py              # API contract (Pydantic)
│   │   ├── routers/
│   │   │   ├── upload.py           # POST /api/upload, /api/upload-text
│   │   │   ├── analyze.py          # POST /api/analyze, GET results/history/export/dashboard
│   │   │   └── health.py           # /health, /api/health
│   │   ├── services/
│   │   │   ├── document_service.py # PDF/DOCX/TXT parsing + type detection
│   │   │   ├── ai_service.py       # Gemini client, retry, validation
│   │   │   ├── fallback_engine.py  # offline rule-based analysis
│   │   │   ├── analysis_service.py # 7-step pipeline orchestrator
│   │   │   └── export_service.py   # JSON/CSV/MD/PDF from one AnalysisResult
│   │   └── utils/
│   │       ├── prompts.py          # system prompt + Bloom verbs + type keywords
│   │       ├── validators.py       # file/text validation + sanitization
│   │       └── helpers.py          # JSON repair, stats, coverage formula
│   ├── requirements.txt  Dockerfile  render.yaml  .env.example
└── frontend/
    ├── src/
    │   ├── main.jsx  App.jsx (lazy routes)  index.css (design system)
    │   ├── lib/        api.js · constants.js · utils.js
    │   ├── context/    AppContext.jsx (upload/result/settings/toasts)
    │   ├── hooks/      useAnalysis.js (TanStack Query)
    │   ├── components/
    │   │   ├── ui/Bits.jsx        # shadcn-style Button/Card/Badge/Progress/…
    │   │   ├── layout/Shell.jsx   # sidebar + topbar + page transitions
    │   │   └── charts/Charts.jsx  # SVG donut, bars, heatmap, histogram, gauge
    │   └── pages/      11 pages (Landing + 10 app pages)
    ├── vercel.json  .env.example  package.json  vite/tailwind configs
└── docs/  ARCHITECTURE.md · SRS.md · DEMO_SCRIPT.md · QA_CHECKLIST.md
```

## 3. Database design (SQLite)

**Table `jobs`** — one row per upload/analysis:

| column | type | notes |
|---|---|---|
| id | string(16) PK | 12-hex job id |
| filename / source_type | string | original name, pdf\|docx\|txt\|text |
| content_type | string | chapter\|lesson\|syllabus\|course\|transcript |
| status | string | uploaded\|processing\|completed\|failed |
| word_count / char_count / reading_minutes | int/int/float | computed at upload |
| title / preview / content_text | string/text/text | sanitized, capped |
| result_json | text | serialized `AnalysisResult` (single source of truth for exports) |
| coverage_score / avg_confidence / objective_count | float/float/int | denormalized for dashboards |
| error | text | user-safe failure message |
| created_at / updated_at | datetime | history ordering |

Why JSON-in-SQLite: the analysis payload is a document, read/written atomically, and exports must byte-match displayed data — one serialized `AnalysisResult` guarantees that.

## 4. API design

| method & path | body | returns |
|---|---|---|
| POST `/api/upload` | multipart `file` | `UploadResponse` (job_id, preview, stats, type) |
| POST `/api/upload-text` | `{text, filename?, title?}` | `UploadResponse` |
| POST `/api/analyze/{job_id}` | `AnalyzeOptions?` | `AnalysisResult` (full payload) |
| GET `/api/results/{job_id}` | — | `AnalysisResult` or 409 if not ready |
| GET `/api/history?limit=` | — | `HistoryItem[]` |
| DELETE `/api/history/{job_id}` | — | `{ok, deleted}` |
| GET `/api/export/{job_id}?format=` | — | file (json\|csv\|md\|pdf) |
| GET `/api/dashboard-stats` | — | aggregate KPIs + bloom totals + recent |
| GET `/health`, `/api/health` | — | status + `ai_configured` flag |

Error contract: `{detail: <user-friendly message>, code?}` with correct HTTP codes (400 validation, 404 missing, 409 not-ready, 500 failure).

## 5. AI pipeline (7 steps, one Gemini call)

1. **Parse** — PyMuPDF / python-docx / text decoder → sanitized text.
2. **Detect** — keyword scoring → chapter/lesson/syllabus/course/transcript.
3. **Concepts** — Gemini extracts concepts/skills/topics (JSON).
4. **Objectives** — measurable objectives, each starting with a Bloom verb (JSON).
5. **Bloom classify** — exactly one of six levels per objective (JSON).
6. **Assessments** — 5 MCQs + 4 short answers + 3 tasks + 2 projects (JSON).
7. **Gaps** — foundation / bloom_imbalance / coverage findings (JSON).

Post-processing (server-side, always runs): attach stable IDs, link concepts↔objectives, compute `bloom_distribution`, `avg_confidence`, `coverage_score = breadth·0.45 + volume·0.25 + balance·0.30`.

**Resilience**: retry ×3 with model fallback (2.5-flash → 2.0-flash) → JSON repair (fence strip, outer-object slice, trailing-comma fix) → Pydantic validation/normalization → rule-based fallback engine. Raw AI text is never exposed.

## 6. State management

- **Server state**: TanStack Query (`history`, `dashboard`, `result:{id}`) with 10–60s stale times.
- **Client state**: `AppContext` — current `upload`, current `result`, `analyzing`, `settings` (persisted to localStorage), `lastJobId` (rehydrates result on reload), toasts.
- **Detail pages** use `useResultLoader()`: prefer context, else fetch `lastJobId` — so refresh/share-safe within session.

## 7. Security

- Secrets only via env (`GEMINI_API_KEY` server-side; frontend has only `VITE_API_URL`).
- File validation: extension allowlist, 15 MB cap, empty/corrupt detection with friendly errors.
- Input sanitization: control-char strip, whitespace collapse, 120k char cap.
- CORS configurable via `CORS_ORIGINS`; global exception handler hides internals.

## 8. Performance

- Route-level code splitting + manual vendor chunks; SVG charts (zero chart deps); TanStack Query caching; SQLite indexed reads; single AI call per analysis. Target Lighthouse > 90.
