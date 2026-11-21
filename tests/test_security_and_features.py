import json
import os
import socket
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

import app as app_module
import routes.helpers as helpers
import routes.scanner_routes as scanner_routes
from routes.helpers import (
    get_decrypted_user_ai_settings,
    load_users,
    save_users,
    sanitize_user,
)
from scripts.build_assets import build_assets
from services.ai_service import AIService, ai_service
from services.notification_service import notification_service
from services.security_service import (
    DEFAULT_ALLOWED_DISCORD_HOSTS,
    get_app_secret_key,
    login_protector,
    rate_limiter,
    validate_outbound_webhook_url,
)


ADMIN_PW = "Sup3rStr0ng!Pass#2026"


@pytest.fixture(autouse=True)
def _isolate_env(tmp_path, monkeypatch):
    users_file = tmp_path / "users.json"
    monkeypatch.setattr(helpers, "USERS_FILE", str(users_file))
    monkeypatch.setattr(helpers, "DATA_DIR", str(tmp_path))
    monkeypatch.setattr(ai_service, "cache_dir", str(tmp_path / "ai_cache"))
    monkeypatch.setattr(
        scanner_routes.scanner_service,
        "custom_universe_file",
        str(tmp_path / "scanner_custom_universe.json"),
    )
    monkeypatch.setattr(scanner_routes.scanner_service, "_custom_universe", [])
    monkeypatch.setenv("ADMIN_BOOTSTRAP_PASSWORD", ADMIN_PW)
    ai_service._cache.clear()
    helpers.reset_users_cache()
    rate_limiter.reset()
    login_protector.reset()
    yield
    ai_service._cache.clear()
    helpers.reset_users_cache()
    rate_limiter.reset()
    login_protector.reset()


def _login_admin(client):
    resp = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": ADMIN_PW},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    return data["csrfToken"]


