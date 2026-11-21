import json
from unittest.mock import MagicMock, patch

import pytest

import app as app_module
import routes.helpers as helpers
from routes.helpers import normalize_ai_settings
from services.ai_service import AIService, ai_service
from services.security_service import login_protector, rate_limiter


@pytest.fixture(autouse=True)
def _isolate_test_state(tmp_path, monkeypatch):
    users_file = tmp_path / "users.json"
    monkeypatch.setattr(helpers, "USERS_FILE", str(users_file))
    monkeypatch.setattr(helpers, "DATA_DIR", str(tmp_path))
    monkeypatch.setenv("ADMIN_BOOTSTRAP_PASSWORD", "Sup3rStr0ng!Pass#2026")
    helpers.reset_users_cache()
    rate_limiter.reset()
    login_protector.reset()
    yield
    helpers.reset_users_cache()
    rate_limiter.reset()
    login_protector.reset()


def _make_mock_response(status_code=200, json_data=None, text=""):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data if json_data is not None else {}
    resp.text = text or json.dumps(resp.json.return_value)
    return resp


def _sample_stock_inputs():
    profile = {
        "ticker": "NVDA",
        "name": "NVIDIA Corporation",
        "currentPrice": 140.0,
        "changePercent": 2.4,
        "atr": 4.0,
        "vwap": 138.0,
        "cmf": 0.12,
        "sector": "Technology",
        "volume": 50_000_000,
        "avgVolume": 35_000_000,
        "fiftyTwoWeekHigh": 150.0,
        "fiftyTwoWeekLow": 75.0,
    }
    timeseries = [
        {"time": f"2026-10-{10 + i:02d}", "open": 130 + i, "high": 133 + i, "low": 129 + i, "close": 131 + i, "volume": 1_000_000}
        for i in range(10)
    ]
    signals = {
        "overall": "Strong Buy",
        "bullishCount": 5,
        "bearishCount": 1,
        "neutralCount": 1,
        "indicators": {
            "SuperTrend": {"status": "bullish", "signal": "Bullish", "value": 134.0},
            "MACD": {"status": "bullish", "signal": "Bullish Crossover", "hist": 0.45},
            "RSI": {"status": "bullish", "signal": "Bullish Momentum", "value": 62.0},
            "Stochastic": {"status": "bullish", "signal": "Bullish Turn", "value": 68.0},
        },
    }
    news = [
        {
            "title": "NVIDIA beats earnings estimates on strong AI demand",
            "publisher": "Reuters",
            "country": "United States",
            "flag": "🇺🇸",
            "timeAgo": "2h ago",
            "timestamp": 1795000000,
        }
    ]
    return profile, timeseries, signals, news


