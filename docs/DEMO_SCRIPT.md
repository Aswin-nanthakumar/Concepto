# Demo Script — Learning Objective Extractor (5 minutes)

> Goal: prove the full loop — upload → AI analysis → outcomes → assessments → export — live, in under 5 minutes.

## 0:00–0:30 — Hook (Landing page)
- "Teachers spend hours writing learning objectives. Watch this chapter become a full curriculum plan in 30 seconds."
- Scroll hero → point at Bloom color strip and 3-step flow.

## 0:30–1:15 — Upload (Upload Content)
- Click **Try it free** → **Upload Content**.
- Option A (safe): click sample **"Biology: Photosynthesis"** — instant, no file needed.
- Option B (impressive): drag a real PDF syllabus.
- Narrate: "Instant preview, word count, reading time — and it detected this is a *chapter*."

## 1:15–2:00 — Analyze (the magic moment)
- Click **Extract learning objectives**.
- Narrate the 7 animated pipeline steps as they tick: parsing → type detection → concepts → objectives → Bloom → assessments → gaps.
- "One Gemini 2.5 Flash call with structured JSON — validated, retried, never raw."

## 2:00–3:00 — Results (Objective Extraction)
- Land on grouped objectives. "Every objective starts with a measurable Bloom verb."
- Demo: search "energy", toggle Bloom badges, flip Explicit/Implicit.
- Hover an objective → copy button. Point at confidence pills and coverage score.

## 3:00–3:45 — Depth (Bloom + Analytics)
- **Bloom Analysis**: donut + per-level cards. "It tells us higher-order thinking is only 18% — that's actionable."
- **Analytics**: coverage gauge, confidence histogram, gap cards. Read one recommendation aloud.

## 3:45–4:30 — Assessments + Concepts
- **Assessments → MCQs**: click an answer live (quiz mode), toggle Hide answers.
- **Concept Explorer → Skills**: show the skill×Bloom heatmap.

## 4:30–5:00 — Export + close
- **Export Center**: preview Markdown, download PDF. Open it — "byte-matched to what you saw."
- Close: "Eleven pages, one pipeline, deployed on Vercel + Render — and it even works offline via the fallback engine. Questions?"

## Backup plans
- Backend cold start (Render free tier sleeps): hit the health endpoint 1 min before demo; the UI shows clear retry messaging.
- No network / no API key: the offline engine still produces a full result (flagged as "Offline") — the demo never breaks.
- Tough questions: "Prompts are structured-JSON with validation + repair — see `backend/app/utils/prompts.py` and `ai_service.py`."
