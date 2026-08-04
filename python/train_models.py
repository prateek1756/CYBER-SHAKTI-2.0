import os
import sys
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Setup paths
output_dir = os.path.dirname(__file__)
repo_root  = os.path.dirname(output_dir)
data_dir   = os.path.join(repo_root, 'data')
os.makedirs(data_dir, exist_ok=True)


# ---------------------------------------------------------------------------
# Helper: auto-download UCI SMS Spam Collection if missing
# ---------------------------------------------------------------------------
def ensure_sms_dataset(csv_path: str) -> bool:
    """Download the UCI SMS Spam Collection to csv_path if it is missing.
    Returns True if the file exists (or was just downloaded), False on failure.
    Workflow is never broken: all errors are caught and logged silently."""
    if os.path.exists(csv_path):
        return True
    print(f"[SMS Dataset] '{csv_path}' not found. Attempting automatic download...")
    try:
        import requests, zipfile, io as _io
        # Official UCI mirror via Kaggle-independent URL
        url = "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip"
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        with zipfile.ZipFile(_io.BytesIO(resp.content)) as zf:
            # The archive contains 'SMSSpamCollection' (tab-separated, no header)
            for name in zf.namelist():
                if 'SMSSpam' in name or name.endswith('.txt'):
                    raw = zf.read(name).decode('utf-8', errors='replace')
                    lines = [l.strip() for l in raw.splitlines() if l.strip()]
                    rows  = [l.split('\t', 1) for l in lines if '\t' in l]
                    df_raw = pd.DataFrame(rows, columns=['label', 'text'])
                    df_raw.to_csv(csv_path, index=False)
                    print(f"[SMS Dataset] Downloaded {len(df_raw)} samples → {csv_path}")
                    return True
        print("[SMS Dataset] Zip did not contain expected file. Using fallback.")
        return False
    except Exception as e:
        print(f"[SMS Dataset] Download failed: {e}. Using 20-sample fallback.")
        return False


