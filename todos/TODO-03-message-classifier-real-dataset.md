# TODO-03 — Replace 16-Sample Message Classifier with Real Dataset

- **Priority:** 🔴 Critical
- **Status:** [ ] Not Started
- **File:** `python/train_models.py`
- **Section:** Section 3 — Fraud Message Classifier

---

## Problem

The message classifier trains on 20 hardcoded strings.
With 80/20 split that is only **16 training samples**.
The model memorizes these exact phrases and fails on any real-world variation.

```python
# CURRENT — 20 hardcoded samples
data_msg = {
    'text': [ ...20 items... ],
    'label': [0,0,0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,1,1]
}
```

---

## Steps to Fix

- [ ] Download the UCI SMS Spam Collection dataset (link below)
- [ ] Save it to `data/sms_spam.csv`
- [ ] Replace the hardcoded `data_msg` dict with a CSV loader (same pattern as phishing model)
- [ ] Keep the 20-sample hardcoded block as a fallback if CSV is missing
- [ ] Print classification report after training
- [ ] Retrain and save `python/message_classifier.pkl`

---

## Dataset

**UCI SMS Spam Collection** — 5,574 real SMS messages, free, no signup required.

Download: https://archive.ics.uci.edu/dataset/228/sms+spam+collection

The file is tab-separated with columns: `label` (ham/spam) and `text`.

---

## Code to Write

Replace the hardcoded block with:

```python
sms_csv_path = os.path.join(os.path.dirname(output_dir), 'data', 'sms_spam.csv')

if os.path.exists(sms_csv_path):
    print(f"Loading SMS Spam dataset from {sms_csv_path}...")
    df_msg = pd.read_csv(sms_csv_path, sep='\t', header=None, names=['label', 'text'])
    df_msg['label'] = (df_msg['label'] == 'spam').astype(int)
    X_msg = df_msg['text']
    y_msg = df_msg['label']
else:
    print("SMS dataset not found. Using 20-sample fallback...")
    # keep existing hardcoded block here as fallback
```

---

## Done When

- [ ] Model trains on 5,000+ real SMS messages
- [ ] Classification report shows >95% accuracy, >90% F1 on spam class
- [ ] `message_classifier.pkl` is regenerated
- [ ] Tested manually: "Your KYC is pending, click here" → is_fraud: true
- [ ] Tested manually: "Can we meet for lunch?" → is_fraud: false
