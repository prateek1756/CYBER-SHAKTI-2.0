# TODO-15 — Print Model Accuracy Metrics After Training

- **Priority:** 🟡 Medium
- **Status:** [ ] Not Started
- **File:** `python/train_models.py`

---

## Problem

All four models are trained and saved but no accuracy, precision, recall,
or F1 score is printed. There is no way to know if a model is performing
well or is broken without manually running evaluation separately.

---

## Steps to Fix

- [ ] Add `classification_report` import at the top of `train_models.py`
- [ ] After each model's `.fit()` call, run `.predict()` on the test set
- [ ] Print the full classification report for each model
- [ ] For the deepfake model (TensorFlow), print `model.evaluate()` results

---

## Code to Write

Add at the top:
```python
from sklearn.metrics import classification_report, accuracy_score
```

**After phishing model training:**
```python
X_test_ph_vec = vectorizer_ph.transform(X_test_ph)
y_pred_ph = model_ph.predict(X_test_ph_vec)
print("Phishing Model Performance:")
print(classification_report(y_test_ph, y_pred_ph, target_names=['benign', 'phishing']))
```

**After message classifier training:**
```python
X_test_msg_vec = vectorizer_msg.transform(X_test_msg)
y_pred_msg = model_msg.predict(X_test_msg_vec)
print("Message Classifier Performance:")
print(classification_report(y_test_msg, y_pred_msg, target_names=['legitimate', 'fraud']))
```

**After call classifier training:**
```python
y_pred_call = model_call.predict(X_test_call)
print("Call Classifier Performance:")
print(classification_report(y_test_call, y_pred_call, target_names=['legitimate', 'scam']))
```

**After deepfake model training (TensorFlow):**
```python
loss, accuracy = df_model.evaluate(X_test, y_test, verbose=0)
print(f"Deepfake Model — Loss: {loss:.4f}, Accuracy: {accuracy:.4f}")
```

---

## Done When

- [ ] Running `python train_models.py` prints a classification report for all 4 models
- [ ] Each report shows precision, recall, F1-score, and support
- [ ] A model with poor performance (e.g. <70% F1) is visually obvious from the output
