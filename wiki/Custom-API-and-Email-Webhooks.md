# 🌐 Custom API & Email Webhook Integration Guide

FinDashIQ supports automated dispatch to custom backend APIs, automated algorithmic execution bots, and email webhook endpoints.

---

## 1. Custom HTTP JSON POST Webhooks

When using the `Custom API Webhook` channel, FinDashIQ dispatches standard HTTP `POST` requests with a `Content-Type: application/json` payload to your specified endpoint whenever a trigger fires.

### Standard JSON Payload Schema
```json
{
  "event": "QUANT_SIGNAL_TRIGGER",
  "timestamp": "2026-08-23T20:30:00Z",
  "alertId": "alert-1710000000",
  "ticker": "NVDA",
  "signal": {
    "key": "supertrend_bull",
    "name": "SuperTrend Direction Flip ➔ Bullish Uptrend",
    "category": "Trend & Volatility",
    "condition": "direction_flip",
    "threshold": "Bullish Uptrend Confirmation"
  },
  "metrics": {
    "price": 175.40,
    "rsi14": 58.4,
    "cmf": 0.185,
    "vwap": 173.20,
    "aiConviction": 84.0
  },
  "channel": "Custom API Webhook",
  "destination": "https://api.yourdomain.com/trading/webhook"
}
```

### Example Webhook Receiver (Python / Flask)
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/trading/webhook', methods=['POST'])
def receive_signal():
    data = request.get_json()
    ticker = data.get('ticker')
    signal_name = data.get('signal', {}).get('name')
    print(f"[FinDashIQ Alert] {ticker}: {signal_name}")
    
    # Execute order or trigger downstream workflow (e.g. IBKR, Alpaca)
    return jsonify({"status": "acknowledged", "ticker": ticker}), 200

if __name__ == '__main__':
    app.run(port=8000)
```

---

## 2. Email Webhook Integration

### Standard Direct Email Configuration
1. In the **Dispatch Channel** dropdown, select `📧 Email Notification Webhook`.
2. In the **Destination Recipient Email Address** field, enter your email (e.g. `trader@example.com`).
3. Dispatched notifications include executive signal memos with technical catalyst details, key support/resistance boundaries, and AI conviction scores.

### Integration with Automation Hubs (Zapier, Make, n8n)
- Point the Custom API Webhook or Email Webhook to a catch hook on **n8n**, **Zapier**, or **Make.com** to automatically route alerts into Microsoft Teams, Slack, SMS via Twilio, or Google Sheets trade logs.
