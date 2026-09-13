import os

# Enforce MALLOC_ARENA_MAX=2 early on Linux to eliminate glibc multi-threaded memory fragmentation
if "MALLOC_ARENA_MAX" not in os.environ:
    os.environ["MALLOC_ARENA_MAX"] = "2"

import gzip
from datetime import timedelta

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

from flask import Flask, render_template, send_from_directory, request, session
from werkzeug.middleware.proxy_fix import ProxyFix
from services.update_service import APP_VERSION
from routes import register_blueprints
from routes.helpers import load_users, get_current_user_data_from_session, sanitize_user


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


def create_app() -> Flask:
    """Application factory for FinDashIQ."""
    app = Flask(__name__, template_folder='templates')
    app.secret_key = os.environ.get('SECRET_KEY', 'findashiq_enterprise_quant_key_2026_x89')
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000
    if os.environ.get('SESSION_COOKIE_SECURE', '').lower() in ('true', '1', 'yes'):
        app.config['SESSION_COOKIE_SECURE'] = True

    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1, x_prefix=1)

    @app.context_processor
    def inject_asset_version():
        """Injects static asset version and app version strings for automatic client cache busting."""
        js_mtime = APP_VERSION
        try:
            static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
            check_files = [
                os.path.join(static_dir, 'js', 'app.js'),
                os.path.join(static_dir, 'css', 'style.css'),
                os.path.join(static_dir, 'js', 'modules', 'scanner', 'scanner.js'),
                os.path.join(static_dir, 'js', 'modules', 'backtest', 'paper_trades.js'),
                os.path.join(static_dir, 'js', 'modules', 'auth', 'auth.js'),
                os.path.join(static_dir, 'js', 'modules', 'core', 'utils.js'),
            ]
            mtimes = [int(os.path.getmtime(p)) for p in check_files if os.path.exists(p)]
            max_m = max(mtimes) if mtimes else 0
            js_mtime = f"{APP_VERSION}-{max_m}"
        except Exception:
            pass
        return {
            'asset_version': js_mtime,
            'app_version': APP_VERSION
        }

    @app.after_request
    def apply_security_and_performance_headers(response):
        """Applies institutional security headers, caching policies, and gzip compression."""
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
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
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), payment=(), usb=()'
        response.headers['X-XSS-Protection'] = '0'

        if request.path.startswith('/static/') or request.path in ('/favicon.ico', '/favicon.svg'):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        elif request.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'

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
    app.run(debug=True, host='0.0.0.0', port=5000)
