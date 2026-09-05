# ⚡ FinDashIQ v0.1.3 — Stock Scanner Enhancements & UX Polish

FinDashIQ **v0.1.3** delivers key enhancements to the automated Stock Scanner, including autonomous background engine execution, admin interval controls, timezone-aware live countdowns, elevated default conviction screening, and a unified split hero layout.

---

### 🚀 Highlights in v0.1.3 (Brief Summary)

* ⚡ **Default Conviction (≥ 85%)**: Elevated initial screening threshold to focus on high-conviction setups (≥ 85%).
* 🔄 **Autonomous Background Scanner**: Decoupled scanning from the frontend to run entirely in the background, with configurable scan intervals adjustable by admins directly from the scanner tab.
* ⏱️ **Live Timing & Local Timezone Sync**: "Last Scan / Next Due" timestamps automatically render in the user's local browser timezone with an active countdown timer.
* ☀️ **Bright Mode & UX Polish**: Fixed contrast across the admin controls, universe cards, and ticker addition modals.

---

## ⚡ Previous Releases

### FinDashIQ v0.1.2 — Global Stock Scanner & Expanded Universe

We are pleased to release **FinDashIQ (v0.1.2)**, introducing an expanded global screening universe of 276+ liquid institutional assets, high-speed vectorized data ingestion, interactive catalyst indicators with hover popovers, and streamlined market selection filters.

---

### 🚀 Highlights & New Features in v0.1.2

* 🌐 **Expanded Global Multi-Market Universe (276+ Assets)**:
  * Comprehensive coverage across **US Markets** (S&P 500, NASDAQ 100), **European Blue Chips** (DAX 40, CAC 40, SMI, FTSE), **Asia-Pacific**, **Emerging Markets**, **Clean Energy**, and **Sector Benchmark ETFs**.
  * Enriched fundamental classification including ESG sustainability ratings, thematic tags, and parent ETF mappings.

* ⚡ **High-Speed Vectorized Ingestion & Sub-10ms Queries**:
  * Single-batch vectorized price data streaming with decoupled bulk news aggregation.
  * In-memory indicator calculation across all 276 assets in sub-second RAM matrices, dramatically accelerating scan and update speeds.

* 🔥 **Interactive Catalyst Indicator & Hover Popover**:
  * Subtle pulsing catalyst indicator dot in the card header for stocks experiencing viral catalysts or volume surges.
  * Rich, responsive hover popovers displaying volume surge metrics, breaking headlines, story summaries, and instant news wire links.
  * Smart viewport collision detection and stacking elevation ensuring smooth readability on mobile, tablet, and desktop screens.

* 🎯 **Streamlined Scanner Controls & Regional Selectors**:
  * Universal cross-platform market selectors with distinct separation between Asia-Pacific and Emerging Markets.
  * Refined screening controls with repositioned watchlist exclusion and uniform card grid alignment.

---

### 📦 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/TheyAreMe/FinDashIQ.git
cd FinDashIQ

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Launch application
python app.py
```
*Access the dashboard at `http://localhost:5000` (Default credentials: `admin` / `admin123`).*

---

> ⚠️ **Disclaimer**: FinDashIQ is strictly designed for personal utility, educational exploration, and private quantitative research. No liability is assumed for financial decisions or software inaccuracies.