class TestAIServiceAdapters:
    def test_gemini_4_header_auth_and_thought_filtering(self):
        mock_resp = _make_mock_response(
            200,
            {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"thought": True, "text": "INTERNAL_CHAIN_OF_THOUGHT"},
                                {"text": "FINAL_GEMINI_OUTPUT"},
                            ]
                        }
                    }
                ]
            },
        )
        with patch("services.ai_service.requests.post", return_value=mock_resp) as mock_post:
            text, used_model, err = AIService.call_llm(
                "Analyze NVDA",
                "AIzaTestKey123456",
                provider="gemini",
                model_name="gemini-4-neon",
                thinking_level="high",
            )

        assert err == ""
        assert used_model == "gemini-4-neon"
        assert text == "FINAL_GEMINI_OUTPUT"
        assert "INTERNAL_CHAIN_OF_THOUGHT" not in text

        call_args = mock_post.call_args
        url = call_args.args[0]
        assert url == "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-neon:generateContent"
        assert "?key=" not in url
        assert call_args.kwargs["headers"]["x-goog-api-key"] == "AIzaTestKey123456"
        gen_cfg = call_args.kwargs["json"]["generationConfig"]
        assert gen_cfg["thinkingConfig"]["thinkingLevel"] == "HIGH"
        assert "temperature" not in gen_cfg

    def test_gemini_fallback_and_invalid_key_stop(self):
        resp_429 = _make_mock_response(429, {"error": {"message": "Rate limited"}})
        resp_ok = _make_mock_response(200, {"candidates": [{"content": {"parts": [{"text": "FALLBACK_OK"}]}}]})
        with patch("services.ai_service.requests.post", side_effect=[resp_429, resp_ok]) as mock_post:
            text, used_model, err = AIService.call_llm(
                "Hello", "AIzaTestKey123456", provider="gemini", model_name="gemini-4-neon"
            )
        assert err == ""
        assert text == "FALLBACK_OK"
        assert used_model == "gemini-4-hydrogen"
        assert mock_post.call_count == 2

        resp_403 = _make_mock_response(403, {"error": {"message": "API_KEY_INVALID"}})
        with patch("services.ai_service.requests.post", return_value=resp_403) as mock_post_bad:
            text, used_model, err = AIService.call_llm(
                "Hello", "bad-key", provider="gemini", model_name="gemini-4-neon"
            )
        assert text == ""
        assert "403" in err
        assert mock_post_bad.call_count == 1

    def test_anthropic_messages_api_omits_sampling_and_filters_thinking(self):
        mock_resp = _make_mock_response(
            200,
            {
                "content": [
                    {"type": "thinking", "thinking": "HIDDEN_THINKING"},
                    {"type": "text", "text": "CLAUDE_SYNTHESIS_PART1"},
                    {"type": "text", "text": "CLAUDE_SYNTHESIS_PART2"},
                ]
            },
        )
        with patch("services.ai_service.requests.post", return_value=mock_resp) as mock_post:
            text, used_model, err = AIService.call_llm(
                "Analyze MSFT",
                "sk-ant-test-123456",
                provider="anthropic",
                model_name="claude-opus-5-5",
            )

        assert err == ""
        assert used_model == "claude-opus-5-5"
        assert "HIDDEN_THINKING" not in text
        assert text == "CLAUDE_SYNTHESIS_PART1\nCLAUDE_SYNTHESIS_PART2"

        call_args = mock_post.call_args
        assert call_args.args[0] == "https://api.anthropic.com/v1/messages"
        headers = call_args.kwargs["headers"]
        assert headers["x-api-key"] == "sk-ant-test-123456"
        assert headers["anthropic-version"] == "2026-10-21"
        payload = call_args.kwargs["json"]
        assert payload["model"] == "claude-opus-5-5"
        assert "temperature" not in payload
        assert "top_p" not in payload
        assert "top_k" not in payload

    def test_anthropic_fallback_on_overload(self):
        resp_529 = _make_mock_response(529, {"error": {"message": "Overloaded"}})
        resp_ok = _make_mock_response(200, {"content": [{"type": "text", "text": "SONNET_OK"}]})
        with patch("services.ai_service.requests.post", side_effect=[resp_529, resp_ok]) as mock_post:
            text, used_model, err = AIService.call_llm(
                "Hello", "sk-ant-test-123456", provider="anthropic", model_name="claude-opus-5-5"
            )
        assert err == ""
        assert text == "SONNET_OK"
        assert used_model == "claude-sonnet-5-5"
        assert mock_post.call_count == 2

    def test_openai_gpt6_uses_max_completion_tokens_and_omits_temperature(self):
        mock_resp = _make_mock_response(
            200,
            {"choices": [{"message": {"content": "OPENAI_GPT6_OUTPUT"}}]},
        )
        with patch("services.ai_service.requests.post", return_value=mock_resp) as mock_post:
            text, used_model, err = AIService.call_llm(
                "Analyze AAPL",
                "sk-proj-test-123456",
                provider="openai",
                model_name="gpt-6-astra",
            )

        assert err == ""
        assert used_model == "gpt-6-astra"
        assert text == "OPENAI_GPT6_OUTPUT"

        call_args = mock_post.call_args
        assert call_args.args[0] == "https://api.openai.com/v1/chat/completions"
        assert call_args.kwargs["headers"]["Authorization"] == "Bearer sk-proj-test-123456"
        payload = call_args.kwargs["json"]
        assert payload["model"] == "gpt-6-astra"
        assert "max_completion_tokens" in payload
        assert "max_tokens" not in payload
        assert "temperature" not in payload

    def test_openai_fallback_on_429(self):
        resp_429 = _make_mock_response(429, {"error": {"message": "Rate limit exceeded"}})
        resp_ok = _make_mock_response(200, {"choices": [{"message": {"content": "SOL_OK"}}]})
        with patch("services.ai_service.requests.post", side_effect=[resp_429, resp_ok]) as mock_post:
            text, used_model, err = AIService.call_llm(
                "Hello", "sk-proj-test-123456", provider="openai", model_name="gpt-6-astra"
            )
        assert err == ""
        assert text == "SOL_OK"
        assert used_model == "gpt-6.1-sol"
        assert mock_post.call_count == 2

    def test_gemini_diagnostic_cascade_quota_zero_timeout_and_key_valid(self):
        import requests as _requests

        # 1. Short-circuit when preferred model is online + verify >=30s timeout and >=256 maxOutputTokens
        ok_resp = _make_mock_response(200, {"candidates": [{"content": {"parts": [{"text": "OK"}]}}]})
        with patch("services.ai_service.requests.post", return_value=ok_resp) as mock_post:
            rep = AIService.test_provider_connection("AIzaTest1234", provider="gemini", preferred_model="gemini-4-neon")
        assert rep["success"] is True
        assert rep["keyValid"] is True
        assert len(rep["models"]) == 1
        assert rep["models"][0]["status"] == "online"
        assert mock_post.call_count == 1
        assert mock_post.call_args.kwargs["timeout"] >= 30
        assert mock_post.call_args.kwargs["json"]["generationConfig"]["maxOutputTokens"] >= 256

        # 2. Cascade: gemini-4-neon quota_zero -> gemini-4-hydrogen timeout -> gemini-3.8-flash online
        quota_zero_resp = _make_mock_response(
            429,
            {"error": {"message": "Quota exceeded for quota metric, limit: 0, free_tier requests"}},
        )
        with patch(
            "services.ai_service.requests.post",
            side_effect=[quota_zero_resp, _requests.exceptions.Timeout("read timed out"), ok_resp],
        ) as mock_post_cascade:
            rep2 = AIService.test_provider_connection("AIzaTest1234", provider="gemini", preferred_model="gemini-4-neon")
        assert rep2["success"] is True
        assert [m["model"] for m in rep2["models"]] == ["gemini-4-neon", "gemini-4-hydrogen", "gemini-3.8-flash"]
        assert [m["status"] for m in rep2["models"]] == ["quota_zero", "timeout", "online"]
        assert mock_post_cascade.call_count == 3

        # 3. All 3 fail with quota/timeout/503 -> overloaded classified & keyValid verified True via /v1beta/models
        overloaded_503 = _make_mock_response(503, {"error": {"message": "This model is currently experiencing high demand."}})
        models_ok = _make_mock_response(
            200,
            {"models": [{"name": "models/gemini-3.8-flash", "supportedGenerationMethods": ["generateContent"]}]},
        )
        with patch(
            "services.ai_service.requests.post",
            side_effect=[quota_zero_resp, _requests.exceptions.Timeout("timeout"), overloaded_503],
        ), patch("services.ai_service.requests.get", return_value=models_ok):
            rep3 = AIService.test_provider_connection("AIzaTest1234", provider="gemini", preferred_model="gemini-4-neon")
        assert rep3["success"] is False
        assert rep3["models"][2]["status"] == "overloaded"
        assert rep3["keyValid"] is True
        assert rep3["availableModelsCount"] == 1

    def test_interactive_gemini4_calls_use_low_thinking_level(self, tmp_path):
        svc = AIService(cache_dir=str(tmp_path))
        profile, timeseries, signals, news = _sample_stock_inputs()
        ok_memo = _make_mock_response(
            200,
            {"candidates": [{"content": {"parts": [{"text": "Concise thesis line " + ("z" * 45)}]}}]},
        )
        with patch("services.ai_service.requests.post", return_value=ok_memo) as mock_post_memo:
            res = svc.generate_ai_analysis(
                profile=profile,
                timeseries=timeseries,
                signals=signals,
                news=news,
                api_key="AIzaTest1234",
                provider="gemini",
                model="gemini-4-hydrogen",
                allow_llm=True,
            )
        assert res["aiMeta"]["enhanced"] is True
        assert mock_post_memo.call_args.kwargs["json"]["generationConfig"]["thinkingConfig"]["thinkingLevel"] == "LOW"

        ok_chat = _make_mock_response(200, {"candidates": [{"content": {"parts": [{"text": "Direct answer."}]}}]})
        with patch("services.ai_service.requests.post", return_value=ok_chat) as mock_post_chat:
            ans = svc.ask_copilot(
                ticker="NVDA",
                question="Is it bullish?",
                stock_data={"profile": profile, "signals": signals, "aiAnalysis": res, "timeseries": timeseries},
                api_key="AIzaTest1234",
                provider="gemini",
                model="gemini-4-neon",
            )
        assert "Direct answer." in ans
        assert mock_post_chat.call_args.kwargs["json"]["generationConfig"]["thinkingConfig"]["thinkingLevel"] == "LOW"


