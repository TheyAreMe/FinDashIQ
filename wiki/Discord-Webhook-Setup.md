# 💬 Discord Webhook Integration Guide

This guide explains how to push real-time technical breakout, portfolio-wide watchlist alerts, and breaking news catalysts directly into your Discord trading channels.

---

## 1. Create a Discord Webhook

1. Open Discord and select the channel where you want to receive alerts (e.g. `#quant-signals` or `#breaking-news`).
2. Click the gear icon next to the channel name to open **Channel Settings**.
3. Navigate to **Integrations ➔ Webhooks ➔ New Webhook**.
4. Set the name to `FinDashIQ Quant Bot` and click **Copy Webhook URL** (e.g. `https://discord.com/api/webhooks/1234567890/abcXYZ123...`).

---

## 2. Configure in FinDashIQ

1. In FinDashIQ, go to **Top Tab 3: Signal Alerts & Notifications Hub**.
2. **Target Asset**: Select `🌐 ALL WATCHLIST ASSETS` (Portfolio-Wide Global Monitor) or pick any specific stock / ETF.
3. **Indicator**: Select your technical indicator or catalyst wire (e.g., `Bollinger Bands Upper Breakout`, `RSI Deep Oversold`, or `🚨 Breaking High-Impact News Event`).
4. **Dispatch Channel**: Select `💬 Discord Trading Channel Webhook`.
5. **Destination Field**: Paste your Discord Webhook URL.
6. Click **"Trigger Test Message"** to dispatch a live embed into your Discord channel.
7. Click **"Create Signal Alert Trigger"** to activate the rule.

---

## 3. Discord Embed Color Coding

FinDashIQ automatically color-codes message embeds dispatched to Discord:
- 🟢 **Green (`#10B981`)**: Bullish flips, Golden Crosses, Oversold bounces, and Money Flow Inflows.
- 🔴 **Red (`#EF4444`)**: Bearish flips, Death Crosses, Overbought exhaustion, and Stop-Loss breaches.
- 🟣 **Purple (`#8B5CF6`)**: Breaking News Catalysts, Earnings Beats, and AI Conviction Updates.
