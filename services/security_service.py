import base64
import hashlib
import hmac
import ipaddress
import os
import secrets
import socket
import sys
import threading
import time
from collections import defaultdict, deque
from urllib.parse import urlparse

import requests
from cryptography.fernet import Fernet, InvalidToken

_SECRET_LOCK = threading.Lock()
_EPHEMERAL_TEST_SECRET: str | None = None
_SECRET_CACHE: dict[str, str] = {}

DEFAULT_ALLOWED_DISCORD_HOSTS = frozenset({
    "discord.com",
    "discordapp.com",
    "ptb.discord.com",
    "canary.discord.com",
})


def get_app_secret_key(data_dir: str) -> str:
    """
    Resolves the Flask session secret key without any hardcoded literal fallback:
    1. Explicit SECRET_KEY environment variable.
    2. Ephemeral per-process random key during pytest runs (no disk writes to data/).
    3. Persisted random secret file (<data_dir>/.secret_key) atomically created on first run.
    """
    global _EPHEMERAL_TEST_SECRET
    env_key = os.environ.get("SECRET_KEY", "").strip()
    if env_key:
        return env_key

    if os.environ.get("PYTEST_CURRENT_TEST") or "pytest" in sys.modules:
        with _SECRET_LOCK:
            if not _EPHEMERAL_TEST_SECRET:
                _EPHEMERAL_TEST_SECRET = secrets.token_hex(32)
            return _EPHEMERAL_TEST_SECRET

    abs_dir = os.path.abspath(data_dir)
    if abs_dir in _SECRET_CACHE:
        return _SECRET_CACHE[abs_dir]

    key_file = os.path.join(abs_dir, ".secret_key")
    with _SECRET_LOCK:
        if abs_dir in _SECRET_CACHE:
            return _SECRET_CACHE[abs_dir]
        if os.path.exists(key_file):
            try:
                with open(key_file, "r", encoding="utf-8") as f:
                    stored = f.read().strip()
                if len(stored) >= 32:
                    _SECRET_CACHE[abs_dir] = stored
                    return stored
            except OSError:
                pass

        os.makedirs(abs_dir, exist_ok=True)
        generated = secrets.token_hex(32)
        tmp_path = f"{key_file}.tmp_{os.getpid()}_{threading.get_ident()}"
        try:
            with open(tmp_path, "w", encoding="utf-8") as f:
                f.write(generated)
            if os.name == "posix":
                os.chmod(tmp_path, 0o600)
            os.replace(tmp_path, key_file)
            if os.name == "posix":
                os.chmod(key_file, 0o600)
        except OSError:
            pass
        _SECRET_CACHE[abs_dir] = generated
        return generated


def _resolve_active_secret(secret_key: str | None = None) -> str:
    if secret_key and str(secret_key).strip():
        return str(secret_key).strip()
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return get_app_secret_key(os.path.join(base_dir, "data"))


