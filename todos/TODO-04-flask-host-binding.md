# TODO-04 — Fix Flask Server Binding to 0.0.0.0

- **Priority:** 🔴 Critical
- **Status:** [x] ✅ Completed
- **File:** `python/api_server.py`
- **Line:** Last line — `app.run(...)`

---

## Problem

README states Flask binds to `127.0.0.1` by default (internal only).
The actual code binds to `0.0.0.0` — publicly reachable on all network interfaces.
Flask has zero authentication, so anyone who can reach port 5001 can call all endpoints directly.

```python
# CURRENT — publicly exposed
app.run(host='0.0.0.0', port=PORT)
```

---

## Steps to Fix

- [x] Change `app.run()` to read `HOST` from the `FLASK_HOST` environment variable
- [x] Default to `127.0.0.1` when the env var is not set
- [x] Verify `FLASK_HOST` is already defined in `.env.example` (it is — just wire it up)
- [x] Test that Flask is unreachable from outside after the fix

---

## Code to Write

```python
# At the top of api_server.py where PORT is defined, add:
HOST = os.environ.get('FLASK_HOST', '127.0.0.1')

# At the bottom, replace:
# app.run(host='0.0.0.0', port=PORT)
# With:
if __name__ == '__main__':
    print(f"Flask API server starting on {HOST}:{PORT}...")
    app.run(host=HOST, port=PORT)
```

---

## Done When

- [x] `app.run(host='0.0.0.0', ...)` no longer exists in the file
- [x] Running `python api_server.py` without env vars binds to `127.0.0.1`
- [x] Setting `FLASK_HOST=0.0.0.0` in `.env` still allows override for dev/Docker use
- [x] Express server can still reach Flask (it uses `127.0.0.1` by default — no change needed)

---

## Verification

- `HOST = os.environ.get('FLASK_HOST', '127.0.0.1')` confirmed present at line 38 of `python/api_server.py`
- `app.run(host=HOST, port=PORT)` confirmed present at line 590
- `host='0.0.0.0'` confirmed absent — zero matches in file
- `.env.example` already had `FLASK_HOST=127.0.0.1` defined — wired up correctly
- **Fixed:** 2025 — code change applied, TODO marked complete
