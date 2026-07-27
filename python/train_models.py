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

# Setup path
output_dir = os.path.dirname(__file__)

print("--- 1. Training Deepfake Model ---")
try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
    from tensorflow.keras.models import Model

    np.random.seed(42)
    num_samples = 100
    img_height, img_width = 224, 224

    X = np.zeros((num_samples, img_height, img_width, 3), dtype=np.float32)
    for i in range(num_samples):
        X[i] = np.random.rand(img_height, img_width, 3)
        if i >= num_samples // 2:
            xx, yy = np.meshgrid(np.arange(img_height), np.arange(img_width))
            mask = (xx - 112)**2 + (yy - 112)**2 < 50**2
            X[i, mask, 0] += 0.2

    y = np.zeros(num_samples, dtype=np.int32)
    y[num_samples // 2:] = 1

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    try:
        print("Attempting to load MobileNetV2 with ImageNet weights...")
        base_model = MobileNetV2(input_shape=(img_height, img_width, 3), include_top=False, weights='imagenet')
    except Exception as e:
        print(f"Offline or failed to load ImageNet weights ({e}). Initializing model with random weights...")
        base_model = MobileNetV2(input_shape=(img_height, img_width, 3), include_top=False, weights=None)

    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(1, activation='sigmoid')(x)

    df_model = Model(inputs=base_model.input, outputs=predictions)
    df_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    df_model.fit(
        X_train, y_train,
        epochs=3,
        batch_size=16,
        validation_data=(X_test, y_test)
    )

    model_path = os.path.join(output_dir, 'deepfake_model.h5')
    df_model.save(model_path)
    print(f"Deepfake model saved successfully to {model_path}\n")

except ImportError as e:
    print(f"Tensorflow not installed or failed to import: {e}. Skipping deepfake model training.\n")


print("--- 2. Training Phishing Link Model ---")
csv_path = os.path.join(os.path.dirname(output_dir), 'data', 'malicious_phish.csv')

if os.path.exists(csv_path):
    print(f"Loading custom dataset from {csv_path}...")
    df_phishing = pd.read_csv(csv_path)
    df_phishing['label'] = df_phishing['type'].apply(lambda x: 0 if x.lower() == 'benign' else 1)
    
    # Subsample for faster/stable training (15,000 samples per class)
    # This prevents Out Of Memory errors and completes in seconds with high accuracy
    n_samples_per_class = min(15000, df_phishing['label'].value_counts().min())
    df_benign = df_phishing[df_phishing['label'] == 0].sample(n=n_samples_per_class, random_state=42)
    df_malicious = df_phishing[df_phishing['label'] == 1].sample(n=n_samples_per_class, random_state=42)
    df_sampled = pd.concat([df_benign, df_malicious]).sample(frac=1, random_state=42).reset_index(drop=True)
    
    X_ph = df_sampled['url']
    y_ph = df_sampled['label']
else:
    print("Custom dataset not found at default path. Using mock dataset fallback...")
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
        'label': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    }
    df_phishing = pd.DataFrame(data_phishing)
    X_ph = df_phishing['url']
    y_ph = df_phishing['label']

X_train_ph, X_test_ph, y_train_ph, y_test_ph = train_test_split(X_ph, y_ph, test_size=0.2, random_state=42)

vectorizer_ph = TfidfVectorizer(analyzer='char', ngram_range=(3, 5))
X_train_ph_vec = vectorizer_ph.fit_transform(X_train_ph)
model_ph = LogisticRegression(max_iter=1000)
model_ph.fit(X_train_ph_vec, y_train_ph)

phishing_model_path = os.path.join(output_dir, 'phishing_model.pkl')
joblib.dump({'vectorizer': vectorizer_ph, 'model': model_ph}, phishing_model_path)
print(f"Phishing link model saved successfully to {phishing_model_path}\n")


print("--- 3. Training Fraud Message Classifier ---")
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
    'label': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
}
df_msg = pd.DataFrame(data_msg)
X_msg = df_msg['text']
y_msg = df_msg['label']
X_train_msg, X_test_msg, y_train_msg, y_test_msg = train_test_split(X_msg, y_msg, test_size=0.2, random_state=42)

vectorizer_msg = TfidfVectorizer(stop_words='english', lowercase=True)
X_train_msg_vec = vectorizer_msg.fit_transform(X_train_msg)
model_msg = MultinomialNB()
model_msg.fit(X_train_msg_vec, y_train_msg)

msg_model_path = os.path.join(output_dir, 'message_classifier.pkl')
joblib.dump({'vectorizer': vectorizer_msg, 'model': model_msg}, msg_model_path)
print(f"Message classifier model saved successfully to {msg_model_path}\n")


print("--- 4. Training Scam Call Detector ---")
np.random.seed(42)
num_samples = 250

duration_0 = np.random.normal(120, 45, num_samples)
freq_0 = np.random.poisson(2, num_samples)
hour_0 = np.random.randint(8, 20, num_samples)
flags_0 = np.random.binomial(1, 0.05, num_samples)
carrier_rep_0 = np.random.choice([4, 5], num_samples, p=[0.3, 0.7])
intl_0 = np.random.binomial(1, 0.02, num_samples)
y_0 = np.zeros(num_samples)

duration_1 = np.random.normal(45, 20, num_samples)
freq_1 = np.random.poisson(18, num_samples)
hour_1 = np.random.choice(list(range(0, 8)) + list(range(20, 24)), num_samples)
flags_1 = np.random.poisson(5, num_samples)
carrier_rep_1 = np.random.choice([1, 2, 3], num_samples, p=[0.5, 0.4, 0.1])
intl_1 = np.random.binomial(1, 0.4, num_samples)
y_1 = np.ones(num_samples)

duration = np.concatenate([duration_0, duration_1])
frequency = np.concatenate([freq_0, freq_1])
hour = np.concatenate([hour_0, hour_1])
spam_reports = np.concatenate([flags_0, flags_1])
carrier_rep = np.concatenate([carrier_rep_0, carrier_rep_1])
is_intl = np.concatenate([intl_0, intl_1])
y = np.concatenate([y_0, y_1])

df_call = pd.DataFrame({
    'call_duration': duration,
    'call_frequency': frequency,
    'call_hour': hour,
    'spam_reports': spam_reports,
    'carrier_reputation': carrier_rep,
    'is_international': is_intl,
    'label': y
})
df_call = df_call.sample(frac=1, random_state=42).reset_index(drop=True)

X_call = df_call.drop('label', axis=1)
y_call = df_call['label']
X_train_call, X_test_call, y_train_call, y_test_call = train_test_split(X_call, y_call, test_size=0.2, random_state=42)

model_call = RandomForestClassifier(n_estimators=50, random_state=42)
model_call.fit(X_train_call, y_train_call)

call_model_path = os.path.join(output_dir, 'call_classifier.pkl')
joblib.dump(model_call, call_model_path)
print(f"Call classifier model saved successfully to {call_model_path}\n")

print("All models trained and exported successfully!")
