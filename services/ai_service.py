import hashlib
import json
import math
import os
import re
import socket
import time
import urllib.error
import urllib.request


class AIService:
    """
    AI Financial Intelligence & Quantitative Synthesis Service.
    Provides automated AI Investment Theses, Trade Target Matrices, 
    Probabilistic Scenario Modeling, Dual-Tier Memory + Disk Response Caching,
    Multi-Model Rate-Limit Fallbacks, and an Interactive Context-Aware AI Copilot.
    """

    def __init__(self, cache_dir: str = None):
        # In-memory response cache: {cache_key: {"value": ..., "expires_at": float}}
        self._cache = {}
        if cache_dir:
            self.cache_dir = cache_dir
        else:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.cache_dir = os.path.join(base_dir, 'data', 'cache', 'ai')
        try:
            os.makedirs(self.cache_dir, exist_ok=True)
        except Exception:
            pass

    def _get_disk_filename(self, key: str) -> str:
        """Generates a safe filename for persistent cache key storage."""
        clean_prefix = re.sub(r'[^a-zA-Z0-9_-]', '_', key)[:32].strip('_')
        key_hash = hashlib.sha256(key.encode('utf-8')).hexdigest()[:16]
        return f"{clean_prefix}_{key_hash}.json" if clean_prefix else f"{key_hash}.json"

    def _get_cached(self, key: str):
        """Retrieves a cached item from RAM or persistent disk if not expired."""
        now = time.time()
        # 1. Check in-memory cache
        if key in self._cache:
            entry = self._cache[key]
            if entry["expires_at"] > now:
                return entry["value"]
            else:
                del self._cache[key]

        # 2. Check persistent disk cache
        if hasattr(self, 'cache_dir') and self.cache_dir:
            filepath = os.path.join(self.cache_dir, self._get_disk_filename(key))
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        disk_entry = json.load(f)
                    if disk_entry.get("expires_at", 0) > now:
                        val = disk_entry.get("value")
                        # Hydrate RAM cache
                        self._cache[key] = {
                            "value": val,
                            "expires_at": disk_entry["expires_at"]
                        }
                        return val
                    else:
                        try:
                            os.remove(filepath)
                        except OSError:
                            pass
                except Exception:
                    pass
        return None

    def _set_cached(self, key: str, value, ttl_seconds: int = 14400):
        """Saves an item to RAM and persistent disk cache (default 4 hours / 14,400s)."""
        now = time.time()
        expires_at = now + ttl_seconds

        # Prune memory cache if growing large
        if len(self._cache) > 300:
            self._cache = {k: v for k, v in self._cache.items() if v["expires_at"] > now}

        self._cache[key] = {
            "value": value,
            "expires_at": expires_at
        }

        # Persist to disk
        if hasattr(self, 'cache_dir') and self.cache_dir:
            filepath = os.path.join(self.cache_dir, self._get_disk_filename(key))
            try:
                temp_path = filepath + f".tmp_{os.getpid()}"
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump({
                        "key": key,
                        "value": value,
                        "saved_at": now,
                        "expires_at": expires_at
                    }, f, ensure_ascii=False)
                os.replace(temp_path, filepath)
            except Exception:
                pass

    @staticmethod
    def _call_gemini_api(prompt: str, api_key: str, model_name: str = "gemini-3.7-flash", allow_fallback: bool = True, timeout: int = 25) -> tuple[str, str, str]:
        """
        Invokes Google Gemini REST API.
        Determines API version (v1beta or v1) dynamically and manages rate-limit cascade.
        Returns tuple: (response_text, actual_model_used, error_message)
        """
        if not api_key:
            return "", "", "Missing Google Gemini API key."

        api_key = api_key.strip()
        preferred_model = (model_name or "gemini-3.7-flash").strip()
        
        if allow_fallback:
            candidate_models = [preferred_model]
            for m in ["gemini-3.6-flash"]:
                if m not in candidate_models:
                    candidate_models.append(m)
        else:
            candidate_models = [preferred_model]

        last_error = ""

        for model in candidate_models:
            # Select proper API version for the model
            api_version = "v1" if model in ["gemini-pro", "gemini-1.0-pro"] else "v1beta"
            url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1500
                }
            }
            
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=timeout) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    candidates = res_data.get('candidates', [])
                    if candidates:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        if parts:
                            text = parts[0].get('text', '').strip()
                            if text:
                                return text, model, ""
                    return "", model, f"Empty response received from {model}."
            except urllib.error.HTTPError as he:
                try:
                    err_body = json.loads(he.read().decode('utf-8'))
                    err_msg = err_body.get('error', {}).get('message', str(he))
                except Exception:
                    err_msg = str(he)
                last_error = f"Google Gemini API ({he.code}) on {model}: {err_msg}"
                
                # If invalid API key (400 or 403), stop immediately
                if he.code in (400, 403) and ("API_KEY_INVALID" in err_msg or "key not valid" in err_msg.lower()):
                    return "", model, last_error
                
                # If 404 on v1beta, attempt v1 endpoint fallback for this specific model
                if he.code == 404 and api_version == "v1beta":
                    try:
                        v1_url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}"
                        req_v1 = urllib.request.Request(v1_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                        with urllib.request.urlopen(req_v1, timeout=timeout) as response:
                            res_data = json.loads(response.read().decode('utf-8'))
                            candidates = res_data.get('candidates', [])
                            if candidates and candidates[0].get('content', {}).get('parts'):
                                text = candidates[0]['content']['parts'][0].get('text', '').strip()
                                if text:
                                    return text, model, ""
                    except Exception:
                        pass

                # Only cascade to fallback models on genuine rate limit (429) or temporary server error (503)
                if he.code in (429, 503) and allow_fallback:
                    continue
                else:
                    return "", model, last_error
            except (TimeoutError, socket.timeout, urllib.error.URLError) as te:
                last_error = f"Gemini Connection Timeout on {model} (server latency high)"
                if allow_fallback:
                    continue
            except Exception as e:
                last_error = f"Gemini Connection Error on {model}: {str(e)}"
                if allow_fallback:
                    continue

        return "", preferred_model, last_error or f"Unable to reach Google Gemini API ({preferred_model})."

    @classmethod
    def test_model_cascade(cls, api_key: str, preferred_model: str = "gemini-3.7-flash") -> dict:
        """
        Tests the API key against all available models in the cascade.
        Returns a detailed per-model diagnostic report.
        """
        if not api_key:
            return {"success": False, "error": "Missing API Key", "models": []}

        models_to_test = [preferred_model]
        for m in ["gemini-3.6-flash"]:
            if m not in models_to_test:
                models_to_test.append(m)

        report = []
        any_success = False

        for m in models_to_test:
            res_text, used_model, err = cls._call_gemini_api(
                "Respond with 'OK'",
                api_key,
                model_name=m,
                allow_fallback=False,
                timeout=12
            )
            if res_text:
                any_success = True
                report.append({
                    "model": m,
                    "status": "online",
                    "message": f"Connected successfully ({res_text[:30]})"
                })
            else:
                if "429" in err or "quota" in err.lower() or "rate" in err.lower():
                    status = "rate_limited"
                elif "400" in err or "403" in err or "key not valid" in err.lower():
                    status = "invalid_key"
                elif "timeout" in err.lower():
                    status = "timeout"
                elif "404" in err:
                    status = "not_found"
                else:
                    status = "error"
                report.append({
                    "model": m,
                    "status": status,
                    "message": err
                })
                if status == "invalid_key":
                    break

        return {
            "success": any_success,
            "models": report,
            "preferredModel": preferred_model
        }

    def synthesize_news_sentiment(self, ticker: str, company_name: str, current_price: float, news_items: list[dict], api_key: str = None, model: str = 'gemini-3.7-flash') -> dict:
        """
        Synthesizes recent news items into an institutional-grade Market Catalyst & Sentiment Summary.
        Uses Google Gemini with caching and automatic fallback, with a smart deterministic quant fallback.
        Generates structured English catalyst takeaways, country flag attributions, and exact conviction delta.
        """
        if not news_items:
            return {
                'sentiment': 'Neutral',
                'sentimentScore': 50,
                'sentimentBadge': 'Neutral (50%)',
                'sentimentColor': 'neutral',
                'convictionDelta': 0.0,
                'catalystBullets': [
                    f"No recent breaking news flow detected for {ticker} ({company_name}). Technical momentum and quantitative indicator matrix currently drive primary market positioning."
                ],
                'summary': f"No recent breaking news headlines found for {ticker} ({company_name}). Technical momentum and quantitative indicator matrix currently drive primary market positioning."
            }

        # Build clean string representation of all available recent headlines (up to 30)
        news_lines = []
        bullets = []
        for i, n in enumerate(news_items[:30], 1):
            flag = n.get('flag', '🌐')
            country = n.get('country', 'Global')
            pub = n.get('publisher', 'Financial Wire')
            title = n.get('title', '')
            time_ago = n.get('timeAgo') or n.get('publishedAt') or 'Recent'
            news_lines.append(f"{i}. [{flag} {country} | {pub}] {title} ({time_ago})")
            if len(bullets) < 4 and title:
                bullets.append({
                    'flag': flag,
                    'country': country,
                    'publisher': pub,
                    'headline': title,
                    'url': n.get('url', '#'),
                    'timeAgo': time_ago
                })

        news_text = "\n".join(news_lines)

        cache_key = f"news_summary:{ticker}:{hash(news_text)}:{model}"
        cached_summary = self._get_cached(cache_key)
        if cached_summary:
            return cached_summary

        env_key = api_key or os.environ.get('GEMINI_API_KEY') or ''
        
        # 1. LLM synthesis if key available
        if env_key and len(env_key.strip()) > 6:
            prompt = f"""
            You are a chief market analyst at a quantitative hedge fund.
            Analyze the following multi-source global financial news headlines and catalyst reports for {company_name} ({ticker}, Current Price: ${current_price:.2f}):

            GLOBAL BREAKING NEWS HEADLINES:
            {news_text}

            TASK:
            1. Formulate an overall Market Sentiment assessment (one of: 'Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish') and a Sentiment Score (0 to 100).
            2. Write a concise 2-paragraph financial executive synthesis in English:
               - Paragraph 1: Key Global Catalysts & Narrative Drivers (summarize what is happening across the news stories, corporate updates, earnings reports, or macro trends).
               - Paragraph 2: Financial & Market Implication (how this news flow impacts {ticker}'s near-term price trajectory, investor sentiment, and trading levels around ${current_price:.2f}).
            Keep the tone strictly objective, institutional, and insightful.
            """
            try:
                llm_text, used_model, _ = self._call_gemini_api(prompt, env_key, model_name=model, allow_fallback=True)
                if llm_text and len(llm_text) > 40:
                    lower_text = llm_text.lower()
                    if "strongly bullish" in lower_text or "strong bull" in lower_text:
                        sentiment = "Strong Bullish"
                        score = 85
                        color = "bullish"
                    elif "bullish" in lower_text or "positive" in lower_text or "growth" in lower_text:
                        sentiment = "Bullish"
                        score = 72
                        color = "bullish"
                    elif "strongly bearish" in lower_text or "strong bear" in lower_text:
                        sentiment = "Strong Bearish"
                        score = 20
                        color = "bearish"
                    elif "bearish" in lower_text or "negative" in lower_text or "downside" in lower_text:
                        sentiment = "Bearish"
                        score = 35
                        color = "bearish"
                    else:
                        sentiment = "Neutral"
                        score = 52
                        color = "neutral"

                    delta = round((score - 50) * 0.3, 1)  # Max ±15% conviction delta
                    result = {
                        'sentiment': sentiment,
                        'sentimentScore': score,
                        'sentimentBadge': f"{sentiment} ({score}%)",
                        'sentimentColor': color,
                        'convictionDelta': delta,
                        'catalystBullets': bullets,
                        'summary': llm_text
                    }
                    self._set_cached(cache_key, result, ttl_seconds=600)
                    return result
            except Exception:
                pass

        # 2. Advanced Multi-Factor Deterministic Catalyst & Sentiment Engine
        now_ts = int(time.time())
        tier1_sources = {'reuters', 'bloomberg', 'wall street journal', 'dow jones', 'financial times', 'tagesschau', 'handelsblatt', 'nikkei asia', 'caixin', 'sec', 'cnbc'}
        tier2_sources = {'marketwatch', 'barron\'s', 'investor\'s business daily', 'finanzen.net', 'les echos', 'infomoney', 'valor econômico', 'economic times'}

        def _matches_catalyst(text: str, patterns: list) -> bool:
            t = text.lower()
            for p in patterns:
                if isinstance(p, tuple):
                    if all(tok in t for tok in p):
                        return True
                elif p in t:
                    return True
            return False

        shocks_negative = [
            'fraud', 'subpoena', 'ceo ousted', 'ceo resigns', 'guidance slashed', 'bankruptcy', 'criminal probe',
            ('sec', 'investigation'), ('sec', 'probe'), ('doj', 'investigation'), ('doj', 'probe'), ('bafin', 'probe')
        ]
        bear_phrases = [
            'downgraded', 'antitrust', 'lawsuit', 'slumps', 'plunges', 'sell-off', 'loss widens', 'falling demand',
            'layoffs', 'delay', 'down today', 'shares slide', 'weak outlook', 'underperform', 'drops', 'falls',
            'tumble', 'retreated', 'decline', 'struggles', 'warning', 'headwind', 'cautions', 'cut', 'slump',
            ('earnings', 'miss'), ('misses', 'estimates'), ('lowered', 'guidance'), ('cut', 'forecast'),
            ('revenue', 'fell'), ('profit', 'dropped'), ('price target', 'cut'), ('target', 'lowered')
        ]
        
        shocks_positive = [
            'fda approval', 'all-time high', 'multi-billion contract', 'blowout quarter', 'breakout',
            ('earnings', 'beat'), ('beats', 'estimates'), ('record', 'revenue'), ('profit', 'surged'),
            ('raised', 'guidance'), ('boosts', 'outlook'), ('record', 'profit')
        ]
        bull_phrases = [
            'upgraded', 'outperform', 'dividend hike', 'share buyback', 'partnership', 'expansion',
            'accelerated growth', 'top pick', 'positive results', 'soared', 'surge', 'buy rating', 'strong momentum',
            'rallies', 'gains', 'upbeat', 'highs', 'jumps', 'rebound', 'bullish', 'strength', 'lead', 'climbs', 'tops',
            ('price target', 'raised'), ('target', 'lifted'), ('target', 'raised'), ('beats', 'revenue'), ('position', 'increased')
        ]

        weighted_bull = 0.0
        weighted_bear = 0.0
        active_items_count = 0

        for n in news_items:
            pub = str(n.get('publisher', '')).lower()
            title = str(n.get('title', '')).lower()
            summary_txt = str(n.get('summary', '')).lower()
            ts = n.get('timestamp', now_ts)

            # A. Source Credibility Weight
            if any(p in pub for p in tier1_sources):
                w_source = 1.5
            elif any(p in pub for p in tier2_sources):
                w_source = 1.2
            else:
                w_source = 0.9

            # B. Exponential Time Decay Weight
            dt_hours = max(0, (now_ts - ts) / 3600.0)
            if dt_hours <= 12:
                w_time = 1.0
            elif dt_hours <= 36:
                w_time = 0.8
            elif dt_hours <= 96:
                w_time = 0.6
            else:
                w_time = 0.35

            weight = w_source * w_time

            # C. Asymmetric Catalyst Detection
            item_bull = 0.0
            item_bear = 0.0

            if _matches_catalyst(title, shocks_negative): item_bear += 3.5
            elif _matches_catalyst(title, bear_phrases): item_bear += 1.8
            elif _matches_catalyst(summary_txt, bear_phrases): item_bear += 0.8

            if _matches_catalyst(title, shocks_positive): item_bull += 3.0
            elif _matches_catalyst(title, bull_phrases): item_bull += 1.6
            elif _matches_catalyst(summary_txt, bull_phrases): item_bull += 0.7

            if item_bull > 0 or item_bear > 0:
                active_items_count += 1
                weighted_bull += (item_bull * weight)
                weighted_bear += (item_bear * weight)

        # Active Catalyst Impact Formula (Prevents ambient dilution)
        if active_items_count > 0:
            net_diff = weighted_bull - weighted_bear
            total_active_weight = weighted_bull + weighted_bear
            polarity_ratio = net_diff / total_active_weight  # -1.0 to +1.0
            intensity = min(2.0, 1.0 + (active_items_count / 8.0))
            raw_shift = polarity_ratio * 25.0 * intensity
            score = int(round(min(92, max(10, 50 + raw_shift))))
        else:
            score = 50

        # Consensus Dispersion Analysis
        if weighted_bull >= 4.0 and weighted_bear >= 4.0:
            consensus = "Divided Market (Elevated Event Volatility)"
        elif weighted_bull >= 4.0 and weighted_bear < 2.0:
            consensus = "Strong Bullish Catalyst Consensus"
        elif weighted_bear >= 4.0 and weighted_bull < 2.0:
            consensus = "Strong Bearish Narrative Consensus"
        elif score >= 60:
            consensus = "Constructive Bullish Momentum"
        elif score <= 40:
            consensus = "Persistent Bearish Headwinds"
        else:
            consensus = "Balanced Market Flow"

        if score >= 75:
            sentiment = "Strong Bullish"
            color = "bullish"
        elif score >= 62:
            sentiment = "Bullish"
            color = "bullish"
        elif score >= 55:
            sentiment = "Moderately Bullish"
            color = "bullish"
        elif score <= 25:
            sentiment = "Strong Bearish"
            color = "bearish"
        elif score <= 38:
            sentiment = "Bearish"
            color = "bearish"
        elif score <= 45:
            sentiment = "Moderately Bearish"
            color = "bearish"
        else:
            sentiment = "Neutral"
            color = "neutral"

        delta = round((score - 50) * 0.3, 1)

        # Identify specific top catalyst headlines for fact-grounded synthesis
        top_bull_news = [n for n in news_items if _matches_catalyst(str(n.get('title', '')), shocks_positive + bull_phrases)]
        top_bear_news = [n for n in news_items if _matches_catalyst(str(n.get('title', '')), shocks_negative + bear_phrases)]

        lead_lines = []
        if top_bull_news:
            b_item = top_bull_news[0]
            lead_lines.append(f"Bullish momentum is reinforced by **{b_item.get('publisher', 'Financial Wire')}** reporting *\"{b_item.get('title', '')}\"*.")
        if top_bear_news:
            r_item = top_bear_news[0]
            lead_lines.append(f"Countervailing risk highlighted by **{r_item.get('publisher', 'Financial Wire')}** notes *\"{r_item.get('title', '')}\"*.")
        if not lead_lines:
            lead_lines.append(f"Recent reporting reflects steady operational continuity without severe directional shock events.")

        summary = (
            f"Recent multi-source global financial coverage for **{company_name} ({ticker})** reflects an overall **{sentiment} ({score}%)** sentiment profile across **{len(news_items)} verified reports** with **{consensus}**.\n\n"
            f"{' '.join(lead_lines)}\n\n"
            f"At the current ${current_price:.2f} price level, active news flow delivers a **{'+' if delta >= 0 else ''}{delta:.1f}% AI Conviction Delta**, anchoring near-term tactical setups."
        )

        result = {
            'sentiment': sentiment,
            'sentimentScore': score,
            'sentimentBadge': f"{sentiment} ({score}%)",
            'sentimentColor': color,
            'consensus': consensus,
            'convictionDelta': delta,
            'topBullNews': top_bull_news[:2],
            'topBearNews': top_bear_news[:2],
            'catalystBullets': bullets,
            'summary': summary
        }
        self._set_cached(cache_key, result, ttl_seconds=600)
        return result

    def compute_conviction_score(
        self,
        profile: dict,
        signals: dict,
        backtest_data: dict = None,
        timeseries: list = None,
        news: list = None,
        news_sentiment: dict = None,
        return_breakdown: bool = False
    ) -> tuple:
        """
        Comprehensive Multi-Factor AI Conviction Scoring Engine (0 to 100%).
        Unified across AI Scanner, Single-Stock Deep-Dive Terminal, and Watchlists.
        Dynamically weights all available quantitative & fundamental inputs:
        1. Multi-Timeframe Trend & Moving Averages (SuperTrend, SMA 50/200, Golden/Death cross)
        2. Momentum & Multi-Oscillator Confluence (RSI contextual, MACD cross/hist, Stochastic)
        3. Institutional Flow & Volume Confirmation (CMF, VWAP, Relative Volume)
        4. Volatility & Breakout Squeeze (TTM Squeeze, 52-Week Range proximity)
        5. Price Action Dynamics & Severe Adverse Drop Shock Penalties
        6. Algorithmic Strategy Backtest Validation (Win Rate, Alpha, Profit Factor)
        7. Real-Time News Sentiment & Catalyst Impact (Sentiment score & Breaking headline keywords)
        8. Downtrend & Capitulation Guard (Hard safety caps on sharp selloffs)
        Returns (conviction_score, bias, stance_color, badge_class[, factor_breakdown]).
        """
        current_price = float(profile.get('currentPrice') or 100.0)
        cmf_val = float(profile.get('cmf', 0.0) or 0.0)
        vwap_val = float(profile.get('vwap') or current_price)
        change_pct = float(profile.get('changePercent', 0.0) or 0.0)
        
        indicators = signals.get('indicators', {}) if signals else {}
        rsi_val = float(indicators.get('RSI', {}).get('value', 50.0) or 50.0)
        st_status = str(indicators.get('SuperTrend', {}).get('status', 'neutral') or 'neutral').lower()
        macd_hist = float(indicators.get('MACD', {}).get('hist', 0.0) or 0.0)
        macd_sig = str(indicators.get('MACD', {}).get('signal', '') or '').lower()
        stoch_sig = str(indicators.get('Stochastic', {}).get('signal', '') or '').lower()
        
        score = 50.0
        factor_breakdown = {}
        
        # 1. Multi-Timeframe Trend & Moving Average Alignment
        trend_pts = 0.0
        if st_status == 'bullish':
            if change_pct <= -5.0:
                trend_pts += 0.0  # Lagging indicator during sharp crash
            elif change_pct <= -2.5:
                trend_pts += 3.0
            else:
                trend_pts += 10.0
        elif st_status == 'bearish':
            trend_pts -= 12.0
            if change_pct < -2.0:
                trend_pts -= 4.0
                
        # Check SMA 50 and SMA 200
        sma50 = None
        sma200 = None
        if 'SMA_50' in indicators:
            sma50 = float(indicators['SMA_50'].get('value', 0) or 0)
        if 'SMA_200' in indicators:
            sma200 = float(indicators['SMA_200'].get('value', 0) or 0)
        elif timeseries and len(timeseries) >= 20:
            closes = [float(t.get('close', 0)) for t in timeseries if t.get('close')]
            if len(closes) >= 50:
                sma50 = sum(closes[-50:]) / 50.0
            if len(closes) >= 200:
                sma200 = sum(closes[-200:]) / 200.0
                
        if sma200 and sma200 > 0:
            if current_price > sma200:
                trend_pts += 5.0  # Above 200 SMA (Secular Bull)
            else:
                trend_pts -= 7.0  # Below 200 SMA (Secular Bear)
                
        if sma50 and sma50 > 0:
            if current_price > sma50:
                trend_pts += 4.0
            else:
                trend_pts -= 5.0
                
            if sma200 and sma200 > 0:
                if sma50 > sma200:
                    trend_pts += 3.0  # Golden Cross
                else:
                    trend_pts -= 4.0  # Death Cross
                    
        score += trend_pts
        factor_breakdown['trend'] = round(trend_pts, 1)

        # 2. Momentum & Multi-Oscillator Confluence
        mom_pts = 0.0
        # Contextual RSI
        if rsi_val < 35.0:
            if change_pct <= -2.5 or st_status == 'bearish' or (vwap_val and current_price < vwap_val * 0.99 and cmf_val < 0):
                mom_pts -= 12.0  # Liquidation / falling knife
            elif change_pct >= 0 and cmf_val > 0.05 and macd_hist > 0:
                mom_pts += 8.0   # Confirmed oversold accumulation divergence
            else:
                mom_pts -= 4.0
        elif 55.0 < rsi_val <= 68.0:
            mom_pts += 7.0       # Optimal momentum expansion
        elif 45.0 <= rsi_val <= 55.0:
            mom_pts += 0.0       # Balanced / neutral
        elif 35.0 <= rsi_val < 45.0:
            mom_pts -= 4.0       # Weakening momentum
        elif rsi_val > 75.0:
            mom_pts -= 8.0       # Overbought exhaustion risk
        elif rsi_val > 68.0:
            mom_pts += 3.0
            
        # MACD momentum
        if 'crossover' in macd_sig and 'bull' in macd_sig:
            mom_pts += 6.0
        elif macd_hist > 0.05:
            mom_pts += 5.0
        elif 'crossover' in macd_sig and 'bear' in macd_sig:
            mom_pts -= 6.0
        elif macd_hist < -0.05:
            mom_pts -= 6.0
            
        # Stochastic crossover confirmation
        if 'bull' in stoch_sig or 'turn' in stoch_sig:
            mom_pts += 3.0
        elif 'bear' in stoch_sig or 'overbought' in stoch_sig:
            mom_pts -= 3.0
            
        score += mom_pts
        factor_breakdown['momentum'] = round(mom_pts, 1)

        # 3. Institutional Capital Flow & Volume Confirmation
        flow_pts = 0.0
        if cmf_val > 0.10:
            flow_pts += (3.0 if change_pct <= -4.0 else 9.0)
        elif cmf_val > 0.03:
            flow_pts += (1.0 if change_pct <= -4.0 else 5.0)
        elif cmf_val < -0.08:
            flow_pts -= 11.0
        elif cmf_val < -0.02:
            flow_pts -= 5.0
            
        if vwap_val and current_price > vwap_val * 1.003:
            flow_pts += 5.0
        elif vwap_val and current_price < vwap_val * 0.997:
            flow_pts -= 6.0
            
        # Volume Spike / Relative Volume
        vol = float(profile.get('volume', 0) or 0)
        avg_vol = float(profile.get('avgVolume', 0) or 0)
        if vol > 0 and avg_vol > 0:
            rel_vol = vol / avg_vol
            if rel_vol >= 1.5 and change_pct > 0.5:
                flow_pts += 4.0  # High-volume accumulation surge
            elif rel_vol >= 1.5 and change_pct < -1.5:
                flow_pts -= 6.0  # Heavy-volume institutional distribution
                
        score += flow_pts
        factor_breakdown['flow'] = round(flow_pts, 1)

        # 4. Volatility, Breakout Squeeze & 52-Week Range
        vol_pts = 0.0
        is_squeeze = 'squeeze active' in str(indicators.get('Volatility_Squeeze', {}).get('signal', '')).lower()
        if is_squeeze:
            if mom_pts > 0 and flow_pts > 0:
                vol_pts += 5.0  # Imminent upside volatility expansion
            elif mom_pts < 0 or flow_pts < 0:
                vol_pts -= 5.0  # Imminent downside breakdown squeeze
                
        # 52-Week Range proximity
        high_52 = profile.get('fiftyTwoWeekHigh')
        low_52 = profile.get('fiftyTwoWeekLow')
        if high_52 and low_52:
            try:
                h_val = float(high_52)
                l_val = float(low_52)
                if h_val > l_val:
                    range_pos = (current_price - l_val) / (h_val - l_val)
                    if range_pos >= 0.85 and change_pct > -2.0:
                        vol_pts += 4.0  # Leader trading near 52W highs
                    elif range_pos <= 0.15 and change_pct <= -2.0:
                        vol_pts -= 5.0  # Laggard breakdown near 52W lows
            except Exception:
                pass
                
        score += vol_pts
        factor_breakdown['volatility'] = round(vol_pts, 1)

        # 5. Price Action Momentum & Severe Adverse Drop Penalties
        price_pts = 0.0
        if change_pct <= -10.0:
            price_pts -= 26.0
        elif change_pct <= -5.0:
            price_pts -= 16.0
        elif change_pct <= -2.5:
            price_pts -= 9.0
        elif change_pct < -0.5:
            price_pts -= 3.0
        elif change_pct >= 4.0:
            price_pts += 7.0
        elif change_pct > 0.5:
            price_pts += 4.0
        score += price_pts
        factor_breakdown['price'] = round(price_pts, 1)

        # 6. Algorithmic Strategy Backtest Validation
        bt_pts = 0.0
        if backtest_data and 'quant' in backtest_data:
            quant_bt = backtest_data['quant']
            win_rate = float(quant_bt.get('winRatePct', 50) or 50)
            alpha = float(quant_bt.get('alpha', 0) or 0)
            profit_factor = float(quant_bt.get('profitFactor', 1.0) or 1.0)
            
            if win_rate >= 60 and alpha > 0 and profit_factor >= 1.5:
                bt_pts += 5.0
            elif win_rate >= 55:
                bt_pts += 2.0
            elif 0 < win_rate <= 38 or alpha < -10:
                bt_pts -= 4.0
        score += bt_pts
        factor_breakdown['backtest'] = round(bt_pts, 1)

        # 7. Real-Time News Sentiment & Breaking Catalyst Impact
        news_pts = 0.0
        news_score = None
        if news_sentiment:
            if isinstance(news_sentiment, dict):
                news_score = news_sentiment.get('sentimentScore', 50)
            elif isinstance(news_sentiment, (int, float)):
                news_score = float(news_sentiment)
        elif news and isinstance(news, list) and len(news) > 0:
            bull_words = ['record', 'surge', 'buy', 'growth', 'profit', 'beat', 'upgrade', 'expansion', 'ai', 'dividend', 'soar', 'bull', 'gain', 'positive', 'outperform', 'partnership', 'approval']
            bear_words = ['fall', 'drop', 'slump', 'downgrade', 'lawsuit', 'cut', 'loss', 'miss', 'warning', 'decline', 'bear', 'risk', 'sell', 'fraud', 'probe', 'investigation', 'plunge', 'halt', 'subpoena']
            combined_text = " ".join([str(n.get('title', '')) + " " + str(n.get('summary', '')) for n in news[:20]]).lower()
            b_hits = sum(combined_text.count(w) for w in bull_words)
            r_hits = sum(combined_text.count(w) for w in bear_words)
            diff = b_hits - r_hits
            if diff >= 2:
                news_score = min(90, 60 + (diff * 5))
            elif diff <= -2:
                news_score = max(15, 40 + (diff * 5))
            else:
                news_score = 50

        if news_score is not None:
            if news_score <= 35:
                news_pts -= 12.0
            elif news_score <= 45:
                news_pts -= 5.0
            elif news_score >= 70 and change_pct > -3.0:
                news_pts += 8.0
            elif news_score >= 60 and change_pct > -3.0:
                news_pts += 4.0
        score += news_pts
        factor_breakdown['news'] = round(news_pts, 1)

        # 8. Hard Safety Caps & Sanity Limits for Breakdowns
        if change_pct <= -8.0:
            score = min(score, 28.0)  # Crash cap
        elif change_pct <= -4.0:
            score = min(score, 44.0)  # Severe drop cap
        elif st_status == 'bearish' and current_price < vwap_val and macd_hist < 0 and (sma50 is None or current_price < sma50):
            score = min(score, 36.0)  # Multi-indicator downtrend confluence cap

        conviction_score = int(round(min(98, max(10, score))))
        
        if conviction_score >= 78:
            bias = 'Strong Bullish'
            stance_color = 'bullish'
            badge_class = 'badge-bullish'
        elif conviction_score >= 60:
            bias = 'Bullish'
            stance_color = 'bullish'
            badge_class = 'badge-bullish'
        elif conviction_score >= 45:
            bias = 'Neutral / Range-Bound'
            stance_color = 'neutral'
            badge_class = 'badge-neutral'
        elif conviction_score >= 32:
            bias = 'Moderately Bearish'
            stance_color = 'bearish'
            badge_class = 'badge-bearish'
        else:
            bias = 'Strong Bearish'
            stance_color = 'bearish'
            badge_class = 'badge-bearish'
            
        if return_breakdown:
            return conviction_score, bias, stance_color, badge_class, factor_breakdown
        return conviction_score, bias, stance_color, badge_class

    def generate_ai_analysis(
        self,
        profile: dict,
        timeseries: list[dict],
        signals: dict,
        backtest_data: dict = None,
        news: list[dict] = None,
        api_key: str = None,
        provider: str = 'gemini',
        model: str = 'gemini-3.7-flash',
        allow_llm: bool = True,
        force_refresh: bool = False
    ) -> dict:
        """
        Synthesizes a comprehensive multi-paragraph AI Investment Thesis,
        Tactical Execution Matrix, Risk/Reward profile, 30-day probabilistic scenarios,
        and News Sentiment for an individual stock.
        Uses advanced statistical models out-of-the-box, enhanced by Google Gemini with dual-tier persistent caching.
        Consolidates news catalysts and executive memo into at most 1 single API call per stock.
        """
        if not timeseries or len(timeseries) < 5:
            return {'error': 'Insufficient timeseries data for AI analysis.'}

        current_price = profile.get('currentPrice') or timeseries[-1].get('close') or 100.0
        ticker = profile.get('ticker', 'STOCK')
        company_name = profile.get('name', ticker)

        full_analysis_cache_key = f"full_ai_analysis:{ticker}:{model}"
        if not force_refresh:
            cached_full = self._get_cached(full_analysis_cache_key)
            if cached_full and isinstance(cached_full, dict) and not cached_full.get('error'):
                return cached_full

        atr = profile.get('atr') or 5.0
        vwap = profile.get('vwap') or current_price
        cmf = profile.get('cmf') or 0.0

        bullish_count = signals.get('bullishCount', 0)
        bearish_count = signals.get('bearishCount', 0)
        neutral_count = signals.get('neutralCount', 0)
        overall_rating = signals.get('overall', 'Neutral')

        # 1. AI News Sentiment & Market Catalyst Synthesis (Deterministic Multi-Factor Scorer, 0 API calls)
        news_synthesis = self.synthesize_news_sentiment(ticker, company_name, current_price, news or [], api_key=None, model=model)

        # 2. Compute Canonical Recalibrated AI Quantitative Conviction Score (0 to 100%)
        conviction_score, bias, stance_color, badge_class, factor_breakdown = self.compute_conviction_score(
            profile=profile,
            signals=signals,
            backtest_data=backtest_data,
            timeseries=timeseries,
            news=news,
            news_sentiment=news_synthesis,
            return_breakdown=True
        )

        # 3. Dynamic Mathematical Trade Levels (Entry, Stop Loss, Target 1, Target 2)
        entry_low = round(max(current_price * 0.985, current_price - (0.5 * atr)), 2)
        entry_high = round(current_price, 2)
        
        stop_loss = round(max(current_price * 0.85, current_price - (1.75 * atr)), 2)
        risk_per_share = round(max(0.01, current_price - stop_loss), 2)

        target_1 = round(current_price + (1.5 * atr), 2)
        target_2 = round(current_price + (3.0 * atr), 2)
        reward_target_1 = round(target_1 - current_price, 2)
        reward_target_2 = round(target_2 - current_price, 2)
        
        rr_ratio = round(reward_target_2 / risk_per_share, 2) if risk_per_share > 0 else 2.5

        # 3. Probabilistic 30-Day Scenario Modeling
        volatility_30d = (atr / current_price) * math.sqrt(21)  # 21 trading days
        net_ratio = (conviction_score - 50.0) / 50.0
        
        bull_target = round(current_price * (1.0 + (volatility_30d * 1.35)), 2)
        base_target = round(current_price * (1.0 + (net_ratio * volatility_30d * 0.5)), 2)
        bear_target = round(current_price * (1.0 - (volatility_30d * 1.25)), 2)

        bull_prob = round(min(80, max(10, (conviction_score * 0.7) + 5)), 0)
        bear_prob = round(min(80, max(10, ((100 - conviction_score) * 0.7) + 5)), 0)
        base_prob = round(max(10, 100 - bull_prob - bear_prob), 0)

        # 4. Quantitative Synthesis & Theses
        catalysts = []
        risks = []

        indicators = signals.get('indicators', {})
        if 'SuperTrend' in indicators:
            st_sig = indicators['SuperTrend']
            if st_sig.get('status') == 'bullish':
                catalysts.append(f"SuperTrend confirms active institutional uptrend support at ${st_sig.get('value')}.")
            else:
                risks.append(f"SuperTrend trailing resistance active at ${st_sig.get('value')}.")

        if 'MACD' in indicators:
            macd_sig = indicators['MACD']
            if macd_sig.get('status') == 'bullish':
                catalysts.append("MACD momentum expansion indicates accelerating buying volume.")
            else:
                risks.append("MACD momentum deceleration signals potential near-term consolidation.")

        if cmf > 0.05:
            catalysts.append(f"Chaikin Money Flow (+{round(cmf, 3)}) indicates positive institutional accumulation.")
        elif cmf < -0.05:
            risks.append(f"Chaikin Money Flow ({round(cmf, 3)}) points to net institutional capital distribution.")

        if current_price > vwap:
            catalysts.append(f"Trading above institutional VWAP (${round(vwap, 2)}), signaling buyer control.")
        else:
            risks.append(f"Trading below volume-weighted average price (${round(vwap, 2)}).")

        # 4. Integrate Real-World News Catalysts & Headline Risks
        top_bull_news = news_synthesis.get('topBullNews', []) if news_synthesis else []
        top_bear_news = news_synthesis.get('topBearNews', []) if news_synthesis else []
        news_delta = news_synthesis.get('convictionDelta', 0.0) if news_synthesis else 0.0

        if top_bull_news:
            b_item = top_bull_news[0]
            catalysts.insert(0, f"Global Catalyst ({b_item.get('publisher', 'Financial Wire')}): {b_item.get('title', '')}")
        if top_bear_news:
            r_item = top_bear_news[0]
            risks.insert(0, f"Headline Risk ({r_item.get('publisher', 'Financial Wire')}): {r_item.get('title', '')}")

        if not catalysts:
            catalysts.append("Consolidation setup with technical breakout potential upon volume confirmation.")
        if not risks:
            risks.append(f"Breach of the ${stop_loss:.2f} key support zone invalidates the tactical bull setup.")

        # Grounded Institutional Thesis Synthesis
        news_mention = ""
        if top_bull_news and conviction_score >= 50:
            b_pub = top_bull_news[0].get('publisher', 'Financial Wire')
            b_tit = top_bull_news[0].get('title', '')
            news_mention = f" Real-time wire sentiment is constructive, led by **{b_pub}** (*\"{b_tit}\"*), contributing a **{news_delta:+.1f}%** catalyst momentum boost."
        elif top_bear_news and conviction_score < 50:
            r_pub = top_bear_news[0].get('publisher', 'Financial Wire')
            r_tit = top_bear_news[0].get('title', '')
            news_mention = f" Fundamental headwinds noted by **{r_pub}** (*\"{r_tit}\"*) add a **{news_delta:+.1f}%** drag on conviction."
        elif top_bull_news:
            b_pub = top_bull_news[0].get('publisher', 'Financial Wire')
            news_mention = f" Live headlines from **{b_pub}** reflect active catalyst positioning ({news_delta:+.1f}% delta)."

        thesis = (
            f"Quantitative AI synthesis assigns **{company_name} ({ticker})** an AI Conviction Score of **{conviction_score}% ({bias})** at **${current_price:.2f}**. "
            f"{'Positive institutional accumulation and technical alignment favor upside continuation toward $' + str(target_1) if conviction_score >= 50 else 'Bearish momentum and distribution pressure suggest caution with critical support at $' + str(stop_loss)}."
            f"{news_mention} "
            f"Optimal risk-managed execution offers an asymmetric **{rr_ratio}:1 Risk/Reward** profile with stop-loss invalidation at **${stop_loss:.2f}**."
        )

        # 5. Persistent Disk Caching & Single-Call Gemini LLM Narrative Enhancement
        cache_key = f"memo:{ticker}:{model}"
        cached_memo = self._get_cached(cache_key) if not force_refresh else None
        
        if cached_memo:
            thesis = cached_memo
        elif allow_llm:
            env_key = api_key or os.environ.get('GEMINI_API_KEY')
            if env_key and len(env_key.strip()) > 6:
                headline_brief = "\n".join([f"- {n.get('publisher')}: {n.get('title')}" for n in (top_bull_news + top_bear_news)[:4]])
                llm_prompt = f"""
                You are a senior quantitative hedge fund analyst.
                Write a concise, professional, data-backed 3-paragraph executive investment memo for {company_name} ({ticker}):
                
                Financial & Quantitative Data:
                - Current Price: ${current_price:.2f}
                - Sector: {profile.get('sector', 'Equities')}
                - Technical Multi-Factor Rating: {overall_rating} ({bullish_count} Bullish vs {bearish_count} Bearish)
                - AI Conviction Score: {conviction_score}% ({bias}) (News Delta: {news_delta:+.1f}%)
                - Daily Volatility (ATR): ±${atr:.2f}
                - Institutional VWAP: ${vwap:.2f}
                - Chaikin Money Flow (CMF): {cmf:.3f}
                - Top Real-World Breaking News Headlines:
{headline_brief}
                - Tactical Levels: Entry ${entry_low}-${entry_high}, Stop-Loss ${stop_loss}, Target 1 ${target_1}, Target 2 ${target_2} (R/R: {rr_ratio}:1)
                - 30-Day Scenario Targets: Bull ${bull_target} ({bull_prob}%), Base ${base_target} ({base_prob}%), Bear ${bear_target} ({bear_prob}%)

                Requirements:
                - Paragraph 1: Executive Thesis & Directional Bias (explicitly reference the current price, conviction score, and actual news headlines).
                - Paragraph 2: Core Catalysts & Critical Invalidation Risk.
                - Paragraph 3: Actionable Execution Strategy (mention entry, stop loss, targets).
                Keep it strictly institutional, analytical, and structured.
                """
                try:
                    llm_text, used_model, _ = self._call_gemini_api(llm_prompt, env_key, model_name=model, allow_fallback=True)
                    if llm_text and len(llm_text) > 40:
                        thesis = llm_text
                        self._set_cached(cache_key, thesis, ttl_seconds=14400)
                except Exception:
                    pass
        return {
            'ticker': ticker,
            'companyName': company_name,
            'convictionScore': conviction_score,
            'directionalBias': bias,
            'stanceColor': stance_color,
            'convictionBreakdown': factor_breakdown,
            'executiveThesis': thesis,
            'catalysts': catalysts[:3],
            'risks': risks[:3],
            'newsSynthesis': news_synthesis,
            'tradeLevels': {
                'entryZone': f"${entry_low} - ${entry_high}",
                'entryLow': entry_low,
                'entryHigh': entry_high,
                'currentPrice': current_price,
                'stopLoss': stop_loss,
                'target1': target_1,
                'target2': target_2,
                'riskRewardRatio': f"{rr_ratio}:1",
                'riskPerShare': f"${risk_per_share:.2f}",
                'riskPerShareNum': risk_per_share,
                'rewardPerShare': f"${reward_target_2:.2f}",
                'rewardPerShareNum': reward_target_2
            },
            'scenario30d': {
                'bullCase': {'target': bull_target, 'probability': int(bull_prob), 'returnPct': round(((bull_target - current_price) / current_price) * 100, 1)},
                'baseCase': {'target': base_target, 'probability': int(base_prob), 'returnPct': round(((base_target - current_price) / current_price) * 100, 1)},
                'bearCase': {'target': bear_target, 'probability': int(bear_prob), 'returnPct': round(((bear_target - current_price) / current_price) * 100, 1)}
            }
        }
        self._set_cached(full_analysis_cache_key, res, ttl_seconds=14400)
        return res

    def _get_quantitative_response(self, ticker: str, company_name: str, price: float, overall: str, conviction_score: float, bias: str, bullish_count: int, bearish_count: int, indicators: dict, atr: float, vwap: float, cmf: float, entry_zone: str, stop_loss: float, target1: float, target2: float, rr_ratio: str, scenarios: dict, quant_bt: dict, profile: dict, timeseries: list, q: str) -> str:
        """Helper that generates intent-specific quantitative responses."""
        bull_case = scenarios.get('bullCase', {})
        base_case = scenarios.get('baseCase', {})
        bear_case = scenarios.get('bearCase', {})
        
        mcap = profile.get('marketCap')
        mcap_str = f"${(mcap / 1e9):.2f}B" if mcap else 'N/A'
        pe_ratio = profile.get('peRatio', 'N/A')
        forward_pe = profile.get('forwardPE', 'N/A')
        beta = profile.get('beta', 'N/A')
        div_yield = profile.get('dividendYield', 0.0) or 0.0
        low_52 = profile.get('fiftyTwoWeekLow', 'N/A')
        high_52 = profile.get('fiftyTwoWeekHigh', 'N/A')

        # Intent 0: Historical Price Lookups (e.g., "20 days ago", "closing price on date")
        match_days = re.search(r'(\d+)\s*(?:days?|trading days?|sessions?)\s*ago', q)
        if match_days and timeseries:
            days_ago = int(match_days.group(1))
            total_bars = len(timeseries)
            idx = total_bars - 1 - days_ago
            if idx >= 0:
                bar = timeseries[idx]
                bar_date = bar.get('time') or bar.get('date', 'N/A')
                return (
                    f"**Historical Price Record for {ticker} ({company_name}):**\n\n"
                    f"• **Session:** **{days_ago} trading days ago** (Date: **{bar_date}**)\n"
                    f"• **Closing Price:** **${bar.get('close', 0.0):.2f}**\n"
                    f"• **Open / High / Low:** ${bar.get('open', 0.0):.2f} / ${bar.get('high', 0.0):.2f} / ${bar.get('low', 0.0):.2f}\n"
                    f"• **Trading Volume:** {bar.get('volume', 0):,} shares\n"
                    f"• **Net Change Since Then:** **{'+' if price >= bar.get('close', 0) else ''}{((price - bar.get('close', 1)) / bar.get('close', 1) * 100):.2f}%** (from ${bar.get('close', 0.0):.2f} to current ${price:.2f})."
                )

        # Intent 1: Buying Timing & Entry Questions
        if any(w in q for w in ["buy", "good time", "should i", "enter", "entry", "purchase", "accumulate", "invest"]):
            is_bull = "Buy" in overall or conviction_score >= 60
            rsi_val = indicators.get('RSI', {}).get('value', 50)
            rsi_str = f"{rsi_val:.1f}" if isinstance(rsi_val, (int, float)) else str(rsi_val)
            
            if is_bull:
                return (
                    f"**Yes, current technical and quantitative metrics indicate an advantageous entry opportunity for {ticker} ({company_name}).**\n\n"
                    f"• **Current Price:** ${price:.2f} with an **AI Conviction Score of {conviction_score}% ({bias})**.\n"
                    f"• **Recommended Entry Zone:** **{entry_zone}**.\n"
                    f"• **Momentum Alignment:** RSI(14) is at **{rsi_str}** and Multi-Factor signals show **{bullish_count} Bullish vs {bearish_count} Bearish** indicators.\n"
                    f"• **Tactical Targets:** Primary target is **${target1:.2f}** (+{round(((target1 - price)/price)*100, 1)}%) with expansion target at **${target2:.2f}** (+{round(((target2 - price)/price)*100, 1)}%).\n"
                    f"• **Risk Management:** Maintain strict stop-loss protection at **${stop_loss:.2f}** (1.75x ATR below market), yielding an asymmetric **{rr_ratio}** Risk/Reward profile."
                )
            else:
                return (
                    f"**Caution is currently warranted before opening new long positions in {ticker} ({company_name}).**\n\n"
                    f"• **Current Status:** Rated **{overall}** with a conservative **{conviction_score}% Conviction Score ({bias})** at ${price:.2f}.\n"
                    f"• **Technical Headwinds:** Multi-factor balance reflects **{bearish_count} Bearish vs {bullish_count} Bullish** signals, with price {'below VWAP ($' + str(vwap) + ')' if price < vwap else 'facing overhead resistance'}.\n"
                    f"• **Recommended Invalidation / Support:** Watch if price stabilizes at the **${stop_loss:.2f}** support zone before committing capital.\n"
                    f"• **Actionable Advice:** Wait for a confirmed bullish breakout above ${target1:.2f} or a positive momentum crossover on MACD/RSI before entering."
                )

        # Intent 2: Price Targets & Upside Resistance
        elif any(w in q for w in ["target", "price target", "how high", "upside", "take profit", "resistance", "where is it going", "tp"]):
            upside_1 = round(((target1 - price) / price) * 100, 2) if price else 0
            upside_2 = round(((target2 - price) / price) * 100, 2) if price else 0
            return (
                f"**Quantitative Price Targets for {ticker} ({company_name}):**\n\n"
                f"1. **Conservative Target 1 (1.5x ATR):** **${target1:.2f}** (+{upside_1}% from ${price:.2f})\n"
                f"   - *Rationale:* Aligns with near-term volatility expansion and dynamic upper band resistance.\n\n"
                f"2. **Expansion Target 2 (3.0x ATR):** **${target2:.2f}** (+{upside_2}% from ${price:.2f})\n"
                f"   - *Rationale:* Represents extended institutional breakout target based on 30-day volatility modeling.\n\n"
                f"3. **30-Day Scenario Modeling:**\n"
                f"   - **Bull Case Target:** **${bull_case.get('target', target2):.2f}** with a **{bull_case.get('probability', 50)}% statistical probability** (+{bull_case.get('returnPct', 0)}% return).\n"
                f"   - **Base Case Drift:** **${base_case.get('target', price):.2f}** ({base_case.get('probability', 30)}% probability)."
            )

        # Intent 3: Stop-Loss, Downside Protection & Key Risks
        elif any(w in q for w in ["stop", "stop loss", "sl", "risk", "downside", "support", "invalidation", "loss", "crash"]):
            downside_pct = round(((price - stop_loss) / price) * 100, 2) if price else 0
            return (
                f"**Risk Management & Key Support Parameters for {ticker}:**\n\n"
                f"• **Dynamic Stop-Loss Level:** **${stop_loss:.2f}** (-{downside_pct}% from ${price:.2f}).\n"
                f"• **Risk per Share:** **${(price - stop_loss):.2f}** per share based on a 1.75x ATR volatility buffer.\n"
                f"• **Technical Invalidation Point:** A confirmed daily close below **${stop_loss:.2f}** breaks structural support and signals immediate position closure or hedging.\n"
                f"• **30-Day Bear Case Projection:** The quantitative model projects an extreme downside exposure target of **${bear_case.get('target', round(price*0.9, 2)):.2f}** ({bear_case.get('probability', 20)}% probability, {bear_case.get('returnPct', -10)}% drawdown).\n"
                f"• **Institutional Capital Flow:** CMF is currently reading **{cmf:.3f}** ({'positive inflow protecting support' if cmf > 0 else 'negative outflow creating distribution risk'})."
            )

        # Intent 4: Conviction Score & Thesis Explanation
        elif any(w in q for w in ["conviction", "score", "why", "thesis", "reason", "rationale", "explain", "model", "rating"]):
            sma50_val = indicators.get('SMA_50', {}).get('value', 'N/A')
            st_sig = indicators.get('SuperTrend', {}).get('signal', 'Neutral')
            stoch_val = indicators.get('Stochastic', {}).get('value', 'N/A')
            macd_stat = indicators.get('MACD', {}).get('status', 'neutral')
            
            return (
                f"**Multi-Factor AI Conviction Score Breakdown for {ticker} ({conviction_score}% — {bias}):**\n\n"
                f"The AI Conviction Engine dynamically evaluates 7 quantitative & fundamental dimensions to calculate this institutional rating:\n\n"
                f"1. **Trend & Regime Structure:** SuperTrend is **{st_sig}** with price (${price:.2f}) trading {'above' if isinstance(sma50_val, (int, float)) and price >= sma50_val else 'relative to'} 50-day SMA (${sma50_val}).\n"
                f"2. **Multi-Oscillator Confluence:** RSI(14) is at **{indicators.get('RSI', {}).get('value', '50.0')}** with MACD showing **{macd_stat} momentum** (Hist: {indicators.get('MACD', {}).get('hist', '0.00')}) and Stochastic at **{stoch_val}**.\n"
                f"3. **Institutional Capital Flow:** Chaikin Money Flow (CMF) is **{cmf:.3f}**, signaling {'institutional accumulation (+ inflow support)' if cmf > 0.03 else ('institutional distribution (- outflow pressure)' if cmf < -0.03 else 'neutral capital flow')}.\n"
                f"4. **VWAP & Liquidity:** Exchanging hands {'above' if price >= vwap else 'below'} institutional VWAP benchmark (${vwap:.2f}).\n"
                f"5. **Price Action & Volatility:** 1-Day change is **{profile.get('changePercent', 0):+.2f}%** with daily volatility (ATR) at **±${atr:.2f}**.\n"
                f"6. **Algorithmic Backtest Validation:** Historical quant execution model achieved a **{quant_bt.get('winRatePct', 50):.1f}% win rate** and **{quant_bt.get('alpha', 0.0):+.1f}% Alpha**.\n"
                f"7. **Real-Time Catalyst Sentiment:** Incoming news flow is factored with active capitulation safety caps to guard against falling knives."
            )

        # Intent 5: Momentum Oscillators (RSI, Stochastic, MACD)
        elif any(w in q for w in ["rsi", "stoch", "stochastic", "macd", "momentum", "oscillator", "overbought", "oversold"]):
            rsi_info = indicators.get('RSI', {})
            stoch_info = indicators.get('Stochastic', {})
            macd_info = indicators.get('MACD', {})
            rsi_raw = rsi_info.get('value') or 50
            if rsi_raw > 70:
                rsi_status = "Overbought (>70) — watch for momentum cooling"
            elif rsi_raw < 30:
                rsi_status = "Oversold (<30) — primed for bullish mean-reversion"
            else:
                rsi_status = "Healthy neutral momentum zone"

            macd_raw = macd_info.get('hist') or 0
            macd_status = "Bullish momentum expansion" if macd_raw > 0 else "Bearish momentum contraction"

            return (
                f"**Technical Momentum & Oscillator Breakdown for {ticker}:**\n\n"
                f"• **RSI (14-Period):** **{rsi_info.get('value', 'N/A')}** — Signal: **{rsi_info.get('signal', 'Neutral')}**.\n"
                f"  *(Status: {rsi_status})*\n\n"
                f"• **Stochastic (14, 3, 3):** Signal: **{stoch_info.get('signal', 'Neutral')}** (%K: {stoch_info.get('value', 'N/A')}).\n"
                f"  *(Triggers fast inflection alerts when crossing 20/80 boundaries)*\n\n"
                f"• **MACD (12, 26, 9):** Signal: **{macd_info.get('signal', 'Neutral')}** (Histogram: {macd_info.get('hist', '0.00')}).\n"
                f"  *(Status: {macd_status})*"
            )

        # Intent 6: Institutional Money Flow & Volume (CMF, VWAP)
        elif any(w in q for w in ["cmf", "chaikin", "money flow", "institution", "volume", "vwap", "flow", "accumulation", "distribution", "smart money"]):
            avg_vol = profile.get('avgVolume', 0)
            cur_vol = profile.get('volume', 0)
            vol_ratio = (cur_vol / avg_vol) if avg_vol else 1.0
            return (
                f"**Institutional Capital Flow & Liquidity Analysis for {ticker}:**\n\n"
                f"• **Chaikin Money Flow (CMF 20):** **{cmf:+.3f}**.\n"
                f"  - *Interpretation:* {'Institutional accumulation is actively underway with positive buying pressure.' if cmf > 0.05 else ('Net institutional capital distribution detected as large volume sells exceed buys.' if cmf < -0.05 else 'Balanced capital flows with no decisive institutional skew.')}\n\n"
                f"• **Volume-Weighted Average Price (VWAP):** **${vwap:.2f}** (Current: ${price:.2f}).\n"
                f"  - *Status:* {ticker} is trading **{'above VWAP (+Bullish control)' if price >= vwap else 'below VWAP (-Bearish discount)'}**.\n\n"
                f"• **Volume Relative to Average:** Current volume is running at **{vol_ratio:.1f}x** normal 30-day average daily volume."
            )

        # Intent 7: Strategy Backtesting & Quantitative Results
        elif any(w in q for w in ["backtest", "strategy", "win rate", "profit factor", "historical", "performance", "alpha", "trades"]):
            strat_ret = quant_bt.get('strategyReturnPct', 0.0)
            bh_ret = quant_bt.get('buyHoldReturnPct', 0.0)
            alpha = quant_bt.get('alpha', (strat_ret - bh_ret))
            win_rate = quant_bt.get('winRatePct', 0.0)
            pf = quant_bt.get('profitFactor', 1.0)
            trades_count = quant_bt.get('totalTrades', 0)
            dd = quant_bt.get('maxDrawdownPct', 0.0)
            
            return (
                f"**6-Month Historical Backtesting Results for {ticker} (Multi-Factor Quant):**\n\n"
                f"• **Strategy Total Return:** **{'+' if strat_ret >= 0 else ''}{strat_ret:.2f}%** (vs Buy & Hold: {'+' if bh_ret >= 0 else ''}{bh_ret:.2f}%)\n"
                f"• **Alpha Generated:** **{'+' if alpha >= 0 else ''}{alpha:.2f}%** outperformance over buy-and-hold.\n"
                f"• **Win Rate:** **{win_rate:.1f}%** across **{trades_count} executed trades** ({quant_bt.get('winningTrades', 0)} Wins / {quant_bt.get('losingTrades', 0)} Losses).\n"
                f"• **Profit Factor:** **{pf:.2f}x** gross gains relative to gross losses.\n"
                f"• **Max Drawdown:** **-{dd:.2f}%** peak-to-trough portfolio decline.\n"
                f"• **Current Position:** **{'🟢 Holding Active Long Position' if quant_bt.get('isCurrentlyHolding') else '⚪ In Cash (100% Capital Protected)'}**."
            )

        # Intent 8: Valuation & Fundamentals (P/E, Market Cap, Beta, Dividend)
        elif any(w in q for w in ["valuation", "pe", "p/e", "forward pe", "market cap", "cap", "fundamental", "dividend", "yield", "beta", "cheap", "expensive"]):
            return (
                f"**Fundamental & Valuation Profile for {ticker} ({company_name}):**\n\n"
                f"• **Market Capitalization:** **{mcap_str}** (Sector: {profile.get('sector', 'Equities')}).\n"
                f"• **Trailing P/E Ratio:** **{pe_ratio}x** | **Forward P/E:** **{forward_pe}x**.\n"
                f"• **Market Beta (Volatility):** **{beta}** ({'Higher volatility than market (>1.0)' if isinstance(beta, (int, float)) and beta > 1 else 'Lower volatility than broad market (<1.0)'}).\n"
                f"• **Dividend Yield:** **{div_yield:.2f}%**.\n"
                f"• **52-Week Range:** **${low_52} - ${high_52}** (Current: ${price:.2f})."
            )

        # Intent 9: 30-Day Scenario Modeling (Bull, Base, Bear)
        elif any(w in q for w in ["scenario", "forecast", "projection", "future", "30 day", "month", "prediction", "cases"]):
            return (
                f"**30-Day Probabilistic Scenario Projections for {ticker}:**\n\n"
                f"• **[Bull Case] Target:** **${bull_case.get('target', target2):.2f}**\n"
                f"  - Probability: **{bull_case.get('probability', 55)}%** | Expected Upside: **+{bull_case.get('returnPct', 0)}%**\n"
                f"  - *Driver:* Technical breakout continuation and sustained institutional accumulation.\n\n"
                f"• **[Base Case] Target:** **${base_case.get('target', price):.2f}**\n"
                f"  - Probability: **{base_case.get('probability', 25)}%** | Expected Drift: **{base_case.get('returnPct', 0):+.1f}%**\n"
                f"  - *Driver:* Sideways range-bound oscillation near VWAP (${vwap:.2f}).\n\n"
                f"• **[Bear Case] Target:** **${bear_case.get('target', stop_loss):.2f}**\n"
                f"  - Probability: **{bear_case.get('probability', 20)}%** | Downside Exposure: **{bear_case.get('returnPct', 0)}%**\n"
                f"  - *Driver:* Invalidation of key support at ${stop_loss:.2f} on broader market correction."
            )

        # Fallback / Comprehensive Synthesis for open-ended queries
        else:
            return (
                f"**Comprehensive Quantitative Analysis for {ticker} ({company_name}):**\n\n"
                f"• **Market Price:** **${price:.2f}** | **AI Conviction:** **{conviction_score}% ({bias})** | **Rating:** **{overall}**.\n"
                f"• **Indicator Matrix:** **{bullish_count} Bullish** vs **{bearish_count} Bearish** signals.\n"
                f"• **Key Execution Levels:**\n"
                f"  - Recommended Entry: **{entry_zone}**\n"
                f"  - Dynamic Stop-Loss: **${stop_loss:.2f}**\n"
                f"  - Target 1 (Conservative): **${target1:.2f}**\n"
                f"  - Target 2 (Expansion): **${target2:.2f}** (Risk/Reward: **{rr_ratio}**)\n"
                f"• **Institutional Indicators:** CMF is **{cmf:+.3f}**, VWAP is **${vwap:.2f}**, and ATR volatility is **±${atr:.2f}**.\n\n"
                f"*Tip: You can ask specific questions like 'Is this a good time to buy?', 'What is the stop loss?', 'Explain why conviction is {conviction_score}%', or 'What was the closing price 20 days ago?'*"
            )

    def ask_copilot(self, ticker: str, question: str, stock_data: dict, chat_history: list = None, api_key: str = None, provider: str = 'gemini', model: str = 'gemini-3.7-flash') -> str:
        """
        Answers user questions regarding the current stock with contextual quantitative data.
        Delivers direct, highly specific answers tailored to the exact question.
        Uses Google Gemini 3.7 Flash AI when an API key is present, with in-memory caching
        and graceful fallback to other Gemini models if rate-limited.
        """
        if not stock_data:
            return f"I don't have current quantitative market data loaded for {ticker}. Please analyze the stock first."

        profile = stock_data.get('profile', {})
        signals = stock_data.get('signals', {})
        ai_data = stock_data.get('aiAnalysis', {})
        backtest_dict = stock_data.get('backtests', {})
        quant_bt = backtest_dict.get('quant', {})
        timeseries = stock_data.get('timeseries', [])

        price = profile.get('currentPrice', 0.0) or 0.0
        company_name = profile.get('name', ticker)
        sector = profile.get('sector', 'Equities')
        pe_ratio = profile.get('peRatio', 'N/A')
        forward_pe = profile.get('forwardPE', 'N/A')
        market_cap = profile.get('marketCap')
        mcap_str = f"${(market_cap / 1e9):.2f}B" if market_cap else 'N/A'
        beta = profile.get('beta', 'N/A')
        div_yield = profile.get('dividendYield', 0.0) or 0.0
        day_low = profile.get('dayLow', 'N/A')
        day_high = profile.get('dayHigh', 'N/A')
        low_52 = profile.get('fiftyTwoWeekLow', 'N/A')
        high_52 = profile.get('fiftyTwoWeekHigh', 'N/A')

        overall = signals.get('overall', 'Neutral')
        bullish_count = signals.get('bullishCount', 0)
        bearish_count = signals.get('bearishCount', 0)
        neutral_count = signals.get('neutralCount', 0)
        indicators = signals.get('indicators', {})

        atr = profile.get('atr', 0.0) or 2.0
        vwap = profile.get('vwap', 0.0) or price
        cmf = profile.get('cmf', 0.0) or 0.0

        conviction_score = ai_data.get('convictionScore', 50)
        bias = ai_data.get('directionalBias', 'Neutral')
        trade_levels = ai_data.get('tradeLevels', {})
        entry_zone = trade_levels.get('entryZone', f"${price}")
        stop_loss = trade_levels.get('stopLoss', round(price - (1.75 * atr), 2))
        target1 = trade_levels.get('target1', round(price + (1.5 * atr), 2))
        target2 = trade_levels.get('target2', round(price + (3.0 * atr), 2))
        rr_ratio = trade_levels.get('riskRewardRatio', '2.5:1')
        scenarios = ai_data.get('scenario30d', {})

        # Build recent historical price table for precise date and price queries
        history_lines = []
        if timeseries:
            for i, bar in enumerate(reversed(timeseries[-30:])):
                label = f"{i} days ago (Latest)" if i == 0 else f"{i} trading days ago"
                bar_date = bar.get('time') or bar.get('date', 'N/A')
                history_lines.append(f"  * {label} [{bar_date}]: Close=${bar.get('close', 0.0):.2f}, Open=${bar.get('open', 0.0):.2f}, High=${bar.get('high', 0.0):.2f}, Low=${bar.get('low', 0.0):.2f}, Vol={bar.get('volume', 0):,}")
        history_str = "\n".join(history_lines) if history_lines else "Not available"

        q = question.strip().lower()
        target_model = (model or "gemini-3.7-flash").strip()

        # Check in-memory cache for recent identical questions
        cache_key = f"chat:{ticker}:{q}:{target_model}"
        cached_answer = self._get_cached(cache_key)
        if cached_answer:
            return cached_answer

        # 1. Attempt Google Gemini LLM with rich quantitative context if key is available
        env_key = api_key or os.environ.get('GEMINI_API_KEY') or ''
        if env_key and len(env_key.strip()) > 6:
            prompt = f"""
            You are the FinDashIQ AI Financial Copilot, an elite quantitative hedge fund assistant.
            The user is asking a specific question about {company_name} ({ticker}).
            
            FULL QUANTITATIVE DOSSIER FOR {ticker}:
            - Current Price: ${price} (Day Range: ${day_low} - ${day_high}, 52-Wk Range: ${low_52} - ${high_52})
            - Fundamental Profile: Sector: {sector}, Market Cap: {mcap_str}, P/E: {pe_ratio}x, Forward P/E: {forward_pe}x, Beta: {beta}, Dividend Yield: {div_yield}%
            - AI Conviction Score: {conviction_score}% ({bias})
            - Technical Multi-Factor Consensus: {overall} ({bullish_count} Bullish, {bearish_count} Bearish, {neutral_count} Neutral)
            - Technical Indicators:
              * ATR Volatility: ±${atr:.2f}
              * VWAP: ${vwap:.2f} (Price is {'above' if price >= vwap else 'below'} VWAP)
              * CMF Institutional Flow: {cmf:.3f} ({'Institutional Accumulation' if cmf > 0 else 'Institutional Distribution'})
              * SuperTrend: {indicators.get('SuperTrend', {}).get('signal', 'N/A')} at ${indicators.get('SuperTrend', {}).get('value', 'N/A')}
              * RSI (14): {indicators.get('RSI', {}).get('value', 'N/A')} ({indicators.get('RSI', {}).get('signal', 'N/A')})
              * Stochastic (14,3,3): {indicators.get('Stochastic', {}).get('signal', 'N/A')} (%K: {indicators.get('Stochastic', {}).get('value', 'N/A')})
              * MACD (12,26,9): {indicators.get('MACD', {}).get('signal', 'N/A')} (Hist: {indicators.get('MACD', {}).get('hist', 'N/A')})
            - Tactical Trade Levels:
              * Recommended Entry: {entry_zone}
              * Dynamic Stop-Loss: ${stop_loss}
              * Target 1: ${target1}
              * Target 2: ${target2}
              * Risk/Reward Ratio: {rr_ratio}
            - 30-Day Probabilistic Scenarios:
              * Bull Case: ${scenarios.get('bullCase', {}).get('target', 'N/A')} ({scenarios.get('bullCase', {}).get('probability', 'N/A')}% prob, +{scenarios.get('bullCase', {}).get('returnPct', 'N/A')}%)
              * Base Case: ${scenarios.get('baseCase', {}).get('target', 'N/A')} ({scenarios.get('baseCase', {}).get('probability', 'N/A')}% prob, {scenarios.get('baseCase', {}).get('returnPct', 'N/A')}%)
              * Bear Case: ${scenarios.get('bearCase', {}).get('target', 'N/A')} ({scenarios.get('bearCase', {}).get('probability', 'N/A')}% prob, {scenarios.get('bearCase', {}).get('returnPct', 'N/A')}%)
            - 6-Month Strategy Backtest:
              * Multi-Factor Quant: Win Rate {quant_bt.get('winRatePct', 0):.1f}%, Return {quant_bt.get('strategyReturnPct', 0):.1f}% (Alpha: {quant_bt.get('alpha', 0):.1f}%), Profit Factor: {quant_bt.get('profitFactor', 1.0):.2f}x
            - Recent Daily Price History (Last 30 Sessions, most recent first):
{history_str}
            
            USER QUESTION: "{question}"

            INSTRUCTIONS:
            1. Directly answer the user's question in the very first sentence. If the question asks for a historical price (e.g. 20 days ago), extract and state the exact closing price in dollars from the price history table above.
            2. Ground your entire answer in the specific numbers and indicators provided in the dossier above.
            3. Use clear markdown formatting (bolding key numbers and bullet points).
            4. Keep the answer concise, actionable, and analytical.
            """
            gemini_text, used_model, gemini_err = self._call_gemini_api(prompt, env_key, model_name=target_model, allow_fallback=True)
            if gemini_text:
                if used_model != target_model:
                    full_answer = f"{gemini_text}\n\n*— Generated by Google {used_model} (auto-routed from {target_model} due to free-tier rate limits)*"
                else:
                    full_answer = f"{gemini_text}\n\n*— Generated by Google {used_model}*"
                
                # Cache response for 10 minutes
                self._set_cached(cache_key, full_answer, ttl_seconds=600)
                return full_answer
            elif gemini_err:
                fallback = self._get_quantitative_response(ticker, company_name, price, overall, conviction_score, bias, bullish_count, bearish_count, indicators, atr, vwap, cmf, entry_zone, stop_loss, target1, target2, rr_ratio, scenarios, quant_bt, profile, timeseries, q)
                return f"⚠️ *{gemini_err}*\n\n*Falling back to Built-in Quantitative Intelligence:*\n\n{fallback}"

        # 2. Built-in Quantitative Expert Copilot (Deterministic Response Engine)
        quant_res = self._get_quantitative_response(ticker, company_name, price, overall, conviction_score, bias, bullish_count, bearish_count, indicators, atr, vwap, cmf, entry_zone, stop_loss, target1, target2, rr_ratio, scenarios, quant_bt, profile, timeseries, q)
        self._set_cached(cache_key, quant_res, ttl_seconds=600)
        return quant_res


ai_service = AIService()
