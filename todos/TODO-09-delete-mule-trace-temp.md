# TODO-09 — Delete Mule_Trace_temp/ Dead Code Directory

- **Priority:** 🟠 High
- **Status:** [ ] Not Started
- **Directory:** `Mule_Trace_temp/`

---

## Problem

`Mule_Trace_temp/` is a complete standalone prototype app with its own:
- `backend/` (Flask + Python)
- `frontend/` (React + Vite)
- `package.json`, `requirements.txt`, `vercel.json`

It duplicates the mule scanner functionality already fully integrated into the main app.
It is never referenced by the main codebase and adds ~30 files of confusion.

---

## Steps to Fix

- [ ] Confirm nothing in the main app imports from `Mule_Trace_temp/`
- [ ] Check if `Mule_Trace_temp/` has any unique logic NOT present in `python/forensics_engine.py`
  - Compare `Mule_Trace_temp/backend/engine.py` vs `python/forensics_engine.py`
  - If unique logic exists, port it to the main app first
- [ ] Delete the entire `Mule_Trace_temp/` directory
- [ ] Run `pnpm dev` and confirm everything still works

---

## Commands

```bash
# From repo root
rm -rf Mule_Trace_temp/

# Or on Windows
rmdir /s /q Mule_Trace_temp
```

---

## If You Want to Preserve It

Instead of deleting, archive it to a separate branch:
```bash
git checkout -b archive/mule-trace-prototype
git add Mule_Trace_temp/
git commit -m "archive: preserve Mule_Trace_temp prototype"
git checkout main
git rm -r Mule_Trace_temp/
git commit -m "chore: remove Mule_Trace_temp dead code"
```

---

## Done When

- [ ] `Mule_Trace_temp/` no longer exists in the repo root
- [ ] `pnpm dev` starts without errors
- [ ] Mule scanner in the main app still works (upload CSV, generate demo)
