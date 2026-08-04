# TODO-12 — Replace Hardcoded prediction_confidence Formula

- **Priority:** 🟡 Medium
- **Status:** [ ] Not Started
- **File:** `python/api_server.py`
- **Route:** `POST /api/mule/ai-analyze/<account_id>`

---

## Problem

The `prediction_confidence` field is computed from a degree-centrality formula,
not from any probabilistic model. It always returns a value between 0.85 and 0.95,
making it meaningless as a confidence indicator. It misleads users into thinking
there is a calibrated ML probability behind the number.

```python
# CURRENT — hardcoded formula, always 0.85–0.95
"prediction_confidence": 0.85 + (0.10 * (min(1.0, (in_degree + out_degree) / 20)))
```

---

## Steps to Fix

**Option A (Quick Fix) — Rename the field to be honest:**
- [ ] Rename `prediction_confidence` to `topology_risk_score`
- [ ] Keep the same formula but label it accurately
- [ ] Update any frontend code that reads `prediction_confidence`

**Option B (Proper Fix) — Derive from suspicion score:**
- [ ] Look up the account's `suspicion_score` from the last `analyze()` run
- [ ] Normalize it to 0–1 range (`suspicion_score / 100`)
- [ ] Use that as the confidence value

---

## Code to Write

**Option A (rename):**
```python
# Change key name:
"topology_risk_score": round(0.85 + (0.10 * (min(1.0, (in_degree + out_degree) / 20))), 2),
```

**Option B (from suspicion score):**
```python
# Get the account's suspicion score from the engine's last results
account_results = [r for r in mule_engine.analyze() if r['account_id'] == account_id]
suspicion = account_results[0]['suspicion_score'] if account_results else 50.0
confidence = round(min(1.0, suspicion / 100.0), 2)

# In response:
"prediction_confidence": confidence,
```

Option A is faster. Option B is more accurate but requires re-running analyze().

---

## Done When

- [ ] The field no longer always returns a value between 0.85 and 0.95
- [ ] The field name accurately reflects what it measures
- [ ] Frontend displays the value correctly after the key rename (if Option A chosen)