class TestSecurityControls:
    def test_sec1_auth_required_on_protected_endpoints(self):
        client = app_module.app.test_client()

        protected = [
            ("POST", "/api/analyze", {"tickers": ["NVDA"]}),
            ("POST", "/api/ai-chat", {"ticker": "NVDA", "question": "Outlook?"}),
            ("POST", "/api/ai-chat/stream", {"ticker": "NVDA", "question": "Outlook?"}),
            ("POST", "/api/test-ai", {"provider": "gemini", "apiKey": "AIzaTest1234"}),
            ("POST", "/api/ai/models", {"provider": "gemini", "apiKey": "AIzaTest1234"}),
            ("GET", "/api/watchlist", None),
            ("POST", "/api/watchlist", {"tickers": ["NVDA"]}),
            ("GET", "/api/alerts", None),
            ("POST", "/api/alerts/test-trigger", {"ticker": "NVDA"}),
            ("POST", "/api/scanner/universe/add", {"ticker": "ASML"}),
            ("POST", "/api/i18n/translate", {"targetLang": "de", "strings": ["Hello"]}),
            ("POST", "/api/stocks/resolve", {"queries": ["NVDA"]}),
        ]

        for method, path, body in protected:
            if method == "GET":
                r = client.get(path)
            else:
                r = client.post(path, json=body)
            assert r.status_code == 401, f"Expected 401 on unauthenticated {method} {path}, got {r.status_code}"

    def test_sec2_ssrf_validation_and_redirect_blocking(self, monkeypatch):
        monkeypatch.delenv("ALLOW_LOCAL_WEBHOOKS", raising=False)

        bad_urls = [
            "http://127.0.0.1:8080/hook",
            "http://169.254.169.254/latest/meta-data/",
            "http://10.0.0.1/admin",
            "http://localhost:5000/api",
            "file:///etc/passwd",
            "ftp://example.com/file",
        ]
        for u in bad_urls:
            ok, msg = validate_outbound_webhook_url(u)
            assert not ok, f"Expected SSRF rejection for {u}"
            assert msg

        ok_disc, _ = validate_outbound_webhook_url(
            "https://evil.example.com/api/webhooks/1/2",
            allowed_hosts=DEFAULT_ALLOWED_DISCORD_HOSTS,
        )
        assert not ok_disc

        # Mock DNS resolving to public IP and ensure send_discord_webhook passes allow_redirects=False
        fake_addr = [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("162.159.135.232", 443))]
        ok_resp = MagicMock(status_code=204, text="")
        with patch("services.security_service.socket.getaddrinfo", return_value=fake_addr), patch(
            "services.notification_service.requests.post", return_value=ok_resp
        ) as mock_post:
            res = notification_service.send_discord_webhook(
                "https://discord.com/api/webhooks/12345/abcdef",
                {"ticker": "NVDA", "signalName": "Bullish", "threshold": "80"},
            )
            assert res["delivered"] is True
            assert mock_post.call_args.kwargs.get("allow_redirects") is False

            # Blocked private target never even calls requests.post
            bad_res = notification_service.send_custom_webhook(
                "http://127.0.0.1:9000/internal",
                {"ticker": "NVDA", "signalName": "Bullish"},
            )
            assert bad_res["delivered"] is False
            assert bad_res["statusCode"] == 400

    def test_sec3_random_secret_no_admin123_and_min_password_length(self, tmp_path, monkeypatch):
        monkeypatch.delenv("SECRET_KEY", raising=False)
        key = get_app_secret_key(str(tmp_path))
        assert key and key != "findashiq_enterprise_quant_key_2026_x89"
        assert len(key) >= 32

        # Admin bootstrap must not accept hardcoded "admin123"
        monkeypatch.delenv("ADMIN_BOOTSTRAP_PASSWORD", raising=False)
        users = load_users()
        assert "admin" in users

        client = app_module.app.test_client()
        bad_pw_login = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        assert bad_pw_login.status_code == 401

        # Reset users to known password via fixture value and test min 12-char password enforcement
        monkeypatch.setenv("ADMIN_BOOTSTRAP_PASSWORD", ADMIN_PW)
        helpers.reset_users_cache()
        users_file = tmp_path / "users.json"
        if users_file.exists():
            users_file.unlink()

        csrf = _login_admin(client)
        headers = {"X-CSRF-Token": csrf}

        short_create = client.post(
            "/api/auth/create-user",
            json={"username": "alice", "password": "short123"},
            headers=headers,
        )
        assert short_create.status_code == 400

        ok_create = client.post(
            "/api/auth/create-user",
            json={"username": "alice", "password": "LongEnoughPass!2026"},
            headers=headers,
        )
        assert ok_create.status_code == 201

        short_change = client.post(
            "/api/auth/change-password",
            json={"currentPassword": ADMIN_PW, "newPassword": "short"},
            headers=headers,
        )
        assert short_change.status_code == 400

    def test_sec4_byok_fernet_encryption_masking_and_clear(self):
        client = app_module.app.test_client()
        csrf = _login_admin(client)
        headers = {"X-CSRF-Token": csrf}

        secret_key_raw = "sk-ant-super-secret-token-987654"
        save_resp = client.post(
            "/api/auth/update-ai-settings",
            json={
                "provider": "anthropic",
                "model": "claude-sonnet-5-5",
                "apiKey": secret_key_raw,
            },
            headers=headers,
        )
        assert save_resp.status_code == 200
        client_user = save_resp.get_json()["user"]
        ai_pub = client_user["aiSettings"]
        assert "apiKey" not in ai_pub
        assert "apiKeys" not in ai_pub
        assert ai_pub["hasKey"] is True
        assert ai_pub["keyHint"] == "sk-a...7654"
        assert ai_pub["configuredProviders"]["anthropic"] is True
        assert secret_key_raw not in json.dumps(sanitize_user(load_users()["admin"]))

        # Disk storage uses Fernet enc:v1: and decrypts cleanly on server
        raw_disk_user = load_users()["admin"]
        stored = raw_disk_user["aiSettings"]["apiKeys"]["anthropic"]
        assert stored.startswith("enc:v1:")
        dec = get_decrypted_user_ai_settings(raw_disk_user)
        assert dec["apiKeys"]["anthropic"] == secret_key_raw

        # Saving settings without re-entering key preserves encrypted key
        pres_resp = client.post(
            "/api/auth/update-ai-settings",
            json={"provider": "anthropic", "model": "claude-opus-5-5"},
            headers=headers,
        )
        assert pres_resp.status_code == 200
        assert get_decrypted_user_ai_settings(load_users()["admin"])["apiKeys"]["anthropic"] == secret_key_raw

        # clearKey clears active provider key
        clr_resp = client.post(
            "/api/auth/update-ai-settings",
            json={"provider": "anthropic", "model": "claude-opus-5-5", "clearKey": True},
            headers=headers,
        )
        assert clr_resp.status_code == 200
        assert clr_resp.get_json()["user"]["aiSettings"]["hasKey"] is False
        assert get_decrypted_user_ai_settings(load_users()["admin"])["apiKeys"]["anthropic"] == ""

    def test_sec5_csrf_rate_limiter_and_login_lockout(self):
        client = app_module.app.test_client()
        csrf = _login_admin(client)

        # Missing CSRF token on authenticated mutating request -> 403
        no_csrf = client.post("/api/watchlist", json={"tickers": ["NVDA", "MSFT"]})
        assert no_csrf.status_code == 403

        # Valid CSRF token -> 200
        with_csrf = client.post(
            "/api/watchlist",
            json={"tickers": ["NVDA", "MSFT"]},
            headers={"X-CSRF-Token": csrf},
        )
        assert with_csrf.status_code == 200

        # Login lockout after consecutive failures
        for _ in range(10):
            client.post("/api/auth/login", json={"username": "admin", "password": "wrong-password-123"})
        locked = client.post("/api/auth/login", json={"username": "admin", "password": ADMIN_PW})
        assert locked.status_code == 429
        assert "Retry-After" in locked.headers

        # Sliding-window rate limit check (25 reqs/min on ai_chat, then 429)
        login_protector.reset()
        rate_limiter.reset()
        client2 = app_module.app.test_client()
        csrf2 = _login_admin(client2)
        for _ in range(25):
            r = client2.post("/api/ai-chat", json={"ticker": "NVDA", "question": "Hi"}, headers={"X-CSRF-Token": csrf2})
            assert r.status_code == 200
        throttled = client2.post("/api/ai-chat", json={"ticker": "NVDA", "question": "Hi"}, headers={"X-CSRF-Token": csrf2})
        assert throttled.status_code == 429
        assert "Retry-After" in throttled.headers

    def test_sec6_and_sec8_csp_hsts_atomic_save_and_ci(self):
        client = app_module.app.test_client()

        plain_resp = client.get("/")
        csp = plain_resp.headers.get("Content-Security-Policy", "")
        assert "'unsafe-eval'" not in csp
        assert "script-src-elem" in csp
        assert "'nonce-" in csp
        assert "Strict-Transport-Security" not in plain_resp.headers

        https_resp = client.get("/", headers={"X-Forwarded-Proto": "https"})
        assert "Strict-Transport-Security" in https_resp.headers

        ci_text = Path(".gitlab-ci.yml").read_text(encoding="utf-8")
        assert "git remote set-url origin https://oauth2:${CI_JOB_TOKEN}" not in ci_text
        assert "http.extraHeader" in ci_text


