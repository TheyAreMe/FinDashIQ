from flask import Blueprint, jsonify, request, session
from services.i18n_service import i18n_service, SUPPORTED_LANGUAGES
from routes.helpers import get_decrypted_user_ai_settings, require_auth_json

i18n_bp = Blueprint('i18n', __name__)


@i18n_bp.route('/api/i18n/languages', methods=['GET'])
def api_get_languages():
    """Returns the list of 7 supported languages with metadata."""
    return jsonify({
        'success': True,
        'languages': list(SUPPORTED_LANGUAGES.values()),
        'default': 'en'
    }), 200


@i18n_bp.route('/api/i18n/bundle/<lang>', methods=['GET'])
def api_get_bundle(lang):
    """Returns all cached translations for a specific language."""
    clean_lang = str(lang or 'en').strip().lower()
    bundle = i18n_service.get_bundle(clean_lang)
    return jsonify({
        'success': True,
        'language': clean_lang,
        'translations': bundle
    }), 200


@i18n_bp.route('/api/i18n/translate', methods=['POST'])
def api_translate_batch():
    """
    Translates a batch of English phrases into the target language (Auth Required).
    """
    user, _, err_resp = require_auth_json(session)
    if err_resp:
        return err_resp

    data = request.get_json(silent=True) or {}
    target_lang = str(data.get('targetLang') or data.get('lang') or 'en').strip().lower()
    strings = data.get('strings') or []

    if not isinstance(strings, list):
        return jsonify({'error': 'strings must be an array of text phrases.'}), 400

    user_ai = get_decrypted_user_ai_settings(user)
    provider = user_ai.get('provider', 'gemini')
    model = user_ai.get('customModel') or user_ai.get('model')
    api_key = user_ai.get('apiKey') or ''
    api_keys = user_ai.get('apiKeys') or {}

    translations = i18n_service.translate_batch(
        strings,
        target_lang=target_lang,
        api_key=api_key,
        provider=provider,
        model=model,
        api_keys=api_keys,
    )

    return jsonify({
        'success': True,
        'targetLang': target_lang,
        'count': len(translations),
        'translations': translations
    }), 200
