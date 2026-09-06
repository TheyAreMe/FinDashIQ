# ⚡ FinDashIQ

**Self-Hosted Financial Intelligence, Watchlist Hub, Quantitative Terminal & Backtesting Studio**

> ⚠️ **Primary Purpose & Disclaimer**: FinDashIQ is designed primarily as a **self-hosted, private personal financial dashboard with artificial intelligence for private usage**. This platform is developed strictly for personal utility, educational exploration, and quantitative market research. **No liability or responsibility is assumed** for any financial, trading, or investment decisions, outcomes, losses, or software inaccuracies. Always perform your own due diligence.

<details>
  <summary><b>🌙 Dark Mode (Default)</b> <i>(Click to collapse / expand)</i></summary>
  <p align="center">
    <img src="static/img/dashboard_dark.png?v=3.0" alt="FinDashIQ Dashboard - Dark Mode" width="100%">
  </p>
</details>

<details>
  <summary><b>☀️ Bright Mode</b> <i>(Click to expand / switch)</i></summary>
  <p align="center">
    <img src="static/img/dashboard_light.png?v=3.0" alt="FinDashIQ Dashboard - Bright Mode" width="100%">
  </p>
</details>

FinDashIQ provides a privacy-first, sovereign, web-based financial analytics terminal that combines multi-factor quantitative indicators, persistent watchlist intelligence, institutional strategy backtesting, autonomous stock scanning, multi-source financial news aggregation, automated AI investment synthesis, and real-time signal change notification rules. Built with a modular Python/Flask backend and a sleek glassmorphism frontend powered by ApexCharts and Lucide Icons.

---

## 🌟 Key Architecture & Features

### 1. 📊 Watchlist & Market Intelligence Hub (Tab 1)

<p align="center">
  <img src="static/img/tab_watchlist.png?v=3.0" alt="Watchlist & Market Intelligence Hub" width="100%">
</p>

* **Persistent Server-Side Storage**: Tracked stocks and ETF baskets survive browser cache clears (`data/watchlist.json`).
* **Live Quotes & Sparklines**: Real-time pricing, 1-day change deltas, 52-week price ranges, and 30-day SVG trend sparklines.
* **AI Conviction & Multi-Source Synthesis**: Quant momentum scoring (0–100%) paired with live multi-source breaking news catalyst synthesis.
* **Quantitative Multi-Factor Indicators**: At-a-glance status for SuperTrend, RSI(14), Chaikin Money Flow (CMF), and Volume-Weighted Average Price (VWAP).
* **Multi-Currency & Forex Engine**: Real-time price and capital conversion across USD, EUR, GBP, CHF, JPY, CAD, AUD, and NOK.
* **1-Click Deep-Dive & Backtest Routing**: Direct navigation into technical analysis or backtesting studio for any tracked asset.

---

### 2. 🛰️ Autonomous Stock Scanner (Tab 2)

<p align="center">
  <img src="static/img/tab_scanner.png?v=3.0" alt="Autonomous Stock Scanner" width="100%">
</p>

* **Autonomous Background Screening**: Background engine screens 280+ global equities on configurable schedules without frontend dependencies.
* **Multi-Market & Thematic Presets**: Screen by region (US, Europe, Asia, Clean Energy), sector, and parent ETF baskets (SPY, QQQ, SMH, etc.).
* **High-Conviction Opportunity Setups**: Immediate filtering for elite asymmetric setups (≥ 85% conviction) with automated entry zones and stop-loss levels.
* **Smart Delta Caching & Timezone Sync**: Fast delta updates and "Last Scan / Next Due" countdown timers formatted in your local browser timezone.

---

### 3. 🔍 Stock Deep-Dive & Quantitative Terminal (Tab 3)

<p align="center">
  <img src="static/img/tab_deepdive.png?v=3.0" alt="Stock Deep-Dive & Quantitative Terminal" width="100%">
</p>

* **AI Intelligence & Execution Copilot**: Execution matrix (entry zone, volatility stop-loss, take-profit targets), 30-day probabilistic scenarios, and interactive AI market copilot.
* **Dynamic Interactive Charts & Oscillators**: Candlestick & area charts powered by ApexCharts with SuperTrend, VWAP, Bollinger Bands, and synchronized sub-panels for RSI, MACD, Stochastic, and CMF.
* **Consensus Verdict & Valuation Multiples**: Algorithmic multi-factor signal consensus meter (*Strong Buy* to *Strong Sell*), valuation metrics (P/E, Forward P/E, Div Yield, Beta), and 52-week ranges.
* **Breaking News & Catalyst Wire**: Multi-source financial news aggregation with automatic English translation and SWR caching.

---

