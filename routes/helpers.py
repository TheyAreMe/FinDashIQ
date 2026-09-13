import os
import json
from datetime import datetime
from werkzeug.security import generate_password_hash

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
WATCHLIST_FILE = os.path.join(DATA_DIR, 'watchlist.json')
ALERTS_FILE = os.path.join(DATA_DIR, 'alerts.json')

DEFAULT_WATCHLIST = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"]


def load_users() -> dict:
    """Loads all user accounts from disk, initializing default admin if not present."""
    os.makedirs(DATA_DIR, exist_ok=True)
    users = {}
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users = json.load(f)
        except Exception:
            users = {}

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
            "language": "en",
            "createdAt": datetime.now().isoformat(),
            "watchlist": list(DEFAULT_WATCHLIST),
            "watchlistViewMode": "cards",
            "alerts": [],
            "paperTrades": [],
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
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)


def get_current_user_data_from_session(session_dict: dict) -> tuple[dict | None, str | None]:
    """Helper to retrieve active session user object and username."""
    username = session_dict.get('username')
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
        "language": user.get("language", "en"),
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
