import os
import json
import time
import re
import math
import concurrent.futures
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import urllib.request
import urllib.parse
import yfinance as yf
from services.news_service import news_service


GLOBAL_TICKER_NAME_MAP = {
    'NVDA': 'NVIDIA Corporation',
    'MSFT': 'Microsoft Corporation',
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla Inc.',
    'IFX.DE': 'Infineon Technologies AG',
    'SAP.DE': 'SAP SE',
    'SU.PA': 'Schneider Electric S.E.',
    'TSM': 'Taiwan Semiconductor Manufacturing',
    'SPCX': 'S&P CapEx Equity ETF',
    'EXXT.DE': 'iShares NASDAQ 100 ETF (DE)',
    'XDWT.DE': 'Xtrackers MSCI World Information Tech ETF',
    'NEL.OL': 'Nel ASA',
    'PLTR': 'Palantir Technologies Inc.',
    'AMZN': 'Amazon.com Inc.',
    'GOOGL': 'Alphabet Inc.',
    'GOOG': 'Alphabet Inc.',
    'META': 'Meta Platforms Inc.',
    'AMD': 'Advanced Micro Devices Inc.',
    'ASML': 'ASML Holding N.V.',
    'COIN': 'Coinbase Global Inc.',
    'SONY': 'Sony Group Corporation',
    'PYPL': 'PayPal Holdings Inc.',
    'INTC': 'Intel Corporation',
    'QCOM': 'Qualcomm Inc.',
    'AVGO': 'Broadcom Inc.',
    'OR.PA': "L'Oréal S.A.",
    'AIR.PA': 'Airbus SE',
    'MC.PA': 'LVMH Moët Hennessy Louis Vuitton',
    'SIE.DE': 'Siemens AG',
    'ALV.DE': 'Allianz SE',
    'BMW.DE': 'Bayerische Motoren Werke AG',
    'MBG.DE': 'Mercedes-Benz Group AG',
    'VOW3.DE': 'Volkswagen AG',
    'ENPH': 'Enphase Energy Inc.',
    'FSLR': 'First Solar Inc.',
    'SEDG': 'SolarEdge Technologies Inc.',
    'BEPC': 'Brookfield Renewable Corp',
    'RUN': 'Sunrun Inc.',
    'SNOW': 'Snowflake Inc.',
    'CRWD': 'CrowdStrike Holdings Inc.',
    'PANW': 'Palo Alto Networks Inc.',
    'DDOG': 'Datadog Inc.',
    'NET': 'Cloudflare Inc.',
    'ZS': 'Zscaler Inc.',
    'ARM': 'Arm Holdings plc',
    'SMCI': 'Super Micro Computer Inc.',
    'MRVL': 'Marvell Technology Inc.',
    'MU': 'Micron Technology Inc.',
    'PATH': 'UiPath Inc.',
    'C3AI': 'C3.ai Inc.',
    'ISRG': 'Intuitive Surgical Inc.',
    'VRTX': 'Vertex Pharmaceuticals Inc.',
    'CRSP': 'CRISPR Therapeutics AG',
    'ILMN': 'Illumina Inc.',
    'SQ': 'Block Inc.',
    'SHOP': 'Shopify Inc.',
    'MELI': 'MercadoLibre Inc.',
    'SE': 'Sea Limited',
    'ABNB': 'Airbnb Inc.',
    'UBER': 'Uber Technologies Inc.',
    'DASH': 'DoorDash Inc.',
    'BKNG': 'Booking Holdings Inc.',
    'SPOT': 'Spotify Technology S.A.',
    'ABB': 'ABB Ltd',
    'ROK': 'Rockwell Automation Inc.',
    'EMR': 'Emerson Electric Co.'
}

_NAME_LOOKUP_CACHE = {}


