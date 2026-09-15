# Deployment Guide for Concepto (Learning Objective Extractor)

This project consists of:
- **Backend**: FastAPI (Python 3.11+) with Uvicorn, SQLite/PostgreSQL, and Google Gemini AI.
- **Frontend**: React + Vite + Tailwind CSS SPA.

Both services can be deployed either together via Docker or separately (Render for Backend + Vercel for Frontend).

---

## Option A: Recommended Deployment (Render + Vercel)

### Step 1: Deploy the Backend on Render

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`Concepto`).
4. Configure the settings:
   - **Name**: `concepto-backend` (or your choice)
   - **Root Directory**: `learning-objective-extractor/backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio key from https://aistudio.google.com/apikey)*
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `CORS_ORIGINS`: `*` *(or your Vercel URL once deployed)*
   - `ENV`: `production`
6. *(Optional)* Add a Persistent Disk under **Disks**:
   - **Name**: `loe-data`
   - **Mount Path**: `/opt/render/project/src/learning-objective-extractor/backend/storage`
   - **Size**: `1 GB`
7. Click **Create Web Service**.
8. Once deployed, copy your backend URL (e.g., `https://concepto-backend.onrender.com`).

---

### Step 2: Deploy the Frontend on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project** and import the `Concepto` repository.
3. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `learning-objective-extractor/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-backend-name>.onrender.com` *(Use the Render URL from Step 1, without trailing slash)*
5. Click **Deploy**.

---

## Option B: Deploy with Render Blueprint (`render.yaml`)

Both backend service and persistent disk are configured in [`render.yaml`](render.yaml):

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Blueprint**.
2. Select your repository.
3. Render will detect `render.yaml` and set up the service, build commands, and storage disk automatically.
4. Set the `GEMINI_API_KEY` secret when prompted.
5. Click **Apply**.

---

## Option C: Container / Docker Deployment

Dockerfiles are provided at:
- Root: [`Dockerfile`](Dockerfile)
- Backend: [`learning-objective-extractor/backend/Dockerfile`](learning-objective-extractor/backend/Dockerfile)

To build and run locally or on any container platform (Railway, Fly.io, Cloud Run):

```bash
# Build container from repository root
docker build -t concepto-backend .

# Run container
docker run -p 8000:8000 -e GEMINI_API_KEY="your_api_key_here" concepto-backend
```

---

## Environment Variables Reference

### Backend
| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key. If omitted, built-in offline engine runs. |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `CORS_ORIGINS` | No | Comma-separated list of allowed origins or `*` (Default: `*`) |
| `DATABASE_URL` | No | SQLite (`sqlite:///./loe.db`) or PostgreSQL (`postgresql://...`) |
| `PORT` | Auto | Injected automatically by Render / Cloud hosts (default: `8000`) |

### Frontend
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Production | URL of your deployed backend (e.g. `https://concepto-backend.onrender.com`). If blank locally, uses Vite dev proxy. |

---

## Verification & Health Check

After deployment:
1. **Backend Health**: Visit `https://<your-backend>.onrender.com/health` (should return `{"status": "ok", ...}`)
2. **Interactive Docs**: Visit `https://<your-backend>.onrender.com/docs` (Swagger UI)
3. **Frontend**: Open your Vercel URL, navigate to **Settings**, and confirm the Backend Status indicator shows **Connected**.
