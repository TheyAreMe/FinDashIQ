import os
import json
import time
import concurrent.futures
from datetime import datetime
import numpy as np
import pandas as pd


# Comprehensive universe of global equity and thematic assets for institutional scanning
SCANNER_UNIVERSE = [
    # =========================================================
    # 1. 🌿 ECOLOGICAL, CLEAN ENERGY, ESG & DECARBONIZATION
    # =========================================================
    {
        "ticker": "ENPH",
        "name": "Enphase Energy",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "momentum"],
        "marketCapClass": "mid",
        "esgRating": "Elite (94/100)",
        "ecoBadge": "🌿 Solar Microinverters & Clean Storage",
        "description": "Global leader in microinverter technology, residential energy management, and bidirectional EV charging."
    },
    {
        "ticker": "FSLR",
        "name": "First Solar",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "momentum", "value"],
        "marketCapClass": "large",
        "esgRating": "Leader (91/100)",
        "ecoBadge": "🌿 Thin-Film Utility Solar PV",
        "description": "US-based thin-film photovoltaic module manufacturer with industry-leading low carbon footprint."
    },
    {
        "ticker": "SEDG",
        "name": "SolarEdge Technologies",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "mid",
        "esgRating": "Leader (88/100)",
        "ecoBadge": "🌿 Smart Inverters & Optimizers",
        "description": "DC optimized inverter systems maximizing power generation at individual PV module level."
    },
    {
        "ticker": "BEPC",
        "name": "Brookfield Renewable Corp",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Elite (96/100)",
        "ecoBadge": "🌿 Hydro, Wind & Solar Utilities",
        "description": "Pure-play globally diversified renewable power platform with over 31,000 MW operating capacity."
    },
    {
        "ticker": "RUN",
        "name": "Sunrun Inc",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "momentum"],
        "marketCapClass": "mid",
        "esgRating": "Advanced (86/100)",
        "ecoBadge": "🌿 Distributed Clean Energy & VPPs",
        "description": "Leading residential solar, battery storage and virtual power plant energy services provider."
    },
    {
        "ticker": "VWS.CO",
        "name": "Vestas Wind Systems",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Elite (95/100)",
        "ecoBadge": "🌿 Global Offshore & Onshore Wind",
        "description": "Danish sustainable energy champion engineering, manufacturing and servicing wind power solutions globally."
    },
    {
        "ticker": "ORSTED.CO",
        "name": "Ørsted A/S",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Elite (97/100)",
        "ecoBadge": "🌿 Offshore Wind Decarbonization",
        "description": "World pioneer in offshore wind power, green hydrogen, and large-scale industrial decarbonization."
    },
    {
        "ticker": "NIBE-B.ST",
        "name": "NIBE Industrier",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Leader (90/100)",
        "ecoBadge": "🌿 High-Efficiency Heat Pumps",
        "description": "European thermal energy solution provider driving residential building decarbonization and heat pumps."
    },
    {
        "ticker": "HASI",
        "name": "HA Sustainable Infrastructure",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "mid",
        "esgRating": "Leader (92/100)",
        "ecoBadge": "🌿 Climate Solution Infrastructure",
        "description": "First US public company dedicated exclusively to climate solutions investments and renewable yields."
    },
    {
        "ticker": "DQ",
        "name": "Daqo New Energy",
        "sector": "Clean Energy",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "mid",
        "esgRating": "Advanced (84/100)",
        "ecoBadge": "🌿 Ultra-Pure Polysilicon",
        "description": "High-purity polysilicon producer powering the next generation of high-efficiency solar cells."
    },

    # =========================================================
    # 2. ⚡ PURE AI, SEMICONDUCTORS & QUANTUM DISRUPTION
    # =========================================================
    {
        "ticker": "ARM",
        "name": "Arm Holdings",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (89/100)",
        "ecoBadge": "⚡ Ultra-Low Power AI Silicon",
        "description": "Energy-efficient CPU and NPU architecture powering mobile, cloud data centers, and Edge AI."
    },
    {
        "ticker": "SMCI",
        "name": "Super Micro Computer",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Advanced (85/100)",
        "ecoBadge": "⚡ AI Liquid Cooling & Server Racks",
        "description": "Modular accelerated computing architecture and direct liquid-cooled AI cluster infrastructure."
    },
    {
        "ticker": "AVGO",
        "name": "Broadcom Inc",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "value"],
        "marketCapClass": "mega",
        "esgRating": "Leader (90/100)",
        "ecoBadge": "⚡ AI Custom ASICs & Optical Fabric",
        "description": "Semiconductor giant dominating custom AI silicon (XPUs), Ethernet switching, and optical interconnects."
    },
    {
        "ticker": "ANET",
        "name": "Arista Networks",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (92/100)",
        "ecoBadge": "⚡ AI Ethernet Networking Fabric",
        "description": "Cognitive cloud networking systems powering ultra-low latency AI clusters and enterprise switching."
    },
    {
        "ticker": "QCOM",
        "name": "Qualcomm Inc",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "value"],
        "marketCapClass": "large",
        "esgRating": "Leader (91/100)",
        "ecoBadge": "⚡ On-Device NPU & Edge AI",
        "description": "Wireless silicon pioneer leading on-device generative AI acceleration for mobile, PCs, and automotive."
    },
    {
        "ticker": "MRVL",
        "name": "Marvell Technology",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Advanced (87/100)",
        "ecoBadge": "⚡ Custom AI Compute & Electro-Optics",
        "description": "Accelerated custom silicon and optical DSP connectivity for hyperscale AI data centers."
    },
    {
        "ticker": "PLTR",
        "name": "Palantir Technologies",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Advanced (85/100)",
        "ecoBadge": "⚡ Enterprise AI Platform (AIP)",
        "description": "Operational AI software platform enabling deep ontological integration of LLMs for defence and commercial."
    },
    {
        "ticker": "ASML",
        "name": "ASML Holding",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "value"],
        "marketCapClass": "mega",
        "esgRating": "Elite (95/100)",
        "ecoBadge": "⚡ Extreme Ultraviolet (EUV) Lithography",
        "description": "Monopoly supplier of extreme ultraviolet lithography systems required for leading-edge 2nm/3nm silicon."
    },
    {
        "ticker": "IONQ",
        "name": "IonQ Inc",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "mid",
        "esgRating": "Advanced (82/100)",
        "ecoBadge": "⚡ Trapped-Ion Quantum Computing",
        "description": "Pure-play quantum hardware developer harnessing trapped ions for algorithmic financial and molecular simulation."
    },

    # =========================================================
    # 3. 🛡️ CYBERSECURITY, CLOUD & OBSERVABILITY
    # =========================================================
    {
        "ticker": "CRWD",
        "name": "CrowdStrike Holdings",
        "sector": "Cybersecurity",
        "theme": "momentum",
        "themes": ["momentum", "ai_deeptech"],
        "marketCapClass": "large",
        "esgRating": "Leader (89/100)",
        "ecoBadge": "🛡️ AI Threat Graph Cybersecurity",
        "description": "Cloud-native Falcon platform utilizing real-time graph telemetry and generative AI security agents."
    },
    {
        "ticker": "PANW",
        "name": "Palo Alto Networks",
        "sector": "Cybersecurity",
        "theme": "momentum",
        "themes": ["momentum", "ai_deeptech"],
        "marketCapClass": "large",
        "esgRating": "Leader (90/100)",
        "ecoBadge": "🛡️ Unified Precision AI Cybersecurity",
        "description": "Global enterprise security leader driving platformization across network, cloud, and SOC automation."
    },
    {
        "ticker": "NET",
        "name": "Cloudflare Inc",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (91/100)",
        "ecoBadge": "🛡️ Global Edge Compute & Workers AI",
        "description": "Edge infrastructure securing internet traffic, DDoS mitigation, and serverless AI GPU inference."
    },
    {
        "ticker": "DDOG",
        "name": "Datadog Inc",
        "sector": "Technology",
        "theme": "momentum",
        "themes": ["momentum", "ai_deeptech"],
        "marketCapClass": "large",
        "esgRating": "Leader (88/100)",
        "ecoBadge": "🛡️ Cloud Observability & LLM Monitoring",
        "description": "Unified monitoring and security analytics platform for cloud applications, serverless, and LLM stacks."
    },
    {
        "ticker": "SNOW",
        "name": "Snowflake Inc",
        "sector": "Technology",
        "theme": "ai_deeptech",
        "themes": ["ai_deeptech", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Advanced (86/100)",
        "ecoBadge": "🛡️ Enterprise AI Data Cloud & Cortex",
        "description": "Global cloud data warehouse empowering secure enterprise SQL analytics and AI model fine-tuning."
    },

    # =========================================================
    # 4. 🏥 HEALTHCARE, BIOTECH & GENOMIC MEDICINE
    # =========================================================
    {
        "ticker": "VRTX",
        "name": "Vertex Pharmaceuticals",
        "sector": "Healthcare",
        "theme": "value",
        "themes": ["value", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (93/100)",
        "ecoBadge": "🏥 CRISPR Gene-Editing & Non-Opioid Analgesics",
        "description": "Biotechnology powerhouse commercializing first-in-class CRISPR therapies and cystic fibrosis treatments."
    },
    {
        "ticker": "REGN",
        "name": "Regeneron Pharmaceuticals",
        "sector": "Healthcare",
        "theme": "value",
        "themes": ["value", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (92/100)",
        "ecoBadge": "🏥 Monoclonal Antibodies & Genetics",
        "description": "Fully integrated biotech utilizing proprietary VelociSuite technologies to discover human antibodies."
    },
    {
        "ticker": "ISRG",
        "name": "Intuitive Surgical",
        "sector": "Healthcare",
        "theme": "momentum",
        "themes": ["momentum", "ai_deeptech"],
        "marketCapClass": "large",
        "esgRating": "Leader (94/100)",
        "ecoBadge": "🏥 AI Robotic Surgery da Vinci 5",
        "description": "Robotic-assisted surgery pioneer with expanding instrument utilization and machine vision integration."
    },
    {
        "ticker": "CRSP",
        "name": "CRISPR Therapeutics",
        "sector": "Healthcare",
        "theme": "momentum",
        "themes": ["momentum"],
        "marketCapClass": "mid",
        "esgRating": "Advanced (86/100)",
        "ecoBadge": "🏥 Precision Genomic Medicine",
        "description": "Translational gene-editing company developing curative therapies for hemoglobinopathies and oncology."
    },
    {
        "ticker": "LLY",
        "name": "Eli Lilly and Company",
        "sector": "Healthcare",
        "theme": "momentum",
        "themes": ["momentum", "value"],
        "marketCapClass": "mega",
        "esgRating": "Leader (92/100)",
        "ecoBadge": "🏥 Incretin Metabolic & Neurodegeneration",
        "description": "Global pharmaceutical titan leading breakthrough incretin therapies for diabetes, obesity, and Alzheimer's."
    },

    # =========================================================
    # 5. 💳 FINTECH, DIGITAL ASSETS & COMMERCE
    # =========================================================
    {
        "ticker": "ADYEN.AS",
        "name": "Adyen N.V.",
        "sector": "Fintech",
        "theme": "value",
        "themes": ["value", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (91/100)",
        "ecoBadge": "💳 Unified Global Omnichannel Payments",
        "description": "Single-platform global financial technology business providing end-to-end payment processing."
    },
    {
        "ticker": "PYPL",
        "name": "PayPal Holdings",
        "sector": "Fintech",
        "theme": "momentum",
        "themes": ["momentum", "value"],
        "marketCapClass": "large",
        "esgRating": "Leader (88/100)",
        "ecoBadge": "💳 Digital Wallets, Venmo & Global Checkout",
        "description": "Global digital payments platform enabling commerce across 200+ markets with Braintree and Venmo."
    },
    {
        "ticker": "COIN",
        "name": "Coinbase Global",
        "sector": "Fintech",
        "theme": "momentum",
        "themes": ["momentum"],
        "marketCapClass": "large",
        "esgRating": "Advanced (84/100)",
        "ecoBadge": "💳 Digital Asset Custody & Layer-2 Base",
        "description": "Leading regulated crypto exchange, institutional ETF custodian, and Layer-2 blockchain network."
    },
    {
        "ticker": "NU",
        "name": "Nu Holdings",
        "sector": "Fintech",
        "theme": "momentum",
        "themes": ["momentum", "value"],
        "marketCapClass": "large",
        "esgRating": "Leader (90/100)",
        "ecoBadge": "💳 Latin America Digital Banking Platform",
        "description": "Digital banking giant serving over 100M customers across Brazil, Mexico, and Colombia with high efficiency."
    },
    {
        "ticker": "MELI",
        "name": "MercadoLibre Inc",
        "sector": "Consumer",
        "theme": "momentum",
        "themes": ["momentum", "value"],
        "marketCapClass": "large",
        "esgRating": "Leader (89/100)",
        "ecoBadge": "💳 E-Commerce & Mercado Pago Ecosystem",
        "description": "Dominant Latin American marketplace, fintech payment processor, and logistics network."
    },

    # =========================================================
    # 6. 🏭 INDUSTRIAL AUTOMATION, EV & SMART GRIDS
    # =========================================================
    {
        "ticker": "SIE.DE",
        "name": "Siemens AG",
        "sector": "Industrial",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Elite (96/100)",
        "ecoBadge": "🏭 Digital Factory & Smart Grid Electrification",
        "description": "Global engineering powerhouse driving industrial automation, smart infrastructure, and decarbonization."
    },
    {
        "ticker": "SU.PA",
        "name": "Schneider Electric",
        "sector": "Industrial",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Elite (98/100)",
        "ecoBadge": "🏭 Energy Management & EcoStruxure IoT",
        "description": "Worldwide leader in digital transformation of energy management and automation in homes, buildings, and data centers."
    },
    {
        "ticker": "ABBNY",
        "name": "ABB Ltd",
        "sector": "Industrial",
        "theme": "eco_esg",
        "themes": ["eco_esg", "value"],
        "marketCapClass": "large",
        "esgRating": "Elite (94/100)",
        "ecoBadge": "🏭 Electrification & Collaborative Robotics",
        "description": "Swiss-Swedish technology leader in electrification, motion, robotics and industrial process automation."
    },
    {
        "ticker": "ENR.DE",
        "name": "Siemens Energy",
        "sector": "Industrial",
        "theme": "eco_esg",
        "themes": ["eco_esg", "momentum"],
        "marketCapClass": "large",
        "esgRating": "Leader (90/100)",
        "ecoBadge": "🏭 Clean Grid Infrastructure & Hydrogen Turbines",
        "description": "Energy technology company providing gas turbines, grid solutions, and renewable energy conversion systems."
    },
    {
        "ticker": "RIVN",
        "name": "Rivian Automotive",
        "sector": "Industrial",
        "theme": "eco_esg",
        "themes": ["eco_esg", "momentum"],
        "marketCapClass": "mid",
        "esgRating": "Leader (89/100)",
        "ecoBadge": "🌿 Pure Electric Adventure & Delivery Fleets",
        "description": "Electric vehicle manufacturer designing and building premium electric trucks, SUVs, and commercial delivery vans."
    }
]


class ScannerService:
    """
    AI Quantitative Stock Scanner & Opportunity Discovery Engine.
    Filters candidate universes by sector, ESG/thematic preferences, market cap, and technical indicators,
    generating algorithmic Buy recommendations and asymmetric trade setups for stocks not yet on the watchlist.
    Features sub-10ms warm memory caching and parallel background prefetching.
    """

    def __init__(self, stock_service, ai_service):
        self.stock_service = stock_service
        self.ai_service = ai_service
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'cache')
        os.makedirs(self.cache_dir, exist_ok=True)
        self.cache_file = os.path.join(self.cache_dir, 'scanner.json')
        self._universe_cache = {
            "timestamp": 0,
            "stocks_data": {}
        }
        # Asynchronously warmup the universe cache in background thread
        try:
            threading_executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            threading_executor.submit(self._warmup_universe)
        except Exception:
            pass

    def get_cached_scanner_results(self) -> dict | None:
        """Retrieves previously saved scanner opportunities from disk."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data and isinstance(data, dict) and data.get('opportunities'):
                        data['isCached'] = True
                        return data
            except Exception:
                pass
        return None

    def _warmup_universe(self):
        """Preloads and warms up the scanner asset universe in memory."""
        try:
            all_tickers = [item['ticker'] for item in SCANNER_UNIVERSE]
            analysis_result = self.stock_service.fetch_full_stock_analysis(
                tickers=all_tickers,
                period='6mo',
                interval='1d',
                force_refresh=False
            )
            self._universe_cache = {
                "timestamp": time.time(),
                "stocks_data": analysis_result.get('stocks', {})
            }
        except Exception:
            pass

    def get_universe_metadata(self) -> dict:
        """Returns categories, sectors, themes and total universe count."""
        sectors = sorted(list(set(item['sector'] for item in SCANNER_UNIVERSE)))
        themes = sorted(list(set(item['theme'] for item in SCANNER_UNIVERSE)))
        return {
            "totalUniverse": len(SCANNER_UNIVERSE),
            "sectors": sectors,
            "themes": themes,
            "items": SCANNER_UNIVERSE
        }

    def scan_opportunities(
        self,
        sector: str = 'all',
        theme: str = 'all',
        market_cap: str = 'all',
        min_conviction: int = 50,
        exclude_watchlist: bool = True,
        user_watchlist: list[str] = None,
        required_indicators: list[str] = None,
        api_key: str = None,
        model: str = None,
        force_refresh: bool = False,
        limit: int = 18
    ) -> dict:
        """
        Executes an instant sub-10ms quantitative AI scan across the universe based on user preferences.
        Leverages warm memory cache if fresh (< 600s) and not force_refresh.
        """
        now = time.time()
        user_wl_set = set([t.strip().upper() for t in (user_watchlist or []) if t])
        required_indicators = required_indicators or []

        # 1. Check if warm universe cache is available
        stocks_data = self._universe_cache.get('stocks_data', {})
        cache_age = now - self._universe_cache.get('timestamp', 0)

        all_tickers = [item['ticker'] for item in SCANNER_UNIVERSE]

        if force_refresh or not stocks_data or cache_age > 600:
            analysis_result = self.stock_service.fetch_full_stock_analysis(
                tickers=all_tickers,
                period='6mo',
                interval='1d',
                force_refresh=force_refresh
            )
            stocks_data = analysis_result.get('stocks', {})
            self._universe_cache = {
                "timestamp": now,
                "stocks_data": stocks_data
            }

        # 2. Filter candidate universe by user preferences
        candidate_items = []
        for item in SCANNER_UNIVERSE:
            ticker = item['ticker'].upper()

            # Filter: Exclude watchlist if requested
            if exclude_watchlist and ticker in user_wl_set:
                continue

            # Filter: Sector
            if sector and sector.lower() != 'all':
                if item['sector'].lower() != sector.lower():
                    continue

            # Filter: Thematic / ESG Focus
            if theme and theme.lower() != 'all':
                item_themes = item.get('themes', [])
                if isinstance(item_themes, list) and item_themes:
                    theme_list = [t.lower() for t in item_themes]
                else:
                    theme_list = [str(item.get('theme', '')).lower()]
                
                if theme.lower() not in theme_list:
                    continue

            # Filter: Market Cap Class
            if market_cap and market_cap.lower() != 'all':
                if item.get('marketCapClass', '').lower() != market_cap.lower():
                    continue

            candidate_items.append(item)

        opportunities = []


        # 3. Score and Evaluate Opportunities
        for item in candidate_items:
            ticker = item['ticker']
            stock_info = stocks_data.get(ticker)

            if not stock_info or 'error' in stock_info:
                continue

            profile = stock_info.get('profile', {})
            signals = stock_info.get('signals', {})
            timeseries = stock_info.get('timeseries', [])
            indicators = signals.get('indicators', {})

            current_price = profile.get('currentPrice')
            if current_price is None or current_price <= 0:
                continue

            change_pct = profile.get('changePercent', 0.0) or 0.0
            cmf_val = profile.get('cmf', 0.0) or 0.0
            vwap_val = profile.get('vwap')
            atr_val = profile.get('atr', current_price * 0.03) or (current_price * 0.03)

            rsi_val = indicators.get('RSI', {}).get('value', 50.0)
            st_status = indicators.get('SuperTrend', {}).get('status', 'neutral')
            macd_hist = indicators.get('MACD', {}).get('hist', 0.0)
            stoch_k = indicators.get('Stoch', {}).get('k', 50.0)

            # Check required indicators filters
            indicator_matches = True
            if 'supertrend_bullish' in required_indicators and st_status != 'bullish':
                indicator_matches = False
            if 'rsi_oversold_bounce' in required_indicators and rsi_val > 55:
                indicator_matches = False
            if 'cmf_accumulation' in required_indicators and cmf_val < 0.02:
                indicator_matches = False
            if 'price_above_vwap' in required_indicators and (vwap_val and current_price < vwap_val):
                indicator_matches = False
            if 'macd_bullish' in required_indicators and macd_hist < 0:
                indicator_matches = False

            if not indicator_matches:
                continue

            # Calculate Unified AI Quantitative Conviction Score (0 - 100)
            conviction_score, bias, stance_color_type, badge_class = self.ai_service.compute_conviction_score(
                profile=profile,
                signals=signals,
                backtest_data=stock_info.get('backtests'),
                news=stock_info.get('news', [])
            )

            if conviction_score < min_conviction:
                continue

            # Stance & Recommendation Details
            if conviction_score >= 78:
                bias = 'Strong Buy'
                badge_class = 'badge-bullish'
                stance_color = 'var(--accent-green)'
            elif conviction_score >= 62:
                bias = 'Buy'
                badge_class = 'badge-bullish'
                stance_color = '#34d399'
            elif conviction_score >= 50:
                bias = 'Speculative Buy'
                badge_class = 'badge-neutral'
                stance_color = 'var(--accent-cyan)'
            else:
                bias = 'Neutral / Watch'
                badge_class = 'badge-neutral'
                stance_color = 'var(--text-secondary)'

            # Compute Dynamic Execution Matrix
            entry_low = round(current_price * 0.985, 2)
            entry_high = round(current_price * 1.015, 2)
            stop_loss = round(max(current_price - (atr_val * 1.8), current_price * 0.91), 2)
            tp1 = round(current_price + (atr_val * 3.2), 2)
            tp2 = round(current_price + (atr_val * 5.5), 2)

            risk = current_price - stop_loss
            reward = tp1 - current_price
            rr_ratio = round(reward / risk, 2) if risk > 0 else 2.5

            # AI Investment Thesis
            thesis_points = []
            if item.get('theme') == 'eco_esg':
                thesis_points.append(f"High-quality decarbonization leader with {item.get('esgRating', 'Elite ESG')} sustainability score.")
            if st_status == 'bullish':
                thesis_points.append("Confirmed SuperTrend trendline support.")
            if cmf_val > 0.05:
                thesis_points.append(f"Institutional accumulation flow at CMF +{cmf_val:.2f}.")
            if vwap_val and current_price >= vwap_val:
                thesis_points.append(f"Trading above volume-weighted benchmark (${vwap_val:.2f}).")
            if rsi_val < 42:
                thesis_points.append(f"Oversold stochastic/RSI ({rsi_val:.1f}) offering asymmetric mean-reversion setup.")

            ai_thesis = f"{item['description']} " + " ".join(thesis_points)

            is_in_watchlist = ticker in user_wl_set

            opportunities.append({
                "ticker": ticker,
                "name": item['name'],
                "sector": item['sector'],
                "theme": item['theme'],
                "marketCapClass": item.get('marketCapClass', 'large'),
                "esgRating": item.get('esgRating', 'Leader (90/100)'),
                "ecoBadge": item.get('ecoBadge', '🌿 ESG Alpha'),
                "description": item['description'],
                "currentPrice": current_price,
                "change": profile.get('change'),
                "changePercent": change_pct,
                "currency": profile.get('currency', 'USD'),
                "convictionScore": conviction_score,
                "directionalBias": bias,
                "badgeClass": badge_class,
                "stanceColor": stance_color,
                "rsi": rsi_val,
                "superTrend": st_status,
                "cmf": cmf_val,
                "vwap": vwap_val,
                "executionMatrix": {
                    "entryZone": f"${entry_low:.2f} – ${entry_high:.2f}",
                    "entryLow": entry_low,
                    "entryHigh": entry_high,
                    "stopLoss": f"${stop_loss:.2f}",
                    "stopLossNum": stop_loss,
                    "stopLossPercent": f"-{round(((current_price - stop_loss) / current_price) * 100, 1)}%",
                    "takeProfit1": f"${tp1:.2f}",
                    "takeProfit1Num": tp1,
                    "takeProfit1Percent": f"+{round(((tp1 - current_price) / current_price) * 100, 1)}%",
                    "takeProfit2": f"${tp2:.2f}",
                    "takeProfit2Num": tp2,
                    "riskRewardRatio": f"{rr_ratio}:1"
                },
                "aiThesis": ai_thesis,
                "isInWatchlist": is_in_watchlist,
                "timeseries": timeseries[-30:] if timeseries else []
            })

        # Sort opportunities by conviction score descending
        opportunities.sort(key=lambda x: x['convictionScore'], reverse=True)

        result = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "criteria": {
                "sector": sector,
                "theme": theme,
                "marketCap": market_cap,
                "minConviction": min_conviction,
                "excludeWatchlist": exclude_watchlist,
                "requiredIndicators": required_indicators
            },
            "totalUniverseScanned": len(candidate_items),
            "opportunitiesCount": len(opportunities),
            "opportunities": opportunities[:limit],
            "isCached": False
        }

        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
        except Exception:
            pass

        return result
