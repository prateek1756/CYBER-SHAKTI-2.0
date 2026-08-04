# TODO-01 — Fix Deepfake Detection (Uses Random Score, Not ML Model)

- **Priority:** 🔴 Critical
- **Status:** [ ] Not Started
- **File:** `python/api_server.py`
- **Route:** `POST /api/deepfake/detect`

---

## Problem

The trained `deepfake_model.h5` is loaded but **never used** for inference.
The score is generated from a pseudo-random seed based on the file's byte sum.
This means every uploaded image/video gets a random result — not AI detection.

```python
# CURRENT — random number disguised as ML
file_sum = sum(file_bytes)
random.seed(file_sum)
score = float(random.uniform(0.05, 0.95))
```

---

## Steps to Fix

- [ ] Remove the `random.seed` / `random.uniform` block inside the `detect()` route
- [ ] Add PIL image preprocessing (resize to 224×224, normalize to [0,1])
- [ ] Call `trained_model.predict()` on the preprocessed array
- [ ] Keep the random fallback **only** when `trained_model is None`
- [ ] Add `Pillow` to `python/requirements.txt` if not already present
- [ ] Fix the Express fallback in `server/src/routes/deepfake.ts` which uses `filename.length + file.size` as a score

---

## Code to Write

Replace the score block in `detect()` with:

```python
from PIL import Image
import numpy as np
import io

trained_model = load_deepfake_model()

if trained_model is not None:
    img = Image.open(io.BytesIO(file_bytes)).convert('RGB').resize((224, 224))
    arr = np.expand_dims(np.array(img) / 255.0, axis=0).astype(np.float32)
    score = float(trained_model.predict(arr, verbose=0)[0][0])
else:
    # Fallback only when model is absent
    random.seed(sum(file_bytes))
    score = float(random.uniform(0.05, 0.95))
```

---

## Done When

- [ ] Uploading the same image twice returns the same score (deterministic)
- [ ] Score changes meaningfully between a real photo and an AI-generated face
- [ ] `using_fallback_heuristics: false` appears in the response when model is loaded
