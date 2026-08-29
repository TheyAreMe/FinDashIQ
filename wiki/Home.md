# ⚡ FinDashIQ Wiki & Operational Documentation Hub

Welcome to the **FinDashIQ Knowledge Base & Operational Documentation**. FinDashIQ is an institutional-grade quantitative financial analytics terminal combining multi-factor technical indicators, persistent watchlist intelligence, dynamic strategy backtesting, automated AI investment synthesis, real-time multi-currency conversion, and multi-channel signal notification rules.

---

## 📚 Complete Documentation Chapters

### 📊 1. Core Terminal Views
- **[Watchlist & Market Intelligence Hub](Watchlist-and-Market-Hub.md)** — Real-time price tracking, dual Card/Table view modes, drag-and-drop reordering, SVG trend sparklines, multi-factor conviction gauges, CMF/VWAP/RSI/SuperTrend metric bars, company search modal, and asset basket management.
- **[Stock Deep-Dive Terminal Guide](Stock-Deep-Dive-Terminal.md)** — Search terminal, multi-stock tabs, AI investment thesis, 30-day probabilistic scenarios, execution matrix, interactive AI Copilot, dynamic candlestick charts, technical oscillators, and multi-factor consensus.
- **[AI Stock Scanner & Opportunity Discovery](AI-Stock-Scanner-Guide.md)** — Multi-factor thematic screener, ecological & ESG asset filtering (85–98/100), buy recommendations outside active watchlist, asymmetric execution matrices, and 1-click tracking.
- **[Strategy Backtesting & Order Execution](Strategy-Backtesting-Guide.md)** — Algorithmic strategies (Multi-Factor Quant, SuperTrend, MACD+RSI), multi-timeframe analysis (1M to MAX), alpha calculations, win rates, profit factor, drawdown scorecards, dynamic equity curves, and order execution ledgers.

---

### 🌐 2. Market Intelligence & Dynamic Forex
- **[Global Breaking News & Market Catalysts](Global-News-and-Market-Catalysts.md)** — International breaking news wire, multi-language feed aggregation (Reuters, Bloomberg, CNBC, Handelsblatt, Nikkei, etc.) with automatic English translation, high-impact catalyst filters, and sentiment weighting.
- **[Multi-Currency & Dynamic Forex Engine](Multi-Currency-and-Forex-Engine.md)** — Real-time dynamic multi-currency conversion across 10 global currencies (USD, EUR, GBP, CHF, NOK, JPY, CAD, AUD, SEK, DKK) with forex rate caching and instant UI recalculation.

---

### 🔔 3. Signal Change Alerts & Notifications Hub
- **[Configuring Notifications & Triggers](Configuring-Notifications.md)** — Multi-factor trigger rules across 4 quantitative indicator categories, condition evaluation logic, channel dispatch, testing simulation, and alert lifecycle management.
- **[Telegram Bot Setup Guide](Telegram-Bot-Setup.md)** — Connecting Telegram Bots via `@BotFather` and configuring Chat IDs / public channels.
- **[Discord Webhook Setup Guide](Discord-Webhook-Setup.md)** — Pushing rich embed alert cards to Discord trading channels.
- **[Custom API & Email Webhooks](Custom-API-and-Email-Webhooks.md)** — HTTP POST JSON payload schemas, sample receivers, Zapier, and n8n integrations.

---

### ⚙️ 4. Administration, Security & Compliance
- **[Authentication & User Management](Authentication-and-User-Management.md)** — Role-based access control (Admin vs User), data isolation, user preferences (base currency, default view mode), and Dark/Bright visual theme modes.
- **[Performance, Caching & Architecture](Performance-Caching-and-Architecture.md)** — Server-side CSV disk caching, incremental delta updates, multi-threaded analytics, reverse proxy configuration, and hardened security headers (HSTS, CSP, X-Frame-Options).
- **[Legal Disclaimer & Compliance](Legal-Disclaimer-and-Compliance.md)** — Regulatory guidelines, educational & research purpose disclaimer, limitation of liability, and GDPR privacy handling.

---

## 🚀 Architectural Highlights

| Pillar | Implementation | Benefit |
| :--- | :--- | :--- |
| **Speed** | Server-side CSV caching & incremental delta downloads | Sub-10ms UI view transitions & >98% network bandwidth reduction |
| **Intelligence** | Multi-factor quantitative heuristics & Google Gemini AI | Deterministic 100% offline uptime with optional deep natural language synthesis |
| **Forex** | Dynamic currency conversion (10 fiat currencies) | Seamless global multi-currency analysis with automatic forex rate sync |
| **Security** | Role-based isolation, ProxyFix, HSTS & strict CSP | Enterprise-grade deployment readiness and secure session handling |
| **Reliability** | Local JSON data persistence (`data/`) | Permanent retention across browser restarts and device transitions |
