# TODO-02 — Retrain Deepfake Model on Real Data (Not Noise)

- **Priority:** 🔴 Critical
- **Status:** [ ] Not Started
- **File:** `python/train_models.py`
- **Section:** Section 1 — Deepfake Model

---

## Problem

The deepfake model is trained on `np.random.rand()` pixel arrays — pure noise.
MobileNetV2 fine-tuned on random images learns nothing useful.
The saved `deepfake_model.h5` has statistically meaningless weights.

```python
# CURRENT — training on random noise
X[i] = np.random.rand(img_height, img_width, 3)
```

---

## Steps to Fix

- [ ] Choose and download a real deepfake dataset (options below)
- [ ] Place dataset images in `data/deepfake/real/` and `data/deepfake/fake/`
- [ ] Rewrite the training section to use `tf.keras.utils.image_dataset_from_directory`
- [ ] Use proper train/val split (80/20)
- [ ] Unfreeze the last 20 layers of MobileNetV2 for fine-tuning
- [ ] Add data augmentation (horizontal flip, brightness, contrast)
- [ ] Print accuracy and AUC after training
- [ ] Save the retrained model to `python/deepfake_model.h5`

---

## Dataset Options (Free)

| Dataset | Size | Link |
|---|---|---|
| **140k Real and Fake Faces** (Kaggle) | ~2GB | https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces |
| **Celeb-DF v2** | ~2GB | https://github.com/yuezunli/celeb-deepfakeforensics |
| **DFDC Preview** (Meta) | ~10GB | https://ai.meta.com/datasets/dfdc/ |

Recommended for quick start: **140k Real and Fake Faces** on Kaggle.

---

## Code Structure to Write

```python
import tensorflow as tf

train_ds = tf.keras.utils.image_dataset_from_directory(
    'data/deepfake',
    labels='inferred',
    label_mode='binary',
    image_size=(224, 224),
    batch_size=32,
    validation_split=0.2,
    subset='training',
    seed=42
)
val_ds = tf.keras.utils.image_dataset_from_directory(
    'data/deepfake',
    labels='inferred',
    label_mode='binary',
    image_size=(224, 224),
    batch_size=32,
    validation_split=0.2,
    subset='validation',
    seed=42
)

# Normalize
normalization = tf.keras.layers.Rescaling(1./255)
train_ds = train_ds.map(lambda x, y: (normalization(x), y))
val_ds   = val_ds.map(lambda x, y: (normalization(x), y))
```

---

## Done When

- [ ] Model achieves >85% validation accuracy on held-out real/fake images
- [ ] Training script prints a classification report
- [ ] `deepfake_model.h5` is regenerated and works with the fix in TODO-01
