# CyberShakti 2.0 — Improvements & Fixes Tracker

All issues found during codebase analysis. Ordered by priority.
Each item includes the exact file, the problem, and what the fix should be.

---

## 🔴 CRITICAL — Fix These First

---

### 1. Deepfake Detection Uses Random Numbers, Not the ML Model

**File:** `python/api_server.py` → `/api/deepfake/detect` route

**Problem:**
The trained `deepfake_model.h5` is loaded but never used for inference.
Detection is based on a pseudo-random seed derived from the file's byte sum.
This means every file gets a random score — it is not AI detection at all.

```python
# CURRENT (WRONG) — random number disguised as ML
file_sum = sum(file_bytes)
random.seed(file_sum)
score = float(random.uniform(0.05, 0.95))
```

**Fix:**
Use the loaded TensorFlow model to actually run inference on the image.
Preprocess the image to 224×224, normalize to [0,1], run `model.predict()`.

```python
# CORRECT
from PIL import Image
import numpy as np
import io

img = Image.open(io.BytesIO(file_bytes)).convert('RGB').resize((224, 224))
arr = np.expand_dims(np.array(img) / 255.0, axis=0).astype(np.float32)
score = float(trained_model.predict(arr, verbose=0)[0][0])
```

Also fix the Express fallback in `server/src/routes/deepfake.ts` which uses
`filename.length + file.size` as a score — equally meaningless.

---

### 2. Deepfake Model Trained on Pure Noise (Meaningless Weights)

**File:** `python/train_models.py` → Section 1 (Deepfake)

**Problem:**
The model trains on `np.random.rand()` pixel arrays — random noise images.
MobileNetV2 fine-tuned on noise cannot learn any real deepfake features.
The saved `deepfake_model.h5` has weights that are statistically useless.

```python
# CURRENT (WRONG) — training on random noise
X[i] = np.random.rand(img_height, img_width, 3)
```

**Fix:**
Train on a real dataset. Recommended options:
- **FaceForensics++** (academic, requires request): https://github.com/ondyari/FaceForensics
- **Celeb-DF**: https://github.com/yuezunli/celeb-deepfakeforensics
- **DFDC Preview Dataset** (Meta): https://ai.meta.com/datasets/dfdc/

Minimum viable approach until real data is available:
Use MediaPipe face detection first, then run the model only on the cropped
face region. At least the pipeline will be architecturally correct even if
accuracy is limited.

---

### 3. Message Classifier Trained on Only 16 Samples

**File:** `python/train_models.py` → Section 3 (Fraud Message Classifier)

**Problem:**
The training data is 20 hardcoded strings. With 80/20 split that is
16 training samples for a production fraud classifier.
The model will memorize these exact strings and fail on any real variation.

```python
# CURRENT (WRONG) — 20 hardcoded samples
data_msg = {
    'text': [ ...20 items... ],
    'label': [0,0,0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,1,1]
}
```

**Fix:**
Use the UCI SMS Spam Collection dataset (5,574 real SMS messages, free):
```
https://archive.ics.uci.edu/dataset/228/sms+spam+collection
```
Place it at `data/sms_spam.csv` and load it the same way phishing data is loaded.
This alone will make the message classifier actually functional.

---

### 4. Flask Server Binds to 0.0.0.0 (Publicly Exposed)

**File:** `python/api_server.py` → last line

**Problem:**
README states Flask binds to `127.0.0.1` by default (internal only).
The actual code binds to `0.0.0.0` — publicly reachable on all interfaces.
Flask has no authentication, so anyone who can reach the port can call all endpoints.

```python
# CURRENT (WRONG)
app.run(host='0.0.0.0', port=PORT)
```

**Fix:**
```python
# CORRECT — read host from env, default to 127.0.0.1
HOST = os.environ.get('FLASK_HOST', '127.0.0.1')
app.run(host=HOST, port=PORT)
```

---

### 5. No File Size Limit on Uploads

**File:** `server/src/routes/deepfake.ts` and `server/src/routes/mule.ts`

**Problem:**
`multer` is configured with `memoryStorage()` and no size limit.
A user can upload a multi-GB file and crash the Node.js process by exhausting RAM.

```typescript
// CURRENT (WRONG) — no limits
const upload = multer({ storage: multer.memoryStorage() });
```

**Fix:**
```typescript
// CORRECT
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB cap
});
```

For the mule CSV route, also validate the file extension:
```typescript
fileFilter: (_req, file, cb) => {
  cb(null, file.mimetype === 'text/csv' || file.originalname.endsWith('.csv'));
}
```

---

