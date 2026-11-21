import copy
import json
import logging
import os
import secrets
import threading
from datetime import datetime
from flask import jsonify
from werkzeug.security import generate_password_hash

from services.security_service import (
    decrypt_secret,
    encrypt_secret,
    mask_secret,
)

logger = logging.getLogger("FinDashIQ")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
WATCHLIST_FILE = os.path.join(DATA_DIR, "watchlist.json")
ALERTS_FILE = os.path.join(DATA_DIR, "alerts.json")

DEFAULT_WATCHLIST = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"]
DEFAULT_AI_PROVIDER = "gemini"
DEFAULT_AI_MODEL = "gemini-4-hydrogen"
SUPPORTED_AI_PROVIDERS = ("gemini", "anthropic", "openai")
_PROVIDER_DEFAULT_MODELS = {
    "gemini": "gemini-4-hydrogen",
    "anthropic": "claude-sonnet-5-5",
    "openai": "gpt-6.1-sol",
}

_USERS_LOCK = threading.RLock()
_USERS_CACHE: dict | None = None
_USERS_CACHE_MTIME: float | None = None
_USERS_CACHE_PATH: str | None = None


def _infer_ai_provider(provider: str = None, model: str = None) -> str:
    p = str(provider or "").strip().lower()
    if p in ("gemini", "google", "google-gemini"):
        return "gemini"
    if p in ("anthropic", "claude"):
        return "anthropic"
    if p in ("openai", "gpt"):
        return "openai"

    m = str(model or "").strip().lower()
    if m.startswith("claude"):
        return "anthropic"
    if m.startswith(("gpt-", "o1", "o3", "o4", "chatgpt")):
        return "openai"
    return DEFAULT_AI_PROVIDER


def normalize_ai_settings(
    raw: dict | None,
    existing: dict | None = None,
    secret_key: str | None = None,
    encrypt_keys: bool = False,
) -> dict:
    """
    Normalizes AI provider settings with backwards-compatibility for legacy
    {'apiKey': '...', 'model': 'gemini-3.7-flash'} records and optional Fernet encryption.
    """
    base = dict(existing) if isinstance(existing, dict) else {}
    src = dict(raw) if isinstance(raw, dict) else {}

    raw_model = str(src.get("model") or base.get("model") or "").strip()
    custom_model = str(
        src.get("customModel") if "customModel" in src else base.get("customModel", "")
    ).strip()

    provider = _infer_ai_provider(
        src.get("provider") or base.get("provider"),
        custom_model or raw_model,
    )
    model = raw_model or _PROVIDER_DEFAULT_MODELS.get(provider, DEFAULT_AI_MODEL)

    # Start with decrypted existing keys so merging never double-encrypts or loses unrelated providers
    merged_plain_keys = {k: "" for k in SUPPORTED_AI_PROVIDERS}
    if isinstance(base.get("apiKeys"), dict):
        for k in SUPPORTED_AI_PROVIDERS:
            if base["apiKeys"].get(k):
                merged_plain_keys[k] = decrypt_secret(str(base["apiKeys"][k]), secret_key=secret_key)
    elif base.get("apiKey"):
        legacy_p = _infer_ai_provider(base.get("provider"), base.get("model"))
        merged_plain_keys[legacy_p] = decrypt_secret(str(base["apiKey"]), secret_key=secret_key)

    # Apply new per-provider apiKeys map (only overwriting non-empty unless explicitly cleared)
    raw_map = src.get("apiKeys")
    if isinstance(raw_map, dict):
        for k in SUPPORTED_AI_PROVIDERS:
            if k in raw_map and raw_map[k] is not None:
                val = str(raw_map[k]).strip()
                if val:
                    merged_plain_keys[k] = decrypt_secret(val, secret_key=secret_key)

    clear_active = bool(src.get("clearKey"))
    if clear_active:
        merged_plain_keys[provider] = ""
    elif "apiKey" in src and src["apiKey"] is not None:
        explicit_key = str(src["apiKey"]).strip()
        if explicit_key:
            merged_plain_keys[provider] = decrypt_secret(explicit_key, secret_key=secret_key)
        elif not base:
            merged_plain_keys[provider] = ""

    if encrypt_keys:
        stored_keys = {
            k: (encrypt_secret(v, secret_key=secret_key) if v else "")
            for k, v in merged_plain_keys.items()
        }
    else:
        stored_keys = dict(merged_plain_keys)

    active_key = stored_keys.get(provider, "")
    return {
        "provider": provider,
        "model": model,
        "customModel": custom_model,
        "apiKey": active_key,
        "apiKeys": stored_keys,
    }


