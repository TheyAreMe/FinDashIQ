# 🌐 Custom API & Email Webhook Integration Guide

FinDashIQ supports automated dispatch to custom backend APIs, automated algorithmic execution bots, third-party webhook catchers (n8n, Zapier, Make), and direct SMTP email servers.

---

## 1. Custom HTTP JSON POST Webhooks

When using the `Custom API Webhook` channel, FinDashIQ dispatches standard HTTP `POST` requests with a `Content-Type: application/json` payload to your specified endpoint URL whenever an alert fires or is tested.

### Standard JSON Payload Schema
```json
{
  "event": "QUANT_SIGNAL_TRIGGER",
  "timestamp": "2026-08-30T10:35:00Z",
  "ticker": "NVDA",
  "signalName": "SuperTrend Direction Flip ➔ Bullish Uptrend",
  "signalType": "supertrend_bull",
  "category": "Trend & Volatility",
  "condition": "direction_flip",
  "threshold": "Bullish Uptrend Confirmation",
  "title": "🚨 NVDA Signal Triggered: SuperTrend Bullish Flip",
  "message": "Quantitative Multi-Factor Engine triggered condition [Bullish Uptrend Confirmation] for NVDA...",
  "news": {
    "headline": "NVIDIA Unveils Next-Gen AI Silicon Architecture with Major Cloud Orders",
    "summary": "NVIDIA announced high-volume deployments of its next-generation platform across global cloud data centers...",
    "publisher": "Reuters Financial Wire",
    "url": "https://www.reuters.com/technology/nvidia-next-gen-ai-silicon-2026"
  },
  "metrics": {
    "rsi14": 58.4,
    "cmf": 0.185,
    "vwap": 173.20,
    "aiConviction": 84.0
  }
}
```

### Request Headers
- `Content-Type: application/json`
- `Accept: application/json`
- `User-Agent: FinDashIQ-Webhook-Dispatcher/4.20`
- `X-FinDashIQ-Event: QUANT_SIGNAL_TRIGGER`

---

### Example Webhook Receivers

#### Python (Flask / FastAPI)
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/trading/webhook', methods=['POST'])
def receive_signal():
    payload = request.get_json()
    ticker = payload.get('ticker')
    signal_name = payload.get('signalName')
    news = payload.get('news')
    
    print(f"[FinDashIQ Signal] {ticker}: {signal_name}")
    if news:
        print(f"📰 Breaking News: {news.get('headline')} ({news.get('url')})")
    
    # Execute order or trigger broker API (e.g. Interactive Brokers, Alpaca)
    return jsonify({"status": "acknowledged", "ticker": ticker}), 200

if __name__ == '__main__':
    app.run(port=8000)
```

#### Node.js (Express)
```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/trading/webhook', (req, res) => {
    const { ticker, signalName, news, metrics } = req.body;
    console.log(`[Alert] ${ticker}: ${signalName}`);
    
    // Process signal...
    res.status(200).json({ status: 'received', ticker });
});

app.listen(8000, () => console.log('Webhook server listening on port 8000'));
```

---

## 2. Direct SMTP Email & Email Webhook Integration

### Standard SMTP Server Configuration
FinDashIQ can send formatted HTML executive notification memos directly to your inbox. Configure the following environment variables in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=alerts@findashiq.com
```

- When configured, entering your recipient email address (e.g. `trader@firm.com`) will deliver executive signal summaries with direct links to news catalyst articles and technical indicator levels.
- If SMTP credentials are not configured, FinDashIQ logs the message and simulates delivery for testing.

### Integration with Automation Hubs (Zapier, Make, n8n)
- Enter your catch hook endpoint URL (e.g. `https://hooks.zapier.com/hooks/catch/...` or `https://n8n.yourdomain.com/webhook/...`) as the destination target.
- Automatically route notifications to Microsoft Teams, Slack, SMS via Twilio, or Google Sheets trade logs.