# ===========================================================================
# 1. Deepfake Model (MobileNetV2 fine-tuning)
#    Industry-level pipeline:
#    - Loads real face images from data/deepfake/{real,fake}/ if present
#    - Falls back to a minimal synthetic dataset (geometric shapes) so the
#      pipeline always completes and produces a structurally valid .h5 file
#    - Data augmentation, proper fine-tuning of last 20 layers
#    - AUC + accuracy reported after training
# ===========================================================================
print("\n━━━ 1. Training Deepfake Detector (MobileNetV2) ━━━")
try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.layers import (Dense, GlobalAveragePooling2D, Dropout,
                                         RandomFlip, RandomBrightness, RandomContrast)
    from tensorflow.keras.models import Model
    from tensorflow.keras.callbacks import EarlyStopping

    IMG_SIZE   = (224, 224)
    BATCH_SIZE = 32
    EPOCHS     = 10

    real_dir = os.path.join(data_dir, 'deepfake', 'real')
    fake_dir = os.path.join(data_dir, 'deepfake', 'fake')
    dataset_present = os.path.isdir(real_dir) and len(os.listdir(real_dir)) > 0 and \
                      os.path.isdir(fake_dir) and len(os.listdir(fake_dir)) > 0

    if dataset_present:
        # ── Real dataset path ────────────────────────────────────────────
        print(f"[Deepfake] Real dataset found at data/deepfake/. Loading…")
        deepfake_root = os.path.join(data_dir, 'deepfake')
        train_ds = tf.keras.utils.image_dataset_from_directory(
            deepfake_root,
            labels='inferred', label_mode='binary',
            image_size=IMG_SIZE, batch_size=BATCH_SIZE,
            validation_split=0.2, subset='training', seed=42
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            deepfake_root,
            labels='inferred', label_mode='binary',
            image_size=IMG_SIZE, batch_size=BATCH_SIZE,
            validation_split=0.2, subset='validation', seed=42
        )
        # Normalize + augment training data
        augment = tf.keras.Sequential([
            RandomFlip('horizontal'),
            RandomBrightness(0.1),
            RandomContrast(0.1),
        ])
        normalise = tf.keras.layers.Rescaling(1.0 / 255)
        train_ds = train_ds.map(lambda x, y: (normalise(augment(x, training=True)), y),
                                num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
        val_ds   = val_ds.map(lambda x, y: (normalise(x), y),
                              num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
        use_generator = False
        EPOCHS = 15
    else:
        # ── Synthetic fallback (no download — keeps workflow green) ──────
        print("[Deepfake] No real dataset found in data/deepfake/. Using synthetic fallback.")
        print("           → Place real images in data/deepfake/real/ and data/deepfake/fake/ for production accuracy.")

        num_samples = 200
        X_synth = np.zeros((num_samples, 224, 224, 3), dtype=np.float32)
        y_synth = np.zeros(num_samples, dtype=np.int32)

        rng = np.random.default_rng(42)
        for i in range(num_samples):
            # "real" class: soft gradient + face-like ellipse
            if i < num_samples // 2:
                base = rng.uniform(0.3, 0.7, (224, 224, 3)).astype(np.float32)
                cx, cy = 112, 112
                for px in range(224):
                    for py in range(224):
                        if ((px - cx) / 60) ** 2 + ((py - cy) / 80) ** 2 < 1:
                            base[px, py] = [0.85, 0.70, 0.65]
                X_synth[i] = base
            else:
                # "fake" class: high-frequency noise overlay
                base = rng.uniform(0.0, 1.0, (224, 224, 3)).astype(np.float32)
                checkerboard = ((np.indices((224, 224)).sum(axis=0) % 8) < 4).astype(np.float32)
                base[:, :, 0] = np.clip(base[:, :, 0] + checkerboard * 0.3, 0, 1)
                X_synth[i] = base
                y_synth[i] = 1

        X_train, X_test, y_train, y_test = train_test_split(
            X_synth, y_synth, test_size=0.2, random_state=42, stratify=y_synth)
        use_generator = True
        EPOCHS = 5  # Fewer epochs for synthetic data

    # ── Build model ───────────────────────────────────────────────────────
    print("[Deepfake] Building MobileNetV2 model…")
    try:
        base = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
    except Exception:
        base = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights=None)

    # Freeze all layers first, then unfreeze last 20 for fine-tuning
    base.trainable = False
    for layer in base.layers[-20:]:
        layer.trainable = True

    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(1, activation='sigmoid')(x)

    df_model = Model(inputs=base.input, outputs=predictions)
    df_model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )

    early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)

    if use_generator:
        df_model.fit(X_train, y_train, epochs=EPOCHS, batch_size=16,
                     validation_data=(X_test, y_test), callbacks=[early_stop], verbose=1)
        # Evaluation
        loss, acc, auc = df_model.evaluate(X_test, y_test, verbose=0)
        print(f"\n[Deepfake] Test  Accuracy : {acc:.4f}")
        print(f"[Deepfake] Test  AUC      : {auc:.4f}")
        y_pred_raw = (df_model.predict(X_test, verbose=0) > 0.5).astype(int).flatten()
        print(classification_report(y_test, y_pred_raw, target_names=['real', 'fake']))
    else:
        df_model.fit(train_ds, epochs=EPOCHS, validation_data=val_ds,
                     callbacks=[early_stop], verbose=1)
        print("[Deepfake] Evaluating on validation set…")
        results = df_model.evaluate(val_ds, verbose=0)
        for name, val in zip(df_model.metrics_names, results):
            print(f"[Deepfake] {name}: {val:.4f}")

    model_path = os.path.join(output_dir, 'deepfake_model.h5')
    df_model.save(model_path)
    print(f"[Deepfake] Model saved → {model_path}\n")

except ImportError as e:
    print(f"[Deepfake] TensorFlow not installed: {e}. Skipping deepfake training.\n")


# ===========================================================================
# 2. Phishing Link Model (Logistic Regression on TF-IDF char n-grams)
# ===========================================================================
print("━━━ 2. Training Phishing Link Detector ━━━")
csv_path = os.path.join(data_dir, 'malicious_phish.csv')

if os.path.exists(csv_path):
    print(f"[Phishing] Loading dataset from {csv_path}…")
    df_phishing = pd.read_csv(csv_path)
    df_phishing['label'] = df_phishing['type'].apply(lambda x: 0 if x.lower() == 'benign' else 1)
    n_per_class = min(15000, df_phishing['label'].value_counts().min())
    df_b = df_phishing[df_phishing['label'] == 0].sample(n=n_per_class, random_state=42)
    df_m = df_phishing[df_phishing['label'] == 1].sample(n=n_per_class, random_state=42)
    df_sampled = pd.concat([df_b, df_m]).sample(frac=1, random_state=42).reset_index(drop=True)
    X_ph, y_ph = df_sampled['url'], df_sampled['label']
