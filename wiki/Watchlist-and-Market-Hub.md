# 📊 Watchlist & Market Intelligence Hub (Top Tab 1)

The **Watchlist & Market Intelligence Hub** is FinDashIQ's primary command center. It delivers real-time monitoring of institutional leaders, index ETFs, and your customized portfolio watchlist with multi-factor scoring, dual view layouts, drag-and-drop customization, and dynamic base currency conversion.

---

## 📋 Table of Contents
1. [Overview & Navigation](#1-overview--navigation)
2. [Dual View Modes: Cards vs. Table](#2-dual-view-modes-cards-vs-table)
3. [Drag-and-Drop Reordering](#3-drag-and-drop-reordering)
4. [Recommendation Mini-Cards Anatomy](#4-recommendation-mini-cards-anatomy)
5. [Data Table View Anatomy](#5-data-table-view-anatomy)
6. [Quantitative Metric Bar & Technical Scoring](#6-quantitative-metric-bar--technical-scoring)
7. [AI Market Catalyst & Breaking News Synthesis](#7-ai-market-catalyst--breaking-news-synthesis)
8. [Company Search & Watchlist Management](#8-company-search--watchlist-management)
9. [Dynamic Multi-Currency Conversion](#9-dynamic-multi-currency-conversion)
10. [Data Isolation & Server-Side Persistence](#10-data-isolation--server-side-persistence)

---

## 1. Overview & Navigation

The Watchlist Hub provides an ultra-responsive, real-time overview of all tracked assets:
- **Header Control Bar**: Displays sync status badge (`Live & Synced`), **"+ Add Stock"** search modal trigger, **"Refresh"** cache bypass, **"Defaults"** restore, and the **Cards / Table** view toggle.
- **Dynamic Content Area**: Renders either the rich visual card grid or the compact tabular view based on user preference.
- **Direct Terminal Routing**: Clicking **"Open Deep-Dive Terminal &rarr;"** on any card or table row routes immediately into the Deep-Dive Terminal with that stock active.

---

## 2. Dual View Modes: Cards vs. Table

Users can toggle seamlessly between two distinct presentation modes using the view switcher located in the top-right header:

```
[ ⊞ Cards ] [ ☰ Table ]
```

1. **Grid Card View (Default)**: Visual cards featuring large typography, smooth SVG trajectory sparklines, AI conviction gauges, multi-factor metric badges, and synthesized news cards.
2. **Data Table View**: Compact, high-density table layout displaying key metrics across all tracked assets simultaneously. Includes sticky headers and columns (`Drag Handle` and `Asset Name`), sortable metric columns, and a mobile horizontal scroll indicator.

*Note: Your preferred view mode is saved to your user profile and automatically restored on your next login.*

---

## 3. Drag-and-Drop Reordering

FinDashIQ allows full customization of your watchlist order via native HTML5 drag-and-drop:

- **In Card View**: Click and drag any card to reposition it anywhere in the grid.
- **In Table View**: Grab the drag handle icon (<i data-lucide="grip-vertical"></i>) on the left-most sticky column to move rows up or down.
- **Server-Side Persistence**: As soon as an asset is dropped into a new position, FinDashIQ automatically sends a sync request to update the user's ordered asset list in `data/users.json` / `data/watchlist.json`.

---

## 4. Recommendation Mini-Cards Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ NVDA — NVIDIA Corporation               $175.40  +3.42% 📈  │
│ [================ SVG Gradient Sparkline =================] │
│ Jul 14 ─────────────── 30D Trend: +12.85% ──────────── Aug 23│
├─────────────────────────────────────────────────────────────┤
│ AI Conviction: [ 84% Strong Bullish ]                       │
├─────────────────────────────────────────────────────────────┤
│ RSI(14): 58.4 • SuperTrend: Bullish • CMF: +0.185 • VWAP: $173│
├─────────────────────────────────────────────────────────────┤
│ 📰 AI Catalyst Synthesis:                                   │
│ Surging data center demand and accelerated compute spend    │
│ driving institutional inflow above 20-day VWAP benchmark.   │
├─────────────────────────────────────────────────────────────┤
│ [Open Deep-Dive Terminal →]                             [✕] │
└─────────────────────────────────────────────────────────────┘
```

1. **Quote Header**: Current price, currency symbol, and daily percentage change (e.g. `+3.42%`).
2. **SVG Sparkline & Timeframe Axis**:
   - Continuous cubic Bézier gradient curve reflecting recent price action.
   - **Start & End Date Labels**: Shows exact beginning and ending session dates (e.g. `Jul 14` to `Aug 23`).
   - **Window Return Badge**: Highlights multi-week cumulative trajectory return (e.g. `30D Trend: +12.85%`).
   - **Range Bounds**: High and low price levels over the sparkline window.
3. **AI Conviction Gauge**: Multi-factor conviction score (0–100%) and directional rating (*Strong Bullish*, *Bullish*, *Neutral*, *Bearish*).
4. **Quantitative Metric Bar**: Key technical indicators (RSI, SuperTrend, CMF, VWAP).
5. **AI News Catalyst Synthesis**: Real-time summary of latest corporate developments and sentiment drivers.
6. **Quick Actions**: Terminal deep-dive router and single-click remove button (`✕`).

---

## 5. Data Table View Anatomy

The Data Table View provides high-density financial metrics:

| Column | Description |
| :--- | :--- |
| **⋮⋮ (Drag Handle)** | Grab to reorder row via drag-and-drop |
| **Asset / Company** | Ticker symbol, exchange badge, and full company name |
| **Price** | Live market price formatted in active base currency |
| **1D Change** | Daily session percentage change with color badge |
| **6M Trend** | Mini inline SVG sparkline curve |
| **SuperTrend** | Trailing volatility trend direction (Bullish / Bearish) |
| **RSI(14)** | Relative Strength Index value and color zone |
| **CMF Flow** | Chaikin Money Flow score (>+0.05 Accumulation, <-0.05 Distribution) |
| **AI Conviction** | Algorithmic conviction score percentage and stance badge |
| **News Catalyst** | Quick snippet / tooltip of breaking news catalyst |
| **Actions** | Open terminal link (`→`) and delete button (`✕`) |

---

## 6. Quantitative Metric Bar & Technical Scoring

The platform evaluates multi-factor technical indicators on every price update:

| Metric | Interpretation | Bullish Level | Bearish Level |
| :--- | :--- | :--- | :--- |
| **RSI(14)** | Relative Strength Index (Momentum) | > 50.0 (Momentum) or < 30.0 (Oversold Dip) | > 70.0 (Overbought) or < 50.0 (Weakness) |
| **SuperTrend (10, 3)** | Trailing Volatility Trend Direction | Green / Bullish Support | Red / Bearish Resistance |
| **CMF (20)** | Chaikin Money Flow (Institutional Flow) | > +0.05 (Capital Inflow) | < -0.05 (Capital Outflow) |
| **VWAP** | Volume-Weighted Average Price | Price > Daily VWAP | Price < Daily VWAP |

---

## 7. AI Market Catalyst & Breaking News Synthesis

Each asset card and table row integrates a dynamic market catalyst synthesis:
- **Breaking News Attribution**: Summarizes latest corporate news, earnings reports, regulatory decisions, and SEC filings.
- **Multi-Exchange Collision Avoidance**: Resolves tickers to their primary company name to avoid mixing news between distinct assets on different exchanges.
- **Offline Heuristics Engine**: Generates comprehensive structured syntheses even without external AI keys.
- **Gemini AI Integration**: Enhances summaries with deep natural language insights when configured.

---

## 8. Company Search & Watchlist Management

### Adding Assets via Company & Stock Search Modal
1. Click **"+ Add Stock"** in the Watchlist Hub header.
2. Type any **company name** (e.g. `Apple`, `PayPal`, `Infineon`, `SAP`) or **ticker symbol** (e.g. `PLTR`, `ASML`, `ETH-USD`).
3. If an asset is listed across multiple international exchanges (e.g. XETRA, Frankfurt, NASDAQ, London), all matching listings are presented for disambiguation.
4. Click on your preferred asset to immediately add it to your watchlist.

### Removing Assets
- Click the **✕** button on any card or table row to delete it from your personal watchlist.

### Reset & Refresh
- **Refresh**: Forces an immediate live quote refresh and indicator recalculation.
- **Defaults**: Restores default tech and semiconductor leaders (`NVDA`, `MSFT`, `IFX.DE`, `TSM`, `SPCX`, `EXXT.DE`, `XDWT.DE`).

---

## 9. Dynamic Multi-Currency Conversion

All quotes and metrics in the Watchlist Hub convert automatically to your selected base currency (USD, EUR, GBP, CHF, NOK, JPY, CAD, AUD, SEK, DKK):
- Forex conversion rates are fetched in real-time and cached on the server.
- Switching currency in your Profile immediately updates all card prices, sparkline high/lows, and table columns without reloading historical data.

---

## 10. Data Isolation & Server-Side Persistence

All watchlist modifications (additions, deletions, reordered positions) are saved to `data/watchlist.json` and `data/users.json`. User configurations remain fully isolated and survive browser restarts and cache clears.
