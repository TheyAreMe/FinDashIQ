# 🧪 Strategy Backtesting & Simulation Studio Guide (Top Tab 3)

FinDashIQ includes a dedicated, institutional-grade quantitative backtesting and simulation studio. It enables quant researchers, portfolio managers, and active traders to rigorously evaluate algorithmic trading models against historical market data, benchmark performance against Buy & Hold, inspect compounding equity and underwater drawdown profiles, cross-compare strategies in a side-by-side matrix, audit zero-lookahead order execution ledgers, export trade logs to CSV, and transition quantitative setups directly into an active Forward Paper Trading Hub.

---

## 📋 Table of Contents
1. [Architecture & Studio Overview](#1-architecture--studio-overview)
2. [Asset Management & Watchlist Synchronization](#2-asset-management--watchlist-synchronization)
3. [Execution Modes & Simulation Horizons](#3-execution-modes--simulation-horizons)
4. [Risk Controls & Friction Parameters](#4-risk-controls--friction-parameters)
5. [Supported Algorithmic Strategies](#5-supported-algorithmic-strategies)
6. [Performance Metrics & Institutional Scorecards](#6-performance-metrics--institutional-scorecards)
7. [Dual-Pane Interactive Visualizations](#7-dual-pane-interactive-visualizations)
8. [Multi-Strategy Comparative Benchmark Matrix](#8-multi-strategy-comparative-benchmark-matrix)
9. [Simulated Order Execution Ledger & CSV Audit](#9-simulated-order-execution-ledger--csv-audit)
10. [Forward Paper Trading Hub & Execution Modal](#10-forward-paper-trading-hub--execution-modal)

---

## 1. Architecture & Studio Overview

The Strategy Backtesting Studio operates as a standalone primary workspace accessible via **Top Tab 3** in the main navigation bar. Unlike basic calculators, FinDashIQ's backtesting engine incorporates:
- **Zero-Lookahead Point-in-Time Simulation**: Orders execute strictly at the close or opening of successive price bars, preventing lookahead bias.
- **Realistic Friction Modeling**: Incorporates user-defined slippage and broker commissions per round-trip trade.
- **Dynamic Position Sizing**: Automatically computes discrete share quantities based on fluctuating portfolio equity or fixed capital baselines.
- **Bidirectional Market Regimes**: Supports long-only spot allocation as well as active long/short derivatives simulation.

---

## 2. Asset Management & Watchlist Synchronization

Located in the top header card of the Backtesting Studio, the asset management bar allows fluid switching and portfolio synchronization:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🧪 Strategy Backtesting & Simulation Studio               [🔍 Search Asset] │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📑 Backtest Asset:  [🔄 Sync to Watchlist]                                  │
│ [NVDA ✕]  [MSFT ✕]  [AAPL ✕]  [AMZN ✕]  [GOOGL ✕]  [TSLA ✕]                │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Dynamic Asset Tabs**: Click any ticker tab to immediately run the full quantitative simulation on that asset with 0ms delay. The active asset tab is highlighted with an institutional glowing border.
- **🔄 Sync to Watchlist Button**: Clicking `Sync to Watchlist` queries your current active portfolio watchlist and seamlessly synchronizes your backtesting asset tabs. An asynchronous spinner indicates synchronization progress and turns into a green `Synced!` state upon completion.
- **🔍 Search Asset**: Opens the international search modal, allowing you to load any US, European, Asian, or ETF ticker (e.g. `SAP.DE`, `2330.TW`, `SPY`, `SMH`) into the backtesting workspace.
- **Inline Removal (`✕`)**: Remove tickers from your backtest tabs without impacting your permanent watchlist.

---

## 3. Execution Modes & Simulation Horizons

### Execution Modes
1. **Long-Only (Spot Equity Mode)**:
   - Reflects traditional cash equity accounts.
   - When a bullish entry signal triggers, the portfolio enters long.
   - When a bearish signal or stop-loss triggers, the position is liquidated entirely into **Cash** (0% market exposure), preserving capital during severe macro downturns.
2. **Long & Short (Derivatives / Futures Mode)**:
   - Reflects long/short hedge fund or perpetual swap trading.
   - Bullish triggers initiate Long positions.
   - Bearish reversals close Longs and immediately open **Short** positions, generating profit from falling prices.

### Simulation Horizons (Timeframes)
The studio provides 8 customizable historical lookback horizons:
- `1M`: 1 Month (High-frequency recent micro-regimes)
- `3M`: 3 Months (Quarterly earnings and momentum cycles)
- `6M`: 6 Months (Medium-term trend validation)
- `1Y` *(Default)*: 1 Year (Annual institutional benchmarking)
- `2Y`: 2 Years (Multi-regime cycle testing)
- `3Y`: 3 Years (Extended intermediate evaluation)
- `5Y`: 5 Years (Full bull/bear market cycle stress test)
- `MAX`: Complete historical bar data available from data providers

---

## 4. Risk Controls & Friction Parameters

FinDashIQ allows direct customization of risk parameters in the control toolbar. Every change triggers instantaneous real-time recalculation of the model:

| Parameter | Default | Range | Description |
| :--- | :--- | :--- | :--- |
| **Initial Capital** | `$10,000` | `$500` – `$1,000,000+` | Initial cash baseline deployed at the beginning of the simulation period. |
| **Stop-Loss (%)** | `5.0%` | `0.5%` – `30.0%` | Hard protective stop price calculated from execution entry price. Exits immediately if breached. |
| **Take-Profit (%)** | `12.0%` | `1.0%` – `100.0%` | Target profit threshold. Closes position when favorable price movement reaches this objective. |
| **Slippage & Fee (%)** | `0.10%` | `0.00%` – `2.00%` | Combined percentage friction applied per executed trade to simulate bid-ask spread and broker commissions. |

---

## 5. Supported Algorithmic Strategies

The studio features 8 specialized quantitative strategies plus the flagship Omni-Consensus Master Ensemble:

### 1. 👑 Omni-Consensus Master Ensemble (`omni_consensus`)
- **Concept**: The ultimate quantitative confluence system. Aggregates signals across all 9 technical and momentum indicators: SuperTrend, Chaikin Money Flow (CMF 20), RSI (14), MACD (12, 26, 9), Stochastic (14, 3, 3), Bollinger Bands (20, 2σ), EMA 9/21 cross, SMA 50/200 cross, and Volume surge.
- **Entry Rules**: Requires consensus weighted score exceeding +60% institutional bullish conviction.
- **Exit Rules**: Consensus score drops below neutral (+15%), or protective stop-loss/take-profit triggers.

### 2. 🤖 AI Conviction Model (`ai_conviction`)
- **Concept**: Employs FinDashIQ's proprietary multi-factor AI conviction engine with adaptive market downturn damping.
- **Entry Rules**: AI Conviction score crosses above the institutional threshold (≥ 70%).
- **Exit Rules**: AI Conviction falls below 40% (or switches to Bearish stance in Long & Short mode).

### 3. 📈 SuperTrend ATR Trend Following (`supertrend`)
- **Concept**: Classical volatility breakout system using 10-period Average True Range (ATR) with a 3.0 multiplier.
- **Entry Rules**: Price closes above the upper ATR band, turning the trailing line green.
- **Exit Rules**: Price closes below the trailing support line, flipping the regime to red resistance.

### 4. ⚡ EMA Golden / Death Cross (`ema_cross`)
- **Concept**: High-speed trend-following momentum strategy utilizing exponential moving averages.
- **Entry Rules**: 9-period EMA crosses above 21-period EMA (Golden Cross).
- **Exit Rules**: 9-period EMA crosses below 21-period EMA (Death Cross).

### 5. 🎯 Bollinger Bands Mean Reversion (`bollinger`)
- **Concept**: Statistical mean-reversion model based on standard deviation price envelopes (20 SMA, 2.0σ).
- **Entry Rules**: Price tags or pierces the lower 2.0σ band and prints a reversal bar.
- **Exit Rules**: Price touches or exceeds the upper 2.0σ band or returns to the 20-period moving average baseline.

### 6. 🌊 MACD + RSI Dual Momentum (`momentum`)
- **Concept**: Combines trend convergence/divergence with relative strength boundary filters.
- **Entry Rules**: Fast MACD line (12, 26) crosses above the 9-period signal line while RSI (14) is expanding above 40 (preventing false breakouts).
- **Exit Rules**: MACD line crosses below signal line, or RSI reaches overbought exhaustion (> 75).

### 7. ⚡ Stochastic Oscillator Cross (`stochastic`)
- **Concept**: Sensitive swing-trading model identifying turning points in cyclical market swings.
- **Entry Rules**: %K line crosses above %D line while in oversold territory (< 20).
- **Exit Rules**: %K line crosses below %D line while in overbought territory (> 80).

### 8. 💧 Chaikin Money Flow Volume Breakout (`cmf_breakout`)
- **Concept**: Volume-weighted accumulation/distribution indicator tracking smart money accumulation.
- **Entry Rules**: CMF (20) crosses above +0.05 with positive price slope.
- **Exit Rules**: CMF crosses below 0.00, signaling institutional distribution.

---

## 6. Performance Metrics & Institutional Scorecards

The performance scorecard ribbon displays 5 key institutional audit cards:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Return vs Bench │ Portfolio Grow  │ Win Rate & Trd  │ Risk & Profit F │ Sharpe & Sortin │
│ +48.20%         │ $14,820.00      │ 68.4%           │ 2.45x           │ 1.84            │
│ B&H: +18.5%     │ Pos: In Cash    │ 19 Trades       │ MDD: -6.80%     │ Sortino: 2.92   │
│ Alpha: +29.70%  │                 │ (13W / 6L)      │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

1. **Strategy Return vs Benchmark**:
   $$\text{Total Return} = \frac{\text{Ending Capital} - \text{Initial Capital}}{\text{Initial Capital}} \times 100$$
   $$\text{Alpha} = \text{Strategy Return (\%)} - \text{Buy \& Hold Return (\%)}$$
2. **Portfolio Growth**:
   Displays exact dollar value from the $10,000 baseline along with the active position state (`In Cash`, `Long`, or `Short`).
3. **Win Rate & Closed Trades**:
   $$\text{Win Rate} = \frac{\text{Winning Closed Trades}}{\text{Total Closed Trades}} \times 100$$
4. **Profit Factor & Maximum Drawdown (MDD)**:
   $$\text{Profit Factor} = \frac{\sum \text{Gross Realized Profits (\$)}}{\sum |\text{Gross Realized Losses (\$)}|}$$
   $$\text{MDD} = \max_{t \in [0, T]} \left( \frac{\text{Peak Equity} - \text{Trough Equity}_t}{\text{Peak Equity}} \right) \times 100$$
5. **Sharpe & Sortino Ratios**:
   - **Sharpe Ratio**: Annualized return divided by total volatility (standard deviation of daily returns).
   - **Sortino Ratio**: Downside-calibrated metric dividing annualized excess return by downside deviation only, penalizing negative volatility without penalizing upside windfalls.

---

## 7. Dual-Pane Interactive Visualizations

The studio features two vertically stacked, synchronized SVG chart panes:

### Upper Pane: Primary Compounding Equity Curve
- **Green Solid Line**: Algorithmic strategy equity progression, factoring in compounded capital, realized trade outcomes, open position mark-to-market valuations, and fee deductions.
- **Slate Gray Dashed Line**: Buy & Hold baseline investment ($10,000 buy-at-open, hold-to-close).
- **Interactive Inspection**: Hover across any date on the timeline to inspect portfolio balance, active drawdowns, and market benchmark comparison.

### Lower Pane: Performance Relative to Initial Investment
- **Emerald Green Area Chart**: Visualizes the cumulative percentage return (% gain/loss) of the algorithmic strategy relative to initial starting capital ($0.0\%$ baseline).
- **Slate Gray Dashed Line**: Buy & Hold baseline return relative to initial investment.
- **Zero-Baseline Reference**: Clean horizontal demarcation separating net capital gains ($> 0\%$) from capital drawdowns below starting capital ($< 0\%$).

---

## 8. Multi-Strategy Comparative Benchmark Matrix

Located directly below the primary charts, the **Comparative Benchmark Matrix** simultaneously executes all 8 quantitative models plus Buy & Hold against the active asset.

| Strategy | Mode | Total Return | Alpha vs B&H | Win Rate | Profit Factor | Sharpe | Sortino | Max Drawdown | Closed Trades | Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Omni-Consensus** | Long-Only | **+48.20%** | **+29.70%** | 68.4% | 2.45x | 1.84 | 2.92 | -6.80% | 19 | `[Active]` |
| **SuperTrend** | Long-Only | +38.15% | +19.65% | 60.0% | 1.95x | 1.52 | 2.21 | -9.40% | 15 | `[Select]` |
| **AI Conviction** | Long-Only | +42.80% | +24.30% | 64.7% | 2.18x | 1.68 | 2.65 | -8.10% | 17 | `[Select]` |
| **Bollinger Reversion** | Long-Only | +22.40% | +3.90% | 72.0% | 1.80x | 1.30 | 1.85 | -7.20% | 25 | `[Select]` |
| **Buy & Hold** | Passive | +18.50% | 0.00% | — | — | 0.92 | 1.10 | -18.20% | 1 | `[Benchmark]` |

- Clicking **"Select"** on any strategy row instantly switches the primary equity curve, scorecards, and order ledger to that model with zero page reload.

---

## 9. Simulated Order Execution Ledger & CSV Audit

The Order Execution Ledger provides complete mathematical traceability for every trade generated during the backtest period:

### Columns & Data Points
- **#**: Sequential chronological trade number.
- **Action**: Execution type (`BUY`, `SELL`, `SHORT`, `COVER`).
- **Entry Date & Exit Date**: Exact bar timestamps of trade entry and liquidation.
- **Execution Price**: Bar closing or opening price at trade execution.
- **Trade PnL ($)**: Dollar gain or loss after slippage and brokerage fees.
- **Return (%)**: Percentage gain or loss for the round trip.
- **Portfolio Capital**: Total account balance following trade settlement.
- **Indicator Trigger / Exit Reason**: Explicit mathematical reason for trade initiation or closure (e.g. *"SuperTrend Bullish Flip (CMF: +0.18)"*, *"Stop-Loss Breached (-5.0%)"*, or *"Take-Profit Target Hit (+12.0%)"*).

### Filtering & Audit Export
- **Quick Filters**: Filter the table by `All Trades`, `Wins Only`, or `Losses Only`.
- **📥 Export CSV Button**: Downloads the complete trade log formatted as an RFC-4180 compliant `.csv` file for institutional audits, external Monte Carlo simulation, or spreadsheet reporting.

---

## 10. Forward Paper Trading Hub & Execution Modal

Directly below the trade ledger lies the **Active Virtual Positions & Forward Paper Trading Hub**. This bridge allows traders to transition validated backtest setups into live simulated tracking without risking capital.

### Active Virtual Positions Table
Tracks live forward paper trades with real-time mark-to-market prices:
- **Ticker & Side**: Symbol, Long vs Short indicator.
- **Shares & Entry Price**: Exact quantity and executed fill price.
- **Current Price & Valuation**: Real-time quote and total allocated capital.
- **Unrealized PnL**: Real-time gain or loss formatted in green/red ($ and %).
- **Stop-Loss & Take-Profit Targets**: Live monitoring against active price bars.
- **Close Position**: 1-click execution to close out the position at current market price.

### Enhanced Execution Modal (`+ New Paper Trade`)
Clicking `+ New Paper Trade` opens the wide, streamlined execution modal:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 🚀 Execute Forward Paper Trade                                         [✕]│
├───────────────────────────────────────────────────────────────────────────┤
│ Quick Watchlist: [NVDA] [MSFT] [AAPL] [AMZN] [GOOGL] [TSLA]              │
│ Search: [Enter symbol or company...]                                      │
├───────────────────────────────────────────────────────────────────────────┤
│ Order Side:   [🟢 Buy / Long]    [🔴 Sell / Short]                       │
│ Capital:      [$1,000] [$2,500] [$5,000] [$10,000] [$25,000]              │
│ Entry Price:  [$178.45] [⚡ Live Price]  Allocates ~28.02 shares          │
│ Stop Loss:    [$169.53] (-5.0%)  Presets: [-3%] [-5%] [-8%] [-10%] [-15%] │
│ Take Profit:  [$199.86] (+12.0%) Presets: [+6%] [+10%] [+12%] [+18%] [+25%]│
├───────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Asymmetric Risk / Reward:  2.40 : 1                                │ │
│ │ Capital at Risk: $250.00  │  Potential Reward: $600.00  │  28 Shares   │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│ [Cancel]                                             [Submit Paper Trade] │
└───────────────────────────────────────────────────────────────────────────┘
```

1. **Quick Asset Pills**: Click any watchlist pill (`NVDA`, `MSFT`, etc.) to switch the target asset instantly with 0ms latency.
2. **Order Side Toggle**: Segmented 2-button control for `Buy / Long` vs `Sell / Short`.
3. **Quick Capital Chips**: 1-click allocation buttons (`$1k`, `$2.5k`, `$5k`, `$10k`, `$25k`) that automatically calculate discrete share counts.
4. **Live Price Sync**: Synchronize entry price with current live bid/ask via `Live Price` button.
5. **Dynamic SL / TP Percentage Chips**: Instant preset buttons (`-3%`, `-5%`, `-8%`, `-10%`, `-15%` for stops; `+6%`, `+10%`, `+12%`, `+18%`, `+25%` for targets) with live price distance badges.
6. **Live Asymmetric Risk / Reward Card**: High-contrast calculation displaying real-time R:R ratio, Dollar Capital at Risk ($), Potential Reward ($), and total share allocation.
