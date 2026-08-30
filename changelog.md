# 📋 Changelog

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