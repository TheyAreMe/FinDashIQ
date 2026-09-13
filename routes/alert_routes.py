import json
import os
from datetime import datetime
from flask import Blueprint, jsonify, request, session
from services.notification_service import notification_service
from routes.helpers import (
    load_users, save_users, get_current_user_data_from_session, ALERTS_FILE
)

alert_bp = Blueprint('alert', __name__)


def get_current_user_data():
    return get_current_user_data_from_session(session)


@alert_bp.route('/api/alerts', methods=['GET', 'POST'])
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


@alert_bp.route('/api/alerts/<alert_id>', methods=['DELETE', 'PATCH'])
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


@alert_bp.route('/api/alerts/test-trigger', methods=['POST'])
def api_test_trigger_alert():
    """Executes live or simulated notification dispatch across configured channels."""
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
