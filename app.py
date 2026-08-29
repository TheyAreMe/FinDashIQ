import gzip
import os
import json
import concurrent.futures
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from services.stock_service import StockService
from services.ai_service import AIService
from services.scanner_service import ScannerService
from services.currency_service import CurrencyService
from services.news_service import news_service

app = Flask(__name__, template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'findashiq_enterprise_quant_key_2026_x89')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # 1 year static asset caching
if os.environ.get('SESSION_COOKIE_SECURE', '').lower() in ('true', '1', 'yes'):
    app.config['SESSION_COOKIE_SECURE'] = True

# Apply ProxyFix middleware to trust reverse proxy headers for HTTPS scheme, client IP, host, and port
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1, x_prefix=1)


@app.context_processor
def inject_asset_version():
    """Injects static asset version string for automatic client cache busting."""
    return {'asset_version': '4.16.0'}


@app.after_request
def apply_security_and_performance_headers(response):
    """Applies institutional security headers, caching policies, and gzip compression."""
    # Strict-Transport-Security (HSTS): Enforce HTTPS for 1 year including subdomains and preloading
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

    # Content-Security-Policy (CSP): Restrict execution origins to self, Google Fonts, Lucide, ApexCharts, and donation widgets
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://storage.ko-fi.com https://cdnjs.buymeacoffee.com https://www.buymeacoffee.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob: https://cdn.buymeacoffee.com https://storage.ko-fi.com https://ko-fi.com; "
        "frame-src 'self' https://ko-fi.com https://storage.ko-fi.com https://www.buymeacoffee.com https://buymeacoffee.com; "
        "connect-src 'self' https://ko-fi.com https://www.buymeacoffee.com; "
        "frame-ancestors 'self'; "
        "object-src 'none'; "
        "base-uri 'self';"
    )
    response.headers['Content-Security-Policy'] = csp_policy

    # X-Content-Type-Options: Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'

    # X-Frame-Options: Clickjacking mitigation (allow same origin framing)
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'

    # Referrer-Policy: Protect user navigation privacy while preserving origin across HTTPS
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    # Permissions-Policy: Restrict unused sensitive browser capabilities
    response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), payment=(), usb=()'

    # Modern X-XSS-Protection recommendation
    response.headers['X-XSS-Protection'] = '0'

    # Cache-Control Policy for PageSpeed: 1-year immutable for static assets, no-cache for dynamic APIs
    if request.path.startswith('/static/') or request.path in ('/favicon.ico', '/favicon.svg'):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    elif request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'

    # Automatic Gzip Compression for text, css, javascript, svg, and json responses
    accept_encoding = request.headers.get('Accept-Encoding', '')
    if (
        'gzip' in accept_encoding
        and response.status_code == 200
        and 'Content-Encoding' not in response.headers
    ):
        content_type = response.headers.get('Content-Type', '').lower()
        if any(ct in content_type for ct in ('text/', 'application/javascript', 'application/json', 'image/svg+xml', 'application/xml')):
            if response.direct_passthrough:
                response.direct_passthrough = False
            response_data = response.get_data()
            if len(response_data) >= 300:
                compressed_data = gzip.compress(response_data, compresslevel=6)
                response.set_data(compressed_data)
                response.headers['Content-Encoding'] = 'gzip'
                response.headers['Content-Length'] = len(compressed_data)
                response.headers['Vary'] = 'Accept-Encoding'

    return response


@app.route('/favicon.ico')
@app.route('/static/favicon.ico')
def favicon():
    """Serves the institutional SVG favicon."""
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.svg', mimetype='image/svg+xml')

stock_service = StockService()
ai_service = AIService()
scanner_service = ScannerService(stock_service, ai_service)
currency_service = CurrencyService()

USERS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'users.json')
WATCHLIST_FILE = os.path.join(os.path.dirname(__file__), 'data', 'watchlist.json')
ALERTS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'alerts.json')

DEFAULT_WATCHLIST = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"]


def load_users() -> dict:
    """Loads all user accounts from disk, initializing default admin if not present."""
    os.makedirs(os.path.join(os.path.dirname(__file__), 'data'), exist_ok=True)
    users = {}
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users = json.load(f)
        except Exception:
            users = {}

    # Initialize primary Admin account if no users exist
    if not users or 'admin' not in users:
        users['admin'] = {
            "username": "admin",
            "passwordHash": generate_password_hash("admin123"),
            "role": "admin",
            "displayName": "Lead Administrator",
            "email": "admin@findashiq.internal",
            "avatar": "shield",
            "riskProfile": "Aggressive Quant",
            "baseCurrency": "USD",
            "createdAt": datetime.now().isoformat(),
            "watchlist": list(DEFAULT_WATCHLIST),
            "watchlistViewMode": "cards",
            "alerts": [],
            "theme": "dark",
            "aiSettings": {
                "apiKey": "",
                "model": "gemini-3.7-flash"
            }
        }
        save_users(users)
    return users