### 4. 📈 Quantitative Backtesting Studio (Tab 4)

<p align="center">
  <img src="static/img/tab_backtest.png?v=3.0" alt="Quantitative Backtesting Studio" width="100%">
</p>

* **Dual-Pane Interactive Equity Curve**: Plot algorithmic strategy equity growth against the Buy & Hold benchmark with dynamic net return, peak-to-trough drawdown curves, and visual Buy/Sell order markers.
* **Multi-Strategy Model Engine**: Instant 0ms simulation across 9 algorithmic models:
  - 🧠 **Multi-Factor Omni Consensus**: Dynamic synthesis of 9 quantitative momentum, volatility, and volume indicators.
  - 🌊 **SuperTrend Momentum Alpha**: ATR-based trend following and directional volatility breakout strategy.
  - ⚡ **Momentum & Volatility Band Expansion**: Donchian/Bollinger upper breakout entry with momentum trailing stops.
  - 🎯 **RSI Dynamic Mean-Reversion**: Multi-stage oversold bounce strategy with volatility filters.
  - 🔄 **MACD Trend Crossover**: Fast/Slow EMA histogram cross with 50-day moving average trend confirmation.
  - 🌪️ **Bollinger Mean-Reversion**: Statistical 2.0-sigma band rebound strategy.
  - 💎 **Volume-Weighted VWAP Pullback**: Intraday and daily volume-anchored dip buying in primary uptrends.
  - 🛡️ **Triple EMA Trend Ribbon**: 9 / 21 / 55 EMA alignment momentum engine.
  - 📊 **Stochastic + RSI Dual Exhaustion**: Dual-oscillator reversal filter for high-probability pivot points.
* **Institutional Risk Controls**: Configurable starting capital, hard/trailing stop-loss %, take-profit target %, slippage rate (0.00% to 1.00%), and execution modes (*Long-Only* spot vs. *Long & Short* derivatives).
* **Comprehensive Performance Metrics**: Real-time calculation of Strategy Return %, Benchmark Return %, Alpha %, Sharpe Ratio, Sortino Ratio, Profit Factor, Win Rate %, Total Closed Trades, and Max Drawdown %.
* **Detailed Trade Log & Audit Ledger**: Full table of historical entries, exits, holding durations, execution prices, net profit/loss per trade, and exit triggers (Take-Profit, Stop-Loss, Signal Flip).
* **Zero-Latency In-Memory Slicing**: Instant switching across timeframes (`1mo`, `3mo`, `6mo`, `1y`, `2y`, `3y`, `5y`, `MAX`) directly from pre-hydrated local cache.

---

### 5. 🔔 Signal Alerts & Notifications Hub (Tab 5)

<p align="center">
  <img src="static/img/tab_alerts.png?v=3.0" alt="Signal Alerts & Notifications Hub" width="100%">
</p>

* **Multi-Factor Trigger Rules**: Alerts based on SuperTrend flips, AI conviction shifts, MACD crosses, RSI oversold/overbought, or target price breaches.
* **Global Watchlist Monitoring**: Use `*WATCHLIST*` to automatically monitor every asset on your personal or global watchlist with a single rule.
* **Omnichannel Delivery**: Automated dispatch via Telegram Bot, Discord Webhooks, Email (SMTP), or Browser Push Notifications.
* **Simulator & Activity Ledger**: One-click test button to verify webhook delivery and review real-time notification dispatch history.

---

### 6. 👤 Role-Based Authentication & Multi-User Support

* **Administrator & User Roles**: Role-based access control with separate permissions and user directory management.
* **Per-User Isolation**: Watchlists, alert rules, custom paper trades, and visual theme preferences (Dark 🌙 / Bright ☀️) are strictly isolated per account.
* **Bring-Your-Own-Key (BYOK)**: Secure in-app AI settings supporting custom Google Gemini and OpenAI API keys.

---

## 📁 Modular Project Structure

