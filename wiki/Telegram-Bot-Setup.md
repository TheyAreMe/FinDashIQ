# 📱 Telegram Bot Integration Guide

This guide details how to configure Telegram Bots in FinDashIQ for real-time quantitative signal alerts, portfolio-wide watchlist notifications, and breaking news catalysts across all destination types (Private DMs, Public Channels, and Private Groups).

---

## 🔑 Prerequisite: Create Bot & Set Token in `.env`

1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Send `/newbot` and follow the prompts:
   - **Display Name**: e.g. `FinDashIQ Quant Bot`
   - **Bot Username** (must end in `bot`): e.g. `FinDashIQ_bot`
3. `@BotFather` will provide your **Bot API Token** (e.g. `<TOKEN>`).
4. Paste the token into your [.env](file:///c:/Users/Handyman%20Jack/Repositories/somedayv3/.env) file:
   ```env
   TELEGRAM_BOT_TOKEN=<TOKEN>
   ```

---

## 🎯 Delivery Destination Methods

Select the method below matching where you want alerts delivered:

### 👤 Method A: Direct Private Messages (DMs to You)
*Best for personal trading alerts delivered directly to your Telegram inbox.*

1. **Grant Permission**: In Telegram, open a chat with your bot (e.g. `@FinDashIQ_bot`) and tap **"Start"** (or send `hello`).
2. **Find Your Chat ID** (choose one):
   - **Option 1 (Auto-Detect — Recommended)**: In FinDashIQ Destination, type `auto` (or leave blank). FinDashIQ will automatically discover your Chat ID from Telegram.
   - **Option 2 (Direct Browser Check)**: Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` and look for `"id": 987654321`.
   - **Option 3 (ID Bot)**: Message `@raw_data_bot` or `@myidbot` to see your numeric User ID (e.g. `987654321`).
3. **In FinDashIQ**: Enter `auto` or your numeric Chat ID (e.g. `987654321`), then click **"Trigger Test Message"**.

---

### 📢 Method B: Public Channels & Public Groups (e.g. `@FinDashIQ`)
*Best for public trading desks, announcement channels, or shared communities with a `@public_handle`.*

> **⚠️ Important Requirement**: Telegram ONLY allows addressing groups by `@handle` if the group is set to **Public** in settings.

1. **Set Group to Public**:
   - Open your Telegram Group / Channel.
   - Tap Group Title ➔ **Edit (Pencil)** ➔ **Group Type** (or Channel Type).
   - Change from *Private* to **Public**.
   - Assign a public link/handle (e.g. `FinDashIQ` ➔ `t.me/FinDashIQ`).
2. **Add Bot as Administrator**:
   - Go to Group Settings ➔ **Administrators** ➔ **Add Admin**.
   - Search for your bot (e.g. `@FinDashIQ_bot`) and grant **"Post Messages" / "Send Messages"** permissions.
3. **In FinDashIQ**:
   - Destination: Enter `@FinDashIQ` (or your public handle).
   - Click **"Trigger Test Message"**.

---

### 🔒 Method C: Private Groups & Private Supergroups
*Best for private mastermind groups without a public `@handle`.*

1. **Add Bot as Administrator**:
   - In your private group, add `@FinDashIQ_bot` as an Administrator with *Send Messages* permission.
2. **Register Group via Command**:
   - In the group chat, send:
     ```text
     /test @FinDashIQ_bot
     ```
3. **In FinDashIQ**:
   - Enter `auto` (or the negative group ID like `-1002345678901`).
   - Click **"Trigger Test Message"** — FinDashIQ will detect the private group and deliver the alert!

---

## 📋 Quick Reference Table

| Target Location | Prerequisites in Telegram | FinDashIQ Destination Input |
| :--- | :--- | :--- |
| **Personal DM** | Tap **Start** on `@FinDashIQ_bot` | `auto` or numeric ID `987654321` |
| **Public Channel / Group** | Set group to **Public** + Bot is **Admin** | `@FinDashIQ` (public handle) |
| **Private Group** | Bot is **Admin** + Send `/test @FinDashIQ_bot` | `auto` or numeric ID `-100...` |
| **Inline (No .env)** | Tap **Start** on bot | `BOT_TOKEN:CHAT_ID` |

---

## 🔍 Troubleshooting

| Error | Cause | Fix |
| :--- | :--- | :--- |
| **`Bad Request: chat not found` (HTTP 400)** | Group is private (does not have public `@handle`), or bot was not added to the channel. | Either change group to **Public** with handle (Method B), or use `auto` / numeric ID (Method C). |
| **`Telegram /start Required`** | Bot was entered as destination (`@FinDashIQ_bot`) or permission was not granted. | Bots cannot message themselves. Tap **Start** on your bot and use `auto` or your Chat ID. |
| **`Unauthorized` (HTTP 401)** | Token in `.env` is invalid or expired. | Copy the active API Token from `@BotFather`. |
