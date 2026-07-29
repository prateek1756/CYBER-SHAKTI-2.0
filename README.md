# CyberShakti 2.0 🛡️

**AI-powered cybersecurity platform for India** — detects deepfakes, phishing URLs, scam messages, suspicious calls, and financial fraud (money-mule networks) using a full-stack TypeScript + Python ML architecture.

---

## Architecture

```
CyberShakti/
├── client/          React + Vite + TailwindCSS frontend
├── server/          Express.js + TypeScript API gateway
├── python/          Flask microservice with ML models
├── database/        MySQL schema + stored procedures
└── data/            Training data (git-ignored, local only)
```

**Data flow:**
```
Browser → Express (port 8080) → Flask AI server (port 5001)
                             ↘ MySQL (port 3306)
```

The Express server acts as a proxy/gateway. If the Flask microservice is unavailable, all endpoints automatically fall back to built-in JS heuristics so the app remains functional.

---

## Features

| Module | Detection Method |
|---|---|
| **Phishing URL Scanner** | ML pipeline (TF-IDF + Logistic Regression) |
| **Scam Message Detector** | ML pipeline (TF-IDF + Naive Bayes) |
| **Scam Call Analyser** | Random Forest on call metadata |
| **Deepfake Detector** | TensorFlow CNN (`deepfake_model.h5`) |
| **Mule Account Scanner** | Graph forensics (NetworkX — smurfing, cycles, shell chains) |
| **Scam Map** | Geo-tagged community scam reports (MySQL / in-memory) |

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 20 LTS | |
| pnpm | 8+ | `npm i -g pnpm` |
| Python | 3.11 | **3.11 required** — mediapipe has no wheels for 3.12+ |
| MySQL | 8.0 | Optional — app runs without it |

---

## Quick Start

### 1. Clone & install JS dependencies

```bash
git clone https://github.com/prateek1756/CYBER-SHAKTI-2.0.git
cd CYBER-SHAKTI-2.0
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB credentials
```

### 3. Set up Python virtual environment

```bash
cd python
python3.11 -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Train or restore ML models

ML model files (`*.pkl`, `*.h5`) are git-ignored. Either:

**Option A — Train from scratch** (requires `data/` CSVs):
```bash
cd python
python train_models.py
```

**Option B — Copy pre-trained model files** into `python/`:
- `deepfake_model.h5`
- `phishing_model.pkl`
- `message_classifier.pkl`
- `call_classifier.pkl`

> If models are absent the server starts in **heuristic fallback mode** — all endpoints remain functional with rule-based scoring.

### 5. Start the dev server

```bash
# From repo root — starts Express + React simultaneously
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Flask AI: http://localhost:5001 (auto-started by backend)

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Express server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | — | MySQL username |
| `DB_PASSWORD` | — | MySQL password |
| `DB_NAME` | `cybershakti` | Database name (auto-created) |
| `FLASK_HOST` | `127.0.0.1` | Flask server host |
| `FLASK_PORT` | `5001` | Flask server port |
| `FLASK_HEALTH_MAX_RETRIES` | `20` | Health-check retry limit |
| `FLASK_HEALTH_INTERVAL` | `500` | Health-check poll interval (ms) |

---

## API Reference

### Health
```
GET /api/health           → Express liveness check
GET /health               → Flask liveness check (internal)
```

### Scanner
```
POST /api/scanner/phishing  body: { url }
POST /api/scanner/message   body: { message }
POST /api/scanner/call      body: { phoneNumber, duration, frequency, spamReports, carrierRep, isIntl }
```

### Deepfake
```
POST /api/deepfake/detect   multipart: file (image/video)
GET  /api/deepfake/stats    → model load status
```

### Mule Scanner
```
POST /api/mule/upload           multipart: file (.csv) → SSE stream
POST /api/mule/generate-demo    → SSE stream (synthetic data)
POST /api/mule/ai-analyze/:id   → behavioral forensic report
```

### Scam Reports
```
GET  /api/scams              → all verified reports (or ?lat=&lng=&radius=)
POST /api/scams              body: { title, description, latitude, longitude }
```

---

## Database

MySQL is optional. On first connection the server auto-creates the `cybershakti` database and runs `database/schema.sql`. If MySQL is unreachable the app operates on in-memory mock data.

---

## Project Scripts

```bash
pnpm dev          # Start both client + server in watch mode
pnpm build        # Build server (tsc) + client (vite)
pnpm start        # Run compiled server
pnpm typecheck    # TypeScript type-check (no emit)
```

---

## Tech Stack

**Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Leaflet, vis-network  
**Backend:** Node.js, Express, TypeScript, mysql2  
**AI Microservice:** Python 3.11, Flask, TensorFlow 2.21, scikit-learn 1.9, MediaPipe, NetworkX, pandas  
**Database:** MySQL 8

---

## Security Notes

- `.env` is git-ignored — never commit credentials
- ML model binaries are git-ignored — they contain training data weights
- Training CSVs in `data/` are git-ignored
- The Flask server binds to `127.0.0.1` by default (not publicly reachable)

---

## License

This project is for educational and research purposes.
