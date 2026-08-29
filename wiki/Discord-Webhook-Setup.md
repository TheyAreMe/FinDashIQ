# 💬 Discord Webhook Integration Guide

This guide explains how to push real-time technical breakout and quantitative indicator alerts into your Discord trading channels.

---

## 1. Create a Discord Webhook

1. Open your Discord server and navigate to the channel where you want to receive alerts (e.g. `#trading-signals`).
2. Click the gear icon next to the channel name to open **Channel Settings**.
3. Select **Integrations** from the left sidebar.
4. Click **Webhooks** ➔ **New Webhook**.
5. Set the bot name to `FinDashIQ AI Desk` and select your target channel.
6. Click **Copy Webhook URL** (e.g. `https://discord.com/api/webhooks/1234567890/abcXYZ123...`).

---

## 2. Configure in FinDashIQ

1. In FinDashIQ, go to **Top Tab 3: Signal Alerts & Notifications Hub**.
2. Under **Dispatch Channel & Delivery Destination**:
   - Select `💬 Discord Trading Channel Webhook`.
   - In **Discord Channel Webhook URL**, paste your copied webhook URL.
3. Choose your asset (e.g., `NVDA`, `TSLA`, `MSFT`) and indicator (e.g., `Bollinger Bands Upper Breakout` or `AI Conviction ≥ 80%`).
4. Click **"Trigger Test Message"** to simulate and verify the signal payload.
5. Click **"Create Signal Alert Trigger"** to save and activate the rule.