class TestCachingAndFallback:
    def test_builtin_quant_fallback_and_cache_persistence(self, tmp_path, monkeypatch):
        for var in ("GEMINI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"):
            monkeypatch.delenv(var, raising=False)

        svc = AIService(cache_dir=str(tmp_path))
        profile, timeseries, signals, news = _sample_stock_inputs()

        res = svc.generate_ai_analysis(
            profile=profile,
            timeseries=timeseries,
            signals=signals,
            news=news,
            api_key="",
            provider="gemini",
            model="gemini-4-hydrogen",
            allow_llm=True,
        )

        assert res["ticker"] == "NVDA"
        assert 10 <= res["convictionScore"] <= 98
        assert res["aiMeta"] == {"provider": "gemini", "model": "builtin-quant", "enhanced": False}
        assert "tradeLevels" in res and "scenario30d" in res

        # Verify dead-code bug fix: full analysis is now persisted in cache
        cached = svc._get_cached("full_ai_analysis:NVDA:gemini:gemini-4-hydrogen")
        assert cached is not None
        assert cached["convictionScore"] == res["convictionScore"]

        # Verify deterministic copilot fallback
        answer = svc.ask_copilot(
            ticker="NVDA",
            question="Is this a good time to buy?",
            stock_data={"profile": profile, "signals": signals, "aiAnalysis": res, "timeseries": timeseries},
            api_key="",
            provider="anthropic",
            model="claude-sonnet-5-5",
        )
        assert "NVDA" in answer

    def test_cache_namespaced_by_provider_and_model(self, tmp_path):
        svc = AIService(cache_dir=str(tmp_path))
        profile, timeseries, signals, news = _sample_stock_inputs()

        mock_claude = _make_mock_response(200, {"content": [{"type": "text", "text": "CLAUDE_MEMO " + ("x" * 50)}]})
        mock_openai = _make_mock_response(200, {"choices": [{"message": {"content": "OPENAI_MEMO " + ("y" * 50)}}]})

        with patch("services.ai_service.requests.post", return_value=mock_claude):
            res_c = svc.generate_ai_analysis(
                profile, timeseries, signals, news=news,
                api_key="sk-ant-key-1234", provider="anthropic", model="claude-sonnet-5-5"
            )
        with patch("services.ai_service.requests.post", return_value=mock_openai):
            res_o = svc.generate_ai_analysis(
                profile, timeseries, signals, news=news,
                api_key="sk-proj-key-1234", provider="openai", model="gpt-6.1-sol"
            )

        assert res_c["executiveThesis"].startswith("CLAUDE_MEMO")
        assert res_o["executiveThesis"].startswith("OPENAI_MEMO")
        assert svc._get_cached("full_ai_analysis:NVDA:anthropic:claude-sonnet-5-5") is not None
        assert svc._get_cached("full_ai_analysis:NVDA:openai:gpt-6.1-sol") is not None

    def test_legacy_ai_settings_normalization(self):
        legacy = {"apiKey": "AIzaTest123", "model": "gemini-3.7-flash"}
        norm = normalize_ai_settings(legacy)
        assert norm["provider"] == "gemini"
        assert norm["model"] == "gemini-3.7-flash"
        assert norm["apiKey"] == "AIzaTest123"
        assert norm["apiKeys"]["gemini"] == "AIzaTest123"

        switched = normalize_ai_settings({"provider": "anthropic", "model": "claude-sonnet-5-5", "apiKey": "sk-ant-9"}, existing=norm)
        assert switched["provider"] == "anthropic"
        assert switched["apiKey"] == "sk-ant-9"
        assert switched["apiKeys"]["gemini"] == "AIzaTest123"
        assert switched["apiKeys"]["anthropic"] == "sk-ant-9"


