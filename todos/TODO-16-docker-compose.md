# TODO-16 — Add docker-compose.yml for Easy Setup

- **Priority:** 🟢 Low
- **Status:** [ ] Not Started
- **New File:** `docker-compose.yml`
- **New Files:** `Dockerfile.server`, `Dockerfile.flask`

---

## Problem

Setup requires Node 20, pnpm 8, Python 3.11 (specifically — not 3.12+),
a virtual environment, and optional Supabase credentials.
This is a high barrier for new contributors.
A `docker-compose.yml` would reduce onboarding to a single command: `docker compose up`.

---

## Steps to Fix

- [ ] Create `Dockerfile.server` for the Express + React build
- [ ] Create `Dockerfile.flask` for the Python 3.11 Flask microservice
- [ ] Create `docker-compose.yml` wiring both services together
- [ ] Add `.dockerignore` to exclude `node_modules`, `venv`, `*.pkl`, `*.h5`, `data/`
- [ ] Document the Docker setup in `README.md`

---

## Code to Write

**`Dockerfile.flask`:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY python/ .
EXPOSE 5001
CMD ["python", "api_server.py"]
```

**`Dockerfile.server`:**
```dockerfile
FROM node:20-slim
RUN npm i -g pnpm
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

**`docker-compose.yml`:**
```yaml
version: '3.9'
services:
  flask:
    build:
      context: .
      dockerfile: Dockerfile.flask
    environment:
      FLASK_HOST: 0.0.0.0
      FLASK_PORT: 5001
    ports:
      - "5001:5001"

  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    environment:
      PORT: 8080
      FLASK_HOST: flask
      FLASK_PORT: 5001
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
    ports:
      - "8080:8080"
    depends_on:
      - flask
```

---

## Done When

- [ ] `docker compose up` starts both services with no manual steps
- [ ] Frontend is accessible at `http://localhost:8080`
- [ ] Flask is reachable from the Express container via service name `flask`
- [ ] README has a "Docker Setup" section with the one-liner command
