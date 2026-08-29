# 🧪 Strategy Backtesting & Order Execution Guide

FinDashIQ includes an institutional-grade quantitative backtesting engine that simulates algorithmic strategies on historical market data, compares performance against a $10,000 Buy & Hold benchmark, and provides complete order execution audit logs across selectable timeframes.

---

## 📋 Table of Contents
1. [Supported Algorithmic Strategies](#1-supported-algorithmic-strategies)
2. [Timeframe Selection](#2-timeframe-selection)
3. [Performance Metrics & Scorecards](#3-performance-metrics--scorecards)
4. [Dynamic Compounding Equity Curve](#4-dynamic-compounding-equity-curve)
5. [Simulated Order Execution Ledger](#5-simulated-order-execution-ledger)

---

## 1. Supported Algorithmic Strategies

### 1. Multi-Factor Quant Strategy (`quant`)
- **Concept**: Institutional confluence system combining trend confirmation, institutional volume accumulation, and momentum bounds.
- **Entry Rules**: 
  - SuperTrend (10, 3) is Bullish (Green) **AND**
  - Chaikin Money Flow (CMF 20) > +0.05 (Institutional accumulation) **AND**
  - RSI (14) is between 40.0 and 65.0 (Healthy expansion territory).
- **Exit Rules**:
  - SuperTrend flips to Bearish (Red) **OR**
  - RSI (14) rises above 75.0 (Overbought exhaustion / profit-taking) **OR**
  - Price breaches the ATR-based volatility stop-loss.

### 2. SuperTrend Trend-Following Strategy (`supertrend`)
- **Concept**: Classical trend-following breakout model utilizing Average True Range (ATR) trailing stops.
- **Entry Rules**: Price crosses and closes above the trailing SuperTrend line (turning support green).
- **Exit Rules**: Price closes below trailing SuperTrend support (turning resistance red).

### 3. MACD + RSI Momentum Strategy (`macd_rsi`)
- **Concept**: Mean-reversion and momentum crossover system designed to catch momentum reversals out of oversold extremes.
- **Entry Rules**:
  - Fast MACD Line (12, 26) crosses above the 9-period Signal Line **AND**
  - RSI (14) is exiting oversold territory (> 35.0).
- **Exit Rules**:
  - MACD Line crosses below Signal Line **OR**
  - RSI (14) exceeds 70.0 (Overbought).

---

## 2. Timeframe Selection

Backtests can be evaluated across multiple historical time horizons:
- `1M` — 1 Month (High-frequency recent validation)
- `3M` — 3 Months (Quarterly cycle)
- `6M` — 6 Months (Medium-term momentum)
- `1Y` — 1 Year (Annual cycle)
- `2Y` — 2 Years (Multi-cycle testing)
- `5Y` — 5 Years (Long-term structural performance)
- `MAX` — All Available History

---

## 3. Performance Metrics & Scorecards

FinDashIQ evaluates each strategy against a standardized $10,000 initial capital baseline:

| Metric | Calculation / Definition | Benchmark Objective |
| :--- | :--- | :--- |
| **Total Strategy Return** | Cumulative capital return from $10,000 initial capital | Outperform Buy & Hold |
| **Buy & Hold Benchmark** | Passive investment return over identical period | Baseline asset return |
| **Alpha (Excess Return)** | Strategy Return (%) − Buy & Hold Return (%) | Positive Alpha (> 0.0%) |
| **Win Rate** | Winning Closed Trades / Total Completed Trades (%) | > 55.0% Target |
| **Profit Factor** | Gross Dollar Profits ($) / Gross Dollar Losses ($) | > 1.50 Target |
| **Maximum Drawdown (MDD)** | Largest peak-to-trough equity decline (%) | Lower Drawdown than Benchmark |

---

## 4. Dynamic Compounding Equity Curve

The interactive equity chart visualizes portfolio balance progression over time:
- **Cyan/Purple Line**: Algorithmic strategy equity curve compounding realized trades and open position equity.
- **Dashed Gray Line**: Baseline Buy & Hold portfolio trajectory.
- **Interactive Tooltips**: Hover to inspect portfolio value, drawdown level, and active position at any date.

---

## 5. Simulated Order Execution Ledger

The simulated ledger provides zero-lookahead auditability for every trade:

| Field | Description | Example |
| :--- | :--- | :--- |
| **Date** | Exact timestamp of execution bar | `2026-03-15` |
| **Action** | Trade direction | `BUY` or `SELL` |
| **Price** | Asset price at execution bar | `$175.40` |
| **Shares** | Computed position size | `57 shares` |
| **Realized PnL** | Dollar and percentage gain/loss | `+$1,420.50 (+14.2%)` |
| **Signal Reason** | Detailed indicator trigger conditions | `SuperTrend Bullish Flip (CMF: +0.18)` |