## 🟠 HIGH — Fix Before Any Public Deployment

---

### 6. CORS Allows All Origins

**File:** `server/src/index.ts`

**Problem:**
`app.use(cors())` with no configuration allows requests from any origin.
In production this means any website can call your API.

```typescript
// CURRENT (WRONG)
app.use(cors());
```

**Fix:**
```typescript
// CORRECT
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST']
}));
```

Add `ALLOWED_ORIGIN=https://your-domain.com` to `.env` and `.env.example`.

---

### 7. No Rate Limiting on Any Endpoint

**File:** `server/src/index.ts`

**Problem:**
All scanner endpoints (`/api/scanner/phishing`, `/api/scanner/message`, etc.)
are open to unlimited requests. A single attacker can flood the Flask server
or exhaust Supabase quota in seconds.

**Fix:**
Install `express-rate-limit`:
```bash
pnpm add express-rate-limit
```

Add to `server/src/index.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({ windowMs: 60_000, max: 30 }); // 30 req/min
app.use('/api/scanner', limiter);
app.use('/api/deepfake', limiter);
app.use('/api/mule', limiter);
```

---

### 8. New Scam Reports Auto-Approved as 'verified'

**File:** `server/src/routes/scams.ts` → POST `/`

**Problem:**
Any anonymous user can POST a scam report and it is immediately inserted
with `status: 'verified'` — it appears on the public scam map instantly.
This is trivially abusable for disinformation.

```typescript
// CURRENT (WRONG)
.insert([{ title, description, latitude, longitude, status: 'verified' }])
```

**Fix:**
```typescript
// CORRECT — pending review by default
.insert([{ title, description, latitude, longitude, status: 'pending' }])
```

Apply the same fix to the in-memory mock fallback path.

---

### 9. Dead Code — Mule_Trace_temp/ Directory

**Directory:** `Mule_Trace_temp/`

**Problem:**
This is a complete standalone prototype app with its own `backend/`, `frontend/`,
`package.json`, `requirements.txt`, and `vercel.json`.
It duplicates the mule scanner functionality already integrated into the main app.
It adds ~30 files of confusion and is never referenced by the main codebase.

**Fix:**
Delete the entire `Mule_Trace_temp/` directory.
If it needs to be preserved for reference, move it to a separate git branch.

---

### 10. .agents/skills/ Directory Should Be Gitignored

**Directory:** `.agents/skills/`

**Problem:**
This directory contains 400+ external AI agent skill folders that have nothing
to do with CyberShakti. It bloats the repository significantly and pollutes
`listDirectory` output, making the project hard to navigate.

**Fix:**
Add to `.gitignore`:
```
.agents/
```
Then remove from tracking:
```bash
git rm -r --cached .agents/
```

---

## 🟡 MEDIUM — Improve Before Production

---

### 11. Call Hour Is Always the Server's Current Time

**File:** `server/src/routes/scanner.ts` → POST `/call`

**Problem:**
`call_hour` is injected as `new Date().getHours()` — the server's current hour.
This is the time the API was called, not the time the suspicious call occurred.
The Random Forest model uses `call_hour` as a feature, so this silently corrupts
every prediction (a call at 3 AM analyzed at 2 PM gets scored as a daytime call).

```typescript
// CURRENT (WRONG)
call_hour: new Date().getHours(),  // server time, not call time
```

**Fix:**
Accept `callHour` from the request body and fall back to current hour only if absent:
```typescript
call_hour: req.body.callHour !== undefined ? parseInt(req.body.callHour) : new Date().getHours(),
```
Update the frontend Scanner form to include a "Time of call" input.

---

### 12. prediction_confidence Is a Hardcoded Formula, Not Real Confidence

**File:** `python/api_server.py` → `/api/mule/ai-analyze/<account_id>` route

**Problem:**
The confidence score is computed from a degree-centrality formula, not from
any probabilistic model. It always returns a value between 0.85 and 0.95,
making it meaningless as a confidence indicator.

```python
# CURRENT (MISLEADING)
"prediction_confidence": 0.85 + (0.10 * (min(1.0, (in_degree + out_degree) / 20)))
```

**Fix:**
Either derive confidence from the actual suspicion score (normalized 0–1),
or label it honestly as a `topology_risk_score` so it is not mistaken for
a calibrated ML probability:
```python
"topology_risk_score": round(min(1.0, (in_degree + out_degree) / 20), 2),
```

---

### 13. In-Memory Scam Reports Lost on Server Restart

**File:** `server/src/routes/scams.ts`

**Problem:**
When Supabase is not configured, submitted scam reports are stored in the
`mockScams` array in memory. They are permanently lost on every server restart.
Users are not warned about this.

