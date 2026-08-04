# CyberShakti 2.0 — TODO Index

All 18 issues tracked as individual files in this directory.
Update the status checkbox in each file as you work through them.

---

## 🔴 Critical (Fix First)

| File | Issue | Status |
|---|---|---|
| [TODO-01](./TODO-01-deepfake-random-score.md) | Deepfake detection uses random score, not the ML model | [ ] Not Started |
| [TODO-02](./TODO-02-deepfake-real-training-data.md) | Deepfake model trained on noise — needs real dataset | [ ] Not Started |
| [TODO-03](./TODO-03-message-classifier-real-dataset.md) | Message classifier has only 16 training samples | [ ] Not Started |
| [TODO-04](./TODO-04-flask-host-binding.md) | Flask server binds to 0.0.0.0 (publicly exposed) | [ ] Not Started |
| [TODO-05](./TODO-05-file-upload-limits.md) | No file upload size limit — RAM exhaustion risk | [ ] Not Started |

---

## 🟠 High (Fix Before Deployment)

| File | Issue | Status |
|---|---|---|
| [TODO-06](./TODO-06-cors-restrict-origins.md) | CORS allows all origins | [ ] Not Started |
| [TODO-07](./TODO-07-rate-limiting.md) | No rate limiting on any endpoint | [ ] Not Started |
| [TODO-08](./TODO-08-scam-reports-pending-status.md) | New scam reports auto-approved as verified | [ ] Not Started |
| [TODO-09](./TODO-09-delete-mule-trace-temp.md) | Mule_Trace_temp/ is dead duplicate code | [ ] Not Started |
| [TODO-10](./TODO-10-gitignore-agents-directory.md) | .agents/skills/ (400+ unrelated files) not gitignored | [ ] Not Started |

---

## 🟡 Medium (Fix Before Production)

| File | Issue | Status |
|---|---|---|
| [TODO-11](./TODO-11-call-hour-fix.md) | call_hour uses server time, not actual call time | [ ] Not Started |
| [TODO-12](./TODO-12-prediction-confidence-fix.md) | prediction_confidence is a hardcoded formula | [ ] Not Started |
| [TODO-13](./TODO-13-persist-scam-reports.md) | In-memory scam reports lost on server restart | [ ] Not Started |
| [TODO-14](./TODO-14-react-error-boundary.md) | No React error boundary — blank screen on crash | [ ] Not Started |
| [TODO-15](./TODO-15-model-accuracy-metrics.md) | No accuracy metrics printed after model training | [ ] Not Started |

---

## 🟢 Low (Quality of Life)

| File | Issue | Status |
|---|---|---|
| [TODO-16](./TODO-16-docker-compose.md) | No docker-compose.yml for easy setup | [ ] Not Started |
| [TODO-17](./TODO-17-openapi-swagger-docs.md) | No OpenAPI / Swagger API documentation | [ ] Not Started |
| [TODO-18](./TODO-18-readme-flask-endpoints.md) | Flask internal endpoints not documented in README | [ ] Not Started |

---

## Progress

- Total: 18
- Not Started: 18
- In Progress: 0
- Done: 0

---

## How to Use

1. Pick a TODO file from the table above
2. Read the **Problem** and **Steps to Fix** sections
3. Make the changes in the listed files
4. Check off each step `[x]` as you complete it
5. Update the **Status** in this index table when done
