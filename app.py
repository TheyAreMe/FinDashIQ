import os
import sys

# Enforce MALLOC_ARENA_MAX=2 early on Linux to eliminate glibc multi-threaded memory fragmentation
if "MALLOC_ARENA_MAX" not in os.environ:
    os.environ["MALLOC_ARENA_MAX"] = "2"

if sys.platform.startswith('linux'):
    try:
        import ctypes
        libc = ctypes.CDLL('libc.so.6')
        libc.mallopt(-8, 2)
    except Exception:
        pass

import gzip
import secrets
from collections import OrderedDict
from datetime import timedelta

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

from flask import Flask, Response, g, jsonify, render_template, request, send_from_directory, session
from werkzeug.middleware.proxy_fix import ProxyFix
from services.update_service import APP_VERSION
from services.security_service import (
    ensure_csrf_token,
    get_app_secret_key,
    rate_limiter,
    validate_csrf,
)
from routes import register_blueprints
from routes.helpers import (
    DATA_DIR,
    get_current_user_data_from_session,
    load_users,
    sanitize_user,
)


def _load_dotenv_if_present():
    """Optional zero-dependency .env file loader fallback."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k, v = k.strip(), v.strip().strip('"').strip("'")
                        if k:
                            os.environ[k] = v
        except Exception:
            pass


_load_dotenv_if_present()


def _build_demo_showcase_payload() -> dict:
    """Builds a deterministic, read-only multi-asset showcase dataset for unauthenticated demo mode."""
    from datetime import datetime, timedelta as _td

    specs = [
        ("NVDA", "NVIDIA Corporation", "Technology / Semiconductors", 142.80, 3.15, 2.26, 86.0, "Strong Bullish", "#10b981", "badge-bullish", 4.10, 0.145, 72.0),
        ("MSFT", "Microsoft Corporation", "Technology / Cloud & AI", 448.20, 4.90, 1.11, 78.0, "Bullish", "#10b981", "badge-bullish", 6.20, 0.088, 66.0),
        ("ASML", "ASML Holding N.V.", "Semiconductor Equipment", 764.50, -5.40, -0.70, 58.0, "Neutral / Constructive", "#38bdf8", "badge-neutral", 14.50, 0.012, 54.0),
        ("TSM", "Taiwan Semiconductor Mfg.", "Foundry & Silicon", 198.40, 2.85, 1.46, 82.0, "Strong Bullish", "#10b981", "badge-bullish", 4.65, 0.112, 69.0),
    ]
    base_date = datetime(2026, 10, 10)
    stocks = {}
    for idx, (sym, name, sector, price, chg, chg_pct, conv, bias, color, badge, atr, cmf, rsi) in enumerate(specs):
        series = []
        start_p = price * (0.91 if chg >= 0 else 1.03)
        for day_i in range(30):
            dt_str = (base_date + _td(days=day_i)).strftime("%Y-%m-%d")
            frac = day_i / 29.0
            drift = start_p + (price - start_p) * frac
            wave = (((day_i * (idx + 3)) % 5) - 2) * (atr * 0.22)
            close_p = round(price if day_i == 29 else max(1.0, drift + wave), 2)
            open_p = round(close_p - (chg * 0.35 if day_i == 29 else wave * 0.4), 2)
            high_p = round(max(open_p, close_p) + atr * 0.45, 2)
            low_p = round(min(open_p, close_p) - atr * 0.42, 2)
            series.append({
                "time": dt_str,
                "date": dt_str,
                "open": open_p,
                "high": high_p,
                "low": low_p,
                "close": close_p,
                "volume": int(28_500_000 + (day_i * 650_000) + idx * 3_100_000),
            })

        vwap = round(price - (atr * 0.32 if chg >= 0 else -atr * 0.28), 2)
        sl = round(price - 1.75 * atr, 2)
        t1 = round(price + 1.5 * atr, 2)
        t2 = round(price + 3.0 * atr, 2)
        st_status = "bullish" if conv >= 60 else "bearish"
        signals = {
            "overall": "Strong Buy" if conv >= 80 else ("Buy" if conv >= 65 else "Neutral"),
            "bullishCount": 6 if conv >= 65 else 3,
            "bearishCount": 1 if conv >= 65 else 3,
            "neutralCount": 1,
            "score": int(conv),
            "indicators": {
                "RSI": {"value": rsi, "signal": "Bullish" if rsi < 70 and rsi >= 50 else "Overbought", "status": "bullish" if conv >= 60 else "neutral"},
                "MACD": {"value": round(atr * 0.45, 2), "hist": round(atr * 0.18, 2), "signal": "Bullish Crossover" if conv >= 60 else "Consolidating", "status": "bullish" if conv >= 60 else "neutral"},
                "Stochastic": {"value": round(min(88.0, rsi + 7.5), 1), "signal": "Momentum Up" if conv >= 60 else "Neutral", "status": "bullish" if conv >= 60 else "neutral"},
                "SuperTrend": {"value": sl, "signal": "Buy Trend" if st_status == "bullish" else "Resistance", "status": st_status},
            },
        }
        confluence_score = round(83.3 if conv >= 75 else (66.7 if conv >= 60 else 50.0), 1)
        aligned = 5 if conv >= 75 else (4 if conv >= 60 else 3)
        stocks[sym] = {
            "profile": {
                "ticker": sym,
                "name": name,
                "sector": sector,
                "currency": "USD",
                "currentPrice": price,
                "change": chg,
                "changePercent": chg_pct,
                "dayLow": round(price - atr * 0.55, 2),
                "dayHigh": round(price + atr * 0.6, 2),
                "fiftyTwoWeekLow": round(price * 0.64, 2),
                "fiftyTwoWeekHigh": round(price * 1.12, 2),
                "marketCap": (3.4e12 if sym == "NVDA" else (3.1e12 if sym == "MSFT" else 3.2e11)),
                "peRatio": 42.5 if sym == "NVDA" else 33.1,
                "forwardPE": 31.2 if sym == "NVDA" else 28.4,
                "beta": 1.38 if sym == "NVDA" else 1.05,
                "dividendYield": 0.03 if sym == "NVDA" else 0.72,
                "atr": atr,
                "vwap": vwap,
                "cmf": cmf,
                "volume": 39_200_000,
                "avgVolume": 34_800_000,
            },
            "signals": signals,
            "timeseries": series,
            "aiAnalysis": {
                "ticker": sym,
                "companyName": name,
                "convictionScore": conv,
                "directionalBias": bias,
                "stanceColor": color,
                "badgeClass": badge,
                "confluence": {
                    "score": confluence_score,
                    "direction": "Bullish" if conv >= 60 else "Mixed",
                    "tier": "High Confluence" if confluence_score >= 72 else "Moderate Confluence",
                    "alignedCount": aligned,
                    "totalOscillators": 6,
                    "badgeLabel": f"{aligned}/6 {'Bullish' if conv >= 60 else 'Mixed'}",
                },
                "executiveThesis": (
                    f"**Showcase Preview — {name} ({sym})**: Trading at **${price:.2f}** ({chg_pct:+.2f}%), "
                    f"with an AI Conviction Score of **{conv:.0f}% ({bias})** supported by {aligned}/6 technical confluence "
                    f"and CMF capital flow of **{cmf:+.3f}**.\n\n"
                    f"Sign in to run live Yahoo Finance market refreshes, save private watchlists, configure alerts, "
                    f"and stream multi-provider AI answers (Gemini 4, Claude, GPT-6)."
                ),
                "catalysts": [
                    f"SuperTrend support holding cleanly near ${sl:.2f} with institutional VWAP at ${vwap:.2f}.",
                    f"Multi-oscillator confluence ({aligned}/6) confirms trend alignment.",
                ],
                "risks": [
                    f"Daily close below ${sl:.2f} invalidates short-term momentum structure.",
                ],
                "aiMeta": {"provider": "builtin", "model": "demo-showcase", "enhanced": False},
                "tradeLevels": {
                    "entryZone": f"${round(price - 0.5 * atr, 2)} - ${price:.2f}",
                    "entryLow": round(price - 0.5 * atr, 2),
                    "entryHigh": price,
                    "currentPrice": price,
                    "stopLoss": sl,
                    "target1": t1,
                    "target2": t2,
                    "riskRewardRatio": "1.7:1",
                },
                "scenario30d": {
                    "bullCase": {"target": round(price * 1.09, 2), "probability": 60, "returnPct": 9.0},
                    "baseCase": {"target": round(price * 1.02, 2), "probability": 25, "returnPct": 2.0},
                    "bearCase": {"target": round(price * 0.93, 2), "probability": 15, "returnPct": -7.0},
                },
            },
            "backtests": {
                "quant": {
                    "strategyReturnPct": 24.6 if conv >= 65 else 11.4,
                    "buyHoldReturnPct": 16.2 if conv >= 65 else 9.1,
                    "alpha": 8.4 if conv >= 65 else 2.3,
                    "winRatePct": 68.0 if conv >= 65 else 54.5,
                    "profitFactor": 2.15 if conv >= 65 else 1.38,
                    "maxDrawdownPct": 7.8,
                    "totalTrades": 11,
                    "winningTrades": 7,
                    "losingTrades": 4,
                    "isCurrentlyHolding": True,
                }
            },
            "news": [
                {
                    "title": f"{name} Institutional Positioning & AI Infrastructure Demand Update",
                    "publisher": "FinDashIQ Demo Wire",
                    "link": "#",
                    "published": "Demo Showcase",
                    "sentiment": "bullish" if conv >= 65 else "neutral",
                }
            ],
        }
    return {
        "success": True,
        "demoMode": True,
        "tickers": list(stocks.keys()),
        "stocks": stocks,
        "note": "Read-only sample showcase dataset. Sign in to unlock live market feeds and personalized AI Copilot.",
    }


def create_app() -> Flask:
    """Application factory for FinDashIQ."""
    app = Flask(__name__, template_folder='templates')
    app.secret_key = get_app_secret_key(DATA_DIR)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH_MB', '10')) * 1024 * 1024
    if os.environ.get('SESSION_COOKIE_SECURE', '').lower() in ('true', '1', 'yes'):
        app.config['SESSION_COOKIE_SECURE'] = True

    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1, x_prefix=1)

    _STATIC_GZIP_CACHE: OrderedDict[tuple, bytes] = OrderedDict()

    @app.before_request
    def security_and_rate_limit_guard():
        """Generates per-request CSP nonce and enforces API CSRF & sliding-window rate limits."""
        g.csp_nonce = secrets.token_urlsafe(16)

        if request.path.startswith('/api/'):
            client_ip = request.remote_addr or '127.0.0.1'
            limit_spec = None
            if request.path == '/api/auth/login' and request.method == 'POST':
                limit_spec = ('auth_login', 30, 60)
            elif request.path in ('/api/ai-chat', '/api/ai-chat/stream') and request.method == 'POST':
                limit_spec = ('ai_chat', 25, 60)
            elif request.path == '/api/analyze' and request.method == 'POST':
                limit_spec = ('analyze', 60, 60)
            elif request.path == '/api/alerts/test-trigger' and request.method == 'POST':
                limit_spec = ('alert_test', 10, 60)
            elif request.path == '/api/i18n/translate' and request.method == 'POST':
                limit_spec = ('i18n_translate', 25, 60)

            if limit_spec:
                bucket, lim, win = limit_spec
                allowed, retry_after = rate_limiter.check(bucket, client_ip, lim, win)
                if not allowed:
                    resp = jsonify({
                        'success': False,
                        'error': f'Rate limit exceeded for {bucket}. Please retry in {retry_after}s.',
                        'retryAfter': retry_after,
                    })
                    resp.status_code = 429
                    resp.headers['Retry-After'] = str(retry_after)
                    return resp

            # Enforce CSRF token + same-origin check on mutating API calls for authenticated sessions
            if request.method in ('POST', 'PUT', 'PATCH', 'DELETE') and request.path != '/api/auth/login':
                if session.get('username'):
                    csrf_ok, csrf_err = validate_csrf(request, session)
                    if not csrf_ok:
                        return jsonify({'success': False, 'error': csrf_err}), 403

    @app.context_processor
    def inject_asset_version():
        """Injects static asset version, bundle toggle, CSRF token, and CSP nonce into templates."""
        static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
        js_mtime = APP_VERSION
        try:
            mtimes = []
            for sub in ('js', 'css', 'dist'):
                sub_dir = os.path.join(static_dir, sub)
                if os.path.isdir(sub_dir):
                    for root, _, files in os.walk(sub_dir):
                        for fname in files:
                            if fname.endswith(('.js', '.css')):
                                mtimes.append(int(os.path.getmtime(os.path.join(root, fname))))
            max_m = max(mtimes) if mtimes else 0
            js_mtime = f"{APP_VERSION}-{max_m}"
        except Exception:
            pass

        dist_css = os.path.join(static_dir, 'dist', 'style.min.css')
        dist_js = os.path.join(static_dir, 'dist', 'app.bundle.min.js')
        bundle_env = os.environ.get('USE_ASSET_BUNDLE', '1').lower() not in ('0', 'false', 'no')
        use_asset_bundle = bundle_env and os.path.isfile(dist_css) and os.path.isfile(dist_js)

        return {
            'asset_version': js_mtime,
            'app_version': APP_VERSION,
            'csrf_token': ensure_csrf_token(session),
            'csp_nonce': getattr(g, 'csp_nonce', ''),
            'turnstile_site_key': os.environ.get('TURNSTILE_SITE_KEY', '').strip(),
            'use_asset_bundle': use_asset_bundle,
        }

    _req_counter = 0

    @app.after_request
    def apply_security_and_performance_headers(response):
        """Applies institutional security headers, caching policies, and cached gzip compression."""
        is_https = request.is_secure or request.headers.get('X-Forwarded-Proto', '').lower() == 'https'
        if is_https:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

        nonce = getattr(g, 'csp_nonce', '')
        nonce_token = f"'nonce-{nonce}' " if nonce else ""
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://challenges.cloudflare.com https://storage.ko-fi.com https://cdnjs.buymeacoffee.com https://www.buymeacoffee.com; "
            f"script-src-elem 'self' {nonce_token}https://unpkg.com https://cdn.jsdelivr.net https://challenges.cloudflare.com https://storage.ko-fi.com https://cdnjs.buymeacoffee.com https://www.buymeacoffee.com; "
            "script-src-attr 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: blob: https://cdn.buymeacoffee.com https://storage.ko-fi.com https://ko-fi.com; "
            "frame-src 'self' https://challenges.cloudflare.com https://ko-fi.com https://storage.ko-fi.com https://www.buymeacoffee.com https://buymeacoffee.com; "
            "connect-src 'self' https://challenges.cloudflare.com https://ko-fi.com https://www.buymeacoffee.com; "
            "frame-ancestors 'self'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        response.headers['Content-Security-Policy'] = csp_policy
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), payment=(), usb=()'
        response.headers['X-XSS-Protection'] = '0'

        if request.path == '/sw.js':
            response.headers['Cache-Control'] = 'no-cache, must-revalidate'
            response.headers['Service-Worker-Allowed'] = '/'
        elif request.path == '/manifest.json':
            response.headers['Cache-Control'] = 'public, max-age=3600'
        elif request.path.startswith('/static/') or request.path in ('/favicon.ico', '/favicon.svg'):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        elif request.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'

        accept_encoding = request.headers.get('Accept-Encoding', '')
        content_type = response.headers.get('Content-Type', '').lower()
        if (
            'gzip' in accept_encoding
            and response.status_code == 200
            and 'Content-Encoding' not in response.headers
            and 'text/event-stream' not in content_type
            and any(ct in content_type for ct in (
                'text/', 'application/javascript', 'application/json',
                'application/manifest+json', 'image/svg+xml', 'application/xml'
            ))
        ):
            if response.direct_passthrough:
                response.direct_passthrough = False
            response_data = response.get_data()
            if len(response_data) >= 300:
                compressed_data = None
                cache_key = None
                if request.path.startswith('/static/'):
                    cache_key = (
                        request.path,
                        len(response_data),
                        response.headers.get('ETag', ''),
                        response.headers.get('Last-Modified', ''),
                    )
                    compressed_data = _STATIC_GZIP_CACHE.get(cache_key)
                    if compressed_data is not None:
                        _STATIC_GZIP_CACHE.move_to_end(cache_key)

                if compressed_data is None:
                    compressed_data = gzip.compress(response_data, compresslevel=6)
                    if cache_key is not None:
                        _STATIC_GZIP_CACHE[cache_key] = compressed_data
                        if len(_STATIC_GZIP_CACHE) > 128:
                            _STATIC_GZIP_CACHE.popitem(last=False)

                response.set_data(compressed_data)
                response.headers['Content-Encoding'] = 'gzip'
                response.headers['Content-Length'] = len(compressed_data)
                response.headers['Vary'] = 'Accept-Encoding'

        # Memory watchdog & periodic trim fallback (protects even if Gunicorn was invoked without gunicorn.conf.py)
        nonlocal _req_counter
        _req_counter += 1
        if _req_counter % 20 == 0 and sys.platform.startswith('linux'):
            try:
                from services.cache_utils import collect_garbage
                collect_garbage("FlaskAfterRequest")
                from services.maintenance_service import maintenance_service
                if maintenance_service.is_gunicorn_running():
                    rss = maintenance_service.get_process_rss_mb()
                    max_allowed = float(os.environ.get("GUNICORN_MAX_WORKER_MEMORY_MB", "260"))
                    if rss > max_allowed or _req_counter >= 150:
                        import signal
                        import logging
                        logging.getLogger('FinDashIQ').info(
                            f"[Flask Memory Watchdog] Worker PID {os.getpid()} reached {rss} MB (limit: {max_allowed} MB, reqs: {_req_counter}). Gracefully retiring worker."
                        )
                        os.kill(os.getpid(), signal.SIGTERM)
            except Exception:
                pass

        return response

    @app.route('/favicon.ico')
    @app.route('/static/favicon.ico')
    def favicon():
        """Serves the institutional SVG favicon."""
        return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.svg', mimetype='image/svg+xml')

    @app.route('/manifest.json')
    def pwa_manifest():
        """Serves the PWA Web App Manifest at root scope."""
        return send_from_directory(
            os.path.join(app.root_path, 'static'),
            'manifest.json',
            mimetype='application/manifest+json',
        )

    @app.route('/sw.js')
    def pwa_service_worker():
        """Serves the PWA Service Worker at root scope."""
        return send_from_directory(
            os.path.join(app.root_path, 'static'),
            'sw.js',
            mimetype='application/javascript',
        )

    @app.route('/api/demo/showcase', methods=['GET'])
    def api_demo_showcase():
        """Read-only sample showcase dataset for unauthenticated Live Demo exploration."""
        return jsonify(_build_demo_showcase_payload()), 200

    @app.route('/')
    def index():
        """Renders the modern dynamic stock analysis and AI intelligence dashboard."""
        user, _ = get_current_user_data_from_session(session)
        is_authenticated = bool(user)
        return render_template(
            'index.html',
            is_authenticated=is_authenticated,
            user=sanitize_user(user) if user else None
        )

    # Register modular blueprints
    register_blueprints(app)

    return app


app = create_app()

if __name__ == '__main__':
    load_users()
    debug_mode = os.environ.get('FLASK_DEBUG', '0').lower() in ('1', 'true', 'yes')
    port = int(os.environ.get('PORT', '5000'))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
