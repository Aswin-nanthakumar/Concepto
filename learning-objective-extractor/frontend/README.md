# LOE Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend in production
npm run dev            # http://localhost:5173
```

Deploy to Vercel: import this folder, set `VITE_API_URL` to the Render
backend URL, deploy. SPA rewrites are handled by `vercel.json`.
