# TODO-13 — Persist In-Memory Scam Reports Across Restarts

- **Priority:** 🟡 Medium
- **Status:** [ ] Not Started
- **File:** `server/src/routes/scams.ts`

---

## Problem

When Supabase is not configured, submitted scam reports are stored in the
`mockScams` array in memory. They are permanently lost on every server restart.
Users receive no warning about this — they think their report was saved.

---

## Steps to Fix

**Short-term (warn the user):**
- [ ] Update the in-memory POST response to clearly state data is not persisted

**Medium-term (JSON file fallback):**
- [ ] On server start, load `data/scam_reports_local.json` if it exists
- [ ] On every POST (in-memory path), append to the JSON file
- [ ] On GET (in-memory path), read from the JSON file

---

## Code to Write

**Short-term fix — update response message:**
```typescript
return res.status(201).json({
  message: 'Report saved in-memory only — will be lost on server restart. Configure Supabase for persistence.',
  id: newScam.id
});
```

**Medium-term fix — JSON file persistence:**
```typescript
import fs from 'fs';
import path from 'path';

const LOCAL_STORE = path.resolve('data', 'scam_reports_local.json');

function loadLocalScams(): ScamReport[] {
  try {
    if (fs.existsSync(LOCAL_STORE))
      return JSON.parse(fs.readFileSync(LOCAL_STORE, 'utf-8'));
  } catch { /* ignore */ }
  return [...mockScams]; // seed with defaults
}

function saveLocalScams(scams: ScamReport[]) {
  try { fs.writeFileSync(LOCAL_STORE, JSON.stringify(scams, null, 2)); }
  catch (e) { console.error('[Scams] Failed to persist local store:', e); }
}
```

Add `data/scam_reports_local.json` to `.gitignore`.

---

## Done When

- [ ] Submitting a report without Supabase and restarting the server still shows the report
- [ ] OR the response clearly warns the user that data is not persisted
- [ ] `data/scam_reports_local.json` is gitignored