def save_users(users: dict) -> None:
    """Saves user accounts dictionary to disk."""
    os.makedirs(os.path.join(os.path.dirname(__file__), 'data'), exist_ok=True)
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)


def get_current_user_data() -> tuple[dict | None, str | None]:
    """Helper to retrieve active session user object and username."""
    username = session.get('username')
    if not username:
        return None, None
    users = load_users()
    user = users.get(username)
    return user, username


def sanitize_user(user: dict) -> dict:
    """Returns user profile without sensitive password hash."""
    return {
        "username": user.get("username"),
        "role": user.get("role", "user"),
        "displayName": user.get("displayName", user.get("username")),
        "email": user.get("email", ""),
        "avatar": user.get("avatar", "user"),
        "riskProfile": user.get("riskProfile", "Balanced"),
        "baseCurrency": user.get("baseCurrency", "USD"),
        "theme": user.get("theme", "dark"),
        "watchlistViewMode": user.get("watchlistViewMode", "cards"),
        "createdAt": user.get("createdAt", ""),
        "watchlist": user.get("watchlist", list(DEFAULT_WATCHLIST)),
        "alertsCount": len(user.get("alerts", [])),
        "aiSettings": user.get("aiSettings", {
            "apiKey": "",
            "model": "gemini-3.7-flash"
        })
    }


@app.route('/')
def index():
    """Renders the modern dynamic stock analysis and AI intelligence dashboard."""
    user, username = get_current_user_data()
    is_authenticated = bool(user)
    return render_template(
        'index.html',
        is_authenticated=is_authenticated,
        user=sanitize_user(user) if user else None
    )


