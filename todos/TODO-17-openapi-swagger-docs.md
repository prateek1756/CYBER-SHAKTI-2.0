# TODO-17 — Add OpenAPI / Swagger API Documentation

- **Priority:** 🟢 Low
- **Status:** [ ] Not Started
- **Files:** `server/src/index.ts`, new `openapi.yaml` or inline JSDoc

---

## Problem

The API has 10+ endpoints with varied request/response shapes.
There is no machine-readable API spec. Developers must read source code
to understand what each endpoint expects and returns.

---

## Steps to Fix

**Option A — Static YAML file (simpler):**
- [ ] Create `openapi.yaml` at the repo root
- [ ] Document all Express endpoints with request/response schemas
- [ ] Link to it from README

**Option B — Live Swagger UI (better DX):**
- [ ] Install `swagger-ui-express` and `swagger-jsdoc`
- [ ] Add JSDoc comments to each route
- [ ] Mount Swagger UI at `/api/docs`

---

## Packages (Option B)

```bash
pnpm add swagger-ui-express swagger-jsdoc
pnpm add -D @types/swagger-ui-express @types/swagger-jsdoc
```

---

## Endpoints to Document

| Method | Path | Body / Params | Response |
|---|---|---|---|
| GET | `/api/health` | — | `{ status, mode }` |
| POST | `/api/scanner/phishing` | `{ url }` | `{ risk_score, is_phishing, status, reasons }` |
| POST | `/api/scanner/message` | `{ message }` | `{ risk_score, is_fraud, status, reasons }` |
| POST | `/api/scanner/call` | `{ phoneNumber, duration, frequency, spamReports, carrierRep, isIntl, callHour? }` | `{ risk_score, is_scam, status, details }` |
| POST | `/api/deepfake/detect` | `multipart: file` | `{ is_fake, confidence_score, face_detected }` |
| GET | `/api/deepfake/stats` | — | `{ tensorflow_available, deepfake_model_loaded, ... }` |
| POST | `/api/mule/upload` | `multipart: file (.csv)` | SSE stream |
| POST | `/api/mule/generate-demo` | — | SSE stream |
| POST | `/api/mule/ai-analyze/:id` | — | `{ forensic_summary, behavioral_flags, recommendation }` |
| GET | `/api/scams` | `?lat=&lng=&radius=` | `ScamReport[]` |
| POST | `/api/scams` | `{ title, description, latitude, longitude }` | `{ message, id }` |

---

## Done When

- [ ] All endpoints are documented with request/response shapes
- [ ] Either a static `openapi.yaml` exists OR Swagger UI is live at `/api/docs`
- [ ] README links to the API docs