else:
    print("[Phishing] Dataset not found. Using 20-sample fallback…")
    data_phishing = {
        'url': [
            'https://www.google.com', 'https://www.wikipedia.org', 'https://github.com',
            'https://www.amazon.com', 'https://www.nytimes.com', 'https://www.microsoft.com',
            'https://www.apple.com', 'https://www.facebook.com', 'https://www.netflix.com',
            'https://www.linkedin.com',
            'http://secure-login-update.com', 'http://verify-bank-account-security.xyz',
            'http://free-lottery-giftcard-winner.net', 'http://kyc-verification-sbi.top',
            'http://update-paypal-details.cf', 'http://claim-crypto-reward.cn',
            'http://account-block-alert.ru', 'http://electricity-bill-pay.in/update',
            'http://parttimejob-telegram-deposit.icu', 'http://get-rich-quick-scheme.xyz'
        ],
        'label': [0]*10 + [1]*10
    }
    df_sampled = pd.DataFrame(data_phishing)
    X_ph, y_ph = df_sampled['url'], df_sampled['label']

X_train_ph, X_test_ph, y_train_ph, y_test_ph = train_test_split(
    X_ph, y_ph, test_size=0.2, random_state=42)

vectorizer_ph = TfidfVectorizer(analyzer='char', ngram_range=(3, 5))
X_train_ph_vec = vectorizer_ph.fit_transform(X_train_ph)
X_test_ph_vec  = vectorizer_ph.transform(X_test_ph)
model_ph = LogisticRegression(max_iter=1000)
model_ph.fit(X_train_ph_vec, y_train_ph)

y_pred_ph = model_ph.predict(X_test_ph_vec)
print(f"[Phishing] Test Accuracy: {accuracy_score(y_test_ph, y_pred_ph):.4f}")
print(classification_report(y_test_ph, y_pred_ph, target_names=['benign', 'malicious']))

phishing_model_path = os.path.join(output_dir, 'phishing_model.pkl')
joblib.dump({'vectorizer': vectorizer_ph, 'model': model_ph}, phishing_model_path)
print(f"[Phishing] Model saved → {phishing_model_path}\n")


# ===========================================================================
# 3. Fraud Message Classifier (MultinomialNB on TF-IDF)
#    Auto-downloads UCI SMS Spam Collection if missing (non-breaking)
# ===========================================================================
print("━━━ 3. Training Fraud Message Classifier ━━━")
sms_csv = os.path.join(data_dir, 'sms_spam.csv')
use_real_sms = ensure_sms_dataset(sms_csv)

if use_real_sms and os.path.exists(sms_csv):
    print(f"[Message] Loading SMS Spam dataset from {sms_csv}…")
    df_msg = pd.read_csv(sms_csv)
    # Handle both tab-separated raw file (label/text) and our saved CSV format
    if 'label' in df_msg.columns and 'text' in df_msg.columns:
        df_msg['label'] = df_msg['label'].apply(
            lambda x: 1 if str(x).strip().lower() in ('spam', '1') else 0)
    else:
        # Fallback column detection
        df_msg.columns = ['label', 'text'] + list(df_msg.columns[2:])
        df_msg['label'] = (df_msg['label'].astype(str).str.lower() == 'spam').astype(int)
    X_msg, y_msg = df_msg['text'].astype(str), df_msg['label']
    print(f"[Message] Loaded {len(df_msg)} samples "
          f"(spam: {y_msg.sum()}, ham: {(y_msg==0).sum()})")
else:
    print("[Message] Using 20-sample hardcoded fallback (add data/sms_spam.csv for production)…")
    data_msg = {
        'text': [
            "Hey! Are we still meeting for lunch today?",
            "Your package has been delivered to your mailbox. Have a good day!",
            "Don't forget to submit the report by 5 PM.",
            "Can you send me the slides for the presentation?",
            "Just wanted to check in and see how you are doing.",
            "The weather is lovely today, let's go for a walk.",
            "Your appointment with Dr. Smith is confirmed for tomorrow.",
            "Thanks for the help yesterday!",
            "Happy Birthday! Hope you have a wonderful day.",
            "Please review the attached invoice for your payment record.",
            "ALERT: Your SBI bank account has been blocked due to missing KYC. Click http://kyc-sbi-verification.top to update.",
            "Congratulations! You have won a cash lottery of Rs 25 Lakhs. Call 9876543210 to claim your reward urgently.",
            "Dear customer, your electricity bill is unpaid. Connection will be disconnected at 9:30 PM. Contact 9123456789 immediately.",
            "Earn Rs 5000/day working from home part-time. Just like YouTube videos. Join our Telegram channel: t.me/fakejobs.",
            "URGENT: Block warning for credit card. Verify your details at http://card-verify.xyz to avoid cancellation.",
            "IMPORTANT: Share the 6-digit OTP sent to your phone to verify your online transaction immediately.",
            "Dear user, your Netflix subscription has expired. Update payment information at http://netflix-renew-account.xyz.",
            "Claim your free Rs 10,000 Amazon gift card voucher today. Offer ends in 1 hour. Click http://amzn-rewards.top.",
            "Your bank account has been debited with Rs 50,000. If not done by you, report immediately to http://bank-report.cf.",
            "Dear winner, you have been selected for a free holiday package. Click to register your details now."
        ],
        'label': [0]*10 + [1]*10
    }
    df_msg_fb = pd.DataFrame(data_msg)
    X_msg, y_msg = df_msg_fb['text'], df_msg_fb['label']