@app.route('/api/forex/rates', methods=['GET'])
def api_get_forex_rates():
    """Returns current cached exchange rates against USD."""
    try:
        rates = currency_service.get_rates()
        return jsonify({
            'success': True,
            'base': 'USD',
            'rates': rates,
            'timestamp': currency_service._last_fetch
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/forex/convert', methods=['GET', 'POST'])
def api_convert_currency():
    """Converts a given amount from one currency to another."""
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            amount = float(data.get('amount', 0))
            from_curr = data.get('from') or data.get('from_currency') or data.get('from_curr') or 'USD'
            to_curr = data.get('to') or data.get('to_currency') or data.get('to_curr') or 'USD'
        else:
            amount = float(request.args.get('amount', 0))
            from_curr = request.args.get('from') or request.args.get('from_currency') or request.args.get('from_curr') or 'USD'
            to_curr = request.args.get('to') or request.args.get('to_currency') or request.args.get('to_curr') or 'USD'

        converted = currency_service.convert(amount, from_curr, to_curr)
        return jsonify({
            'success': True,
            'amount': amount,
            'from': from_curr,
            'to': to_curr,
            'result': converted
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stocks/search', methods=['GET'])
def api_search_stocks():
    """
    Endpoint for real-time company name and ticker search with multi-exchange disambiguation.
    Query parameters:
      q: Search query string (e.g. 'Apple', 'PayPal', 'Infineon', 'PYPL')
      limit: Maximum results count (default: 12)
    """
    query = request.args.get('q') or request.args.get('query') or ''
    try:
        limit = min(int(request.args.get('limit', 12)), 30)
    except (ValueError, TypeError):
        limit = 12

    try:
        results = stock_service.search_stocks(query, limit=limit)
        return jsonify({
            'success': True,
            'query': query,
            'count': len(results),
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'query': query,
            'results': []
        }), 500


@app.route('/api/stocks/resolve', methods=['POST'])
def api_resolve_stocks():
    """
    Resolves a batch of mixed tickers and/or company names into validated ticker symbols.
    Accepts JSON body:
      {"queries": ["PYPL", "Sony", "Apple", "Infineon"]}
      or
      {"query": "PYPL, Sony, Apple, Infineon"}
    Returns resolved metadata and clean ticker array.
    """
    data = request.get_json(silent=True) or {}
    raw_queries = data.get('queries') or data.get('query') or []
    if isinstance(raw_queries, str):
        query_list = [q.strip() for q in raw_queries.split(',') if q.strip()]
    elif isinstance(raw_queries, list):
        query_list = [str(q).strip() for q in raw_queries if str(q).strip()]
    else:
        query_list = []

    if not query_list:
        return jsonify({'success': False, 'error': 'No queries provided.', 'resolved': [], 'tickers': []}), 400

    resolved_list = []
    final_tickers = []
    seen = set()

    for item in query_list:
        clean_item = item.strip()
        if not clean_item:
            continue

        search_results = stock_service.search_stocks(clean_item, limit=5)
        if search_results:
            top_match = None
            for cand in search_results:
                if cand.get('ticker', '').upper() == clean_item.upper():
                    top_match = cand
                    break
            if not top_match:
                top_match = search_results[0]

            resolved_ticker = top_match.get('ticker')
            if resolved_ticker and resolved_ticker not in seen:
                seen.add(resolved_ticker)
                final_tickers.append(resolved_ticker)
                resolved_list.append({
                    'query': clean_item,
                    'ticker': resolved_ticker,
                    'name': top_match.get('name', resolved_ticker),
                    'exchange': top_match.get('exchange', 'Global'),
                    'type': top_match.get('type', 'EQUITY'),
                    'isExactTicker': bool(clean_item.upper() == resolved_ticker.upper()),
                    'allMatches': search_results
                })
        else:
            fallback_ticker = clean_item.upper()
            if fallback_ticker not in seen:
                seen.add(fallback_ticker)
                final_tickers.append(fallback_ticker)
                resolved_list.append({
                    'query': clean_item,
                    'ticker': fallback_ticker,
                    'name': fallback_ticker,
                    'exchange': 'Global',
                    'type': 'EQUITY',
                    'isExactTicker': True,
                    'allMatches': []
                })

    return jsonify({
        'success': True,
        'resolved': resolved_list,
        'tickers': final_tickers,
        'tickerString': ", ".join(final_tickers)
    }), 200


@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    """
    Primary API endpoint to analyze stock tickers and generate AI Intelligence.
    Receives JSON body:
      {
        "tickers": ["AAPL", "NVDA", "MSFT"],
        "period": "6mo",
        "interval": "1d",
        "apiKey": "..."        # Optional Google Gemini API key
      }
    """
    data = request.get_json(silent=True)
    if not data or 'tickers' not in data:
        return jsonify({"error": "Missing 'tickers' list in request body."}), 400

    raw_tickers = data.get('tickers')
    if isinstance(raw_tickers, str):
        tickers = [t.strip() for t in raw_tickers.split(',') if t.strip()]
    elif isinstance(raw_tickers, list):
        tickers = [str(t).strip() for t in raw_tickers if str(t).strip()]
    else:
        return jsonify({"error": "Invalid format for 'tickers'. Must be an array or comma-separated string."}), 400

    if not tickers:
        return jsonify({"error": "Please provide at least one valid stock ticker."}), 400

    # Auto-resolve any full company names into ticker symbols
    resolved_tickers = []
    for t in tickers:
        clean_t = t.strip()
        if len(clean_t) > 5 and '.' not in clean_t:
            s_res = stock_service.search_stocks(clean_t, limit=1)
            if s_res and s_res[0].get('ticker'):
                resolved_tickers.append(s_res[0]['ticker'])
                continue
        resolved_tickers.append(clean_t.upper())
    tickers = resolved_tickers

    period = data.get('period', '6mo')
    interval = data.get('interval', '1d')
    force_refresh = data.get('forceRefresh', False)
    phase = str(data.get('phase', 'full')).strip().lower()
    api_key = data.get('apiKey')
    provider = data.get('provider', 'gemini')
    model = data.get('model', 'gemini-3.7-flash')

    valid_periods = {'1mo', '3mo', '6mo', '1y', '2y', '5y', 'ytd', 'max'}
    if period not in valid_periods:
        period = '6mo'

    try:
        results = stock_service.fetch_full_stock_analysis(tickers, period=period, interval=interval, force_refresh=force_refresh, phase=phase)

        if 'error' in results and not results.get('stocks'):
            return jsonify({"error": results['error']}), 500

        current_prices = {}
        analysis_summary = {}

        # Fast phase returns immediately without heavy AI synthesis
        if phase == 'fast':
            for ticker, sdata in results.get('stocks', {}).items():
                if 'error' in sdata:
                    current_prices[ticker] = {'price': None, 'status': sdata['error']}
                    analysis_summary[ticker] = {'error': sdata['error']}
                    continue

                profile = sdata.get('profile', {})
                signals = sdata.get('signals', {})
                indicators_info = signals.get('indicators', {})

                c_score, bias, stance_color, _ = ai_service.compute_conviction_score(
                    profile=profile,
                    signals=signals,
                    backtest_data=sdata.get('backtests'),
                    news=sdata.get('news', [])
                )
                sdata['aiAnalysis'] = {
                    'convictionScore': c_score,
                    'directionalBias': bias,
                    'stanceColor': stance_color
                }

                current_prices[ticker] = {
                    'price': profile.get('currentPrice'),
                    'change': profile.get('change'),
                    'changePercent': profile.get('changePercent'),
                    'currency': profile.get('currency', 'USD'),
                    'status': 'Success'
                }
                analysis_summary[ticker] = {
                    'overall': signals.get('overall', 'Neutral'),
                    'score': signals.get('score', 0),
                    'RSI': indicators_info.get('RSI', {}).get('value'),
                    'MACD': indicators_info.get('MACD', {}).get('value'),
                    'SuperTrend': indicators_info.get('SuperTrend', {}).get('value'),
                    'ConvictionScore': c_score
                }

            return jsonify({
                'success': True,
                'phase': 'fast',
                'isFastHydration': True,
                'tickers': results.get('tickers', tickers),
                'stocks': results.get('stocks', {}),
                'current_prices': current_prices,
                'analysis': analysis_summary,
                'timestamp': results.get('timestamp', datetime.now().isoformat())
            }), 200

        is_single_stock = (len(tickers) == 1)
        allow_batch_llm = data.get('allowLLM', is_single_stock)

        # Full Phase: Parallel AI Synthesis across all tickers with Rate-Limit Protection
        def _enrich_single_stock_ai(item):
            ticker, sdata = item
            if 'error' in sdata:
                return ticker, sdata, {'price': None, 'status': sdata['error']}, {'error': sdata['error']}

            profile = sdata.get('profile', {})
            signals = sdata.get('signals', {})
            timeseries = sdata.get('timeseries', [])
            backtests = sdata.get('backtests', {})

            # Determine whether LLM call is permitted for this item:
            # - For single stock (e.g. Deep-Dive, Single search): always allow LLM
            # - For batch (Watchlist): allow if cached on disk or explicitly requested
            cached_memo_key = f"memo:{ticker}:{model}"
            is_cached = bool(ai_service._get_cached(cached_memo_key))
            item_allow_llm = allow_batch_llm or is_cached or is_single_stock

            # Reuse cached AI analysis unless missing or force_refresh requested
            if not force_refresh and sdata.get('aiAnalysis') and not sdata['aiAnalysis'].get('error'):
                ai_analysis = sdata['aiAnalysis']
            else:
                # Generate AI Investment Analysis, Scenario Modeling & News Synthesis
                ai_analysis = ai_service.generate_ai_analysis(
                    profile=profile,
                    timeseries=timeseries,
                    signals=signals,
                    backtest_data=backtests,
                    news=sdata.get('news', []),
                    api_key=api_key,
                    provider=provider,
                    model=model,
                    allow_llm=item_allow_llm,
                    force_refresh=force_refresh
                )
                sdata['aiAnalysis'] = ai_analysis

            c_price = {
                'price': profile.get('currentPrice'),
                'change': profile.get('change'),
                'changePercent': profile.get('changePercent'),
                'currency': profile.get('currency', 'USD'),
                'status': 'Success'
            }
            
            indicators_info = signals.get('indicators', {})
            a_summary = {
                'overall': signals.get('overall', 'Neutral'),
                'score': signals.get('score', 0),
                'RSI': indicators_info.get('RSI', {}).get('value'),
                'MACD': indicators_info.get('MACD', {}).get('value'),
                'Signal': indicators_info.get('MACD', {}).get('signal_line'),
                'MACD_Hist': indicators_info.get('MACD', {}).get('hist'),
                'SuperTrend': indicators_info.get('SuperTrend', {}).get('value'),
                'ConvictionScore': ai_analysis.get('convictionScore', 50)
            }
            return ticker, sdata, c_price, a_summary

        stock_items = list(results.get('stocks', {}).items())
        max_ai_workers = min(len(stock_items), 12) if stock_items else 1

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_ai_workers) as executor:
            future_to_item = {executor.submit(_enrich_single_stock_ai, item): item for item in stock_items}
            for future in concurrent.futures.as_completed(future_to_item):
                try:
                    ticker, sdata, c_price, a_summary = future.result()
                    results['stocks'][ticker] = sdata
                    current_prices[ticker] = c_price
                    analysis_summary[ticker] = a_summary
                except Exception as e:
                    pass

        response = {
            'success': True,
            'phase': 'full',
            'isFastHydration': False,
            'message': 'Stock analysis, indicators, backtests, and AI intelligence successfully generated.',
            'period': period,
            'interval': interval,
            'tickers': results.get('tickers', tickers),
            'stocks': results.get('stocks', {}),
            'current_prices': current_prices,
            'analysis': analysis_summary,
            'timestamp': results.get('timestamp', datetime.now().isoformat())
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Internal analysis error: {str(e)}"}), 500


@app.route('/api/ai-chat', methods=['POST'])
def api_ai_chat():
    """
    Endpoint for the interactive AI Financial Copilot.
    Receives JSON:
      {
        "ticker": "AAPL",
        "question": "What are the key resistance levels?",
        "stockData": { ... },   # Active stock data payload from frontend
        "apiKey": "...",
        "provider": "gemini"
      }
    """
    data = request.get_json(silent=True) or {}
    ticker = data.get('ticker', 'STOCK').upper()
    question = data.get('question', '').strip()
    stock_data = data.get('stockData') or {}
    api_key = data.get('apiKey')
    provider = data.get('provider', 'gemini')
    model = data.get('model', 'gemini-3.7-flash')

    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    answer = ai_service.ask_copilot(
        ticker=ticker,
        question=question,
        stock_data=stock_data,
        api_key=api_key,
        provider=provider,
        model=model
    )

    return jsonify({
        "success": True,
        "ticker": ticker,
        "question": question,
        "answer": answer,
        "timestamp": datetime.now().isoformat()
    }), 200


@app.route('/api/stocks/<path:ticker>/news', methods=['GET'])
def api_get_stock_news(ticker):
    """Returns multi-source global financial news for a specific stock."""
    clean_ticker = str(ticker).strip().upper()
    force_refresh = request.args.get('forceRefresh', '').lower() in ('true', '1')
    company_name = request.args.get('name', '').strip()
    limit = int(request.args.get('limit', 35))

    news_items = news_service.fetch_global_news(
        ticker=clean_ticker,
        company_name=company_name,
        limit=limit,
        force_refresh=force_refresh
    )

    user, _ = get_current_user_data()
    api_key = user.get('aiSettings', {}).get('apiKey') if user else None
    model = user.get('aiSettings', {}).get('model', 'gemini-3.7-flash') if user else 'gemini-3.7-flash'

    synthesis = ai_service.synthesize_news_sentiment(
        ticker=clean_ticker,
        company_name=company_name or clean_ticker,
        current_price=100.0,
        news_items=news_items,
        api_key=api_key,
        model=model
    )

    return jsonify({
        "success": True,
        "ticker": clean_ticker,
        "newsCount": len(news_items),
        "news": news_items,
        "synthesis": synthesis,
        "timestamp": datetime.now().isoformat()
    }), 200


@app.route('/api/test-gemini', methods=['POST'])
def test_gemini():
    """Validates the Google Gemini API key and returns a per-model diagnostic report."""
    data = request.get_json(silent=True) or {}
    api_key = data.get('apiKey', '').strip()
    if not api_key:
        api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    model = data.get('model', 'gemini-3.7-flash').strip()

    if not api_key:
        return jsonify({"success": False, "error": "No API key configured.", "models": []}), 200

    report = ai_service.test_model_cascade(api_key, preferred_model=model)
    return jsonify(report), 200


# =============================================================
# AI QUANTITATIVE STOCK SCANNER ENDPOINTS
# =============================================================

@app.route('/api/scanner/cached', methods=['GET'])
def api_scanner_cached():
    """Returns previously saved scanner opportunities from disk cache for instant SWR loading."""
    cached_data = scanner_service.get_cached_scanner_results()
    if cached_data:
        return jsonify(cached_data), 200
    return jsonify({"success": False, "message": "No cached scan found on disk."}), 404


@app.route('/api/scanner/universe', methods=['GET'])
def api_scanner_universe():
    """Returns metadata about the scanner asset universe, sectors, and themes."""
    meta = scanner_service.get_universe_metadata()
    return jsonify({"success": True, "data": meta}), 200


@app.route('/api/scanner/run', methods=['POST'])
def api_scanner_run():
    """
    Executes an AI-driven quantitative stock scan across thematic and ecological universes.
    Body JSON:
      {
        "sector": "all" | "Clean Energy" | "Technology" | ...,
        "theme": "all" | "eco_esg" | "ai_deeptech" | "momentum" | "value",
        "marketCap": "all" | "mega" | "large" | "mid",
        "minConviction": 50,
        "excludeWatchlist": true,
        "requiredIndicators": ["supertrend_bullish", "cmf_accumulation", ...]
      }
    """
    data = request.get_json(silent=True) or {}
    sector = str(data.get('sector', 'all')).strip()
    theme = str(data.get('theme', 'all')).strip()
    market_cap = str(data.get('marketCap', 'all')).strip()
    min_conviction = int(data.get('minConviction', 50))
    exclude_watchlist = bool(data.get('excludeWatchlist', True))
    required_indicators = data.get('requiredIndicators', [])
    force_refresh = bool(data.get('forceRefresh', False))

    user, _ = get_current_user_data()
    user_wl = user.get('watchlist', list(DEFAULT_WATCHLIST)) if user else list(DEFAULT_WATCHLIST)

    api_key = ''
    model = 'gemini-3.7-flash'
    if user and user.get('aiSettings'):
        api_key = user['aiSettings'].get('apiKey', '')
        model = user['aiSettings'].get('model', 'gemini-3.7-flash')

    results = scanner_service.scan_opportunities(
        sector=sector,
        theme=theme,
        market_cap=market_cap,
        min_conviction=min_conviction,
        exclude_watchlist=exclude_watchlist,
        user_watchlist=user_wl,
        required_indicators=required_indicators,
        api_key=api_key,
        model=model,
        force_refresh=force_refresh
    )

    return jsonify(results), 200


# =============================================================
# AUTHENTICATION & USER MANAGEMENT ENDPOINTS
# =============================================================

@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    """Authenticates user credentials and initializes session."""
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip().lower()
    password = str(data.get('password', ''))

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password are required."}), 400

    users = load_users()
    user = users.get(username)

    if not user or not check_password_hash(user.get('passwordHash', ''), password):
        return jsonify({"success": False, "error": "Invalid username or password."}), 401

    session.permanent = True
    session['username'] = username
    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.get('displayName', username)}!",
        "user": sanitize_user(user)
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
def api_auth_logout():
    """Terminates the active session."""
    session.pop('username', None)
    return jsonify({"success": True, "message": "Successfully logged out."}), 200


@app.route('/api/auth/user', methods=['GET'])
def api_auth_current_user():
    """Retrieves current session user state."""
    user, username = get_current_user_data()
    if not user:
        return jsonify({"authenticated": False, "user": None}), 200
    return jsonify({"authenticated": True, "user": sanitize_user(user)}), 200


@app.route('/api/auth/update-profile', methods=['POST'])
def api_auth_update_profile():
    """Updates active user profile preferences."""
    user, username = get_current_user_data()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    data = request.get_json(silent=True) or {}
    users = load_users()

    if username not in users:
        return jsonify({"success": False, "error": "User record not found."}), 404

    target_user = users[username]
    if 'displayName' in data and str(data['displayName']).strip():
        target_user['displayName'] = str(data['displayName']).strip()
    if 'email' in data:
        target_user['email'] = str(data['email']).strip()
    if 'avatar' in data:
        target_user['avatar'] = str(data['avatar']).strip()
    if 'riskProfile' in data:
        target_user['riskProfile'] = str(data['riskProfile']).strip()
    if 'baseCurrency' in data:
        target_user['baseCurrency'] = str(data['baseCurrency']).strip()
    if 'theme' in data:
        target_user['theme'] = 'bright' if str(data['theme']).strip().lower() in ('bright', 'light') else 'dark'
    if 'watchlistViewMode' in data:
        raw_mode = str(data['watchlistViewMode']).strip().lower()
        target_user['watchlistViewMode'] = 'table' if raw_mode in ('table', 'list') else 'cards'

    save_users(users)
    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "user": sanitize_user(target_user)
    }), 200


@app.route('/api/auth/update-theme', methods=['POST'])
def api_auth_update_theme():
    """Immediately persists the active user's visual theme mode (dark or bright)."""
    user, username = get_current_user_data()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    data = request.get_json(silent=True) or {}
    raw_theme = str(data.get('theme', 'dark')).strip().lower()
    selected_theme = 'bright' if raw_theme in ('bright', 'light') else 'dark'

    users = load_users()
    if username not in users:
        return jsonify({"success": False, "error": "User record not found."}), 404

    users[username]['theme'] = selected_theme
    save_users(users)
    return jsonify({
        "success": True,
        "message": f"Theme preference updated to '{selected_theme}'.",
        "theme": selected_theme,
        "user": sanitize_user(users[username])
    }), 200


@app.route('/api/auth/update-ai-settings', methods=['POST'])
def api_auth_update_ai_settings():
    """Updates AI provider API key and model preference for the active authenticated user."""
    user, username = get_current_user_data()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    data = request.get_json(silent=True) or {}
    api_key = str(data.get('apiKey', '')).strip()
    model = str(data.get('model', 'gemini-3.7-flash')).strip() or 'gemini-3.7-flash'

    users = load_users()
    if username not in users:
        return jsonify({"success": False, "error": "User record not found."}), 404

    users[username]['aiSettings'] = {
        "apiKey": api_key,
        "model": model
    }
    save_users(users)
    return jsonify({
        "success": True,
        "message": "AI configuration saved to your account.",
        "user": sanitize_user(users[username])
    }), 200


@app.route('/api/auth/change-password', methods=['POST'])
def api_auth_change_password():
    """Changes password for the active user."""
    user, username = get_current_user_data()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    data = request.get_json(silent=True) or {}
    current_pass = str(data.get('currentPassword', ''))
    new_pass = str(data.get('newPassword', ''))

    if not current_pass or not new_pass:
        return jsonify({"success": False, "error": "Current and new passwords are required."}), 400

    if len(new_pass) < 4:
        return jsonify({"success": False, "error": "New password must be at least 4 characters long."}), 400

    users = load_users()
    target_user = users.get(username)

    if not target_user or not check_password_hash(target_user.get('passwordHash', ''), current_pass):
        return jsonify({"success": False, "error": "Incorrect current password."}), 400

    target_user['passwordHash'] = generate_password_hash(new_pass)
    save_users(users)
    return jsonify({"success": True, "message": "Password changed successfully."}), 200


@app.route('/api/auth/users', methods=['GET'])
def api_auth_list_users():
    """Admin-only: Lists all registered accounts."""
    user, username = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "error": "Access denied. Administrator privileges required."}), 403

    users = load_users()
    user_list = [sanitize_user(u) for u in users.values()]
    return jsonify({"success": True, "users": user_list}), 200


