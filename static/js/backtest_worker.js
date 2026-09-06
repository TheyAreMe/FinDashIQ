/**
 * Backtest Simulation Engine Web Worker
 * Performs high-performance, non-blocking multi-strategy simulation off the main thread.
 */

self.onmessage = function (e) {
    const data = e.data || {};
    const { action, timeseries, strategies, options, requestId } = data;

    if (action === 'simulate_matrix') {
        if (!timeseries || !Array.isArray(timeseries) || timeseries.length < 5) {
            self.postMessage({ action: 'matrix_result', requestId, results: [] });
            return;
        }

        const results = [];
        const strats = strategies || [
            { key: 'omni_consensus', name: '👑 Omni-Consensus Master Ensemble', desc: 'All 9 Indicators Unified' },
            { key: 'ai_conviction', name: '🤖 AI Conviction Model', desc: 'Dynamic Thresholding' },
            { key: 'supertrend', name: '📈 SuperTrend Trend Follower', desc: 'ATR Volatility Trailing' },
            { key: 'ema_cross', name: '⚡ EMA 9 / 21 Cross', desc: 'Golden / Death Cross' },
            { key: 'bollinger', name: '🎯 Bollinger Bands', desc: '20-day 2σ Mean Reversion' },
            { key: 'momentum', name: '🌊 MACD + RSI Dual Momentum', desc: 'Trend & Velocity' },
            { key: 'stochastic', name: '⚡ Stochastic Oscillator', desc: '14, 3, 3 Momentum Cross' },
            { key: 'cmf_breakout', name: '💧 CMF Volume Breakout', desc: 'Chaikin Money Flow' }
        ];

        for (let i = 0; i < strats.length; i++) {
            const s = strats[i];
            const sim = runSimulation(timeseries, s.key, options || {});
            if (sim) {
                // Pack lightweight summary metrics for the comparison table to eliminate memory transfer overhead
                results.push({
                    key: s.key,
                    name: s.name,
                    desc: s.desc,
                    sim: {
                        strategy: sim.strategy,
                        strategyReturnPct: sim.strategyReturnPct,
                        buyHoldReturnPct: sim.buyHoldReturnPct,
                        alpha: sim.alpha,
                        winRatePct: sim.winRatePct,
                        profitFactor: sim.profitFactor,
                        sharpeRatio: sim.sharpeRatio,
                        sortinoRatio: sim.sortinoRatio,
                        maxDrawdownPct: sim.maxDrawdownPct,
                        totalTrades: sim.totalTrades,
                        winningTrades: sim.winningTrades,
                        losingTrades: sim.losingTrades,
                        finalEquity: sim.finalEquity
                    }
                });
            }
        }

        // Sort descending by total strategy return
        results.sort((a, b) => b.sim.strategyReturnPct - a.sim.strategyReturnPct);
        self.postMessage({ action: 'matrix_result', requestId, results });
    }
};

/**
 * Algorithmic Strategy Backtesting Simulation
 */
