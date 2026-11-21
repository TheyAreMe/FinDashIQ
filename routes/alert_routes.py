from datetime import datetime
from flask import Blueprint, jsonify, request, session
from services.notification_service import notification_service
from routes.helpers import load_users, save_users, require_auth_json

alert_bp = Blueprint('alert', __name__)


@alert_bp.route('/api/alerts', methods=['GET', 'POST'])
def api_alerts():
    """Endpoint for signal change alert configurations with strict per-user auth & isolation."""
    user, username, err_resp = require_auth_json(session)
    if err_resp:
        return err_resp

    users = load_users()
    if username not in users:
        return jsonify({"success": False, "error": "User record not found."}), 404

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        alerts = list(users[username].get('alerts', []))

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
        users[username]['alerts'] = alerts
        save_users(users)
        return jsonify({"success": True, "alert": new_alert, "alerts": alerts}), 201

    return jsonify({"success": True, "alerts": users[username].get('alerts', [])}), 200


@alert_bp.route('/api/alerts/<alert_id>', methods=['DELETE', 'PATCH'])
def api_alert_item(alert_id):
    """Toggle or delete a signal alert rule with strict per-user auth & isolation."""
    user, username, err_resp = require_auth_json(session)
    if err_resp:
        return err_resp

    users = load_users()
    if username not in users:
        return jsonify({"success": False, "error": "User record not found."}), 404

    alerts = list(users[username].get('alerts', []))
    if request.method == 'DELETE':
        alerts = [a for a in alerts if a.get('id') != alert_id]
        users[username]['alerts'] = alerts
        save_users(users)
        return jsonify({"success": True, "alerts": alerts}), 200

    data = request.get_json(silent=True) or {}
    for a in alerts:
        if a.get('id') == alert_id:
            if 'active' in data:
                a['active'] = bool(data['active'])
            break
    users[username]['alerts'] = alerts
    save_users(users)
    return jsonify({"success": True, "alerts": alerts}), 200


@alert_bp.route('/api/alerts/test-trigger', methods=['POST'])
def api_test_trigger_alert():
    """Executes live or simulated notification dispatch across validated channels (Auth Required)."""
    _, _, err_resp = require_auth_json(session)
    if err_resp:
        return err_resp

    data = request.get_json(silent=True) or {}
    raw_ticker = str(data.get('ticker', 'NVDA')).strip().upper()
    is_global_watchlist = raw_ticker in ('*WATCHLIST*', 'WATCHLIST', 'ALL_WATCHLIST', 'PORTFOLIO')
    ticker = 'NVDA' if is_global_watchlist else raw_ticker

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

    if is_global_watchlist:
        title = f"🚨 [Portfolio Alert] {ticker} Triggered: {signal_name}"
    else:
        title = f"🚨 {ticker} Signal Triggered: {signal_name}"

    if is_news and news_headline:
        message = f"📰 BREAKING CATALYST WIRE ({news_publisher or 'Wire'}): \"{news_headline}\"\n\n{news_summary or 'Real-time breaking market catalyst and corporate filing.'}\n\n🔗 Direct Link: {news_url or '#'}"
    else:
        message = f"Quantitative Multi-Factor Engine triggered condition [{threshold}] for {ticker}. Algorithmic momentum, volume-weighted metrics, and volatility bands indicate actionable execution bias."

    dispatch_report = notification_service.dispatch_alert({
        "ticker": ticker,
        "isGlobalWatchlist": is_global_watchlist,
        "signalName": signal_name,
        "signalType": data.get('signalType', ''),
        "category": category,
        "condition": data.get('condition', ''),
        "threshold": threshold,
        "channel": channel,
        "channelTarget": channel_target,
        "title": title,
        "message": message,
        "newsHeadline": news_headline,
        "newsSummary": news_summary,
        "newsPublisher": news_publisher,
        "newsUrl": news_url,
        "metrics": data.get('metrics', {})
    })

    return jsonify({"success": True, "notification": dispatch_report}), 200