class StockService:
    """
    Quantitative service for fetching market quotes, computing an advanced suite of
    technical indicators, overlays, momentum oscillators, and running historical backtest simulations.
    Features persistent disk caching and lightweight incremental delta updates.
    """

    def __init__(self):
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'cache')
        os.makedirs(self.cache_dir, exist_ok=True)
        self._analysis_cache = {}
        self._profile_cache = {}
        self._news_cache = {}

    @staticmethod
    def _resolve_company_name(ticker_symbol: str, info: dict) -> str:
        """Resolves the real company name with zero-latency dictionary, cache, and fast search fallbacks."""
        clean_t = ticker_symbol.strip().upper()
        
        # 1. Info dictionary from yfinance
        if info:
            name = info.get('shortName') or info.get('longName')
            if name and name.strip() and name.strip().upper() != clean_t:
                return name.strip()

        # 2. In-memory cache
        if clean_t in _NAME_LOOKUP_CACHE:
            return _NAME_LOOKUP_CACHE[clean_t]

        # 3. Global curated map
        if clean_t in GLOBAL_TICKER_NAME_MAP:
            _NAME_LOOKUP_CACHE[clean_t] = GLOBAL_TICKER_NAME_MAP[clean_t]
            return GLOBAL_TICKER_NAME_MAP[clean_t]

        # 4. Scanner universe list
        try:
            from services.scanner_service import SCANNER_UNIVERSE
            for item in SCANNER_UNIVERSE:
                if item.get('ticker', '').upper() == clean_t:
                    _NAME_LOOKUP_CACHE[clean_t] = item['name']
                    return item['name']
        except Exception:
            pass

        # 5. Fast Yahoo Finance Search API (<100ms)
        try:
            url = f"https://query1.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(clean_t)}&quotesCount=1&newsCount=0"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=1.2) as r:
                data = json.loads(r.read())
                quotes = data.get('quotes', [])
                if quotes:
                    candidate = quotes[0].get('shortname') or quotes[0].get('longname')
                    if candidate and candidate.strip():
                        _NAME_LOOKUP_CACHE[clean_t] = candidate.strip()
                        return candidate.strip()
        except Exception:
            pass

        return clean_t

    def fetch_company_name(self, ticker_symbol: str) -> str:
        """Resolves the company name for a given ticker symbol using cached maps and fast lookups."""
        return self._resolve_company_name(ticker_symbol, {})

    @staticmethod
    def get_stock_profile(ticker_obj, ticker_symbol: str, skip_info_scrape: bool = True) -> dict:
        """Extracts key fundamental metrics and company profile information using lightweight fast_info."""
        try:
            fast_info = getattr(ticker_obj, 'fast_info', None)
            info = {}

            # Only fallback to heavy quoteSummary endpoint if fast_info is unavailable and info scrape is requested
            if not skip_info_scrape and fast_info is None:
                try:
                    info = ticker_obj.info or {}
                except Exception:
                    info = {}

            resolved_name = StockService._resolve_company_name(ticker_symbol, info)

            current_price = None
            if fast_info and hasattr(fast_info, 'last_price') and fast_info.last_price is not None:
                current_price = float(fast_info.last_price)
            elif 'regularMarketPrice' in info and info['regularMarketPrice'] is not None:
                current_price = float(info['regularMarketPrice'])
            elif 'currentPrice' in info and info['currentPrice'] is not None:
                current_price = float(info['currentPrice'])

            prev_close = None
            if fast_info and hasattr(fast_info, 'previous_close') and fast_info.previous_close is not None:
                prev_close = float(fast_info.previous_close)
            elif 'regularMarketPreviousClose' in info and info['regularMarketPreviousClose'] is not None:
                prev_close = float(info['regularMarketPreviousClose'])
            elif 'previousClose' in info and info['previousClose'] is not None:
                prev_close = float(info['previousClose'])

            change = None
            change_percent = None
            if current_price is not None and prev_close is not None and prev_close > 0:
                change = round(current_price - prev_close, 2)
                change_percent = round((change / prev_close) * 100, 2)
            elif 'regularMarketChange' in info and 'regularMarketChangePercent' in info:
                change = round(float(info['regularMarketChange']), 2) if info['regularMarketChange'] else None
                change_percent = round(float(info['regularMarketChangePercent']), 2) if info['regularMarketChangePercent'] else None

            high_52 = None
            low_52 = None
            if fast_info and hasattr(fast_info, 'year_high') and fast_info.year_high:
                high_52 = round(float(fast_info.year_high), 2)
            elif 'fiftyTwoWeekHigh' in info:
                high_52 = round(float(info['fiftyTwoWeekHigh']), 2) if info['fiftyTwoWeekHigh'] else None

            if fast_info and hasattr(fast_info, 'year_low') and fast_info.year_low:
                low_52 = round(float(fast_info.year_low), 2)
            elif 'fiftyTwoWeekLow' in info:
                low_52 = round(float(info['fiftyTwoWeekLow']), 2) if info['fiftyTwoWeekLow'] else None

            market_cap = None
            if fast_info and hasattr(fast_info, 'market_cap') and fast_info.market_cap:
                market_cap = int(fast_info.market_cap)
            elif 'marketCap' in info:
                market_cap = int(info['marketCap']) if info['marketCap'] else None

            day_high = None
            day_low = None
            day_open = None
            if fast_info and hasattr(fast_info, 'day_high') and fast_info.day_high:
                day_high = round(float(fast_info.day_high), 2)
            elif 'dayHigh' in info or 'regularMarketDayHigh' in info:
                val = info.get('dayHigh') or info.get('regularMarketDayHigh')
                day_high = round(float(val), 2) if val else None

            if fast_info and hasattr(fast_info, 'day_low') and fast_info.day_low:
                day_low = round(float(fast_info.day_low), 2)
            elif 'dayLow' in info or 'regularMarketDayLow' in info:
                val = info.get('dayLow') or info.get('regularMarketDayLow')
                day_low = round(float(val), 2) if val else None

            if fast_info and hasattr(fast_info, 'open') and fast_info.open:
                day_open = round(float(fast_info.open), 2)
            elif 'open' in info or 'regularMarketOpen' in info:
                val = info.get('open') or info.get('regularMarketOpen')
                day_open = round(float(val), 2) if val else None

            currency = getattr(fast_info, 'currency', None) or info.get('currency', 'USD') or 'USD'

            return {
                'ticker': ticker_symbol,
                'name': resolved_name,
                'currency': currency,
                'sector': info.get('sector', 'Equities'),
                'industry': info.get('industry', 'N/A'),
                'currentPrice': round(current_price, 2) if current_price is not None else None,
                'previousClose': round(prev_close, 2) if prev_close is not None else None,
                'change': change,
                'changePercent': change_percent,
                'dayHigh': day_high,
                'dayLow': day_low,
                'dayOpen': day_open,
                'fiftyTwoWeekHigh': high_52,
                'fiftyTwoWeekLow': low_52,
                'marketCap': market_cap,
                'volume': int(info.get('volume') or info.get('regularMarketVolume') or 0),
                'avgVolume': int(info.get('averageVolume') or 0),
                'peRatio': round(float(info.get('trailingPE')), 2) if info.get('trailingPE') else None,
                'forwardPE': round(float(info.get('forwardPE')), 2) if info.get('forwardPE') else None,
                'dividendYield': round(float(info.get('dividendYield')) * 100, 2) if info.get('dividendYield') else None,
                'beta': round(float(info.get('beta')), 2) if info.get('beta') else None
            }
        except Exception as e:
            return {
                'ticker': ticker_symbol,
                'name': StockService._resolve_company_name(ticker_symbol, {}),
                'currency': 'USD',
                'currentPrice': None,
                'error': str(e)
            }

    @staticmethod
    def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates full indicator matrix:
        - Moving Averages (SMA 20/50/200, EMA 12/20/26/50/200)
        - Bollinger Bands (20, 2) & Keltner Channels (20, 2 ATR)
        - TTM Squeeze Detection
        - SuperTrend (10, 3 ATR)
        - VWAP (Volume-Weighted Average Price)
        - Relative Strength Index (RSI 14)
        - MACD (12, 26, 9) & Histogram
        - Stochastic Oscillator (14, 3, 3 %K, %D)
        - Chaikin Money Flow (CMF 20)
        - Commodity Channel Index (CCI 20)
        - Williams %R (14)
        - Average True Range (ATR 14)
        - On-Balance Volume (OBV)
        """
        if df.empty or len(df) < 5:
            return df

        df = df.copy()

        # 1. Moving Averages
        df['SMA_20'] = df['Close'].rolling(window=20, min_periods=5).mean()
        df['SMA_50'] = df['Close'].rolling(window=50, min_periods=10).mean()
        df['SMA_200'] = df['Close'].rolling(window=200, min_periods=20).mean()
        df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
        df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
        df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
        df['EMA_50'] = df['Close'].ewm(span=50, adjust=False).mean()
        df['EMA_200'] = df['Close'].ewm(span=200, adjust=False).mean()

        # 2. Average True Range (ATR 14)
        high_low = df['High'] - df['Low']
        high_close = (df['High'] - df['Close'].shift()).abs()
        low_close = (df['Low'] - df['Close'].shift()).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        df['ATR'] = tr.rolling(window=14, min_periods=5).mean().fillna(tr.mean())

        # 3. Bollinger Bands (20, 2)
        bb_std = df['Close'].rolling(window=20, min_periods=5).std()
        df['BB_Middle'] = df['SMA_20']
        df['BB_Upper'] = df['BB_Middle'] + (bb_std * 2)
        df['BB_Lower'] = df['BB_Middle'] - (bb_std * 2)
        df['BB_Bandwidth'] = ((df['BB_Upper'] - df['BB_Lower']) / df['BB_Middle']) * 100

        # 4. Keltner Channels (20 EMA, 2 ATR)
        df['KC_Middle'] = df['EMA_20']
        df['KC_Upper'] = df['KC_Middle'] + (2 * df['ATR'])
        df['KC_Lower'] = df['KC_Middle'] - (2 * df['ATR'])

        # 5. TTM Squeeze Detection
        df['TTM_Squeeze'] = (df['BB_Upper'] < df['KC_Upper']) & (df['BB_Lower'] > df['KC_Lower'])

        # 6. SuperTrend (10, 3 ATR)
        atr10 = tr.rolling(window=10, min_periods=5).mean().fillna(df['ATR'])
        hl2 = (df['High'] + df['Low']) / 2
        upper_band = hl2 + (3 * atr10)
        lower_band = hl2 - (3 * atr10)
        
        supertrend = [float(lower_band.iloc[0])] * len(df)
        st_dir = [1] * len(df)

        for i in range(1, len(df)):
            close_val = df['Close'].iloc[i]
            prev_st = supertrend[i-1]
            prev_dir = st_dir[i-1]

            if prev_dir == 1:
                if close_val < lower_band.iloc[i]:
                    st_dir[i] = -1
                    supertrend[i] = float(upper_band.iloc[i])
                else:
                    st_dir[i] = 1
                    supertrend[i] = float(max(lower_band.iloc[i], prev_st))
            else:
                if close_val > upper_band.iloc[i]:
                    st_dir[i] = 1
                    supertrend[i] = float(lower_band.iloc[i])
                else:
                    st_dir[i] = -1
                    supertrend[i] = float(min(upper_band.iloc[i], prev_st))

        df['SuperTrend'] = supertrend
        df['SuperTrend_Dir'] = st_dir

        # 7. VWAP
        if 'Volume' in df.columns and (df['Volume'] > 0).any():
            typical_price = (df['High'] + df['Low'] + df['Close']) / 3
            cum_vol = df['Volume'].cumsum().replace(0, np.nan)
            df['VWAP'] = (typical_price * df['Volume']).cumsum() / cum_vol
        else:
            df['VWAP'] = df['Close']

        # 8. RSI (14 with Wilder's smoothing)
        delta = df['Close'].diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
        rs = avg_gain / avg_loss.replace(0, np.nan)
        df['RSI'] = 100 - (100 / (1 + rs))
        df['RSI'] = df['RSI'].fillna(50)

        # 9. MACD (12, 26, 9)
        df['MACD'] = df['EMA_12'] - df['EMA_26']
        df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        df['MACD_Hist'] = df['MACD'] - df['MACD_Signal']

        # 10. Stochastic Oscillator (%K, %D - 14, 3, 3)
        low14 = df['Low'].rolling(14, min_periods=5).min()
        high14 = df['High'].rolling(14, min_periods=5).max()
        raw_k = 100 * ((df['Close'] - low14) / (high14 - low14).replace(0, np.nan))
        df['Stoch_K'] = raw_k.rolling(3, min_periods=1).mean().fillna(50)
        df['Stoch_D'] = df['Stoch_K'].rolling(3, min_periods=1).mean().fillna(50)

        # 11. Williams %R (14)
        df['Williams_R'] = -100 * ((high14 - df['Close']) / (high14 - low14).replace(0, np.nan))
        df['Williams_R'] = df['Williams_R'].fillna(-50)

        # 12. Commodity Channel Index (CCI 20)
        tp = (df['High'] + df['Low'] + df['Close']) / 3
        sma_tp = tp.rolling(20, min_periods=5).mean()
        mad = tp.rolling(20, min_periods=5).apply(lambda x: np.mean(np.abs(x - np.mean(x))), raw=True)
        df['CCI'] = (tp - sma_tp) / (0.015 * mad.replace(0, np.nan))
        df['CCI'] = df['CCI'].fillna(0)

        # 13. Chaikin Money Flow (CMF 20) & OBV
        if 'Volume' in df.columns:
            hl_range = (df['High'] - df['Low']).replace(0, np.nan)
            mf_mult = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / hl_range
            mf_vol = mf_mult.fillna(0) * df['Volume']
            vol_sum20 = df['Volume'].rolling(20, min_periods=5).sum().replace(0, np.nan)
            df['CMF'] = mf_vol.rolling(20, min_periods=5).sum() / vol_sum20
            df['CMF'] = df['CMF'].fillna(0)

            obv_dir = np.sign(df['Close'].diff()).fillna(0)
            df['OBV'] = (obv_dir * df['Volume']).cumsum()
            df['Volume_SMA20'] = df['Volume'].rolling(20, min_periods=5).mean()
        else:
            df['CMF'] = 0
            df['OBV'] = 0
            df['Volume_SMA20'] = 0

        return df

    @staticmethod
    def generate_technical_summary(df: pd.DataFrame, news_items: list[dict] = None) -> dict:
        """
        Synthesizes technical indicator signals and real-time news catalysts into a composite quantitative rating.
        """
        if df.empty or len(df) < 5:
            return {
                'overall': 'Neutral',
                'score': 0,
                'bullishCount': 0,
                'bearishCount': 0,
                'neutralCount': 0,
                'indicators': {}
            }

        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) >= 2 else latest

        close = float(latest.get('Close', 0))
        rsi = float(latest.get('RSI', 50))
        macd = float(latest.get('MACD', 0))
        macd_signal = float(latest.get('MACD_Signal', 0))
        macd_hist = float(latest.get('MACD_Hist', 0))
        prev_macd_hist = float(prev.get('MACD_Hist', 0))
        
        stoch_k = float(latest.get('Stoch_K', 50))
        stoch_d = float(latest.get('Stoch_D', 50))
        cmf = float(latest.get('CMF', 0))
        supertrend_dir = int(latest.get('SuperTrend_Dir', 1))
        supertrend_val = float(latest.get('SuperTrend', close))
        is_squeeze = bool(latest.get('TTM_Squeeze', False))
        
        sma50 = float(latest.get('SMA_50', 0)) if not pd.isna(latest.get('SMA_50')) else None
        vwap = float(latest.get('VWAP', 0)) if not pd.isna(latest.get('VWAP')) else None
        atr = float(latest.get('ATR', 0)) if not pd.isna(latest.get('ATR')) else 0

        signals = {}
        bullish = 0
        bearish = 0
        neutral = 0

        # 1. RSI Evaluation
        if rsi < 30:
            signals['RSI'] = {'value': round(rsi, 2), 'signal': 'Oversold', 'status': 'bullish', 'desc': 'RSI is oversold (<30), signaling potential upward reversal.'}
            bullish += 1
        elif rsi > 70:
            signals['RSI'] = {'value': round(rsi, 2), 'signal': 'Overbought', 'status': 'bearish', 'desc': 'RSI is overbought (>70), suggesting short-term consolidation.'}
            bearish += 1
        else:
            signals['RSI'] = {'value': round(rsi, 2), 'signal': 'Neutral', 'status': 'neutral', 'desc': 'RSI momentum is balanced in the 30-70 corridor.'}
            neutral += 1

        # 2. MACD Evaluation
        if macd > macd_signal and prev_macd_hist <= 0 and macd_hist > 0:
            signals['MACD'] = {'value': round(macd, 2), 'signal_line': round(macd_signal, 2), 'signal': 'Bullish Crossover', 'status': 'bullish', 'desc': 'MACD surged above Signal line with expanding positive momentum.'}
            bullish += 2
        elif macd > macd_signal:
            signals['MACD'] = {'value': round(macd, 2), 'signal_line': round(macd_signal, 2), 'signal': 'Bullish Trend', 'status': 'bullish', 'desc': 'MACD line is tracking above the Signal line.'}
            bullish += 1
        elif macd < macd_signal and prev_macd_hist >= 0 and macd_hist < 0:
            signals['MACD'] = {'value': round(macd, 2), 'signal_line': round(macd_signal, 2), 'signal': 'Bearish Crossover', 'status': 'bearish', 'desc': 'MACD crossed below Signal line signaling momentum contraction.'}
            bearish += 2
        else:
            signals['MACD'] = {'value': round(macd, 2), 'signal_line': round(macd_signal, 2), 'signal': 'Bearish Trend', 'status': 'bearish', 'desc': 'MACD line is below the Signal line.'}
            bearish += 1

        # 3. SuperTrend
        if supertrend_dir == 1:
            signals['SuperTrend'] = {'value': round(supertrend_val, 2), 'signal': 'Bullish Uptrend', 'status': 'bullish', 'desc': f'SuperTrend trailing support is at ${round(supertrend_val, 2)}.'}
            bullish += 2
        else:
            signals['SuperTrend'] = {'value': round(supertrend_val, 2), 'signal': 'Bearish Downtrend', 'status': 'bearish', 'desc': f'SuperTrend resistance ceiling is at ${round(supertrend_val, 2)}.'}
            bearish += 2

        # 4. Stochastic
        if stoch_k < 20:
            signals['Stochastic'] = {'value': f'{round(stoch_k, 1)} / {round(stoch_d, 1)}', 'signal': 'Oversold / Turn', 'status': 'bullish', 'desc': 'Stochastic is in deep oversold territory (<20).'}
            bullish += 1
        elif stoch_k > 80:
            signals['Stochastic'] = {'value': f'{round(stoch_k, 1)} / {round(stoch_d, 1)}', 'signal': 'Overbought', 'status': 'bearish', 'desc': 'Stochastic is elevated in overbought zone (>80).'}
            bearish += 1
        elif stoch_k > stoch_d:
            signals['Stochastic'] = {'value': f'{round(stoch_k, 1)} / {round(stoch_d, 1)}', 'signal': 'Bullish Cross', 'status': 'bullish', 'desc': '%K line is trending above %D trigger line.'}
            bullish += 1
        else:
            signals['Stochastic'] = {'value': f'{round(stoch_k, 1)} / {round(stoch_d, 1)}', 'signal': 'Bearish Cross', 'status': 'bearish', 'desc': '%K line is trending below %D trigger line.'}
            bearish += 1

        # 5. Chaikin Money Flow
        if cmf > 0.05:
            signals['CMF'] = {'value': round(cmf, 2), 'signal': 'Institutional Inflow', 'status': 'bullish', 'desc': 'Strong accumulation with positive volume-weighted capital inflows.'}
            bullish += 1
        elif cmf < -0.05:
            signals['CMF'] = {'value': round(cmf, 2), 'signal': 'Distribution / Outflow', 'status': 'bearish', 'desc': 'Capital distribution with net selling pressure.'}
            bearish += 1
        else:
            signals['CMF'] = {'value': round(cmf, 2), 'signal': 'Neutral Flow', 'status': 'neutral', 'desc': 'Institutional capital flow is near equilibrium.'}
            neutral += 1

        # 6. Moving Average & VWAP Trends
        if vwap and close > vwap:
            signals['VWAP'] = {'value': round(vwap, 2), 'signal': 'Above VWAP', 'status': 'bullish', 'desc': 'Price trading above institutional volume-weighted average.'}
            bullish += 1
        elif vwap:
            signals['VWAP'] = {'value': round(vwap, 2), 'signal': 'Below VWAP', 'status': 'bearish', 'desc': 'Price trading below volume-weighted average price.'}
            bearish += 1

        if sma50:
            if close > sma50:
                signals['SMA_50'] = {'value': round(sma50, 2), 'signal': 'Above SMA 50', 'status': 'bullish', 'desc': 'Trading above 50-day moving average (Medium-term bull).'}
                bullish += 1
            else:
                signals['SMA_50'] = {'value': round(sma50, 2), 'signal': 'Below SMA 50', 'status': 'bearish', 'desc': 'Trading below 50-day moving average (Medium-term bear).'}
                bearish += 1

        # 7. Volatility Squeeze
        if is_squeeze:
            signals['Volatility_Squeeze'] = {'value': f'ATR: ${round(atr, 2)}', 'signal': 'Squeeze Active', 'status': 'neutral', 'desc': 'Bollinger Bands contracted inside Keltner Channels. Explosive breakout impending.'}
            neutral += 1
        else:
            signals['Volatility_Squeeze'] = {'value': f'ATR: ${round(atr, 2)}', 'signal': 'Normal Expansion', 'status': 'neutral', 'desc': 'Channels are expanding normally.'}
            neutral += 1

        # 8. Real-Time News Catalyst & Sentiment Signal
        if news_items and isinstance(news_items, list) and len(news_items) > 0:
            top_articles = news_items[:8]
            
            bullish_keywords = [
                'beat', 'beats', 'record', 'surge', 'jump', 'profit', 'upgrade', 'upgrades', 'outperform',
                'buy rating', 'raise', 'raises', 'raised', 'higher', 'growth', 'acquisition', 'contract',
                'patent', 'approval', 'partnership', 'expansion', 'bullish', 'strong earnings', 'dividend'
            ]
            bearish_keywords = [
                'miss', 'misses', 'drop', 'fall', 'plunge', 'loss', 'downgrade', 'downgrades', 'underperform',
                'sell rating', 'cut', 'cuts', 'lower', 'decline', 'investigation', 'lawsuit', 'sec', 'probe',
                'layoffs', 'warning', 'adverse', 'fine', 'slump', 'weak', 'headwind', 'restructuring'
            ]
            tier1_publishers = [
                'reuters', 'bloomberg', 'cnbc', 'wsj', 'wall street journal', 'financial times', 'ft',
                'handelsblatt', 'nikkei', 'barron', 'dow jones', 'associated press', 'marketwatch'
            ]

            news_bull_count = 0
            news_bear_count = 0
            best_catalyst_item = None
            max_impact = 0

            for art in top_articles:
                text = (str(art.get('title', '')) + " " + str(art.get('summary', ''))).lower()
                pub = str(art.get('publisher', '')).lower()
                is_tier1 = any(t1 in pub for t1 in tier1_publishers)
                
                bull_hits = sum(1 for kw in bullish_keywords if re.search(r'\b' + re.escape(kw) + r'\b', text))
                bear_hits = sum(1 for kw in bearish_keywords if re.search(r'\b' + re.escape(kw) + r'\b', text))
                
                impact = (bull_hits + bear_hits) * (1.5 if is_tier1 else 1.0)
                if impact > max_impact:
                    max_impact = impact
                    best_catalyst_item = art

                if bull_hits > bear_hits:
                    news_bull_count += 1
                elif bear_hits > bull_hits:
                    news_bear_count += 1

            if not best_catalyst_item:
                best_catalyst_item = top_articles[0]

            catalyst_headline = best_catalyst_item.get('title', 'Recent Financial News Wire')
            catalyst_summary = best_catalyst_item.get('summary', '') or catalyst_headline
            catalyst_pub = best_catalyst_item.get('publisher', 'Financial Wire')
            catalyst_url = best_catalyst_item.get('url', '#')
            catalyst_time = best_catalyst_item.get('timeAgo') or best_catalyst_item.get('time') or 'Recent'

            if news_bull_count > news_bear_count:
                news_status = 'bullish'
                news_signal_label = 'Bullish Catalyst Wire'
                news_desc = f'Positive market catalysts detected across latest reports: "{catalyst_headline[:85]}..."'
                bullish += 1
            elif news_bear_count > news_bull_count:
                news_status = 'bearish'
                news_signal_label = 'Adverse Event Wire'
                news_desc = f'Negative catalyst or headline pressure detected: "{catalyst_headline[:85]}..."'
                bearish += 1
            else:
                news_status = 'neutral'
                news_signal_label = 'Balanced News Flow'
                news_desc = f'Latest wire headlines reflect neutral/balanced market catalysts.'
                neutral += 1

            signals['News_Catalyst'] = {
                'value': f'{len(top_articles)} Wires Evaluated',
                'signal': news_signal_label,
                'status': news_status,
                'desc': news_desc,
                'headline': catalyst_headline,
                'summary': catalyst_summary,
                'publisher': catalyst_pub,
                'url': catalyst_url,
                'timeAgo': catalyst_time,
                'sentiment': 'Bullish' if news_status == 'bullish' else ('Bearish' if news_status == 'bearish' else 'Neutral'),
                'impactScore': min(100, int(max_impact * 25 + 30))
            }

        total_score = bullish - bearish
        if total_score >= 4:
            overall = 'Strong Buy'
        elif total_score in [2, 3]:
            overall = 'Buy'
        elif total_score in [-1, 0, 1]:
            overall = 'Neutral'
        elif total_score in [-2, -3]:
            overall = 'Sell'
        else:
            overall = 'Strong Sell'

        return {
            'overall': overall,
            'score': total_score,
            'bullishCount': bullish,
            'bearishCount': bearish,
            'neutralCount': neutral,
            'indicators': signals
        }

    @staticmethod
    def simulate_backtest(timeseries: list[dict], strategy: str = 'quant', initial_capital: float = 10000.0) -> dict:
        """
        Simulates an algorithmic trading backtest across the historical timeseries:
        - Tracks BUY / SELL / HOLD execution
        - Generates equity curve vs Buy & Hold benchmark
        - Computes Alpha, Win Rate, Profit Factor, and Max Drawdown
        """
        if not timeseries or len(timeseries) < 5:
            return {
                'initialCapital': initial_capital,
                'finalEquity': initial_capital,
                'strategyReturnPct': 0.0,
                'buyHoldReturnPct': 0.0,
                'alpha': 0.0,
                'maxDrawdownPct': 0.0,
                'totalTrades': 0,
                'winningTrades': 0,
                'losingTrades': 0,
                'winRatePct': 0.0,
                'profitFactor': 1.0,
                'isCurrentlyHolding': False,
                'trades': [],
                'equityCurve': []
            }

        capital = float(initial_capital)
        position = 0.0
        entry_price = 0.0
        entry_date = ''
        trades = []
        equity_curve = []
        closed_trades = []

        initial_price = timeseries[0].get('close') or 1.0
        peak_equity = capital
        max_drawdown = 0.0

        for p in timeseries:
            date = p.get('time')
            ts = p.get('timestamp')
            close = p.get('close')
            if not close or close <= 0:
                continue

            buy_signal = False
            sell_signal = False
            buy_reason = ''
            sell_reason = ''

            if strategy == 'quant':
                # Quantitative Multi-Factor Strategy
                score = 0
                if p.get('superTrendDir') == 1:
                    score += 2
                else:
                    score -= 2

                if p.get('macdHist') and p['macdHist'] > 0:
                    score += 1
                elif p.get('macdHist') and p['macdHist'] < 0:
                    score -= 1

                if p.get('rsi') and p['rsi'] > 45:
                    score += 1
                elif p.get('rsi') and p['rsi'] < 40:
                    score -= 1

                if p.get('sma20') and close > p['sma20']:
                    score += 1
                elif p.get('sma20') and close < p['sma20']:
                    score -= 1

                if p.get('stochK') and p.get('stochD') and p['stochK'] > p['stochD']:
                    score += 1
                elif p.get('stochK') and p.get('stochD') and p['stochK'] < p['stochD']:
                    score -= 1

                if score >= 2:
                    buy_signal = True
                    buy_reason = f'Multi-Factor Bullish (Score +{score})'
                elif score <= -1:
                    sell_signal = True
                    sell_reason = f'Multi-Factor Bearish (Score {score})'

            elif strategy == 'supertrend':
                # Pure SuperTrend Follower
                if p.get('superTrendDir') == 1:
                    buy_signal = True
                    buy_reason = 'SuperTrend Uptrend Green'
                else:
                    sell_signal = True
                    sell_reason = 'SuperTrend Downtrend Red'

            elif strategy == 'momentum':
                # MACD + RSI Momentum Strategy
                macd_hist = p.get('macdHist', 0) or 0
                rsi_val = p.get('rsi', 50) or 50
                if macd_hist > 0 and rsi_val > 45:
                    buy_signal = True
                    buy_reason = f'MACD Expansion + RSI ({round(rsi_val, 1)})'
                elif macd_hist < 0 and rsi_val < 50:
                    sell_signal = True
                    sell_reason = 'MACD Contraction & Weak RSI'

            elif strategy == 'rsi_oversold':
                rsi_val = p.get('rsi', 50) or 50
                if rsi_val <= 32:
                    buy_signal = True
                    buy_reason = f'RSI Oversold ({round(rsi_val, 1)})'
                elif rsi_val >= 68:
                    sell_signal = True
                    sell_reason = f'RSI Overbought ({round(rsi_val, 1)})'

            elif strategy == 'macd_crossover':
                macd_hist = p.get('macdHist', 0) or 0
                if macd_hist > 0:
                    buy_signal = True
                    buy_reason = 'MACD Positive Crossover'
                elif macd_hist < 0:
                    sell_signal = True
                    sell_reason = 'MACD Negative Crossover'

            # Execution Engine
            if position == 0 and buy_signal:
                shares = capital / close
                position = shares
                entry_price = close
                entry_date = date
                trades.append({
                    'id': len(trades) + 1,
                    'action': 'BUY',
                    'date': date,
                    'timestamp': ts,
                    'price': round(close, 2),
                    'shares': round(shares, 4),
                    'capital': round(capital, 2),
                    'reason': buy_reason
                })
            elif position > 0 and sell_signal:
                exit_price = close
                pnl_dollars = (exit_price - entry_price) * position
                pnl_pct = ((exit_price - entry_price) / entry_price) * 100
                capital = position * exit_price

                trade_record = {
                    'id': len(trades) + 1,
                    'action': 'SELL',
                    'entryDate': entry_date,
                    'date': date,
                    'timestamp': ts,
                    'entryPrice': round(entry_price, 2),
                    'price': round(exit_price, 2),
                    'shares': round(position, 4),
                    'pnl': round(pnl_dollars, 2),
                    'pnlPct': round(pnl_pct, 2),
                    'capital': round(capital, 2),
                    'reason': sell_reason
                }
                trades.append(trade_record)
                closed_trades.append(trade_record)
                position = 0.0

            current_equity = capital if position == 0 else position * close
            buy_hold_equity = initial_capital * (close / initial_price)

            if current_equity > peak_equity:
                peak_equity = current_equity
            drawdown = ((peak_equity - current_equity) / peak_equity) * 100
            if drawdown > max_drawdown:
                max_drawdown = drawdown

            equity_curve.append({
                'date': date,
                'timestamp': ts,
                'strategyEquity': round(current_equity, 2),
                'buyHoldEquity': round(buy_hold_equity, 2),
                'inMarket': position > 0
            })

        final_equity = equity_curve[-1]['strategyEquity'] if equity_curve else capital
        final_buy_hold = equity_curve[-1]['buyHoldEquity'] if equity_curve else capital
        strat_return = ((final_equity - initial_capital) / initial_capital) * 100
        bh_return = ((final_buy_hold - initial_capital) / initial_capital) * 100

        winning_trades = [t for t in closed_trades if t['pnl'] > 0]
        losing_trades = [t for t in closed_trades if t['pnl'] <= 0]
        win_rate = (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0.0

        gross_profits = sum(t['pnl'] for t in winning_trades)
        gross_losses = abs(sum(t['pnl'] for t in losing_trades))
        profit_factor = (gross_profits / gross_losses) if gross_losses > 0 else (99.0 if gross_profits > 0 else 1.0)

        return {
            'strategy': strategy,
            'initialCapital': initial_capital,
            'finalEquity': round(final_equity, 2),
            'strategyReturnPct': round(strat_return, 2),
            'buyHoldReturnPct': round(bh_return, 2),
            'alpha': round(strat_return - bh_return, 2),
            'maxDrawdownPct': round(max_drawdown, 2),
            'totalTrades': len(closed_trades),
            'winningTrades': len(winning_trades),
            'losingTrades': len(losing_trades),
            'winRatePct': round(win_rate, 1),
            'profitFactor': round(profit_factor, 2),
            'isCurrentlyHolding': position > 0,
            'trades': trades,
            'equityCurve': equity_curve
        }

    @staticmethod
    def _patch_latest_bar_if_nan(ticker: str, df: pd.DataFrame) -> pd.DataFrame:
        """
        Ensures the latest active trading day is never dropped due to yfinance
        returning NaN close for unfinalized daily settlement bars.
        Patches Close, Open, High, Low, Volume using real-time fast_info.
        """
        if df is None or df.empty or 'Close' not in df.columns:
            return df
        try:
            if pd.isna(df['Close'].iloc[-1]):
                t = yf.Ticker(ticker)
                fi = getattr(t, 'fast_info', None)
                if fi:
                    last_price = getattr(fi, 'last_price', None)
                    if last_price is not None and not np.isnan(last_price) and last_price > 0:
                        last_idx = df.index[-1]
                        day_open = getattr(fi, 'open', last_price) or last_price
                        day_high = getattr(fi, 'day_high', max(day_open, last_price)) or max(day_open, last_price)
                        day_low = getattr(fi, 'day_low', min(day_open, last_price)) or min(day_open, last_price)
                        vol = getattr(fi, 'last_volume', None)
                        if vol is None or np.isnan(vol):
                            vol = df['Volume'].iloc[-1] if 'Volume' in df.columns else 0
                        df.loc[last_idx, 'Close'] = float(last_price)
                        df.loc[last_idx, 'Open'] = float(day_open)
                        df.loc[last_idx, 'High'] = float(day_high)
                        df.loc[last_idx, 'Low'] = float(day_low)
                        if 'Volume' in df.columns:
                            df.loc[last_idx, 'Volume'] = int(vol) if (vol and not np.isnan(vol)) else 0
        except Exception:
            pass
        return df

    def get_historical_dataframe(self, ticker: str, period: str = '6mo', interval: str = '1d', force_refresh: bool = False) -> pd.DataFrame:
        """
        Retrieves historical market data using persistent server-side disk caching
        and lightweight delta downloads for fast reloading.
        """
        safe_ticker = ticker.replace('/', '_').replace('^', '_')
        cache_file = os.path.join(self.cache_dir, f"{safe_ticker}_{interval}.csv")
        now = time.time()

        PERIOD_ROW_REQUIREMENTS = {
            '1mo': 20,
            '3mo': 58,
            '6mo': 118,
            '1y': 238,
            '2y': 475,
            '5y': 1180,
            'max': 2350
        }
        required_rows = PERIOD_ROW_REQUIREMENTS.get(period, 118)
        
        cached_df = None
        if os.path.exists(cache_file):
            try:
                cached_df = pd.read_csv(cache_file, index_col=0, parse_dates=True)
                if isinstance(cached_df.columns, pd.MultiIndex):
                    cached_df.columns = [col[0] for col in cached_df.columns]
                file_age = now - os.path.getmtime(cache_file)
                # If cache is fresh (< 1800 seconds / 30 mins), not forced, and has sufficient historical depth
                if not force_refresh and file_age < 1800 and not cached_df.empty and len(cached_df) >= required_rows:
                    return cached_df
                elif len(cached_df) < required_rows:
                    cached_df = None  # Force full download to satisfy larger period requested
            except Exception:
                cached_df = None

        # If we have existing cached data with sufficient depth, perform a lightweight DELTA download
        if cached_df is not None and not cached_df.empty and 'Close' in cached_df.columns:
            try:
                last_dt = cached_df.index[-1]
                if isinstance(last_dt, str):
                    last_dt = pd.to_datetime(last_dt)

                # Fetch only from 3 days prior to last cached bar to today
                delta_start = (last_dt - timedelta(days=3)).strftime('%Y-%m-%d')
                delta_df = yf.download(ticker, start=delta_start, interval=interval, progress=False)

                if isinstance(delta_df.columns, pd.MultiIndex):
                    delta_df.columns = [col[0] for col in delta_df.columns]

                if not delta_df.empty and 'Close' in delta_df.columns:
                    delta_df = self._patch_latest_bar_if_nan(ticker, delta_df)
                    # Combine cached and delta, removing duplicate timestamps keeping the latest
                    combined_df = pd.concat([cached_df, delta_df])
                    combined_df = combined_df.loc[~combined_df.index.duplicated(keep='last')]
                    combined_df = self._patch_latest_bar_if_nan(ticker, combined_df)
                    combined_df = combined_df.dropna(subset=['Close'])
                    combined_df.to_csv(cache_file)
                    return combined_df
                else:
                    # No new bars (e.g. weekend/closed), touch file mtime
                    os.utime(cache_file, None)
                    return cached_df
            except Exception:
                return cached_df

        # If no cache exists or existing cache was too shallow for requested period, download full history
        try:
            download_period = period if period in ('2y', '5y', 'max') else '2y'
            full_df = yf.download(ticker, period=download_period, interval=interval, progress=False)
            if isinstance(full_df.columns, pd.MultiIndex):
                full_df.columns = [col[0] for col in full_df.columns]

            if not full_df.empty and 'Close' in full_df.columns:
                full_df = self._patch_latest_bar_if_nan(ticker, full_df)
                full_df = full_df.dropna(subset=['Close'])
                full_df.to_csv(cache_file)
                return full_df
        except Exception:
            pass

        return pd.DataFrame()

    def _process_single_ticker(self, ticker: str, period: str = '6mo', interval: str = '1d', force_refresh: bool = False) -> tuple[str, dict]:
        """Processes an individual ticker: downloads data, computes indicators, profile, backtests, and news."""
        now = time.time()
        cache_key = f"{ticker}_{period}_{interval}"
        cached_entry = self._analysis_cache.get(cache_key)

        # Check if in-memory cache is valid (< 600s) and not force_refresh
        if not force_refresh and cached_entry and (now - cached_entry['timestamp'] < 600):
            return ticker, cached_entry['data']

        try:
            ticker_df = self.get_historical_dataframe(ticker, period=period, interval=interval, force_refresh=force_refresh)

            if ticker_df.empty or 'Close' not in ticker_df.columns:
                return ticker, {'error': f'No historical data found for {ticker}.'}

            enriched_df = self.calculate_technical_indicators(ticker_df)

            last_row = enriched_df.iloc[-1]
            prev_row = enriched_df.iloc[-2] if len(enriched_df) > 1 else last_row

            curr_price = round(float(last_row.get('Close', 0.0)), 2)
            prev_close = round(float(prev_row.get('Close', curr_price)), 2)
            change = round(curr_price - prev_close, 2)
            change_pct = round((change / prev_close * 100) if prev_close > 0 else 0.0, 2)

            high_52 = round(float(enriched_df['High'].tail(252).max()), 2) if 'High' in enriched_df.columns else curr_price
            low_52 = round(float(enriched_df['Low'].tail(252).min()), 2) if 'Low' in enriched_df.columns else curr_price
            day_high = round(float(last_row.get('High', curr_price)), 2)
            day_low = round(float(last_row.get('Low', curr_price)), 2)
            day_open = round(float(last_row.get('Open', curr_price)), 2)
            volume = int(last_row.get('Volume', 0)) if not pd.isna(last_row.get('Volume', 0)) else 0

            comp_name = self._resolve_company_name(ticker, {})
            currency = 'EUR' if ('.DE' in ticker or '.PA' in ticker or '.AS' in ticker) else ('NOK' if '.OL' in ticker else ('SEK' if '.ST' in ticker else ('JPY' if '.T' in ticker else 'USD')))

            profile = {
                'ticker': ticker,
                'name': comp_name,
                'currentPrice': curr_price,
                'previousClose': prev_close,
                'change': change,
                'changePercent': change_pct,
                'currency': currency,
                'open': day_open,
                'dayHigh': day_high,
                'dayLow': day_low,
                'fiftyTwoWeekHigh': high_52,
                'fiftyTwoWeekLow': low_52,
                'volume': volume,
                'atr': round(float(last_row.get('ATR', 0)), 2) if not pd.isna(last_row.get('ATR')) else None,
                'vwap': round(float(last_row.get('VWAP', 0)), 2) if not pd.isna(last_row.get('VWAP')) else None,
                'superTrend': round(float(last_row.get('SuperTrend', 0)), 2) if not pd.isna(last_row.get('SuperTrend')) else None,
                'cmf': round(float(last_row.get('CMF', 0)), 2) if not pd.isna(last_row.get('CMF')) else None
            }

            signals = self.generate_technical_summary(enriched_df)

            timeseries = []
            for row in enriched_df.reset_index().to_dict('records'):
                idx = row.get('Date') or row.get('index')
                if isinstance(idx, (pd.Timestamp, datetime)):
                    time_str = idx.strftime('%Y-%m-%d')
                    timestamp_ms = int(idx.timestamp() * 1000)
                else:
                    time_str = str(idx)[:10] if idx is not None else ''
                    timestamp_ms = 0

                def safe_val(val, decimals=2):
                    if val is None or pd.isna(val) or np.isinf(val):
                        return None
                    return round(float(val), decimals)

                point = {
                    'time': time_str,
                    'timestamp': timestamp_ms,
                    'open': safe_val(row.get('Open')),
                    'high': safe_val(row.get('High')),
                    'low': safe_val(row.get('Low')),
                    'close': safe_val(row.get('Close')),
                    'volume': int(row.get('Volume', 0)) if not pd.isna(row.get('Volume', 0)) else 0,
                    # Frontend camelCase keys (ApexCharts & oscillators)
                    'sma20': safe_val(row.get('SMA_20')),
                    'sma50': safe_val(row.get('SMA_50')),
                    'sma200': safe_val(row.get('SMA_200')),
                    'ema20': safe_val(row.get('EMA_20')),
                    'ema50': safe_val(row.get('EMA_50')),
                    'ema200': safe_val(row.get('EMA_200')),
                    'bbUpper': safe_val(row.get('BB_Upper')),
                    'bbMiddle': safe_val(row.get('BB_Middle')),
                    'bbLower': safe_val(row.get('BB_Lower')),
                    'kcUpper': safe_val(row.get('KC_Upper')),
                    'kcMiddle': safe_val(row.get('KC_Middle')),
                    'kcLower': safe_val(row.get('KC_Lower')),
                    'superTrend': safe_val(row.get('SuperTrend')),
                    'superTrendDir': int(row.get('SuperTrend_Dir', row.get('SuperTrend_Direction', 1))),
                    'vwap': safe_val(row.get('VWAP')),
                    'ttmSqueeze': bool(row.get('TTM_Squeeze', False)),
                    'rsi': safe_val(row.get('RSI'), 1),
                    'macd': safe_val(row.get('MACD')),
                    'macdSignal': safe_val(row.get('MACD_Signal') or row.get('Signal')),
                    'macdHist': safe_val(row.get('MACD_Hist') or row.get('Hist')),
                    'stochK': safe_val(row.get('Stoch_K') or row.get('Stochastic_K'), 1),
                    'stochD': safe_val(row.get('Stoch_D') or row.get('Stochastic_D'), 1),
                    'cmf': safe_val(row.get('CMF'), 3),
                    'cci': safe_val(row.get('CCI')),
                    'williamsR': safe_val(row.get('Williams_R')),
                    'atr': safe_val(row.get('ATR')),
                    'volumeSma': safe_val(row.get('Volume_SMA20'), 0),
                    # Uppercase alias keys
                    'SMA_20': safe_val(row.get('SMA_20')),
                    'SMA_50': safe_val(row.get('SMA_50')),
                    'SMA_200': safe_val(row.get('SMA_200')),
                    'RSI': safe_val(row.get('RSI'), 1),
                    'MACD': safe_val(row.get('MACD')),
                    'Signal': safe_val(row.get('MACD_Signal') or row.get('Signal')),
                    'Hist': safe_val(row.get('MACD_Hist') or row.get('Hist')),
                    'SuperTrend': safe_val(row.get('SuperTrend')),
                    'VWAP': safe_val(row.get('VWAP')),
                    'CMF': safe_val(row.get('CMF'), 3)
                }
                timeseries.append(point)

            # Slice timeseries to match the requested timeframe period
            PERIOD_DAYS_MAP = {
                '1mo': 22,
                '3mo': 65,
                '6mo': 130,
                '1y': 252,
                '2y': 504,
                '5y': 1260,
                'max': None
            }
            slice_limit = PERIOD_DAYS_MAP.get(period)
            display_timeseries = timeseries[-slice_limit:] if (slice_limit and len(timeseries) > slice_limit) else timeseries

            backtests = {
                'quant': self.simulate_backtest(display_timeseries, strategy='quant'),
                'supertrend': self.simulate_backtest(display_timeseries, strategy='supertrend'),
                'momentum': self.simulate_backtest(display_timeseries, strategy='momentum'),
                'rsi_oversold': self.simulate_backtest(display_timeseries, strategy='rsi_oversold'),
                'macd_crossover': self.simulate_backtest(display_timeseries, strategy='macd_crossover')
            }

            news = self.fetch_stock_news(ticker, company_name=profile.get('name', ''), limit=35, force_refresh=force_refresh)

            stock_entry = {
                'profile': profile,
                'signals': signals,
                'timeseries': display_timeseries,
                'fullTimeseries': timeseries,
                'period': period,
                'backtests': backtests,
                'news': news,
                'dataPointsCount': len(display_timeseries)
            }

            self._analysis_cache[cache_key] = {'timestamp': now, 'data': stock_entry}
            return ticker, stock_entry

        except Exception as e:
            return ticker, {'error': f'Error analyzing {ticker}: {str(e)}'}

    def _process_single_ticker_fast(self, ticker: str, force_refresh: bool = False) -> tuple[str, dict]:
        """Rapidly processes an individual ticker for Stage 1 Fast Hydration (quotes, sparklines, core signals) in <5ms."""
        now = time.time()
        fast_cache_key = f"{ticker}_fast"
        cached_entry = self._analysis_cache.get(fast_cache_key)

        if not force_refresh and cached_entry and (now - cached_entry['timestamp'] < 300):
            return ticker, cached_entry['data']

        try:
            safe_ticker = ticker.replace('/', '_').replace('^', '_')
            cache_file = os.path.join(self.cache_dir, f"{safe_ticker}_1d.csv")
            
            ticker_df = None
            if os.path.exists(cache_file) and not force_refresh:
                try:
                    ticker_df = pd.read_csv(cache_file, index_col=0, parse_dates=True)
                    if isinstance(ticker_df.columns, pd.MultiIndex):
                        ticker_df.columns = [col[0] for col in ticker_df.columns]
                    ticker_df = self._patch_latest_bar_if_nan(ticker, ticker_df)
                except Exception:
                    ticker_df = None

            if ticker_df is None or ticker_df.empty or 'Close' not in ticker_df.columns:
                ticker_df = self.get_historical_dataframe(ticker, period='1mo', interval='1d', force_refresh=force_refresh)

            if ticker_df.empty or 'Close' not in ticker_df.columns:
                return ticker, {'error': f'No historical data found for {ticker}.'}

            ticker_df = self._patch_latest_bar_if_nan(ticker, ticker_df)
            ticker_df = ticker_df.dropna(subset=['Close'])

            # Use last 60 bars for instantaneous local indicator computation
            calc_df = ticker_df.tail(60).copy()
            enriched_df = self.calculate_technical_indicators(calc_df)

            last_row = enriched_df.iloc[-1]
            prev_row = enriched_df.iloc[-2] if len(enriched_df) > 1 else last_row

            curr_price = round(float(last_row.get('Close', 0.0)), 2)
            prev_price = round(float(prev_row.get('Close', curr_price)), 2)
            change = round(curr_price - prev_price, 2)
            change_percent = round((change / prev_price * 100) if prev_price > 0 else 0.0, 2)

            comp_name = self._resolve_company_name(ticker, {})
            currency = 'EUR' if ('.DE' in ticker or '.PA' in ticker or '.AS' in ticker) else ('NOK' if '.OL' in ticker else ('SEK' if '.ST' in ticker else ('JPY' if '.T' in ticker else 'USD')))

            profile = {
                'ticker': ticker,
                'name': comp_name,
                'currentPrice': curr_price,
                'previousClose': prev_price,
                'change': change,
                'changePercent': change_percent,
                'currency': currency,
                'atr': round(float(last_row.get('ATR', 0)), 2) if not pd.isna(last_row.get('ATR')) else None,
                'vwap': round(float(last_row.get('VWAP', 0)), 2) if not pd.isna(last_row.get('VWAP')) else None,
                'superTrend': round(float(last_row.get('SuperTrend', 0)), 2) if not pd.isna(last_row.get('SuperTrend')) else None,
                'cmf': round(float(last_row.get('CMF', 0)), 2) if not pd.isna(last_row.get('CMF')) else None
            }

            signals = self.generate_technical_summary(enriched_df, news_items=[])

            # Extract lightweight sparkline (last 30 closes)
            sparkline = []
            for idx, row in enriched_df.tail(30).iterrows():
                close_val = row.get('Close')
                if close_val is not None and not pd.isna(close_val):
                    time_str = idx.strftime('%Y-%m-%d') if isinstance(idx, (pd.Timestamp, datetime)) else str(idx)
                    sparkline.append({
                        'time': time_str,
                        'close': round(float(close_val), 2)
                    })

            fast_entry = {
                'profile': profile,
                'signals': signals,
                'sparkline': sparkline,
                'dataPointsCount': len(sparkline),
                'isFastHydration': True
            }

            self._analysis_cache[fast_cache_key] = {'timestamp': now, 'data': fast_entry}
            return ticker, fast_entry

        except Exception as e:
            return ticker, {'error': f'Error in fast analysis for {ticker}: {str(e)}'}

    def fetch_fast_stock_analysis(self, tickers: list[str], force_refresh: bool = False) -> dict:
        """Fetches lightweight market quotes, sparklines, and directional stance in parallel for sub-100ms response."""
        if not tickers:
            return {'error': 'No tickers provided'}

        cleaned_tickers = [t.strip().upper() for t in tickers if t and t.strip()]
        if not cleaned_tickers:
            return {'error': 'No valid tickers provided'}

        results = {}
        max_workers = min(len(cleaned_tickers), 16)

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_ticker = {
                executor.submit(self._process_single_ticker_fast, ticker, force_refresh): ticker
                for ticker in cleaned_tickers
            }
            for future in concurrent.futures.as_completed(future_to_ticker):
                ticker = future_to_ticker[future]
                try:
                    t_symbol, sdata = future.result()
                    results[t_symbol] = sdata
                except Exception as e:
                    results[ticker] = {'error': f'Fast worker error analyzing {ticker}: {str(e)}'}

        return {
            'stocks': results,
            'tickers': cleaned_tickers,
            'isFastHydration': True,
            'timestamp': datetime.now().isoformat()
        }

    def calculate_indicators_from_df(self, df: pd.DataFrame, ticker: str, company_name: str = '') -> tuple[list[dict], dict, dict]:
        """
        Fast in-memory calculator converting a raw OHLCV DataFrame into full technical timeseries,
        oscillator signals, and current financial profile in <1ms without disk I/O.
        """
        if df is None or df.empty or 'Close' not in df.columns or len(df) < 5:
            return [], {}, {}

        try:
            enriched_df = self.calculate_technical_indicators(df.copy())
            if enriched_df.empty:
                return [], {}, {}

            last_row = enriched_df.iloc[-1]
            prev_row = enriched_df.iloc[-2] if len(enriched_df) > 1 else last_row

            curr_price = round(float(last_row.get('Close', 0.0)), 2)
            prev_price = round(float(prev_row.get('Close', curr_price)), 2)
            change = round(curr_price - prev_price, 2)
            change_percent = round((change / prev_price * 100) if prev_price > 0 else 0.0, 2)

            resolved_name = company_name or self._resolve_company_name(ticker, {})
            currency = 'EUR' if ('.DE' in ticker or '.PA' in ticker or '.AS' in ticker) else ('NOK' if '.OL' in ticker else ('SEK' if '.ST' in ticker else ('JPY' if '.T' in ticker else 'USD')))

            vol_val = int(last_row.get('Volume', 0)) if not pd.isna(last_row.get('Volume')) else 0
            avg_vol_val = int(last_row.get('Volume_SMA20', vol_val)) if not pd.isna(last_row.get('Volume_SMA20')) else vol_val

            profile = {
                'ticker': ticker,
                'name': resolved_name,
                'currentPrice': curr_price,
                'previousClose': prev_price,
                'change': change,
                'changePercent': change_percent,
                'currency': currency,
                'volume': vol_val,
                'avgVolume': avg_vol_val,
                'atr': round(float(last_row.get('ATR', 0)), 2) if not pd.isna(last_row.get('ATR')) else round(curr_price * 0.03, 2),
                'vwap': round(float(last_row.get('VWAP', 0)), 2) if not pd.isna(last_row.get('VWAP')) else None,
                'superTrend': round(float(last_row.get('SuperTrend', 0)), 2) if not pd.isna(last_row.get('SuperTrend')) else None,
                'cmf': round(float(last_row.get('CMF', 0)), 2) if not pd.isna(last_row.get('CMF')) else None
            }

            signals = self.generate_technical_summary(enriched_df, news_items=[])

            timeseries = []
            def safe_val(v, decimals=2):
                if v is None or pd.isna(v) or np.isinf(v):
                    return None
                return round(float(v), decimals)

            for idx, row in enriched_df.tail(60).iterrows():
                time_str = idx.strftime('%Y-%m-%d') if isinstance(idx, (pd.Timestamp, datetime)) else str(idx)
                ts_ms = int(idx.timestamp() * 1000) if isinstance(idx, (pd.Timestamp, datetime)) else 0
                point = {
                    'time': time_str,
                    'timestamp': ts_ms,
                    'open': safe_val(row.get('Open')),
                    'high': safe_val(row.get('High')),
                    'low': safe_val(row.get('Low')),
                    'close': safe_val(row.get('Close')),
                    'volume': int(row.get('Volume', 0)) if not pd.isna(row.get('Volume')) else 0,
                    'sma20': safe_val(row.get('SMA_20')),
                    'sma50': safe_val(row.get('SMA_50')),
                    'sma200': safe_val(row.get('SMA_200')),
                    'superTrend': safe_val(row.get('SuperTrend')),
                    'superTrendDir': int(row.get('SuperTrend_Dir', row.get('SuperTrend_Direction', 1))),
                    'vwap': safe_val(row.get('VWAP')),
                    'ttmSqueeze': bool(row.get('TTM_Squeeze', False)),
                    'rsi': safe_val(row.get('RSI'), 1),
                    'macd': safe_val(row.get('MACD')),
                    'macdSignal': safe_val(row.get('MACD_Signal') or row.get('Signal')),
                    'macdHist': safe_val(row.get('MACD_Hist') or row.get('Hist')),
                    'cmf': safe_val(row.get('CMF'), 3),
                    'atr': safe_val(row.get('ATR'))
                }
                timeseries.append(point)

            return timeseries, signals, profile
        except Exception:
            return [], {}, {}

    def fetch_full_stock_analysis(self, tickers: list[str], period: str = '6mo', interval: str = '1d', force_refresh: bool = False, phase: str = 'full') -> dict:
        """
        Downloads historical market data using parallel asynchronous worker threads,
        persistent disk caching & delta updates, generates full indicator time-series, and runs backtests.
        """
        if phase == 'fast':
            return self.fetch_fast_stock_analysis(tickers, force_refresh=force_refresh)

        if not tickers:
            return {'error': 'No tickers provided'}

        cleaned_tickers = [t.strip().upper() for t in tickers if t and t.strip()]
        if not cleaned_tickers:
            return {'error': 'No valid tickers provided'}

        results = {}
        max_workers = min(len(cleaned_tickers), 12)

        # Execute parallel downloads and technical indicator generation across concurrent worker threads
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_ticker = {
                executor.submit(self._process_single_ticker, ticker, period, interval, force_refresh): ticker
                for ticker in cleaned_tickers
            }
            for future in concurrent.futures.as_completed(future_to_ticker):
                ticker = future_to_ticker[future]
                try:
                    t_symbol, sdata = future.result()
                    results[t_symbol] = sdata
                except Exception as e:
                    results[ticker] = {'error': f'Parallel worker error analyzing {ticker}: {str(e)}'}

        return {
            'stocks': results,
            'tickers': cleaned_tickers,
            'period': period,
            'interval': interval,
            'isFastHydration': False,
            'timestamp': datetime.now().isoformat()
        }

    def fetch_stock_news(self, ticker_symbol: str, limit: int = 35, force_refresh: bool = False, company_name: str = '') -> list[dict]:
        """Fetches the latest real-time multi-source global news items for a given stock with caching."""
        # 1. Primary: High-speed multi-source global news aggregator
        try:
            global_news = news_service.fetch_global_news(
                ticker=ticker_symbol,
                company_name=company_name,
                limit=limit,
                force_refresh=force_refresh
            )
            if global_news and len(global_news) > 0:
                return global_news
        except Exception:
            pass

        # 2. Fallback to Yahoo Finance news wire if external feeds fail
        now = time.time()
        cached_entry = self._news_cache.get(ticker_symbol)
        if not force_refresh and cached_entry and (now - cached_entry['timestamp'] < 600):
            return cached_entry['news'][:limit]

        try:
            t = yf.Ticker(ticker_symbol)
            raw_news = getattr(t, 'news', []) or []
            parsed = []
            for item in raw_news:
                if not isinstance(item, dict):
                    continue
                content = item.get('content', {}) if isinstance(item.get('content'), dict) else item
                title = content.get('title') or item.get('title') or ''
                if not title:
                    continue
                summary = content.get('summary') or content.get('description') or item.get('summary') or ''
                publisher = (content.get('provider') or {}).get('displayName') or item.get('publisher') or 'Financial News'
                url = (content.get('canonicalUrl') or {}).get('url') or (content.get('clickThroughUrl') or {}).get('url') or item.get('link') or '#'
                pub_date = content.get('pubDate') or content.get('displayTime') or ''

                ts = item.get('providerPublishTime')
                time_str = pub_date
                if not time_str and ts:
                    try:
                        time_str = datetime.fromtimestamp(ts).strftime('%b %d, %H:%M')
                    except Exception:
                        pass
                elif time_str:
                    try:
                        clean_dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
                        time_str = clean_dt.strftime('%b %d, %H:%M')
                    except Exception:
                        pass

                parsed.append({
                    'title': title,
                    'summary': summary,
                    'publisher': publisher,
                    'url': url,
                    'time': time_str or 'Recent'
                })
                if len(parsed) >= limit:
                    break

            self._news_cache[ticker_symbol] = {'timestamp': now, 'news': parsed}
            return parsed
        except Exception:
            return []

    def search_stocks(self, query: str, limit: int = 15) -> list[dict]:
        """
        Searches global stocks, ETFs, and indices matching a company name or ticker query.
        Queries Yahoo Finance search API with multi-exchange disambiguation.
        Falls back to local universe matching if external search is unreachable.
        """
        clean_query = str(query or '').strip()
        if not clean_query:
            return []

        results = []
        seen_tickers = set()

        try:
            url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(clean_query)}&quotesCount={limit}&newsCount=0"
            req = urllib.request.Request(
                url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                quotes = data.get('quotes', [])
                for q in quotes:
                    symbol = (q.get('symbol') or '').strip().upper()
                    if not symbol or symbol in seen_tickers:
                        continue
                    
                    name = ' '.join((q.get('shortname') or q.get('longname') or q.get('name') or symbol).split())
                    exch = (q.get('exchDisp') or q.get('exchange') or '').strip()
                    q_type = (q.get('quoteType') or q.get('typeDisp') or 'EQUITY').strip()
                    sector = (q.get('sector') or '').strip()
                    industry = (q.get('industry') or '').strip()

                    seen_tickers.add(symbol)
                    results.append({
                        'ticker': symbol,
                        'name': name,
                        'exchange': exch,
                        'type': q_type,
                        'sector': sector,
                        'industry': industry,
                        'score': q.get('score', 0)
                    })
        except Exception:
            pass

        # If external search yielded few or no results, or as fallback, search local universe
        if len(results) < 5:
            try:
                from services.scanner_service import SCANNER_UNIVERSE
                q_lower = clean_query.lower()
                for item in SCANNER_UNIVERSE:
                    t = item.get('ticker', '').upper()
                    if t in seen_tickers:
                        continue
                    name = item.get('name', '')
                    sector = item.get('sector', '')
                    if q_lower in t.lower() or q_lower in name.lower() or q_lower in sector.lower():
                        seen_tickers.add(t)
                        results.append({
                            'ticker': t,
                            'name': name,
                            'exchange': 'Global',
                            'type': 'EQUITY',
                            'sector': sector,
                            'industry': item.get('ecoBadge', ''),
                            'score': 100
                        })
            except Exception:
                pass

        return results[:limit]

# Singleton instance
stock_service = StockService()
