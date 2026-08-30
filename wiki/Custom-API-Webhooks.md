# 🌐 Custom REST API Webhooks Integration Guide

FinDashIQ provides standard HTTP JSON POST webhook dispatch capabilities, allowing seamless integration with custom backend trading bots, execution algorithms, microservices, and automation platforms (n8n, Zapier, Make).

---

## 1. Webhook Execution Flow

Whenever a quantitative trigger fires or is simulated via the test button:
1. FinDashIQ constructs a standardized JSON payload containing the event, asset symbol, signal parameters, catalyst news, and multi-factor metrics.
2. The server dispatches an HTTP `POST` request to your designated endpoint with a 5-second timeout.
3. The server checks the response HTTP status code (`200 OK`, `201 Created`, `400`, `500`) and reports the exact delivery status back to the frontend activity stream.

---

## 2. Standard JSON Payload Schema

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
    "headline": "NVIDIA Unveils Next-Gen AI Silicon Architecture",
    "summary": "Major cloud data centers expand high-volume silicon deployments...",
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

## 3. Webhook Receiver Examples

### Python (FastAPI / Flask)
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/trading/webhook', methods=['POST'])
def handle_signal_alert():
    payload = request.get_json()
    ticker = payload.get('ticker')
    signal_name = payload.get('signalName')
    news = payload.get('news')
    
    print(f"[FinDashIQ Signal Alert] {ticker}: {signal_name}")
    if news:
        print(f"📰 Headline: {news.get('headline')} | Link: {news.get('url')}")
    
    # Execute downstream order (e.g. via Interactive Brokers, Alpaca API)
    return jsonify({"status": "acknowledged", "ticker": ticker}), 200

if __name__ == '__main__':
    app.run(port=8000)
```

### Node.js (Express)
```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/trading/webhook', (req, res) => {
    const { ticker, signalName, news, metrics } = req.body;
    console.log(`[Alert] ${ticker}: ${signalName}`);
    
    // Execute trade or alert downstream service...
    res.status(200).json({ status: 'received', ticker });
});

app.listen(8000, () => console.log('Webhook server running on port 8000'));
```

---

## 4. Automation Hubs (Zapier, Make.com, n8n)

1. Create a **Webhook / Catch Hook** trigger in your automation workspace.
2. Copy the generated Webhook URL (e.g. `https://hooks.zapier.com/hooks/catch/...`).
3. Paste the URL into the **HTTP Endpoint URL** field in FinDashIQ.
4. Click **Trigger Test Message** to send sample data for visual field mapping.
