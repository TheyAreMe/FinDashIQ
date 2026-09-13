from flask import Blueprint, jsonify, request, session
from services.stock_service import stock_service
from services.ai_service import ai_service
from services.scanner_service import ScannerService
from routes.helpers import get_current_user_data_from_session, DEFAULT_WATCHLIST

scanner_bp = Blueprint('scanner', __name__)
scanner_service = ScannerService(stock_service, ai_service)


def get_current_user_data():
    return get_current_user_data_from_session(session)


@scanner_bp.route('/api/scanner/cached', methods=['GET'])
def api_scanner_cached():
    """Returns previously saved scanner opportunities from warm cache with live timing metrics."""
    user, _ = get_current_user_data()
    cached_data = scanner_service.get_cached_scanner_results()
    if cached_data:
        cached_data['isAdmin'] = bool(user and user.get('role') == 'admin')
        return jsonify(cached_data), 200
    return jsonify({"success": False, "message": "No cached scan found."}), 404


@scanner_bp.route('/api/scanner/status', methods=['GET'])
def api_scanner_status():
    """Returns live status, interval countdown, and health of the background scanner engine."""
    user, _ = get_current_user_data()
    status = scanner_service.get_scanner_status()
    status['isAdmin'] = bool(user and user.get('role') == 'admin')
    return jsonify(status), 200


@scanner_bp.route('/api/scanner/universe', methods=['GET'])
def api_scanner_universe():
    """Returns metadata about the scanner asset universe, sectors, and themes."""
    meta = scanner_service.get_universe_metadata()
    return jsonify({"success": True, "data": meta}), 200


@scanner_bp.route('/api/scanner/universe/add', methods=['POST'])
def api_scanner_universe_add():
    """Dynamically adds a new stock to the monitoring universe with duplicate crosscheck."""
    user, _ = get_current_user_data()
    data = request.get_json(silent=True) or {}
    ticker = str(data.get('ticker', '')).strip().upper()
    if not ticker:
        return jsonify({"success": False, "message": "Ticker symbol is required."}), 400

    user_role = user.get('role', 'user') if user else 'user'
    result = scanner_service.add_stock_to_universe(ticker, user_role=user_role)
    if not result.get('success'):
        status_code = 409 if "already in monitoring universe" in str(result.get('error', '')) else 400
        return jsonify({"success": False, "message": result.get('error')}), status_code

    return jsonify({
        "success": True,
        "message": result.get('message'),
        "item": result.get('item'),
        "totalUniverse": result.get('totalUniverse')
    }), 200


@scanner_bp.route('/api/scanner/config', methods=['POST'])
def api_scanner_config():
    """Admin-only endpoint to configure background scan interval from web interface."""
    user, _ = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "message": "Administrator privileges required to change scan interval."}), 403

    data = request.get_json(silent=True) or {}
    interval_mins = data.get('intervalMinutes')
    if interval_mins is None:
        return jsonify({"success": False, "message": "intervalMinutes parameter is required."}), 400

    try:
        interval_mins = int(interval_mins)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "intervalMinutes must be a valid integer."}), 400

    result = scanner_service.update_scan_interval(interval_mins)
    return jsonify(result), 200


@scanner_bp.route('/api/scanner/force-update', methods=['POST'])
def api_scanner_force_update():
    """Admin-only: Asynchronously triggers an immediate background scan cycle."""
    user, _ = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "message": "Administrator privileges required to force update."}), 403

    scanner_service.trigger_async_scan()
    return jsonify({
        "success": True,
        "message": "Background scan started, fresh data will be ready in ~5s.",
        "isScanning": True
    }), 200


@scanner_bp.route('/api/scanner/baskets/markets', methods=['GET'])
def api_scanner_market_baskets():
    """Returns top 5 highest-conviction scoring assets across each regional market."""
    baskets = scanner_service.get_top_market_baskets()
    return jsonify({"success": True, "baskets": baskets}), 200


@scanner_bp.route('/api/scanner/baskets/etf', methods=['GET'])
def api_scanner_etf_baskets():
    """Returns top 5 highest-conviction holdings inside a benchmark ETF/index."""
    etf_symbol = request.args.get('etf', 'SPY')
    opps = scanner_service.get_top_etf_baskets(etf_symbol)
    return jsonify({"success": True, "etf": etf_symbol, "opportunities": opps}), 200


@scanner_bp.route('/api/scanner/run', methods=['POST'])
def api_scanner_run():
    """Executes sub-1ms in-memory filtering across the precalculated opportunity matrix."""
    data = request.get_json(silent=True) or {}
    market = str(data.get('market', 'all')).strip()
    strategy = str(data.get('strategy', 'all')).strip()
    etf_basket = str(data.get('etfBasket', 'all')).strip()
    sector = str(data.get('sector', 'all')).strip()
    theme = str(data.get('theme', 'all')).strip()
    market_cap = str(data.get('marketCap', 'all')).strip()
    min_conviction = int(data.get('minConviction', 85))
    exclude_watchlist = bool(data.get('excludeWatchlist', True))
    required_indicators = data.get('requiredIndicators', [])
    force_refresh = bool(data.get('forceRefresh', False))
    limit = int(data.get('limit', 24))

    user, _ = get_current_user_data()
    user_wl = user.get('watchlist', list(DEFAULT_WATCHLIST)) if user else list(DEFAULT_WATCHLIST)

    if force_refresh:
        if not user or user.get('role') != 'admin':
            return jsonify({"success": False, "message": "Administrator privileges required to force update."}), 403
        scanner_service.trigger_async_scan()

    results = scanner_service.scan_opportunities(
        market=market,
        strategy=strategy,
        etf_basket=etf_basket,
        sector=sector,
        theme=theme,
        market_cap=market_cap,
        min_conviction=min_conviction,
        exclude_watchlist=exclude_watchlist,
        user_watchlist=user_wl,
        required_indicators=required_indicators,
        force_refresh=False,
        limit=limit
    )

    results['isAdmin'] = bool(user and user.get('role') == 'admin')
    return jsonify(results), 200
