import os
from datetime import datetime
from flask import Blueprint, jsonify, request
from services.ai_service import ai_service

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/api/ai-chat', methods=['POST'])
def api_ai_chat():
    """Endpoint for the interactive AI Financial Copilot."""
    data = request.get_json(silent=True) or {}
    ticker = data.get('ticker', 'STOCK').upper()
    question = data.get('question', '').strip()
    stock_data = data.get('stockData') or {}
    api_key = data.get('apiKey')
    provider = data.get('provider', 'gemini')
    model = data.get('model', 'gemini-3.7-flash')

    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    answer = ai_service.ask_copilot(
        ticker=ticker,
        question=question,
        stock_data=stock_data,
        api_key=api_key,
        provider=provider,
        model=model
    )

    return jsonify({
        "success": True,
        "ticker": ticker,
        "question": question,
        "answer": answer,
        "timestamp": datetime.now().isoformat()
    }), 200


@ai_bp.route('/api/test-gemini', methods=['POST'])
def test_gemini():
    """Validates the Google Gemini API key and returns a per-model diagnostic report."""
    data = request.get_json(silent=True) or {}
    api_key = data.get('apiKey', '').strip()
    if not api_key:
        api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    model = data.get('model', 'gemini-3.7-flash').strip()

    if not api_key:
        return jsonify({"success": False, "error": "No API key configured.", "models": []}), 200

    report = ai_service.test_model_cascade(api_key, preferred_model=model)
    return jsonify(report), 200