@app.route('/api/auth/create-user', methods=['POST'])
def api_auth_create_user():
    """Admin-only: Creates a new user or admin account with distinct starter watchlist."""
    user, username = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "error": "Access denied. Administrator privileges required."}), 403

    data = request.get_json(silent=True) or {}
    new_username = str(data.get('username', '')).strip().lower()
    new_password = str(data.get('password', '')).strip()
    display_name = str(data.get('displayName', '')).strip() or new_username
    email = str(data.get('email', '')).strip()
    role = str(data.get('role', 'user')).strip().lower()
    if role not in ('admin', 'user'):
        role = 'user'

    if not new_username or not new_password:
        return jsonify({"success": False, "error": "Username and initial password are required."}), 400

    if len(new_username) < 3:
        return jsonify({"success": False, "error": "Username must be at least 3 characters."}), 400

    users = load_users()
    if new_username in users:
        return jsonify({"success": False, "error": f"Username '{new_username}' already exists."}), 400

    # Distinct starter watchlist for standard users
    starter_watchlist = ["AAPL", "NVDA"] if role == 'user' else list(DEFAULT_WATCHLIST)

    users[new_username] = {
        "username": new_username,
        "passwordHash": generate_password_hash(new_password),
        "role": role,
        "displayName": display_name,
        "email": email,
        "avatar": "user",
        "riskProfile": "Balanced",
        "baseCurrency": "USD",
        "theme": "dark",
        "createdAt": datetime.now().isoformat(),
        "watchlist": starter_watchlist,
        "alerts": [],
        "aiSettings": {
            "apiKey": "",
            "model": "gemini-3.7-flash"
        }
    }
    save_users(users)
    return jsonify({
        "success": True,
        "message": f"Account '{new_username}' ({role.upper()}) created successfully.",
        "user": sanitize_user(users[new_username])
    }), 201


