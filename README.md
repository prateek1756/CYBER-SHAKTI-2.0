# CyberShakti 2.0 🛡️

**AI-powered national cybersecurity & fraud defense platform for India** — detects deepfakes, phishing URLs, scam messages, suspicious calls, and financial fraud (money-mule networks) using a full-stack TypeScript + Python ML architecture.

---

## Architecture

```
CyberShakti/
├── client/          React + Vite + TailwindCSS frontend
├── server/          Express.js + TypeScript API gateway
├── python/          Flask microservice with ML models (MobileNetV2, MediaPipe, TF-IDF, RF)
├── database/        Supabase SQL migration & local JSON fallback
├── openapi.yaml     OpenAPI 3.0 API Specification
├── docker-compose.yml Docker multi-container setup
└── data/            Training data & local fallback database (git-ignored)
```

**Data flow:**
```
Browser → Express (port 8080) → Flask AI server (port 5001)
                             ↘ Supabase / Local JSON Store
```

The Express server acts as an API gateway and proxy. If the Flask microservice is unavailable, all endpoints automatically fall back to built-in JS heuristics so the platform remains fully functional.

---

## Features

| Module | Detection Method | Output Metrics |
|---|---|---|
| **Phishing URL Scanner** | TF-IDF char n-grams + Logistic Regression | Risk Score, Category, Structural Reasons |
| **Scam Message Detector** | TF-IDF NLP + Naive Bayes (UCI SMS dataset trained) | Fraud Flag, Urgency & Keyword Weights |
| **Scam Call Analyser** | Random Forest on metadata + Call Hour analysis | Risk Score, Autodialer / Spoofing Flags |
| **Deepfake Detector** | MediaPipe Face ROI Crop + MobileNetV2 CNN | Face Bounding Box, Confidence Score, Method |
| **Mule Account Scanner** | Graph forensics (NetworkX — PageRank, Smurfing, Cycles) | Topology Risk Score, Suspicious Nodes, Graph Stream |
| **Scam Map** | Geo-tagged community scam reports (Supabase + Local JSON) | Proximity Distance, Status ('pending' review default) |

---

## Quick Start with Docker 🐳

The easiest way to run CyberShakti 2.0 with all dependencies pre-configured:

```bash
# Clone repository
git clone https://github.com/prateek1756/CYBER-SHAKTI-2.0.git
cd CYBER-SHAKTI-2.0

# Start both Express Gateway and Flask AI Server in Docker
docker compose up --build
```

- **Frontend / Express Gateway:** http://localhost:8080
- **Flask AI Microservice:** http://localhost:5001

---

## Manual Setup

### 1. Prerequisites
- Node.js 20 LTS
- pnpm (`npm i -g pnpm`)
- Python 3.10 or 3.11 (MediaPipe & TensorFlow compatible)

### 2. Install Dependencies

```bash
pnpm install
```

Set up Python virtual environment:
```bash
cd python
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Setup

```bash
cp .env.example .env
```

### 4. Train ML Models

```bash
cd python
python train_models.py
```
> If missing `data/sms_spam.csv`, the script will automatically download the UCI SMS dataset. Deepfake training will use dataset in `data/deepfake/` or generate a synthetic baseline if real images are not provided.

### 5. Run Development Servers

```bash
# From repository root — starts Express gateway + Vite client concurrently
pnpm dev
```

- Frontend: http://localhost:5173
- Express API Gateway: http://localhost:8080
- Flask AI Server: http://localhost:5001 (auto-spawned by Express gateway)

---

## OpenAPI Specification 📄

The complete API specification is available in [`openapi.yaml`](file:///c:/projects/CyberShakti/openapi.yaml).

---

## Internal Flask AI Microservice Documentation 🐍

The Python Flask microservice handles machine learning inference:

| Route | Method | Payload / Request | Internal Function |
|---|---|---|---|
| `/api/deepfake/detect` | `POST` | `multipart/form-data` (`file`) | MediaPipe face crop + MobileNetV2 inference |
| `/api/phishing/detect` | `POST` | JSON `{ "url": "..." }` | TF-IDF char n-grams + Logistic Regression |
| `/api/message/detect` | `POST` | JSON `{ "message": "..." }` | TF-IDF + MultinomialNB classifier |
| `/api/call/detect` | `POST` | JSON `{ "call_duration", "call_frequency", "call_hour", "spam_reports", "carrier_reputation", "is_international" }` | Random Forest metadata classification |
| `/api/mule/upload` | `POST` | `multipart/form-data` (`file`) | NetworkX PageRank & smurfing cycle detection |
| `/health` | `GET` | — | Returns `{"status": "ok"}` |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Express server port |
| `ALLOWED_ORIGIN` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |
| `SUPABASE_URL` | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | — | Supabase anon key |
| `FLASK_HOST` | `127.0.0.1` | Flask server host |
| `FLASK_PORT` | `5001` | Flask server port |

---

## License

CyberShakti 2.0 is developed for national cybersecurity research and awareness.
