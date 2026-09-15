# Software Requirements Specification — Learning Objective Extractor v1.0

## 1. Introduction
**Purpose**: transform unstructured educational content into structured learning outcomes (objectives, Bloom classification, skills, concepts, assessments, gaps, confidence scores).
**Users**: teachers, curriculum designers, students, institutions, EdTech companies, corporate L&D.
**Platform**: web app — React SPA (Vercel) + FastAPI API (Render) + Gemini 2.5 Flash.

## 2. Functional requirements

### FR-1 Document input
- FR-1.1 Accept PDF, DOCX, TXT uploads (≤ 15 MB) via drag-drop or file picker.
- FR-1.2 Accept manual text paste (≥ 50 chars, ≤ 120k chars).
- FR-1.3 Show file preview (first 600 chars), word count, char count, reading time, detected content type.
- FR-1.4 Reject empty files, corrupt PDFs/DOCX, unsupported formats with friendly errors.

### FR-2 AI processing pipeline
- FR-2.1 Detect content type: chapter, lesson, syllabus, course, transcript.
- FR-2.2 Extract concepts, skills, topics.
- FR-2.3 Generate 6–40 measurable objectives, each starting with a Bloom-compatible verb.
- FR-2.4 Classify each objective into exactly one Bloom level.
- FR-2.5 Generate assessments: MCQs (4 options + answer + explanation), short answers, practical tasks, projects.
- FR-2.6 Detect gaps: missing foundations, Bloom imbalance, weak coverage (severity + recommendation).
- FR-2.7 Compute per-objective confidence (0–1), avg confidence, coverage score (0–100).

### FR-3 Results & pages (all 11 functional)
- FR-3.1 Landing page: hero, features, 3-step flow, Bloom colors, personas, CTAs.
- FR-3.2 Dashboard: KPIs, Bloom donut+bars, coverage gauge, quick actions, recent list.
- FR-3.3 Upload: file/text tabs, samples, preview panel, animated 7-step pipeline progress.
- FR-3.4 Extraction: overview stats, summary, search + Bloom + kind filters, objectives grouped by Bloom with badges/confidence/copy.
- FR-3.5 Bloom analysis: donut, bars, per-level cards, higher-order ratio, auto insights.
- FR-3.6 Concepts: concept cards (importance, linked objectives) + skill list + skill×Bloom heatmap.
- FR-3.7 Assessments: tabbed MCQs (interactive quiz), short answers, tasks, projects; answer toggle; copy buttons.
- FR-3.8 Analytics: KPIs, confidence histogram, Bloom balance, heatmap, gap cards with recommendations.
- FR-3.9 Export: JSON/CSV/MD/PDF download + text preview; exports match displayed data.
- FR-3.10 History: searchable table (type, status, objectives, coverage, confidence, date), open/delete.
- FR-3.11 Settings: max objectives, difficulty, assessment/gap toggles, backend health check, workspace reset.

### FR-4 Exports
- FR-4.1 All formats generated server-side from the same `AnalysisResult`.
- FR-4.2 Correct MIME types + `Content-Disposition` filenames.

## 3. Non-functional requirements
- **NFR-1 Performance**: Lighthouse > 90; lazy routes; cached queries; p95 page render < 2s (excluding AI wait).
- **NFR-2 Reliability**: AI retry ×3 + model fallback + offline engine — analysis never hard-fails on AI outage.
- **NFR-3 Usability**: responsive (mobile/tablet/desktop), 8px spacing, consistent Bloom colors, empty/loading/error states everywhere.
- **NFR-4 Security**: no secrets in frontend; validated uploads; sanitized inputs; CORS-configured; safe error messages.
- **NFR-5 Portability**: one-click Render Blueprint + Vercel import; local dev via uvicorn + Vite proxy.
- **NFR-6 Maintainability**: typed API contract (Pydantic), single export source of truth, documented prompts.

## 4. Data & constraints
- SQLite persistence (jobs table); JSON result documents; no PII collected; uploads processed in-memory then stored as text.
- AI output constrained to validated JSON; confidence ∈ [0,1]; coverage ∈ [0,100].

## 5. Acceptance criteria
1. Upload PDF/DOCX/TXT/paste → preview + stats shown.
2. Analyze → 11 pages populate consistently (same counts everywhere).
3. Exports download and match on-screen data.
4. Works with and without `GEMINI_API_KEY` (engine flag visible).
5. All error paths (empty/corrupt/oversize/offline) show friendly messages.
6. Mobile responsive with no overflow/overlap.
7. Deploys cleanly to Vercel (frontend) + Render (backend).