@app.route('/api/auth/users/<target_username>', methods=['DELETE'])
def api_auth_delete_user(target_username):
    """Admin-only: Deletes a user account."""
    user, username = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "error": "Access denied. Administrator privileges required."}), 403

    target_clean = str(target_username).strip().lower()
    if target_clean == username:
        return jsonify({"success": False, "error": "Cannot delete your own active administrator account."}), 400

    users = load_users()
    if target_clean not in users:
        return jsonify({"success": False, "error": "Target user not found."}), 404

    del users[target_clean]
    save_users(users)
    return jsonify({"success": True, "message": f"User '{target_clean}' deleted successfully."}), 200


# =============================================================
# WATCHLIST & ALERTS (PER-USER STORAGE INTEGRATION)
# =============================================================

@app.route('/api/watchlist', methods=['GET', 'POST'])
def api_watchlist():
    """Permanent watchlist endpoint with strict per-user isolation."""
    user, username = get_current_user_data()
    users = load_users()

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        tickers = data.get('tickers', [])
        cleaned = [str(t).strip().upper() for t in tickers if str(t).strip()]

        if user and username in users:
            users[username]['watchlist'] = cleaned
            save_users(users)
        else:
            with open(WATCHLIST_FILE, 'w', encoding='utf-8') as f:
                json.dump(cleaned, f, indent=2)

        return jsonify({"success": True, "tickers": cleaned}), 200

    # GET request
    if user and username in users:
        user_wl = users[username].get('watchlist')
        if user_wl is not None:
            return jsonify({"success": True, "tickers": user_wl}), 200

    if os.path.exists(WATCHLIST_FILE):
        try:
            with open(WATCHLIST_FILE, 'r', encoding='utf-8') as f:
                tickers = json.load(f)
                return jsonify({"success": True, "tickers": tickers}), 200
        except Exception:
            pass

    return jsonify({"success": True, "tickers": DEFAULT_WATCHLIST}), 200


