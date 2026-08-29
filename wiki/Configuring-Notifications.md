# 🔔 Configuring the Signal Alerts & Notifications Hub

The **Signal Alerts & Notifications Hub** (Top Tab 3 in FinDashIQ) provides an institutional multi-factor alert engine. It monitors real-time market indicators, AI algorithmic conviction scores, and risk levels, immediately dispatching notifications to your designated trading desk communication channels.

---

## 📋 Table of Contents
1. [Overview & Layout](#1-overview--layout)
2. [Step-by-Step Alert Rule Configuration](#2-step-by-step-alert-rule-configuration)
   - [Target Asset Selection](#a-target-asset-selection)
   - [Quantitative Signal Indicator Types](#b-quantitative-signal-indicator-types)
   - [Evaluation Logic & Thresholds](#c-evaluation-logic--thresholds)
   - [Dispatch Channels & Delivery Destinations](#d-dispatch-channels--delivery-destinations)
3. [Testing & Simulation (Trigger Test Message)](#3-testing--simulation-trigger-test-message)
4. [Managing Active Rules](#4-managing-active-rules)
5. [Live Signal Message Activity Log](#5-live-signal-message-activity-log)
6. [REST API Endpoints](#6-rest-api-endpoints)

---

## 1. Overview & Layout

Navigate to **Top Tab 3: Signal Alerts & Notifications Hub** in the top navigation bar.

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Left Column: Rule Configurator & Active Rules               │ Right Column: Live Activity Stream                          │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 1. Target Asset (Dropdown or Custom Ticker)                 │ Real-Time Signal Activity Log                               │
│ 2. Quantitative Signal Indicator Filter                     │ • Timestamped alert event cards                             │
│ 3. Evaluation Logic & Parameter Threshold                   │ • Status indicators (✔ Delivered)                           │
│ 4. Dispatch Channel (Telegram, Email, Discord, Webhook)     │ • Delivery channels & target tags                           │
│ 5. Live Rule Dispatch Preview Box                           │ • [Trigger Test Message] & [Clear Log] Toolbar              │
│ 6. Action Buttons: [Create Alert] & [Trigger Test Message]  │                                                             │
│                                                             │                                                             │
│ Active Rules Manager: List with Pause, Test, Delete controls│                                                             │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Alert Rule Configuration

### A. Target Asset Selection
1. **Tracked Portfolio Assets**: Select from default watchlist leaders (`NVDA`, `MSFT`, `IFX.DE`, `TSM`, `SPCX`, `EXXT.DE`, `XDWT.DE`) or growth leaders (`AAPL`, `AMZN`, `GOOGL`, `META`, `TSLA`, `AMD`, `PLTR`, `SAP.DE`).
2. **Custom Asset Symbol**: Enter any valid ticker in the **Custom...** input (e.g., `INTC`, `ASML`, `ETH-USD`, `BTC-USD`). Custom entries automatically take precedence over the dropdown.

---

### B. Quantitative Signal Indicator Types

Select your technical or algorithmic trigger from 4 quantitative indicator categories:

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

#### 4. 🧠 Quantitative AI & Risk Execution Levels
| Indicator | Signal Key | Condition Logic | Default Threshold | Description |
| :--- | :--- | :--- | :--- | :--- |
| **AI Conviction Upgrades** | `ai_conviction_high`| Crosses Above (>=) | Conviction Score ≥ 80% | Algorithmic score upgrades to Strong Bullish. |
| **AI Conviction Drops** | `ai_conviction_drop`| Crosses Below (<=) | Conviction Score < 45% | Algorithmic score falls into neutral or defensive zone. |
| **Take-Profit Target 1 (TP1)** | `take_profit_target1`| Reaches Exact Price | TP1 Reached | Asset reaches 1.5x ATR expansion target. |
| **Volatility Stop-Loss (SL)** | `stop_loss_breach` | Crosses Below (<=) | Stop-Loss Breached | Asset breaches dynamic volatility stop-loss boundary. |
| **Intraday Volatility Spike** | `daily_spike_pct` | Crosses Above (>=) | Daily Change > +3.5% | Abnormal single-day upside price spike. |
| **Intraday Volatility Drop** | `daily_drop_pct` | Crosses Below (<=) | Daily Change < -3.5% | Abnormal single-day downside price drop. |

---

### C. Evaluation Logic & Thresholds
- **Evaluation Logic**:
  - `direction_flip`: State transitions (e.g., Bearish ➔ Bullish flip).
  - `crosses_above`: Quantitative value rises above the numeric barrier (`>=`).
  - `crosses_below`: Quantitative value falls below the numeric barrier (`<=`).
  - `reaches_level`: Asset price tags an exact dollar level (`$`).
- **Trigger Threshold Parameter**: Free-text parameter providing customized context (e.g., `RSI < 28.5`, `Breakout > $210.00`, `Strong Bullish 85%`).

---

### D. Dispatch Channels & Delivery Destinations

| Dispatch Channel | Input Label | Example Target Format | Delivery Description |
| :--- | :--- | :--- | :--- |
| **📱 Telegram Bot** | Telegram Chat ID / Username | `@quant_desk` or `123456789` | Sends markdown alert to Telegram Bot chat/group. |
| **📧 Email Webhook** | Recipient Email Address | `trader@firm.com` | Dispatches structured HTML memo to recipient email. |
| **💬 Discord Webhook** | Discord Webhook URL | `https://discord.com/api/webhooks/...` | Pushes rich embed cards into Discord trading channels. |
| **🔔 Browser Push** | Notification Sound/Priority | *High Priority • Audio Chime* | Plays real-time in-app chime & desktop push notifications. |
| **🌐 Custom API Webhook**| HTTP Endpoint URL (JSON POST) | `https://api.yourdomain.com/signals` | Sends raw JSON payload to trading bot or listener. |

---

## 3. Testing & Simulation (Trigger Test Message)

You can verify that your notification channels and formatting work before waiting for live market events.

### Option 1: Direct Form Test Trigger
1. Configure your desired ticker, indicator, threshold, channel, and destination in the form.
2. Click **"Trigger Test Message"** (purple button next to *Create Signal Alert Trigger*).
3. FinDashIQ will immediately:
   - Construct a simulated quantitative trigger payload.
   - Send it through the `/api/alerts/test-trigger` endpoint.
   - Insert a live delivery card at the top of the **Live Signal Message Activity Log**.

### Option 2: Active Rule Test Button
1. Look at the **Active Signal Trigger Rules** card.
2. Click the **"Test"** button with the paper plane icon (`✈ Test`) on any active rule card.
3. The simulated trigger will be dispatched using that exact rule's parameters.

### Option 3: Activity Log Toolbar Quick Test
1. Click **"Trigger Test Message"** located in the header of the *Live Signal Message Activity Log*.

---

## 4. Managing Active Rules

The **Active Signal Trigger Rules** card displays all saved rules persisted in `data/alerts.json`.

- **Pause / Resume**: Click **"Pause"** to temporarily disable monitoring without losing configuration. Click **"Enable"** to reactivate.
- **Test**: Dispatches a test trigger event immediately.
- **Delete**: Permanently removes the rule from server storage.
- **Rule Count Badge**: Shows total number of active rules.

---

## 5. Live Signal Message Activity Log

The right column displays the real-time stream of all incoming, simulated, and triggered signal messages:

- **Header Tag**: Shows the asset symbol and signal category (e.g. `NVDA • SUPERTREND` or `MSFT • SIMULATED TRIGGER`).
- **Timestamp**: Time of signal detection or simulation.
- **Title & Summary**: Algorithmic rationale including key indicators, CMF values, and price targets.
- **Delivery Badge**: Confirms destination channel and target (`✔ Delivered Successfully`).
- **Clear Log**: Resets the current session activity log view.

---

## 6. REST API Endpoints

You can also manage notifications programmatically via REST API:

### `GET /api/alerts`
Retrieves all configured alert rules for the current session.
```json
{
  "alerts": [
    {
      "id": "alert-1710000000000",
      "ticker": "NVDA",
      "signalType": "supertrend_bull",
      "signalName": "SuperTrend Direction Flip ➔ Bullish Uptrend",
      "category": "Trend & Volatility",
      "condition": "direction_flip",
      "threshold": "Bullish Uptrend Confirmation",
      "channel": "Telegram Bot",
      "channelTarget": "@quant_desk",
      "active": true
    }
  ]
}
```

### `POST /api/alerts`
Creates and stores a new alert rule.
```json
{
  "ticker": "PLTR",
  "signalType": "rsi_oversold",
  "signalName": "RSI (14) Deep Oversold (RSI < 30.0)",
  "category": "Momentum & Oscillators",
  "condition": "crosses_below",
  "threshold": "RSI < 30.0",
  "channel": "Discord Webhook",
  "channelTarget": "https://discord.com/api/webhooks/..."
}
```

### `PATCH /api/alerts/<alert_id>`
Enables or pauses an existing rule.
```json
{
  "active": false
}
```

### `DELETE /api/alerts/<alert_id>`
Deletes the specified rule.

### `POST /api/alerts/test-trigger`
Dispatches a simulated trigger notification.
```json
{
  "ticker": "NVDA",
  "signalName": "SuperTrend Bullish Flip",
  "channel": "Telegram Bot",
  "threshold": "Bullish Uptrend Confirmation",
  "channelTarget": "@quant_desk"
}
```
Response:
```json
{
  "success": true,
  "notification": {
    "id": "msg-1710000000",
    "timestamp": "2026-08-23 22:35:00",
    "ticker": "NVDA",
    "signalType": "SuperTrend Bullish Flip",
    "channel": "Telegram Bot",
    "channelTarget": "@quant_desk",
    "title": "🚨 NVDA Signal Triggered: SuperTrend Bullish Flip",
    "message": "Quantitative Multi-Factor Engine triggered condition [Bullish Uptrend Confirmation] for NVDA...",
    "status": "Delivered"
  }
}
```
