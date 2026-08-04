# TODO-07 — Add Rate Limiting to All Scanner Endpoints

- **Priority:** 🟠 High
- **Status:** [ ] Not Started
- **File:** `server/src/index.ts`

---

## Problem

All scanner endpoints are open to unlimited requests.
A single attacker can flood the Flask server, exhaust Supabase quota,
or trigger excessive ML inference costs with no throttling in place.

---

## Steps to Fix

- [ ] Install `express-rate-limit`:
  ```bash
  pnpm add express-rate-limit
  pnpm add -D @types/express-rate-limit
  ```
- [ ] Add rate limiters in `server/src/index.ts` before route registration
- [ ] Apply stricter limit to deepfake (file upload is expensive)
- [ ] Apply looser limit to scam map GET (read-only, low cost)

---

## Code to Write

**`server/src/index.ts`:**
```typescript
import rateLimit from 'express-rate-limit';

// 30 requests per minute for scanner endpoints
const scannerLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a minute and try again.' }
});

// 10 requests per minute for file uploads (expensive)
const uploadLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: 'Too many upload requests. Please wait a minute.' }
});

// Apply before route registration
app.use('/api/scanner', scannerLimiter);
app.use('/api/deepfake', uploadLimiter);
app.use('/api/mule', uploadLimiter);
app.use('/api/scams', scannerLimiter);
```

---

## Done When

- [ ] Sending 31 requests to `/api/scanner/phishing` in under a minute returns 429
- [ ] Sending 11 file uploads to `/api/deepfake/detect` in under a minute returns 429
- [ ] Normal usage (a few requests per minute) is unaffected
- [ ] Rate limit headers (`RateLimit-Remaining`, etc.) appear in responses