@app.route('/api/alerts', methods=['GET', 'POST'])
def api_alerts():
    """Endpoint for signal change alert configurations with per-user isolation."""
    user, username = get_current_user_data()
    users = load_users()

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        
        if user and username in users:
            alerts = users[username].get('alerts', [])
        else:
            alerts = []
            if os.path.exists(ALERTS_FILE):
                try:
                    with open(ALERTS_FILE, 'r', encoding='utf-8') as f:
                        alerts = json.load(f)
                except Exception:
                    alerts = []

        new_alert = {
            "id": f"alert-{int(datetime.now().timestamp() * 1000)}",
            "ticker": str(data.get('ticker', 'NVDA')).strip().upper(),
            "signalType": data.get('signalType', 'supertrend_bull'),
            "signalName": data.get('signalName', 'SuperTrend Bullish Flip'),
            "category": data.get('category', 'Trend & Volatility'),
            "condition": data.get('condition', 'direction_flip'),
            "threshold": data.get('threshold', 'Uptrend Confirmation'),
            "channel": data.get('channel', 'Telegram Bot'),
            "channelTarget": data.get('channelTarget', '@quant_trader'),
            "active": True,
            "createdAt": datetime.now().isoformat()
        }
        alerts.insert(0, new_alert)

        if user and username in users:
            users[username]['alerts'] = alerts
            save_users(users)
        else:
            with open(ALERTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(alerts, f, indent=2)

        return jsonify({"success": True, "alert": new_alert, "alerts": alerts}), 201

    # GET
    if user and username in users:
        return jsonify({"success": True, "alerts": users[username].get('alerts', [])}), 200

    if os.path.exists(ALERTS_FILE):
        try:
            with open(ALERTS_FILE, 'r', encoding='utf-8') as f:
                alerts = json.load(f)
                return jsonify({"success": True, "alerts": alerts}), 200
        except Exception:
            pass
    return jsonify({"success": True, "alerts": []}), 200


@app.route('/api/alerts/<alert_id>', methods=['DELETE', 'PATCH'])
def api_alert_item(alert_id):
    """Toggle or delete a signal alert rule with per-user isolation."""
    user, username = get_current_user_data()
    users = load_users()

    if user and username in users:
        alerts = users[username].get('alerts', [])
        if request.method == 'DELETE':
            alerts = [a for a in alerts if a.get('id') != alert_id]
            users[username]['alerts'] = alerts
            save_users(users)
            return jsonify({"success": True, "alerts": alerts}), 200

        if request.method == 'PATCH':
            data = request.get_json(silent=True) or {}
            for a in alerts:
                if a.get('id') == alert_id:
                    if 'active' in data:
                        a['active'] = bool(data['active'])
                    break
            users[username]['alerts'] = alerts
            save_users(users)
            return jsonify({"success": True, "alerts": alerts}), 200

    if not os.path.exists(ALERTS_FILE):
        return jsonify({"error": "Alerts store not found"}), 404
    try:
        with open(ALERTS_FILE, 'r', encoding='utf-8') as f:
            alerts = json.load(f)
        
        if request.method == 'DELETE':
            alerts = [a for a in alerts if a.get('id') != alert_id]
            with open(ALERTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(alerts, f, indent=2)
            return jsonify({"success": True, "alerts": alerts}), 200

        if request.method == 'PATCH':
            data = request.get_json(silent=True) or {}
            for a in alerts:
                if a.get('id') == alert_id:
                    if 'active' in data:
                        a['active'] = bool(data['active'])
                    break
            with open(ALERTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(alerts, f, indent=2)
            return jsonify({"success": True, "alerts": alerts}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/alerts/test-trigger', methods=['POST'])
def api_test_trigger_alert():
    """Generates a triggered notification simulation for a signal rule, including full news text and links for news catalysts."""
    data = request.get_json(silent=True) or {}
    ticker = data.get('ticker', 'NVDA')
    signal_name = data.get('signalName') or data.get('signalType', 'SuperTrend Bullish Flip')
    threshold = data.get('threshold', 'Trigger Level Reached')
    channel = data.get('channel', 'Telegram Bot')
    channel_target = data.get('channelTarget', '@quant_desk')
    category = data.get('category', 'Technical')
    
    is_news = 'news' in str(signal_name).lower() or category == 'News & Catalyst'
    news_headline = data.get('newsHeadline')
    news_summary = data.get('newsSummary')
    news_publisher = data.get('newsPublisher')
    news_url = data.get('newsUrl')
    
    if is_news and not news_headline:
        try:
            from services.stock_service import stock_service
            raw_news = stock_service.fetch_stock_news(ticker, limit=3)
            if raw_news and len(raw_news) > 0:
                top_art = raw_news[0]
                news_headline = top_art.get('title')
                news_summary = top_art.get('summary') or news_headline
                news_publisher = top_art.get('publisher') or 'Financial Wire'
                news_url = top_art.get('url') or '#'
        except Exception:
            pass

    if is_news and news_headline:
        message = f"📰 BREAKING CATALYST WIRE ({news_publisher}): \"{news_headline}\"\n\n{news_summary or 'Real-time breaking market catalyst and corporate filing.'}\n\n🔗 Direct Link: {news_url}"
    else:
        message = f"Quantitative Multi-Factor Engine triggered condition [{threshold}] for {ticker}. Algorithmic momentum, volume-weighted metrics, and volatility bands indicate actionable execution bias."

    mock_notification = {
        "id": f"msg-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "ticker": ticker,
        "signalType": signal_name,
        "category": category,
        "channel": channel,
        "channelTarget": channel_target,
        "title": f"🚨 {ticker} Signal Triggered: {signal_name}",
        "message": message,
        "newsHeadline": news_headline,
        "newsSummary": news_summary,
        "newsPublisher": news_publisher,
        "newsUrl": news_url,
        "status": "Delivered"
    }
    return jsonify({"success": True, "notification": mock_notification}), 200


if __name__ == '__main__':
    load_users()
    app.run(debug=True, host='0.0.0.0', port=5000)

