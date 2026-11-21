# ⚡ FinDashIQ v0.1.6 — Multi-Provider AI (Gemini 4, Claude 5.5, GPT-6), Security Hardening, Performance & Chart Reliability

FinDashIQ **v0.1.6** delivers a platform upgrade introducing multi-provider AI intelligence (**Google Gemini 4**, **Anthropic Claude 5.5/5.2**, and **OpenAI GPT-6**) with real-time SSE streaming Copilot chat, more security hardening, minified asset bundling, Watchlist/Scanner CSV & JSON portability, PWA offline shell support, Gunicorn memory optimization, and critical chart/backtesting reliability fixes—including support for newly listed IPO stocks.

---

### 🚀 Highlights in v0.1.6

* 🧠 **Multi-Provider AI & Streaming Copilot**: Switch seamlessly between **Google Gemini 4** (`gemini-4-hydrogen`, `gemini-4-neon`, `gemini-4-carbon`, `gemini-4-argon`), **Anthropic Claude** (`claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-opus-5-5`, `claude-fable-5-2`), **OpenAI GPT-6** (`gpt-6.1-sol`, `gpt-6-luna`, `gpt-6.1-terra`, `gpt-6-astra`, `gpt-6.2-astra`), and the built-in **Quantitative AI** fallback—with custom model overrides, live model discovery, SSE token streaming (`/api/ai-chat/stream`), multi-turn history, and Gemini 4 quota/overload/timeout diagnostics.
* ⚡ **Performance & UX Upgrades**: Minified JS/CSS bundling (`static/dist/`), lazy ApexCharts loading, gzip response compression, **Technical Confluence Gauge** across Watchlist & AI views, 2-way **CSV/JSON Watchlist & Scanner Import/Export**, **Live Demo Showcase** mode, mobile chart controls drawer with touch pan/zoom, and installable PWA manifest & service worker.
* 📈 **Charting, Newly Listed IPO & Backtesting Studio Fixes**: Decoupled Deep Dive chart data from Stage 2 LLM latency, fixed navigation race conditions and `5Y`/`MAX` history depth expansion, added full support for short-history/newly listed IPOs (e.g. `ANT`) in Watchlist cards, Deep Dive graphs, and Backtesting Studio (`2+` bars with clamped date axes and stale-chart cleanup), and fixed background `StockService` `sys` and `news_service` imports.

## ⚡ Previous Releases

### FinDashIQ v0.1.5 — Startup Performance Overhaul, Backtesting Polish & Multi-Currency Engine

FinDashIQ **v0.1.5** delivers a comprehensive performance overhaul that slashes startup CPU load, introduces intelligent cache-aware scanning, optimizes the Strategy Backtesting Studio for short-history assets and ETFs, adds real-time multi-currency support, and refreshes high-resolution UI documentation assets.

* 🛡️ **Dedicated Admin Maintenance Tab**: Added an admin-only Maintenance tab inside the Profile & Preferences modal with live server telemetry tracking FinDashIQ process
* ⚡ **RAM Optimization**: Streamlined in-memory caching to significantly reduce active RAM usage.
* 🛠️ **Code Maintainability**: Refactored core modules and reduced redundancy for a cleaner, more modular architecture.

### FinDashIQ v0.1.4 — Strategy Backtesting Studio, System Updates & Historical AI Conviction Graph

FinDashIQ **v0.1.4** introduced the **Strategy Backtesting & Simulation Studio** for institutional multi-factor strategy simulation and forward paper trading, alongside the Historical AI Conviction Score chart in the Charts subtab, automated GitHub Releases update verification, and an administrator update management panel.

* 🎮 **Strategy Backtesting & Simulation Studio**: Test strategies over custom time horizons (1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, MAX) in Long-Only or Long & Short modes with configurable capital allocation, stop-loss %, take-profit %, and slippage/fees.
* 🔄 **GitHub Releases Update Checker**: Automated version comparison against official releases on GitHub (`TheyAreMe/FinDashIQ/releases`).
* 🛡️ **Administrator Updates Tab**: Dedicated System Updates management tab in the profile modal displaying release notes, upgrade commands, and recent release history.
* 📈 **Historical AI Conviction Graph (0–100%)**: Added backwards-calculated AI Conviction Score chart as the second graph in the Charts & Technicals subtab to see stability of conviction over time.

### FinDashIQ v0.1.3 — Stock Scanner Enhancements & UX Polish

FinDashIQ **v0.1.3** delivers key enhancements to the automated Stock Scanner, including autonomous background engine execution, admin interval controls, timezone-aware live countdowns, elevated default conviction screening, and a unified split hero layout.

* ⚡ **Default Conviction (≥ 85%)**: Elevated initial screening threshold to focus on high-conviction setups (≥ 85%).
* 🔄 **Autonomous Background Scanner**: Decoupled scanning from the frontend to run entirely in the background, with configurable scan intervals adjustable by admins directly from the scanner tab.
* ⏱️ **Live Timing & Local Timezone Sync**: "Last Scan / Next Due" timestamps automatically render in the user's local browser timezone with an active countdown timer.
* ☀️ **Bright Mode & UX Polish**: Fixed contrast across the admin controls, universe cards, and ticker addition modals.

---

### FinDashIQ v0.1.2 — Global Stock Scanner & Expanded Universe

We are pleased to release **FinDashIQ (v0.1.2)**, introducing an expanded global screening universe of 276+ liquid institutional assets, high-speed vectorized data ingestion, interactive catalyst indicators with hover popovers, and streamlined market selection filters.

---

### 🚀 Highlights & New Features in v0.1.2

* 🌐 **Expanded Global Multi-Market Universe (276+ Assets)**:
  * Comprehensive coverage across **US Markets** (S&P 500, NASDAQ 100), **European Blue Chips** (DAX 40, CAC 40, SMI, FTSE), **Asia-Pacific**, **Emerging Markets**, **Clean Energy**, and **Sector Benchmark ETFs**.
  * Enriched fundamental classification including ESG sustainability ratings, thematic tags, and parent ETF mappings.

* ⚡ **High-Speed Vectorized Ingestion & Sub-10ms Queries**:
  * Single-batch vectorized price data streaming with decoupled bulk news aggregation.
  * In-memory indicator calculation across all 276 assets in sub-second RAM matrices, dramatically accelerating scan and update speeds.

* 🔥 **Interactive Catalyst Indicator & Hover Popover**:
  * Subtle pulsing catalyst indicator dot in the card header for stocks experiencing viral catalysts or volume surges.
  * Rich, responsive hover popovers displaying volume surge metrics, breaking headlines, story summaries, and instant news wire links.
  * Smart viewport collision detection and stacking elevation ensuring smooth readability on mobile, tablet, and desktop screens.

* 🎯 **Streamlined Scanner Controls & Regional Selectors**:
  * Universal cross-platform market selectors with distinct separation between Asia-Pacific and Emerging Markets.
  * Refined screening controls with repositioned watchlist exclusion and uniform card grid alignment.

---

### 📦 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/TheyAreMe/FinDashIQ.git
cd FinDashIQ

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Launch application
python app.py
```
*Access the dashboard at `http://localhost:5000` (Set `ADMIN_BOOTSTRAP_PASSWORD` in `.env` or use the auto-generated initial `admin` password printed on first boot).*

---

> ⚠️ **Disclaimer**: FinDashIQ is strictly designed for personal utility, educational exploration, and private quantitative research. No liability is assumed for financial decisions or software inaccuracies.
