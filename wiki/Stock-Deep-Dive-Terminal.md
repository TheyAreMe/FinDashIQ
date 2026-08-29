# 🔍 Stock Deep-Dive Terminal (Top Tab 2)

The **Stock Deep-Dive Terminal** is an institutional analytics suite housing 4 specialized sub-tabs for technical charting, algorithmic backtesting, AI scenario forecasting, and fundamental valuation.

---

## 📋 Table of Contents
1. [Search Bar, Presets & Stock Switcher](#1-search-bar-presets--stock-switcher)
2. [Hero Quote Banner & Dynamic Currency](#2-hero-quote-banner--dynamic-currency)
3. [Sub-Tab 1: AI Financial Intelligence & Copilot](#3-sub-tab-1-ai-financial-intelligence--copilot)
4. [Sub-Tab 2: Dynamic Charts & Technical Oscillators](#4-sub-tab-2-dynamic-charts--technical-oscillators)
5. [Sub-Tab 3: Strategy Backtesting & Order Execution Log](#5-sub-tab-3-strategy-backtesting--order-execution-log)
6. [Sub-Tab 4: Multi-Factor Consensus & Fundamentals](#6-sub-tab-4-multi-factor-consensus--fundamentals)

---

## 1. Search Bar, Presets & Stock Switcher

- **Ticker Search Bar**: Enter any single ticker or comma-separated list of symbols (e.g. `NVDA, MSFT, TSM, IFX.DE`).
- **Quick Preset Baskets**:
  - `⚡ AI & Tech Giants`: `NVDA, MSFT, AAPL, GOOGL, META, AMZN, TSM`
  - `🇪🇺 EU Semiconductor & Tech`: `IFX.DE, SAP.DE, ASML.AS`
  - `📊 Global Indices & ETFs`: `EXXT.DE, XDWT.DE, SPY, QQQ`
- **Multi-Stock Switcher Tabs**: When analyzing multiple symbols, interactive tabs appear above the hero header allowing instant sub-millisecond switching between loaded assets without re-fetching data.

---

## 2. Hero Quote Banner & Dynamic Currency

The Hero Quote Banner displays the active security's headline market metrics:
- **Real-Time Price & Session Delta**: Displayed in the user's active base currency (USD, EUR, GBP, CHF, etc.) with automatic forex conversion.
- **Trading Session High & Low**: Daily session range and volume.
- **Quick Actions**: Direct trigger to open the Global News Wire modal filtered for the current company.

---

## 3. Sub-Tab 1: AI Financial Intelligence & Copilot

### Modules:
1. **AI Conviction Gauge**:
   - Algorithmic conviction score (0–100%) and directional rating (*Strong Bullish*, *Bullish*, *Neutral*, *Bearish*).
   - **Calibrated Downturn Damping**: Incorporates adverse trend filters to prevent overly optimistic ratings during steep downtrends (e.g., preventing >80% ratings during major declines).
   - **Breaking News Impact Weighting**: Automatically factors sentiment from real-time news into the final conviction score.
2. **Executive Thesis & Tailwinds**: Fundamental growth drivers, secular sector tailwinds, and critical risk factors.
3. **30-Day Probabilistic Scenarios**:
   - 🟢 **Bull Case Target**: High-momentum scenario with upside target price and technical catalyst.
   - 🔵 **Base Case Target**: Balanced fair-value trajectory based on earnings multiples and median volume.
   - 🔴 **Bear Case Target**: Downside risk level, key support testing zone, and invalidation criteria.
4. **Asymmetric Execution Matrix**:
   - **Dynamic Entry Zone**: Optimal risk-adjusted accumulation range.
   - **Volatility Stop-Loss**: ATR-calibrated capital protection level.
   - **Take-Profit Targets (TP1 & TP2)**: Asymmetric upside targets.
   - **Risk/Reward Ratio (R:R)**: Mathematical risk-adjusted ratio (e.g., `3.2:1`).
5. **Interactive AI Copilot**:
   - Conversational AI assistant for real-time portfolio Q&A, trade setup validation, and risk analysis.
   - Quick prompt suggestion chips:
     - *"Is this a good time to buy?"*
     - *"Key Targets & Stop-Loss"*
     - *"Why this Conviction Score?"*
     - *"Analyze breaking news impact"*

---

## 4. Sub-Tab 2: Dynamic Charts & Technical Oscillators

### Primary Price Chart:
- **Chart Modes**: Candlestick mode (OHLC candle bars) and Area mode (smooth price curve).
- **Timeframe Selector**: `1M`, `3M`, `6M`, `1Y`, `2Y`, `5Y`, `MAX`.
- **Dynamic Technical Overlays**:
  - **SuperTrend (10, 3)**: Green support / Red resistance trailing volatility line.
  - **VWAP**: Daily Volume-Weighted Average Price benchmark.
  - **Moving Averages**: SMA 20, SMA 50, SMA 200, EMA 20, EMA 50, EMA 200.
  - **Bollinger Bands (20, 2.0)**: Upper, Middle, and Lower standard deviation volatility envelopes.
  - **Keltner Channels (20, 1.5 ATR)**: Trend-following volatility channel.

### 4 Sub-Oscillator Panels:
1. **Stochastic Oscillator (14, 3, 3)**: Fast %K and %D lines with overbought (>80) and oversold (<20) zones.
2. **Relative Strength Index (RSI 14)**: Momentum curve with 70 overbought and 30 oversold boundary lines.
3. **MACD (12, 26, 9)**: Fast MACD Line, 9-period Signal Line, and color-coded momentum histogram.
4. **Chaikin Money Flow (CMF 20)**: Institutional accumulation (>0) vs distribution (<0) flow gauge.
5. **Volume Bar Panel**: Session volume with 20-day moving average volume overlay.

---

## 5. Sub-Tab 3: Strategy Backtesting & Order Execution Log

Simulate algorithmic execution on historical bars across configurable timeframes (1M to MAX):

- **3 Algorithmic Strategies**:
  1. *Multi-Factor Quant Strategy* (SuperTrend + CMF + RSI)
  2. *SuperTrend Breakout Strategy* (ATR Trailing Volatility)
  3. *MACD + RSI Momentum Strategy* (Mean-Reversion Momentum)
- **Comprehensive Scorecards**:
  - **Total Strategy Return**: Cumulative profit/loss on $10,000 baseline capital.
  - **Buy & Hold Benchmark**: Passive investment comparison.
  - **Alpha (Excess Return)**: Strategy Return minus Buy & Hold Return.
  - **Win Rate (%)**: Percentage of profitable closed trades.
  - **Profit Factor**: Ratio of gross profits to gross losses.
  - **Maximum Drawdown (%)**: Peak-to-trough capital decline.
- **Dynamic Compounding Equity Curve**: Interactive portfolio progression chart vs Buy & Hold.
- **Simulated Order Execution Ledger**: Detailed trade ledger showing date, action (BUY/SELL), execution price, shares, realized PnL ($ and %), and exact signal trigger rationale.

---

## 6. Sub-Tab 4: Multi-Factor Consensus & Fundamentals

- **Consensus Verdict Rating**: Multi-signal composite verdict (*Strong Buy*, *Buy*, *Neutral*, *Sell*, *Strong Sell*).
- **Consensus Signal Distribution Meter**: Visual gauge breaking down Bullish, Neutral, and Bearish indicator counts.
- **Fundamental & Valuation Statistics**:
  - Market Capitalization (converted to base currency)
  - Trailing P/E and Forward P/E
  - Beta (market sensitivity)
  - Dividend Yield (%)
  - Average Daily Volume & Average True Range (ATR)
  - Interactive 52-Week Price Range Slider with current price marker