def get_decrypted_user_ai_settings(user: dict | None, secret_key: str | None = None) -> dict:
    """Returns decrypted AI settings for internal backend LLM requests only."""
    if not user or not isinstance(user, dict):
        return normalize_ai_settings(None)
    return normalize_ai_settings(user.get("aiSettings"), secret_key=secret_key, encrypt_keys=False)


def reset_users_cache() -> None:
    """Clears the in-memory users cache (primarily for tests)."""
    global _USERS_CACHE, _USERS_CACHE_MTIME, _USERS_CACHE_PATH
    with _USERS_LOCK:
        _USERS_CACHE = None
        _USERS_CACHE_MTIME = None
        _USERS_CACHE_PATH = None


def load_users() -> dict:
    """Loads all user accounts with mtime-invalidated in-memory caching and safe bootstrap."""
    global _USERS_CACHE, _USERS_CACHE_MTIME, _USERS_CACHE_PATH
    with _USERS_LOCK:
        users_dir = os.path.dirname(USERS_FILE)
        os.makedirs(users_dir, exist_ok=True)

        file_exists = os.path.exists(USERS_FILE)
        current_mtime = os.path.getmtime(USERS_FILE) if file_exists else None

        if (
            _USERS_CACHE is not None
            and _USERS_CACHE_PATH == USERS_FILE
            and _USERS_CACHE_MTIME == current_mtime
            and "admin" in _USERS_CACHE
        ):
            return copy.deepcopy(_USERS_CACHE)

        users = {}
        if file_exists:
            try:
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    if isinstance(loaded, dict):
                        users = loaded
            except Exception:
                users = {}

        if not users or "admin" not in users:
            bootstrap_pw = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD", "").strip()
            generated_pw = False
            if not bootstrap_pw:
                bootstrap_pw = secrets.token_urlsafe(12)
                generated_pw = True

            users["admin"] = {
                "username": "admin",
                "passwordHash": generate_password_hash(bootstrap_pw),
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
                "aiSettings": normalize_ai_settings(None),
            }
            if generated_pw and not os.environ.get("PYTEST_CURRENT_TEST"):
                logger.warning(
                    "Initialized default 'admin' account with generated bootstrap password: %s "
                    "(change it immediately or set ADMIN_BOOTSTRAP_PASSWORD).",
                    bootstrap_pw,
                )
            save_users(users)
        else:
            _USERS_CACHE = copy.deepcopy(users)
            _USERS_CACHE_MTIME = current_mtime
            _USERS_CACHE_PATH = USERS_FILE

        return copy.deepcopy(users)


def save_users(users: dict) -> None:
    """Atomically persists user accounts dictionary to disk under lock and updates cache."""
    global _USERS_CACHE, _USERS_CACHE_MTIME, _USERS_CACHE_PATH
    with _USERS_LOCK:
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        tmp_path = f"{USERS_FILE}.tmp_{os.getpid()}_{threading.get_ident()}"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
        os.replace(tmp_path, USERS_FILE)
        _USERS_CACHE = copy.deepcopy(users)
        _USERS_CACHE_MTIME = os.path.getmtime(USERS_FILE)
        _USERS_CACHE_PATH = USERS_FILE


def get_current_user_data_from_session(session_dict: dict) -> tuple[dict | None, str | None]:
    """Helper to retrieve active session user object and username."""
    username = session_dict.get("username")
    if not username:
        return None, None
    users = load_users()
    user = users.get(username)
    return user, username


def require_auth_json(session_dict: dict):
    """Returns (user, username, None) if authenticated, else (None, None, 401 response tuple)."""
    user, username = get_current_user_data_from_session(session_dict)
    if not user or not username:
        return None, None, (jsonify({"success": False, "error": "Authentication required."}), 401)
    return user, username, None


def sanitize_user(user: dict) -> dict:
    """Returns user profile without password hash or plaintext BYOK API keys."""
    dec_ai = get_decrypted_user_ai_settings(user)
    api_keys = dec_ai.get("apiKeys") or {}
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
        "aiSettings": {
            "provider": dec_ai["provider"],
            "model": dec_ai["model"],
            "customModel": dec_ai["customModel"],
            "hasKey": bool(dec_ai.get("apiKey")),
            "keyHint": mask_secret(dec_ai.get("apiKey", "")),
            "configuredProviders": {k: bool(api_keys.get(k)) for k in SUPPORTED_AI_PROVIDERS},
            "keyHints": {k: mask_secret(api_keys.get(k, "")) for k in SUPPORTED_AI_PROVIDERS},
        },
    }
