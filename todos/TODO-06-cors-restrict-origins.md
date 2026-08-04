# TODO-06 — Restrict CORS to Known Origins

- **Priority:** 🟠 High
- **Status:** [ ] Not Started
- **File:** `server/src/index.ts`

---

## Problem

`app.use(cors())` with no configuration allows requests from **any** origin.
In production this means any website on the internet can call the CyberShakti API,
enabling cross-site request abuse and data scraping.

```typescript
// CURRENT — allows all origins
app.use(cors());
```

---

## Steps to Fix

- [ ] Install no new packages — `cors` is already a dependency
- [ ] Add `ALLOWED_ORIGIN` to `.env.example`
- [ ] Read `ALLOWED_ORIGIN` from `config.ts`
- [ ] Pass an origin whitelist to `cors()` in `index.ts`
- [ ] Allow `localhost:5173` as default for local development

---

## Code to Write

**`.env.example`** — add line:
```
ALLOWED_ORIGIN=http://localhost:5173
```

**`server/src/config.ts`** — add to the config object:
```typescript
allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
```

**`server/src/index.ts`** — replace:
```typescript
// Remove:
app.use(cors());

// Add:
app.use(cors({
  origin: config.allowedOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Done When

- [ ] A `fetch()` from `http://evil.com` to the API returns a CORS error
- [ ] The React frontend on `localhost:5173` still works normally
- [ ] Setting `ALLOWED_ORIGIN=https://cybershakti.in` in `.env` works for production
