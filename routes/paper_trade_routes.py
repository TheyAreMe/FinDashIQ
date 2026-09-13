import os
from datetime import datetime
from flask import Blueprint, jsonify, request, session
from routes.helpers import load_users, save_users, get_current_user_data_from_session

paper_trade_bp = Blueprint('paper_trade', __name__)


def get_current_user_data():
    return get_current_user_data_from_session(session)


@paper_trade_bp.route('/api/paper-trades', methods=['GET', 'POST'])
def api_paper_trades():
    """Permanent paper trades storage with user account isolation."""
    user, username = get_current_user_data()
    users = load_users()

    if not user or username not in users:
        return jsonify({"success": True, "trades": []}), 200

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        trade_id = data.get('id') or f"pt_{int(datetime.now().timestamp())}_{os.urandom(3).hex()}"
        data['id'] = trade_id
        if 'entryDate' not in data:
            data['entryDate'] = datetime.now().isoformat()
        if 'status' not in data:
            data['status'] = 'OPEN'

        if 'paperTrades' not in users[username]:
            users[username]['paperTrades'] = []
        existing_idx = next((i for i, t in enumerate(users[username]['paperTrades']) if t.get('id') == trade_id), None)
        if existing_idx is not None:
            users[username]['paperTrades'][existing_idx] = data
        else:
            users[username]['paperTrades'].append(data)
        save_users(users)
        return jsonify({"success": True, "trade": data, "trades": users[username]['paperTrades']}), 200

    # GET
    return jsonify({"success": True, "trades": users[username].get('paperTrades', [])}), 200


@paper_trade_bp.route('/api/paper-trades/<trade_id>', methods=['DELETE', 'PATCH'])
def api_modify_paper_trade(trade_id):
    """Closes, updates, or removes an active simulated paper trade."""
    user, username = get_current_user_data()
    users = load_users()

    def _modify_list(trades_list):
        if request.method == 'DELETE':
            return [t for t in trades_list if t.get('id') != trade_id]
        elif request.method == 'PATCH':
            patch_data = request.get_json(silent=True) or {}
            for t in trades_list:
                if t.get('id') == trade_id:
                    t.update(patch_data)
                    break
            return trades_list
        return trades_list

    if not user or username not in users:
        return jsonify({"success": False, "error": "Authentication required"}), 401

    trades = users[username].get('paperTrades', [])
    users[username]['paperTrades'] = _modify_list(trades)
    save_users(users)
    return jsonify({"success": True, "trades": users[username]['paperTrades']}), 200
