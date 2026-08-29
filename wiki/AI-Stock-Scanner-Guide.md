# 🛰️ AI Quantitative Stock Scanner & Opportunity Discovery

FinDashIQ features an institutional **AI Stock Scanner (Top Tab 3)** designed to discover high-conviction buy recommendations across thematic sectors and ecological investments for stocks **not currently on your watchlist**.

---

## 📋 Table of Contents
1. [Core Scanner Capabilities](#1-core-scanner-capabilities)
2. [Thematic Sectors & ESG Universe](#2-thematic-sectors--esg-universe)
3. [Filter & Parameter Controls](#3-filter--parameter-controls)
4. [Quick Presets](#4-quick-presets)
5. [Opportunity Card Anatomy](#5-opportunity-card-anatomy)
6. [REST API Reference](#6-rest-api-reference)

---

## 1. Core Scanner Capabilities

- **Uncovered Market Alpha**: Automatically filters out all stocks currently tracked in your personal watchlist (`[x] Exclude stocks already on my Watchlist`) to focus exclusively on fresh opportunities.
- **Thematic & Ecological Universe**: Screens dedicated investment categories including **Clean & Green / Decarbonization**, **Pure AI & Quantum Compute**, **Cybersecurity**, **Biotech & Genomics**, **Fintech**, and **Industrial Automation**.
- **Multi-Factor Indicator Screening**: Concurrently tests each asset for:
  - **SuperTrend (10, 3)** trendline confirmation.
  - **RSI (14)** momentum expansion and oversold mean-reversion bounces (<55).
  - **Chaikin Money Flow (CMF 20)** institutional capital accumulation (>+0.05).
  - **Volume-Weighted Average Price (VWAP)** benchmark support.
  - **MACD (12, 26, 9)** bullish histogram expansion.
- **Dynamic Trade Execution Matrix**: Calculates asymmetric entry zones, volatility-based stop-losses (ATR-calibrated), target take-profit (TP1), and risk/reward ratios converted to your selected base currency.
- **AI Investment Thesis & Catalyst**: Synthesizes the core business catalysts and technical tailwinds explaining why the asset qualifies for purchase.
- **Instant Actions**: Single-click **"+ Add to Watchlist"** (server-persisted) and **"Deep-Dive in Terminal →"** for immediate multi-timeframe exploration.

---

## 2. Thematic Sectors & ESG Universe

### 1. Clean Energy & Decarbonization (`eco_esg`)
- Elite ESG ratings (85–98/100) and low-carbon leaders: Enphase (`ENPH`), First Solar (`FSLR`), SolarEdge (`SEDG`), Brookfield Renewable (`BEPC`), Vestas (`VWS.CO`), Ørsted (`ORSTED.CO`), NIBE (`NIBE-B.ST`), Sunrun (`RUN`), Daqo (`DQ`), HA Sustainable (`HASI`).

### 2. Pure AI Silicon & Quantum Deep Tech (`ai_tech`)
- Semiconductor and compute infrastructure: Arm (`ARM`), Supermicro (`SMCI`), Broadcom (`AVGO`), Arista (`ANET`), Qualcomm (`QCOM`), Marvell (`MRVL`), Palantir (`PLTR`), ASML (`ASML`), IonQ (`IONQ`).

### 3. Cybersecurity & Cloud Infrastructure (`cyber`)
- Enterprise cloud and zero-trust security: CrowdStrike (`CRWD`), Palo Alto Networks (`PANW`), Cloudflare (`NET`), Datadog (`DDOG`), Snowflake (`SNOW`).

### 4. Healthcare, Biotech & Genomics (`biotech`)
- Next-gen oncology and precision medicine: Vertex (`VRTX`), Regeneron (`REGN`), CRISPR Therapeutics (`CRSP`), Intuitive Surgical (`ISRG`), Eli Lilly (`LLY`).

### 5. Fintech & Digital Commerce (`fintech`)
- Global payments and digital finance: Adyen (`ADYEN.AS`), Block (`SQ`), Coinbase (`COIN`), Nu Holdings (`NU`), MercadoLibre (`MELI`).

### 6. Industrial Automation & Smart Grids (`automation`)
- Electrification and grid robotics: Siemens AG (`SIEGn.DE`), Schneider Electric (`SCHN.PA`), ABB (`ABB`), Siemens Energy (`ENR.DE`), Rivian (`RIVN`).

---

## 3. Filter & Parameter Controls

- **Sector / Industry**: Filter by specific thematic category or scan the entire global universe.
- **Theme & ESG Profile**: Filter by *Clean & Green / ESG Focus*, *Pure AI & Quantum*, *High Momentum Breakouts*, or *Cash Flow Leaders*.
- **Market Capitalization**: Mega Cap ($200B+), Large Cap ($10B – $200B), Mid Cap ($2B – $10B).
- **Minimum AI Conviction Score**: Any (≥50%), Bullish (≥65%), Strong Bullish (≥75%), Elite Alpha (≥85%).

---

## 4. Quick Presets

| Preset Chip | Focus & Filters Applied |
| :--- | :--- |
| **🌐 All Sectors** | Scans entire global universe with minimum 75% AI conviction and SuperTrend confirmation. |
| **🌿 Clean Energy & ESG Alpha** | Filters Clean Energy sector, Eco/ESG theme, CMF accumulation, and SuperTrend support. |
| **⚡ AI & Quantum Deep Tech** | Filters Technology sector, AI/DeepTech theme, and minimum 75% conviction. |
| **🌊 Institutional Accumulation** | Requires Chaikin Money Flow > +0.02 and minimum 75% conviction. |
| **🚀 SuperTrend Momentum** | Requires SuperTrend Bullish and MACD positive histogram. |
| **🎯 Oversold Quality Dip Buys** | Requires RSI < 55 oversold mean-reversion setup with strong fundamental scoring. |

---

## 5. Opportunity Card Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ FSLR — First Solar, Inc.   [🌿 Thin-Film Solar PV]   [Clean]│
│ Live Quote: $224.50 (+4.18%)        AI Conviction: 88% Strong│
├─────────────────────────────────────────────────────────────┤
│ [============= SVG 30-Day Trend Sparkline =================]│
│ Jul 14 ─────────────── 30D Trend: +14.20% ──────────── Aug 23│
├─────────────────────────────────────────────────────────────┤
│ SuperTrend: 🟢 Bull • RSI: 52.1 • CMF: +0.14 • VWAP: $218.4 │
├─────────────────────────────────────────────────────────────┤
│ 🎯 Entry Zone: $221.10 – $227.80                             │
│ 🛑 Stop-Loss: $210.50 (-6.2%)                                │
│ 🚀 Take-Profit 1: $252.00 (+12.2%)                           │
│ ⚖️ Risk / Reward: 2.8:1                                      │
├─────────────────────────────────────────────────────────────┤
│ 🧠 AI Thesis & ESG Catalyst:                                 │
│ US-based thin-film photovoltaic manufacturer with industry-  │
│ leading low carbon footprint. Confirmed SuperTrend support   │
│ with institutional accumulation at CMF +0.14.                │
├─────────────────────────────────────────────────────────────┤
│ [+ Add to Watchlist]             [Deep-Dive in Terminal →]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. REST API Reference

### `POST /api/scanner/run`
Executes multi-threaded quantitative scanning across the thematic universe.

#### Request Body
```json
{
  "sector": "Clean Energy",
  "theme": "eco_esg",
  "marketCap": "large",
  "minConviction": 75,
  "excludeWatchlist": true,
  "requiredIndicators": [
    "supertrend_bullish",
    "cmf_accumulation"
  ]
}
```

#### Response Structure
```json
{
  "success": true,
  "timestamp": "2026-08-28T23:45:00",
  "totalUniverseScanned": 15,
  "opportunitiesCount": 4,
  "opportunities": [
    {
      "ticker": "FSLR",
      "name": "First Solar",
      "sector": "Clean Energy",
      "theme": "eco_esg",
      "esgRating": "Leader (91/100)",
      "ecoBadge": "🌿 Thin-Film Utility Solar PV",
      "currentPrice": 224.50,
      "convictionScore": 88,
      "directionalBias": "Strong Buy",
      "executionMatrix": {
        "entryZone": "$221.10 – $227.80",
        "stopLoss": "$210.50",
        "stopLossPercent": "-6.2%",
        "takeProfit1": "$252.00",
        "takeProfit1Percent": "+12.2%",
        "riskRewardRatio": "2.8:1"
      },
      "aiThesis": "US-based thin-film photovoltaic manufacturer...",
      "isInWatchlist": false
    }
  ]
}
```
