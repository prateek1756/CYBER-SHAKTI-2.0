# TODO-18 — Document Flask Internal Endpoints in README

- **Priority:** 🟢 Low
- **Status:** [ ] Not Started
- **File:** `README.md`

---

## Problem

The README API Reference section only documents the Express proxy endpoints.
The Flask-side endpoints (`/api/phishing/detect`, `/api/message/detect`, etc.)
are completely undocumented. Anyone testing Flask directly (bypassing Express)
has no reference for what to send or what to expect back.

---

## Steps to Fix

- [ ] Add a "Flask Internal API" section to `README.md`
- [ ] Document all Flask routes with method, path, request body, and response shape
- [ ] Add a note clarifying these are internal endpoints (not meant for public use)

---

## Section to Add to README.md

Add after the existing "API Reference" section:

````markdown
### Flask Internal API (port 5001 — internal only)

> These endpoints are called by the Express server. Do not expose port 5001 publicly.

```
GET  /health
     → { status, service, port }

POST /api/phishing/detect
     body: { url }
     → { url, risk_score, is_phishing, status, reasons, using_fallback_heuristics }

POST /api/message/detect
     body: { message }
     → { message_length, risk_score, is_fraud, status, reasons, using_fallback_heuristics }

POST /api/call/detect
     body: { call_duration, call_frequency, call_hour, spam_reports, carrier_reputation, is_international }
     → { risk_score, is_scam, status, details, using_fallback_heuristics }

POST /api/deepfake/detect
     multipart: file (image/video)
     → { face_detected, is_fake, confidence_score, raw_score, using_fallback_heuristics }

GET  /api/deepfake/stats
     → { tensorflow_available, mediapipe_available, deepfake_model_loaded, phishing_model_loaded, ... }

POST /api/mule/upload
     multipart: file (.csv)
     → SSE stream of { status, progress } then { suspicious_accounts, fraud_rings, graph_data, summary }

POST /api/mule/generate-demo
     → SSE stream (same shape as upload)

POST /api/mule/ai-analyze/<account_id>
     → { account_id, forensic_summary, behavioral_flags, recommendation, prediction_confidence }
```
````

---

## Done When

- [ ] README has a "Flask Internal API" section
- [ ] All Flask routes are documented with request/response shapes
- [ ] A warning note clarifies these are internal endpoints
