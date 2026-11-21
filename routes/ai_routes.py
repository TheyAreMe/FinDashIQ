import json
from datetime import datetime
from flask import Blueprint, Response, jsonify, request, session, stream_with_context
from services.ai_service import ai_service
from routes.helpers import get_decrypted_user_ai_settings, require_auth_json

ai_bp = Blueprint('ai', __name__)


def _is_masked_placeholder(val: str) -> bool:
    s = str(val or '').strip()
    if not s:
        return True
    if '••' in s or '...' in s:
        return True
    return False


def _resolve_session_ai_context(data: dict, user: dict = None) -> tuple[str, str, str, dict]:
    """Resolves provider, model, explicit/saved decrypted key, and per-provider key map."""
    user_ai = get_decrypted_user_ai_settings(user)

    raw_model = str(data.get('model') or user_ai.get('customModel') or user_ai.get('model') or '').strip()
    raw_provider = data.get('provider') or user_ai.get('provider')
    provider = ai_service.normalize_provider(raw_provider, raw_model)
    model = raw_model or ai_service.get_default_model(provider)

    api_keys = dict(user_ai.get('apiKeys') or {})
    if isinstance(data.get('apiKeys'), dict):
        for k, v in data['apiKeys'].items():
            clean_v = str(v or '').strip()
            if clean_v and not _is_masked_placeholder(clean_v):
                api_keys[ai_service.normalize_provider(k)] = clean_v

    explicit_key = str(data.get('apiKey') or '').strip()
    if _is_masked_placeholder(explicit_key):
        explicit_key = ''
    resolved_key = ai_service.resolve_api_key(provider, api_key=explicit_key, api_keys=api_keys)
    return provider, model, resolved_key, api_keys


@ai_bp.route('/api/ai/catalog', methods=['GET'])
def api_ai_catalog():
    """Returns supported AI providers, curated model lists, and server env-key status."""
    return jsonify({"success": True, **ai_service.get_provider_catalog()}), 200


@ai_bp.route('/api/ai/models', methods=['POST'])
def api_ai_models():
    """Fetches live available model IDs from the selected provider API."""
    user, _, auth_err = require_auth_json(session)
    if auth_err:
        return auth_err

    data = request.get_json(silent=True) or {}
    provider, _, resolved_key, _ = _resolve_session_ai_context(data, user=user)
    report = ai_service.list_provider_models(api_key=resolved_key, provider=provider)
    return jsonify(report), 200


@ai_bp.route('/api/ai-chat', methods=['POST'])
def api_ai_chat():
    """Endpoint for the interactive multi-provider AI Financial Copilot."""
    user, _, auth_err = require_auth_json(session)
    if auth_err:
        return auth_err

    data = request.get_json(silent=True) or {}
    ticker = str(data.get('ticker', 'STOCK')).upper()
    question = str(data.get('question', '')).strip()
    stock_data = data.get('stockData') or {}
    raw_history = data.get('chatHistory')
    chat_history = raw_history if isinstance(raw_history, list) else []

    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    provider, model, resolved_key, api_keys = _resolve_session_ai_context(data, user=user)

    answer = ai_service.ask_copilot(
        ticker=ticker,
        question=question,
        stock_data=stock_data,
        chat_history=chat_history,
        api_key=resolved_key,
        provider=provider,
        model=model,
        api_keys=api_keys,
    )

    return jsonify({
        "success": True,
        "ticker": ticker,
        "question": question,
        "provider": provider,
        "model": model,
        "answer": answer,
        "timestamp": datetime.now().isoformat(),
    }), 200


@ai_bp.route('/api/ai-chat/stream', methods=['POST'])
def api_ai_chat_stream():
    """Server-Sent Events streaming endpoint for the AI Financial Copilot."""
    user, _, auth_err = require_auth_json(session)
    if auth_err:
        return auth_err

    data = request.get_json(silent=True) or {}
    ticker = str(data.get('ticker', 'STOCK')).upper()
    question = str(data.get('question', '')).strip()
    stock_data = data.get('stockData') or {}
    raw_history = data.get('chatHistory')
    chat_history = raw_history if isinstance(raw_history, list) else []

    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    provider, model, resolved_key, api_keys = _resolve_session_ai_context(data, user=user)

    def _event_stream():
        try:
            yield f"data: {json.dumps({'type': 'meta', 'ticker': ticker, 'provider': provider, 'model': model})}\n\n"
            for event in ai_service.stream_copilot(
                ticker=ticker,
                question=question,
                stock_data=stock_data,
                chat_history=chat_history,
                api_key=resolved_key,
                provider=provider,
                model=model,
                api_keys=api_keys,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'error': str(exc)})}\n\n"

    return Response(
        stream_with_context(_event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
        },
    )


@ai_bp.route('/api/test-ai', methods=['POST'])
@ai_bp.route('/api/test-gemini', methods=['POST'])
def test_ai_connection():
    """Validates the API key for Gemini, Anthropic, or OpenAI and returns a diagnostic report."""
    user, _, auth_err = require_auth_json(session)
    if auth_err:
        return auth_err

    data = request.get_json(silent=True) or {}
    provider, model, resolved_key, _ = _resolve_session_ai_context(data, user=user)

    if not resolved_key:
        return jsonify({
            "success": False,
            "provider": provider,
            "error": "No API key configured.",
            "models": [],
        }), 200

    report = ai_service.test_provider_connection(
        resolved_key,
        provider=provider,
        preferred_model=model,
    )
    return jsonify(report), 200