function runSimulation(rawTimeseries, strategy, options) {
    if (!rawTimeseries || rawTimeseries.length < 5) return null;

    const tf = options.timeframe || '1y';
    const initialCapital = Number(options.initialCapital || 10000);
    const stopLossPct = Number(options.stopLossPct !== undefined ? options.stopLossPct : 5.0);
    const takeProfitPct = Number(options.takeProfitPct !== undefined ? options.takeProfitPct : 12.0);
    const slippagePct = Number(options.slippagePct !== undefined ? options.slippagePct : 0.10);
    const mode = options.mode || 'long_only';

    const TF_BARS = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 999999
    };
    const barsCount = TF_BARS[tf.toLowerCase()] || 252;
    const timeseries = rawTimeseries.slice(-barsCount);

    if (timeseries.length < 5) return null;

    let capital = initialCapital;
    let position = 0; // shares: >0 for Long, <0 for Short, 0 for Cash
    let entryPrice = 0;
    let entryDate = '';
    const slippageRate = (slippagePct / 100);

    const trades = [];
    const closedTrades = [];
    const equityCurve = [];
    const initialPrice = timeseries[0].close || 1;
    let peakEquity = capital;
    let maxDrawdown = 0;

    for (let idx = 0; idx < timeseries.length; idx++) {
        const p = timeseries[idx];
        const date = p.time;
        const ts = p.timestamp || new Date(date).getTime();
        const close = p.close;
        const high = p.high || close;
        const low = p.low || close;
        if (!close) continue;

        const prevP = idx > 0 ? timeseries[idx - 1] : null;
        const prevClose = prevP ? prevP.close : close;

        let exitedThisBar = false;

        // 1. INTRA-BAR RISK CHECKS: Stop-Loss & Take-Profit
        if (position > 0) {
            // Check Long Stop-Loss
            if (low <= entryPrice * (1 - stopLossPct / 100)) {
                const exitPrice = entryPrice * (1 - stopLossPct / 100) * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'SELL',
                    side: 'LONG_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: position,
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🛑 Stop-Loss Hit (-${stopLossPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
            // Check Long Take-Profit
            else if (high >= entryPrice * (1 + takeProfitPct / 100)) {
                const exitPrice = entryPrice * (1 + takeProfitPct / 100) * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'SELL',
                    side: 'LONG_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: position,
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🎯 Take-Profit Reached (+${takeProfitPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
        } else if (position < 0 && mode === 'long_short') {
            // Check Short Stop-Loss
            if (high >= entryPrice * (1 + stopLossPct / 100)) {
                const exitPrice = entryPrice * (1 + stopLossPct / 100) * (1 + slippageRate);
                const pnl = (entryPrice - exitPrice) * Math.abs(position);
                const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100;
                capital = capital + pnl;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'COVER',
                    side: 'SHORT_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: Math.abs(position),
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🛑 Short Stop-Loss Hit (-${stopLossPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
            // Check Short Take-Profit
            else if (low <= entryPrice * (1 - takeProfitPct / 100)) {
                const exitPrice = entryPrice * (1 - takeProfitPct / 100) * (1 + slippageRate);
                const pnl = (entryPrice - exitPrice) * Math.abs(position);
                const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100;
                capital = capital + pnl;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'COVER',
                    side: 'SHORT_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: Math.abs(position),
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🎯 Short Take-Profit Reached (+${takeProfitPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
        }

        // 2. STRATEGY SIGNAL GENERATION
        let buySignal = false;
        let sellSignal = false;
        let buyReason = '';
        let sellReason = '';

        if (strategy === 'omni_consensus') {
            let score = 0;
            let maxScore = 0;

            const rawConv = (p.aiConviction !== undefined ? p.aiConviction : p.conviction);
            const convScore = (rawConv !== undefined && rawConv !== null && !isNaN(rawConv))
                ? Number(rawConv)
                : (50 + (p.superTrendDir === 1 ? 20 : -20) + ((p.macdHist || 0) > 0 ? 15 : -15));
            const normConv = Math.max(-1, Math.min(1, (convScore - 50) / 50));
            score += normConv * 2.0;
            maxScore += 2.0;

            score += (p.superTrendDir === 1 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            const ema9 = p.ema9 || p.sma20 || close;
            const ema21 = p.ema21 || p.sma50 || close;
            score += (ema9 > ema21 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            score += ((p.macdHist || 0) > 0 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            const cmf = p.cmf || 0;
            score += (cmf > 0.04 ? 1 : (cmf < -0.04 ? -1 : 0)) * 1.5;
            maxScore += 1.5;

            if (p.bbUpper && p.bbLower) {
                if (close < p.bbLower) score += 1.0;
                else if (close > p.bbUpper) score -= 1.0;
                else score += (close > (p.bbUpper + p.bbLower) / 2 ? 0.3 : -0.3);
            }
            maxScore += 1.0;

            const rsi = p.rsi || 50;
            score += (rsi > 52 ? 1 : (rsi < 48 ? -1 : 0)) * 1.0;
            maxScore += 1.0;

            if (p.stochK && p.stochD) {
                score += (p.stochK > p.stochD ? 1 : -1) * 1.0;
            }
            maxScore += 1.0;

            if (p.vwap) {
                score += (close > p.vwap ? 1 : -1) * 1.0;
            } else {
                score += (close > (p.sma20 || close) ? 0.5 : -0.5);
            }
            maxScore += 1.0;

            const consensusPct = (score / maxScore) * 100;
            if (consensusPct >= 35 && (idx === 0 || position <= 0)) {
                buySignal = true;
                buyReason = `👑 Omni-Consensus Bullish (+${consensusPct.toFixed(0)}% Agreement)`;
            } else if (consensusPct <= -35 || (consensusPct < 0 && position > 0)) {
                sellSignal = true;
                sellReason = `👑 Omni-Consensus Bearish (${consensusPct.toFixed(0)}% Agreement)`;
            }
        } else if (strategy === 'ai_conviction') {
            const rawConv = (p.aiConviction !== undefined ? p.aiConviction : p.conviction);
            const convScore = (rawConv !== undefined && rawConv !== null && !isNaN(rawConv))
                ? Number(rawConv)
                : (50 + (p.superTrendDir === 1 ? 20 : -20) + ((p.macdHist || 0) > 0 ? 15 : -15));
            if (convScore >= 60 && (idx === 0 || position <= 0)) {
                buySignal = true;
                buyReason = `🤖 AI High Conviction (${convScore.toFixed(0)}% Score)`;
            } else if (convScore <= 40 || (convScore < 48 && position > 0)) {
                sellSignal = true;
                sellReason = `🤖 AI Conviction Weakened (${convScore.toFixed(0)}% Score)`;
            }
        } else if (strategy === 'supertrend') {
            if (p.superTrendDir === 1 && (idx === 0 || !prevP || prevP.superTrendDir !== 1 || position <= 0)) {
                buySignal = true;
                buyReason = 'SuperTrend Uptrend Regime (Green)';
            } else if (p.superTrendDir === -1) {
                sellSignal = true;
                sellReason = 'SuperTrend Downtrend Regime (Red)';
            }
        } else if (strategy === 'ema_cross') {
            const ema9 = p.ema9 || p.sma20 || close;
            const ema21 = p.ema21 || p.sma50 || close;
            const prevEma9 = prevP ? (prevP.ema9 || prevP.sma20 || prevClose) : ema9;
            const prevEma21 = prevP ? (prevP.ema21 || prevP.sma50 || prevClose) : ema21;
            if (ema9 > ema21 && (idx === 0 || prevEma9 <= prevEma21 || position <= 0)) {
                buySignal = true;
                buyReason = 'EMA 9 / 21 Golden Cross';
            } else if (ema9 < ema21 && (idx === 0 || prevEma9 >= prevEma21 || position > 0)) {
                sellSignal = true;
                sellReason = 'EMA 9 / 21 Death Cross';
            }
        } else if (strategy === 'bollinger') {
            if (p.bbLower && close <= p.bbLower * 1.01 && (idx === 0 || prevClose > (prevP?.bbLower || 0) * 1.01 || position <= 0)) {
                buySignal = true;
                buyReason = 'Bollinger Lower Band Oversold Bounce';
            } else if (p.bbUpper && close >= p.bbUpper * 0.99) {
                sellSignal = true;
                sellReason = 'Bollinger Upper Band Overbought Exhaustion';
            }
        } else if (strategy === 'momentum') {
            const isBullish = (p.macdHist || 0) > 0 && (p.rsi || 50) > 50;
            const prevBullish = prevP ? ((prevP.macdHist || 0) > 0 && (prevP.rsi || 50) > 50) : false;
            if (isBullish && (idx === 0 || !prevBullish || position <= 0)) {
                buySignal = true;
                buyReason = `MACD Expansion + Bullish RSI (${(p.rsi || 50).toFixed(1)})`;
            } else if ((p.macdHist || 0) < 0 || (p.rsi || 50) < 45) {
                sellSignal = true;
                sellReason = 'MACD Contraction & Weakening Momentum';
            }
        } else if (strategy === 'stochastic') {
            const k = p.stochK || 50;
            const d = p.stochD || 50;
            const prevK = prevP ? (prevP.stochK || 50) : k;
            const prevD = prevP ? (prevP.stochD || 50) : d;
            if (k > d && k < 80 && (idx === 0 || prevK <= prevD || position <= 0)) {
                buySignal = true;
                buyReason = 'Stochastic %K > %D Bullish Rebound';
            } else if (k < d && (idx === 0 || prevK >= prevD || position > 0)) {
                sellSignal = true;
                sellReason = 'Stochastic %K < %D Bearish Cross';
            }
        } else if (strategy === 'cmf_breakout') {
            const isBreakout = (p.cmf || 0) > 0.05 && close > (p.sma20 || close);
            const prevBreakout = prevP ? ((prevP.cmf || 0) > 0.05 && prevClose > (prevP.sma20 || prevClose)) : false;
            if (isBreakout && (idx === 0 || !prevBreakout || position <= 0)) {
                buySignal = true;
                buyReason = `CMF Accumulation (+${(p.cmf || 0).toFixed(2)}) above SMA20`;
            } else if ((p.cmf || 0) < -0.05 || (position > 0 && close < (p.sma20 || close) * 0.98)) {
                sellSignal = true;
                sellReason = `CMF Institutional Distribution (${(p.cmf || 0).toFixed(2)})`;
            }
        }

        // 3. ORDER EXECUTION & POSITION STATE MACHINE
        if (mode === 'long_only') {
            if (position === 0 && buySignal && !exitedThisBar) {
                const execPrice = close * (1 + slippageRate);
                const shares = capital / execPrice;
                position = shares;
                entryPrice = execPrice;
                entryDate = date;
                trades.push({
                    id: trades.length + 1,
                    action: 'BUY',
                    side: 'LONG',
                    date: date,
                    timestamp: ts,
                    price: execPrice,
                    shares: shares,
                    capital: capital,
                    reason: buyReason
                });
            } else if (position > 0 && sellSignal) {
                const exitPrice = close * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'SELL',
                    side: 'LONG_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: position,
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: sellReason
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
            }
        } else {
            // Long & Short Mode
            if (position === 0 && !exitedThisBar) {
                if (buySignal) {
                    const execPrice = close * (1 + slippageRate);
                    const shares = capital / execPrice;
                    position = shares;
                    entryPrice = execPrice;
                    entryDate = date;
                    trades.push({
                        id: trades.length + 1,
                        action: 'BUY (LONG)',
                        side: 'LONG',
                        date: date,
                        timestamp: ts,
                        price: execPrice,
                        shares: shares,
                        capital: capital,
                        reason: buyReason
                    });
                } else if (sellSignal) {
                    const execPrice = close * (1 - slippageRate);
                    const shares = capital / execPrice;
                    position = -shares;
                    entryPrice = execPrice;
                    entryDate = date;
                    trades.push({
                        id: trades.length + 1,
                        action: 'SELL (SHORT)',
                        side: 'SHORT',
                        date: date,
                        timestamp: ts,
                        price: execPrice,
                        shares: shares,
                        capital: capital,
                        reason: sellReason
                    });
                }
            } else if (position > 0 && sellSignal) {
                const exitPrice = close * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                trades.push({
                    id: trades.length + 1,
                    action: 'SELL (CLOSE LONG)',
                    side: 'LONG_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: position,
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: sellReason
                });
                closedTrades.push(trades[trades.length - 1]);

                // Flip to Short
                const shortShares = capital / exitPrice;
                position = -shortShares;
                entryPrice = exitPrice;
                entryDate = date;
                trades.push({
                    id: trades.length + 1,
                    action: 'SELL (OPEN SHORT)',
                    side: 'SHORT',
                    date: date,
                    timestamp: ts,
                    price: exitPrice,
                    shares: shortShares,
                    capital: capital,
                    reason: `Flip to Short: ${sellReason}`
                });
            } else if (position < 0 && buySignal) {
                const exitPrice = close * (1 + slippageRate);
                const pnl = (entryPrice - exitPrice) * Math.abs(position);
                const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100;
                capital = capital + pnl;

                trades.push({
                    id: trades.length + 1,
                    action: 'COVER (CLOSE SHORT)',
                    side: 'SHORT_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: Math.abs(position),
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: buyReason
                });
                closedTrades.push(trades[trades.length - 1]);

                // Flip to Long
                const longShares = capital / exitPrice;
                position = longShares;
                entryPrice = exitPrice;
                entryDate = date;
                trades.push({
                    id: trades.length + 1,
                    action: 'BUY (OPEN LONG)',
                    side: 'LONG',
                    date: date,
                    timestamp: ts,
                    price: exitPrice,
                    shares: longShares,
                    capital: capital,
                    reason: `Flip to Long: ${buyReason}`
                });
            }
        }

        // 4. MARK-TO-MARKET VALUATION & DRAWDOWN
        let currentEquity = capital;
        if (position > 0) {
            currentEquity = position * close;
        } else if (position < 0) {
            currentEquity = capital + (entryPrice - close) * Math.abs(position);
        }

        const buyHoldEquity = initialCapital * (close / initialPrice);

        if (currentEquity > peakEquity) peakEquity = currentEquity;
        const dd = Math.max(0, ((peakEquity - currentEquity) / peakEquity) * 100);
        if (dd > maxDrawdown) maxDrawdown = dd;

        equityCurve.push({
            date: date,
            timestamp: ts,
            strategyEquity: currentEquity,
            buyHoldEquity: buyHoldEquity,
            drawdownPct: dd,
            inMarket: position !== 0
        });
    }

    const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].strategyEquity : capital;
    const finalBuyHold = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].buyHoldEquity : capital;
    const stratReturn = ((finalEquity - initialCapital) / initialCapital) * 100;
    const bhReturn = ((finalBuyHold - initialCapital) / initialCapital) * 100;

    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) <= 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    const grossProfit = winningTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + (t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 1.0);

    // Sharpe & Sortino
    let dailyReturns = [];
    for (let i = 1; i < equityCurve.length; i++) {
        const prev = equityCurve[i - 1].strategyEquity || 1;
        const curr = equityCurve[i].strategyEquity || 1;
        dailyReturns.push((curr - prev) / prev);
    }
    let meanReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
    let variance = dailyReturns.length > 1 ? dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (dailyReturns.length - 1) : 0;
    let stdDev = Math.sqrt(variance);

    let downsideVariance = dailyReturns.length > 1 ? dailyReturns.reduce((a, b) => a + Math.pow(Math.min(0, b), 2), 0) / (dailyReturns.length - 1) : 0;
    let downsideStdDev = Math.sqrt(downsideVariance);

    const annualFactor = Math.sqrt(252);
    const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * annualFactor : 0;
    const sortinoRatio = downsideStdDev > 0 ? (meanReturn / downsideStdDev) * annualFactor : (sharpeRatio > 0 ? 99 : 0);

    return {
        strategy: strategy,
        totalBars: timeseries.length,
        initialCapital: initialCapital,
        finalEquity: finalEquity,
        strategyReturnPct: stratReturn,
        buyHoldReturnPct: bhReturn,
        alpha: stratReturn - bhReturn,
        maxDrawdownPct: maxDrawdown,
        sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
        sortinoRatio: isNaN(sortinoRatio) ? 0 : sortinoRatio,
        totalTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRatePct: winRate,
        profitFactor: profitFactor
    };
}
