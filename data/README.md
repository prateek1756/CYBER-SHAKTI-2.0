# CyberShakti Datasets Directory

Place your custom CSV/Excel/Text dataset files in this folder.

### Expected Formats

#### 1. Phishing URLs Dataset (`phishing_data.csv`)
A CSV file containing URLs and their target label:
```csv
url,label
https://google.com,0
http://secure-login-update-bank.top,1
```
* **`0`**: Safe URL
* **`1`**: Phishing URL

#### 2. Fraud Messages Dataset (`message_data.csv`)
A CSV file containing message contents and their target label:
```csv
text,label
"Hey, are we still meeting for lunch today?",0
"ALERT: Your bank account is suspended. Click http://bit.ly/123 to verify.",1
```
* **`0`**: Safe Message
* **`1`**: Fraudulent Message