def _get_fernet(secret_key: str) -> Fernet:
    digest = hashlib.sha256(secret_key.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_secret(plaintext: str, secret_key: str | None = None) -> str:
    """Encrypts a plaintext secret using Fernet with an 'enc:v1:' prefix."""
    val = str(plaintext or "").strip()
    if not val:
        return ""
    if val.startswith("enc:v1:"):
        return val
    token = _get_fernet(_resolve_active_secret(secret_key)).encrypt(val.encode("utf-8")).decode("ascii")
    return f"enc:v1:{token}"


def decrypt_secret(value: str, secret_key: str | None = None) -> str:
    """Decrypts an 'enc:v1:' value, returning legacy plaintext values unchanged for backwards compatibility."""
    val = str(value or "").strip()
    if not val:
        return ""
    if not val.startswith("enc:v1:"):
        return val
    raw_token = val[len("enc:v1:"):]
    try:
        return _get_fernet(_resolve_active_secret(secret_key)).decrypt(raw_token.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError, Exception):
        return ""


def mask_secret(plaintext: str) -> str:
    """Produces a non-reversible masked hint (e.g., 'AIza...wXyZ') safe for client responses."""
    val = str(plaintext or "").strip()
    if not val:
        return ""
    if len(val) <= 8:
        return "••••"
    return f"{val[:4]}...{val[-4:]}"


def _is_disallowed_ip(ip_str: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip_str.split("%", 1)[0])
    except ValueError:
        return True
    return bool(
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_multicast
        or addr.is_reserved
        or addr.is_unspecified
    )


def validate_outbound_webhook_url(url: str, allowed_hosts: set[str] | frozenset[str] | None = None) -> tuple[bool, str]:
    """
    Validates outbound webhook URLs against SSRF:
    - Enforces http/https scheme, valid hostname, and no embedded credentials.
    - Enforces optional host allowlist (exact or subdomain match).
    - Resolves DNS and rejects private, loopback, link-local, multicast, or reserved IPs.
    """
    raw = str(url or "").strip()
    if not raw:
        return False, "Webhook URL is required."

    try:
        parsed = urlparse(raw)
    except Exception:
        return False, "Malformed webhook URL."

    scheme = (parsed.scheme or "").lower()
    if scheme not in ("http", "https"):
        return False, "Webhook URL must start with http:// or https://"

    if parsed.username or parsed.password:
        return False, "Webhook URL must not include embedded credentials."

    hostname = (parsed.hostname or "").strip().lower().rstrip(".")
    if not hostname:
        return False, "Webhook URL must include a valid hostname."

    if allowed_hosts:
        allowed_norm = {h.lower().rstrip(".") for h in allowed_hosts}
        if not any(hostname == ah or hostname.endswith(f".{ah}") for ah in allowed_norm):
            return False, f"Host '{hostname}' is not in the allowed webhook domain list."

    if os.environ.get("ALLOW_LOCAL_WEBHOOKS", "").strip() == "1":
        return True, ""

    # Check literal IP host immediately
    try:
        ipaddress.ip_address(hostname)
        if _is_disallowed_ip(hostname):
            return False, f"Blocked private or non-routable IP target ({hostname})."
        return True, ""
    except ValueError:
        pass

    if hostname in ("localhost", "localhost.localdomain") or hostname.endswith(".local") or hostname.endswith(".internal"):
        return False, f"Blocked local/internal hostname ({hostname})."

    port = parsed.port or (443 if scheme == "https" else 80)
    try:
        addr_infos = socket.getaddrinfo(hostname, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        return False, f"Could not resolve webhook hostname '{hostname}': {exc}"
    except Exception as exc:
        return False, f"Webhook host validation failed: {exc}"

    if not addr_infos:
        return False, f"No network addresses resolved for '{hostname}'."

    for info in addr_infos:
        sockaddr = info[4]
        ip_candidate = sockaddr[0] if sockaddr else ""
        if _is_disallowed_ip(ip_candidate):
            return False, f"Blocked private or non-routable resolved IP ({ip_candidate}) for '{hostname}'."

    return True, ""


class SlidingWindowRateLimiter:
    """Thread-safe in-memory sliding-window rate limiter."""

    def __init__(self):
        self._lock = threading.Lock()
        self._hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)

    def check(self, bucket: str, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = time.monotonic()
        cutoff = now - window_seconds
        composite = (bucket, key)
        with self._lock:
            dq = self._hits[composite]
            while dq and dq[0] <= cutoff:
                dq.popleft()
            if len(dq) >= limit:
                retry_after = max(1, int(dq[0] + window_seconds - now) + 1)
                return False, retry_after
            dq.append(now)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


class LoginProtectionTracker:
    """Tracks consecutive failed logins per (ip, username) with progressive backoff and lockout."""

    def __init__(self, max_failures_lockout: int = 10, lockout_seconds: int = 900):
        self._lock = threading.Lock()
        self._records: dict[tuple[str, str], dict] = {}
        self.max_failures_lockout = max_failures_lockout
        self.lockout_seconds = lockout_seconds

    def check_allowed(self, ip: str, username: str) -> tuple[bool, int, int]:
        now = time.monotonic()
        key = (ip or "unknown", (username or "").lower().strip())
        with self._lock:
            rec = self._records.get(key)
            if not rec:
                return True, 0, 0
            blocked_until = rec.get("blocked_until", 0.0)
            fails = rec.get("failures", 0)
            if blocked_until > now:
                return False, max(1, int(blocked_until - now) + 1), fails
            return True, 0, fails

    def record_failure(self, ip: str, username: str) -> tuple[int, int]:
        now = time.monotonic()
        key = (ip or "unknown", (username or "").lower().strip())
        with self._lock:
            rec = self._records.setdefault(key, {"failures": 0, "blocked_until": 0.0})
            rec["failures"] += 1
            fails = rec["failures"]
            cooldown = 0
            if fails >= self.max_failures_lockout:
                cooldown = self.lockout_seconds
            elif fails >= 4:
                cooldown = min(300, 2 ** (fails - 3))
            if cooldown > 0:
                rec["blocked_until"] = now + cooldown
            return fails, cooldown

    def record_success(self, ip: str, username: str) -> None:
        key = (ip or "unknown", (username or "").lower().strip())
        with self._lock:
            self._records.pop(key, None)

    def reset(self) -> None:
        with self._lock:
            self._records.clear()


def verify_turnstile_token(token: str, remote_ip: str = "") -> tuple[bool, str]:
    """Verifies Cloudflare Turnstile response when TURNSTILE_SECRET_KEY is configured."""
    secret = os.environ.get("TURNSTILE_SECRET_KEY", "").strip()
    if not secret:
        return True, ""
    if not token or not str(token).strip():
        return False, "Verification challenge required. Please complete the security check."
    try:
        resp = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": secret, "response": str(token).strip(), "remoteip": remote_ip or ""},
            timeout=6,
        )
        data = resp.json()
        if data.get("success"):
            return True, ""
        return False, "Security verification failed. Please retry."
    except Exception:
        return False, "Unable to verify security challenge."


def ensure_csrf_token(session_dict) -> str:
    """Ensures a per-session CSRF token exists and returns it."""
    tok = session_dict.get("csrf_token")
    if not tok or not isinstance(tok, str) or len(tok) < 16:
        tok = secrets.token_urlsafe(32)
        session_dict["csrf_token"] = tok
    return tok


def validate_csrf(req, session_dict) -> tuple[bool, str]:
    """
    Validates CSRF token (X-CSRF-Token header or JSON _csrf_token) and same-origin Origin/Referer.
    """
    expected_host = (req.host or "").strip().lower()
    for hdr in ("Origin", "Referer"):
        raw_val = req.headers.get(hdr, "").strip()
        if raw_val:
            parsed = urlparse(raw_val)
            netloc = (parsed.netloc or "").strip().lower()
            if netloc and expected_host and netloc != expected_host:
                return False, f"Cross-origin request blocked ({hdr} mismatch)."

    expected_token = session_dict.get("csrf_token", "")
    provided_token = (req.headers.get("X-CSRF-Token") or "").strip()
    if not provided_token:
        body = req.get_json(silent=True)
        if isinstance(body, dict) and body.get("_csrf_token"):
            provided_token = str(body.get("_csrf_token")).strip()

    if not expected_token or not provided_token:
        return False, "Missing or expired CSRF security token. Refresh the page and retry."

    if not hmac.compare_digest(expected_token, provided_token):
        return False, "Invalid CSRF security token."

    return True, ""


rate_limiter = SlidingWindowRateLimiter()
login_protector = LoginProtectionTracker()
