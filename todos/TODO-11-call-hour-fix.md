# TODO-11 — Fix call_hour Using Server Time Instead of Actual Call Time

- **Priority:** 🟡 Medium
- **Status:** [ ] Not Started
- **File:** `server/src/routes/scanner.ts`
- **Route:** `POST /api/scanner/call`

---

## Problem

`call_hour` is injected as `new Date().getHours()` — the server's current hour.
This is the time the API was called, not the time the suspicious call occurred.
The Random Forest model uses `call_hour` as a feature, so this silently corrupts
every prediction (a call received at 3 AM but analyzed at 2 PM gets scored as a daytime call).

```typescript
// CURRENT — always server's current time
call_hour: new Date().getHours(),
```

---

## Steps to Fix

- [ ] Add `callHour` as an optional field in the request body
- [ ] Use `req.body.callHour` if provided, fall back to `new Date().getHours()` if not
- [ ] Update the frontend Scanner form to include a "Time of call (hour 0–23)" input
- [ ] Update the API reference in `README.md` to document `callHour`

---

## Code to Write

**`server/src/routes/scanner.ts`:**
```typescript
// Change:
call_hour: new Date().getHours(),

// To:
call_hour: req.body.callHour !== undefined
  ? parseInt(req.body.callHour as string, 10)
  : new Date().getHours(),
```

**Frontend Scanner form** — add a new input field:
```tsx
<input
  type="number"
  min={0}
  max={23}
  placeholder="Hour call was received (0–23)"
  value={callHour}
  onChange={e => setCallHour(e.target.value)}
/>
```

**README.md** — update the call endpoint docs:
```
POST /api/scanner/call
body: { phoneNumber, duration, frequency, spamReports, carrierRep, isIntl, callHour? }
```

---

## Done When

- [ ] Sending `callHour: 3` in the request body uses 3 AM for scoring
- [ ] Omitting `callHour` still works (falls back to current hour)
- [ ] A call at 3 AM scores higher than the same call at 2 PM (nocturnal penalty)
