# 🔔 Configuring the Signal Alerts & Notifications Hub

The **Signal Alerts & Notifications Hub** (Top Tab 3 in FinDashIQ) provides an institutional multi-factor alert engine. It monitors real-time market indicators, AI algorithmic conviction scores, volume flows, and breaking news catalysts, immediately dispatching notifications to your designated trading desk communication channels.

---

## 📋 Table of Contents
1. [Overview & Layout](#1-overview--layout)
2. [Step-by-Step Alert Rule Configuration](#2-step-by-step-alert-rule-configuration)
   - [Target Asset Selection (Individual Stock vs. Global Watchlist)](#a-target-asset-selection)
   - [Quantitative Signal Indicator Categories](#b-quantitative-signal-indicator-categories)
   - [Dispatch Channels & Delivery Destinations](#c-dispatch-channels--delivery-destinations)
3. [Channel Setup & Authentication](#3-channel-setup--authentication)
   - [📱 Telegram Bot](#-telegram-bot)
   - [💬 Discord Webhooks](#-discord-webhooks)
   - [🌐 Custom API Webhooks](#-custom-api-webhooks)
   - [📧 Email (SMTP & Webhooks)](#-email-smtp--webhooks)
   - [🔔 Browser Push & Audio Synthesizer](#-browser-push--audio-synthesizer)
4. [Testing & Simulation (Trigger Test Message)](#4-testing--simulation-trigger-test-message)
5. [Managing Active Rules](#5-managing-active-rules)
6. [Live Signal Message Activity Log](#6-live-signal-message-activity-log)
7. [REST API Endpoints](#7-rest-api-endpoints)

---

## 1. Overview & Layout

Navigate to **Top Tab 3: Signal Alerts & Notifications Hub** in the top navigation bar.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔄 Autonomous Background Signal Monitoring Engine                                                         │
│ • Live Pulse & Countdown: 🟢 Active • Auto-Polling | Next check in: 14:45                                │
│ • Interactive Polling Slider: [ 1m ── 5m ── [15m (Def)] ── 1h ── 4h ── 12h ── 24h ]                       │
│ • Controls: [Check Signals Now] (Manual Refresh) | [Pause / Resume] Monitoring                            │
├─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────┤
│ Left Column: Rule Configurator & Active Rules               │ Right Column: Live Activity Stream          │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 1. Target Asset (Global Watchlist or Search Stock)          │ Real-Time Signal Activity Log               │
│ 2. Quantitative Signal Indicator Filter                     │ • Timestamped alert event cards             │
│ 3. Dispatch Channel (Telegram, Discord, Custom, Email, Push)│ • Status indicators (✔ Delivered / HTTP)   │
│ 4. Live Rule Dispatch Preview Box                           │ • Real catalyst headlines & direct links    │
│ 5. Action Buttons: [Create Alert] & [Trigger Test Message]  │ • [Trigger Test Message] & [Clear Log]      │
│                                                             │                                             │
│ Active Rules Manager: List with Pause, Test, Delete controls│                                             │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. Autonomous Background Signal Monitoring & Interval Slider

The **Background Monitoring Engine** continuously recalculates quantitative indicators and scans real-time news wires for all active alert rules (and your entire portfolio watchlist if `*WATCHLIST*` is monitored):

1. **Configurable Polling Slider (1 min to 24 hours)**:
   - Use the slider to pick your desired update frequency: `1m`, `2m`, `5m`, `10m`, `15m (Default Recommended)`, `30m`, `45m`, `1h`, `2h`, `3h`, `4h`, `6h`, `8h`, `12h`, or `24h`.
   - Your choice is automatically persisted across browser reloads.
2. **Live Heartbeat Status & Countdown**:
   - Displays a pulsing live status dot and a real-time countdown timer to the next automated scan.
3. **Manual Instant Scan (`Check Signals Now`)**:
   - Click the button to immediately fetch latest quotes, compute technical indicators, and evaluate news catalysts without waiting for the timer.
4. **Pause / Resume Toggle**:
   - Easily suspend background polling without deleting or deactivating your configured alert rules.
5. **Smart State-Transition Deduplication**:
   - Automatically prevents duplicate notifications with a 30-minute cooldown per unique event.

---

## 2. Step-by-Step Alert Rule Configuration

### A. Target Asset Selection
1. **🌐 ALL WATCHLIST ASSETS (Portfolio-Wide Global Alert)**:
   - Selecting this option sets a global alert across **every stock** in your active watchlist.
   - When any tracked asset triggers the signal (e.g. adverse news, RSI oversold dip, SuperTrend flip), the alert is dispatched immediately for that specific triggering holding.
2. **Tracked Portfolio Assets**: Select any single stock currently in your active watchlist.
3. **Search Stock**: Click the **Search Stock** button to open the global search modal and select any stock, ETF, or company across international exchanges.

---

### B. Quantitative Signal Indicator Categories

Each indicator automatically embeds its condition logic, threshold parameters, and helper descriptions:

#### 1. 📈 Trend & Dynamic Volatility Filters
| Indicator | Signal Key | Condition Logic | Default Threshold | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SuperTrend Bullish Flip** | `supertrend_bull` | Direction / State Flip | Bullish Uptrend Confirmation | Triggers when close crosses above trailing SuperTrend line. |
| **SuperTrend Bearish Breakdown** | `supertrend_bear` | Direction / State Flip | Bearish Breakdown Confirmation | Triggers when price falls below trailing SuperTrend support. |
| **SMA Golden Cross** | `sma_golden_cross` | Direction / State Flip | SMA 50 > SMA 200 | Classic golden cross of 50-day over 200-day moving average. |
| **SMA Death Cross** | `sma_death_cross` | Direction / State Flip | SMA 50 < SMA 200 | Bearish breakdown of 50-day below 200-day moving average. |
| **Bollinger Bands Upper Breakout** | `bollinger_upper` | Crosses Above (>=) | Upper Band Breakout | Price closes above upper 2.0-StdDev band. |
| **Bollinger Bands Lower Reversal** | `bollinger_lower` | Crosses Below (<=) | Lower Band Reversal | Oversold dip breaches below lower 2.0-StdDev band. |

#### 2. ⚡ Momentum & Reversal Oscillators
| Indicator | Signal Key | Condition Logic | Default Threshold | Description |
| :--- | :--- | :--- | :--- | :--- |
| **RSI Deep Oversold** | `rsi_oversold` | Crosses Below (<=) | RSI(14) < 30.0 | Mean-reversion trigger when RSI drops below 30. |
| **RSI Overbought Exhaustion** | `rsi_overbought` | Crosses Above (>=) | RSI(14) > 70.0 | Warning trigger when RSI rises above 70. |
| **MACD Bullish Histogram Cross**| `macd_bull_cross` | Direction / State Flip | MACD Line > Signal Line | Fast MACD Line (12, 26) crosses above 9-period Signal Line. |
| **MACD Bearish Signal Cross** | `macd_bear_cross` | Direction / State Flip | MACD Line < Signal Line | Fast MACD Line drops below 9-period Signal Line. |
| **Stochastic Oscillator Bullish**| `stoch_oversold_cross`| Direction / State Flip | %K crosses %D (< 20) | Fast Stochastic %K crosses %D inside oversold zone. |

#### 3. 🌊 Institutional Volume & Capital Flow
| Indicator | Signal Key | Condition Logic | Default Threshold | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Chaikin Money Flow Inflow** | `cmf_inflow` | Crosses Above (>=) | CMF > +0.15 | Institutional accumulation surge above +0.15. |
| **Chaikin Money Flow Outflow** | `cmf_outflow` | Crosses Below (<=) | CMF < -0.15 | Institutional distribution plunge below -0.15. |
| **Price Crosses Above VWAP** | `vwap_cross_above` | Crosses Above (>=) | Price > Daily VWAP | Intraday breakout above Volume-Weighted Average Price. |
| **Price Drops Below VWAP** | `vwap_cross_below` | Crosses Below (<=) | Price < Daily VWAP | Intraday breakdown below Daily VWAP. |

#### 4. 📰 Breaking News & Catalyst Events
| Indicator | Signal Key | Condition Logic | Default Threshold | Description |
| :--- | :--- | :--- | :--- | :--- |
| **🚨 Breaking News Catalyst** | `news_breaking_catalyst`| news_event | High-Impact Breaking News | Triggers on high-impact breaking news articles with full summary & links. |
| **📈 Bullish Catalyst News** | `news_sentiment_bullish`| sentiment_positive | Sentiment: Bullish Catalyst | Triggers when positive earnings beats or upgraded guidance are published. |
| **📉 Adverse Event Wire** | `news_sentiment_bearish`| sentiment_negative | Sentiment: Bearish / Adverse | Triggers on earnings misses, downgrades, or adverse corporate developments. |
| **🏛️ Tier-1 Publisher Wire** | `news_tier1_source` | tier1_publish | Tier-1 Wire (Reuters/WSJ/Bloomberg)| Triggers on premier news wire publications. |

#### 5. 🧠 Quantitative AI & Risk Execution Levels
| Indicator | Signal Key | Condition Logic | Default Threshold | Description |
| :--- | :--- | :--- | :--- | :--- |
| **AI Conviction Upgrades** | `ai_conviction_high`| Crosses Above (>=) | Conviction Score ≥ 80% | Algorithmic score upgrades to Strong Bullish. |
| **AI Conviction Drops** | `ai_conviction_drop`| Crosses Below (<=) | Conviction Score < 45% | Algorithmic score falls into neutral or defensive zone. |
| **Take-Profit Target 1 (TP1)** | `take_profit_target1`| Reaches Exact Price | TP1 Reached | Asset reaches 1.5x ATR expansion target. |
| **Volatility Stop-Loss (SL)** | `stop_loss_breach` | Crosses Below (<=) | Stop-Loss Breached | Asset breaches dynamic volatility stop-loss boundary. |
| **Intraday Volatility Spike** | `daily_spike_pct` | Crosses Above (>=) | Daily Change > +3.5% | Abnormal single-day upside price spike. |
| **Intraday Volatility Drop** | `daily_drop_pct` | Crosses Below (<=) | Daily Change < -3.5% | Abnormal single-day downside price drop. |

---

### C. Dispatch Channels & Delivery Destinations

| Dispatch Channel | Target Input Example | Action & Protocol |
| :--- | :--- | :--- |
| **📱 Telegram Bot** | `@quant_desk` or `987654321` | Dispatches markdown message via Telegram Bot API or webhook URL. |
| **💬 Discord Webhook** | `https://discord.com/api/webhooks/...` | Dispatches rich colored embed card with catalyst links directly to Discord. |
| **🌐 Custom API Webhook**| `https://api.domain.com/trading/webhook` | Dispatches standard JSON POST payload to any HTTP endpoint or trading bot. |
| **📧 Email Webhook** | `trader@example.com` | Dispatches structured HTML executive memo via SMTP server or webhook. |
| **🔔 Browser Push** | *High Priority • Audio Synthesizer* | Plays native dual-tone audio chime and triggers desktop notification. |

---

## 3. Channel Setup & Authentication

### 📱 Telegram Bot
- Set `TELEGRAM_BOT_TOKEN=123456789:ABCdef...` in your `.env` file for direct live messaging to any `@username` or numerical Chat ID.
- Alternatively, provide a full webhook URL in the target field: `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>`.

### 💬 Discord Webhooks
- In Discord, go to **Server Settings ➔ Integrations ➔ Webhooks ➔ New Webhook**.
- Copy the Webhook URL and paste it into the destination input.
- FinDashIQ sends formatted embeds color-coded by market sentiment (Green for Bullish, Red for Bearish, Purple for Catalysts).

### 🌐 Custom API Webhooks
- Standard JSON payload format:
```json
{
  "event": "QUANT_SIGNAL_TRIGGER",
  "timestamp": "2026-08-30T10:35:00Z",
  "ticker": "NVDA",
  "signalName": "SuperTrend Direction Flip ➔ Bullish Uptrend",
  "category": "Trend & Volatility",
  "threshold": "Bullish Uptrend Confirmation",
  "title": "🚨 NVDA Signal Triggered: SuperTrend Bullish Flip",
  "message": "...",
  "news": {
    "headline": "...",
    "summary": "...",
    "publisher": "...",
    "url": "..."
  }
}
```

### 📧 Email (SMTP & Webhooks)
- Configure standard SMTP variables in `.env`:
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=your_email@gmail.com`
  - `SMTP_PASSWORD=your_app_password`
  - `SMTP_FROM=alerts@findashiq.com`
- If no SMTP credentials are configured, simulated delivery is recorded in the activity stream.

### 🔔 Browser Push & Audio Synthesizer
- Click the **"Enable Desktop Alerts"** button to grant HTML5 desktop notification permissions.
- When an alert triggers, FinDashIQ synthesizes a dual-tone audio chime via the HTML5 Web Audio API and fires a desktop notification.

---

## 4. Testing & Simulation (Trigger Test Message)

You can verify that your notification channels and formatting work before waiting for live market events:
- Click **"Test"** on the configurator or any active rule.
- FinDashIQ immediately executes the dispatch and reports the actual delivery status (`✔ Delivered (HTTP 200 OK)`, `✔ Delivered to Telegram`, `⚠ Webhook Error 404`, etc.) in the Live Activity Stream.

---

## 5. REST API Endpoints

### `GET /api/alerts`
Returns list of configured alert rules.

### `POST /api/alerts`
Create a new alert rule. Set `ticker: "*WATCHLIST*"` for portfolio-wide monitoring.

### `POST /api/alerts/test-trigger`
Dispatches a test notification and returns delivery status report.