```
FinDashIQ/
├── app.py                         # Flask backend, REST API routes, auth & startup pre-hydration
├── requirements.txt               # Python dependencies
├── data/
│   ├── users.json                 # Role-based user accounts & hashed credentials
│   ├── watchlist.json             # Persistent server-side watchlist configuration
│   ├── alerts.json                # Persistent signal alert rules & notification history
│   ├── paper_trades.json          # Persistent paper trading portfolios
│   └── cache/                     # Server-side historical market data & news cache
├── services/
│   ├── stock_service.py           # Quotes, indicators, pre-hydration daemon, delta download & cache
│   ├── ai_service.py              # Gemini synthesis, scenario modeling & Copilot chat
│   ├── scanner_service.py         # Autonomous quantitative screening engine & universe filters
│   ├── notification_service.py    # Multi-channel dispatcher (Telegram, Discord, Email, Webhooks)
│   ├── currency_service.py        # Multi-currency forex conversion rates & caching
│   ├── news_service.py            # Global multi-source breaking news aggregator & translator
│   └── update_service.py          # GitHub release version checks & updater
├── static/
│   ├── css/
│   │   └── style.css              # Modern dark/bright glassmorphism theme & responsive layouts
│   ├── img/                       # Dashboard screenshots & UI assets
│   └── js/
│       └── app.js                 # Client state, Backtesting engine, ApexCharts & UI renderers
└── templates/
    ├── index.html                 # Master layout container
    ├── components/
    │   ├── header.html            # Interactive brand logo, status badge & user profile menu
    │   ├── top_nav.html           # Top-level 5-tab navigation bar
    │   ├── footer.html            # Footer branding, versioning, Impressum & creator badges
    │   ├── search_bar.html        # Terminal ticker search input and quick preset watchlists
    │   ├── stock_header.html      # Multi-stock selector tabs & hero quote card
    │   ├── nav_tabs.html          # Deep-Dive sub-tab navigation bar
    │   ├── ai_modal.html          # AI Provider (Gemini / OpenAI) configuration modal
    │   ├── profile_modal.html     # User profile, password management & admin controls
    │   ├── help_modal.html        # Comprehensive built-in help guide & keyboard shortcuts
    │   ├── impressum_modal.html   # Legal notice & Impressum modal
    │   └── global_news_modal.html # Breaking global macroeconomic news digest
    └── tabs/
        ├── tab_watchlist.html     # Top Tab 1: Watchlist & Market Intelligence Hub
        ├── tab_scanner.html       # Top Tab 2: AI Quantitative Stock Scanner
        ├── tab_terminal.html      # Top Tab 3: Stock Deep-Dive Terminal
        ├── tab_backtest.html      # Top Tab 4: Quantitative Backtesting Studio
        └── tab_notifications.html # Top Tab 5: Signal Change Alerts & Notifications Hub
```

---

## 💻 Installation & Setup Guide

### Prerequisites & Recommended Server Resources

#### 🖥️ Server & Hardware Recommendations
FinDashIQ is lightweight and optimized with server-side CSV disk caching, background pre-hydration, incremental delta downloads, and multi-threaded processing. For typical self-hosted operation:
* **CPU**: **2 Cores** (recommended for concurrent indicator calculations, background scanner jobs, and delta synchronization)
* **RAM**: **2 – 4 GB RAM** (recommended to comfortably handle Python/Pandas historical dataframes, Gunicorn worker threads, and AI synthesis pipelines)
* **Storage**: **~1 – 2 GB free disk space** (for Python virtualenv dependencies and persistent cache files in `data/cache/`)

#### 📦 Software Prerequisites
* **Python 3.9+** (Python 3.10, 3.11, or 3.12 recommended)
* Modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari)

---

### 🪟 Windows Installation (PowerShell / Command Prompt)

1. **Open PowerShell or Terminal** and navigate to your project directory:
   ```powershell
   cd C:\path\to\your\projects\FinDashIQ
   ```

2. **Create a virtual environment**:
   ```powershell
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - In PowerShell:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
     *(If script execution is restricted, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*
   - In Command Prompt (`cmd.exe`):
     ```cmd
     venv\Scripts\activate.bat
     ```

4. **Upgrade pip and install dependencies**:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Start the application**:
   ```powershell
   cp .env.example .env
   # (Edit .env to add your custom tokens or API keys if desired)
   python app.py
   ```

6. **Open your browser** and visit:
   ```
   http://localhost:5000
   --> Initial accounts: user: "admin" / password: "admin123" and user: "user" / password: "user1"
   --> Change passwords after first login via Top-right avatar -> My Profile & Preferences -> Password & Security.
   ```

---

### 🐧 Linux (Ubuntu / Debian) Installation

1. **Update package lists and install Python prerequisites**:
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-pip python3-venv git
   ```

2. **Navigate into the project directory**:
   ```bash
   cd /path/to/FinDashIQ
   ```

3. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Upgrade pip and install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Run the application**:
   ```bash
   cp .env.example .env
   # (Edit .env to add your custom tokens or API keys if desired)
   python3 app.py
   ```

6. **Open in browser**:
   ```
   http://localhost:5000
   --> Initial accounts: user: "admin" / password: "admin123" and user: "user" / password: "user1"
   --> Change passwords after first login via Top-right avatar -> My Profile & Preferences -> Password & Security.
   ```

#### 🛡️ Optional: Running as a Background Service with Systemd (Ubuntu)

