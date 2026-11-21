import hashlib
import json
import math
import os
import re
import time
import numpy as np
import pandas as pd
import requests
from services.cache_utils import BoundedTTLCache


DEFAULT_AI_PROVIDER = "gemini"
DEFAULT_AI_MODEL = "gemini-4-hydrogen"

AI_PROVIDER_CATALOG = {
    "gemini": {
        "id": "gemini",
        "name": "Google Gemini",
        "shortName": "Gemini",
        "envVar": "GEMINI_API_KEY",
        "defaultModel": "gemini-4-hydrogen",
        "fallbackModels": [
            "gemini-4-hydrogen",
            "gemini-3.8-flash",
            "gemini-3.1-flash-lite",
            "gemini-2.5-flash",
        ],
        "keyPlaceholder": "AIzaSy...",
        "keyHint": "Saved to your profile & browser session. Sent only to Google Gemini API.",
        "docsUrl": "https://aistudio.google.com/app/apikey",
        "docsLabel": "Get Key at Google AI Studio",
        "models": [
            {
                "id": "gemini-4-hydrogen",
                "label": "Gemini 4 Hydrogen (Fast & Recommended)",
                "tier": "Fast / Default",
                "description": "Unified 1M context, fast everyday reasoning & free-tier friendly."
            },
            {
                "id": "gemini-4-neon",
                "label": "Gemini 4 Neon (Balanced Frontier — Paid Tier)",
                "tier": "Paid Frontier",
                "description": "Requires paid billing tier on Google AI Studio; balanced frontier reasoning."
            },
            {
                "id": "gemini-4-carbon",
                "label": "Gemini 4 Carbon (Flagship Reasoning — Paid Tier)",
                "tier": "Paid Flagship",
                "description": "Requires paid billing tier; deepest logical reasoning for complex synthesis."
            },
            {
                "id": "gemini-4-argon",
                "label": "Gemini 4 Argon (Long-Horizon Frontier — Paid Tier)",
                "tier": "Paid Long-Horizon",
                "description": "Requires paid billing tier; general frontier and long-horizon model."
            },
            {
                "id": "gemini-3.8-flash",
                "label": "Gemini 3.8 Flash (Fast Free-Tier Fallback)",
                "tier": "Free Tier / Fast",
                "description": "Active high-speed Flash model with generous Google AI Studio free-tier quota."
            },
            {
                "id": "gemini-3.1-flash-lite",
                "label": "Gemini 3.1 Flash-Lite (Ultra-Low Latency Free Tier)",
                "tier": "Free Tier / Ultra-Fast",
                "description": "Lowest-latency model ideal for instant Copilot Q&A and high-frequency testing."
            },
            {
                "id": "gemini-2.5-flash",
                "label": "Gemini 2.5 Flash (Stable Legacy Free Tier)",
                "tier": "Free Tier / Stable",
                "description": "Previous-generation Flash model retained for free-tier backwards compatibility."
            },
        ],
    },
    "anthropic": {
        "id": "anthropic",
        "name": "Anthropic Claude",
        "shortName": "Claude",
        "envVar": "ANTHROPIC_API_KEY",
        "defaultModel": "claude-sonnet-5-5",
        "fallbackModels": ["claude-sonnet-5-5", "claude-haiku-5-5"],
        "keyPlaceholder": "sk-ant-...",
        "keyHint": "Saved to your profile & browser session. Sent only to Anthropic API.",
        "docsUrl": "https://console.anthropic.com/settings/keys",
        "docsLabel": "Get Key at Anthropic Console",
        "models": [
            {
                "id": "claude-sonnet-5-5",
                "label": "Claude Sonnet 5.5 (Balanced & Recommended)",
                "tier": "Balanced / Default",
                "description": "Optimal balance of analytical depth, clarity, and speed."
            },
            {
                "id": "claude-haiku-5-5",
                "label": "Claude Haiku 5.5 (Fast & Low-Latency)",
                "tier": "Fast / Low-Latency",
                "description": "Designed for high-volume, latency-sensitive requests."
            },
            {
                "id": "claude-opus-5-5",
                "label": "Claude Opus 5.5 (Flagship Agentic)",
                "tier": "Flagship Agentic",
                "description": "Complex knowledge work with adaptive thinking enabled."
            },
            {
                "id": "claude-fable-5-2",
                "label": "Claude Fable 5.2 (Frontier Deep Reasoning)",
                "tier": "Frontier Deep Reasoning",
                "description": "Top-tier demanding analytical and long-horizon reasoning."
            },
        ],
    },
    "openai": {
        "id": "openai",
        "name": "OpenAI GPT",
        "shortName": "OpenAI",
        "envVar": "OPENAI_API_KEY",
        "defaultModel": "gpt-6.1-sol",
        "fallbackModels": ["gpt-6.1-sol", "gpt-6.1-terra", "gpt-6-luna"],
        "keyPlaceholder": "sk-proj-...",
        "keyHint": "Saved to your profile & browser session. Sent only to OpenAI API.",
        "docsUrl": "https://platform.openai.com/api-keys",
        "docsLabel": "Get Key at OpenAI Platform",
        "models": [
            {
                "id": "gpt-6.1-sol",
                "label": "GPT-6.1 Sol (Balanced & Recommended)",
                "tier": "Balanced / Default",
                "description": "High-performance analysis & coding (1.05M context)."
            },
            {
                "id": "gpt-6-luna",
                "label": "GPT-6 Luna (Fast & Cost-Effective)",
                "tier": "Fast / Cost-Effective",
                "description": "Lightweight model built for high-throughput tasks."
            },
            {
                "id": "gpt-6.1-terra",
                "label": "GPT-6.1 Terra (Mid-Tier Balanced)",
                "tier": "Mid-Tier Balanced",
                "description": "Balanced performance and cost-efficiency for daily workflows."
            },
            {
                "id": "gpt-6-astra",
                "label": "GPT-6 Astra (Flagship Reasoning)",
                "tier": "Flagship Reasoning",
                "description": "Highest-intelligence GPT-6 frontier reasoning model."
            },
            {
                "id": "gpt-6.2-astra",
                "label": "GPT-6.2 Astra (Latest Flagship)",
                "tier": "Latest Flagship",
                "description": "Latest Astra frontier model variant."
            },
        ],
    },
}


