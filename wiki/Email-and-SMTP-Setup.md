# 📧 Email (SMTP & Webhook) Notification Guide

This guide walks you through configuring direct SMTP email delivery and email webhook dispatch in FinDashIQ.

---

## 1. Direct SMTP Server Configuration

FinDashIQ features a built-in SMTP delivery client capable of dispatching formatted HTML executive memos directly to your email inbox whenever a market signal or breaking news catalyst triggers.

### Environment Variables (`.env`)
Configure the following standard SMTP credentials in your project root `.env` file:

```env
# Outbound SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=alerts@findashiq.com
```

> **Note for Gmail Users**: Use an **App Password** generated from your Google Account Security settings rather than your regular account password.

---

## 2. Configure Email Alert in FinDashIQ

1. In FinDashIQ, navigate to **Top Tab 3: Signal Alerts & Notifications Hub**.
2. **Target Asset**: Select `🌐 ALL WATCHLIST ASSETS` (Portfolio-Wide Global Monitor) or choose a specific stock.
3. **Signal Indicator**: Select your technical trigger (e.g. `SuperTrend Direction Flip`, `RSI Deep Oversold`, or `🚨 Breaking High-Impact News Event`).
4. **Dispatch Channel**: Select `📧 Email Notification (SMTP / Webhook)`.
5. **Destination Field**: Enter your recipient email address (e.g. `trader@yourdomain.com`).
6. Click **"Trigger Test Message"** to test live SMTP delivery or verify formatting.
7. Click **"Create Signal Alert Trigger"** to activate the rule.

---

## 3. Executive HTML Memo Features

Dispatched emails include:
- 📊 **Asset Symbol & Company Name**: Highlighted with technical indicator state.
- 🎯 **Signal Trigger & Condition**: Clear explanation of the algorithmic condition reached.
- 📰 **Breaking Catalyst Details**: Full news headlines, publisher wire credit, and direct article links for catalyst events.
- 🕒 **Timestamp & Execution Bias**: Real-time market context for rapid decision making.

---

## 4. Email Webhooks & Automation Hubs (Zapier, Make, n8n)

If you prefer to route email alerts through third-party services:
- Enter your catch hook endpoint URL (e.g. `https://hooks.zapier.com/hooks/catch/...` or `https://n8n.yourdomain.com/webhook/...`) in the destination field.
- FinDashIQ will dispatch the alert as an HTTP JSON POST payload for instant routing to Microsoft Teams, Slack, or SMS via Twilio.