**Fix (short-term):**
Return a clear warning in the response:
```typescript
return res.status(201).json({
  message: 'Report saved in-memory only — will be lost on server restart. Configure Supabase for persistence.',
  id: newScam.id
});
```

**Fix (long-term):**
Write a simple JSON file fallback using `fs.writeFileSync` to `data/scam_reports_local.json`.

---

### 14. No React Error Boundary

**File:** `client/src/App.tsx`

**Problem:**
There is no error boundary wrapping the route components.
Any unhandled JavaScript error in a page component will crash the entire app
and show a blank white screen with no user feedback.

**Fix:**
Create `client/src/components/ErrorBoundary.tsx`:
```tsx
import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError)
      return <div className="text-center p-10 text-red-400">Something went wrong. Please refresh.</div>;
    return this.props.children;
  }
}
```

Wrap routes in `App.tsx`:
```tsx
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```

---

### 15. No Model Accuracy Metrics Printed After Training

**File:** `python/train_models.py`

**Problem:**
Models are trained and saved but no accuracy, precision, recall, or F1 score
is printed. There is no way to know if a model is performing well or is broken
without manually running evaluation separately.

**Fix:**
Add after each model's `.fit()` call:
```python
from sklearn.metrics import classification_report
y_pred = model.predict(X_test_vec)
print(classification_report(y_test, y_pred))
```

---

## 🟢 LOW — Quality of Life Improvements

---

### 16. No docker-compose.yml

**Problem:**
Setup requires Node 20, pnpm 8, Python 3.11 (specifically), a venv, and
optional Supabase credentials. This is a high barrier for new contributors.
A `docker-compose.yml` would make onboarding a single command.

**Fix:**
Create `docker-compose.yml` with three services:
- `client` — Vite dev server (Node 20)
- `server` — Express API (Node 20)
- `flask` — Python 3.11 Flask microservice

---

### 17. No OpenAPI / Swagger Documentation

**Problem:**
The API has 10+ endpoints with varied request/response shapes.
There is no machine-readable API spec. Developers must read source code
to understand what each endpoint expects.

**Fix:**
Add `swagger-ui-express` + `swagger-jsdoc` to the Express server,
or write a static `openapi.yaml` at the repo root.

---

### 18. Flask Health Check Endpoint Missing from README API Reference

**File:** `README.md`

**Problem:**
The README API Reference section lists `GET /health` as "Flask liveness check (internal)"
but does not document the actual Flask-side endpoints (`/api/phishing/detect`,
`/api/message/detect`, `/api/call/detect`, `/api/deepfake/detect`, etc.).
Anyone trying to call Flask directly (e.g. for testing) has no reference.

**Fix:**
Add a "Flask Internal API" section to the README documenting all Flask routes,
their expected request bodies, and response shapes.

---

## Summary Table

| # | File | Severity | Issue |
|---|---|---|---|
| 1 | `python/api_server.py` | 🔴 Critical | Deepfake uses random score, not model |
| 2 | `python/train_models.py` | 🔴 Critical | Deepfake model trained on noise |
| 3 | `python/train_models.py` | 🔴 Critical | Message classifier has 16 training samples |
| 4 | `python/api_server.py` | 🔴 Critical | Flask binds to 0.0.0.0 |
| 5 | `server/src/routes/deepfake.ts`, `mule.ts` | 🔴 Critical | No file upload size limit |
| 6 | `server/src/index.ts` | 🟠 High | CORS allows all origins |
| 7 | `server/src/index.ts` | 🟠 High | No rate limiting |
| 8 | `server/src/routes/scams.ts` | 🟠 High | New reports auto-verified |
| 9 | `Mule_Trace_temp/` | 🟠 High | Dead duplicate codebase |
| 10 | `.agents/skills/` | 🟠 High | 400+ unrelated files in repo |
| 11 | `server/src/routes/scanner.ts` | 🟡 Medium | call_hour uses server time |
| 12 | `python/api_server.py` | 🟡 Medium | prediction_confidence is hardcoded formula |
| 13 | `server/src/routes/scams.ts` | 🟡 Medium | In-memory reports lost on restart |
| 14 | `client/src/App.tsx` | 🟡 Medium | No React error boundary |
| 15 | `python/train_models.py` | 🟡 Medium | No accuracy metrics after training |
| 16 | repo root | 🟢 Low | No docker-compose.yml |
| 17 | repo root | 🟢 Low | No OpenAPI/Swagger docs |
| 18 | `README.md` | 🟢 Low | Flask endpoints not documented |
