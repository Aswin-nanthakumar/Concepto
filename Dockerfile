FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code: ai and backend modules
COPY ai ./ai
COPY backend/app ./backend/app
COPY backend/main.py ./backend/main.py
COPY main.py .

ENV PYTHONPATH="/app:/app/backend"
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
