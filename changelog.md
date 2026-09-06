# 📋 Changelog

## v0.1.3 ➔ v0.1.4 Delta

### 🎮 Strategy Backtesting & Simulation Studio
- **Dedicated Backtesting Studio Top Tab**: Introduced a multi-factor backtesting suite with selectable historical timeframes (1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, MAX), Long-Only / Long & Short simulation modes, and custom risk parameters (Stop-Loss %, Take-Profit %, Slippage & Fees %).

### 🔄 In-App System Updates & Release Tracking
- **GitHub Releases Update Checker**: Automated version comparison against official GitHub releases (`TheyAreMe/FinDashIQ/releases`).
- **Administrator Updates Tab**: Added dedicated System Updates management tab in the profile modal displaying release notes, upgrade commands, and release history.

### 📈 Historical AI Conviction Graph
- **Historical Conviction Over Time (0–100%)**: Added backwards-calculated AI Conviction Score chart as the second graph in the Charts & Technicals subtab to see stability of conviction over time.

---------------------------------------------------------------
## v0.1.2 ➔ v0.1.3 Delta

### 🔍 Stock Scanner Improvements
- **Default Conviction (≥ 85%)**: Elevated default screener conviction to elite institutional setups (≥ 85%).
- **Live Timing & Countdown Sync**: Changing scan method to be background triggered and not frontend based. (Admins can set the interval from the scanner tab)
- **Unified Split Hero Header**
- **Aligned Action Controls for Stock Scanner**

---------------------------------------------------------------
## v0.1.1 ➔ v0.1.2 Delta

### 🔍 Stock Scanner & Market Universes
- **Massive Universe Expansion (276+ Assets)**: Expanded the institutional screening universe from 137 to 276+ liquid global equities and benchmark ETFs across US, Europe, Asia-Pacific, Emerging Markets, Clean Energy, and Sector Baskets.
- **Refined Regional Market Selectors**: Replaced Windows-unsupported flag emojis with universally compatible symbols (`🏛️`, `🏰`, `🌏`, `⚡`, `🌿`, `📊`) and separated Asia-Pacific from Emerging Markets.
- **Watchlist Catalyst Indicator Dots**: Integrated pulsing amber catalyst dots and interactive hover popovers onto Watchlist cards and table views whenever extraordinary market events occur (heavy volume surges ≥1.35x, high-impact breaking news, large session moves ≥3.0%, or extreme RSI oversold setups).
- **Cleaned Scanner Controls**: Removed redundant quick presets, repositioned the "Exclude watchlist stocks" toggle under scan buttons with refined compact margin.

### 🎨 Theme & UI
- **Uniform Card Alignment**: Addition of header indicator dots ensures all scanner cards in the grid align cleanly at uniform heights.

### 📖 Documentation & Wiki
- **Interactive Documentation**: Updated interactive help guide in `help_modal.html` and `AI-Stock-Scanner-Guide.md` with catalyst indicator dot details, volume surge formulas, and market basket breakdowns.

---------------------------------------------------------------
## v0.1.0 ➔ v0.1.1 Delta

### 🎨 Theme & UI
-

### 🔔 Signal Alerts & Dispatch Engine
- **Global Watchlist Triggers**: Added portfolio-wide alert monitoring (`*WATCHLIST*`) to track all holdings simultaneously.
- **Simplified Alert Form**: Removed redundant condition and threshold input parameters in favor of automated indicator inference.
- **Telegram Smart Dispatcher**: Added automatic chat ID resolution via `getUpdates`, inline token support (`TOKEN:CHAT_ID`), and explicit error guidance.
- **Autonomous Background Monitoring Engine**: Added persistent background polling with an interactive slider (1 min to 24 hours), live countdown timer, pulse indicator, manual scan trigger, and pause control.

### 📖 Documentation & Wiki
- **Wiki Hub**: Updated documentation topics in `help_modal.html`.
- **Asset Cache Busting**: Updated asset versioning to force client cache reloads.