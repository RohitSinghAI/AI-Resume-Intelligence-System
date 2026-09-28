FROM python:3.12-slim

WORKDIR /app

# System packages required for Python/PDF dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend project
COPY . .

# Ensure upload directory exists
RUN mkdir -p app/uploads

EXPOSE 10000

# Render provides PORT; use 10000 as fallback
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]