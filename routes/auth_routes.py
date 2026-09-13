from datetime import datetime
from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from routes.helpers import (
    load_users, save_users, get_current_user_data_from_session,
    sanitize_user, DEFAULT_WATCHLIST
)

auth_bp = Blueprint('auth', __name__)


def get_current_user_data():
    return get_current_user_data_from_session(session)


@auth_bp.route('/api/auth/login', methods=['POST'])
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


@auth_bp.route('/api/auth/logout', methods=['POST'])
def api_auth_logout():
    """Terminates the active session."""
    session.pop('username', None)
    return jsonify({"success": True, "message": "Successfully logged out."}), 200


@auth_bp.route('/api/auth/user', methods=['GET'])
def api_auth_current_user():
    """Retrieves current session user state."""
    user, username = get_current_user_data()
    if not user:
        return jsonify({"authenticated": False, "user": None}), 200
    return jsonify({"authenticated": True, "user": sanitize_user(user)}), 200


@auth_bp.route('/api/auth/update-profile', methods=['POST'])
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
    if 'language' in data and str(data['language']).strip():
        target_user['language'] = str(data['language']).strip().lower()
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


@auth_bp.route('/api/auth/update-theme', methods=['POST'])
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


@auth_bp.route('/api/auth/update-ai-settings', methods=['POST'])
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


@auth_bp.route('/api/auth/change-password', methods=['POST'])
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


@auth_bp.route('/api/auth/users', methods=['GET'])
def api_auth_list_users():
    """Admin-only: Lists all registered accounts."""
    user, username = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "error": "Access denied. Administrator privileges required."}), 403

    users = load_users()
    user_list = [sanitize_user(u) for u in users.values()]
    return jsonify({"success": True, "users": user_list}), 200


@auth_bp.route('/api/auth/create-user', methods=['POST'])
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
        "language": "en",
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


@auth_bp.route('/api/auth/users/<target_username>', methods=['DELETE'])
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
