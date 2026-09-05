# 📰 Global Breaking News & Market Catalysts

FinDashIQ integrates an institutional financial news wire, real-time Natural Language Processing (NLP) catalyst engine, and abnormal volume surge detector. This system aggregates global headlines, detects extraordinary corporate developments, identifies viral market momentum, and integrates catalyst tailwinds directly into quantitative technical conviction scoring.

---

## 📋 Table of Contents
1. [What is a Market Catalyst?](#1-what-is-a-market-catalyst)
2. [Types of Catalysts Tracked in FinDashIQ](#2-types-of-catalysts-tracked-in-findashiq)
3. [How FinDashIQ Detects & Synthesizes Catalysts](#3-how-findashiq-detects--synthesizes-catalysts)
4. [Catalysts in the AI Stock Scanner](#4-catalysts-in-the-ai-stock-scanner)
5. [Interactive Catalyst Deep-Dive & News Modal](#5-interactive-catalyst-deep-dive--news-modal)
6. [Global News Modal Features & Filters](#6-global-news-modal-features--filters)
7. [Catalyst Trading Strategies & Risk Management](#7-catalyst-trading-strategies--risk-management)

---

## 1. What is a Market Catalyst?

A **Market Catalyst** is an extraordinary event, announcement, or data point that rapidly alters investor perception of a company's intrinsic value, precipitating an explosive change in trading volume, volatility, and share price trajectory.

While standard technical indicators (e.g., RSI, Moving Averages) describe *what* price action is doing, catalysts explain *why* the move is occurring and whether it represents sustained institutional accumulation or a short-lived retail spike.

---

## 2. Types of Catalysts Tracked in FinDashIQ

FinDashIQ continuously monitors global exchange feeds and financial media for three primary categories of market catalysts:

### A. 🔥 Fundamental & Corporate Catalysts
- **Earnings Surprises & Guidance Upgrades**: Material beats on EPS/Revenue or increased forward annual projections.
- **M&A Deals & Strategic Buyouts**: Acquisitions, takeover bids, joint ventures, or asset sales at substantial premiums.
- **Regulatory Approvals & Product Clearances**: FDA approvals for biopharma, patent grants, government certifications, or anti-trust clearances.
- **Major Commercial Contract Awards**: Multi-billion-dollar enterprise agreements, government defence contracts, or cloud computing partnerships.
- **Analyst Upgrades & Price Target Revisions**: Tier-1 investment bank upgrades (e.g., Goldman Sachs, Morgan Stanley) raising long-term price targets.

### B. 🚀 Parabolic & Viral Sentiment Catalysts
- **Viral Retail & Social Momentum**: Rapid retail attention spikes, social discussion surges, and short squeeze dynamics (reminiscent of the historic *GameStop / GME* and meme stock rallies).
- **Short Squeeze Pressure**: High short interest combined with sudden buy volume forcing short sellers to cover at escalating market prices.
- **Breakthrough AI & DeepTech Announcements**: Paradigm-shifting technological breakthroughs, next-generation semiconductor tape-outs, or quantum algorithmic milestones.

### C. ⚡ Institutional Volume Surges
- **Abnormal Tape Flow**: Volume spikes exceeding **1.2x to 3.0x+** of the stock's 20-Day Simple Moving Average (SMA).
- **Block Order Accumulation**: Large institutional block orders crossing the tape, confirming that institutional "smart money" is backing the price expansion.

---

## 3. How FinDashIQ Detects & Synthesizes Catalysts

The FinDashIQ Quantitative Engine runs an autonomous multi-stage detection pipeline:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ Global Financial Wires  │ ──> │ Natural Language NLP    │
│ (Reuters, Bloomberg,    │     │ Keyword & Sentiment     │
│ CNBC, Handelsblatt...)  │     │ Extraction              │
└─────────────────────────┘     └───────────┬─────────────┘
                                            │
                                            ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ Live Exchange Tape      │ ──> │ Multi-Factor Alignment: │
│ (Volume vs 20-Day SMA,  │     │ Vol Surge + News Event  │
│ Intraday Price Δ)       │     │ + Technical Confirmation│
└─────────────────────────┘     └───────────┬─────────────┘
                                            │
                                            ▼
                                ┌─────────────────────────┐
                                │ Dynamic Classification: │
                                │ 🔥 Viral Catalyst       │
                                │ ⚡ Volume Surge         │
                                └─────────────────────────┘
```

1. **Multi-Source Ingestion**: Ingests headlines across US, European, Asian, and Clean Energy markets with real-time foreign language translation to English.
2. **High-Impact Keyword Extraction**: Scans titles and abstracts for decisive catalyst terms (*"surge", "earnings beat", "FDA approval", "acquisition", "record revenue", "contract win", "upgrade", "short squeeze"*).
3. **Volume Anomaly Cross-Validation**: Calculates relative volume ratio:
   $$\text{Relative Volume (RVOL)} = \frac{\text{Current Trading Volume}}{\text{20-Day Volume SMA}}$$
4. **Classification & Tagging**:
   - **`🔥 Viral Catalyst`**: Confirmed high-impact news catalyst paired with positive price movement or abnormal volume expansion.
   - **`⚡ Volume Surge`**: Heavy tape accumulation ($RVOL \ge 1.2\text{x}$ to $3.0\text{x}$) even if formal news articles are still developing across wires.

---

## 4. Catalysts in the AI Stock Scanner

In the **AI Stock Scanner (Top Tab 3)**, opportunities driven by market catalysts are highlighted with a dedicated **Glowing Amber Catalyst Section**:

```
┌─────────────────────────────────────────────────────────────┐
│ NVDA — NVIDIA Corp.        [⚡ AI Silicon]         [🇺🇸 US]  │
│ Live Quote: $128.50 (+5.20%)         AI Conviction: 92%     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔥 Viral Catalyst                           2.4x Vol    │ │  <── Clickable
│ │ Record Data Center Demand & Blackwell Chip Scale-Out    │ │      Catalyst
│ │ Financial Wire • Active Session        News & AI ↗      │ │      Box
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ SuperTrend: 🟢 Bull • RSI: 58.4 • CMF: +0.22 • VWAP: $125.1 │
├─────────────────────────────────────────────────────────────┤
│ 🧠 AI Thesis & Strategy Confluence:                         │
│ Explosive fundamental catalyst confirmed by 2.4x volume     │
│ surge and heavy Chaikin Money Flow accumulation.            │
├─────────────────────────────────────────────────────────────┤
│ [ + Add to Watchlist ]           [ Deep-Dive in Terminal → ]│
└─────────────────────────────────────────────────────────────┘
```

### Dedicated Screener Strategy
Users can filter specifically for catalyst-driven setups by selecting:
- **Screener Strategy** $\rightarrow$ **`🔥 Breaking Positive News & Parabolic Catalysts`**
- This instantly focuses the scanner universe on stocks with confirmed viral news headlines, earnings surprises, or major volume expansions.

---

## 5. Interactive Catalyst Deep-Dive & News Modal

Clicking anywhere on the orange catalyst card box executes a synchronized deep-dive:

1. **Opens Global News Modal**:
   - Automatically pre-filters and focuses on the exact breaking news headline.
   - Displays the reporting wire, publication timestamp, executive abstract, and a 1-click **"Read Original Article ↗"** link to the publisher's official article.
2. **Prepares Terminal AI Intelligence**:
   - Navigates to the **Stock Deep-Dive Terminal (Top Tab 2)**.
   - Automatically switches to the **AI Analysis Sub-Tab** (`tabPane-ai`), displaying full Bull/Base/Bear 30-day scenarios, Executive Thesis, and Trading Execution Matrix.
3. **Preserves Watchlist & Scanner State**:
   - Maintains your filter selections and candidate counts without triggering redundant exchange API calls.

---

## 6. Global News Modal Features & Filters

The Global News Modal can also be accessed at any time via the **"Breaking News"** top navigation button or the news icon in the stock header:

- **Universal Live Search**: Search news articles instantaneously across all tracked equities by keyword, publisher, or ticker.
- **Wire Category Tabs**:
  - `All Wires`: Complete chronological stream across all international sources.
  - `🚀 High Impact`: Restricts feed to high-conviction catalysts (earnings, contract wins, regulatory clearances).
  - `🏛️ Tier 1 Sources`: Restricts feed exclusively to institutional newsrooms (Reuters, Bloomberg, CNBC, Financial Times).
- **Direct Source Links**: Click any wire item to read the full unabridged story at the source.

---

## 7. Catalyst Trading Strategies & Risk Management

Trading market catalysts offers asymmetric upside but requires disciplined risk management:

### Best Practices:
1. **Confirm Volume Confirmation**: Never buy a headline alone. Ensure the catalyst is validated by $RVOL > 1.2\text{x}$ and positive **Chaikin Money Flow (CMF > 0.0)**.
2. **Respect the Execution Matrix**: Use the automated **Entry Zone**, **ATR Volatility Stop-Loss**, and **Take-Profit (TP1)** targets calculated on the scanner card to preserve capital.
3. **Avoid Chasing Parabolic Extensions**: If RSI(14) is above $75$ or price has extended more than $8\%$ above the daily VWAP, wait for a consolidation pullback into the entry zone before executing.
4. **Watch for Collateral Multi-Market Sympathy**: A major catalyst in a semiconductor leader (e.g. `NVDA` or `TSM`) frequently triggers sympathy breakout runs across the `SMH` ETF basket and suppliers (e.g. `ARM`, `ASML`).