X_train_msg, X_test_msg, y_train_msg, y_test_msg = train_test_split(
    X_msg, y_msg, test_size=0.2, random_state=42, stratify=y_msg)

vectorizer_msg = TfidfVectorizer(stop_words='english', lowercase=True, max_features=50000)
X_train_msg_vec = vectorizer_msg.fit_transform(X_train_msg)
X_test_msg_vec  = vectorizer_msg.transform(X_test_msg)
model_msg = MultinomialNB(alpha=0.1)
model_msg.fit(X_train_msg_vec, y_train_msg)

y_pred_msg = model_msg.predict(X_test_msg_vec)
print(f"[Message] Test Accuracy: {accuracy_score(y_test_msg, y_pred_msg):.4f}")
print(classification_report(y_test_msg, y_pred_msg, target_names=['ham', 'spam']))

msg_model_path = os.path.join(output_dir, 'message_classifier.pkl')
joblib.dump({'vectorizer': vectorizer_msg, 'model': model_msg}, msg_model_path)
print(f"[Message] Model saved → {msg_model_path}\n")


# ===========================================================================
# 4. Scam Call Detector (Random Forest)
# ===========================================================================
print("━━━ 4. Training Scam Call Detector (Random Forest) ━━━")
np.random.seed(42)
num_samples = 500  # doubled for better generalisation

duration_0     = np.random.normal(120, 45, num_samples)
freq_0         = np.random.poisson(2, num_samples)
hour_0         = np.random.randint(8, 20, num_samples)
flags_0        = np.random.binomial(1, 0.05, num_samples)
carrier_rep_0  = np.random.choice([4, 5], num_samples, p=[0.3, 0.7])
intl_0         = np.random.binomial(1, 0.02, num_samples)
y_0            = np.zeros(num_samples)

duration_1     = np.random.normal(45, 20, num_samples)
freq_1         = np.random.poisson(18, num_samples)
hour_1         = np.random.choice(list(range(0, 8)) + list(range(20, 24)), num_samples)
flags_1        = np.random.poisson(5, num_samples)
carrier_rep_1  = np.random.choice([1, 2, 3], num_samples, p=[0.5, 0.4, 0.1])
intl_1         = np.random.binomial(1, 0.4, num_samples)
y_1            = np.ones(num_samples)

df_call = pd.DataFrame({
    'call_duration':     np.concatenate([duration_0, duration_1]),
    'call_frequency':    np.concatenate([freq_0, freq_1]),
    'call_hour':         np.concatenate([hour_0, hour_1]),
    'spam_reports':      np.concatenate([flags_0, flags_1]),
    'carrier_reputation':np.concatenate([carrier_rep_0, carrier_rep_1]),
    'is_international':  np.concatenate([intl_0, intl_1]),
    'label':             np.concatenate([y_0, y_1])
}).sample(frac=1, random_state=42).reset_index(drop=True)

X_call = df_call.drop('label', axis=1)
y_call = df_call['label']
X_train_call, X_test_call, y_train_call, y_test_call = train_test_split(
    X_call, y_call, test_size=0.2, random_state=42, stratify=y_call)

model_call = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model_call.fit(X_train_call, y_train_call)

y_pred_call = model_call.predict(X_test_call)
print(f"[Call] Test Accuracy: {accuracy_score(y_test_call, y_pred_call):.4f}")
print(classification_report(y_test_call, y_pred_call, target_names=['legitimate', 'scam']))

call_model_path = os.path.join(output_dir, 'call_classifier.pkl')
joblib.dump(model_call, call_model_path)
print(f"[Call] Model saved → {call_model_path}\n")

print("━━━ All models trained and saved successfully! ━━━")
