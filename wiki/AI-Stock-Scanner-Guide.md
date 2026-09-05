# 🛰️ AI Quantitative Stock Scanner & Opportunity Discovery

FinDashIQ features an institutional **AI Stock Scanner (Top Tab 3)** designed to discover high-conviction buy setups, viral news catalysts, and benchmark basket leaders across global equity markets for stocks **not currently on your watchlist**.

The scanner operates an **autonomous background engine** that continuously evaluates hundreds of assets, precalculating opportunities, technical signals, and catalysts into a warm in-memory cache for instant sub-5ms rendering.

---

## 📋 Table of Contents
1. [Core Scanner Capabilities](#1-core-scanner-capabilities)
2. [Interface Architecture & Layout](#2-interface-architecture--layout)
3. [Global Universe & Regional Markets](#3-global-universe--regional-markets)
4. [Algorithmic Screener Strategies](#4-algorithmic-screener-strategies)
5. [Benchmark ETF & Index Baskets](#5-benchmark-etf--index-baskets)
6. [Opportunity Card Anatomy & Catalyst Box](#6-opportunity-card-anatomy--catalyst-box)
7. [Admin Scheduling & Engine Controls](#7-admin-scheduling--engine-controls)
8. [REST API Reference](#8-rest-api-reference)

---

## 1. Core Scanner Capabilities

- **Elite Institutional Conviction (≥ 85% by Default)**: Defaults to screening high-probability quantitative setups (≥ 85% conviction), with optional criteria thresholds for 75%, 62%, or 50%.
- **Autonomous Background Engine**: Runs periodic screening cycles in the background (default: every 30 minutes, configurable from 15 min to 2 hours) so users experience zero loading latency.
- **Live Timing & Dynamic Countdown**: The summary bar displays exact `Last Scan / Next Due` timestamps along with a ticking live countdown timer (`(in Xm Ys)` / `(Due now)`).
- **Dynamic Top Tab Badge**: The Top Tab 3 badge in the navigation bar automatically reflects the exact count of stocks currently matching your active filters and search query.
- **Real-Time Recommendations Search Bar**: Search filtered candidates by ticker, company name, or sector with instant in-memory filtering.
- **Search Query Persistence**: Switching between **Grid Cards View** and **Table View** preserves the active search filter seamlessly without reset.
- **Uncovered Market Alpha**: Automatically filters out all stocks currently tracked in your personal watchlist (`✨ Exclude Watchlist Stocks`) to focus exclusively on fresh candidates.
- **Dynamic Universe Expansion**: Search and add custom international equities and ETFs to the background screening pool via the **Add Stock to Universe** modal.
- **Breaking News Catalyst Engine**: NLP wire parser flags viral positive news announcements, earnings surprises, and volume surges ($RVOL \ge 1.2\text{x}$ to $3.0\text{x}$ 20-Day SMA).
- **Multi-Factor Indicator Confirmation**: Evaluates SuperTrend trendline support, RSI mean-reversion, Chaikin Money Flow accumulation, and Volume-Weighted Average Price (VWAP).
- **Dynamic Trade Execution Matrix**: Calculates asymmetric entry zones, ATR-calibrated stop-losses, target take-profit (TP1), and risk/reward ratios converted to your selected base currency.
- **Instant 1-Click Actions**: Add directly to Watchlist or open Deep-Dive in the Terminal.

---

## 2. Interface Architecture & Layout

### Unified Split Hero Header
The top hero section consolidates scanner controls and universe expansion into a single coordinated card:
- **Left Field (`.scanner-hero-field-left`)**:
  - **Stock Scanner Title & Status Badge**: Features the cyan Lucide radar icon and a live status indicator (`Autonomous & Live` synced badge or pulsing `Scanning in progress...` badge).
  - **Description**: Concise summary of the background screening mechanics.
  - **Administrator Interval & Refresh Controls**: Scan interval selector and asynchronous Force Update trigger (visible to administrators).
- **Desktop Vertical Split Divider**: Clean hairline divider separating configuration from expansion actions.
- **Right Field (`.scanner-hero-field-right`)**:
  - **Expand Monitoring Universe**: Header displaying total monitored assets count (`300+ Stocks`).
  - **Aligned Action Controls**: Vertically stacked on desktop with identical dimensions (206px × 33px):
    - `Add Stock to Universe` button (opens global ticker search modal).
    - `✨ Exclude Watchlist Stocks` checkbox with highlight styling.
  - **Responsive Mobile Layout**: On tablets and mobile screens (≤ 992px), fields stack vertically while action controls transition to a horizontal flex flow.

### Scanner Summary Statistics Bar
- **Universe Scanned**: Total assets evaluated in the background pool (e.g. `276+ Assets`).
- **Matching Opportunities**: Real-time count of stocks matching active strategy, market, conviction, and exclusion filters.
- **Highest Conviction**: Peak AI conviction score among current matches (e.g. `94%`).
- **Last Scan / Next Due**: Exact timestamp pair (e.g. `Last: 12:15:00 PM • Next: 12:45:00 PM`) paired with live ticking countdown (`(in 28m 45s)`).

---

## 3. Global Universe & Regional Markets

| Regional Market | Included Indices & Equities |
| :--- | :--- |
| **🌐 All Global Markets** | Complete cross-border institutional equity universe. |
| **🏛️ US Markets** | S&P 500 core leaders and NASDAQ 100 innovators (`NVDA`, `MSFT`, `AAPL`, `AMZN`, `GOOGL`, `META`, `TSLA`, `AVGO`, `ARM`, `PLTR`, etc.). |
| **🏰 European Blue Chips** | German DAX 40, French CAC 40, Swiss SMI, and Nordic equities (`SAP.DE`, `SIEGn.DE`, `IFX.DE`, `AIR.PA`, `MC.PA`, `NESN.SW`, `NOVN.SW`, `ASML.AS`, etc.). |
| **🌏 Asia-Pacific** | High-growth Asian champions (`TSM`, `6758.T`, `7203.T`, `BABA`, `TCEHY`, `INFY`, etc.). |
| **⚡ Emerging Markets** | High-beta emerging market equities and regional conglomerates. |
| **🌿 Clean Energy** | Solar, wind, and storage leaders (`ENPH`, `FSLR`, `SEDG`, `BEPC`, `VWS.CO`, `ORSTED.CO`, `NEL.OL`, `RUN`). |
| **📊 Benchmark & Sector ETFs** | Major asset allocation baskets (`SPY`, `QQQ`, `SMH`, `ICLN`, `EXS1.DE`, `VGK`, `EEM`, `XLE`, `XLV`, `XLF`). |

---

## 4. Algorithmic Screener Strategies

1. **🔥 Breaking Positive News & Parabolic Catalysts (`viral_news_catalysts`)**:
   Filters for stocks with confirmed high-impact viral catalysts, earnings blowout beats, FDA approvals, and volume explosions.
2. **🚀 High Momentum Breakouts (`momentum_breakout`)**:
   Requires active SuperTrend Bullish state, positive 30-day slope, and relative volume confirmation.
3. **💎 Deep Value & Mean-Reversion (`deep_value_reversion`)**:
   Flags oversold dip-buying candidates ($RSI < 55$) with high institutional consensus and discount valuation.
4. **👑 Dividend Aristocrats & Cash Flow (`dividend_aristocrats`)**:
   Screens defensive yield leaders with robust balance sheets and consistent multi-year payouts.
5. **⚡ TTM Squeeze Volatility Breakouts (`ttm_squeeze`)**:
   Detects volatility compression inside Bollinger Bands & Keltner Channels anticipating explosive directional expansions.

---

## 5. Benchmark ETF & Index Baskets

Users can focus the scanner exclusively on the top holdings of premier benchmark funds:
- **`SPY`** — S&P 500 Core Leaders
- **`QQQ`** — NASDAQ 100 Tech Innovators
- **`SMH`** — Pure-Play Semiconductors
- **`ICLN`** — Global Clean Energy Champions
- **`EXS1.DE`** — German DAX 40 Blue Chips
- **`VGK`** — Vanguard European Equities
- **`EEM`** — Emerging Markets Growth
- **`XLE`** — Energy & Natural Gas Leaders
- **`XLV`** — Healthcare & BioPharma Giants
- **`XLF`** — Tier-1 Banking & Financials

---

## 6. Opportunity Card Anatomy & Catalyst Box

```
┌─────────────────────────────────────────────────────────────┐
│ NVDA — NVIDIA Corp.        [⚡ AI Silicon]         [🏛️ US]  │
│ Live Quote: $128.50 (+5.20%)         AI Conviction: 92%     │
├─────────────────────────────────────────────────────────────┤
│ [============= SVG 30-Day Trend Sparkline =================]│
│ Aug 01 ─────────────── 30D Trend: +18.40% ──────────── Aug 30│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔥 Viral Catalyst                           2.4x Vol    │ │  <── Clickable
│ │ Record Data Center Demand & Blackwell Chip Scale-Out    │ │      Catalyst
│ │ Financial Wire • Active Session        News & AI ↗      │ │      Box
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ SuperTrend: 🟢 Bull • RSI: 58.4 • CMF: +0.22 • VWAP: $125.1 │
├─────────────────────────────────────────────────────────────┤
│ 🎯 Entry Zone: $126.20 – $129.50                             │
│ 🛑 Stop-Loss: $121.80 (-5.2%)                                │
│ 🚀 Take-Profit 1: $144.00 (+12.1%)                           │
│ ⚖️ Risk / Reward: 2.9:1                                      │
├─────────────────────────────────────────────────────────────┤
│ 🧠 AI Thesis & Strategy Confluence:                         │
│ Multi-factor breakout confirmed by SuperTrend Bullish state │
│ and 2.4x volume accumulation on explosive datacenter demand.│
├─────────────────────────────────────────────────────────────┤
│ [ + Add to Watchlist ]           [ Deep-Dive in Terminal → ]│
└─────────────────────────────────────────────────────────────┘
```

### Interactive Catalyst Popover
Scanner cards with active market catalysts display a glowing amber **Pulsing Catalyst Dot** next to the directional bias badge. Hovering over the dot reveals an interactive **Catalyst Popover** with:
- Volume surge metrics ($RVOL$)
- Breaking wire headline & story summary
- 1-click shortcut to the **Global News Modal**

---

## 7. Admin Scheduling & Engine Controls

Administrators have direct controls integrated into the scanner hero header:
- **Scan Interval Selector (`#adminSelectScanInterval`)**:
  - Options: `15 min`, `30 min`, `45 min`, `60 min`, `2 hours`.
  - Updating the dropdown immediately persists the configuration, signals the background worker to reschedule, and updates the `Last Scan / Next Due` stat card with the newly computed epoch.
- **Asynchronous Force Update (`#btnForceScannerRefresh`)**:
  - Triggers an immediate background scan cycle asynchronously without blocking the caller or freezing the web UI.
  - The status badge transitions to `Scanning in progress...` with a live pulsing animation until the background pass finishes.

---

## 8. REST API Reference

### `GET /api/scanner/cached`
Fetches warm in-memory precalculated opportunities, universe count, custom universe tickers, and timing statistics (<5ms response time).

### `POST /api/scanner/run`
Executes an in-memory filtered query against the cached opportunities or triggers on-demand multi-factor evaluation:

```json
{
  "market": "us",
  "strategy": "viral_news_catalysts",
  "etfBasket": "SMH",
  "sector": "all",
  "theme": "all",
  "minConviction": 85,
  "excludeWatchlist": true,
  "forceRefresh": false,
  "limit": 28
}
```

### `POST /api/scanner/config` *(Admin Only)*
Dynamically updates the background scan interval:

```json
{
  "intervalMinutes": 30
}
```

**Response**:
```json
{
  "success": true,
  "intervalMinutes": 30,
  "scanIntervalMinutes": 30,
  "lastScanTime": "12:15:00 PM",
  "nextScanTime": "12:45:00 PM",
  "nextScanEpoch": 1788605100,
  "nextScanInSeconds": 1800
}
```

### `POST /api/scanner/force-update` *(Admin Only)*
Triggers an immediate background scan cycle asynchronously without blocking.

### `POST /api/scanner/universe/add`
Adds a new global stock or ETF ticker to the persistent custom universe (`data/scanner_custom_universe.json`):

```json
{
  "ticker": "PLTR"
}
```
