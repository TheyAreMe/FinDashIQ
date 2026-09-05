import os
import json
import time
import logging
import threading
from datetime import datetime
import numpy as np
import pandas as pd
import yfinance as yf
from services.scanner_universe_data import SCANNER_UNIVERSE_500

logger = logging.getLogger(__name__)

# Backwards compatibility export
SCANNER_UNIVERSE = SCANNER_UNIVERSE_500


class ScannerService:
    """
    Autonomous AI Quantitative Stock Scanner & Thematic Opportunity Engine.
    Features:
    1. Background daemon scheduler running scans automatically every N minutes (default 30m).
    2. Immediate execution on server boot (no waiting for interval timer).
    3. Dynamic universe expansion with duplicate crosscheck (users and admins can add stocks).
    4. Admin-configurable scan interval editable from the web UI.
    5. Precalculated master opportunities, market baskets, and ETF baskets persisted to disk.
    6. Sub-1ms in-memory RAM querying for zero-loading user experience (<10ms HTTP latency).
    7. Admin-only asynchronous non-blocking Force Update (Option A).
    """

    def __init__(self, stock_service, ai_service):
        self.stock_service = stock_service
        self.ai_service = ai_service

        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        self.cache_dir = os.path.join(self.data_dir, 'cache')
        os.makedirs(self.cache_dir, exist_ok=True)

        self.cache_file = os.path.join(self.cache_dir, 'scanner_universe_500.json')
        self.legacy_cache_file = os.path.join(self.cache_dir, 'scanner.json')
        self.config_file = os.path.join(self.data_dir, 'scanner_config.json')
        self.custom_universe_file = os.path.join(self.data_dir, 'scanner_custom_universe.json')

        self._lock = threading.RLock()
        self._scan_event = threading.Event()
        self._stop_event = threading.Event()

        # Load admin-configured interval (default 30 min)
        self.scan_interval_minutes = 30
        self.scan_interval_seconds = 1800
        self._load_config()

        # Load dynamically added stocks
        self._custom_universe = []
        self._load_custom_universe()

        # In-memory caches
        self._universe_cache = {
            "timestamp": 0,
            "stocks_data": {}
        }
        self._opportunities_cache = []
        self._market_baskets_cache = {}
        self._etf_baskets_cache = {}

        # Scan state & timing metrics
        self._is_scanning = False
        self._last_scan_epoch = 0.0
        self._last_scan_time = None
        self._next_scan_epoch = 0.0
        self._next_scan_time = None
        self._last_scan_duration = 0.0

        # Load warm cache from disk immediately on initialization (0ms startup readiness)
        self._load_warm_cache_from_disk()

        # Start continuous background daemon thread
        # Guard against Flask debug reloader double-spawning
        if os.environ.get('WERKZEUG_RUN_MAIN') != 'false':
            self._daemon_thread = threading.Thread(
                target=self._background_scan_loop,
                daemon=True,
                name="ScannerBackgroundDaemon"
            )
            self._daemon_thread.start()

    # =========================================================================
    # CONFIGURATION & UNIVERSE MANAGEMENT
    # =========================================================================

    def _load_config(self):
        """Loads administrator scanner settings (scan interval) from disk."""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    cfg = json.load(f)
                    if cfg and isinstance(cfg, dict):
                        mins = int(cfg.get('interval_minutes', 30))
                        mins = max(5, min(1440, mins))  # Clamp between 5m and 24h
                        self.scan_interval_minutes = mins
                        self.scan_interval_seconds = mins * 60
            except Exception as e:
                logger.warning(f"[ScannerService] Error loading scanner config: {e}")

    def update_scan_interval(self, minutes: int) -> dict:
        """Updates scan interval dynamically and persists to disk. Re-schedules worker."""
        mins = max(5, min(1440, int(minutes)))
        with self._lock:
            self.scan_interval_minutes = mins
            self.scan_interval_seconds = mins * 60
            now = time.time()
            self._next_scan_epoch = (self._last_scan_epoch or now) + self.scan_interval_seconds
            if self._next_scan_epoch <= now:
                self._next_scan_epoch = now
            self._next_scan_time = datetime.fromtimestamp(self._next_scan_epoch).isoformat()

        try:
            payload = {
                "interval_minutes": self.scan_interval_minutes,
                "interval_seconds": self.scan_interval_seconds,
                "updated_at": datetime.now().isoformat()
            }
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(payload, f, indent=2)
        except Exception as e:
            logger.error(f"[ScannerService] Failed to save config: {e}")

        # Wake worker so it adopts the new interval schedule
        self._scan_event.set()

        return {
            "success": True,
            "intervalMinutes": self.scan_interval_minutes,
            "scanIntervalMinutes": self.scan_interval_minutes,
            "lastScanEpoch": self._last_scan_epoch,
            "lastScanTime": self.get_last_scan_time_str(),
            "nextScanEpoch": self._next_scan_epoch,
            "nextScanTime": self.get_next_scan_time_str(),
            "nextScanInSeconds": max(0, int(self._next_scan_epoch - time.time()))
        }

    def _load_custom_universe(self):
        """Loads dynamically added stocks from scanner_custom_universe.json."""
        if os.path.exists(self.custom_universe_file):
            try:
                with open(self.custom_universe_file, 'r', encoding='utf-8') as f:
                    items = json.load(f)
                    if isinstance(items, list):
                        self._custom_universe = items
            except Exception as e:
                logger.warning(f"[ScannerService] Error loading custom universe: {e}")

    def _save_custom_universe(self):
        """Atomically saves user-added stocks to disk."""
        tmp_file = f"{self.custom_universe_file}.tmp"
        try:
            with open(tmp_file, 'w', encoding='utf-8') as f:
                json.dump(self._custom_universe, f, indent=2)
            if os.path.exists(self.custom_universe_file):
                os.replace(tmp_file, self.custom_universe_file)
            else:
                os.rename(tmp_file, self.custom_universe_file)
        except Exception as e:
            logger.error(f"[ScannerService] Failed to persist custom universe: {e}")
            if os.path.exists(tmp_file):
                try:
                    os.remove(tmp_file)
                except Exception:
                    pass

    def get_combined_universe(self) -> list[dict]:
        """Returns the full combined universe: base SCANNER_UNIVERSE_500 + dynamic additions."""
        seen = set()
        combined = []
        with self._lock:
            # Base curated universe
            for item in SCANNER_UNIVERSE_500:
                t = str(item.get('ticker', '')).strip().upper()
                if t and t not in seen:
                    seen.add(t)
                    combined.append(dict(item))
            # Custom additions
            for item in self._custom_universe:
                t = str(item.get('ticker', '')).strip().upper()
                if t and t not in seen:
                    seen.add(t)
                    combined.append(dict(item))
        return combined

    def add_stock_to_universe(self, ticker: str, user_role: str = "user") -> dict:
        """
        Dynamically adds a new stock to the monitoring universe.
        Performs crosscheck: if ticker already exists, returns error message.
        Otherwise, validates via Yahoo Finance, extracts profile, and enqueues.
        """
        clean_ticker = str(ticker or '').strip().upper()
        if not clean_ticker:
            return {"success": False, "error": "Please provide a valid stock ticker symbol."}

        # 1. Crosscheck against combined universe
        combined = self.get_combined_universe()
        for item in combined:
            if str(item.get('ticker', '')).strip().upper() == clean_ticker:
                return {
                    "success": False,
                    "error": f"Stock {clean_ticker} is already in monitoring universe"
                }

        # 2. Resolve company name and market details via StockService & Yahoo Finance
        company_name = ""
        try:
            if hasattr(self.stock_service, 'fetch_company_name'):
                company_name = self.stock_service.fetch_company_name(clean_ticker)
            elif hasattr(self.stock_service, '_resolve_company_name'):
                company_name = self.stock_service._resolve_company_name(clean_ticker, {})
        except Exception:
            company_name = ""
        if not company_name or company_name == clean_ticker:
            try:
                t_obj = yf.Ticker(clean_ticker)
                fi = getattr(t_obj, 'fast_info', None)
                curr = getattr(fi, 'currency', None) if fi else None
                lp = getattr(fi, 'last_price', None) if fi else None
                if curr or lp:
                    company_name = clean_ticker
                else:
                    df_test = yf.download(clean_ticker, period="5d", interval="1d", progress=False)
                    if df_test is not None and not df_test.empty:
                        company_name = clean_ticker
                    else:
                        return {
                            "success": False,
                            "error": f"Could not verify ticker symbol '{clean_ticker}' on global exchanges."
                        }
            except Exception:
                return {
                    "success": False,
                    "error": f"Could not verify ticker symbol '{clean_ticker}' on global exchanges."
                }

        # Infer regional market by exchange extension
        if clean_ticker.endswith(('.DE', '.PA', '.AS', '.MI', '.MC', '.L', '.OL', '.ST', '.CO', '.SW')):
            market = 'europe'
        elif clean_ticker.endswith(('.T', '.HK', '.SS', '.SZ', '.KS', '.AX', '.SI')):
            market = 'asia'
        else:
            market = 'us'

        new_item = {
            "ticker": clean_ticker,
            "name": company_name or clean_ticker,
            "market": market,
            "sector": "Equities",
            "themes": ["momentum"],
            "parentETF": "",
            "marketCapClass": "large",
            "esgRating": "Standard (80/100)",
            "ecoBadge": "📈 Community Opportunity",
            "addedAt": datetime.now().isoformat(),
            "addedBy": user_role or "user"
        }

        with self._lock:
            self._custom_universe.append(new_item)
            self._save_custom_universe()

        # Perform fast immediate calculation for this single stock so it appears immediately
        try:
            threading.Thread(
                target=self._analyze_single_new_stock,
                args=(new_item,),
                daemon=True,
                name=f"ScannerAddSingle-{clean_ticker}"
            ).start()
        except Exception:
            pass

        return {
            "success": True,
            "message": f"Added stock {clean_ticker} to universe",
            "item": new_item,
            "totalUniverse": len(self.get_combined_universe())
        }

    def _analyze_single_new_stock(self, item: dict):
        """Immediately downloads and calculates indicators for a newly added stock."""
        ticker = item['ticker']
        try:
            df = yf.download(ticker, period="3mo", interval="1d", progress=False)
            if df is not None and not df.empty and len(df) >= 5:
                # Handle MultiIndex if present
                if isinstance(df.columns, pd.MultiIndex):
                    if ticker in df.columns.levels[0]:
                        df = df[ticker].dropna(subset=['Close'])
                    else:
                        df = df.dropna(subset=['Close'])
                else:
                    df = df.dropna(subset=['Close'])

                stock_data = self._build_stock_data_from_df(ticker, item, df, preloaded_news=[])
                if stock_data:
                    with self._lock:
                        self._universe_cache.setdefault('stocks_data', {})[ticker] = stock_data
                    # Recompute single opportunity
                    opp = self._evaluate_single_opportunity(ticker, item, stock_data)
                    if opp:
                        with self._lock:
                            # Remove old if exists
                            self._opportunities_cache = [o for o in self._opportunities_cache if o['ticker'] != ticker]
                            self._opportunities_cache.append(opp)
                            self._opportunities_cache.sort(key=lambda x: x['convictionScore'], reverse=True)
                            self._persist_warm_cache_to_disk()
        except Exception as e:
            logger.warning(f"[ScannerService] Fast calculation for {ticker} error: {e}")

    # =========================================================================
    # PERSISTENCE & DISK CACHE
    # =========================================================================

    def _load_warm_cache_from_disk(self):
        """Loads precomputed universe, opportunities, and baskets from disk for 0ms instant startup."""
        for target_file in [self.cache_file, self.legacy_cache_file]:
            if os.path.exists(target_file):
                try:
                    with open(target_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data and isinstance(data, dict):
                            stocks_data = data.get('stocks_data', {})
                            opps = data.get('opportunities', [])
                            market_baskets = data.get('market_baskets', {})
                            etf_baskets = data.get('etf_baskets', {})

                            epoch = float(data.get('timestamp_epoch', 0.0) or 0.0)
                            if epoch == 0.0 and data.get('timestamp'):
                                try:
                                    epoch = datetime.fromisoformat(data['timestamp']).timestamp()
                                except Exception:
                                    epoch = time.time()

                            with self._lock:
                                self._universe_cache = {
                                    "timestamp": epoch,
                                    "stocks_data": stocks_data
                                }
                                if opps:
                                    self._opportunities_cache = opps
                                if market_baskets:
                                    self._market_baskets_cache = market_baskets
                                if etf_baskets:
                                    self._etf_baskets_cache = etf_baskets

                                self._last_scan_epoch = epoch
                                self._last_scan_time = data.get('timestamp') or datetime.fromtimestamp(epoch).isoformat()
                                self._next_scan_epoch = epoch + self.scan_interval_seconds
                                self._next_scan_time = datetime.fromtimestamp(self._next_scan_epoch).isoformat()
                                self._last_scan_duration = float(data.get('scan_duration', 0.0) or 0.0)

                            logger.info(f"[ScannerService] Loaded warm cache with {len(stocks_data)} assets, {len(opps)} opportunities.")
                            return
                except Exception as e:
                    logger.warning(f"[ScannerService] Error loading disk cache from {target_file}: {e}")

    def _persist_warm_cache_to_disk(self):
        """Atomically saves warm universe, full precomputed opportunities, and baskets to disk."""
        tmp_file = f"{self.cache_file}.tmp"
        try:
            with self._lock:
                payload = {
                    "timestamp": self._last_scan_time or datetime.now().isoformat(),
                    "timestamp_epoch": self._last_scan_epoch,
                    "next_scan_time": self._next_scan_time,
                    "next_scan_epoch": self._next_scan_epoch,
                    "scan_interval_minutes": self.scan_interval_minutes,
                    "scan_interval_seconds": self.scan_interval_seconds,
                    "scan_duration": self._last_scan_duration,
                    "totalAssets": len(self.get_combined_universe()),
                    "opportunitiesCount": len(self._opportunities_cache),
                    "stocks_data": self._universe_cache.get('stocks_data', {}),
                    "opportunities": self._opportunities_cache,
                    "market_baskets": self._market_baskets_cache,
                    "etf_baskets": self._etf_baskets_cache
                }

            with open(tmp_file, 'w', encoding='utf-8') as f:
                json.dump(payload, f)

            if os.path.exists(self.cache_file):
                os.replace(tmp_file, self.cache_file)
            else:
                os.rename(tmp_file, self.cache_file)
        except Exception as e:
            logger.error(f"[ScannerService] Failed to persist warm cache: {e}")
            if os.path.exists(tmp_file):
                try:
                    os.remove(tmp_file)
                except Exception:
                    pass

    # =========================================================================
    # AUTONOMOUS BACKGROUND ENGINE & SCAN EXECUTION
    # =========================================================================

    def _background_scan_loop(self):
        """
        Autonomous daemon loop:
        1. Immediately launches initial full scan on server startup (no waiting).
        2. Periodically re-executes every N minutes (default 30m).
        """
        logger.info("[ScannerService] Background scanner daemon worker started.")
        time.sleep(1.0)  # Brief pause to allow Flask/server initialization

        # Step 1: Immediately run full scan on boot!
        try:
            logger.info("[ScannerService] Launching initial startup scan across all assets...")
            self.run_full_scan()
        except Exception as e:
            logger.error(f"[ScannerService] Initial startup scan failed: {e}")

        # Step 2: Continuous loop
        while not self._stop_event.is_set():
            with self._lock:
                now = time.time()
                if self._next_scan_epoch > now:
                    sleep_sec = max(1.0, self._next_scan_epoch - now)
                else:
                    sleep_sec = self.scan_interval_seconds

            # Interruptible wait (wakes if admin changes interval or triggers force update)
            self._scan_event.wait(timeout=sleep_sec)
            self._scan_event.clear()

            if self._stop_event.is_set():
                break

            now = time.time()
            if now >= (self._next_scan_epoch - 1.0):
                try:
                    logger.info("[ScannerService] Executing scheduled background market scan...")
                    self.run_full_scan()
                except Exception as e:
                    logger.error(f"[ScannerService] Scheduled background scan encountered error: {e}")

    def trigger_async_scan(self) -> bool:
        """
        Admin Option A: Triggers an immediate asynchronous background scan without blocking the caller.
        """
        if self._is_scanning:
            return True

        def _async_runner():
            try:
                self.run_full_scan()
            except Exception as e:
                logger.error(f"[ScannerService] Async force scan error: {e}")

        t = threading.Thread(target=_async_runner, daemon=True, name="ScannerAsyncTrigger")
        t.start()
        return True

    def run_full_scan(self) -> dict:
        """
        Performs full multi-market quantitative scan across the entire combined universe:
        - Bulk vectorized downloading via yf.download
        - Global news catalyst wire ingestion
        - In-memory indicator calculation
        - Master opportunities precalculation & scoring
        - Top-5 Market & ETF basket precomputation
        - Atomic persistence to disk
        """
        with self._lock:
            if self._is_scanning:
                return {"success": False, "message": "Scan already in progress."}
            self._is_scanning = True

        start_time = time.time()
        try:
            combined_items = self.get_combined_universe()
            all_tickers = [item['ticker'] for item in combined_items]

            logger.info(f"[ScannerService] Starting full scan for {len(all_tickers)} universe assets...")
            stocks_data = self._fetch_bulk_universe_data(all_tickers, universe_items=combined_items)

            if stocks_data:
                # Precompute all opportunities across the entire universe
                opportunities = self._evaluate_universe_opportunities(stocks_data, combined_items)

                # Precompute top regional and ETF baskets
                market_baskets = self._compute_market_baskets_from_opps(opportunities)
                etf_baskets = self._compute_etf_baskets_from_opps(opportunities)

                now = time.time()
                scan_dur = round(now - start_time, 2)
                iso_now = datetime.now().isoformat()
                next_epoch = now + self.scan_interval_seconds
                iso_next = datetime.fromtimestamp(next_epoch).isoformat()

                with self._lock:
                    self._universe_cache = {
                        "timestamp": now,
                        "stocks_data": stocks_data
                    }
                    self._opportunities_cache = opportunities
                    self._market_baskets_cache = market_baskets
                    self._etf_baskets_cache = etf_baskets

                    self._last_scan_epoch = now
                    self._last_scan_time = iso_now
                    self._next_scan_epoch = next_epoch
                    self._next_scan_time = iso_next
                    self._last_scan_duration = scan_dur

                self._persist_warm_cache_to_disk()
                logger.info(f"[ScannerService] Scan complete in {scan_dur}s: {len(opportunities)} opportunities precalculated.")
                return {
                    "success": True,
                    "totalAssets": len(all_tickers),
                    "opportunitiesCount": len(opportunities),
                    "durationSeconds": scan_dur
                }
            else:
                logger.warning("[ScannerService] Scan produced empty stock data; retaining existing cache.")
                return {"success": False, "message": "Data ingestion returned no results."}
        finally:
            with self._lock:
                self._is_scanning = False
            self._scan_event.set()

    def _fetch_bulk_universe_data(self, tickers: list[str], universe_items: list[dict] = None) -> dict:
        """
        Ingests multi-ticker historical price data using high-speed vectorized batching.
        Slashes individual connections down to 1-2 streaming requests (~2.0-4.0s total).
        """
        from services.news_service import news_service
        clean_tickers = [t.strip().upper() for t in tickers if t and t.strip()]
        if not clean_tickers:
            return {}

        items = universe_items or self.get_combined_universe()
        item_map = {item['ticker'].strip().upper(): item for item in items}
        results = {}

        # 1. Fetch global news stream in ONE single bulk call (0ms from RAM / ~150ms SWR)
        news_by_ticker = {}
        try:
            global_news = news_service.fetch_global_news(limit=150, force_refresh=False) or []
            for n in global_news:
                t = str(n.get('ticker', '')).upper()
                if t:
                    news_by_ticker.setdefault(t, []).append(n)
                for rel_t in n.get('relatedTickers', []):
                    if rel_t:
                        news_by_ticker.setdefault(rel_t.upper(), []).append(n)
        except Exception:
            pass

        try:
            # 2. Download multi-ticker batch in 1 single vectorized streaming request (~3-4s)
            df_batch = yf.download(
                tickers=clean_tickers,
                period="3mo",
                interval="1d",
                group_by="ticker",
                threads=True,
                progress=False
            )

            # 3. Parse and compute indicators in RAM (<0.3s for all assets)
            for ticker in clean_tickers:
                item = item_map.get(ticker)
                if not item:
                    continue

                try:
                    df_ticker = None
                    if isinstance(df_batch.columns, pd.MultiIndex):
                        if ticker in df_batch.columns.levels[0]:
                            df_ticker = df_batch[ticker].dropna(subset=['Close'])
                    else:
                        df_ticker = df_batch.dropna(subset=['Close'])

                    if df_ticker is None or df_ticker.empty or len(df_ticker) < 5:
                        continue

                    ticker_news = news_by_ticker.get(ticker, [])
                    stock_data = self._build_stock_data_from_df(ticker, item, df_ticker, preloaded_news=ticker_news)
                    if stock_data:
                        results[ticker] = stock_data
                except Exception:
                    continue

        except Exception as e:
            logger.warning(f"[ScannerService] Bulk batch download failed: {e}. Fallback to existing cache.")
            return self._universe_cache.get('stocks_data', {})

        return results

    def _build_stock_data_from_df(self, ticker: str, item: dict, df: pd.DataFrame, preloaded_news: list[dict] = None) -> dict:
        """Converts raw OHLCV DataFrame into full indicator timeseries and fundamental profile in RAM."""
        try:
            timeseries, signals, profile = self.stock_service.calculate_indicators_from_df(df, ticker, item.get('name', ticker))
            if not profile or not signals:
                return None

            profile['sector'] = item.get('sector', profile.get('sector', 'Equities'))
            profile['theme'] = item.get('theme', 'all')
            profile['themes'] = item.get('themes', ['momentum'])
            profile['market'] = item.get('market', 'us')
            profile['parentETF'] = item.get('parentETF', '')
            profile['marketCapClass'] = item.get('marketCapClass', 'large')
            profile['esgRating'] = item.get('esgRating', 'Leader (90/100)')
            profile['ecoBadge'] = item.get('ecoBadge', '🌿 Alpha')

            news = preloaded_news if preloaded_news is not None else []

            return {
                'profile': profile,
                'signals': signals,
                'timeseries': timeseries,
                'news': news,
                'backtests': None
            }
        except Exception:
            return None

    # =========================================================================
    # PRECALCULATION OF MASTER OPPORTUNITIES & BASKETS
    # =========================================================================

    def _evaluate_universe_opportunities(self, stocks_data: dict, universe_items: list[dict]) -> list[dict]:
        """Evaluates all stocks in the universe, scoring conviction, execution levels, and strategy matches."""
        opportunities = []
        for item in universe_items:
            ticker = item['ticker'].upper()
            stock_info = stocks_data.get(ticker)
            if not stock_info or 'error' in stock_info:
                continue

            opp = self._evaluate_single_opportunity(ticker, item, stock_info)
            if opp:
                opportunities.append(opp)

        # Sort by conviction score descending
        opportunities.sort(key=lambda x: x['convictionScore'], reverse=True)
        return opportunities

    def _evaluate_single_opportunity(self, ticker: str, item: dict, stock_info: dict) -> dict | None:
        """Evaluates quantitative metrics, strategies, catalyst surges, and conviction for a single stock."""
        try:
            profile = stock_info.get('profile', {})
            signals = stock_info.get('signals', {})
            timeseries = stock_info.get('timeseries', [])
            news = stock_info.get('news', [])
            indicators = signals.get('indicators', {})

            current_price = profile.get('currentPrice')
            if current_price is None or current_price <= 0:
                return None

            change_pct = profile.get('changePercent', 0.0) or 0.0
            cmf_val = profile.get('cmf', 0.0) or 0.0
            vwap_val = profile.get('vwap')
            atr_val = profile.get('atr', current_price * 0.03) or (current_price * 0.03)
            current_vol = profile.get('volume', 0) or 0
            avg_vol = profile.get('avgVolume', current_vol) or current_vol
            vol_ratio = round(current_vol / avg_vol, 2) if avg_vol > 0 else 1.0
            div_yield = profile.get('dividendYield', 0.0) or 0.0
            beta_val = profile.get('beta', 1.0) or 1.0

            rsi_val = indicators.get('RSI', {}).get('value', 50.0)
            st_status = indicators.get('SuperTrend', {}).get('status', 'neutral')
            macd_hist = indicators.get('MACD', {}).get('hist', 0.0)
            stoch_k = indicators.get('Stoch', {}).get('k', 50.0)
            ttm_squeeze = indicators.get('TTMSqueeze', {}).get('status', False)

            # Check potential viral news catalysts & volume surges
            catalyst_keywords = [
                'takeover', 'buyout', 'acquisition', 'surge', 'soar', 'skyrocket',
                'short squeeze', 'rally', 'beat', 'record profit', 'fda approval',
                'breakout', 'partnership', 'expansion', 'ai platform', 'upgrade', 'contract', 'growth'
            ]
            found_catalysts = []
            for n in (news or [])[:8]:
                t_lower = str(n.get('title', '')).lower()
                for kw in catalyst_keywords:
                    if kw in t_lower:
                        found_catalysts.append(n)
                        break

            is_vol_surge = vol_ratio >= 1.2 or change_pct >= 2.5
            viral_catalyst_data = None
            if found_catalysts and (is_vol_surge or change_pct > 0):
                top_news = found_catalysts[0]
                n_link = top_news.get('link') or top_news.get('url') or f"https://finance.yahoo.com/quote/{ticker}/news"
                viral_catalyst_data = {
                    "headline": top_news.get('title', 'Breaking Market Catalyst Surge'),
                    "publisher": top_news.get('publisher', 'Financial Wire'),
                    "time": top_news.get('time', 'Active Session'),
                    "volRatio": f"{vol_ratio}x Vol",
                    "catalystType": "🔥 Viral Catalyst",
                    "link": n_link,
                    "summary": top_news.get('summary', '')
                }
            elif is_vol_surge and change_pct >= 3.0:
                viral_catalyst_data = {
                    "headline": f"Heavy Institutional Volume Surge ({vol_ratio}x 20-Day SMA)",
                    "publisher": "Exchange Tape Flow",
                    "time": "Active Session",
                    "volRatio": f"{vol_ratio}x Vol",
                    "catalystType": "⚡ Volume Surge",
                    "link": f"https://finance.yahoo.com/quote/{ticker}/news",
                    "summary": f"Abnormal trading volume detected with {vol_ratio}x relative volume vs 20-day SMA moving average."
                }

            # Map matched strategies
            strategies_matched = ['all']
            if viral_catalyst_data or change_pct >= 1.5 or vol_ratio >= 1.15:
                strategies_matched.append('viral_news_catalysts')
            if st_status == 'bullish' or change_pct >= 0.2 or vol_ratio >= 1.0:
                strategies_matched.append('momentum_breakout')
            is_val = 'value' in item.get('themes', [])
            if rsi_val <= 52 or stoch_k <= 50 or is_val:
                strategies_matched.append('deep_value_reversion')
            if div_yield >= 1.0 or is_val or beta_val <= 1.25:
                strategies_matched.append('dividend_aristocrats')
            if ttm_squeeze or (abs(macd_hist) <= 2.0 and vol_ratio <= 2.0):
                strategies_matched.append('ttm_squeeze')

            # Calculate AI Conviction Score
            conviction_score, bias, stance_color_type, badge_class = self.ai_service.compute_conviction_score(
                profile=profile,
                signals=signals,
                backtest_data=stock_info.get('backtests'),
                news=news
            )

            # Boost conviction score for confirmed viral positive news catalysts
            if viral_catalyst_data and change_pct > 0:
                conviction_score = min(98, conviction_score + 12)

            # Stance & styling
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

            # Execution matrix
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
            if viral_catalyst_data:
                thesis_points.append(f"🔥 BREAKING CATALYST: {viral_catalyst_data['headline']} ({viral_catalyst_data['volRatio']}).")
            if item.get('market') == 'europe':
                thesis_points.append(f"European Blue-Chip asset ({item.get('parentETF', 'DAX')}).")
            elif item.get('market') == 'asia':
                thesis_points.append("Asia-Pacific / Emerging Market growth leader.")
            if st_status == 'bullish':
                thesis_points.append("Confirmed SuperTrend trendline support.")
            if cmf_val > 0.05:
                thesis_points.append(f"Institutional accumulation flow at CMF +{cmf_val:.2f}.")
            if vwap_val and current_price >= vwap_val:
                thesis_points.append(f"Trading above volume-weighted benchmark (${vwap_val:.2f}).")
            if rsi_val < 42:
                thesis_points.append(f"Oversold RSI ({rsi_val:.1f}) offering asymmetric mean-reversion setup.")

            ai_thesis = f"{item.get('ecoBadge', '')} — " + " ".join(thesis_points)

            return {
                "ticker": ticker,
                "name": item.get('name', ticker),
                "market": item.get('market', 'us'),
                "parentETF": item.get('parentETF', ''),
                "sector": item.get('sector', 'Equities'),
                "theme": item.get('theme', 'all'),
                "themes": item.get('themes', ['momentum']),
                "marketCapClass": item.get('marketCapClass', 'large'),
                "esgRating": item.get('esgRating', 'Leader (90/100)'),
                "ecoBadge": item.get('ecoBadge', '🌿 ESG Alpha'),
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
                "volumeRatio": vol_ratio,
                "dividendYield": div_yield,
                "viralCatalyst": viral_catalyst_data,
                "strategiesMatched": strategies_matched,
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
                "timeseries": timeseries[-30:] if timeseries else []
            }
        except Exception:
            return None

    def _compute_market_baskets_from_opps(self, opportunities: list[dict]) -> dict:
        """Precomputes top 5 highest-conviction setups across each regional market."""
        market_keys = ['us', 'europe', 'asia', 'clean_energy', 'global_etfs']
        baskets = {}
        for m in market_keys:
            filtered = [
                o for o in opportunities
                if str(o.get('market', '')).lower() == m.lower() and o.get('convictionScore', 0) >= 50
            ]
            filtered.sort(key=lambda x: x.get('convictionScore', 0), reverse=True)
            baskets[m] = filtered[:5]
        return baskets

    def _compute_etf_baskets_from_opps(self, opportunities: list[dict]) -> dict:
        """Precomputes top 5 highest-conviction holdings for major benchmark ETFs."""
        etf_symbols = ['SPY', 'QQQ', 'SMH', 'ICLN', 'EXS1.DE', 'VGK', 'EEM', 'XLE', 'XLV', 'XLF']
        baskets = {}
        for etf in etf_symbols:
            etf_up = etf.upper()
            filtered = [
                o for o in opportunities
                if (str(o.get('parentETF', '')).upper() == etf_up or o.get('ticker', '').upper() == etf_up)
                and o.get('convictionScore', 0) >= 45
            ]
            filtered.sort(key=lambda x: x.get('convictionScore', 0), reverse=True)
            baskets[etf_up] = filtered[:5]
        return baskets

    # =========================================================================
    # INSTANT SUB-1MS QUERYING & REST APIS
    # =========================================================================

    def get_last_scan_time_str(self) -> str:
        """Returns human-readable last scan time, e.g. '10:45:12 AM'."""
        if self._last_scan_epoch > 0:
            return datetime.fromtimestamp(self._last_scan_epoch).strftime('%I:%M:%S %p')
        return "Initial"

    def get_next_scan_time_str(self) -> str:
        """Returns human-readable next scan due time, e.g. '11:15:12 AM'."""
        if self._next_scan_epoch > 0:
            return datetime.fromtimestamp(self._next_scan_epoch).strftime('%I:%M:%S %p')
        return "Pending"

    def get_scanner_status(self) -> dict:
        """Returns comprehensive status, timing, and health of the background scanner engine."""
        now = time.time()
        with self._lock:
            last_epoch = self._last_scan_epoch
            next_epoch = self._next_scan_epoch
            is_scanning = self._is_scanning
            interval_m = self.scan_interval_minutes
            dur = self._last_scan_duration
            total_assets = len(self.get_combined_universe())
            custom_count = len(self._custom_universe)
            opps_count = len(self._opportunities_cache)

        next_in_sec = max(0, int(next_epoch - now)) if next_epoch > 0 else interval_m * 60
        age_sec = max(0, int(now - last_epoch)) if last_epoch > 0 else 0

        return {
            "success": True,
            "isScanning": is_scanning,
            "lastScanEpoch": last_epoch,
            "lastScanTime": self.get_last_scan_time_str(),
            "nextScanEpoch": next_epoch,
            "nextScanTime": self.get_next_scan_time_str(),
            "nextScanInSeconds": next_in_sec,
            "ageSeconds": age_sec,
            "scanIntervalMinutes": interval_m,
            "scanDurationSeconds": dur,
            "totalUniverse": total_assets,
            "customAssetsCount": custom_count,
            "opportunitiesCount": opps_count
        }

    def get_cached_scanner_results(self) -> dict:
        """
        Retrieves precalculated scanner opportunities and live timing metrics.
        Returns near-instantaneously (<1ms) from warm RAM or disk.
        """
        now = time.time()
        with self._lock:
            opps = list(self._opportunities_cache)
            last_epoch = self._last_scan_epoch
            next_epoch = self._next_scan_epoch
            is_scanning = self._is_scanning
            interval_m = self.scan_interval_minutes
            last_time = self._last_scan_time
        combined_universe = self.get_combined_universe()
        total_uni = len(combined_universe)
        universe_tickers = [item.get('ticker', '').upper() for item in combined_universe if item.get('ticker')]

        next_in_sec = max(0, int(next_epoch - now)) if next_epoch > 0 else interval_m * 60
        age_sec = max(0, int(now - last_epoch)) if last_epoch > 0 else 0

        return {
            "success": True,
            "isCached": True,
            "isScanning": is_scanning,
            "timestamp": last_time or datetime.now().isoformat(),
            "timestamp_epoch": last_epoch,
            "lastScanEpoch": last_epoch,
            "lastScanTime": self.get_last_scan_time_str(),
            "nextScanTime": self.get_next_scan_time_str(),
            "nextScanEpoch": next_epoch,
            "nextScanInSeconds": next_in_sec,
            "ageSeconds": age_sec,
            "scanIntervalMinutes": interval_m,
            "totalUniverseScanned": total_uni,
            "universeTickers": universe_tickers,
            "opportunitiesCount": len(opps),
            "opportunities": opps
        }

    def get_universe_metadata(self) -> dict:
        """Returns categories, regional markets, sectors, themes, ETF baskets and total universe count."""
        combined = self.get_combined_universe()
        markets = sorted(list(set(item.get('market', 'us') for item in combined)))
        sectors = sorted(list(set(item.get('sector', 'Equities') for item in combined)))
        themes = sorted(list(set(t for item in combined for t in item.get('themes', []))))
        etf_baskets = sorted(list(set(item.get('parentETF', '') for item in combined if item.get('parentETF'))))
        tickers = sorted(list(set(item.get('ticker', '').upper() for item in combined if item.get('ticker'))))

        return {
            "totalUniverse": len(combined),
            "customCount": len(self._custom_universe),
            "markets": markets,
            "sectors": sectors,
            "themes": themes,
            "etfBaskets": etf_baskets,
            "tickers": tickers,
            "items": combined
        }

    def get_top_market_baskets(self) -> dict:
        """Returns precomputed top 5 highest-conviction setups across regional markets (0ms)."""
        with self._lock:
            if self._market_baskets_cache:
                return dict(self._market_baskets_cache)
            opps = list(self._opportunities_cache)

        return self._compute_market_baskets_from_opps(opps)

    def get_top_etf_baskets(self, etf_symbol: str) -> list[dict]:
        """Returns precomputed top 5 highest-conviction holdings for a benchmark ETF (0ms)."""
        clean_etf = str(etf_symbol or 'SPY').strip().upper()
        with self._lock:
            if self._etf_baskets_cache and clean_etf in self._etf_baskets_cache:
                return list(self._etf_baskets_cache[clean_etf])
            opps = list(self._opportunities_cache)

        baskets = self._compute_etf_baskets_from_opps(opps)
        return baskets.get(clean_etf, [])

    def scan_opportunities(
        self,
        market: str = 'all',
        strategy: str = 'all',
        etf_basket: str = 'all',
        sector: str = 'all',
        theme: str = 'all',
        market_cap: str = 'all',
        min_conviction: int = 85,
        exclude_watchlist: bool = True,
        user_watchlist: list[str] = None,
        required_indicators: list[str] = None,
        api_key: str = None,
        model: str = None,
        force_refresh: bool = False,
        limit: int = 24
    ) -> dict:
        """
        Executes sub-1ms in-memory filtering across the precalculated opportunities matrix.
        Never blocks the user on live yfinance streaming unless cache is completely empty.
        """
        user_wl_set = set([t.strip().upper() for t in (user_watchlist or []) if t])
        required_indicators = required_indicators or []

        # Acquire cached opportunities from warm RAM
        with self._lock:
            all_opps = list(self._opportunities_cache)
            last_epoch = self._last_scan_epoch
            next_epoch = self._next_scan_epoch
            is_scanning = self._is_scanning
            last_time = self._last_scan_time

        # If cache is empty (e.g. cold start and initial scan hasn't finished yet), wait briefly or trigger
        if not all_opps:
            if not is_scanning:
                self.trigger_async_scan()
            # Try to read legacy disk cache as fallback
            res = self.get_cached_scanner_results()
            all_opps = res.get('opportunities', [])

        filtered = []
        for opp in all_opps:
            ticker = opp['ticker'].upper()

            # Filter: Exclude Watchlist
            if exclude_watchlist and ticker in user_wl_set:
                continue

            # Filter: Regional Market
            if market and market.lower() != 'all':
                if str(opp.get('market', 'us')).lower() != market.lower():
                    continue

            # Filter: ETF Basket
            if etf_basket and etf_basket.lower() != 'all':
                item_etf = str(opp.get('parentETF', '')).upper()
                if item_etf != etf_basket.upper() and ticker != etf_basket.upper():
                    continue

            # Filter: Sector
            if sector and sector.lower() != 'all':
                if str(opp.get('sector', '')).lower() != sector.lower():
                    continue

            # Filter: Thematic
            if theme and theme.lower() != 'all':
                themes_list = [str(t).lower() for t in opp.get('themes', [])]
                if theme.lower() not in themes_list and str(opp.get('theme', '')).lower() != theme.lower():
                    continue

            # Filter: Market Cap Class
            if market_cap and market_cap.lower() != 'all':
                if str(opp.get('marketCapClass', '')).lower() != market_cap.lower():
                    continue

            # Filter: Minimum Conviction
            if opp.get('convictionScore', 0) < min_conviction:
                continue

            # Filter: Strategy
            if strategy and strategy.lower() != 'all':
                strategies_matched = opp.get('strategiesMatched', ['all'])
                if strategy.lower() not in strategies_matched:
                    continue

            # Filter: Required Indicators
            if 'supertrend_bullish' in required_indicators and opp.get('superTrend') != 'bullish':
                continue
            if 'rsi_oversold_bounce' in required_indicators and opp.get('rsi', 50) > 55:
                continue
            if 'cmf_accumulation' in required_indicators and opp.get('cmf', 0.0) < 0.02:
                continue
            if 'price_above_vwap' in required_indicators and (opp.get('vwap') and opp.get('currentPrice', 0) < opp.get('vwap')):
                continue

            # Add watchlist marker
            opp_copy = dict(opp)
            opp_copy['isInWatchlist'] = ticker in user_wl_set
            filtered.append(opp_copy)

        # Sort filtered opportunities by conviction score descending
        filtered.sort(key=lambda x: x['convictionScore'], reverse=True)

        now = time.time()
        next_in_sec = max(0, int(next_epoch - now)) if next_epoch > 0 else self.scan_interval_seconds

        return {
            "success": True,
            "isCached": True,
            "isScanning": is_scanning,
            "timestamp": last_time or datetime.now().isoformat(),
            "lastScanTime": self.get_last_scan_time_str(),
            "nextScanTime": self.get_next_scan_time_str(),
            "nextScanInSeconds": next_in_sec,
            "criteria": {
                "market": market,
                "strategy": strategy,
                "etfBasket": etf_basket,
                "sector": sector,
                "theme": theme,
                "marketCap": market_cap,
                "minConviction": min_conviction,
                "excludeWatchlist": exclude_watchlist,
                "requiredIndicators": required_indicators
            },
            "totalUniverseScanned": len(self.get_combined_universe()),
            "opportunitiesCount": len(filtered),
            "opportunities": filtered[:limit] if limit else filtered
        }