class TestFlaskEndpoints:
    def test_index_and_catalog(self):
        client = app_module.app.test_client()

        home = client.get("/")
        assert home.status_code == 200
        html = home.get_data(as_text=True)
        assert "lucide@1.77.0" in html
        assert "apexcharts@8.9.1" not in html
        assert "integrity=\"sha384-" in html
        assert "dist/app.bundle.min.js" in html
        assert "dist/style.min.css" in html
        assert 'name="csrf-token"' in html
        assert 'href="/manifest.json"' in html
        assert 'id="aiProviderSelect"' in html
        assert 'id="aiCustomModelInput"' in html

        with open("static/js/modules/backtest/backtest_engine.js", "r", encoding="utf-8") as f:
            bt_js = f.read()
        assert "apexcharts@8.9.1" in bt_js
        assert "sha384-NMzs+HvEnYQxcfWzTfKMJdncu8Hl66AUsbR9Lj+7oRso0Li/Aa5I4OpzHMyesaue" in bt_js

        cat_resp = client.get("/api/ai/catalog")
        assert cat_resp.status_code == 200
        cat = cat_resp.get_json()
        assert cat["success"] is True
        assert set(cat["providers"].keys()) == {"gemini", "anthropic", "openai"}
        gemini_ids = [m["id"] for m in cat["providers"]["gemini"]["models"]]
        claude_ids = [m["id"] for m in cat["providers"]["anthropic"]["models"]]
        openai_ids = [m["id"] for m in cat["providers"]["openai"]["models"]]
        assert "gemini-4-hydrogen" in gemini_ids and "gemini-4-neon" in gemini_ids
        assert "claude-sonnet-5-5" in claude_ids and "claude-opus-5-5" in claude_ids
        assert "gpt-6.1-sol" in openai_ids and "gpt-6-astra" in openai_ids

    def test_test_ai_legacy_alias_and_models_and_chat(self, tmp_path, monkeypatch):
        monkeypatch.setattr(ai_service, "cache_dir", str(tmp_path))
        ai_service._cache.clear()
        client = app_module.app.test_client()

        login_resp = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "Sup3rStr0ng!Pass#2026"},
        )
        assert login_resp.status_code == 200
        csrf_headers = {"X-CSRF-Token": login_resp.get_json()["csrfToken"]}

        # 1. /api/test-ai & /api/test-gemini
        ok_gemini = _make_mock_response(200, {"candidates": [{"content": {"parts": [{"text": "OK"}]}}]})
        with patch("services.ai_service.requests.post", return_value=ok_gemini):
            r1 = client.post(
                "/api/test-ai",
                json={"provider": "gemini", "apiKey": "AIzaKey1234", "model": "gemini-4-hydrogen"},
                headers=csrf_headers,
            )
            r2 = client.post(
                "/api/test-gemini",
                json={"apiKey": "AIzaKey1234", "model": "gemini-4-hydrogen"},
                headers=csrf_headers,
            )
        assert r1.status_code == 200 and r1.get_json()["success"] is True
        assert r2.status_code == 200 and r2.get_json()["success"] is True

        # 2. /api/ai/models
        live_openai = _make_mock_response(
            200,
            {"data": [{"id": "gpt-6.1-sol"}, {"id": "gpt-6-luna"}, {"id": "text-embedding-3-large"}]},
        )
        with patch("services.ai_service.requests.get", return_value=live_openai):
            rm = client.post(
                "/api/ai/models",
                json={"provider": "openai", "apiKey": "sk-proj-1234"},
                headers=csrf_headers,
            )
        assert rm.status_code == 200
        mdata = rm.get_json()
        assert mdata["success"] is True
        returned_ids = [m["id"] for m in mdata["models"]]
        assert "gpt-6.1-sol" in returned_ids
        assert "text-embedding-3-large" not in returned_ids

        # 3. /api/ai-chat with Anthropic & empty-question validation
        bad_chat = client.post(
            "/api/ai-chat",
            json={"ticker": "NVDA", "question": "   "},
            headers=csrf_headers,
        )
        assert bad_chat.status_code == 400

        profile, timeseries, signals, _ = _sample_stock_inputs()
        ok_claude = _make_mock_response(200, {"content": [{"type": "text", "text": "Bullish setup at $140."}]})
        with patch("services.ai_service.requests.post", return_value=ok_claude):
            chat_resp = client.post(
                "/api/ai-chat",
                json={
                    "ticker": "NVDA",
                    "question": "What is the outlook?",
                    "provider": "anthropic",
                    "model": "claude-sonnet-5-5",
                    "apiKey": "sk-ant-test-1234",
                    "stockData": {"profile": profile, "signals": signals, "timeseries": timeseries},
                },
                headers=csrf_headers,
            )
        assert chat_resp.status_code == 200
        cdata = chat_resp.get_json()
        assert cdata["success"] is True
        assert "Bullish setup at $140." in cdata["answer"]
        assert "Anthropic Claude" in cdata["answer"]

    def test_newly_listed_ipo_two_bar_stock_analysis(self, tmp_path, monkeypatch):
        import pandas as pd
        from services.stock_service import StockService

        monkeypatch.setattr(ai_service, "cache_dir", str(tmp_path))
        ai_service._cache.clear()

        # Replicate a 2-session IPO dataframe (like ANT)
        df = pd.DataFrame(
            [
                {"Open": 111.50, "High": 115.10, "Low": 92.72, "Close": 97.17, "Volume": 857312300},
                {"Open": 89.86, "High": 92.56, "Low": 83.05, "Close": 88.91, "Volume": 399561400},
            ],
            index=pd.to_datetime(["2026-11-19", "2026-11-20"]),
        )
        enriched = StockService.calculate_technical_indicators(df.copy())
        assert "ATR" in enriched.columns and enriched["ATR"].iloc[-1] > 0
        assert "VWAP" in enriched.columns and enriched["VWAP"].iloc[-1] > 0
        assert "CMF" in enriched.columns

        summary = StockService.generate_technical_summary(enriched)
        assert "VWAP" in summary["indicators"]
        assert "CMF" in summary["indicators"]

        profile = {
            "ticker": "ANT",
            "name": "Anthropic",
            "currentPrice": 88.91,
            "changePercent": -8.5,
            "atr": float(enriched["ATR"].iloc[-1]),
            "vwap": float(enriched["VWAP"].iloc[-1]),
            "cmf": float(enriched["CMF"].iloc[-1]),
            "sector": "AI Infrastructure",
        }
        ts = [
            {"time": "2026-11-19", "open": 111.50, "high": 115.10, "low": 92.72, "close": 97.17, "volume": 857312300},
            {"time": "2026-11-20", "open": 89.86, "high": 92.56, "low": 83.05, "close": 88.91, "volume": 399561400},
        ]
        ai_res = ai_service.generate_ai_analysis(
            profile=profile,
            timeseries=ts,
            signals=summary,
            news=[{"title": "Anthropic IPO debut draws strong institutional volume", "publisher": "Reuters", "timeAgo": "1d ago"}],
            allow_llm=False,
        )
        assert "error" not in ai_res
        assert ai_res["isLimitedHistory"] is True
        assert ai_res["executiveThesis"]
        assert ai_res["newsSynthesis"]["summary"]
        assert "confluence" in ai_res
        assert "tradeLevels" in ai_res and "scenario30d" in ai_res

        # Full /api/analyze route sets isFastHydration=False on the stock item
        client = app_module.app.test_client()
        login_resp = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "Sup3rStr0ng!Pass#2026"},
        )
        assert login_resp.status_code == 200
        csrf_headers = {"X-CSRF-Token": login_resp.get_json()["csrfToken"]}

        mock_full = {
            "stocks": {
                "ANT": {
                    "profile": profile,
                    "signals": summary,
                    "timeseries": ts,
                    "backtests": {"quant": {}},
                    "news": [],
                    "isFastHydration": False,
                }
            },
            "tickers": ["ANT"],
            "isFastHydration": False,
        }
        with patch("routes.stock_routes.stock_service.fetch_full_stock_analysis", return_value=mock_full):
            resp = client.post(
                "/api/analyze",
                json={"tickers": ["ANT"], "phase": "full"},
                headers=csrf_headers,
            )
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["stocks"]["ANT"]["isFastHydration"] is False
        assert "error" not in body["stocks"]["ANT"]["aiAnalysis"]
        assert body["stocks"]["ANT"]["aiAnalysis"]["isLimitedHistory"] is True

    def test_fast_phase_include_timeseries_and_period_slicing(self, tmp_path, monkeypatch):
        import pandas as pd
        import routes.stock_routes as stock_routes

        cache_dir = tmp_path / "stock_cache"
        cache_dir.mkdir(parents=True, exist_ok=True)
        dates = pd.bdate_range(end="2026-11-20", periods=300)
        df = pd.DataFrame(
            {
                "Open": [100.0 + i * 0.2 for i in range(300)],
                "High": [102.0 + i * 0.2 for i in range(300)],
                "Low": [99.0 + i * 0.2 for i in range(300)],
                "Close": [101.0 + i * 0.2 for i in range(300)],
                "Volume": [1_000_000 + i * 1000 for i in range(300)],
            },
            index=dates,
        )
        df.index.name = "Date"
        df.to_csv(cache_dir / "NEWCO_1d.csv")

        monkeypatch.setattr(stock_routes.stock_service, "cache_dir", str(cache_dir))
        stock_routes.stock_service._analysis_cache.clear()

        client = app_module.app.test_client()
        login_resp = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "Sup3rStr0ng!Pass#2026"},
        )
        assert login_resp.status_code == 200
        csrf_headers = {"X-CSRF-Token": login_resp.get_json()["csrfToken"]}

        resp_ts = client.post(
            "/api/analyze",
            json={
                "tickers": ["NEWCO"],
                "period": "1y",
                "interval": "1d",
                "phase": "fast",
                "includeTimeseries": True,
            },
            headers=csrf_headers,
        )
        assert resp_ts.status_code == 200
        body = resp_ts.get_json()
        assert body["isFastHydration"] is True
        assert body["period"] == "1y"
        s = body["stocks"]["NEWCO"]
        assert s["period"] == "1y"
        assert len(s["timeseries"]) == 252
        pt = s["timeseries"][-1]
        for field in ("open", "high", "low", "close", "superTrend", "rsi", "macd", "stochK", "cmf", "aiConviction"):
            assert pt.get(field) is not None
        for pfield in ("open", "dayHigh", "dayLow", "fiftyTwoWeekHigh", "fiftyTwoWeekLow", "volume", "avgVolume"):
            assert s["profile"].get(pfield) is not None

        # Watchlist Stage 1 (includeTimeseries=False) stays lightweight without timeseries
        resp_spark = client.post(
            "/api/analyze",
            json={
                "tickers": ["NEWCO"],
                "period": "1mo",
                "interval": "1d",
                "phase": "fast",
                "includeTimeseries": False,
            },
            headers=csrf_headers,
        )
        assert resp_spark.status_code == 200
        s_spark = resp_spark.get_json()["stocks"]["NEWCO"]
        assert "timeseries" not in s_spark
        assert len(s_spark["sparkline"]) == 30

    def test_server_resolved_six_char_company_name_returns_resolved_ticker(self, tmp_path, monkeypatch):
        import pandas as pd
        import routes.stock_routes as stock_routes

        cache_dir = tmp_path / "stock_cache"
        cache_dir.mkdir(parents=True, exist_ok=True)
        dates = pd.bdate_range(end="2026-11-20", periods=10)
        df = pd.DataFrame(
            {
                "Open": [260.0 + i for i in range(10)],
                "High": [265.0 + i for i in range(10)],
                "Low": [258.0 + i for i in range(10)],
                "Close": [262.0 + i for i in range(10)],
                "Volume": [2_000_000] * 10,
            },
            index=dates,
        )
        df.index.name = "Date"
        df.to_csv(cache_dir / "GOOGL_1d.csv")

        monkeypatch.setattr(stock_routes.stock_service, "cache_dir", str(cache_dir))
        stock_routes.stock_service._analysis_cache.clear()

        client = app_module.app.test_client()
        login_resp = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "Sup3rStr0ng!Pass#2026"},
        )
        assert login_resp.status_code == 200
        csrf_headers = {"X-CSRF-Token": login_resp.get_json()["csrfToken"]}

        with patch.object(
            stock_routes.stock_service,
            "search_stocks",
            return_value=[{"ticker": "GOOGL", "name": "Alphabet Inc."}],
        ):
            resp = client.post(
                "/api/analyze",
                json={
                    "tickers": ["GOOGLE"],
                    "period": "6mo",
                    "interval": "1d",
                    "phase": "fast",
                    "includeTimeseries": True,
                },
                headers=csrf_headers,
            )
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["tickers"] == ["GOOGL"]
        assert "GOOGL" in body["stocks"]
        assert len(body["stocks"]["GOOGL"]["timeseries"]) == 10

    def test_historical_dataframe_upgrades_2y_cache_on_5y_and_checks_once_per_ttl(self, tmp_path):
        import pandas as pd
        from services.stock_service import StockService

        svc = StockService()
        svc.cache_dir = str(tmp_path)

        # 1. Fresh 500-row (2y) CSV upgrades to 1300 rows when 5y is requested
        dates_2y = pd.bdate_range(end="2026-11-20", periods=500)
        df_2y = pd.DataFrame(
            {"Open": 50.0, "High": 51.0, "Low": 49.0, "Close": 50.5, "Volume": 500_000},
            index=dates_2y,
        )
        df_2y.index.name = "Date"
        df_2y.to_csv(tmp_path / "MSFTEST_1d.csv")

        dates_5y = pd.bdate_range(end="2026-11-20", periods=1300)
        df_5y = pd.DataFrame(
            {"Open": 40.0, "High": 41.0, "Low": 39.0, "Close": 40.5, "Volume": 600_000},
            index=dates_5y,
        )

        with patch("services.stock_service.yf.download", return_value=df_5y) as mock_dl:
            out = svc.get_historical_dataframe("MSFTEST", period="5y", interval="1d")
        assert mock_dl.call_count == 1
        assert mock_dl.call_args.kwargs.get("period") == "5y"
        assert len(out) == 1300

        # 2. Short-history IPO (100 rows < 1180) checks 5y download only once per TTL
        dates_short = pd.bdate_range(end="2026-11-20", periods=100)
        df_short = pd.DataFrame(
            {"Open": 80.0, "High": 82.0, "Low": 79.0, "Close": 81.0, "Volume": 900_000},
            index=dates_short,
        )
        df_short.index.name = "Date"
        df_short.to_csv(tmp_path / "SHORT5Y_1d.csv")

        with patch("services.stock_service.yf.download", return_value=df_short) as mock_dl_short:
            out1 = svc.get_historical_dataframe("SHORT5Y", period="5y", interval="1d")
            out2 = svc.get_historical_dataframe("SHORT5Y", period="5y", interval="1d")
        assert mock_dl_short.call_count == 1
        assert len(out1) == 100
        assert len(out2) == 100

    def test_prehydrate_universe_and_fetch_stock_news_imports(self, tmp_path):
        import pandas as pd
        from services.stock_service import StockService

        svc = StockService()
        svc.cache_dir = str(tmp_path)

        with patch.object(svc, "get_historical_dataframe", return_value=pd.DataFrame()), patch.object(
            svc, "_process_single_ticker_fast", return_value=("TEST", {})
        ), patch.object(
            svc, "_process_single_ticker", return_value=("TEST", {})
        ), patch.object(
            svc, "purge_expired_caches", return_value={}
        ):
            res = svc.prehydrate_universe(tickers=["TEST"])

        assert res["warmed_count"] == 1
        assert res["tickers"] == ["TEST"]

        sample_articles = [{"title": "Test Catalyst", "publisher": "Reuters", "url": "https://example.com"}]
        with patch("services.stock_service.news_service.fetch_global_news", return_value=sample_articles) as mock_news:
            news = svc.fetch_stock_news("TEST", company_name="Test Corp")

        mock_news.assert_called_once()
        assert news == sample_articles
