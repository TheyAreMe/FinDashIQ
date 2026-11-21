# 📋 Changelog

## v0.1.5 ➔ v0.1.6 Delta

### 🛡️ Gunicorn Cluster Telemetry & Active RAM Defragmentation
- **Multi-Worker Cluster Introspection**: Maintenance tab now discovers and aggregates total memory across all active Gunicorn workers and master process on Linux procfs, with individual worker PID breakdowns.
- **Zero-Downtime Rolling Worker Recycling**: 1-Click "Optimize Memory Now" orchestrates rolling worker recycling under Gunicorn to completely flush fragmented CPython/glibc heap pages (Pandas/yfinance) back to the OS kernel with 0 lost client sessions.
- **Autonomous Memory Watchdogs**: Embedded memory watchdogs in `gunicorn.conf.py`, `CacheRegistry`, `ScannerService`, and `StockService` automatically recycle workers exceeding 250 MB RSS.
- **Glibc Heap Fragmentation Shield**: Enforced `MALLOC_ARENA_MAX=2` in systemd unit definitions and via C `mallopt(-8, 2)` calls, eliminating 64-arena address space explosions.
- **Lean WSGI Sizing**: Standardized systemd service on `gunicorn -c gunicorn.conf.py` with 2 workers / 4 threads (8 concurrent connections) and `max_requests=60` to reduce server RAM usage by >60%.

### 🧠 Multi-Provider AI Engine & Streaming Copilot
- **Multi-Provider AI Catalog & Unified Adapter**: Added full support alongside **Built-in Quant** fallback for:
  - **Google Gemini**: `gemini-4-hydrogen`, `gemini-4-neon`, `gemini-4-carbon`, `gemini-4-argon` (with `thinkingLevel` `"LOW"`/`"HIGH"` support via `x-goog-api-key` headers) plus free-tier fallbacks (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`).
  - **Anthropic Claude**: `claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-opus-5-5`, `claude-fable-5-2`.
  - **OpenAI GPT-6**: `gpt-6.1-sol`, `gpt-6-luna`, `gpt-6.1-terra`, `gpt-6-astra`, `gpt-6.2-astra` (`max_completion_tokens` formatting).
- **Enhanced AI Modal & Diagnostics**: Added provider selector, custom model ID override, live model discovery (`/api/ai/models`), unified `/api/test-ai` endpoint (keeping `/api/test-gemini` alias) with granular `quota_zero`, `503` overload, timeout (30–45s), and `/v1beta/models` key validation diagnostics.
- **SSE Streaming & Conversation Continuity**: Added real-time Server-Sent Events (`/api/ai-chat/stream`) in the AI Copilot drawer with multi-turn per-ticker chat history, markdown table/code rendering, copy-answer toolbar, prompt timeseries compression (`_compress_timeseries_context`), and `provider + model` namespaced analysis caching.

### 🔒 Security Hardening & Dependency Upgrades
- **Authentication, CSRF & Rate Limiting**: Enforced authentication across protected API routes, CSRF token + origin validation on mutating endpoints, sliding-window API rate limits (`rate_limiter`), progressive login backoff/lockout (`login_protector`), and optional Cloudflare Turnstile verification.
- **Encrypted BYOK Keys & Secrets**: Encrypted stored per-user API keys with Fernet (`enc:v1:`) and masked `keyHints`, removed the hardcoded default `admin123` password (using `ADMIN_BOOTSTRAP_PASSWORD` or an auto-generated first-boot password + 12-character minimum password enforcement), and added atomic JSON file saves (`users.json`).
- **Network, CSP & Pipeline Hardening**: Added SSRF validation and redirect blocking (`allow_redirects=False`) on Discord/custom outbound webhooks, nonce-based CSP (removing `'unsafe-eval'`), conditional HSTS headers, pinned SRI CDN scripts (`lucide@1.77.0`, lazy-loaded `apexcharts@8.9.1`), and `http.extraHeader` auth for the `.gitlab-ci.yml` GitHub mirror sync.
- **Updated Dependencies & Automated Tests**: Upgraded core Python packages (`werkzeug`, `pandas`, `numpy`, `yfinance`, `gunicorn`, `python-dotenv`, `cryptography`) and added automated unit/integration test suites (`tests/test_ai_and_app.py`, `tests/test_security_and_features.py`).

### ⚡ Performance, UX, Signals & PWA
- **Asset Bundling & Response Caching**: Added `scripts/build_assets.py` generating minified `static/dist/style.min.css` and `static/dist/app.bundle.min.js`, cached gzip compression (skipping SSE streams), deferred lazy ApexCharts loading, and mtime-invalidated `users.json` caching.
- **Technical Confluence & Data Portability**: Added the 6-oscillator Technical Confluence Gauge across Watchlist cards and AI views, plus two-way CSV/JSON Watchlist & Scanner Universe import/export endpoints and UI modal.
- **Live Demo, PWA & UI Polish**: Added Read-Only Live Demo Showcase mode (`/api/demo/showcase`), PWA manifest & service worker (`/manifest.json`, `/sw.js`), mobile chart controls drawer & touch zoom/pan ergonomics, keyboard/ARIA accessible modals, toasts, and custom confirmation dialogs.

### 🐛 Bug Fixes & Reliability
- **Deep Dive Graph Loading**: Included chart `timeseries` and `period` metadata in Stage 1 (`includeTimeseries`) so all 6 Deep Dive charts render without waiting on Stage 2 LLM latency, fixed Watchlist/Modal/Search handoff races (`skipAutoAnalyze`), aligned server-resolved ticker adoption, deferred hidden-container renders to avoid 0px widths, upgraded `5Y`/`MAX` historical depth checks, and raised `/api/analyze` limit to 60/min.
- **Newly Listed IPO Support (1–4 Bars)**: Added ATR/VWAP/CMF calculation, limited-history technical summaries, and fallback AI thesis generation for brand-new IPOs (e.g., `ANT` with 2 daily bars) across Watchlist cards (`isFastHydration` fix) and Deep Dive charts.
- **Backtesting Studio Short-History Handling**: Fixed stale lower `% Net Return` chart, scorecards, and benchmark matrix retention on short-history/insufficient-history stocks (`clearBacktestStudioViews`), lowered minimum simulation bars to `2` in `backtest_engine.js` and `backtest_worker.js`, and clamped X-axis bounds with visible date labels to actual available recent sessions.
- **Backend Imports**: Added missing top-level `sys` and `news_service` imports in `services/stock_service.py`, resolving the `[StockService] Periodic warmup error: name 'sys' is not defined` background error and restoring primary multi-source news aggregation.


---------------------------------------------------------------
## v0.1.4 ➔ v0.1.5 Delta

### 🛡️ Administrator Server Maintenance & Memory Optimization
- **Dedicated Admin Maintenance Tab**: Added an admin-only Maintenance tab inside the Profile & Preferences modal with live server telemetry tracking FinDashIQ process

### ⚡ Performance & Maintainability
- **RAM Optimization**: Reduced memory footprint through streamlined in-memory caching and cache cleanup.
- **Code Maintainability**: Refactored core modules, reduced redundancy, and improved codebase structure.

---------------------------------------------------------------
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