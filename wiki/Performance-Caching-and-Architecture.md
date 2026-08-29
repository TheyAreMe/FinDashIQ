# ⚡ Performance, Caching & Architecture

FinDashIQ is engineered for institutional low latency, achieving **sub-10ms response times** via multi-tier server caching, incremental delta synchronization, multi-threaded analytics, and hardened security architecture.

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Incremental Delta Downloads](#2-incremental-delta-downloads)
3. [Multi-Threaded Concurrent Analytics](#3-multi-threaded-concurrent-analytics)
4. [Forex & News Feed Caching](#4-forex--news-feed-caching)
5. [Reverse Proxy Integration & Security Headers](#5-reverse-proxy-integration--security-headers)
6. [Data Persistence Layout](#6-data-persistence-layout)

---

## 1. Architecture Overview

```
Client Browser (Sub-10ms UI Transitions)
       │
       ▼ [HTTPS / TLS]
Reverse Proxy (Nginx / Cloudflare / Traefik)
       │
       ▼ [Werkzeug ProxyFix Middleware]
Flask Backend Application (app.py)
       ├── Currency Service (services/currency_service.py) ➔ Forex Cache
       ├── News Service (services/news_service.py) ➔ News Wire & Impact Cache
       ├── Stock Service (services/stock_service.py)
       │      │
       │      ├── Check Disk Cache (data/cache/<TICKER>_<PERIOD>_<INTERVAL>.csv)
       │      │      ├── Fresh (< 15 min) ➔ Read CSV locally (~2ms)
       │      │      └── Stale (Delta Update) ➔ Fetch missing 1–2 days only
       │      └── Initial Fetch ➔ Download & store CSV
       └── AI Engine (services/ai_service.py) ➔ Conviction & Scenarios
```

---

## 2. Incremental Delta Downloads

Traditional financial dashboards redownload complete multi-year histories on every request. FinDashIQ inspects the last timestamp in `data/cache/*.csv` and fetches only missing delta bars (typically 1–2 sessions):
- **Bandwidth Reduction**: >98% decrease in network data transfer.
- **Provider Rate Limiting**: Completely avoids API rate limits and throttling.
- **Instant Cold Starts**: Cached CSVs load into memory in under 2 milliseconds.

---

## 3. Multi-Threaded Concurrent Analytics

When analyzing multi-stock watchlists or thematic scanner batches, FinDashIQ runs all quantitative calculations in parallel using Python's `concurrent.futures.ThreadPoolExecutor`:
- Moving averages (SMA/EMA), SuperTrend, Bollinger Bands, and Keltner Channels.
- Momentum oscillators (Stochastic, RSI, MACD, CMF, VWAP).
- Multi-factor algorithmic backtests and probabilistic scenario target generation.

---

## 4. Forex & News Feed Caching

- **Dynamic Forex Exchange Rates**: Cached with automatic time-based invalidation. Switching between base currencies (USD, EUR, GBP, CHF, etc.) requires zero external API queries.
- **Global News Wire**: Multi-source headlines and translations are stored in memory and synchronized in the background to ensure instantaneous news modal rendering.

---

## 5. Reverse Proxy Integration & Security Headers

### Reverse Proxy & Scheme Resolution
FinDashIQ integrates `werkzeug.middleware.proxy_fix.ProxyFix` to correctly handle upstream TLS termination, `X-Forwarded-For` client IPs, and `X-Forwarded-Proto` (`https://`) schemes.

### Hardened HTTP Security Headers
Every response includes institutional security headers:
- `Strict-Transport-Security` (HSTS): `max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` (CSP): Scoped strictly to trusted CDNs (ApexCharts, Lucide Icons, Google Fonts).
- `X-Frame-Options`: `SAMEORIGIN` (Clickjacking prevention).
- `X-Content-Type-Options`: `nosniff` (MIME-sniffing prevention).
- `Referrer-Policy`: `strict-origin-when-cross-origin`.
- `Permissions-Policy`: Restricts camera, microphone, and geolocation.

---

## 6. Data Persistence Layout

All user and market state is safely persisted in the root `data/` directory:
- `data/users.json` — User accounts, role definitions, password hashes, and profiles.
- `data/watchlist.json` — Active watchlist assets and order sequences.
- `data/alerts.json` — Configured signal trigger rules and webhook destinations.
- `data/cache/*.csv` — Historical price bars for delta synchronization.