class AIService:
    """
    AI Financial Intelligence & Quantitative Synthesis Service.
    Provides automated AI Investment Theses, Trade Target Matrices, 
    Probabilistic Scenario Modeling, Dual-Tier Memory + Disk Response Caching,
    Multi-Model Rate-Limit Fallbacks, and an Interactive Context-Aware AI Copilot.
    """

    def __init__(self, cache_dir: str = None):
        # In-memory response cache with bounded LRU eviction (max 30 items)
        self._cache = BoundedTTLCache(max_size=30, default_ttl=14400, name="AICache")
        if cache_dir:
            self.cache_dir = cache_dir
        else:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.cache_dir = os.path.join(base_dir, 'data', 'cache', 'ai')
        try:
            os.makedirs(self.cache_dir, exist_ok=True)
        except Exception:
            pass

    def _get_disk_filename(self, key: str) -> str:
        """Generates a safe filename for persistent cache key storage."""
        clean_prefix = re.sub(r'[^a-zA-Z0-9_-]', '_', key)[:32].strip('_')
        key_hash = hashlib.sha256(key.encode('utf-8')).hexdigest()[:16]
        return f"{clean_prefix}_{key_hash}.json" if clean_prefix else f"{key_hash}.json"

    def _get_cached(self, key: str):
        """Retrieves a cached item from RAM or persistent disk if not expired."""
        now = time.time()
        # 1. Check in-memory cache
        val = self._cache.get(key)
        if val is not None:
            return val

        # 2. Check persistent disk cache
        if hasattr(self, 'cache_dir') and self.cache_dir:
            filepath = os.path.join(self.cache_dir, self._get_disk_filename(key))
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        disk_entry = json.load(f)
                    if disk_entry.get("expires_at", 0) > now:
                        val = disk_entry.get("value")
                        # Hydrate RAM cache with remaining TTL
                        rem_ttl = max(1.0, disk_entry["expires_at"] - now)
                        self._cache.set(key, val, ttl=rem_ttl)
                        return val
                    else:
                        try:
                            os.remove(filepath)
                        except OSError:
                            pass
                except Exception:
                    pass
        return None

    def _set_cached(self, key: str, value, ttl_seconds: int = 14400):
        """Saves an item to RAM and persistent disk cache (default 4 hours / 14,400s)."""
        now = time.time()
        expires_at = now + ttl_seconds

        # Save to Bounded RAM cache
        self._cache.set(key, value, ttl=ttl_seconds)

        # Persist to disk
        if hasattr(self, 'cache_dir') and self.cache_dir:
            filepath = os.path.join(self.cache_dir, self._get_disk_filename(key))
            try:
                temp_path = filepath + f".tmp_{os.getpid()}"
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump({
                        "key": key,
                        "value": value,
                        "saved_at": now,
                        "expires_at": expires_at
                    }, f, ensure_ascii=False)
                os.replace(temp_path, filepath)
            except Exception:
                pass

    @staticmethod
    def normalize_provider(provider: str = None, model: str = None) -> str:
        """Resolves a canonical provider key ('gemini', 'anthropic', 'openai')."""
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

    @classmethod
    def get_default_model(cls, provider: str = DEFAULT_AI_PROVIDER) -> str:
        clean = cls.normalize_provider(provider)
        return AI_PROVIDER_CATALOG.get(clean, {}).get("defaultModel", DEFAULT_AI_MODEL)

    @classmethod
    def get_provider_catalog(cls) -> dict:
        """Returns supported provider metadata and server env-key availability flags."""
        server_keys = {}
        for pid, cfg in AI_PROVIDER_CATALOG.items():
            env_var = cfg.get("envVar", "")
            server_keys[pid] = bool(env_var and len(os.environ.get(env_var, "").strip()) > 6)
        return {
            "defaultProvider": DEFAULT_AI_PROVIDER,
            "defaultModel": DEFAULT_AI_MODEL,
            "providers": AI_PROVIDER_CATALOG,
            "serverKeysConfigured": server_keys,
        }

    @classmethod
    def resolve_api_key(cls, provider: str, api_key: str = None, api_keys: dict = None) -> str:
        """Resolves API key in priority order: explicit key -> per-provider map -> server env var."""
        clean = cls.normalize_provider(provider)
        if api_key and str(api_key).strip():
            return str(api_key).strip()
        if isinstance(api_keys, dict):
            mapped = str(api_keys.get(clean, "") or "").strip()
            if mapped:
                return mapped
        env_var = AI_PROVIDER_CATALOG.get(clean, {}).get("envVar", "")
        if env_var:
            return os.environ.get(env_var, "").strip()
        return ""

    @classmethod
    def resolve_any_provider_key(
        cls,
        preferred_provider: str = DEFAULT_AI_PROVIDER,
        api_key: str = None,
        api_keys: dict = None,
        model: str = None,
    ) -> tuple[str, str, str]:
        """Finds an available (provider, api_key, model) tuple starting with the preferred provider."""
        pref = cls.normalize_provider(preferred_provider, model)
        target_model = (model or "").strip() or cls.get_default_model(pref)

        key = cls.resolve_api_key(pref, api_key=api_key, api_keys=api_keys)
        if len(key) > 6:
            return pref, key, target_model

        for pid in ("gemini", "anthropic", "openai"):
            if pid == pref:
                continue
            cand_key = cls.resolve_api_key(pid, api_keys=api_keys)
            if len(cand_key) > 6:
                return pid, cand_key, cls.get_default_model(pid)

        return pref, "", target_model

    @staticmethod
    def _extract_http_error(resp) -> str:
        try:
            err_body = resp.json()
            err_obj = err_body.get("error")
            if isinstance(err_obj, dict):
                return str(err_obj.get("message") or err_obj.get("type") or resp.text[:200])
            if isinstance(err_obj, str):
                return err_obj
            if err_body.get("message"):
                return str(err_body.get("message"))
        except Exception:
            pass
        return resp.text[:200] if getattr(resp, "text", None) else f"HTTP {resp.status_code}"

    @staticmethod
    def _sanitize_chat_history(chat_history: list = None, max_turns: int = 8) -> list[dict]:
        """Normalizes recent conversation turns for multi-provider message payloads."""
        if not isinstance(chat_history, list) or not chat_history:
            return []
        cleaned = []
        for item in chat_history[-max_turns:]:
            if not isinstance(item, dict):
                continue
            raw_role = str(item.get("role") or "").strip().lower()
            content = str(item.get("content") or item.get("text") or "").strip()
            if not content:
                continue
            role = "assistant" if raw_role in ("assistant", "model", "ai") else "user"
            if len(content) > 2000:
                content = content[:2000] + "..."
            cleaned.append({"role": role, "content": content})
        return cleaned

    @staticmethod
    def _build_provider_request(
        provider: str,
        model: str,
        prompt: str,
        api_key: str,
        system_prompt: str = None,
        max_tokens: int = 2048,
        thinking_level: str = None,
        reasoning_effort: str = None,
        chat_history: list = None,
        stream: bool = False,
    ) -> tuple[str, dict, dict]:
        """Builds (url, headers, payload) for Gemini, Anthropic, or OpenAI REST calls."""
        clean_key = str(api_key or "").strip()
        history = AIService._sanitize_chat_history(chat_history)

        if provider == "anthropic":
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "x-api-key": clean_key,
                "anthropic-version": "2026-10-21",
                "Content-Type": "application/json",
            }
            messages = []
            for turn in history:
                if not messages and turn["role"] != "user":
                    continue
                if messages and messages[-1]["role"] == turn["role"]:
                    messages[-1]["content"] += "\n\n" + turn["content"]
                else:
                    messages.append({"role": turn["role"], "content": turn["content"]})
            if messages and messages[-1]["role"] == "user":
                messages[-1]["content"] += "\n\n" + prompt
            else:
                messages.append({"role": "user", "content": prompt})

            payload = {
                "model": model,
                "max_tokens": max_tokens,
                "messages": messages,
            }
            if system_prompt:
                payload["system"] = system_prompt
            if stream:
                payload["stream"] = True
            return url, headers, payload

        if provider == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {clean_key}",
                "Content-Type": "application/json",
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            for turn in history:
                messages.append({"role": turn["role"], "content": turn["content"]})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": model,
                "messages": messages,
                "max_completion_tokens": max_tokens,
            }
            if reasoning_effort:
                payload["reasoning_effort"] = reasoning_effort
            if stream:
                payload["stream"] = True
            return url, headers, payload

        # Google Gemini
        api_version = "v1" if model in ("gemini-pro", "gemini-1.0-pro") else "v1beta"
        action = "streamGenerateContent?alt=sse" if stream else "generateContent"
        url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:{action}"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": clean_key,
        }
        gen_config = {"maxOutputTokens": max_tokens}
        if model.startswith("gemini-4"):
            if thinking_level:
                gen_config["thinkingConfig"] = {"thinkingLevel": str(thinking_level).strip().upper()}
        else:
            gen_config["temperature"] = 0.2

        contents = []
        for turn in history:
            gem_role = "model" if turn["role"] == "assistant" else "user"
            contents.append({"role": gem_role, "parts": [{"text": turn["content"]}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": gen_config,
        }
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}
        return url, headers, payload

    @classmethod
    def _call_gemini_api(
        cls,
        prompt: str,
        api_key: str,
        model_name: str = "gemini-4-hydrogen",
        system_prompt: str = None,
        allow_fallback: bool = True,
        timeout: int = 45,
        max_tokens: int = 2048,
        thinking_level: str = None,
        chat_history: list = None,
    ) -> tuple[str, str, str]:
        """
        Invokes Google Gemini REST API using x-goog-api-key header authentication.
        Supports Gemini 4 thinkingConfig and filters internal thought parts from responses.
        Returns tuple: (response_text, actual_model_used, error_message)
        """
        if not api_key or not str(api_key).strip():
            return "", "", "Missing Google Gemini API key."

        clean_key = str(api_key).strip()
        preferred_model = (model_name or "gemini-4-hydrogen").strip()

        candidate_models = [preferred_model]
        if allow_fallback:
            for m in AI_PROVIDER_CATALOG["gemini"]["fallbackModels"]:
                if m not in candidate_models:
                    candidate_models.append(m)

        last_error = ""

        for model in candidate_models:
            api_version = "v1" if model in ("gemini-pro", "gemini-1.0-pro") else "v1beta"
            url, headers, payload = cls._build_provider_request(
                provider="gemini",
                model=model,
                prompt=prompt,
                api_key=clean_key,
                system_prompt=system_prompt,
                max_tokens=max_tokens,
                thinking_level=thinking_level,
                chat_history=chat_history,
                stream=False,
            )

            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
                if resp.status_code == 404 and api_version == "v1beta" and model in ("gemini-pro", "gemini-1.0-pro"):
                    v1_url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent"
                    resp = requests.post(v1_url, json=payload, headers=headers, timeout=timeout)

                if resp.status_code == 200:
                    res_data = resp.json()
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        text_chunks = [
                            p.get("text", "")
                            for p in parts
                            if isinstance(p, dict) and not p.get("thought") and p.get("text")
                        ]
                        text = "\n".join(text_chunks).strip()
                        if text:
                            return text, model, ""
                    return "", model, f"Empty response received from {model}."

                err_msg = cls._extract_http_error(resp)
                last_error = f"Google Gemini API ({resp.status_code}) on {model}: {err_msg}"

                if resp.status_code in (401, 403) or (
                    resp.status_code == 400 and ("API_KEY_INVALID" in err_msg or "key not valid" in err_msg.lower())
                ):
                    return "", model, last_error

                if resp.status_code in (429, 503) and allow_fallback:
                    continue
                return "", model, last_error
            except requests.exceptions.Timeout:
                last_error = f"Gemini Connection Timeout on {model} (server latency high)"
                if allow_fallback:
                    continue
                return "", model, last_error
            except Exception as e:
                last_error = f"Gemini Connection Error on {model}: {str(e)}"
                if allow_fallback:
                    continue
                return "", model, last_error

        return "", preferred_model, last_error or f"Unable to reach Google Gemini API ({preferred_model})."

    @classmethod
    def _call_anthropic_api(
        cls,
        prompt: str,
        api_key: str,
        model_name: str = "claude-sonnet-5-5",
        system_prompt: str = None,
        allow_fallback: bool = True,
        timeout: int = 35,
        max_tokens: int = 2048,
        chat_history: list = None,
    ) -> tuple[str, str, str]:
        """
        Invokes Anthropic Messages API (anthropic-version: 2026-10-21).
        Omits unsupported sampling parameters (temperature/top_p/top_k) and extracts text blocks only.
        Returns tuple: (response_text, actual_model_used, error_message)
        """
        if not api_key or not str(api_key).strip():
            return "", "", "Missing Anthropic API key."

        clean_key = str(api_key).strip()
        preferred_model = (model_name or "claude-sonnet-5-5").strip()

        candidate_models = [preferred_model]
        if allow_fallback:
            for m in AI_PROVIDER_CATALOG["anthropic"]["fallbackModels"]:
                if m not in candidate_models:
                    candidate_models.append(m)

        last_error = ""

        for model in candidate_models:
            url, headers, payload = cls._build_provider_request(
                provider="anthropic",
                model=model,
                prompt=prompt,
                api_key=clean_key,
                system_prompt=system_prompt,
                max_tokens=max_tokens,
                chat_history=chat_history,
                stream=False,
            )

            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
                if resp.status_code == 200:
                    res_data = resp.json()
                    blocks = res_data.get("content", [])
                    text_chunks = [
                        b.get("text", "")
                        for b in blocks
                        if isinstance(b, dict) and b.get("type") == "text" and b.get("text")
                    ]
                    text = "\n".join(text_chunks).strip()
                    if text:
                        return text, model, ""
                    return "", model, f"Empty response received from {model}."

                err_msg = cls._extract_http_error(resp)
                last_error = f"Anthropic API ({resp.status_code}) on {model}: {err_msg}"

                if resp.status_code in (401, 403):
                    return "", model, last_error

                if resp.status_code in (429, 529, 503) and allow_fallback:
                    continue
                return "", model, last_error
            except requests.exceptions.Timeout:
                last_error = f"Anthropic Connection Timeout on {model} (server latency high)"
                if allow_fallback:
                    continue
                return "", model, last_error
            except Exception as e:
                last_error = f"Anthropic Connection Error on {model}: {str(e)}"
                if allow_fallback:
                    continue
                return "", model, last_error

        return "", preferred_model, last_error or f"Unable to reach Anthropic API ({preferred_model})."

    @classmethod
    def _call_openai_api(
        cls,
        prompt: str,
        api_key: str,
        model_name: str = "gpt-6.1-sol",
        system_prompt: str = None,
        allow_fallback: bool = True,
        timeout: int = 35,
        max_tokens: int = 2048,
        reasoning_effort: str = None,
        chat_history: list = None,
    ) -> tuple[str, str, str]:
        """
        Invokes OpenAI Chat Completions API using max_completion_tokens and omitting temperature
        for GPT-6 reasoning compatibility.
        Returns tuple: (response_text, actual_model_used, error_message)
        """
        if not api_key or not str(api_key).strip():
            return "", "", "Missing OpenAI API key."

        clean_key = str(api_key).strip()
        preferred_model = (model_name or "gpt-6.1-sol").strip()

        candidate_models = [preferred_model]
        if allow_fallback:
            for m in AI_PROVIDER_CATALOG["openai"]["fallbackModels"]:
                if m not in candidate_models:
                    candidate_models.append(m)

        last_error = ""

        for model in candidate_models:
            url, headers, payload = cls._build_provider_request(
                provider="openai",
                model=model,
                prompt=prompt,
                api_key=clean_key,
                system_prompt=system_prompt,
                max_tokens=max_tokens,
                reasoning_effort=reasoning_effort,
                chat_history=chat_history,
                stream=False,
            )

            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
                if resp.status_code == 200:
                    res_data = resp.json()
                    choices = res_data.get("choices", [])
                    if choices:
                        msg = choices[0].get("message", {})
                        content = msg.get("content", "")
                        if isinstance(content, str):
                            text = content.strip()
                        elif isinstance(content, list):
                            text = "\n".join(
                                p.get("text", "")
                                for p in content
                                if isinstance(p, dict)
                                and p.get("type") in ("text", "output_text", None)
                                and p.get("text")
                            ).strip()
                        else:
                            text = ""
                        if text:
                            return text, model, ""
                    return "", model, f"Empty response received from {model}."

                err_msg = cls._extract_http_error(resp)
                last_error = f"OpenAI API ({resp.status_code}) on {model}: {err_msg}"

                if resp.status_code in (401, 403):
                    return "", model, last_error

                if resp.status_code in (429, 503) and allow_fallback:
                    continue
                return "", model, last_error
            except requests.exceptions.Timeout:
                last_error = f"OpenAI Connection Timeout on {model} (server latency high)"
                if allow_fallback:
                    continue
                return "", model, last_error
            except Exception as e:
                last_error = f"OpenAI Connection Error on {model}: {str(e)}"
                if allow_fallback:
                    continue
                return "", model, last_error

        return "", preferred_model, last_error or f"Unable to reach OpenAI API ({preferred_model})."

    @classmethod
    def call_llm(
        cls,
        prompt: str,
        api_key: str,
        provider: str = DEFAULT_AI_PROVIDER,
        model_name: str = None,
        system_prompt: str = None,
        allow_fallback: bool = True,
        timeout: int = 45,
        max_tokens: int = 2048,
        thinking_level: str = None,
        reasoning_effort: str = None,
        chat_history: list = None,
    ) -> tuple[str, str, str]:
        """Unified multi-provider LLM invocation router."""
        clean_provider = cls.normalize_provider(provider, model_name)
        target_model = (model_name or "").strip() or cls.get_default_model(clean_provider)

        if clean_provider == "anthropic":
            return cls._call_anthropic_api(
                prompt=prompt,
                api_key=api_key,
                model_name=target_model,
                system_prompt=system_prompt,
                allow_fallback=allow_fallback,
                timeout=timeout,
                max_tokens=max_tokens,
                chat_history=chat_history,
            )
        if clean_provider == "openai":
            return cls._call_openai_api(
                prompt=prompt,
                api_key=api_key,
                model_name=target_model,
                system_prompt=system_prompt,
                allow_fallback=allow_fallback,
                timeout=timeout,
                max_tokens=max_tokens,
                reasoning_effort=reasoning_effort,
                chat_history=chat_history,
            )
        return cls._call_gemini_api(
            prompt=prompt,
            api_key=api_key,
            model_name=target_model,
            system_prompt=system_prompt,
            allow_fallback=allow_fallback,
            timeout=timeout,
            max_tokens=max_tokens,
            thinking_level=thinking_level,
            chat_history=chat_history,
        )

    @staticmethod
    def _extract_sse_text_delta(provider: str, data_str: str) -> str:
        """Extracts incremental text delta from a single parsed SSE payload per provider."""
        if not data_str or data_str == "[DONE]":
            return ""
        try:
            evt = json.loads(data_str)
        except Exception:
            return ""

        if provider == "gemini":
            candidates = evt.get("candidates") or []
            if not candidates:
                return ""
            parts = (candidates[0].get("content") or {}).get("parts") or []
            chunks = [
                p.get("text", "")
                for p in parts
                if isinstance(p, dict) and not p.get("thought") and p.get("text")
            ]
            return "".join(chunks)

        if provider == "anthropic":
            if evt.get("type") == "content_block_delta":
                delta = evt.get("delta") or {}
                if delta.get("type") == "text_delta":
                    return str(delta.get("text") or "")
            return ""

        if provider == "openai":
            choices = evt.get("choices") or []
            if choices:
                delta = choices[0].get("delta") or {}
                content = delta.get("content")
                if isinstance(content, str):
                    return content
            return ""

        return ""

    @classmethod
    def stream_llm(
        cls,
        prompt: str,
        api_key: str,
        provider: str = DEFAULT_AI_PROVIDER,
        model_name: str = None,
        system_prompt: str = None,
        allow_fallback: bool = True,
        timeout: int = 45,
        max_tokens: int = 2048,
        thinking_level: str = None,
        reasoning_effort: str = None,
        chat_history: list = None,
    ):
        """
        Streams text deltas from Gemini, Anthropic, or OpenAI via SSE.
        Yields dict events: {'type': 'delta', 'delta': str, 'model': str} or {'type': 'error', 'error': str, 'model': str}.
        """
        if not api_key or not str(api_key).strip():
            yield {"type": "error", "error": "Missing API key.", "model": ""}
            return

        clean_provider = cls.normalize_provider(provider, model_name)
        preferred_model = (model_name or "").strip() or cls.get_default_model(clean_provider)

        candidate_models = [preferred_model]
        if allow_fallback:
            for m in AI_PROVIDER_CATALOG.get(clean_provider, {}).get("fallbackModels", []):
                if m not in candidate_models:
                    candidate_models.append(m)

        last_error = ""
        for model in candidate_models:
            url, headers, payload = cls._build_provider_request(
                provider=clean_provider,
                model=model,
                prompt=prompt,
                api_key=api_key,
                system_prompt=system_prompt,
                max_tokens=max_tokens,
                thinking_level=thinking_level,
                reasoning_effort=reasoning_effort,
                chat_history=chat_history,
                stream=True,
            )
            emitted_any = False
            try:
                with requests.post(url, json=payload, headers=headers, timeout=timeout, stream=True) as resp:
                    if resp.status_code == 200:
                        for raw_line in resp.iter_lines(decode_unicode=True):
                            if not raw_line:
                                continue
                            line = raw_line.strip() if isinstance(raw_line, str) else raw_line.decode("utf-8", errors="ignore").strip()
                            if not line.startswith("data:"):
                                continue
                            payload_str = line[5:].strip()
                            delta_txt = cls._extract_sse_text_delta(clean_provider, payload_str)
                            if delta_txt:
                                emitted_any = True
                                yield {"type": "delta", "delta": delta_txt, "model": model}
                        if emitted_any:
                            return
                        last_error = f"Empty stream received from {model}."
                        if allow_fallback:
                            continue
                        break

                    err_msg = cls._extract_http_error(resp)
                    last_error = f"{AI_PROVIDER_CATALOG.get(clean_provider, {}).get('name', clean_provider)} ({resp.status_code}) on {model}: {err_msg}"
                    if resp.status_code in (401, 403):
                        yield {"type": "error", "error": last_error, "model": model}
                        return
                    if resp.status_code in (429, 503, 529) and allow_fallback and not emitted_any:
                        continue
                    yield {"type": "error", "error": last_error, "model": model}
                    return
            except requests.exceptions.Timeout:
                last_error = f"Stream timeout on {model}"
                if allow_fallback and not emitted_any:
                    continue
                yield {"type": "error", "error": last_error, "model": model}
                return
            except Exception as exc:
                last_error = f"Stream error on {model}: {str(exc)}"
                if allow_fallback and not emitted_any:
                    continue
                yield {"type": "error", "error": last_error, "model": model}
                return

        yield {"type": "error", "error": last_error or "Streaming failed.", "model": preferred_model}

    @classmethod
    def test_provider_connection(
        cls,
        api_key: str,
        provider: str = DEFAULT_AI_PROVIDER,
        preferred_model: str = None,
    ) -> dict:
        """
        Tests the provider API key against the preferred model and its primary fallback.
        Returns a detailed per-model diagnostic report.
        """
        clean_provider = cls.normalize_provider(provider, preferred_model)
        provider_meta = AI_PROVIDER_CATALOG.get(clean_provider, AI_PROVIDER_CATALOG[DEFAULT_AI_PROVIDER])
        target_model = (preferred_model or "").strip() or provider_meta["defaultModel"]

        if not api_key or not str(api_key).strip():
            return {
                "success": False,
                "provider": clean_provider,
                "error": f"Missing {provider_meta['name']} API Key",
                "models": [],
                "preferredModel": target_model,
                "keyValid": False,
            }

        models_to_test = [target_model]
        for m in provider_meta.get("fallbackModels", []):
            if m not in models_to_test:
                models_to_test.append(m)
                if len(models_to_test) >= 3:
                    break

        report = []
        any_success = False
        saw_invalid_key = False

        for m in models_to_test:
            res_text, _, err = cls.call_llm(
                "Respond with 'OK'",
                api_key,
                provider=clean_provider,
                model_name=m,
                allow_fallback=False,
                timeout=30,
                max_tokens=256,
                thinking_level="low",
                reasoning_effort="low",
            )
            if res_text:
                any_success = True
                report.append({
                    "model": m,
                    "status": "online",
                    "message": f"Connected successfully ({res_text[:30]})"
                })
                break
            else:
                err_lower = err.lower()
                if (
                    "401" in err
                    or "403" in err
                    or "key not valid" in err_lower
                    or "api_key_invalid" in err_lower
                    or "invalid x-api-key" in err_lower
                    or "incorrect api key" in err_lower
                    or "authentication" in err_lower
                ):
                    status = "invalid_key"
                    saw_invalid_key = True
                elif "limit: 0" in err_lower or "free_tier" in err_lower or (
                    ("billing" in err_lower or "quota" in err_lower) and "429" in err and "0" in err_lower
                ):
                    status = "quota_zero"
                elif "429" in err or "529" in err or "quota" in err_lower or "rate" in err_lower:
                    status = "rate_limited"
                elif "503" in err or "high demand" in err_lower or "overloaded" in err_lower or "unavailable" in err_lower:
                    status = "overloaded"
                elif "timeout" in err_lower:
                    status = "timeout"
                elif "404" in err or "not_found" in err_lower or "does not exist" in err_lower:
                    status = "not_found"
                else:
                    status = "error"
                report.append({
                    "model": m,
                    "status": status,
                    "message": err
                })
                if status == "invalid_key":
                    break

        key_valid = any_success
        available_models_count = None
        if not any_success and not saw_invalid_key:
            try:
                models_probe = cls.list_provider_models(
                    api_key=api_key,
                    provider=clean_provider,
                    timeout=8,
                )
                if models_probe.get("success"):
                    key_valid = True
                    available_models_count = len(models_probe.get("models") or [])
            except Exception:
                pass

        return {
            "success": any_success,
            "provider": clean_provider,
            "models": report,
            "preferredModel": target_model,
            "keyValid": key_valid,
            "availableModelsCount": available_models_count,
        }

    @classmethod
    def test_model_cascade(cls, api_key: str, preferred_model: str = "gemini-4-hydrogen") -> dict:
        """Backwards-compatible Gemini diagnostic entrypoint."""
        return cls.test_provider_connection(api_key, provider="gemini", preferred_model=preferred_model)

    @classmethod
    def list_provider_models(cls, api_key: str = None, provider: str = DEFAULT_AI_PROVIDER, timeout: int = 12) -> dict:
        """Fetches live available model IDs from the selected provider's Models endpoint."""
        clean_provider = cls.normalize_provider(provider)
        provider_meta = AI_PROVIDER_CATALOG.get(clean_provider, AI_PROVIDER_CATALOG[DEFAULT_AI_PROVIDER])
        resolved_key = cls.resolve_api_key(clean_provider, api_key=api_key)

        if not resolved_key:
            return {
                "success": False,
                "provider": clean_provider,
                "models": [],
                "error": f"Provide a {provider_meta['name']} API key first to fetch live models.",
            }

        try:
            models = []
            if clean_provider == "gemini":
                resp = requests.get(
                    "https://generativelanguage.googleapis.com/v1beta/models",
                    headers={"x-goog-api-key": resolved_key},
                    timeout=timeout,
                )
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "provider": clean_provider,
                        "models": [],
                        "error": f"Gemini API ({resp.status_code}): {cls._extract_http_error(resp)}",
                    }
                for item in resp.json().get("models", []):
                    methods = item.get("supportedGenerationMethods") or []
                    if "generateContent" not in methods:
                        continue
                    mid = str(item.get("name", "")).replace("models/", "").strip()
                    if not mid or any(x in mid.lower() for x in ("embedding", "imagen", "veo", "aqa", "tts", "robotics")):
                        continue
                    models.append({
                        "id": mid,
                        "label": item.get("displayName") or mid,
                    })
            elif clean_provider == "anthropic":
                resp = requests.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "x-api-key": resolved_key,
                        "anthropic-version": "2026-10-21",
                    },
                    timeout=timeout,
                )
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "provider": clean_provider,
                        "models": [],
                        "error": f"Anthropic API ({resp.status_code}): {cls._extract_http_error(resp)}",
                    }
                for item in resp.json().get("data", []):
                    mid = str(item.get("id", "")).strip()
                    if mid:
                        models.append({
                            "id": mid,
                            "label": item.get("display_name") or mid,
                        })
            elif clean_provider == "openai":
                resp = requests.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {resolved_key}"},
                    timeout=timeout,
                )
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "provider": clean_provider,
                        "models": [],
                        "error": f"OpenAI API ({resp.status_code}): {cls._extract_http_error(resp)}",
                    }
                for item in resp.json().get("data", []):
                    mid = str(item.get("id", "")).strip()
                    ml = mid.lower()
                    if not mid:
                        continue
                    if not ml.startswith(("gpt-", "o1", "o3", "o4", "chatgpt-")):
                        continue
                    if any(x in ml for x in ("image", "realtime", "transcribe", "audio", "tts", "whisper", "embedding", "moderation")):
                        continue
                    models.append({"id": mid, "label": mid})

            # Deduplicate preserving curated order at the top
            curated_ids = [m["id"] for m in provider_meta.get("models", [])]
            by_id = {m["id"]: m for m in models}
            ordered = []
            for cid in curated_ids:
                if cid in by_id:
                    ordered.append(by_id.pop(cid))
            for mid in sorted(by_id.keys(), reverse=True):
                ordered.append(by_id[mid])

            return {
                "success": True,
                "provider": clean_provider,
                "models": ordered,
            }
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "provider": clean_provider,
                "models": [],
                "error": f"Connection timeout listing {provider_meta['name']} models.",
            }
        except Exception as e:
            return {
                "success": False,
                "provider": clean_provider,
                "models": [],
                "error": str(e),
            }

    def synthesize_news_sentiment(
        self,
        ticker: str,
        company_name: str,
        current_price: float,
        news_items: list[dict],
        api_key: str = None,
        provider: str = None,
        model: str = None,
        api_keys: dict = None,
        allow_llm: bool = True,
    ) -> dict:
        """
        Synthesizes recent news items into an institutional-grade Market Catalyst & Sentiment Summary.
        Supports Gemini, Anthropic, and OpenAI with caching and deterministic quant fallback.
        """
        if not news_items:
            return {
                'sentiment': 'Neutral',
                'sentimentScore': 50,
                'sentimentBadge': 'Neutral (50%)',
                'sentimentColor': 'neutral',
                'convictionDelta': 0.0,
                'catalystBullets': [
                    f"No recent breaking news flow detected for {ticker} ({company_name}). Technical momentum and quantitative indicator matrix currently drive primary market positioning."
                ],
                'summary': f"No recent breaking news headlines found for {ticker} ({company_name}). Technical momentum and quantitative indicator matrix currently drive primary market positioning."
            }

        # Build clean string representation of all available recent headlines (up to 30)
        news_lines = []
        bullets = []
        for i, n in enumerate(news_items[:30], 1):
            flag = n.get('flag', '🌐')
            country = n.get('country', 'Global')
            pub = n.get('publisher', 'Financial Wire')
            title = n.get('title', '')
            time_ago = n.get('timeAgo') or n.get('publishedAt') or 'Recent'
            news_lines.append(f"{i}. [{flag} {country} | {pub}] {title} ({time_ago})")
            if len(bullets) < 4 and title:
                bullets.append({
                    'flag': flag,
                    'country': country,
                    'publisher': pub,
                    'headline': title,
                    'url': n.get('url', '#'),
                    'timeAgo': time_ago
                })

        news_text = "\n".join(news_lines)

        clean_provider = self.normalize_provider(provider, model)
        clean_model = (model or "").strip() or self.get_default_model(clean_provider)
        news_hash = hashlib.sha256(news_text.encode('utf-8')).hexdigest()[:16]

        cache_key = f"news_summary:{ticker}:{news_hash}:{clean_provider}:{clean_model}"
        cached_summary = self._get_cached(cache_key)
        if cached_summary:
            return cached_summary

        resolved_key = self.resolve_api_key(clean_provider, api_key=api_key, api_keys=api_keys) if allow_llm else ""

        # 1. LLM synthesis if key available
        if allow_llm and resolved_key and len(resolved_key.strip()) > 6:
            prompt = f"""
            You are a chief market analyst at a quantitative hedge fund.
            Analyze the following multi-source global financial news headlines and catalyst reports for {company_name} ({ticker}, Current Price: ${current_price:.2f}):

            GLOBAL BREAKING NEWS HEADLINES:
            {news_text}

            TASK:
            1. Formulate an overall Market Sentiment assessment (one of: 'Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish') and a Sentiment Score (0 to 100).
            2. Write a concise 2-paragraph financial executive synthesis in English:
               - Paragraph 1: Key Global Catalysts & Narrative Drivers (summarize what is happening across the news stories, corporate updates, earnings reports, or macro trends).
               - Paragraph 2: Financial & Market Implication (how this news flow impacts {ticker}'s near-term price trajectory, investor sentiment, and trading levels around ${current_price:.2f}).
            Keep the tone strictly objective, institutional, and insightful.
            """
            try:
                llm_text, _, _ = self.call_llm(
                    prompt,
                    resolved_key,
                    provider=clean_provider,
                    model_name=clean_model,
                    allow_fallback=True,
                )
                if llm_text and len(llm_text) > 40:
                    lower_text = llm_text.lower()
                    if "strongly bullish" in lower_text or "strong bull" in lower_text:
                        sentiment = "Strong Bullish"
                        score = 85
                        color = "bullish"
                    elif "bullish" in lower_text or "positive" in lower_text or "growth" in lower_text:
                        sentiment = "Bullish"
                        score = 72
                        color = "bullish"
                    elif "strongly bearish" in lower_text or "strong bear" in lower_text:
                        sentiment = "Strong Bearish"
                        score = 20
                        color = "bearish"
                    elif "bearish" in lower_text or "negative" in lower_text or "downside" in lower_text:
                        sentiment = "Bearish"
                        score = 35
                        color = "bearish"
                    else:
                        sentiment = "Neutral"
                        score = 52
                        color = "neutral"

                    delta = round((score - 50) * 0.3, 1)  # Max ±15% conviction delta
                    result = {
                        'sentiment': sentiment,
                        'sentimentScore': score,
                        'sentimentBadge': f"{sentiment} ({score}%)",
                        'sentimentColor': color,
                        'convictionDelta': delta,
                        'catalystBullets': bullets,
                        'summary': llm_text
                    }
                    self._set_cached(cache_key, result, ttl_seconds=600)
                    return result
            except Exception:
                pass

        # 2. Advanced Multi-Factor Deterministic Catalyst & Sentiment Engine
        now_ts = int(time.time())
        tier1_sources = {'reuters', 'bloomberg', 'wall street journal', 'dow jones', 'financial times', 'tagesschau', 'handelsblatt', 'nikkei asia', 'caixin', 'sec', 'cnbc'}
        tier2_sources = {'marketwatch', 'barron\'s', 'investor\'s business daily', 'finanzen.net', 'les echos', 'infomoney', 'valor econômico', 'economic times'}

        def _matches_catalyst(text: str, patterns: list) -> bool:
            t = text.lower()
            for p in patterns:
                if isinstance(p, tuple):
                    if all(tok in t for tok in p):
                        return True
                elif p in t:
                    return True
            return False

        shocks_negative = [
            'fraud', 'subpoena', 'ceo ousted', 'ceo resigns', 'guidance slashed', 'bankruptcy', 'criminal probe',
            ('sec', 'investigation'), ('sec', 'probe'), ('doj', 'investigation'), ('doj', 'probe'), ('bafin', 'probe')
        ]
        bear_phrases = [
            'downgraded', 'antitrust', 'lawsuit', 'slumps', 'plunges', 'sell-off', 'loss widens', 'falling demand',
            'layoffs', 'delay', 'down today', 'shares slide', 'weak outlook', 'underperform', 'drops', 'falls',
            'tumble', 'retreated', 'decline', 'struggles', 'warning', 'headwind', 'cautions', 'cut', 'slump',
            ('earnings', 'miss'), ('misses', 'estimates'), ('lowered', 'guidance'), ('cut', 'forecast'),
            ('revenue', 'fell'), ('profit', 'dropped'), ('price target', 'cut'), ('target', 'lowered')
        ]
        
        shocks_positive = [
            'fda approval', 'all-time high', 'multi-billion contract', 'blowout quarter', 'breakout',
            ('earnings', 'beat'), ('beats', 'estimates'), ('record', 'revenue'), ('profit', 'surged'),
            ('raised', 'guidance'), ('boosts', 'outlook'), ('record', 'profit')
        ]
        bull_phrases = [
            'upgraded', 'outperform', 'dividend hike', 'share buyback', 'partnership', 'expansion',
            'accelerated growth', 'top pick', 'positive results', 'soared', 'surge', 'buy rating', 'strong momentum',
            'rallies', 'gains', 'upbeat', 'highs', 'jumps', 'rebound', 'bullish', 'strength', 'lead', 'climbs', 'tops',
            ('price target', 'raised'), ('target', 'lifted'), ('target', 'raised'), ('beats', 'revenue'), ('position', 'increased')
        ]

        weighted_bull = 0.0
        weighted_bear = 0.0
        active_items_count = 0

        for n in news_items:
            pub = str(n.get('publisher', '')).lower()
            title = str(n.get('title', '')).lower()
            summary_txt = str(n.get('summary', '')).lower()
            ts = n.get('timestamp', now_ts)

            # A. Source Credibility Weight
            if any(p in pub for p in tier1_sources):
                w_source = 1.5
            elif any(p in pub for p in tier2_sources):
                w_source = 1.2
            else:
                w_source = 0.9

            # B. Exponential Time Decay Weight
            dt_hours = max(0, (now_ts - ts) / 3600.0)
            if dt_hours <= 12:
                w_time = 1.0
            elif dt_hours <= 36:
                w_time = 0.8
            elif dt_hours <= 96:
                w_time = 0.6
            else:
                w_time = 0.35

            weight = w_source * w_time

            # C. Asymmetric Catalyst Detection
            item_bull = 0.0
            item_bear = 0.0

            if _matches_catalyst(title, shocks_negative): item_bear += 3.5
            elif _matches_catalyst(title, bear_phrases): item_bear += 1.8
            elif _matches_catalyst(summary_txt, bear_phrases): item_bear += 0.8

            if _matches_catalyst(title, shocks_positive): item_bull += 3.0
            elif _matches_catalyst(title, bull_phrases): item_bull += 1.6
            elif _matches_catalyst(summary_txt, bull_phrases): item_bull += 0.7

            if item_bull > 0 or item_bear > 0:
                active_items_count += 1
                weighted_bull += (item_bull * weight)
                weighted_bear += (item_bear * weight)

        # Active Catalyst Impact Formula (Prevents ambient dilution)
        if active_items_count > 0:
            net_diff = weighted_bull - weighted_bear
            total_active_weight = weighted_bull + weighted_bear
            polarity_ratio = net_diff / total_active_weight  # -1.0 to +1.0
            intensity = min(2.0, 1.0 + (active_items_count / 8.0))
            raw_shift = polarity_ratio * 25.0 * intensity
            score = int(round(min(92, max(10, 50 + raw_shift))))
        else:
            score = 50

        # Consensus Dispersion Analysis
        if weighted_bull >= 4.0 and weighted_bear >= 4.0:
            consensus = "Divided Market (Elevated Event Volatility)"
        elif weighted_bull >= 4.0 and weighted_bear < 2.0:
            consensus = "Strong Bullish Catalyst Consensus"
        elif weighted_bear >= 4.0 and weighted_bull < 2.0:
            consensus = "Strong Bearish Narrative Consensus"
        elif score >= 60:
            consensus = "Constructive Bullish Momentum"
        elif score <= 40:
            consensus = "Persistent Bearish Headwinds"
        else:
            consensus = "Balanced Market Flow"

        if score >= 75:
            sentiment = "Strong Bullish"
            color = "bullish"
        elif score >= 62:
            sentiment = "Bullish"
            color = "bullish"
        elif score >= 55:
            sentiment = "Moderately Bullish"
            color = "bullish"
        elif score <= 25:
            sentiment = "Strong Bearish"
            color = "bearish"
        elif score <= 38:
            sentiment = "Bearish"
            color = "bearish"
        elif score <= 45:
            sentiment = "Moderately Bearish"
            color = "bearish"
        else:
            sentiment = "Neutral"
            color = "neutral"

        delta = round((score - 50) * 0.3, 1)

        # Identify specific top catalyst headlines for fact-grounded synthesis
        top_bull_news = [n for n in news_items if _matches_catalyst(str(n.get('title', '')), shocks_positive + bull_phrases)]
        top_bear_news = [n for n in news_items if _matches_catalyst(str(n.get('title', '')), shocks_negative + bear_phrases)]

        lead_lines = []
        if top_bull_news:
            b_item = top_bull_news[0]
            lead_lines.append(f"Bullish momentum is reinforced by **{b_item.get('publisher', 'Financial Wire')}** reporting *\"{b_item.get('title', '')}\"*.")
        if top_bear_news:
            r_item = top_bear_news[0]
            lead_lines.append(f"Countervailing risk highlighted by **{r_item.get('publisher', 'Financial Wire')}** notes *\"{r_item.get('title', '')}\"*.")
        if not lead_lines:
            lead_lines.append(f"Recent reporting reflects steady operational continuity without severe directional shock events.")

        summary = (
            f"Recent multi-source global financial coverage for **{company_name} ({ticker})** reflects an overall **{sentiment} ({score}%)** sentiment profile across **{len(news_items)} verified reports** with **{consensus}**.\n\n"
            f"{' '.join(lead_lines)}\n\n"
            f"At the current ${current_price:.2f} price level, active news flow delivers a **{'+' if delta >= 0 else ''}{delta:.1f}% AI Conviction Delta**, anchoring near-term tactical setups."
        )

        result = {
            'sentiment': sentiment,
            'sentimentScore': score,
            'sentimentBadge': f"{sentiment} ({score}%)",
            'sentimentColor': color,
            'consensus': consensus,
            'convictionDelta': delta,
            'topBullNews': top_bull_news[:2],
            'topBearNews': top_bear_news[:2],
            'catalystBullets': bullets,
            'summary': summary
        }
        self._set_cached(cache_key, result, ttl_seconds=600)
        return result

    def compute_conviction_score(
        self,
        profile: dict,
        signals: dict,
        backtest_data: dict = None,
        timeseries: list = None,
        news: list = None,
        news_sentiment: dict = None,
        return_breakdown: bool = False
    ) -> tuple:
        """
        Comprehensive Multi-Factor AI Conviction Scoring Engine (0 to 100%).
        Unified across AI Scanner, Single-Stock Deep-Dive Terminal, and Watchlists.
        Dynamically weights all available quantitative & fundamental inputs:
        1. Multi-Timeframe Trend & Moving Averages (SuperTrend, SMA 50/200, Golden/Death cross)
        2. Momentum & Multi-Oscillator Confluence (RSI contextual, MACD cross/hist, Stochastic)
        3. Institutional Flow & Volume Confirmation (CMF, VWAP, Relative Volume)
        4. Volatility & Breakout Squeeze (TTM Squeeze, 52-Week Range proximity)
        5. Price Action Dynamics & Severe Adverse Drop Shock Penalties
        6. Algorithmic Strategy Backtest Validation (Win Rate, Alpha, Profit Factor)
        7. Real-Time News Sentiment & Catalyst Impact (Sentiment score & Breaking headline keywords)
        8. Downtrend & Capitulation Guard (Hard safety caps on sharp selloffs)
        Returns (conviction_score, bias, stance_color, badge_class[, factor_breakdown]).
        """
        current_price = float(profile.get('currentPrice') or 100.0)
        cmf_val = float(profile.get('cmf', 0.0) or 0.0)
        vwap_val = float(profile.get('vwap') or current_price)
        change_pct = float(profile.get('changePercent', 0.0) or 0.0)
        
        indicators = signals.get('indicators', {}) if signals else {}
        rsi_val = float(indicators.get('RSI', {}).get('value', 50.0) or 50.0)
        st_status = str(indicators.get('SuperTrend', {}).get('status', 'neutral') or 'neutral').lower()
        macd_hist = float(indicators.get('MACD', {}).get('hist', 0.0) or 0.0)
        macd_sig = str(indicators.get('MACD', {}).get('signal', '') or '').lower()
        stoch_sig = str(indicators.get('Stochastic', {}).get('signal', '') or '').lower()
        
        score = 50.0
        factor_breakdown = {}
        
        # 1. Multi-Timeframe Trend & Moving Average Alignment
        trend_pts = 0.0
        if st_status == 'bullish':
            if change_pct <= -5.0:
                trend_pts += 0.0  # Lagging indicator during sharp crash
            elif change_pct <= -2.5:
                trend_pts += 3.0
            else:
                trend_pts += 10.0
        elif st_status == 'bearish':
            trend_pts -= 12.0
            if change_pct < -2.0:
                trend_pts -= 4.0
                
        # Check SMA 50 and SMA 200
        sma50 = None
        sma200 = None
        if 'SMA_50' in indicators:
            sma50 = float(indicators['SMA_50'].get('value', 0) or 0)
        if 'SMA_200' in indicators:
            sma200 = float(indicators['SMA_200'].get('value', 0) or 0)
        elif timeseries and len(timeseries) >= 20:
            closes = [float(t.get('close', 0)) for t in timeseries if t.get('close')]
            if len(closes) >= 50:
                sma50 = sum(closes[-50:]) / 50.0
            if len(closes) >= 200:
                sma200 = sum(closes[-200:]) / 200.0
                
        if sma200 and sma200 > 0:
            if current_price > sma200:
                trend_pts += 5.0  # Above 200 SMA (Secular Bull)
            else:
                trend_pts -= 7.0  # Below 200 SMA (Secular Bear)
                
        if sma50 and sma50 > 0:
            if current_price > sma50:
                trend_pts += 4.0
            else:
                trend_pts -= 5.0
                
            if sma200 and sma200 > 0:
                if sma50 > sma200:
                    trend_pts += 3.0  # Golden Cross
                else:
                    trend_pts -= 4.0  # Death Cross
                    
        score += trend_pts
        factor_breakdown['trend'] = round(trend_pts, 1)

        # 2. Momentum & Multi-Oscillator Confluence
        mom_pts = 0.0
        # Contextual RSI
        if rsi_val < 35.0:
            if change_pct <= -2.5 or st_status == 'bearish' or (vwap_val and current_price < vwap_val * 0.99 and cmf_val < 0):
                mom_pts -= 12.0  # Liquidation / falling knife
            elif change_pct >= 0 and cmf_val > 0.05 and macd_hist > 0:
                mom_pts += 8.0   # Confirmed oversold accumulation divergence
            else:
                mom_pts -= 4.0
        elif 55.0 < rsi_val <= 68.0:
            mom_pts += 7.0       # Optimal momentum expansion
        elif 45.0 <= rsi_val <= 55.0:
            mom_pts += 0.0       # Balanced / neutral
        elif 35.0 <= rsi_val < 45.0:
            mom_pts -= 4.0       # Weakening momentum
        elif rsi_val > 75.0:
            mom_pts -= 8.0       # Overbought exhaustion risk
        elif rsi_val > 68.0:
            mom_pts += 3.0
            
        # MACD momentum
        if 'crossover' in macd_sig and 'bull' in macd_sig:
            mom_pts += 6.0
        elif macd_hist > 0.05:
            mom_pts += 5.0
        elif 'crossover' in macd_sig and 'bear' in macd_sig:
            mom_pts -= 6.0
        elif macd_hist < -0.05:
            mom_pts -= 6.0
            
        # Stochastic crossover confirmation
        if 'bull' in stoch_sig or 'turn' in stoch_sig:
            mom_pts += 3.0
        elif 'bear' in stoch_sig or 'overbought' in stoch_sig:
            mom_pts -= 3.0
            
        score += mom_pts
        factor_breakdown['momentum'] = round(mom_pts, 1)

        # 3. Institutional Capital Flow & Volume Confirmation
        flow_pts = 0.0
        if cmf_val > 0.10:
            flow_pts += (3.0 if change_pct <= -4.0 else 9.0)
        elif cmf_val > 0.03:
            flow_pts += (1.0 if change_pct <= -4.0 else 5.0)
        elif cmf_val < -0.08:
            flow_pts -= 11.0
        elif cmf_val < -0.02:
            flow_pts -= 5.0
            
        if vwap_val and current_price > vwap_val * 1.003:
            flow_pts += 5.0
        elif vwap_val and current_price < vwap_val * 0.997:
            flow_pts -= 6.0
            
        # Volume Spike / Relative Volume
        vol = float(profile.get('volume', 0) or 0)
        avg_vol = float(profile.get('avgVolume', 0) or 0)
        if vol > 0 and avg_vol > 0:
            rel_vol = vol / avg_vol
            if rel_vol >= 1.5 and change_pct > 0.5:
                flow_pts += 4.0  # High-volume accumulation surge
            elif rel_vol >= 1.5 and change_pct < -1.5:
                flow_pts -= 6.0  # Heavy-volume institutional distribution
                
        score += flow_pts
        factor_breakdown['flow'] = round(flow_pts, 1)

        # 4. Volatility, Breakout Squeeze & 52-Week Range
        vol_pts = 0.0
        is_squeeze = 'squeeze active' in str(indicators.get('Volatility_Squeeze', {}).get('signal', '')).lower()
        if is_squeeze:
            if mom_pts > 0 and flow_pts > 0:
                vol_pts += 5.0  # Imminent upside volatility expansion
            elif mom_pts < 0 or flow_pts < 0:
                vol_pts -= 5.0  # Imminent downside breakdown squeeze
                
        # 52-Week Range proximity
        high_52 = profile.get('fiftyTwoWeekHigh')
        low_52 = profile.get('fiftyTwoWeekLow')
        if high_52 and low_52:
            try:
                h_val = float(high_52)
                l_val = float(low_52)
                if h_val > l_val:
                    range_pos = (current_price - l_val) / (h_val - l_val)
                    if range_pos >= 0.85 and change_pct > -2.0:
                        vol_pts += 4.0  # Leader trading near 52W highs
                    elif range_pos <= 0.15 and change_pct <= -2.0:
                        vol_pts -= 5.0  # Laggard breakdown near 52W lows
            except Exception:
                pass
                
        score += vol_pts
        factor_breakdown['volatility'] = round(vol_pts, 1)

        # 5. Price Action Momentum & Severe Adverse Drop Penalties
        price_pts = 0.0
        if change_pct <= -10.0:
            price_pts -= 26.0
        elif change_pct <= -5.0:
            price_pts -= 16.0
        elif change_pct <= -2.5:
            price_pts -= 9.0
        elif change_pct < -0.5:
            price_pts -= 3.0
        elif change_pct >= 4.0:
            price_pts += 7.0
        elif change_pct > 0.5:
            price_pts += 4.0
        score += price_pts
        factor_breakdown['price'] = round(price_pts, 1)

        # 6. Algorithmic Strategy Backtest Validation
        bt_pts = 0.0
        if backtest_data and 'quant' in backtest_data:
            quant_bt = backtest_data['quant']
            win_rate = float(quant_bt.get('winRatePct', 50) or 50)
            alpha = float(quant_bt.get('alpha', 0) or 0)
            profit_factor = float(quant_bt.get('profitFactor', 1.0) or 1.0)
            
            if win_rate >= 60 and alpha > 0 and profit_factor >= 1.5:
                bt_pts += 5.0
            elif win_rate >= 55:
                bt_pts += 2.0
            elif 0 < win_rate <= 38 or alpha < -10:
                bt_pts -= 4.0
        score += bt_pts
        factor_breakdown['backtest'] = round(bt_pts, 1)

        # 7. Real-Time News Sentiment & Breaking Catalyst Impact
        news_pts = 0.0
        news_score = None
        if news_sentiment:
            if isinstance(news_sentiment, dict):
                news_score = news_sentiment.get('sentimentScore', 50)
            elif isinstance(news_sentiment, (int, float)):
                news_score = float(news_sentiment)
        elif news and isinstance(news, list) and len(news) > 0:
            bull_words = ['record', 'surge', 'buy', 'growth', 'profit', 'beat', 'upgrade', 'expansion', 'ai', 'dividend', 'soar', 'bull', 'gain', 'positive', 'outperform', 'partnership', 'approval']
            bear_words = ['fall', 'drop', 'slump', 'downgrade', 'lawsuit', 'cut', 'loss', 'miss', 'warning', 'decline', 'bear', 'risk', 'sell', 'fraud', 'probe', 'investigation', 'plunge', 'halt', 'subpoena']
            combined_text = " ".join([str(n.get('title', '')) + " " + str(n.get('summary', '')) for n in news[:20]]).lower()
            b_hits = sum(combined_text.count(w) for w in bull_words)
            r_hits = sum(combined_text.count(w) for w in bear_words)
            diff = b_hits - r_hits
            if diff >= 2:
                news_score = min(90, 60 + (diff * 5))
            elif diff <= -2:
                news_score = max(15, 40 + (diff * 5))
            else:
                news_score = 50

        if news_score is not None:
            if news_score <= 35:
                news_pts -= 12.0
            elif news_score <= 45:
                news_pts -= 5.0
            elif news_score >= 70 and change_pct > -3.0:
                news_pts += 8.0
            elif news_score >= 60 and change_pct > -3.0:
                news_pts += 4.0
        score += news_pts
        factor_breakdown['news'] = round(news_pts, 1)

        # 8. Hard Safety Caps & Sanity Limits for Breakdowns
        if change_pct <= -8.0:
            score = min(score, 28.0)  # Crash cap
        elif change_pct <= -4.0:
            score = min(score, 44.0)  # Severe drop cap
        elif st_status == 'bearish' and current_price < vwap_val and macd_hist < 0 and (sma50 is None or current_price < sma50):
            score = min(score, 36.0)  # Multi-indicator downtrend confluence cap

        conviction_score = int(round(min(98, max(10, score))))
        
        if conviction_score >= 78:
            bias = 'Strong Bullish'
            stance_color = 'bullish'
            badge_class = 'badge-bullish'
        elif conviction_score >= 60:
            bias = 'Bullish'
            stance_color = 'bullish'
            badge_class = 'badge-bullish'
        elif conviction_score >= 45:
            bias = 'Neutral / Range-Bound'
            stance_color = 'neutral'
            badge_class = 'badge-neutral'
        elif conviction_score >= 32:
            bias = 'Moderately Bearish'
            stance_color = 'bearish'
            badge_class = 'badge-bearish'
        else:
            bias = 'Strong Bearish'
            stance_color = 'bearish'
            badge_class = 'badge-bearish'
            
        if return_breakdown:
            return conviction_score, bias, stance_color, badge_class, factor_breakdown
        return conviction_score, bias, stance_color, badge_class

    @staticmethod
    def compute_historic_conviction_series(df: pd.DataFrame) -> pd.Series:
        """
        Calculates backwards historical AI conviction score (10 to 98%, scale 0-100) for every bar in df.
        Faithfully evaluates multi-factor scoring matching compute_conviction_score:
        1. Trend & Moving Averages (SuperTrend, SMA 50, SMA 200, Golden/Death cross)
        2. Momentum & Multi-Oscillator Confluence (Contextual RSI, MACD histogram/cross, Stochastic)
        3. Institutional Flow & Volume (CMF, VWAP, Relative Volume)
        4. Volatility & Breakout Squeeze (TTM Squeeze, 52-Week Range proximity)
        5. Price Action Dynamics & Single-Day Shock Penalties
        6. Downtrend & Capitulation Guard (Safety caps)
        Returns a pd.Series of float conviction scores indexed identically to df.
        """
        if df is None or df.empty or len(df) == 0:
            return pd.Series(dtype=float)

        n = len(df)
        close = df['Close'].values if 'Close' in df.columns else np.zeros(n)
        prev_close = np.roll(close, 1)
        prev_close[0] = close[0]
        change_pct = np.where(prev_close > 0, ((close - prev_close) / prev_close) * 100.0, 0.0)

        st_dir = df['SuperTrend_Dir'].values if 'SuperTrend_Dir' in df.columns else np.ones(n)
        sma50 = df['SMA_50'].values if 'SMA_50' in df.columns else np.full(n, np.nan)
        sma200 = df['SMA_200'].values if 'SMA_200' in df.columns else np.full(n, np.nan)
        rsi = df['RSI'].values if 'RSI' in df.columns else np.full(n, 50.0)
        macd_hist = df['MACD_Hist'].values if 'MACD_Hist' in df.columns else np.zeros(n)
        macd = df['MACD'].values if 'MACD' in df.columns else np.zeros(n)
        macd_sig = df['MACD_Signal'].values if 'MACD_Signal' in df.columns else np.zeros(n)
        stoch_k = df['Stoch_K'].values if 'Stoch_K' in df.columns else np.full(n, 50.0)
        stoch_d = df['Stoch_D'].values if 'Stoch_D' in df.columns else np.full(n, 50.0)
        cmf = df['CMF'].values if 'CMF' in df.columns else np.zeros(n)
        vwap = df['VWAP'].values if 'VWAP' in df.columns else close
        vol = df['Volume'].values if 'Volume' in df.columns else np.zeros(n)
        vol_sma = df['Volume_SMA20'].values if 'Volume_SMA20' in df.columns else np.ones(n)
        squeeze = df['TTM_Squeeze'].values if 'TTM_Squeeze' in df.columns else np.zeros(n, dtype=bool)

        high = df['High'].values if 'High' in df.columns else close
        low = df['Low'].values if 'Low' in df.columns else close

        high_s = pd.Series(high)
        low_s = pd.Series(low)
        roll_high = high_s.rolling(252, min_periods=20).max().fillna(high_s).values
        roll_low = low_s.rolling(252, min_periods=20).min().fillna(low_s).values

        scores = np.full(n, 50.0)

        for i in range(n):
            sc = 50.0
            cp = close[i]
            chg = change_pct[i]

            # 1. Multi-Timeframe Trend & Moving Average Alignment
            t_pts = 0.0
            if st_dir[i] == 1:
                if chg <= -5.0:
                    t_pts += 0.0
                elif chg <= -2.5:
                    t_pts += 3.0
                else:
                    t_pts += 10.0
            elif st_dir[i] == -1:
                t_pts -= 12.0
                if chg < -2.0:
                    t_pts -= 4.0

            s200 = sma200[i]
            if not np.isnan(s200) and s200 > 0:
                t_pts += 5.0 if cp > s200 else -7.0

            s50 = sma50[i]
            if not np.isnan(s50) and s50 > 0:
                t_pts += 4.0 if cp > s50 else -5.0
                if not np.isnan(s200) and s200 > 0:
                    t_pts += 3.0 if s50 > s200 else -4.0
            sc += t_pts

            # 2. Momentum & Multi-Oscillator Confluence
            m_pts = 0.0
            r_val = rsi[i] if not np.isnan(rsi[i]) else 50.0
            c_val = cmf[i] if not np.isnan(cmf[i]) else 0.0
            v_val = vwap[i] if not np.isnan(vwap[i]) else cp

            if r_val < 35.0:
                if chg <= -2.5 or st_dir[i] == -1 or (v_val and cp < v_val * 0.99 and c_val < 0):
                    m_pts -= 12.0
                elif chg >= 0 and c_val > 0.05 and macd_hist[i] > 0:
                    m_pts += 8.0
                else:
                    m_pts -= 4.0
            elif 55.0 < r_val <= 68.0:
                m_pts += 7.0
            elif 35.0 <= r_val < 45.0:
                m_pts -= 4.0
            elif r_val > 75.0:
                m_pts -= 8.0
            elif r_val > 68.0:
                m_pts += 3.0

            m_hist = macd_hist[i]
            if i > 0 and macd[i] > macd_sig[i] and macd[i-1] <= macd_sig[i-1]:
                m_pts += 6.0
            elif m_hist > 0.05:
                m_pts += 5.0
            elif i > 0 and macd[i] < macd_sig[i] and macd[i-1] >= macd_sig[i-1]:
                m_pts -= 6.0
            elif m_hist < -0.05:
                m_pts -= 6.0

            if stoch_k[i] > stoch_d[i]:
                m_pts += 3.0
            elif stoch_k[i] < stoch_d[i]:
                m_pts -= 3.0
            sc += m_pts

            # 3. Flow & Volume
            f_pts = 0.0
            if c_val > 0.10:
                f_pts += (3.0 if chg <= -4.0 else 9.0)
            elif c_val > 0.03:
                f_pts += (1.0 if chg <= -4.0 else 5.0)
            elif c_val < -0.08:
                f_pts -= 11.0
            elif c_val < -0.02:
                f_pts -= 5.0

            if v_val and cp > v_val * 1.003:
                f_pts += 5.0
            elif v_val and cp < v_val * 0.997:
                f_pts -= 6.0

            vsma = vol_sma[i]
            if vsma and vsma > 0 and vol[i] > 0:
                rvol = vol[i] / vsma
                if rvol >= 1.5 and chg > 0.5:
                    f_pts += 4.0
                elif rvol >= 1.5 and chg < -1.5:
                    f_pts -= 6.0
            sc += f_pts

            # 4. Volatility, Breakout Squeeze & 52-Week Proximity
            v_pts = 0.0
            if squeeze[i]:
                if m_pts > 0 and f_pts > 0:
                    v_pts += 5.0
                elif m_pts < 0 or f_pts < 0:
                    v_pts -= 5.0

            h52 = roll_high[i]
            l52 = roll_low[i]
            if h52 > l52:
                rpos = (cp - l52) / (h52 - l52)
                if rpos >= 0.85 and chg > -2.0:
                    v_pts += 4.0
                elif rpos <= 0.15 and chg <= -2.0:
                    v_pts -= 5.0
            sc += v_pts

            # 5. Price Action Momentum & Severe Adverse Drop Penalties
            p_pts = 0.0
            if chg <= -10.0:
                p_pts -= 26.0
            elif chg <= -5.0:
                p_pts -= 16.0
            elif chg <= -2.5:
                p_pts -= 9.0
            elif chg < -0.5:
                p_pts -= 3.0
            elif chg >= 4.0:
                p_pts += 7.0
            elif chg > 0.5:
                p_pts += 4.0
            sc += p_pts

            # 6. Safety Caps
            if chg <= -8.0:
                sc = min(sc, 28.0)
            elif chg <= -4.0:
                sc = min(sc, 44.0)
            elif st_dir[i] == -1 and cp < v_val and m_hist < 0 and (np.isnan(s50) or cp < s50):
                sc = min(sc, 36.0)

            scores[i] = round(float(min(98.0, max(10.0, sc))), 1)

        return pd.Series(scores, index=df.index)

    @staticmethod
    def compute_technical_confluence(signals: dict, profile: dict = None) -> dict:
        """
        Computes a normalized multi-oscillator & trend confluence gauge across technical indicators.
        """
        indicators = (signals or {}).get('indicators', {}) or {}
        osc_keys = ('RSI', 'MACD', 'Stochastic', 'SuperTrend', 'SMA_50', 'CCI')
        bull = 0
        bear = 0
        neutral = 0
        present = 0

        for key in osc_keys:
            ind = indicators.get(key)
            if not isinstance(ind, dict):
                continue
            present += 1
            status_str = f"{ind.get('status', '')} {ind.get('signal', '')}".lower()
            if 'bull' in status_str or 'buy' in status_str or 'oversold' in status_str or 'accum' in status_str:
                bull += 1
            elif 'bear' in status_str or 'sell' in status_str or 'overbought' in status_str or 'distrib' in status_str:
                bear += 1
            else:
                neutral += 1

        if profile:
            cmf = profile.get('cmf')
            if isinstance(cmf, (int, float)):
                present += 1
                if cmf > 0.03:
                    bull += 1
                elif cmf < -0.03:
                    bear += 1
                else:
                    neutral += 1

        if present == 0:
            bull = int((signals or {}).get('bullishCount', 0) or 0)
            bear = int((signals or {}).get('bearishCount', 0) or 0)
            neutral = int((signals or {}).get('neutralCount', 0) or 0)
            present = bull + bear + neutral

        total = max(1, present)
        if bull > bear:
            direction = 'Bullish'
            dominant = bull
        elif bear > bull:
            direction = 'Bearish'
            dominant = bear
        else:
            direction = 'Mixed'
            dominant = max(bull, bear)

        agreement_ratio = dominant / total
        score = round(min(100.0, max(0.0, agreement_ratio * 100.0)), 1)

        if present == 0:
            tier = 'Insufficient Data'
        elif agreement_ratio >= 0.72 and dominant >= 3:
            tier = 'High Confluence'
        elif agreement_ratio >= 0.45 and dominant >= 2:
            tier = 'Moderate Confluence'
        else:
            tier = 'Divergent / Split'

        return {
            'score': score,
            'direction': direction,
            'tier': tier,
            'alignedCount': dominant,
            'totalOscillators': present,
            'bullCount': bull,
            'bearCount': bear,
            'neutralCount': neutral,
            'badgeLabel': f"{dominant}/{present} {direction}" if present else 'Neutral',
        }

    def generate_ai_analysis(
        self,
        profile: dict,
        timeseries: list[dict],
        signals: dict,
        backtest_data: dict = None,
        news: list[dict] = None,
        api_key: str = None,
        provider: str = None,
        model: str = None,
        api_keys: dict = None,
        allow_llm: bool = True,
        force_refresh: bool = False
    ) -> dict:
        """
        Synthesizes a comprehensive multi-paragraph AI Investment Thesis,
        Tactical Execution Matrix, Risk/Reward profile, 30-day probabilistic scenarios,
        and News Sentiment for an individual stock.
        Uses advanced statistical models out-of-the-box, enhanced by Gemini, Anthropic Claude,
        or OpenAI GPT with dual-tier persistent caching.
        Consolidates news catalysts and executive memo into at most 1 single API call per stock.
        """
        if not timeseries and not (profile and profile.get('currentPrice')):
            return {'error': 'Insufficient market data for AI analysis.'}

        bar_count = len(timeseries or [])
        is_limited_history = bar_count < 5
        current_price = profile.get('currentPrice') or (timeseries[-1].get('close') if timeseries else None) or 100.0
        ticker = profile.get('ticker', 'STOCK')
        company_name = profile.get('name', ticker)

        clean_provider = self.normalize_provider(provider, model)
        clean_model = (model or "").strip() or self.get_default_model(clean_provider)

        full_analysis_cache_key = f"full_ai_analysis:{ticker}:{clean_provider}:{clean_model}"
        if not force_refresh:
            cached_full = self._get_cached(full_analysis_cache_key)
            if cached_full and isinstance(cached_full, dict) and not cached_full.get('error'):
                return cached_full

        atr = profile.get('atr')
        if not atr or atr <= 0:
            spreads = [
                abs(float(b.get('high', 0) or 0) - float(b.get('low', 0) or 0))
                for b in (timeseries or [])
                if b.get('high') is not None and b.get('low') is not None
            ]
            atr = round(sum(spreads) / len(spreads), 2) if spreads and sum(spreads) > 0 else round(float(current_price) * 0.04, 2)
        vwap = profile.get('vwap') or current_price
        cmf = profile.get('cmf') or 0.0

        bullish_count = signals.get('bullishCount', 0)
        bearish_count = signals.get('bearishCount', 0)
        neutral_count = signals.get('neutralCount', 0)
        overall_rating = signals.get('overall', 'Neutral')

        # 1. AI News Sentiment & Market Catalyst Synthesis (Deterministic Multi-Factor Scorer, 0 API calls)
        news_synthesis = self.synthesize_news_sentiment(
            ticker,
            company_name,
            current_price,
            news or [],
            api_key=None,
            provider=clean_provider,
            model=clean_model,
            allow_llm=False,
        )

        # 2. Compute Canonical Recalibrated AI Quantitative Conviction Score (0 to 100%)
        conviction_score, bias, stance_color, badge_class, factor_breakdown = self.compute_conviction_score(
            profile=profile,
            signals=signals,
            backtest_data=backtest_data,
            timeseries=timeseries,
            news=news,
            news_sentiment=news_synthesis,
            return_breakdown=True
        )

        # 3. Dynamic Mathematical Trade Levels (Entry, Stop Loss, Target 1, Target 2)
        entry_low = round(max(current_price * 0.985, current_price - (0.5 * atr)), 2)
        entry_high = round(current_price, 2)
        
        stop_loss = round(max(current_price * 0.85, current_price - (1.75 * atr)), 2)
        risk_per_share = round(max(0.01, current_price - stop_loss), 2)

        target_1 = round(current_price + (1.5 * atr), 2)
        target_2 = round(current_price + (3.0 * atr), 2)
        reward_target_1 = round(target_1 - current_price, 2)
        reward_target_2 = round(target_2 - current_price, 2)
        
        rr_ratio = round(reward_target_2 / risk_per_share, 2) if risk_per_share > 0 else 2.5

        # 3. Probabilistic 30-Day Scenario Modeling
        volatility_30d = (atr / current_price) * math.sqrt(21)  # 21 trading days
        net_ratio = (conviction_score - 50.0) / 50.0
        
        bull_target = round(current_price * (1.0 + (volatility_30d * 1.35)), 2)
        base_target = round(current_price * (1.0 + (net_ratio * volatility_30d * 0.5)), 2)
        bear_target = round(current_price * (1.0 - (volatility_30d * 1.25)), 2)

        bull_prob = round(min(80, max(10, (conviction_score * 0.7) + 5)), 0)
        bear_prob = round(min(80, max(10, ((100 - conviction_score) * 0.7) + 5)), 0)
        base_prob = round(max(10, 100 - bull_prob - bear_prob), 0)

        # 4. Quantitative Synthesis & Theses
        catalysts = []
        risks = []

        indicators = signals.get('indicators', {})
        if 'SuperTrend' in indicators:
            st_sig = indicators['SuperTrend']
            if st_sig.get('status') == 'bullish':
                catalysts.append(f"SuperTrend confirms active institutional uptrend support at ${st_sig.get('value')}.")
            else:
                risks.append(f"SuperTrend trailing resistance active at ${st_sig.get('value')}.")

        if 'MACD' in indicators:
            macd_sig = indicators['MACD']
            if macd_sig.get('status') == 'bullish':
                catalysts.append("MACD momentum expansion indicates accelerating buying volume.")
            else:
                risks.append("MACD momentum deceleration signals potential near-term consolidation.")

        if cmf > 0.05:
            catalysts.append(f"Chaikin Money Flow (+{round(cmf, 3)}) indicates positive institutional accumulation.")
        elif cmf < -0.05:
            risks.append(f"Chaikin Money Flow ({round(cmf, 3)}) points to net institutional capital distribution.")

        if current_price > vwap:
            catalysts.append(f"Trading above institutional VWAP (${round(vwap, 2)}), signaling buyer control.")
        else:
            risks.append(f"Trading below volume-weighted average price (${round(vwap, 2)}).")

        # 4. Integrate Real-World News Catalysts & Headline Risks
        top_bull_news = news_synthesis.get('topBullNews', []) if news_synthesis else []
        top_bear_news = news_synthesis.get('topBearNews', []) if news_synthesis else []
        news_delta = news_synthesis.get('convictionDelta', 0.0) if news_synthesis else 0.0

        if top_bull_news:
            b_item = top_bull_news[0]
            catalysts.insert(0, f"Global Catalyst ({b_item.get('publisher', 'Financial Wire')}): {b_item.get('title', '')}")
        if top_bear_news:
            r_item = top_bear_news[0]
            risks.insert(0, f"Headline Risk ({r_item.get('publisher', 'Financial Wire')}): {r_item.get('title', '')}")

        if is_limited_history:
            catalysts.append(
                f"Recent listing ({bar_count} session{'s' if bar_count != 1 else ''} recorded): analysis prioritizes live news catalysts, VWAP, and early order flow."
            )
            risks.append(
                f"Early post-listing volatility: longer-horizon oscillators (RSI 14, MACD, SuperTrend) require more sessions to mature."
            )

        if not catalysts:
            catalysts.append("Consolidation setup with technical breakout potential upon volume confirmation.")
        if not risks:
            risks.append(f"Breach of the ${stop_loss:.2f} key support zone invalidates the tactical bull setup.")

        # Grounded Institutional Thesis Synthesis
        news_mention = ""
        if top_bull_news and conviction_score >= 50:
            b_pub = top_bull_news[0].get('publisher', 'Financial Wire')
            b_tit = top_bull_news[0].get('title', '')
            news_mention = f" Real-time wire sentiment is constructive, led by **{b_pub}** (*\"{b_tit}\"*), contributing a **{news_delta:+.1f}%** catalyst momentum boost."
        elif top_bear_news and conviction_score < 50:
            r_pub = top_bear_news[0].get('publisher', 'Financial Wire')
            r_tit = top_bear_news[0].get('title', '')
            news_mention = f" Fundamental headwinds noted by **{r_pub}** (*\"{r_tit}\"*) add a **{news_delta:+.1f}%** drag on conviction."
        elif top_bull_news:
            b_pub = top_bull_news[0].get('publisher', 'Financial Wire')
            news_mention = f" Live headlines from **{b_pub}** reflect active catalyst positioning ({news_delta:+.1f}% delta)."

        limited_note = (
            f" *(Newly listed asset with {bar_count} session{'s' if bar_count != 1 else ''} of trading history — weighted toward live news catalysts and session VWAP/CMF flow.)*"
            if is_limited_history else ""
        )
        thesis = (
            f"Quantitative AI synthesis assigns **{company_name} ({ticker})** an AI Conviction Score of **{conviction_score}% ({bias})** at **${current_price:.2f}**. "
            f"{'Positive institutional accumulation and technical alignment favor upside continuation toward $' + str(target_1) if conviction_score >= 50 else 'Bearish momentum and distribution pressure suggest caution with critical support at $' + str(stop_loss)}."
            f"{news_mention}{limited_note} "
            f"Optimal risk-managed execution offers an asymmetric **{rr_ratio}:1 Risk/Reward** profile with stop-loss invalidation at **${stop_loss:.2f}**."
        )

        # 5. Persistent Disk Caching & Single-Call Multi-Provider LLM Narrative Enhancement
        cache_key = f"memo:{ticker}:{clean_provider}:{clean_model}"
        cached_memo = self._get_cached(cache_key) if not force_refresh else None
        used_llm_model = ""

        if cached_memo:
            if isinstance(cached_memo, dict):
                thesis = cached_memo.get("text", thesis)
                used_llm_model = cached_memo.get("model", clean_model)
            else:
                thesis = cached_memo
                used_llm_model = clean_model
        elif allow_llm:
            resolved_key = self.resolve_api_key(clean_provider, api_key=api_key, api_keys=api_keys)
            if resolved_key and len(resolved_key.strip()) > 6:
                headline_brief = "\n".join([f"- {n.get('publisher')}: {n.get('title')}" for n in (top_bull_news + top_bear_news)[:4]])
                llm_prompt = f"""
                You are a senior quantitative hedge fund analyst.
                Write a concise, professional, data-backed 3-paragraph executive investment memo for {company_name} ({ticker}):
                
                Financial & Quantitative Data:
                - Current Price: ${current_price:.2f}
                - Sector: {profile.get('sector', 'Equities')}
                - Technical Multi-Factor Rating: {overall_rating} ({bullish_count} Bullish vs {bearish_count} Bearish)
                - AI Conviction Score: {conviction_score}% ({bias}) (News Delta: {news_delta:+.1f}%)
                - Daily Volatility (ATR): ±${atr:.2f}
                - Institutional VWAP: ${vwap:.2f}
                - Chaikin Money Flow (CMF): {cmf:.3f}
                - Top Real-World Breaking News Headlines:
{headline_brief}
                - Tactical Levels: Entry ${entry_low}-${entry_high}, Stop-Loss ${stop_loss}, Target 1 ${target_1}, Target 2 ${target_2} (R/R: {rr_ratio}:1)
                - 30-Day Scenario Targets: Bull ${bull_target} ({bull_prob}%), Base ${base_target} ({base_prob}%), Bear ${bear_target} ({bear_prob}%)

                Requirements:
                - Paragraph 1: Executive Thesis & Directional Bias (explicitly reference the current price, conviction score, and actual news headlines).
                - Paragraph 2: Core Catalysts & Critical Invalidation Risk.
                - Paragraph 3: Actionable Execution Strategy (mention entry, stop loss, targets).
                Keep it strictly institutional, analytical, and structured.
                """
                try:
                    llm_text, used_model, _ = self.call_llm(
                        llm_prompt,
                        resolved_key,
                        provider=clean_provider,
                        model_name=clean_model,
                        allow_fallback=True,
                        thinking_level="low",
                    )
                    if llm_text and len(llm_text) > 40:
                        thesis = llm_text
                        used_llm_model = used_model
                        self._set_cached(cache_key, {"text": thesis, "model": used_model}, ttl_seconds=14400)
                except Exception:
                    pass

        confluence = self.compute_technical_confluence(signals, profile)

        res = {
            'ticker': ticker,
            'companyName': company_name,
            'isLimitedHistory': is_limited_history,
            'convictionScore': conviction_score,
            'directionalBias': bias,
            'stanceColor': stance_color,
            'confluence': confluence,
            'convictionBreakdown': factor_breakdown,
            'executiveThesis': thesis,
            'catalysts': catalysts[:3],
            'risks': risks[:3],
            'newsSynthesis': news_synthesis,
            'aiMeta': {
                'provider': clean_provider,
                'model': used_llm_model or 'builtin-quant',
                'enhanced': bool(used_llm_model),
            },
            'tradeLevels': {
                'entryZone': f"${entry_low} - ${entry_high}",
                'entryLow': entry_low,
                'entryHigh': entry_high,
                'currentPrice': current_price,
                'stopLoss': stop_loss,
                'target1': target_1,
                'target2': target_2,
                'riskRewardRatio': f"{rr_ratio}:1",
                'riskPerShare': f"${risk_per_share:.2f}",
                'riskPerShareNum': risk_per_share,
                'rewardPerShare': f"${reward_target_2:.2f}",
                'rewardPerShareNum': reward_target_2
            },
            'scenario30d': {
                'bullCase': {'target': bull_target, 'probability': int(bull_prob), 'returnPct': round(((bull_target - current_price) / current_price) * 100, 1)},
                'baseCase': {'target': base_target, 'probability': int(base_prob), 'returnPct': round(((base_target - current_price) / current_price) * 100, 1)},
                'bearCase': {'target': bear_target, 'probability': int(bear_prob), 'returnPct': round(((bear_target - current_price) / current_price) * 100, 1)}
            }
        }
        self._set_cached(full_analysis_cache_key, res, ttl_seconds=14400)
        return res

    def _get_quantitative_response(self, ticker: str, company_name: str, price: float, overall: str, conviction_score: float, bias: str, bullish_count: int, bearish_count: int, indicators: dict, atr: float, vwap: float, cmf: float, entry_zone: str, stop_loss: float, target1: float, target2: float, rr_ratio: str, scenarios: dict, quant_bt: dict, profile: dict, timeseries: list, q: str) -> str:
        """Helper that generates intent-specific quantitative responses."""
        bull_case = scenarios.get('bullCase', {})
        base_case = scenarios.get('baseCase', {})
        bear_case = scenarios.get('bearCase', {})
        
        mcap = profile.get('marketCap')
        mcap_str = f"${(mcap / 1e9):.2f}B" if mcap else 'N/A'
        pe_ratio = profile.get('peRatio', 'N/A')
        forward_pe = profile.get('forwardPE', 'N/A')
        beta = profile.get('beta', 'N/A')
        div_yield = profile.get('dividendYield', 0.0) or 0.0
        low_52 = profile.get('fiftyTwoWeekLow', 'N/A')
        high_52 = profile.get('fiftyTwoWeekHigh', 'N/A')

        # Intent 0: Historical Price Lookups (e.g., "20 days ago", "closing price on date")
        match_days = re.search(r'(\d+)\s*(?:days?|trading days?|sessions?)\s*ago', q)
        if match_days and timeseries:
            days_ago = int(match_days.group(1))
            total_bars = len(timeseries)
            idx = total_bars - 1 - days_ago
            if idx >= 0:
                bar = timeseries[idx]
                bar_date = bar.get('time') or bar.get('date', 'N/A')
                return (
                    f"**Historical Price Record for {ticker} ({company_name}):**\n\n"
                    f"• **Session:** **{days_ago} trading days ago** (Date: **{bar_date}**)\n"
                    f"• **Closing Price:** **${bar.get('close', 0.0):.2f}**\n"
                    f"• **Open / High / Low:** ${bar.get('open', 0.0):.2f} / ${bar.get('high', 0.0):.2f} / ${bar.get('low', 0.0):.2f}\n"
                    f"• **Trading Volume:** {bar.get('volume', 0):,} shares\n"
                    f"• **Net Change Since Then:** **{'+' if price >= bar.get('close', 0) else ''}{((price - bar.get('close', 1)) / bar.get('close', 1) * 100):.2f}%** (from ${bar.get('close', 0.0):.2f} to current ${price:.2f})."
                )

        # Intent 1: Buying Timing & Entry Questions
        if any(w in q for w in ["buy", "good time", "should i", "enter", "entry", "purchase", "accumulate", "invest"]):
            is_bull = "Buy" in overall or conviction_score >= 60
            rsi_val = indicators.get('RSI', {}).get('value', 50)
            rsi_str = f"{rsi_val:.1f}" if isinstance(rsi_val, (int, float)) else str(rsi_val)
            
            if is_bull:
                return (
                    f"**Yes, current technical and quantitative metrics indicate an advantageous entry opportunity for {ticker} ({company_name}).**\n\n"
                    f"• **Current Price:** ${price:.2f} with an **AI Conviction Score of {conviction_score}% ({bias})**.\n"
                    f"• **Recommended Entry Zone:** **{entry_zone}**.\n"
                    f"• **Momentum Alignment:** RSI(14) is at **{rsi_str}** and Multi-Factor signals show **{bullish_count} Bullish vs {bearish_count} Bearish** indicators.\n"
                    f"• **Tactical Targets:** Primary target is **${target1:.2f}** (+{round(((target1 - price)/price)*100, 1)}%) with expansion target at **${target2:.2f}** (+{round(((target2 - price)/price)*100, 1)}%).\n"
                    f"• **Risk Management:** Maintain strict stop-loss protection at **${stop_loss:.2f}** (1.75x ATR below market), yielding an asymmetric **{rr_ratio}** Risk/Reward profile."
                )
            else:
                return (
                    f"**Caution is currently warranted before opening new long positions in {ticker} ({company_name}).**\n\n"
                    f"• **Current Status:** Rated **{overall}** with a conservative **{conviction_score}% Conviction Score ({bias})** at ${price:.2f}.\n"
                    f"• **Technical Headwinds:** Multi-factor balance reflects **{bearish_count} Bearish vs {bullish_count} Bullish** signals, with price {'below VWAP ($' + str(vwap) + ')' if price < vwap else 'facing overhead resistance'}.\n"
                    f"• **Recommended Invalidation / Support:** Watch if price stabilizes at the **${stop_loss:.2f}** support zone before committing capital.\n"
                    f"• **Actionable Advice:** Wait for a confirmed bullish breakout above ${target1:.2f} or a positive momentum crossover on MACD/RSI before entering."
                )

        # Intent 2: Price Targets & Upside Resistance
        elif any(w in q for w in ["target", "price target", "how high", "upside", "take profit", "resistance", "where is it going", "tp"]):
            upside_1 = round(((target1 - price) / price) * 100, 2) if price else 0
            upside_2 = round(((target2 - price) / price) * 100, 2) if price else 0
            return (
                f"**Quantitative Price Targets for {ticker} ({company_name}):**\n\n"
                f"1. **Conservative Target 1 (1.5x ATR):** **${target1:.2f}** (+{upside_1}% from ${price:.2f})\n"
                f"   - *Rationale:* Aligns with near-term volatility expansion and dynamic upper band resistance.\n\n"
                f"2. **Expansion Target 2 (3.0x ATR):** **${target2:.2f}** (+{upside_2}% from ${price:.2f})\n"
                f"   - *Rationale:* Represents extended institutional breakout target based on 30-day volatility modeling.\n\n"
                f"3. **30-Day Scenario Modeling:**\n"
                f"   - **Bull Case Target:** **${bull_case.get('target', target2):.2f}** with a **{bull_case.get('probability', 50)}% statistical probability** (+{bull_case.get('returnPct', 0)}% return).\n"
                f"   - **Base Case Drift:** **${base_case.get('target', price):.2f}** ({base_case.get('probability', 30)}% probability)."
            )

        # Intent 3: Stop-Loss, Downside Protection & Key Risks
        elif any(w in q for w in ["stop", "stop loss", "sl", "risk", "downside", "support", "invalidation", "loss", "crash"]):
            downside_pct = round(((price - stop_loss) / price) * 100, 2) if price else 0
            return (
                f"**Risk Management & Key Support Parameters for {ticker}:**\n\n"
                f"• **Dynamic Stop-Loss Level:** **${stop_loss:.2f}** (-{downside_pct}% from ${price:.2f}).\n"
                f"• **Risk per Share:** **${(price - stop_loss):.2f}** per share based on a 1.75x ATR volatility buffer.\n"
                f"• **Technical Invalidation Point:** A confirmed daily close below **${stop_loss:.2f}** breaks structural support and signals immediate position closure or hedging.\n"
                f"• **30-Day Bear Case Projection:** The quantitative model projects an extreme downside exposure target of **${bear_case.get('target', round(price*0.9, 2)):.2f}** ({bear_case.get('probability', 20)}% probability, {bear_case.get('returnPct', -10)}% drawdown).\n"
                f"• **Institutional Capital Flow:** CMF is currently reading **{cmf:.3f}** ({'positive inflow protecting support' if cmf > 0 else 'negative outflow creating distribution risk'})."
            )

        # Intent 4: Conviction Score & Thesis Explanation
        elif any(w in q for w in ["conviction", "score", "why", "thesis", "reason", "rationale", "explain", "model", "rating"]):
            sma50_val = indicators.get('SMA_50', {}).get('value', 'N/A')
            st_sig = indicators.get('SuperTrend', {}).get('signal', 'Neutral')
            stoch_val = indicators.get('Stochastic', {}).get('value', 'N/A')
            macd_stat = indicators.get('MACD', {}).get('status', 'neutral')
            
            return (
                f"**Multi-Factor AI Conviction Score Breakdown for {ticker} ({conviction_score}% — {bias}):**\n\n"
                f"The AI Conviction Engine dynamically evaluates 7 quantitative & fundamental dimensions to calculate this institutional rating:\n\n"
                f"1. **Trend & Regime Structure:** SuperTrend is **{st_sig}** with price (${price:.2f}) trading {'above' if isinstance(sma50_val, (int, float)) and price >= sma50_val else 'relative to'} 50-day SMA (${sma50_val}).\n"
                f"2. **Multi-Oscillator Confluence:** RSI(14) is at **{indicators.get('RSI', {}).get('value', '50.0')}** with MACD showing **{macd_stat} momentum** (Hist: {indicators.get('MACD', {}).get('hist', '0.00')}) and Stochastic at **{stoch_val}**.\n"
                f"3. **Institutional Capital Flow:** Chaikin Money Flow (CMF) is **{cmf:.3f}**, signaling {'institutional accumulation (+ inflow support)' if cmf > 0.03 else ('institutional distribution (- outflow pressure)' if cmf < -0.03 else 'neutral capital flow')}.\n"
                f"4. **VWAP & Liquidity:** Exchanging hands {'above' if price >= vwap else 'below'} institutional VWAP benchmark (${vwap:.2f}).\n"
                f"5. **Price Action & Volatility:** 1-Day change is **{profile.get('changePercent', 0):+.2f}%** with daily volatility (ATR) at **±${atr:.2f}**.\n"
                f"6. **Algorithmic Backtest Validation:** Historical quant execution model achieved a **{quant_bt.get('winRatePct', 50):.1f}% win rate** and **{quant_bt.get('alpha', 0.0):+.1f}% Alpha**.\n"
                f"7. **Real-Time Catalyst Sentiment:** Incoming news flow is factored with active capitulation safety caps to guard against falling knives."
            )

        # Intent 5: Momentum Oscillators (RSI, Stochastic, MACD)
        elif any(w in q for w in ["rsi", "stoch", "stochastic", "macd", "momentum", "oscillator", "overbought", "oversold"]):
            rsi_info = indicators.get('RSI', {})
            stoch_info = indicators.get('Stochastic', {})
            macd_info = indicators.get('MACD', {})
            rsi_raw = rsi_info.get('value') or 50
            if rsi_raw > 70:
                rsi_status = "Overbought (>70) — watch for momentum cooling"
            elif rsi_raw < 30:
                rsi_status = "Oversold (<30) — primed for bullish mean-reversion"
            else:
                rsi_status = "Healthy neutral momentum zone"

            macd_raw = macd_info.get('hist') or 0
            macd_status = "Bullish momentum expansion" if macd_raw > 0 else "Bearish momentum contraction"

            return (
                f"**Technical Momentum & Oscillator Breakdown for {ticker}:**\n\n"
                f"• **RSI (14-Period):** **{rsi_info.get('value', 'N/A')}** — Signal: **{rsi_info.get('signal', 'Neutral')}**.\n"
                f"  *(Status: {rsi_status})*\n\n"
                f"• **Stochastic (14, 3, 3):** Signal: **{stoch_info.get('signal', 'Neutral')}** (%K: {stoch_info.get('value', 'N/A')}).\n"
                f"  *(Triggers fast inflection alerts when crossing 20/80 boundaries)*\n\n"
                f"• **MACD (12, 26, 9):** Signal: **{macd_info.get('signal', 'Neutral')}** (Histogram: {macd_info.get('hist', '0.00')}).\n"
                f"  *(Status: {macd_status})*"
            )

        # Intent 6: Institutional Money Flow & Volume (CMF, VWAP)
        elif any(w in q for w in ["cmf", "chaikin", "money flow", "institution", "volume", "vwap", "flow", "accumulation", "distribution", "smart money"]):
            avg_vol = profile.get('avgVolume', 0)
            cur_vol = profile.get('volume', 0)
            vol_ratio = (cur_vol / avg_vol) if avg_vol else 1.0
            return (
                f"**Institutional Capital Flow & Liquidity Analysis for {ticker}:**\n\n"
                f"• **Chaikin Money Flow (CMF 20):** **{cmf:+.3f}**.\n"
                f"  - *Interpretation:* {'Institutional accumulation is actively underway with positive buying pressure.' if cmf > 0.05 else ('Net institutional capital distribution detected as large volume sells exceed buys.' if cmf < -0.05 else 'Balanced capital flows with no decisive institutional skew.')}\n\n"
                f"• **Volume-Weighted Average Price (VWAP):** **${vwap:.2f}** (Current: ${price:.2f}).\n"
                f"  - *Status:* {ticker} is trading **{'above VWAP (+Bullish control)' if price >= vwap else 'below VWAP (-Bearish discount)'}**.\n\n"
                f"• **Volume Relative to Average:** Current volume is running at **{vol_ratio:.1f}x** normal 30-day average daily volume."
            )

        # Intent 7: Strategy Backtesting & Quantitative Results
        elif any(w in q for w in ["backtest", "strategy", "win rate", "profit factor", "historical", "performance", "alpha", "trades"]):
            strat_ret = quant_bt.get('strategyReturnPct', 0.0)
            bh_ret = quant_bt.get('buyHoldReturnPct', 0.0)
            alpha = quant_bt.get('alpha', (strat_ret - bh_ret))
            win_rate = quant_bt.get('winRatePct', 0.0)
            pf = quant_bt.get('profitFactor', 1.0)
            trades_count = quant_bt.get('totalTrades', 0)
            dd = quant_bt.get('maxDrawdownPct', 0.0)
            
            return (
                f"**6-Month Historical Backtesting Results for {ticker} (Multi-Factor Quant):**\n\n"
                f"• **Strategy Total Return:** **{'+' if strat_ret >= 0 else ''}{strat_ret:.2f}%** (vs Buy & Hold: {'+' if bh_ret >= 0 else ''}{bh_ret:.2f}%)\n"
                f"• **Alpha Generated:** **{'+' if alpha >= 0 else ''}{alpha:.2f}%** outperformance over buy-and-hold.\n"
                f"• **Win Rate:** **{win_rate:.1f}%** across **{trades_count} executed trades** ({quant_bt.get('winningTrades', 0)} Wins / {quant_bt.get('losingTrades', 0)} Losses).\n"
                f"• **Profit Factor:** **{pf:.2f}x** gross gains relative to gross losses.\n"
                f"• **Max Drawdown:** **-{dd:.2f}%** peak-to-trough portfolio decline.\n"
                f"• **Current Position:** **{'🟢 Holding Active Long Position' if quant_bt.get('isCurrentlyHolding') else '⚪ In Cash (100% Capital Protected)'}**."
            )

        # Intent 8: Valuation & Fundamentals (P/E, Market Cap, Beta, Dividend)
        elif any(w in q for w in ["valuation", "pe", "p/e", "forward pe", "market cap", "cap", "fundamental", "dividend", "yield", "beta", "cheap", "expensive"]):
            return (
                f"**Fundamental & Valuation Profile for {ticker} ({company_name}):**\n\n"
                f"• **Market Capitalization:** **{mcap_str}** (Sector: {profile.get('sector', 'Equities')}).\n"
                f"• **Trailing P/E Ratio:** **{pe_ratio}x** | **Forward P/E:** **{forward_pe}x**.\n"
                f"• **Market Beta (Volatility):** **{beta}** ({'Higher volatility than market (>1.0)' if isinstance(beta, (int, float)) and beta > 1 else 'Lower volatility than broad market (<1.0)'}).\n"
                f"• **Dividend Yield:** **{div_yield:.2f}%**.\n"
                f"• **52-Week Range:** **${low_52} - ${high_52}** (Current: ${price:.2f})."
            )

        # Intent 9: 30-Day Scenario Modeling (Bull, Base, Bear)
        elif any(w in q for w in ["scenario", "forecast", "projection", "future", "30 day", "month", "prediction", "cases"]):
            return (
                f"**30-Day Probabilistic Scenario Projections for {ticker}:**\n\n"
                f"• **[Bull Case] Target:** **${bull_case.get('target', target2):.2f}**\n"
                f"  - Probability: **{bull_case.get('probability', 55)}%** | Expected Upside: **+{bull_case.get('returnPct', 0)}%**\n"
                f"  - *Driver:* Technical breakout continuation and sustained institutional accumulation.\n\n"
                f"• **[Base Case] Target:** **${base_case.get('target', price):.2f}**\n"
                f"  - Probability: **{base_case.get('probability', 25)}%** | Expected Drift: **{base_case.get('returnPct', 0):+.1f}%**\n"
                f"  - *Driver:* Sideways range-bound oscillation near VWAP (${vwap:.2f}).\n\n"
                f"• **[Bear Case] Target:** **${bear_case.get('target', stop_loss):.2f}**\n"
                f"  - Probability: **{bear_case.get('probability', 20)}%** | Downside Exposure: **{bear_case.get('returnPct', 0)}%**\n"
                f"  - *Driver:* Invalidation of key support at ${stop_loss:.2f} on broader market correction."
            )

        # Fallback / Comprehensive Synthesis for open-ended queries
        else:
            return (
                f"**Comprehensive Quantitative Analysis for {ticker} ({company_name}):**\n\n"
                f"• **Market Price:** **${price:.2f}** | **AI Conviction:** **{conviction_score}% ({bias})** | **Rating:** **{overall}**.\n"
                f"• **Indicator Matrix:** **{bullish_count} Bullish** vs **{bearish_count} Bearish** signals.\n"
                f"• **Key Execution Levels:**\n"
                f"  - Recommended Entry: **{entry_zone}**\n"
                f"  - Dynamic Stop-Loss: **${stop_loss:.2f}**\n"
                f"  - Target 1 (Conservative): **${target1:.2f}**\n"
                f"  - Target 2 (Expansion): **${target2:.2f}** (Risk/Reward: **{rr_ratio}**)\n"
                f"• **Institutional Indicators:** CMF is **{cmf:+.3f}**, VWAP is **${vwap:.2f}**, and ATR volatility is **±${atr:.2f}**.\n\n"
                f"*Tip: You can ask specific questions like 'Is this a good time to buy?', 'What is the stop loss?', 'Explain why conviction is {conviction_score}%', or 'What was the closing price 20 days ago?'*"
            )

    @staticmethod
    def _compress_timeseries_context(timeseries: list) -> str:
        """
        Builds a token-compact historical price summary that retains exact close values for recent
        30 sessions while reducing LLM context overhead by >65%.
        """
        if not timeseries:
            return "Not available"

        recent = timeseries[-30:]
        closes = [float(b.get("close", 0.0) or 0.0) for b in recent]
        highs = [float(b.get("high", b.get("close", 0.0)) or 0.0) for b in recent]
        lows = [float(b.get("low", b.get("close", 0.0)) or 0.0) for b in recent]
        first_c = closes[0] or 1.0
        last_c = closes[-1]
        ret_30d = ((last_c - first_c) / first_c) * 100.0 if first_c else 0.0

        summary = (
            f"30-Session Range: Low=${min(lows):.2f}, High=${max(highs):.2f}, "
            f"Window Return={ret_30d:+.2f}%, Latest Close=${last_c:.2f}\n"
        )
        rows = []
        for i, bar in enumerate(reversed(recent)):
            dt = bar.get("time") or bar.get("date", "N/A")
            c_val = float(bar.get("close", 0.0) or 0.0)
            if i < 5:
                o_val = float(bar.get("open", c_val) or c_val)
                h_val = float(bar.get("high", c_val) or c_val)
                l_val = float(bar.get("low", c_val) or c_val)
                rows.append(f"d-{i}[{dt}]:O={o_val:.2f},H={h_val:.2f},L={l_val:.2f},C={c_val:.2f},V={int(bar.get('volume', 0) or 0):,}")
            else:
                rows.append(f"d-{i}[{dt}]:C=${c_val:.2f}")
        return summary + "  " + " | ".join(rows)

    def _prepare_copilot_context(
        self,
        ticker: str,
        question: str,
        stock_data: dict,
        chat_history: list = None,
        provider: str = None,
        model: str = None,
    ) -> dict:
        """Extracts quantitative dossier, builds compact LLM prompt, and generates cache key."""
        profile = stock_data.get('profile', {})
        signals = stock_data.get('signals', {})
        ai_data = stock_data.get('aiAnalysis', {})
        backtest_dict = stock_data.get('backtests', {})
        quant_bt = backtest_dict.get('quant', {})
        timeseries = stock_data.get('timeseries', [])

        price = profile.get('currentPrice', 0.0) or 0.0
        company_name = profile.get('name', ticker)
        sector = profile.get('sector', 'Equities')
        pe_ratio = profile.get('peRatio', 'N/A')
        forward_pe = profile.get('forwardPE', 'N/A')
        market_cap = profile.get('marketCap')
        mcap_str = f"${(market_cap / 1e9):.2f}B" if market_cap else 'N/A'
        beta = profile.get('beta', 'N/A')
        div_yield = profile.get('dividendYield', 0.0) or 0.0
        day_low = profile.get('dayLow', 'N/A')
        day_high = profile.get('dayHigh', 'N/A')
        low_52 = profile.get('fiftyTwoWeekLow', 'N/A')
        high_52 = profile.get('fiftyTwoWeekHigh', 'N/A')

        overall = signals.get('overall', 'Neutral')
        bullish_count = signals.get('bullishCount', 0)
        bearish_count = signals.get('bearishCount', 0)
        neutral_count = signals.get('neutralCount', 0)
        indicators = signals.get('indicators', {})

        atr = profile.get('atr', 0.0) or 2.0
        vwap = profile.get('vwap', 0.0) or price
        cmf = profile.get('cmf', 0.0) or 0.0

        conviction_score = ai_data.get('convictionScore', 50)
        bias = ai_data.get('directionalBias', 'Neutral')
        confluence = ai_data.get('confluence') or self.compute_technical_confluence(signals, profile)
        trade_levels = ai_data.get('tradeLevels', {})
        entry_zone = trade_levels.get('entryZone', f"${price}")
        stop_loss = trade_levels.get('stopLoss', round(price - (1.75 * atr), 2))
        target1 = trade_levels.get('target1', round(price + (1.5 * atr), 2))
        target2 = trade_levels.get('target2', round(price + (3.0 * atr), 2))
        rr_ratio = trade_levels.get('riskRewardRatio', '2.5:1')
        scenarios = ai_data.get('scenario30d', {})

        history_str = self._compress_timeseries_context(timeseries)
        sanitized_history = self._sanitize_chat_history(chat_history)

        q = question.strip().lower()
        clean_provider = self.normalize_provider(provider, model)
        target_model = (model or "").strip() or self.get_default_model(clean_provider)
        history_sig = hashlib.sha256(
            json.dumps(sanitized_history[-4:], sort_keys=True).encode('utf-8')
        ).hexdigest()[:8] if sanitized_history else "s0"
        q_hash = hashlib.sha256(q.encode('utf-8')).hexdigest()[:16]
        cache_key = f"chat:{ticker}:{q_hash}:{history_sig}:{clean_provider}:{target_model}"

        prompt = f"""
You are the FinDashIQ AI Financial Copilot, an elite quantitative hedge fund assistant.
The user is asking a specific question about {company_name} ({ticker}).

COMPACT QUANTITATIVE DOSSIER FOR {ticker}:
- Price: ${price} (Day: ${day_low}-${day_high}, 52W: ${low_52}-${high_52}) | Sector: {sector}, MCap: {mcap_str}, P/E: {pe_ratio}x (Fwd {forward_pe}x), Beta: {beta}, Div: {div_yield}%
- AI Conviction: {conviction_score}% ({bias}) | Confluence: {confluence.get('badgeLabel', 'Neutral')} ({confluence.get('tier', '')})
- Technical Consensus: {overall} ({bullish_count} Bullish / {bearish_count} Bearish / {neutral_count} Neutral)
- Indicators: ATR ±${atr:.2f}; VWAP ${vwap:.2f} ({'above' if price >= vwap else 'below'}); CMF {cmf:.3f}; SuperTrend {indicators.get('SuperTrend', {}).get('signal', 'N/A')} (${indicators.get('SuperTrend', {}).get('value', 'N/A')}); RSI {indicators.get('RSI', {}).get('value', 'N/A')} ({indicators.get('RSI', {}).get('signal', 'N/A')}); Stoch {indicators.get('Stochastic', {}).get('value', 'N/A')}; MACD {indicators.get('MACD', {}).get('signal', 'N/A')} (Hist {indicators.get('MACD', {}).get('hist', 'N/A')})
- Trade Levels: Entry {entry_zone} | SL ${stop_loss} | T1 ${target1} | T2 ${target2} | R/R {rr_ratio}
- 30D Scenarios: Bull ${scenarios.get('bullCase', {}).get('target', 'N/A')} ({scenarios.get('bullCase', {}).get('probability', 'N/A')}%, +{scenarios.get('bullCase', {}).get('returnPct', 'N/A')}%); Base ${scenarios.get('baseCase', {}).get('target', 'N/A')} ({scenarios.get('baseCase', {}).get('probability', 'N/A')}%); Bear ${scenarios.get('bearCase', {}).get('target', 'N/A')} ({scenarios.get('bearCase', {}).get('probability', 'N/A')}%, {scenarios.get('bearCase', {}).get('returnPct', 'N/A')}%)
- Quant Backtest (6M): Win Rate {quant_bt.get('winRatePct', 0):.1f}%, Return {quant_bt.get('strategyReturnPct', 0):.1f}% (Alpha {quant_bt.get('alpha', 0):.1f}%), PF {quant_bt.get('profitFactor', 1.0):.2f}x
- Price History (d-N trading days ago):
{history_str}

USER QUESTION: "{question}"

INSTRUCTIONS:
1. Answer directly in the first sentence. Extract exact dollar values from d-N entries if historical prices are requested.
2. Ground your response strictly in the dossier metrics above and reference prior conversation context when helpful.
3. Format cleanly using Markdown headings, bullet lists, bold numbers, or tables when appropriate.
""".strip()

        quant_args = (
            ticker, company_name, price, overall, conviction_score, bias,
            bullish_count, bearish_count, indicators, atr, vwap, cmf,
            entry_zone, stop_loss, target1, target2, rr_ratio,
            scenarios, quant_bt, profile, timeseries, q,
        )
        return {
            "prompt": prompt,
            "quant_args": quant_args,
            "cache_key": cache_key,
            "provider": clean_provider,
            "model": target_model,
            "history": sanitized_history,
        }

    def ask_copilot(
        self,
        ticker: str,
        question: str,
        stock_data: dict,
        chat_history: list = None,
        api_key: str = None,
        provider: str = None,
        model: str = None,
        api_keys: dict = None,
    ) -> str:
        """
        Answers user questions regarding the current stock with contextual quantitative data.
        Supports multi-turn conversation history and Google Gemini 4, Anthropic Claude, and OpenAI GPT-6
        with dual-tier caching and Built-in Quantitative Intelligence fallback.
        """
        if not stock_data:
            return f"I don't have current quantitative market data loaded for {ticker}. Please analyze the stock first."

        ctx = self._prepare_copilot_context(ticker, question, stock_data, chat_history, provider, model)
        clean_provider = ctx["provider"]
        target_model = ctx["model"]
        cache_key = ctx["cache_key"]

        cached_answer = self._get_cached(cache_key)
        if cached_answer:
            return cached_answer

        resolved_key = self.resolve_api_key(clean_provider, api_key=api_key, api_keys=api_keys)
        if resolved_key and len(resolved_key.strip()) > 6:
            llm_text, used_model, llm_err = self.call_llm(
                ctx["prompt"],
                resolved_key,
                provider=clean_provider,
                model_name=target_model,
                allow_fallback=True,
                max_tokens=2048,
                thinking_level="low",
                chat_history=ctx["history"],
            )
            provider_label = AI_PROVIDER_CATALOG.get(clean_provider, {}).get("name", clean_provider.title())
            if llm_text:
                if used_model != target_model:
                    full_answer = f"{llm_text}\n\n*— Generated by {provider_label} ({used_model}; auto-routed from {target_model} due to rate limits)*"
                else:
                    full_answer = f"{llm_text}\n\n*— Generated by {provider_label} ({used_model})*"
                self._set_cached(cache_key, full_answer, ttl_seconds=600)
                return full_answer
            elif llm_err:
                fallback = self._get_quantitative_response(*ctx["quant_args"])
                return f"⚠️ *{llm_err}*\n\n*Falling back to Built-in Quantitative Intelligence:*\n\n{fallback}"

        quant_res = self._get_quantitative_response(*ctx["quant_args"])
        self._set_cached(cache_key, quant_res, ttl_seconds=600)
        return quant_res

    def stream_copilot(
        self,
        ticker: str,
        question: str,
        stock_data: dict,
        chat_history: list = None,
        api_key: str = None,
        provider: str = None,
        model: str = None,
        api_keys: dict = None,
    ):
        """
        Generator yielding SSE payload dicts for real-time Copilot token streaming.
        Yields {'type': 'delta', 'delta': str} and finishes with {'type': 'done', 'answer': str, 'provider': str, 'model': str}.
        """
        if not stock_data:
            msg = f"I don't have current quantitative market data loaded for {ticker}. Please analyze the stock first."
            yield {"type": "delta", "delta": msg}
            yield {"type": "done", "answer": msg, "provider": "builtin", "model": "builtin-quant"}
            return

        ctx = self._prepare_copilot_context(ticker, question, stock_data, chat_history, provider, model)
        clean_provider = ctx["provider"]
        target_model = ctx["model"]
        cache_key = ctx["cache_key"]

        cached_answer = self._get_cached(cache_key)
        if cached_answer:
            yield {"type": "delta", "delta": cached_answer}
            yield {"type": "done", "answer": cached_answer, "provider": clean_provider, "model": target_model, "cached": True}
            return

        resolved_key = self.resolve_api_key(clean_provider, api_key=api_key, api_keys=api_keys)
        provider_label = AI_PROVIDER_CATALOG.get(clean_provider, {}).get("name", clean_provider.title())

        if resolved_key and len(resolved_key.strip()) > 6:
            collected = []
            used_model = target_model
            stream_error = ""
            for evt in self.stream_llm(
                ctx["prompt"],
                resolved_key,
                provider=clean_provider,
                model_name=target_model,
                allow_fallback=True,
                max_tokens=2048,
                thinking_level="low",
                chat_history=ctx["history"],
            ):
                if evt.get("type") == "delta" and evt.get("delta"):
                    used_model = evt.get("model") or used_model
                    collected.append(evt["delta"])
                    yield {"type": "delta", "delta": evt["delta"], "model": used_model}
                elif evt.get("type") == "error":
                    stream_error = evt.get("error", "")

            if collected:
                llm_text = "".join(collected).strip()
                if used_model != target_model:
                    footer = f"\n\n*— Generated by {provider_label} ({used_model}; auto-routed from {target_model} due to rate limits)*"
                else:
                    footer = f"\n\n*— Generated by {provider_label} ({used_model})*"
                yield {"type": "delta", "delta": footer, "model": used_model}
                full_answer = llm_text + footer
                self._set_cached(cache_key, full_answer, ttl_seconds=600)
                yield {"type": "done", "answer": full_answer, "provider": clean_provider, "model": used_model}
                return

            if stream_error:
                fallback = self._get_quantitative_response(*ctx["quant_args"])
                full_fallback = f"⚠️ *{stream_error}*\n\n*Falling back to Built-in Quantitative Intelligence:*\n\n{fallback}"
                yield {"type": "delta", "delta": full_fallback}
                yield {"type": "done", "answer": full_fallback, "provider": "builtin", "model": "builtin-quant"}
                return

        quant_res = self._get_quantitative_response(*ctx["quant_args"])
        self._set_cached(cache_key, quant_res, ttl_seconds=600)
        yield {"type": "delta", "delta": quant_res}
        yield {"type": "done", "answer": quant_res, "provider": "builtin", "model": "builtin-quant"}


ai_service = AIService()
