# 💱 Multi-Currency & Dynamic Forex Engine

FinDashIQ includes a dynamic multi-currency conversion system allowing traders worldwide to monitor international assets in their native fiat currency with zero manual calculation.

---

## 📋 Table of Contents
1. [Supported Currencies](#1-supported-currencies)
2. [Real-Time Forex Conversion Architecture](#2-real-time-forex-conversion-architecture)
3. [Scope of Currency Conversions](#3-scope-of-currency-conversions)
4. [Configuring Base Currency in Profile](#4-configuring-base-currency-in-profile)
5. [Exchange Rate Caching & Performance](#5-exchange-rate-caching--performance)

---

## 1. Supported Currencies

FinDashIQ supports 10 major global fiat currencies:

| Currency | Code | Symbol | Primary Regions |
| :--- | :---: | :---: | :--- |
| **US Dollar** | `USD` | `$` | United States & Global Baseline |
| **Euro** | `EUR` | `€` | Eurozone (Germany, France, Netherlands, etc.) |
| **British Pound** | `GBP` | `£` | United Kingdom |
| **Swiss Franc** | `CHF` | `Fr` | Switzerland & Liechtenstein |
| **Norwegian Krone** | `NOK` | `kr` | Norway |
| **Japanese Yen** | `JPY` | `¥` | Japan |
| **Canadian Dollar** | `CAD` | `$` | Canada |
| **Australian Dollar**| `AUD` | `$` | Australia |
| **Swedish Krona** | `SEK` | `kr` | Sweden |
| **Danish Krone** | `DKK` | `kr` | Denmark |

---

## 2. Real-Time Forex Conversion Architecture

```
User Selects Base Currency (e.g. EUR) in Profile
       │
       ▼
Currency Service (services/currency_service.py)
       │
       ├── Check Cached Forex Rates (USD/EUR, USD/GBP, USD/JPY, etc.)
       │      ├── If Fresh ➔ Apply Conversion Factor
       │      └── If Stale ➔ Fetch Live Exchange Rates & Cache
       │
       ▼
Recalculate UI Views & Formats (Price, Sparklines, Matrix, Fundamentals)
```

---

## 3. Scope of Currency Conversions

When a base currency is selected, FinDashIQ dynamically converts:
1. **Watchlist Card & Table Quotes**: Live price, high/low sparkline labels, and trading ranges.
2. **Hero Header Quotes**: Real-time pricing, session change values, and daily highs/lows in the Terminal.
3. **Execution Matrix Levels**: Entry Zone, Volatility Stop-Loss, and Take-Profit 1 & 2 target levels.
4. **Fundamental Valuation Statistics**: Market Capitalization, 52-Week Range Highs/Lows, and average prices.
5. **AI Scanner Discovery Cards**: Opportunity entry prices, stop-losses, and profit targets.

---

## 4. Configuring Base Currency in Profile

1. Click your username/avatar in the top-right header to open **My Profile & Preferences**.
2. Under the **Preferences** section, locate the **Base Currency** dropdown.
3. Select your desired fiat currency (e.g. `EUR (€)` or `CHF (Fr)`).
4. Click **Save Preferences**.
5. The dashboard will instantly update all active views and persist your choice to `data/users.json`.

---

## 5. Exchange Rate Caching & Performance

To prevent latency and third-party rate limiting:
- Cross-currency rates are cached in memory on the server with background updates.
- Switching base currencies is handled instantaneously in sub-10 milliseconds without re-fetching stock price history from market data providers.