class TestPerformanceUXDesignFeatures:
    def test_perf_bundle_gzip_sse_compression_and_user_cache(self, tmp_path):
        stats = build_assets(validate_node=True)
        assert stats["cssMinBytes"] < stats["cssRawBytes"]
        assert Path(stats["cssPath"]).is_file()
        assert Path(stats["jsPath"]).is_file()

        client = app_module.app.test_client()
        css_resp = client.get("/static/dist/style.min.css", headers={"Accept-Encoding": "gzip"})
        assert css_resp.status_code == 200
        assert css_resp.headers.get("Content-Encoding") == "gzip"

        csrf = _login_admin(client)
        sse_resp = client.post(
            "/api/ai-chat/stream",
            json={
                "ticker": "NVDA",
                "question": "Give stop loss",
                "stockData": {
                    "profile": {"ticker": "NVDA", "currentPrice": 140.0, "atr": 4.0},
                    "signals": {"overall": "Buy", "bullishCount": 4, "bearishCount": 1, "neutralCount": 1, "indicators": {}},
                    "timeseries": [{"time": "2026-10-20", "close": 140.0, "open": 138.0, "high": 141.0, "low": 137.5, "volume": 1000}],
                },
            },
            headers={"X-CSRF-Token": csrf, "Accept-Encoding": "gzip"},
        )
        assert sse_resp.status_code == 200
        assert "text/event-stream" in sse_resp.content_type
        assert "Content-Encoding" not in sse_resp.headers
        sse_body = sse_resp.get_data(as_text=True)
        assert '"type": "meta"' in sse_body
        assert '"type": "delta"' in sse_body
        assert '"type": "done"' in sse_body

        # Prompt compression retains exact d-20 close while shrinking size vs 30 verbose lines
        bars = [
            {"time": f"2026-10-{i + 1:02d}", "open": 100 + i, "high": 102 + i, "low": 99 + i, "close": 100.5 + i, "volume": 500000}
            for i in range(30)
        ]
        compressed = AIService._compress_timeseries_context(bars)
        assert "d-20[" in compressed
        assert "$109.50" in compressed
        assert len(compressed) < 1200

        # Mtime-invalidated users cache reloads when file is modified
        users1 = load_users()
        users2 = load_users()
        assert users1 == users2
        users2["custom_cached_test"] = {"username": "custom_cached_test", "role": "user"}
        time.sleep(0.02)
        save_users(users2)
        reloaded = load_users()
        assert "custom_cached_test" in reloaded

    def test_ux_pwa_multiturn_history_export_import_and_overlays(self):
        client = app_module.app.test_client()

        home = client.get("/")
        html = home.get_data(as_text=True)
        assert '<button type="button" class="logo-area"' in html
        assert '<button type="button" id="headerAIBadge"' in html
        assert 'role="dialog" aria-modal="true"' in html
        assert 'id="toastContainer"' in html
        assert 'id="confirmActionModal"' in html

        manifest = client.get("/manifest.json")
        assert manifest.status_code == 200
        assert manifest.get_json()["short_name"] == "FinDashIQ"

        sw = client.get("/sw.js")
        assert sw.status_code == 200
        assert sw.headers.get("Service-Worker-Allowed") == "/"

        # Multi-turn history forwarded cleanly to provider adapter
        ok_openai = MagicMock(status_code=200)
        ok_openai.json.return_value = {"choices": [{"message": {"content": "Follow-up answer."}}]}
        with patch("services.ai_service.requests.post", return_value=ok_openai) as mock_post:
            ai_service.ask_copilot(
                ticker="NVDA",
                question="And what is Target 2?",
                stock_data={"profile": {"ticker": "NVDA", "currentPrice": 140.0}, "signals": {}, "timeseries": [{"time": "2026-10-20", "close": 140.0}]},
                chat_history=[
                    {"role": "user", "content": "What is Target 1?"},
                    {"role": "assistant", "content": "Target 1 is $146."},
                ],
                api_key="sk-proj-test-1234",
                provider="openai",
                model="gpt-6.1-sol",
            )
            sent_messages = mock_post.call_args.kwargs["json"]["messages"]
            assert any(m["role"] == "assistant" and "Target 1 is $146." in m["content"] for m in sent_messages)

        # Watchlist & Scanner CSV/JSON Export & Import round-trip
        csrf = _login_admin(client)
        headers = {"X-CSRF-Token": csrf}

        imp_wl = client.post(
            "/api/watchlist/import",
            json={"csvText": "ticker\nAAPL\nASML\nNVDA", "mode": "replace"},
            headers=headers,
        )
        assert imp_wl.status_code == 200
        assert imp_wl.get_json()["tickers"] == ["AAPL", "ASML", "NVDA"]

        exp_csv = client.get("/api/watchlist/export?format=csv")
        assert exp_csv.status_code == 200
        assert "ticker" in exp_csv.get_data(as_text=True)
        assert "ASML" in exp_csv.get_data(as_text=True)

        exp_json = client.get("/api/watchlist/export?format=json")
        assert exp_json.status_code == 200
        assert exp_json.get_json()["tickers"] == ["AAPL", "ASML", "NVDA"]

        imp_scan = client.post(
            "/api/scanner/universe/import",
            json={"rawText": "TICKER\nPLTR\nARM", "mode": "merge"},
            headers=headers,
        )
        assert imp_scan.status_code == 200
        assert imp_scan.get_json()["success"] is True

        exp_scan = client.get("/api/scanner/universe/export?format=csv")
        assert exp_scan.status_code == 200
        assert "ticker,name,market,sector,parentETF" in exp_scan.get_data(as_text=True)

    def test_des_confluence_demo_showcase_and_theme_tokens(self):
        signals = {
            "bullishCount": 4,
            "bearishCount": 0,
            "neutralCount": 1,
            "indicators": {
                "RSI": {"status": "bullish", "signal": "Bullish"},
                "MACD": {"status": "bullish", "signal": "Bullish"},
                "Stochastic": {"status": "bullish", "signal": "Bullish"},
                "SuperTrend": {"status": "bullish", "signal": "Bullish"},
            },
        }
        conf = AIService.compute_technical_confluence(signals, {"cmf": 0.14})
        assert conf["score"] == 100.0
        assert conf["tier"] == "High Confluence"
        assert conf["alignedCount"] == 5

        analysis = ai_service.generate_ai_analysis(
            profile={"ticker": "MSFT", "name": "Microsoft", "currentPrice": 440.0, "atr": 6.0, "vwap": 435.0, "cmf": 0.14},
            timeseries=[{"time": f"2026-10-{10 + i:02d}", "open": 430 + i, "high": 435 + i, "low": 428 + i, "close": 432 + i, "volume": 1000000} for i in range(10)],
            signals=signals,
            allow_llm=False,
        )
        assert "confluence" in analysis
        assert analysis["confluence"]["tier"] == "High Confluence"

        client = app_module.app.test_client()
        demo = client.get("/api/demo/showcase")
        assert demo.status_code == 200
        demo_data = demo.get_json()
        assert demo_data["demoMode"] is True
        assert set(["NVDA", "MSFT", "ASML", "TSM"]).issubset(set(demo_data["stocks"].keys()))
        assert "confluence" in demo_data["stocks"]["NVDA"]["aiAnalysis"]

        tab_ai_html = Path("templates/tabs/tab_ai.html").read_text(encoding="utf-8")
        assert "#1e293b" not in tab_ai_html
        assert "rgba(255, 255, 255, 0.08)" not in tab_ai_html
        assert "var(--progress-track)" in tab_ai_html
        assert "var(--border-subtle)" in tab_ai_html