```ini
[Unit]
Description=FinDashIQ Sovereign Financial Dashboard
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/FinDashIQ
ExecStart=/home/ubuntu/FinDashIQ/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 --threads 4 --timeout 120 app:app
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, Flask, Pandas, NumPy, yfinance, Gunicorn
- **Frontend**: HTML5, Vanilla Modern CSS (CSS Grid, Flexbox, Glassmorphism), Vanilla JavaScript (ES6+)
- **Visualization**: [ApexCharts.js](https://apexcharts.com/) for reactive financial charting & inline SVG Sparklines
- **Icons**: [Lucide Icons](https://lucide.dev/)

---

## 📖 Documentation & Project Wiki

Comprehensive documentation, architectural guides, and integration tutorials are available in the official **[FinDashIQ GitHub Wiki](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki)**:

- 📖 **[Project Wiki Home](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Home.md)** — Full knowledge base, setup walk-throughs, and architecture overviews.
- 📈 **[Strategy Backtesting Guide](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Strategy-Backtesting-Guide.md)** — Algorithmic strategy formulas, risk parameters, metrics definitions, and optimization workflows.
- 📊 **[Watchlist & Market Hub](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Watchlist-and-Market-Hub.md)** — Watchlist management, sparklines, conviction calculations, and pre-hydration caching.
- 🛰️ **[AI Stock Scanner Guide](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/AI-Stock-Scanner-Guide.md)** — Autonomous screening engine, universe customization, and high-conviction alerts.
- 🔍 **[Stock Deep-Dive Terminal](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Stock-Deep-Dive-Terminal.md)** — Candlestick overlays, technical indicators, valuation multiples, and AI Copilot.
- 🔔 **[Configuring Notifications & Global Watchlist](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Configuring-Notifications.md)** — Multi-factor indicator alerts, portfolio-wide watchlist monitoring (`*WATCHLIST*`), and rule lifecycles.
- 📱 **[Telegram Bot Setup Guide](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Telegram-Bot-Setup.md)** — Setting up bots via `@BotFather`, obtaining Chat IDs, and direct server messaging.
- 💬 **[Discord Webhook Integration](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Discord-Webhook-Setup.md)** — Setting up webhooks and formatting Discord trading channel embeds.
- 📧 **[Email & SMTP Setup Guide](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Email-and-SMTP-Setup.md)** — Direct SMTP outbound configuration (`.env`) and HTML executive memos.
- 🔔 **[Browser Push & Audio Alerts](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Browser-Push-and-Audio-Alerts.md)** — HTML5 desktop notifications and Web Audio synthesizer chimes.
- 🌐 **[Custom REST API Webhooks](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Custom-API-Webhooks.md)** — JSON payload schemas and connecting to external trading bots, Zapier, and n8n.
- 💱 **[Multi-Currency & Forex Engine](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Multi-Currency-and-Forex-Engine.md)** — Base currency selection, real-time forex rates, and multi-asset conversion.
- ⚡ **[Performance, Caching & Architecture](https://github.com/TheyAreMe/FinDashIQ/tree/main/wiki/Performance-Caching-and-Architecture.md)** — Pre-hydration daemon, disk CSV caches, delta syncs, and zero-latency UI design.

---

## ⚠️ Disclaimer & Limitation of Liability

- **Private & Personal Usage Only**: The primary purpose and objective of FinDashIQ is to serve as a **self-hosted, sovereign financial dashboard with intelligence for private personal usage**, self-directed monitoring, and educational quantitative research.
- **No Financial Advice**: FinDashIQ and its generated AI analyses, algorithmic consensus verdicts, technical indicator signals, backtesting models, and alerts do **not** constitute financial, investment, legal, or tax advice.
- **No Liability**: The authors, contributors, and maintainers accept **no liability or responsibility whatsoever** for any direct, indirect, special, or consequential damages, losses, lost profits, or trade outcomes resulting from the use of this software or reliance on any calculations, third-party market data, automated heuristics, or AI responses.
- **Data Accuracy & Verification**: Market quotes, historical data, and fundamentals are fetched from external public APIs. Completeness, uninterrupted service, or real-time precision cannot be guaranteed. Users are strictly responsible for conducting independent due diligence and consulting certified financial professionals before executing financial trades.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

---

## ☕ Support the Project

If you find FinDashIQ valuable for you, consider supporting its open-source development:

<a href="https://ko-fi.com/theyareme" target="_blank"><img src="https://storage.ko-fi.com/cdn/kofi5.png" height="28" alt="Support with Ko-Fi"></a>&nbsp;&nbsp;<a href="https://www.buymeacoffee.com/theyareme" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="28" alt="Buy Me A Coffee"></a>

