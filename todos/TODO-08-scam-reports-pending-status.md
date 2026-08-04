# TODO-08 — New Scam Reports Should Default to 'pending', Not 'verified'

- **Priority:** 🟠 High
- **Status:** [ ] Not Started
- **File:** `server/src/routes/scams.ts`
- **Route:** `POST /api/scams`

---

## Problem

Any anonymous user can POST a scam report and it is immediately inserted
with `status: 'verified'` — it appears on the public scam map instantly.
This is trivially abusable for spreading disinformation on the map.

```typescript
// CURRENT — auto-verified
.insert([{ title, description, latitude, longitude, status: 'verified' }])
```

---

## Steps to Fix

- [ ] Change `status: 'verified'` to `status: 'pending'` in the Supabase insert
- [ ] Change `status: 'verified'` to `status: 'pending'` in the in-memory mock fallback
- [ ] Update the success response message to tell the user their report is under review
- [ ] (Optional) Add a note in README about how admins can approve reports in Supabase

---

## Code to Write

**Supabase insert (line ~65):**
```typescript
// Change:
.insert([{ title, description, latitude, longitude, status: 'verified' }])
// To:
.insert([{ title, description, latitude, longitude, status: 'pending' }])
```

**In-memory mock fallback (line ~75):**
```typescript
// Change:
const newScam: ScamReport = { ..., status: 'verified', ... };
// To:
const newScam: ScamReport = { ..., status: 'pending', ... };
```

**Response message:**
```typescript
return res.status(201).json({
  message: 'Scam report submitted successfully. It will appear on the map after review.',
  id: (data as any).id
});
```

---

## Done When

- [ ] POST `/api/scams` inserts with `status: 'pending'`
- [ ] The new report does NOT appear on the map immediately (GET filters by `status: 'verified'`)
- [ ] Response message tells the user their report is under review
- [ ] Existing verified mock data still shows on the map
