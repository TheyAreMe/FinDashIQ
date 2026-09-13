import concurrent.futures
import threading
from datetime import datetime
from flask import Blueprint, jsonify, request, session
from services.stock_service import stock_service, normalize_ticker, sanitize_for_json
from services.currency_service import currency_service
from services.ai_service import ai_service
from services.news_service import news_service
from routes.helpers import (
    load_users, save_users, get_current_user_data_from_session,
    WATCHLIST_FILE, DEFAULT_WATCHLIST
)

stock_bp = Blueprint('stock', __name__)


def get_current_user_data():
    return get_current_user_data_from_session(session)


@stock_bp.route('/api/forex/rates', methods=['GET'])
def api_get_forex_rates():
    """Returns current cached exchange rates against USD."""
    try:
        rates = currency_service.get_rates()
        return jsonify({
            'success': True,
            'base': 'USD',
            'rates': rates,
            'timestamp': currency_service._last_fetch
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@stock_bp.route('/api/forex/convert', methods=['GET', 'POST'])
def api_convert_currency():
    """Converts a given amount from one currency to another."""
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            amount = float(data.get('amount', 0))
            from_curr = data.get('from') or data.get('from_currency') or data.get('from_curr') or 'USD'
            to_curr = data.get('to') or data.get('to_currency') or data.get('to_curr') or 'USD'
        else:
            amount = float(request.args.get('amount', 0))
            from_curr = request.args.get('from') or request.args.get('from_currency') or request.args.get('from_curr') or 'USD'
            to_curr = request.args.get('to') or request.args.get('to_currency') or request.args.get('to_curr') or 'USD'

        converted = currency_service.convert(amount, from_curr, to_curr)
        return jsonify({
            'success': True,
            'amount': amount,
            'from': from_curr,
            'to': to_curr,
            'result': converted
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@stock_bp.route('/api/stocks/search', methods=['GET'])
def api_search_stocks():
    """Endpoint for real-time company name and ticker search with multi-exchange disambiguation."""
    query = request.args.get('q') or request.args.get('query') or ''
    try:
        limit = min(int(request.args.get('limit', 12)), 30)
    except (ValueError, TypeError):
        limit = 12

    try:
        results = stock_service.search_stocks(query, limit=limit)
        return jsonify({
            'success': True,
            'query': query,
            'count': len(results),
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'query': query,
            'results': []
        }), 500


@stock_bp.route('/api/stocks/resolve', methods=['POST'])
def api_resolve_stocks():
    """Resolves a batch of mixed tickers and/or company names into validated ticker symbols."""
    data = request.get_json(silent=True) or {}
    raw_queries = data.get('queries') or data.get('query') or []
    if isinstance(raw_queries, str):
        query_list = [q.strip() for q in raw_queries.split(',') if q.strip()]
    elif isinstance(raw_queries, list):
        query_list = [str(q).strip() for q in raw_queries if str(q).strip()]
    else:
        query_list = []

    if not query_list:
        return jsonify({'success': False, 'error': 'No queries provided.', 'resolved': [], 'tickers': []}), 400

    resolved_list = []
    final_tickers = []
    seen = set()

    for item in query_list:
        clean_item = item.strip()
        if not clean_item:
            continue

        search_results = stock_service.search_stocks(clean_item, limit=5)
        if search_results:
            top_match = None
            for cand in search_results:
                if cand.get('ticker', '').upper() == clean_item.upper():
                    top_match = cand
                    break
            if not top_match:
                top_match = search_results[0]

            resolved_ticker = top_match.get('ticker')
            if resolved_ticker and resolved_ticker not in seen:
                seen.add(resolved_ticker)
                final_tickers.append(resolved_ticker)
                resolved_list.append({
                    'query': clean_item,
                    'ticker': resolved_ticker,
                    'name': top_match.get('name', resolved_ticker),
                    'exchange': top_match.get('exchange', 'Global'),
                    'type': top_match.get('type', 'EQUITY'),
                    'isExactTicker': bool(clean_item.upper() == resolved_ticker.upper()),
                    'allMatches': search_results
                })
        else:
            fallback_ticker = clean_item.upper()
            if fallback_ticker not in seen:
                seen.add(fallback_ticker)
                final_tickers.append(fallback_ticker)
                resolved_list.append({
                    'query': clean_item,
                    'ticker': fallback_ticker,
                    'name': fallback_ticker,
                    'exchange': 'Global',
                    'type': 'EQUITY',
                    'isExactTicker': True,
                    'allMatches': []
                })

    return jsonify({
        'success': True,
        'resolved': resolved_list,
        'tickers': final_tickers,
        'tickerString': ", ".join(final_tickers)
    }), 200


@stock_bp.route('/api/stocks/<path:ticker>', methods=['GET'])
def api_get_single_stock(ticker):
    """Returns single stock dataset with full timeseries and indicators for backtesting and deep analysis."""
    clean_ticker = (ticker or '').strip().upper()
    if not clean_ticker:
        return jsonify({'error': 'Ticker required'}), 400

    period = request.args.get('period', 'max')
    interval = request.args.get('interval', '1d')
    force_refresh = request.args.get('forceRefresh', '').lower() in ('true', '1', 'yes')

    valid_periods = {'1mo', '3mo', '6mo', '1y', '2y', '5y', 'ytd', 'max'}
    if period not in valid_periods:
        period = 'max'

    include_backtests = request.args.get('includeBacktests', 'false').lower() in ('true', '1')

    try:
        results = stock_service.fetch_full_stock_analysis([clean_ticker], period=period, interval=interval, force_refresh=force_refresh, phase='full', include_backtests=include_backtests)
        stocks = results.get('stocks', {})
        stock_data = stocks.get(clean_ticker) or stocks.get(normalize_ticker(clean_ticker))
        if not stock_data:
            return jsonify({'error': f'Could not retrieve market data for {clean_ticker}'}), 404
        if 'error' in stock_data and not stock_data.get('timeseries'):
            return jsonify({'error': stock_data['error']}), 404

        return jsonify(sanitize_for_json({
            'success': True,
            'ticker': clean_ticker,
            'period': period,
            'interval': interval,
            'profile': stock_data.get('profile', {}),
            'currentPrice': stock_data.get('currentPrice') or (stock_data.get('profile', {}).get('currentPrice', 0)),
            'timeseries': stock_data.get('timeseries', []),
            'signals': stock_data.get('signals', {}),
            'backtests': stock_data.get('backtests', {})
        })), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@stock_bp.route('/api/analyze', methods=['POST'])
def api_analyze():
    """Primary API endpoint to analyze stock tickers and generate AI Intelligence."""
    data = request.get_json(silent=True)
    if not data or 'tickers' not in data:
        return jsonify({"error": "Missing 'tickers' list in request body."}), 400

    raw_tickers = data.get('tickers')
    if isinstance(raw_tickers, str):
        tickers = [t.strip() for t in raw_tickers.split(',') if t.strip()]
    elif isinstance(raw_tickers, list):
        tickers = [str(t).strip() for t in raw_tickers if str(t).strip()]
    else:
        return jsonify({"error": "Invalid format for 'tickers'. Must be an array or comma-separated string."}), 400

    if not tickers:
        return jsonify({"error": "Please provide at least one valid stock ticker."}), 400

    resolved_tickers = []
    for t in tickers:
        clean_t = t.strip()
        if len(clean_t) > 5 and '.' not in clean_t:
            s_res = stock_service.search_stocks(clean_t, limit=1)
            if s_res and s_res[0].get('ticker'):
                resolved_tickers.append(s_res[0]['ticker'])
                continue
        resolved_tickers.append(clean_t.upper())
    tickers = resolved_tickers

    period = data.get('period', '6mo')
    interval = data.get('interval', '1d')
    force_refresh = data.get('forceRefresh', False)
    phase = str(data.get('phase', 'full')).strip().lower()
    api_key = data.get('apiKey')
    provider = data.get('provider', 'gemini')
    model = data.get('model', 'gemini-3.7-flash')

    valid_periods = {'1mo', '3mo', '6mo', '1y', '2y', '5y', 'ytd', 'max'}
    if period not in valid_periods:
        period = '6mo'

    try:
        results = stock_service.fetch_full_stock_analysis(tickers, period=period, interval=interval, force_refresh=force_refresh, phase=phase)

        if 'error' in results and not results.get('stocks'):
            return jsonify({"error": results['error']}), 500

        current_prices = {}
        analysis_summary = {}

        if phase == 'fast':
            for ticker, sdata in results.get('stocks', {}).items():
                if 'error' in sdata:
                    current_prices[ticker] = {'price': None, 'status': sdata['error']}
                    analysis_summary[ticker] = {'error': sdata['error']}
                    continue

                profile = sdata.get('profile', {})
                signals = sdata.get('signals', {})
                indicators_info = signals.get('indicators', {})

                c_score, bias, stance_color, _ = ai_service.compute_conviction_score(
                    profile=profile,
                    signals=signals,
                    backtest_data=sdata.get('backtests'),
                    news=sdata.get('news', [])
                )
                sdata['aiAnalysis'] = {
                    'convictionScore': c_score,
                    'directionalBias': bias,
                    'stanceColor': stance_color
                }

                current_prices[ticker] = {
                    'price': profile.get('currentPrice'),
                    'change': profile.get('change'),
                    'changePercent': profile.get('changePercent'),
                    'currency': profile.get('currency', 'USD'),
                    'status': 'Success'
                }
                analysis_summary[ticker] = {
                    'overall': signals.get('overall', 'Neutral'),
                    'score': signals.get('score', 0),
                    'RSI': indicators_info.get('RSI', {}).get('value'),
                    'MACD': indicators_info.get('MACD', {}).get('value'),
                    'SuperTrend': indicators_info.get('SuperTrend', {}).get('value'),
                    'ConvictionScore': c_score
                }

            return jsonify({
                'success': True,
                'phase': 'fast',
                'isFastHydration': True,
                'tickers': results.get('tickers', tickers),
                'stocks': results.get('stocks', {}),
                'current_prices': current_prices,
                'analysis': analysis_summary,
                'timestamp': results.get('timestamp', datetime.now().isoformat())
            }), 200

        is_single_stock = (len(tickers) == 1)
        allow_batch_llm = data.get('allowLLM', is_single_stock)

        def _enrich_single_stock_ai(item):
            ticker, sdata = item
            if 'error' in sdata:
                return ticker, sdata, {'price': None, 'status': sdata['error']}, {'error': sdata['error']}

            profile = sdata.get('profile', {})
            signals = sdata.get('signals', {})
            timeseries = sdata.get('timeseries', [])
            backtests = sdata.get('backtests', {})

            cached_memo_key = f"memo:{ticker}:{model}"
            is_cached = bool(ai_service._get_cached(cached_memo_key))
            item_allow_llm = allow_batch_llm or is_cached or is_single_stock

            if not force_refresh and sdata.get('aiAnalysis') and not sdata['aiAnalysis'].get('error'):
                ai_analysis = sdata['aiAnalysis']
            else:
                ai_analysis = ai_service.generate_ai_analysis(
                    profile=profile,
                    timeseries=timeseries,
                    signals=signals,
                    backtest_data=backtests,
                    news=sdata.get('news', []),
                    api_key=api_key,
                    provider=provider,
                    model=model,
                    allow_llm=item_allow_llm,
                    force_refresh=force_refresh
                )
                sdata['aiAnalysis'] = ai_analysis

            c_price = {
                'price': profile.get('currentPrice'),
                'change': profile.get('change'),
                'changePercent': profile.get('changePercent'),
                'currency': profile.get('currency', 'USD'),
                'status': 'Success'
            }
            
            indicators_info = signals.get('indicators', {})
            a_summary = {
                'overall': signals.get('overall', 'Neutral'),
                'score': signals.get('score', 0),
                'RSI': indicators_info.get('RSI', {}).get('value'),
                'MACD': indicators_info.get('MACD', {}).get('value'),
                'Signal': indicators_info.get('MACD', {}).get('signal_line'),
                'MACD_Hist': indicators_info.get('MACD', {}).get('hist'),
                'SuperTrend': indicators_info.get('SuperTrend', {}).get('value'),
                'ConvictionScore': ai_analysis.get('convictionScore', 50)
            }
            return ticker, sdata, c_price, a_summary

        stock_items = list(results.get('stocks', {}).items())
        max_ai_workers = min(len(stock_items), 12) if stock_items else 1

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_ai_workers) as executor:
            future_to_item = {executor.submit(_enrich_single_stock_ai, item): item for item in stock_items}
            for future in concurrent.futures.as_completed(future_to_item):
                try:
                    ticker, sdata, c_price, a_summary = future.result()
                    results['stocks'][ticker] = sdata
                    current_prices[ticker] = c_price
                    analysis_summary[ticker] = a_summary
                except Exception:
                    pass

        response = {
            'success': True,
            'phase': 'full',
            'isFastHydration': False,
            'message': 'Stock analysis, indicators, backtests, and AI intelligence successfully generated.',
            'period': period,
            'interval': interval,
            'tickers': results.get('tickers', tickers),
            'stocks': results.get('stocks', {}),
            'current_prices': current_prices,
            'analysis': analysis_summary,
            'timestamp': results.get('timestamp', datetime.now().isoformat())
        }

        return jsonify(sanitize_for_json(response)), 200

    except Exception as e:
        return jsonify({"error": f"Internal analysis error: {str(e)}"}), 500


@stock_bp.route('/api/stocks/<path:ticker>/news', methods=['GET'])
def api_get_stock_news(ticker):
    """Returns multi-source global financial news for a specific stock."""
    clean_ticker = str(ticker).strip().upper()
    force_refresh = request.args.get('forceRefresh', '').lower() in ('true', '1')
    company_name = request.args.get('name', '').strip()
    limit = int(request.args.get('limit', 35))

    news_items = news_service.fetch_global_news(
        ticker=clean_ticker,
        company_name=company_name,
        limit=limit,
        force_refresh=force_refresh
    )

    user, _ = get_current_user_data()
    api_key = user.get('aiSettings', {}).get('apiKey') if user else None
    model = user.get('aiSettings', {}).get('model', 'gemini-3.7-flash') if user else 'gemini-3.7-flash'

    synthesis = ai_service.synthesize_news_sentiment(
        ticker=clean_ticker,
        company_name=company_name or clean_ticker,
        current_price=100.0,
        news_items=news_items,
        api_key=api_key,
        model=model
    )

    return jsonify({
        "success": True,
        "ticker": clean_ticker,
        "newsCount": len(news_items),
        "news": news_items,
        "synthesis": synthesis,
        "timestamp": datetime.now().isoformat()
    }), 200


@stock_bp.route('/api/stock/warmup-status', methods=['GET'])
def api_stock_warmup_status():
    """Returns live metrics about server startup pre-hydration and RAM cache warming."""
    return jsonify(stock_service.get_warmup_status()), 200


@stock_bp.route('/api/stock/warmup', methods=['POST'])
def api_stock_warmup_trigger():
    """Admin-only: Asynchronously triggers a full pre-hydration warmup cycle for all assets."""
    user, _ = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "message": "Administrator privileges required."}), 403

    def _async_warmup():
        stock_service.prehydrate_universe(force_refresh=True)

    threading.Thread(target=_async_warmup, daemon=True, name="ManualStockWarmup").start()
    return jsonify({"success": True, "message": "Background universe pre-hydration initiated."}), 200


@stock_bp.route('/api/watchlist', methods=['GET', 'POST'])
def api_watchlist():
    """Permanent watchlist endpoint with strict per-user isolation."""
    import json
    import os
    user, username = get_current_user_data()
    users = load_users()

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        tickers = data.get('tickers', [])
        cleaned = [str(t).strip().upper() for t in tickers if str(t).strip()]

        if user and username in users:
            users[username]['watchlist'] = cleaned
            save_users(users)
        else:
            with open(WATCHLIST_FILE, 'w', encoding='utf-8') as f:
                json.dump(cleaned, f, indent=2)

        return jsonify({"success": True, "tickers": cleaned}), 200

    # GET request
    if user and username in users:
        user_wl = users[username].get('watchlist')
        if user_wl is not None:
            return jsonify({"success": True, "tickers": user_wl}), 200

    if os.path.exists(WATCHLIST_FILE):
        try:
            with open(WATCHLIST_FILE, 'r', encoding='utf-8') as f:
                tickers = json.load(f)
                return jsonify({"success": True, "tickers": tickers}), 200
        except Exception:
            pass

    return jsonify({"success": True, "tickers": DEFAULT_WATCHLIST}), 200
