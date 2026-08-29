# 📱 Telegram Bot Integration Guide

This guide walks you through setting up a Telegram Bot to receive real-time quantitative signal alerts from FinDashIQ.

---

## 1. Create a Telegram Bot

1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Start a chat and send the command `/newbot`.
3. Choose a name (e.g. `FinDashIQ Alert Bot`) and a unique username ending in `bot` (e.g. `findashiq_signals_bot`).
4. `@BotFather` will provide you with a **Bot API Token** (e.g. `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).

---

## 2. Obtain Your Chat ID or Channel Username

### For Private Messages:
1. Start a chat with your new bot by searching for its `@username` and clicking **Start**.
2. Search for **[@userinfobot](https://t.me/userinfobot)** or **[@getidsbot](https://t.me/getidsbot)** and send any message to find your numeric **User ID** (e.g., `987654321`).
3. Alternatively, use your Telegram `@username` (e.g., `@quant_trader`).

### For Group Chats or Channels:
1. Add your bot to your trading group or channel.
2. Grant the bot permission to **Post Messages**.
3. Use the public channel `@handle` (e.g., `@quant_desk`) or the private group Chat ID (e.g., `-1001234567890`).

---

## 3. Configure in FinDashIQ

1. Open FinDashIQ and navigate to **Top Tab 3: Signal Alerts & Notifications Hub**.
2. Under **Dispatch Channel & Delivery Destination**, select:
   - **Dispatch Channel**: `📱 Telegram Bot & Push Notification`
   - **Telegram Chat ID / Username**: Enter `@quant_desk` or your numeric ID `987654321`.
3. Select your target asset and technical signal.
4. Click **"Trigger Test Message"** to verify that the dispatch preview and activity log record the delivery.
5. Click **"Create Signal Alert Trigger"** to activate the rule.
