# 🔔 Browser Push & Audio Chime Notifications Guide

This guide explains how FinDashIQ leverages native browser desktop push notifications and the HTML5 Web Audio API to deliver instant, high-priority in-browser signal alerts without third-party dependencies.

---

## 1. How In-App & Desktop Alerts Work

When the `Browser Push` channel is selected for an alert rule:
1. **HTML5 Desktop Notification**: Displays a native operating system notification toast even when FinDashIQ is minimized or running in a background browser tab.
2. **Web Audio API Synthesizer Chime**: Generates an immediate, pleasant dual-tone acoustic chime (`D5` 587Hz ➔ `A5` 880Hz) directly in the browser using the Web Audio API—100% offline, with zero external mp3 files or network latency.
3. **Live Activity Stream Card**: Inserts an interactive alert card into the *Live Signal Message Activity Log* on Top Tab 3.

---

## 2. Enabling Desktop Notifications

1. In FinDashIQ, navigate to **Top Tab 3: Signal Alerts & Notifications Hub**.
2. Select **Dispatch Channel**: `🔔 In-App & Desktop Sound Alert`.
3. In the destination row, click the **"Enable Desktop Alerts"** button.
4. When prompted by your browser, click **Allow / Grant Permission**.
5. Once granted, the button will turn green with `✔ Notifications Active` and play a test chime.

---

## 3. Configuring a Browser Alert Rule

1. **Target Asset**: Select `🌐 ALL WATCHLIST ASSETS` (to monitor your entire portfolio) or pick any specific stock / ETF.
2. **Signal Indicator**: Choose your technical or news trigger (e.g. `🚨 Breaking High-Impact News Event` or `RSI (14) Deep Oversold`).
3. Click **"Trigger Test Message"** to test desktop toast and chime playback.
4. Click **"Create Signal Alert Trigger"** to activate the rule.

---

## 4. Background Tab Behavior

- FinDashIQ maintains active signal evaluation during real-time watchlist refresh intervals.
- If market volatility or a news catalyst triggers while you are in another tab or application, your operating system will display the notification and play the synthesized audio alert.
