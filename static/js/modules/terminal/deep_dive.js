
function setPreset(tickerString) {
    if (!tickerString) return;

    // Sanitize preset tickers
    const rawTickers = tickerString.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    const newTickers = rawTickers.map(t => normalizeTicker(t));
    const cleanTickerString = newTickers.join(', ');

    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput) tickerInput.value = cleanTickerString;

    // Highlight active preset chip in UI
    document.querySelectorAll('.preset-chip').forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', onClickAttr.includes(tickerString) || onClickAttr.includes(cleanTickerString));
    });

    if (newTickers.length > 0) {
        state.activeTicker = newTickers[0];
        // Render immediate skeleton/cached tabs so active stock selector updates at 0ms
        renderStockSelector(newTickers);
    }

    handleAnalyze(true);
}

function showChartLoading(period) {
    const overlay = document.getElementById('chartLoadingOverlay');
    const titleEl = document.getElementById('chartLoadingTimeframe');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        if (titleEl) {
            const periodLabels = {
                '1mo': '1-Month (1M)',
                '3mo': '3-Month (3M)',
                '6mo': '6-Month (6M)',
                '1y': '1-Year (1Y)',
                '2y': '2-Year (2Y)',
                '5y': '5-Year (5Y)',
                'max': 'All-Time History (MAX)'
            };
            titleEl.textContent = `Loading ${periodLabels[period] || (period ? period.toUpperCase() : 'Chart')} Data...`;
        }
    }
}

function hideChartLoading() {
    const overlay = document.getElementById('chartLoadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay && overlay.style.opacity === '0') {
                overlay.style.display = 'none';
            }
        }, 200);
    }
}

function setTimeframe(period) {
    state.currentPeriod = period;
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });

    state._renderedChartsTicker = null;
    showChartLoading(period);

    handleAnalyze(true);
}

function setChartType(type) {
    state.chartType = type;
    document.getElementById('typeCandleBtn')?.classList.toggle('active', type === 'candlestick');
    document.getElementById('typeLineBtn')?.classList.toggle('active', type === 'area');
    const stock = state.stocksData[state.activeTicker] || state.watchlistData?.[state.activeTicker];
    if (stock && stock.timeseries && stock.timeseries.length > 0) {
        renderPrimaryChart(stock.timeseries);
    }
}

function toggleOverlay(indicatorKey) {
    state.overlays[indicatorKey] = !state.overlays[indicatorKey];

    const btnMap = {
        superTrend: 'toggleSuperTrend',
        sma20: 'toggleSMA20',
        sma50: 'toggleSMA50',
        vwap: 'toggleVWAP',
        bb: 'toggleBB',
        kc: 'toggleKC'
    };

    const btn = document.getElementById(btnMap[indicatorKey]);
    if (btn) {
        btn.classList.toggle('active', state.overlays[indicatorKey]);
    }

    const stock = state.stocksData[state.activeTicker] || state.watchlistData?.[state.activeTicker];
    if (stock && stock.timeseries && stock.timeseries.length > 0) {
        renderPrimaryChart(stock.timeseries);
    }
}

function setBacktestStrategy(strategyKey) {
    state.backtestStrategy = strategyKey;
    document.getElementById('stratQuantBtn')?.classList.toggle('active', strategyKey === 'quant');
    document.getElementById('stratSuperBtn')?.classList.toggle('active', strategyKey === 'supertrend');
    document.getElementById('stratMomBtn')?.classList.toggle('active', strategyKey === 'momentum');

    renderBacktest();
}

async function switchActiveStock(ticker) {
    if (!ticker) return;
    ticker = ticker.trim().toUpperCase();
    if (state.activeTicker !== ticker) {
        state._renderedChartsTicker = null;
    }
    state.activeTicker = ticker;

    document.querySelectorAll('.ticker-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.ticker === ticker);
    });

    const stock = state.stocksData[ticker] || state.watchlistData?.[ticker];
    if (stock && stock.profile && !stock.error) {
        if (!state.stocksData[ticker]) {
            state.stocksData[ticker] = { ...stock };
        }
        renderActiveStock();
        // If timeseries data not loaded yet, fetch analysis immediately
        if (!stock.timeseries || stock.timeseries.length === 0) {
            handleAnalyze(true);
        }
    } else {
        handleAnalyze(true);
    }
}

function hasValidCandleTimeseries(stock) {
    if (!stock || !stock.timeseries || !Array.isArray(stock.timeseries) || stock.timeseries.length < 5) {
        return false;
    }
    const first = stock.timeseries[0];
    const last = stock.timeseries[stock.timeseries.length - 1];
    return typeof first?.close === 'number' && typeof first?.open === 'number' && typeof last?.close === 'number';
}

function switchMainTab(tabKey) {
    state.activeMainTab = tabKey;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    updateMobileTabState(tabKey);

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `tabPane-${tabKey}`);
    });

    const stock = state.stocksData[state.activeTicker];

    // Re-render subtab content strictly client-side without re-triggering network analysis
    if (tabKey === 'charts') {
        const hasCandles = hasValidCandleTimeseries(stock);
        if (hasCandles) {
            // Only re-render if charts haven't been rendered yet for this ticker
            if (!(state.charts.primary && state._renderedChartsTicker === state.activeTicker)) {
                try {
                    renderPrimaryChart(stock.timeseries);
                    renderConvictionChart(stock.timeseries);
                    renderStochChart(stock.timeseries);
                    renderRSIChart(stock.timeseries);
                    renderMACDChart(stock.timeseries);
                    renderCMFChart(stock.timeseries);
                    state._renderedChartsTicker = state.activeTicker;
                } catch (e) {
                    console.warn('Charts render warning:', e);
                }
            }
            if (!_isAnalyzing) {
                hideChartLoading();
            }
        } else {
            // Full candle timeseries is still calculating in background; show spinner overlay
            showChartLoading(state.currentPeriod);
            if (!_isAnalyzing) {
                handleAnalyze();
            }
        }
    } else if (tabKey === 'ai') {
        renderAIIntelligence(stock ? stock.aiAnalysis : null);
        if (stock) {
            renderNewsIntelligence(stock);
        }
    } else if (tabKey === 'fundamentals') {
        if (stock && stock.signals) {
            renderTechnicalSignals(stock.signals);
        }
    }

    // Trigger resize for ApexCharts strictly after charts tab is shown and charts exist
    if (tabKey === 'charts' && state.charts.primary) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }

    lucide.createIcons();
}

function toggleMobileSubtabMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdown = document.getElementById('mobileCustomTabDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
        lucide.createIcons();
    }
}

function selectMobileSubtab(tabKey) {
    const dropdown = document.getElementById('mobileCustomTabDropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
    switchMainTab(tabKey);
}

function updateMobileTabState(tabKey) {
    const tab = tabKey || state.activeMainTab || 'ai';

    const labelMap = {
        'ai': 'AI Intelligence',
        'charts': 'Charts',
        'backtest': 'Backtesting',
        'fundamentals': 'Fundamentals'
    };

    const iconMap = {
        'ai': 'sparkles',
        'charts': 'line-chart',
        'backtest': 'play-circle',
        'fundamentals': 'layers'
    };

    const mobileLabel = document.getElementById('mobileActiveTabLabel');
    if (mobileLabel) {
        mobileLabel.textContent = labelMap[tab] || 'AI Intelligence';
    }

    const mobileIcon = document.getElementById('mobileActiveTabIcon');
    if (mobileIcon) {
        mobileIcon.setAttribute('data-lucide', iconMap[tab] || 'sparkles');
    }

    document.querySelectorAll('.custom-tab-dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}



let _isAnalyzing = false;
let _analyzeRequestId = 0;
let _analyzeAbortController = null;

async function handleAnalyze(forceRefresh = false) {
    if (_isAnalyzing && !forceRefresh) {
        return;
    }

    // Cancel any previous in-flight analysis request
    if (_analyzeAbortController) {
        try {
            _analyzeAbortController.abort();
        } catch (e) { }
        _analyzeAbortController = null;
    }
    _analyzeAbortController = new AbortController();
    const abortSignal = _analyzeAbortController.signal;

    const myRequestId = ++_analyzeRequestId;
    _isAnalyzing = true;

    // Immediately dismiss suggestions dropdown and cancel pending search
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';
    deepDiveSelectedIndex = -1;
    if (deepDiveSearchDebounceTimer) {
        clearTimeout(deepDiveSearchDebounceTimer);
        deepDiveSearchDebounceTimer = null;
    }
    if (deepDiveActiveAbortController) {
        deepDiveActiveAbortController.abort();
        deepDiveActiveAbortController = null;
    }

    const inputVal = document.getElementById('tickerInput')?.value.trim();
    if (!inputVal) {
        _isAnalyzing = false;
        return;
    }

    const errorAlert = document.getElementById('errorAlert');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const dashboardContent = document.getElementById('dashboardContent');

    if (errorAlert) errorAlert.style.display = 'none';

    let tickers = inputVal.split(',').map(t => t.trim()).filter(Boolean);
    if (tickers.length === 0) {
        _isAnalyzing = false;
        return;
    }

    try {
        // Fast sanitize tickers
        let cleanedTickers = tickers.map(t => normalizeTicker(t.toUpperCase()));

        // Check if any entered token is a company name (needs server resolution)
        const needsResolution = tickers.some(t => t.includes(' ') || (t.length > 6 && !t.includes('.') && !t.includes('-')));
        if (needsResolution) {
            try {
                const resolveResp = await fetch('/api/stocks/resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ queries: tickers }),
                    signal: abortSignal
                });
                if (resolveResp.ok) {
                    const resolveData = await resolveResp.json();
                    if (myRequestId !== _analyzeRequestId) return;
                    if (resolveData.success && resolveData.tickers && resolveData.tickers.length > 0) {
                        cleanedTickers = resolveData.tickers.map(t => normalizeTicker(t));
                        const input = document.getElementById('tickerInput');
                        if (input) input.value = resolveData.tickerString;
                    }
                }
            } catch (e) {
                if (e.name === 'AbortError') return;
                cleanedTickers = tickers.map(t => normalizeTicker(t.toUpperCase()));
            }
        }

        if (myRequestId !== _analyzeRequestId) return;

        tickers = [...new Set(cleanedTickers.map(t => normalizeTicker(t)))];
        const normalizedInput = tickers.join(', ');
        const input = document.getElementById('tickerInput');
        if (input && input.value !== normalizedInput && inputVal.split(',').some(t => normalizeTicker(t.trim().toUpperCase()) !== t.trim().toUpperCase())) {
            input.value = normalizedInput;
        }

        // Ensure activeTicker is valid and points to one of the current tickers
        if (!state.activeTicker || !tickers.includes(state.activeTicker)) {
            state.activeTicker = tickers[0];
        }

        // Stage 0: Instant Rendering from existing state/watchlist data
        renderStockSelector(tickers);

        tickers.forEach(t => {
            if (!state.stocksData[t] && state.watchlistData && state.watchlistData[t]) {
                state.stocksData[t] = { ...state.watchlistData[t] };
            }
        });

        if (state.stocksData[state.activeTicker]) {
            renderActiveStock();
        } else {
            if (loadingOverlay) loadingOverlay.style.display = 'block';
            if (dashboardContent) dashboardContent.style.opacity = '0.4';
        }

        // =========================================================
        // STAGE 1: Fast-Path Hydration (Quotes, Price Banner, Delta in <100ms)
        // =========================================================
        const fastResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: tickers,
                period: '1mo',
                interval: '1d',
                phase: 'fast'
            }),
            signal: abortSignal
        });

        if (myRequestId !== _analyzeRequestId) return;

        if (fastResponse.ok) {
            const fastData = await fastResponse.json();
            if (myRequestId !== _analyzeRequestId) return;

            if (fastData && fastData.stocks) {
                Object.keys(fastData.stocks).forEach(tk => {
                    const existing = state.stocksData[tk] || {};
                    const fastStock = fastData.stocks[tk] || {};
                    state.stocksData[tk] = {
                        ...existing,
                        ...fastStock,
                        sparkline: fastStock.sparkline || existing.sparkline || [],
                        timeseries: (existing.timeseries && existing.timeseries.length > 0 && typeof existing.timeseries[0]?.open === 'number') ? existing.timeseries : [],
                        aiAnalysis: existing.aiAnalysis || null
                    };
                });

                if (!tickers.includes(state.activeTicker)) {
                    state.activeTicker = tickers[0];
                }

                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (dashboardContent) dashboardContent.style.opacity = '1';

                renderStockSelector(tickers);
                renderActiveStock();
            }
        }

        // =========================================================
        // STAGE 2: Full Deep Hydration (Candlesticks, Backtests, Oscillators, AI Copilot)
        // =========================================================
        const fullResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: tickers,
                period: state.currentPeriod,
                interval: '1d',
                forceRefresh: forceRefresh,
                phase: 'full',
                apiKey: state.aiSettings.apiKey,
                model: state.aiSettings.model
            }),
            signal: abortSignal
        });

        if (myRequestId !== _analyzeRequestId) return;

        const fullData = await fullResponse.json();
        if (myRequestId !== _analyzeRequestId) return;

        if (fullResponse.ok && fullData && fullData.stocks) {
            Object.keys(fullData.stocks).forEach(tk => {
                const stockObj = fullData.stocks[tk];
                if (stockObj && stockObj.fullTimeseries && stockObj.timeseries) {
                    delete stockObj.fullTimeseries;
                }
                state.stocksData[tk] = stockObj;
            });
            trimClientStockCache();

            if (!tickers.includes(state.activeTicker)) {
                state.activeTicker = tickers[0] || 'AAPL';
            }

            // Invalidate chart ticker cache so full candle dataset renders immediately
            state._renderedChartsTicker = null;

            renderStockSelector(tickers);
            renderActiveStock();
            evaluateAlertRules(state.stocksData);
        } else if (!fastResponse.ok && fullData?.error) {
            throw new Error(fullData.error || 'Failed to analyze requested stocks.');
        }

    } catch (err) {
        if (err.name === 'AbortError') return;
        if (myRequestId !== _analyzeRequestId) return;
        console.error('Analyze error:', err);
        if (errorAlert) {
            errorAlert.textContent = err.message || 'An error occurred while analyzing stocks.';
            errorAlert.style.display = 'block';
        }
    } finally {
        if (myRequestId === _analyzeRequestId) {
            _isAnalyzing = false;
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            if (dashboardContent) dashboardContent.style.opacity = '1';
            hideChartLoading();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

function renderStockSelector(tickers) {
    const container = document.getElementById('tickerTabsList');
    if (!container) return;
    container.innerHTML = '';

    if (!tickers || tickers.length === 0) return;

    // Clean and deduplicate tickers
    const cleanTickers = [...new Set(tickers.map(t => String(t || '').trim().toUpperCase()).filter(Boolean))];
    if (cleanTickers.length === 0) return;

    // Ensure state.activeTicker is valid and in list
    if (!state.activeTicker || !cleanTickers.includes(state.activeTicker)) {
        state.activeTicker = cleanTickers[0];
    }

    cleanTickers.forEach(ticker => {
        const stock = state.stocksData[ticker] || state.watchlistData?.[ticker];
        const tab = document.createElement('div');
        tab.className = `ticker-tab ${ticker === state.activeTicker ? 'active' : ''}`;
        tab.dataset.ticker = ticker;

        if (stock && stock.profile && !stock.error) {
            const profile = stock.profile || {};
            const changePercent = typeof profile.changePercent === 'number' ? profile.changePercent : 0;
            const isBullish = changePercent >= 0;
            const compName = getAssetCompanyName(ticker, stock);
            const instCurr = profile.currency || 'USD';
            const baseCurr = getUserBaseCurrency();
            const displayPrice = typeof profile.currentPrice === 'number' ? formatPrice(profile.currentPrice, instCurr, baseCurr) : '--';

            tab.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
                    <span class="ticker-tab-symbol">${ticker}</span>
                    <span class="ticker-tab-name" title="${compName}">${compName}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
                    <span class="ticker-tab-price mono">${displayPrice}</span>
                    <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'}">
                        ${isBullish ? '+' : ''}${changePercent.toFixed(2)}%
                    </span>
                </div>
            `;
        } else {
            // Skeleton / placeholder tab while data is hydrating
            const compName = getAssetCompanyName(ticker, null) || ticker;
            tab.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
                    <span class="ticker-tab-symbol">${ticker}</span>
                    <span class="ticker-tab-name" title="${compName}">${compName}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
                    <span class="ticker-tab-price mono" style="opacity: 0.6;">Loading...</span>
                    <span class="badge-pill badge-neutral" style="opacity: 0.7;">--%</span>
                </div>
            `;
        }

        tab.onclick = () => switchActiveStock(ticker);
        container.appendChild(tab);
    });
}

function renderActiveStock() {
    const stock = state.stocksData[state.activeTicker];
    const errorAlert = document.getElementById('errorAlert');

    if (!stock) {
        // Active ticker data not loaded yet; safely return without flashing error banner
        return;
    }

    if (stock.error) {
        if (errorAlert) {
            errorAlert.textContent = stock.error || `No data found for ${state.activeTicker}`;
            errorAlert.style.display = 'block';
        }
        return;
    }

    if (errorAlert) {
        errorAlert.style.display = 'none';
    }

    const profile = stock.profile || {};
    const signals = stock.signals || {};
    const timeseries = stock.timeseries || [];
    const aiAnalysis = stock.aiAnalysis || {};

    const instCurr = profile.currency || 'USD';
    const baseCurr = getUserBaseCurrency();
    const isDiffCurr = instCurr.toUpperCase() !== baseCurr.toUpperCase();

    // 1. Update Header Quote & Tab Section Titles with Company Name
    const compName = getAssetCompanyName(state.activeTicker, stock);
    const subTitleText = (compName && compName.toUpperCase() !== state.activeTicker.toUpperCase())
        ? `${state.activeTicker} (${compName})`
        : state.activeTicker;

    setText('quoteSymbol', state.activeTicker);
    setText('quoteName', compName);
    setText('quoteSector', profile.sector || 'Equities');
    setText('mainChartTitle', `${state.activeTicker} - Price Action & Quantitative Overlays (${instCurr})`);
    setText('mainChartSubtitle', compName);
    setText('fundamentalsSubtitle', subTitleText);
    setText('valuationSubtitle', subTitleText);
    setText('backtestSubtitle', subTitleText);
    setText('aiHeaderSubtitle', subTitleText);
    setText('aiNewsSidebarSubtitle', subTitleText);

    const price = typeof profile.currentPrice === 'number' ? formatPrice(profile.currentPrice, instCurr, baseCurr) : '--';
    setText('quotePrice', price);

    const nativePriceEl = document.getElementById('quoteNativePrice');
    if (nativePriceEl) {
        if (isDiffCurr && typeof profile.currentPrice === 'number') {
            nativePriceEl.style.display = 'block';
            nativePriceEl.textContent = `Native: ${formatPrice(profile.currentPrice, instCurr, instCurr)} (${instCurr})`;
        } else {
            nativePriceEl.style.display = 'none';
        }
    }

    const change = typeof profile.change === 'number' ? profile.change : 0;
    const changePercent = typeof profile.changePercent === 'number' ? profile.changePercent : 0;
    const isUp = change >= 0;

    const changeBadge = document.getElementById('quoteChangeBadge');
    if (changeBadge) {
        changeBadge.className = `change-badge ${isUp ? 'badge-bullish' : 'badge-bearish'} mono`;
        changeBadge.innerHTML = `
            <i data-lucide="${isUp ? 'trending-up' : 'trending-down'}" style="width: 16px;"></i>
            ${isUp ? '+' : ''}${change.toFixed(2)} (${isUp ? '+' : ''}${changePercent.toFixed(2)}%)
        `;
    }

    const dayLow = typeof profile.dayLow === 'number' ? formatPrice(profile.dayLow, instCurr, baseCurr) : '--';
    const dayHigh = typeof profile.dayHigh === 'number' ? formatPrice(profile.dayHigh, instCurr, baseCurr) : '--';
    setText('quoteDayRange', `${dayLow} - ${dayHigh}`);
    setText('quotePrevClose', typeof profile.previousClose === 'number' ? formatPrice(profile.previousClose, instCurr, baseCurr) : '--');
    setText('quoteVolume', formatCompactNumber(profile.volume));
    setText('quoteVWAP', typeof profile.vwap === 'number' ? formatPrice(profile.vwap, instCurr, baseCurr) : '--');
    setText('quoteATR', typeof profile.atr === 'number' ? `±${formatPrice(profile.atr, instCurr, baseCurr)}` : '--');

    // 2. Update Stats Grid
    setText('stockCurrencyBadge', `${baseCurr}${isDiffCurr ? ` (Native: ${instCurr})` : ''}`);
    setText('statMarketCap', typeof profile.marketCap === 'number' ? formatCompactPrice(profile.marketCap, instCurr, baseCurr) : 'N/A');
    setText('statPE', profile.peRatio ? `${profile.peRatio}x` : 'N/A');
    setText('statForwardPE', profile.forwardPE ? `${profile.forwardPE}x` : 'N/A');
    setText('statATR', typeof profile.atr === 'number' ? formatPrice(profile.atr, instCurr, baseCurr) : 'N/A');
    setText('statCMF', typeof profile.cmf === 'number' ? `${profile.cmf > 0 ? '+' : ''}${profile.cmf.toFixed(3)}` : 'N/A');
    setText('statBeta', profile.beta ? `${profile.beta}` : 'N/A');
    setText('statDivYield', profile.dividendYield !== null && profile.dividendYield !== undefined ? `${profile.dividendYield}%` : '0.00%');
    setText('statAvgVolume', formatCompactNumber(profile.avgVolume));

    // 52-Week Range Bar
    const low52 = profile.fiftyTwoWeekLow;
    const high52 = profile.fiftyTwoWeekHigh;
    const curPrice = profile.currentPrice;
    const stat52Progress = document.getElementById('stat52Progress');

    if (typeof low52 === 'number' && typeof high52 === 'number' && typeof curPrice === 'number' && high52 > low52) {
        const pct = Math.min(100, Math.max(0, ((curPrice - low52) / (high52 - low52)) * 100));
        if (stat52Progress) stat52Progress.style.width = `${pct}%`;
        setText('stat52Position', `Position: ${pct.toFixed(0)}%`);
        setText('stat52Low', `Low: ${formatPrice(low52, instCurr, baseCurr)}`);
        setText('stat52High', `High: ${formatPrice(high52, instCurr, baseCurr)}`);
    } else {
        if (stat52Progress) stat52Progress.style.width = '0%';
        setText('stat52Position', 'Position: N/A');
        setText('stat52Low', 'Low: N/A');
        setText('stat52High', 'High: N/A');
    }

    // 3. Update Technical Signals & Rating
    renderTechnicalSignals(signals);

    // 4. Update AI Financial Intelligence Panel & News Intelligence
    renderAIIntelligence(aiAnalysis);
    renderNewsIntelligence(stock);

    // 5. Activate and render only the currently active subtab
    switchMainTab(state.activeMainTab || 'ai');
    lucide.createIcons();
}

function renderNewsIntelligence(stock) {
    if (!stock) return;
    const news = stock.news || [];
    const ai = stock.aiAnalysis || {};
    const synth = ai.newsSynthesis || {};

    // 1. Update News Count & Sentiment Badge
    const sentimentBadge = document.getElementById('aiNewsSentimentBadge');
    if (sentimentBadge) {
        const sentiment = synth.sentiment || 'Neutral';
        const score = synth.sentimentScore || 50;
        const color = synth.sentimentColor || 'neutral';
        sentimentBadge.textContent = synth.sentimentBadge || `${sentiment} (${score}%)`;
        sentimentBadge.className = `badge-pill ${color === 'bullish' ? 'badge-bullish' : (color === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }

    // Update Conviction Delta Badge
    const deltaBadge = document.getElementById('aiNewsDeltaBadge');
    if (deltaBadge) {
        const delta = synth.convictionDelta || 0.0;
        if (delta > 0) {
            deltaBadge.textContent = `+${delta.toFixed(1)}% Conviction Boost`;
            deltaBadge.className = 'badge-pill badge-bullish';
            deltaBadge.style.display = 'inline-block';
        } else if (delta < 0) {
            deltaBadge.textContent = `${delta.toFixed(1)}% Conviction Drag`;
            deltaBadge.className = 'badge-pill badge-bearish';
            deltaBadge.style.display = 'inline-block';
        } else {
            deltaBadge.textContent = `+0.0% Neutral Flow`;
            deltaBadge.className = 'badge-pill badge-neutral';
            deltaBadge.style.display = 'inline-block';
        }
    }

    const countEl = document.getElementById('aiNewsCount');
    if (countEl) {
        countEl.textContent = `${news.length}`;
    }

    // 2. Render AI News Summary & Catalyst Takeaway Bullets
    const summaryEl = document.getElementById('aiNewsSummaryText');
    if (summaryEl) {
        if (synth.summary) {
            summaryEl.innerHTML = formatMarkdownResponse(synth.summary);
        } else {
            summaryEl.innerHTML = `<em>Synthesizing global financial headlines and macroeconomic market impact...</em>`;
        }
    }

    const bulletsContainer = document.getElementById('aiNewsCatalystBulletsContainer');
    const bulletsList = document.getElementById('aiNewsCatalystBullets');
    if (bulletsContainer && bulletsList) {
        const bullets = synth.catalystBullets || [];
        if (bullets.length > 0) {
            bulletsContainer.style.display = 'block';
            bulletsList.innerHTML = bullets.map(item => {
                let flag = '🌐';
                let publisher = 'Market Wire';
                let headline = '';
                let url = '#';
                let timeAgo = '';

                if (typeof item === 'object' && item !== null) {
                    flag = item.flag || '🌐';
                    publisher = item.publisher || 'Financial Wire';
                    headline = item.headline || item.title || '';
                    url = item.url || '#';
                    timeAgo = item.timeAgo || '';
                } else if (typeof item === 'string') {
                    // Extract regex match if legacy format: **[🇺🇸 MarketWatch]** Headline
                    const match = item.match(/\*\*\[(.*?)\]\*\*\s*(.*)/);
                    if (match) {
                        const tag = match[1].trim();
                        const parts = tag.split(' ');
                        flag = parts[0] || '🌐';
                        publisher = parts.slice(1).join(' ') || 'News';
                        headline = match[2].trim();
                    } else {
                        headline = item;
                    }
                }

                return `
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="catalyst-takeaway-card">
                        <div class="catalyst-takeaway-header">
                            <span class="catalyst-tag">${getCountryFlagHtml(flag, publisher)} <span>${escapeHtml(publisher)}</span></span>
                            ${timeAgo ? `<span class="catalyst-time">${escapeHtml(timeAgo)}</span>` : ''}
                        </div>
                        <div class="catalyst-takeaway-title">${formatMarkdownResponse(headline)}</div>
                    </a>
                `;
            }).join('');
        } else {
            bulletsContainer.style.display = 'none';
        }
    }

    // Refresh modal list if modal is currently open
    const modal = document.getElementById('globalNewsModal');
    if (modal && modal.style.display === 'flex') {
        renderGlobalNewsModalList();
    }
}

// Global News Modal Functions
let currentModalNewsFilter = 'all';
let currentModalNewsQuery = '';
let currentModalCatalystItem = null;

function openGlobalNewsModal(customTicker = null, initialQuery = '', initialFilter = 'all', catalystItem = null) {
    const modal = document.getElementById('globalNewsModal');
    if (!modal) return;

    if (customTicker) {
        state.activeTicker = customTicker;
    }

    currentModalCatalystItem = catalystItem || null;

    const stock = state.stocksData[state.activeTicker] || state.watchlistData[state.activeTicker];
    const compName = getAssetCompanyName(state.activeTicker, stock);
    const badgeEl = document.getElementById('newsModalStockBadge');
    if (badgeEl) {
        badgeEl.textContent = `${state.activeTicker} (${compName})`;
    }

    const searchInput = document.getElementById('globalNewsSearchInput');
    if (searchInput) {
        searchInput.value = initialQuery || '';
    }
    currentModalNewsQuery = String(initialQuery || '').trim().toLowerCase();
    currentModalNewsFilter = initialFilter || 'all';

    ['newsFilterAllBtn', 'newsFilterCatalystsBtn', 'newsFilterTier1Btn'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
    if (initialFilter === 'catalysts') {
        document.getElementById('newsFilterCatalystsBtn')?.classList.add('active');
    } else if (initialFilter === 'tier1') {
        document.getElementById('newsFilterTier1Btn')?.classList.add('active');
    } else {
        document.getElementById('newsFilterAllBtn')?.classList.add('active');
    }

    renderGlobalNewsModalList();
    modal.style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeGlobalNewsModal() {
    const modal = document.getElementById('globalNewsModal');
    if (modal) modal.style.display = 'none';
}

function setNewsModalFilter(filterType) {
    currentModalNewsFilter = filterType;
    ['newsFilterAllBtn', 'newsFilterCatalystsBtn', 'newsFilterTier1Btn'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
    if (filterType === 'all') document.getElementById('newsFilterAllBtn')?.classList.add('active');
    if (filterType === 'catalysts') document.getElementById('newsFilterCatalystsBtn')?.classList.add('active');
    if (filterType === 'tier1') document.getElementById('newsFilterTier1Btn')?.classList.add('active');

    renderGlobalNewsModalList();
}

function filterGlobalNewsModal(query) {
    currentModalNewsQuery = String(query || '').trim().toLowerCase();
    renderGlobalNewsModalList();
}

function renderGlobalNewsModalList() {
    const container = document.getElementById('globalNewsModalList');
    const footerCount = document.getElementById('globalNewsModalFooterCount');
    if (!container) return;

    const stock = state.stocksData[state.activeTicker] || state.watchlistData[state.activeTicker];
    let news = stock?.news ? [...stock.news] : [];

    if (currentModalCatalystItem) {
        const headline = currentModalCatalystItem.headline || '';
        const exists = news.some(n => (n.title || '').toLowerCase() === headline.toLowerCase());
        if (!exists && headline) {
            news.unshift({
                title: currentModalCatalystItem.headline,
                publisher: currentModalCatalystItem.publisher || 'Financial Wire',
                time: currentModalCatalystItem.time || 'Active Session',
                summary: currentModalCatalystItem.summary || `Breaking market catalyst event detected with relative volume of ${currentModalCatalystItem.volRatio || 'elevated'}.`,
                url: currentModalCatalystItem.link || `https://finance.yahoo.com/quote/${state.activeTicker}/news`,
                country: 'US',
                flag: '🇺🇸'
            });
        }
    }

    let filtered = news.filter(item => {
        if (currentModalNewsQuery) {
            const title = (item.title || '').toLowerCase();
            const summary = (item.summary || '').toLowerCase();
            const pub = (item.publisher || '').toLowerCase();
            if (!title.includes(currentModalNewsQuery) && !summary.includes(currentModalNewsQuery) && !pub.includes(currentModalNewsQuery)) {
                return false;
            }
        }
        if (currentModalNewsFilter === 'catalysts') {
            const t = (item.title || '').toLowerCase();
            const isCat = t.includes('earnings') || t.includes('revenue') || t.includes('deal') || t.includes('ai') || t.includes('upgrade') || t.includes('sec') || t.includes('investigation') || t.includes('price target') || t.includes('surge') || t.includes('plunge');
            if (!isCat) return false;
        }
        if (currentModalNewsFilter === 'tier1') {
            const pub = (item.publisher || '').toLowerCase();
            const isTier1 = pub.includes('reuters') || pub.includes('bloomberg') || pub.includes('dow jones') || pub.includes('marketwatch') || pub.includes('handelsblatt') || pub.includes('nikkei') || pub.includes('ft') || pub.includes('financial times') || pub.includes('cnbc');
            if (!isTier1) return false;
        }
        return true;
    });

    if (footerCount) {
        footerCount.textContent = `Showing ${filtered.length} of ${news.length} wire articles`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 48px 20px;">
                <i data-lucide="newspaper" style="width: 32px; height: 32px; margin: 0 auto 10px auto; opacity: 0.4; display: block;"></i>
                No matching news articles found for current filter.
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(item => {
        const flag = item.flag || '🌐';
        const country = item.country || 'Global';
        const publisher = item.publisher || 'Financial Wire';
        const timeAgo = item.timeAgo || item.time || 'Recent';
        const title = escapeHtml(item.title || '');
        const summary = escapeHtml(item.summary || '');
        const url = escapeHtml(item.url || item.link || '#');

        return `
            <div class="news-modal-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="news-origin-badge" style="font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">${getCountryFlagHtml(flag || country, country)} <span>${escapeHtml(country)}</span></span>
                        <span class="news-publisher-tag" style="font-size: 0.72rem; font-weight: 700; color: var(--accent-cyan);">${publisher}</span>
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${timeAgo}</span>
                </div>
                <div style="font-size: 0.90rem; font-weight: 700; color: var(--text-primary); line-height: 1.4;">${title}</div>
                ${summary ? `<div class="news-modal-summary">${summary}</div>` : ''}
                <div style="display: flex; justify-content: flex-end; margin-top: 2px;">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.76rem; color: var(--accent-blue); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                        <span>Read Original Article</span>
                        <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAIIntelligence(ai) {
    if (!ai) {
        const thesisEl = document.getElementById('aiThesisText');
        if (thesisEl) {
            thesisEl.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Generating quantitative AI investment thesis &amp; market synthesis...</span>';
        }
        const scoreEl = document.getElementById('aiConvictionScore');
        if (scoreEl) scoreEl.textContent = '--%';
        const biasEl = document.getElementById('aiDirectionalBias');
        if (biasEl) {
            biasEl.textContent = 'Analyzing...';
            biasEl.className = 'badge-pill badge-neutral';
        }
        const barEl = document.getElementById('aiConvictionBar');
        if (barEl) barEl.style.width = '0%';
        const bdEl = document.getElementById('aiConvictionBreakdown');
        if (bdEl) bdEl.innerHTML = '';
        return;
    }

    const score = ai.convictionScore || 50;
    const bias = ai.directionalBias || 'Neutral';
    const stanceColor = ai.stanceColor || 'neutral';

    const scoreEl = document.getElementById('aiConvictionScore');
    if (scoreEl) {
        scoreEl.textContent = `${score}%`;
        scoreEl.style.color = stanceColor === 'bullish' ? 'var(--accent-green)' : (stanceColor === 'bearish' ? 'var(--accent-red)' : 'var(--accent-blue)');
    }

    const biasEl = document.getElementById('aiDirectionalBias');
    if (biasEl) {
        biasEl.textContent = bias;
        biasEl.className = `badge-pill ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }

    const barEl = document.getElementById('aiConvictionBar');
    if (barEl) {
        barEl.style.width = `${score}%`;
        barEl.style.background = stanceColor === 'bullish' ? 'linear-gradient(90deg, #3b82f6, #10b981)' : (stanceColor === 'bearish' ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #64748b, #3b82f6)');
    }

    const bdEl = document.getElementById('aiConvictionBreakdown');
    if (bdEl) {
        bdEl.innerHTML = '';
        const bd = ai.convictionBreakdown || {};
        const labels = {
            'trend': 'Trend',
            'momentum': 'Momentum',
            'flow': 'Money Flow',
            'price': 'Price Action',
            'news': 'Catalysts',
            'volatility': 'Volatility',
            'backtest': 'Backtest'
        };
        Object.keys(bd).forEach(k => {
            const val = bd[k];
            if (val !== 0) {
                const span = document.createElement('span');
                const isPos = val > 0;
                span.style.cssText = `display: inline-flex; align-items: center; gap: 2px; padding: 1px 6px; border-radius: 4px; font-size: 0.68rem; font-family: var(--font-mono); font-weight: 600; background: ${isPos ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; color: ${isPos ? '#34d399' : '#f87171'}; border: 1px solid ${isPos ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};`;
                span.textContent = `${labels[k] || k}: ${isPos ? '+' : ''}${val}`;
                bdEl.appendChild(span);
            }
        });
    }

    // 2. Executive Thesis Narrative (HTML Markdown Rendered)
    const thesisEl = document.getElementById('aiThesisText');
    if (thesisEl) {
        thesisEl.innerHTML = formatMarkdownResponse(ai.executiveThesis || 'AI thesis computed.');
    }

    // Catalysts
    const catList = document.getElementById('aiCatalystsList');
    if (catList) {
        catList.innerHTML = '';
        (ai.catalysts || []).forEach(cat => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'flex-start';
            li.style.gap = '8px';
            li.innerHTML = `<span style="color: var(--accent-green); flex-shrink: 0; margin-top: 1px;">✔</span> <span>${formatMarkdownResponse(cat)}</span>`;
            catList.appendChild(li);
        });
    }

    // Risks
    const riskList = document.getElementById('aiRisksList');
    if (riskList) {
        riskList.innerHTML = '';
        (ai.risks || []).forEach(r => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'flex-start';
            li.style.gap = '8px';
            li.innerHTML = `<span style="color: var(--accent-red); flex-shrink: 0; margin-top: 1px;">⚠</span> <span>${formatMarkdownResponse(r)}</span>`;
            riskList.appendChild(li);
        });
    }

    // Trade Levels Matrix
    const stock = state.stocksData[state.activeTicker];
    const instCurr = stock?.profile?.currency || 'USD';
    const baseCurr = getUserBaseCurrency();

    const levels = ai.tradeLevels || {};
    const entryDisplay = (levels.entryLow !== undefined && levels.entryHigh !== undefined)
        ? `${formatPrice(levels.entryLow, instCurr, baseCurr)} – ${formatPrice(levels.entryHigh, instCurr, baseCurr)}`
        : formatPriceOrRange(levels.entryZone, instCurr, baseCurr);

    const riskDisplay = (levels.riskPerShareNum !== undefined)
        ? formatPrice(levels.riskPerShareNum, instCurr, baseCurr)
        : formatPriceOrRange(levels.riskPerShare, instCurr, baseCurr);

    const rewardDisplay = (levels.rewardPerShareNum !== undefined)
        ? formatPrice(levels.rewardPerShareNum, instCurr, baseCurr)
        : formatPriceOrRange(levels.rewardPerShare, instCurr, baseCurr);

    setText('aiEntryZone', entryDisplay);
    setText('aiStopLoss', typeof levels.stopLoss === 'number' ? formatPrice(levels.stopLoss, instCurr, baseCurr) : formatPriceOrRange(levels.stopLoss, instCurr, baseCurr));
    setText('aiTarget1', typeof levels.target1 === 'number' ? formatPrice(levels.target1, instCurr, baseCurr) : formatPriceOrRange(levels.target1, instCurr, baseCurr));
    setText('aiTarget2', typeof levels.target2 === 'number' ? formatPrice(levels.target2, instCurr, baseCurr) : formatPriceOrRange(levels.target2, instCurr, baseCurr));
    setText('aiRiskReward', levels.riskRewardRatio || '2.5:1');
    setText('aiRiskAmt', riskDisplay);
    setText('aiRewardAmt', rewardDisplay);

    // Update AI Tab Badge
    const tabBadgeAI = document.getElementById('tabBadgeAI');
    const mobileBadgeAI = document.getElementById('mobileBadgeAI');
    if (tabBadgeAI) {
        tabBadgeAI.textContent = `${score}% ${bias}`;
        tabBadgeAI.className = `tab-mini-badge ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }
    if (mobileBadgeAI) {
        mobileBadgeAI.textContent = `${score}% ${bias}`;
        mobileBadgeAI.className = `tab-mini-badge ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }
    updateMobileTabState(state.activeMainTab);


    // Scenarios
    const sc = ai.scenario30d || {};
    if (sc.bullCase) {
        setText('scenarioBullProb', `${sc.bullCase.probability ?? '--'}% Prob`);
        setText('scenarioBullPrice', typeof sc.bullCase.target === 'number' ? formatPrice(sc.bullCase.target, instCurr, baseCurr) : '$--');
        setText('scenarioBullReturn', typeof sc.bullCase.returnPct === 'number' ? `+${sc.bullCase.returnPct}% Expected Upside` : '--');
    } else {
        setText('scenarioBullProb', '--% Prob');
        setText('scenarioBullPrice', '$--');
        setText('scenarioBullReturn', '-- Expected Upside');
    }
    if (sc.baseCase) {
        setText('scenarioBaseProb', `${sc.baseCase.probability ?? '--'}% Prob`);
        setText('scenarioBasePrice', typeof sc.baseCase.target === 'number' ? formatPrice(sc.baseCase.target, instCurr, baseCurr) : '$--');
        setText('scenarioBaseReturn', typeof sc.baseCase.returnPct === 'number' ? `${sc.baseCase.returnPct >= 0 ? '+' : ''}${sc.baseCase.returnPct}% Expected Drift` : '--');
    } else {
        setText('scenarioBaseProb', '--% Prob');
        setText('scenarioBasePrice', '$--');
        setText('scenarioBaseReturn', '-- Expected Drift');
    }
    if (sc.bearCase) {
        setText('scenarioBearProb', `${sc.bearCase.probability ?? '--'}% Prob`);
        setText('scenarioBearPrice', typeof sc.bearCase.target === 'number' ? formatPrice(sc.bearCase.target, instCurr, baseCurr) : '$--');
        setText('scenarioBearReturn', typeof sc.bearCase.returnPct === 'number' ? `${sc.bearCase.returnPct}% Downside Exposure` : '--');
    } else {
        setText('scenarioBearProb', '--% Prob');
        setText('scenarioBearPrice', '$--');
        setText('scenarioBearReturn', '-- Downside Exposure');
    }
}

async function handleCopilotSubmit() {
    const input = document.getElementById('copilotInput');
    const question = input?.value.trim();
    if (!question) return;

    if (input) input.value = '';
    await askCopilot(question);
}

function askCopilotPrompt(question) {
    askCopilot(question);
}

function clearCopilotChat() {
    const container = document.getElementById('copilotMessages');
    if (!container) return;
    container.innerHTML = `
        <div class="chat-bubble chat-bubble-ai">
            👋 Hello! I am your <strong>FinDashIQ AI Copilot</strong>. I analyze real-time technical indicators, momentum oscillators, institutional capital flow, and historical backtests. Ask me anything about the selected stock!
        </div>
    `;
}

function formatMarkdownResponse(text) {
    if (!text) return '';

    // Bold **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    formatted = formatted.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

    // Code blocks `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="mono" style="background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 4px; font-size: 0.85em;">$1</code>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

async function askCopilot(question) {
    const container = document.getElementById('copilotMessages');
    if (!container) return;

    // Append user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = question;
    container.appendChild(userBubble);

    // Append AI loading bubble
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble chat-bubble-ai';
    aiBubble.innerHTML = `<em>Analyzing quantitative metrics...</em>`;
    container.appendChild(aiBubble);
    container.scrollTop = container.scrollHeight;

    try {
        const stock = state.stocksData[state.activeTicker] || {};
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticker: state.activeTicker,
                question: question,
                stockData: stock,
                apiKey: state.aiSettings.apiKey,
                model: state.aiSettings.model
            })
        });

        const data = await response.json();
        const answerRaw = data.answer || 'I could not generate an answer.';
        if (answerRaw.includes('quota') || answerRaw.includes('429') || answerRaw.includes('Quota exceeded')) {
            if (state.aiSettings.apiKey && state.aiSettings.apiKey.length > 6) {
                updateAIBadges('quota_exceeded');
            }
        } else if (state.aiSettings.apiKey && state.aiSettings.apiKey.length > 6) {
            updateAIBadges('active');
        }
        aiBubble.innerHTML = formatMarkdownResponse(answerRaw);

    } catch (err) {
        aiBubble.innerHTML = `<span style="color: var(--accent-red);">Error querying AI: ${err.message}</span>`;
    }

    container.scrollTop = container.scrollHeight;
}

function renderTechnicalSignals(signals) {
    const overall = signals.overall || 'Neutral';
    const bullish = signals.bullishCount || 0;
    const bearish = signals.bearishCount || 0;
    const neutral = signals.neutralCount || 0;
    const total = Math.max(1, bullish + bearish + neutral);

    const overallBadge = document.getElementById('overallRatingBadge');
    const countBadge = document.getElementById('signalsCountBadge');

    let badgeClass = 'badge-neutral';
    let iconName = 'minus';
    if (overall.includes('Buy')) {
        badgeClass = 'badge-bullish';
        iconName = 'trending-up';
    } else if (overall.includes('Sell')) {
        badgeClass = 'badge-bearish';
        iconName = 'trending-down';
    }

    if (overallBadge) {
        overallBadge.className = `overall-rating-badge ${badgeClass}`;
        overallBadge.innerHTML = `<i data-lucide="${iconName}"></i> <span>${overall}</span>`;
    }

    if (countBadge) {
        countBadge.className = `badge-pill ${badgeClass}`;
        countBadge.textContent = `${bullish} Bullish / ${bearish} Bearish`;
    }

    // Update Fundamentals Tab Badge
    const tabBadgeSignals = document.getElementById('tabBadgeSignals');
    const mobileBadgeSignals = document.getElementById('mobileBadgeSignals');
    if (tabBadgeSignals) {
        tabBadgeSignals.textContent = overall;
        tabBadgeSignals.className = `tab-mini-badge ${badgeClass}`;
    }
    if (mobileBadgeSignals) {
        mobileBadgeSignals.textContent = overall;
        mobileBadgeSignals.className = `tab-mini-badge ${badgeClass}`;
    }
    updateMobileTabState(state.activeMainTab);


    setText('bullishCount', bullish);
    setText('neutralCount', neutral);
    setText('bearishCount', bearish);

    const meterBullish = document.getElementById('meterBullish');
    const meterNeutral = document.getElementById('meterNeutral');
    const meterBearish = document.getElementById('meterBearish');

    if (meterBullish) meterBullish.style.width = `${(bullish / total) * 100}%`;
    if (meterNeutral) meterNeutral.style.width = `${(neutral / total) * 100}%`;
    if (meterBearish) meterBearish.style.width = `${(bearish / total) * 100}%`;

    // Render Individual Signal Rows
    const listContainer = document.getElementById('signalsList');
    if (listContainer) {
        listContainer.innerHTML = '';
        const indicators = signals.indicators || {};
        const stock = state.stocksData[state.activeTicker];
        const instCurr = stock?.profile?.currency || 'USD';
        const baseCurr = getUserBaseCurrency();

        for (const [key, item] of Object.entries(indicators)) {
            const row = document.createElement('div');
            row.className = 'signal-row';

            let statusClass = 'badge-neutral';
            if (item.status === 'bullish') statusClass = 'badge-bullish';
            if (item.status === 'bearish') statusClass = 'badge-bearish';

            let valDisplay = item.value;
            if (typeof item.value === 'number' && (key === 'SuperTrend' || key === 'VWAP' || key === 'SMA_50' || key === 'SMA_20')) {
                valDisplay = formatPrice(item.value, instCurr, baseCurr);
            } else if (typeof item.value === 'string' && item.value.startsWith('ATR: $')) {
                const num = parseFloat(item.value.replace(/[^0-9.]/g, ''));
                if (!isNaN(num)) valDisplay = `ATR: ±${formatPrice(num, instCurr, baseCurr)}`;
            }

            row.innerHTML = `
                <div class="signal-name-desc">
                    <span class="signal-name">${key.replace('_', ' ')}</span>
                    <span class="signal-desc">${item.desc || ''}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${valDisplay !== undefined ? `<span class="mono" style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${valDisplay}</span>` : ''}
                    <span class="badge-pill ${statusClass}">${item.signal}</span>
                </div>
            `;
            listContainer.appendChild(row);
        }
    }
}

// -------------------------------------------------------------
// INSTITUTIONAL QUANTITATIVE BACKTESTING STUDIO & ENGINE
// -------------------------------------------------------------

// Active backtest result cache
let _currentBacktestResult = null;

// Dynamic On-Demand Script Loader for ApexCharts (Reduces Initial Payload by ~455 KiB)
let _apexChartsPromise = null;

// =============================================================
// ADD STOCK & COMPANY SEARCH MODAL CONTROLLER
// =============================================================

let stockSearchDebounceTimer = null;
let activeSearchAbortController = null;

let stockSearchModalMode = 'watchlist'; // 'watchlist' | 'deep-dive' | 'alert' | 'universe' | 'backtest'



function openAddStockModal(mode = 'watchlist', initialQuery = '') {
    stockSearchModalMode = mode;
    const modal = document.getElementById('addStockModal');
    const input = document.getElementById('stockSearchModalInput');
    const clearBtn = document.getElementById('stockSearchClearBtn');
    const spinner = document.getElementById('stockSearchSpinner');
    const resultsList = document.getElementById('stockSearchResultsList');
    const titleEl = document.getElementById('stockSearchModalTitle');
    const subtitleEl = document.getElementById('stockSearchModalSubtitle');
    const iconEl = document.getElementById('stockSearchModalIcon');
    const footerNoteEl = document.getElementById('stockSearchModalFooterNote');
    const doneBtn = document.getElementById('stockSearchDoneBtn') || document.querySelector('#addStockModal .btn-stock-search-done');
    const suggRow = document.getElementById('stockSearchSuggestionsRow');

    if (!modal) return;

    if (mode === 'alert') {
        if (titleEl) titleEl.textContent = 'Search Stock for Signal Alert';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol to configure signal alert trigger';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="bell-plus" style="color: var(--accent-purple); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Select any stock or ETF to populate into the Signal Alert Trigger configurator.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Close';
    } else if (mode === 'deep-dive') {
        if (titleEl) titleEl.textContent = 'Search Stock for Deep Dive';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol to analyze in Deep-Dive terminal';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="sparkles" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Select any exchange listing to load full technical and AI analysis in the Deep-Dive terminal.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Close';
    } else if (mode === 'universe' || mode === 'scanner') {
        if (titleEl) titleEl.textContent = 'Add Stock to Monitoring Universe';
        if (subtitleEl) subtitleEl.textContent = 'Search global stocks & ETFs to expand automated background scanner coverage';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="layers-plus" style="color: var(--accent-blue); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Added stocks are validated via live market data feeds and continuously monitored in background scans.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Done';

        if (!state.scannerUniverseTickers || state.scannerUniverseTickers.size === 0) {
            loadScannerUniverseTickers();
        }
    } else if (mode === 'backtest') {
        if (titleEl) titleEl.textContent = 'Search Asset for Backtesting';
        if (subtitleEl) subtitleEl.textContent = 'Search global equities & ETFs across international exchanges to run simulation';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="play-circle" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Click any stock or ETF to immediately load historical data and backtest strategies in the Studio.';
        if (input) input.placeholder = 'Search company name or ticker symbol (e.g. NVDA, AAPL, SAP.DE)...';
        if (doneBtn) doneBtn.textContent = 'Close';
        if (suggRow) {
            suggRow.innerHTML = `
                <span class="stock-search-suggestions-label">Quick Assets:</span>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('NVDA')">NVDA</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('AAPL')">AAPL</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('MSFT')">MSFT</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('TSLA')">TSLA</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('SAP')">SAP</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('PLTR')">PLTR</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('SPY')">SPY</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('QQQ')">QQQ</button>
            `;
        }
    } else {
        if (titleEl) titleEl.textContent = 'Add Stock to Watchlist';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol with exchange disambiguation';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="plus-circle" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Added stocks immediately sync to your personalized profile and compute quantitative indicators.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Done';
        if (suggRow) {
            suggRow.innerHTML = `
                <span class="stock-search-suggestions-label">Popular:</span>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Apple')">Apple</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('NVIDIA')">NVIDIA</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('PayPal')">PayPal</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Infineon')">Infineon</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('SAP')">SAP</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Microsoft')">Microsoft</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Clean Energy')">Clean Energy</button>
            `;
        }
    }

    // Reset input state
    if (input) input.value = initialQuery || '';
    if (clearBtn) clearBtn.style.display = initialQuery ? 'flex' : 'none';
    if (spinner) spinner.style.display = 'none';

    // Show initial prompt or trigger search
    if (initialQuery) {
        handleStockSearchInput(initialQuery);
    } else if (resultsList) {
        resultsList.innerHTML = `
            <div class="stock-search-empty-state">
                <div class="stock-search-empty-icon">
                    <i data-lucide="search" style="width: 32px; height: 32px; color: var(--text-muted);"></i>
                </div>
                <div class="stock-search-empty-text">Type a company name or ticker symbol to begin searching</div>
                <div class="stock-search-empty-subtext">If multiple listings or international exchanges exist (e.g. Frankfurt, XETRA, NASDAQ), all matching options will be presented for disambiguation.</div>
            </div>
        `;
    }

    modal.style.display = 'flex';
    setTimeout(() => {
        input?.focus();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function closeAddStockModal() {
    const modal = document.getElementById('addStockModal');
    if (modal) modal.style.display = 'none';
    if (activeSearchAbortController) {
        activeSearchAbortController.abort();
        activeSearchAbortController = null;
    }
}

function clearStockSearchInput() {
    const input = document.getElementById('stockSearchModalInput');
    const clearBtn = document.getElementById('stockSearchClearBtn');
    const spinner = document.getElementById('stockSearchSpinner');
    const resultsList = document.getElementById('stockSearchResultsList');

    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (spinner) spinner.style.display = 'none';

    if (resultsList) {
        resultsList.innerHTML = `
            <div class="stock-search-empty-state">
                <div class="stock-search-empty-icon">
                    <i data-lucide="search" style="width: 32px; height: 32px; color: var(--text-muted);"></i>
                </div>
                <div class="stock-search-empty-text">Type a company name or ticker symbol to begin searching</div>
                <div class="stock-search-empty-subtext">If multiple listings or international exchanges exist (e.g. Frankfurt, XETRA, NASDAQ), all matching options will be presented for disambiguation.</div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function setStockSearchQuery(query) {
    const input = document.getElementById('stockSearchModalInput');
    if (input) {
        input.value = query;
        handleStockSearchInput(query);
    }
}

function handleStockSearchInput(query) {
    const clearBtn = document.getElementById('stockSearchClearBtn');
    const clean = String(query || '').trim();

    if (clearBtn) {
        clearBtn.style.display = clean.length > 0 ? 'flex' : 'none';
    }

    if (stockSearchDebounceTimer) {
        clearTimeout(stockSearchDebounceTimer);
    }

    if (!clean) {
        clearStockSearchInput();
        return;
    }

    stockSearchDebounceTimer = setTimeout(() => {
        performStockSearch(clean);
    }, 250);
}

async function performStockSearch(query) {
    const spinner = document.getElementById('stockSearchSpinner');
    const resultsList = document.getElementById('stockSearchResultsList');
    if (!resultsList) return;

    if (spinner) spinner.style.display = 'flex';

    if (activeSearchAbortController) {
        activeSearchAbortController.abort();
    }
    activeSearchAbortController = new AbortController();

    // Batch resolution for multiple comma-separated companies/tickers
    if (query.includes(',')) {
        try {
            const batchResp = await fetch('/api/stocks/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query }),
                signal: activeSearchAbortController.signal
            });
            if (batchResp.ok) {
                const rawResolved = batchData.resolved || [];
                const seenBatch = new Set();
                const resolved = [];
                for (const item of rawResolved) {
                    const tk = String(item.ticker || '').toUpperCase().trim();
                    if (tk && !seenBatch.has(tk)) {
                        seenBatch.add(tk);
                        resolved.push(item);
                    }
                }
                if (resolved.length > 0) {
                    const isUniMode = stockSearchModalMode === 'universe' || stockSearchModalMode === 'scanner';
                    const inWatchlist = (t) => state.watchlistTickers.includes(t);
                    const inUniverse = (t) => Boolean(state.scannerUniverseTickers && state.scannerUniverseTickers.has(t.toUpperCase()));

                    const unaddedWatchlist = resolved.filter(r => !inWatchlist(r.ticker));
                    const unaddedUniverse = resolved.filter(r => !inUniverse(r.ticker));

                    let batchHeaderHtml = '';
                    if (stockSearchModalMode === 'watchlist' && unaddedWatchlist.length > 1) {
                        batchHeaderHtml = `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: var(--radius-sm); margin-bottom: 8px;">
                                <span style="font-size: 0.82rem; font-weight: 600; color: var(--accent-cyan);">${resolved.length} stocks resolved</span>
                                <button type="button" class="btn-stock-search-add" onclick="handleAddBatchStocksModal(${JSON.stringify(unaddedWatchlist.map(u => u.ticker)).replace(/"/g, '&quot;')})">
                                    <i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i>
                                    <span>Add All (${unaddedWatchlist.length})</span>
                                </button>
                            </div>
                        `;
                    } else if (isUniMode && unaddedUniverse.length > 1) {
                        batchHeaderHtml = `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: var(--radius-sm); margin-bottom: 8px;">
                                <span style="font-size: 0.82rem; font-weight: 600; color: var(--accent-blue);">${resolved.length} stocks resolved</span>
                                <button type="button" class="btn-stock-search-add" onclick="handleAddBatchStocksUniverseModal(${JSON.stringify(unaddedUniverse.map(u => u.ticker)).replace(/"/g, '&quot;')})" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: transparent; color: #fff;">
                                    <i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i>
                                    <span>Add All to Universe (${unaddedUniverse.length})</span>
                                </button>
                            </div>
                        `;
                    }

                    resultsList.innerHTML = batchHeaderHtml + resolved.map(item => {
                        const ticker = escapeHtml(item.ticker);
                        const name = escapeHtml(item.name || item.ticker);
                        const exchange = escapeHtml(item.exchange || 'Global');
                        const type = escapeHtml(item.type || 'EQUITY');
                        const isTracked = inWatchlist(item.ticker);
                        const isUni = inUniverse(item.ticker);

                        if (stockSearchModalMode === 'alert') {
                            return `
                                <div class="stock-search-item" onclick="handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4);">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">${name}</div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #8b5cf6, #2563eb); border-color: transparent; color: #fff;">
                                            <i data-lucide="bell-plus" style="width: 13px; height: 13px;"></i>
                                            <span>Select for Alert</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }

                        if (stockSearchModalMode === 'deep-dive') {
                            return `
                                <div class="stock-search-item" onclick="handleOpenDeepDiveFromModal('${ticker}')" style="cursor: pointer;">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">${name}</div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleOpenDeepDiveFromModal('${ticker}')">
                                            <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
                                            <span>Open Deep Dive</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }

                        if (stockSearchModalMode === 'backtest') {
                            const isAdded = (state.backtestTickers || []).some(t => String(t || '').toUpperCase().trim() === ticker.toUpperCase());
                            const isActive = ticker.toUpperCase() === (state.backtestTicker || '').toUpperCase();
                            return `
                                <div class="stock-search-item ${isActive ? 'active-backtest-item' : ''}" onclick="handleSelectStockForBacktest('${ticker}')" style="cursor: pointer;">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border-color: rgba(6, 182, 212, 0.4);">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">
                                                ${name}
                                                ${isActive ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 700; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); padding: 1px 6px; border-radius: 4px;">CURRENTLY LOADED</span>' : (isAdded ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 600; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); padding: 1px 6px; border-radius: 4px;">IN STUDIO</span>' : '')}
                                            </div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        ${isAdded ? `
                                            <button type="button" class="btn-table-remove btn-icon" onclick="event.stopPropagation(); removeBacktestTicker('${ticker}', event); performStockSearch(document.getElementById('stockSearchInput')?.value || '');" title="Remove ${ticker} from Backtest Studio" aria-label="Remove ${ticker}" style="width: 30px; height: 30px;">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        ` : ''}
                                        ${isActive ? `
                                            <button type="button" class="btn-stock-search-add added" disabled style="opacity: 0.9; background: rgba(6, 182, 212, 0.18); color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.4);">
                                                <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                                <span>Active</span>
                                            </button>
                                        ` : `
                                            <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForBacktest('${ticker}')" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); border-color: transparent; color: #fff;">
                                                <i data-lucide="play-circle" style="width: 13px; height: 13px;"></i>
                                                <span>${isAdded ? 'Load in Studio' : 'Select for Backtest'}</span>
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }

                        if (isUniMode) {
                            return `
                                <div class="stock-search-item">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.35);">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">${name}</div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        ${isUni ? `
                                            <button type="button" class="btn-stock-search-add added" disabled>
                                                <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                                <span>In Universe</span>
                                            </button>
                                        ` : `
                                            <button type="button" class="btn-stock-search-add" onclick="handleAddStockToUniverseFromModal('${ticker}', this)" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: transparent; color: #fff;">
                                                <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                                <span>Add to Universe</span>
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }

                        return `
                            <div class="stock-search-item">
                                <div class="stock-search-item-left">
                                    <div class="stock-search-ticker-badge">${ticker}</div>
                                    <div class="stock-search-details">
                                        <div class="stock-search-company-name" title="${name}">${name}</div>
                                        <div class="stock-search-meta-row">
                                            <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                            <span class="stock-search-tag type">${type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    ${isTracked ? `
                                        <button type="button" class="btn-stock-search-add added" disabled>
                                            <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                            <span>In Watchlist</span>
                                        </button>
                                    ` : `
                                        <button type="button" class="btn-stock-search-add" onclick="handleAddStockFromModal('${ticker}', this)">
                                            <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                            <span>Add</span>
                                        </button>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('');
                    if (spinner) spinner.style.display = 'none';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    return;
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=15`, {
            signal: activeSearchAbortController.signal
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawResults = data.results || [];
        const seenTickers = new Set();
        const results = [];
        for (const item of rawResults) {
            const tk = String(item.ticker || '').toUpperCase().trim();
            if (tk && !seenTickers.has(tk)) {
                seenTickers.add(tk);
                results.push(item);
            }
        }

        if (results.length === 0) {
            resultsList.innerHTML = `
                <div class="stock-search-empty-state">
                    <div class="stock-search-empty-icon">
                        <i data-lucide="alert-circle" style="width: 30px; height: 30px; color: var(--accent-amber);"></i>
                    </div>
                    <div class="stock-search-empty-text">No stocks found for "${escapeHtml(query)}"</div>
                    <div class="stock-search-empty-subtext">Try searching by exact ticker symbol (e.g. <code>NVDA</code>, <code>SAP.DE</code>) or full company name.</div>
                </div>
            `;
        } else {
            resultsList.innerHTML = results.map(item => {
                const ticker = escapeHtml(item.ticker);
                const name = escapeHtml(item.name || item.ticker);
                const exchange = escapeHtml(item.exchange || 'Global');
                const type = escapeHtml(item.type || 'EQUITY');
                const sector = item.sector ? escapeHtml(item.sector) : '';
                const isTracked = state.watchlistTickers.includes(item.ticker);
                const isUni = Boolean(state.scannerUniverseTickers && state.scannerUniverseTickers.has(item.ticker.toUpperCase()));
                const isUniMode = stockSearchModalMode === 'universe' || stockSearchModalMode === 'scanner';

                if (stockSearchModalMode === 'alert') {
                    return `
                        <div class="stock-search-item" onclick="handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4);">${ticker}</div>
                                <div class="stock-search-details">
                                    <div class="stock-search-company-name" title="${name}">${name}</div>
                                    <div class="stock-search-meta-row">
                                        <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                        <span class="stock-search-tag type">${type}</span>
                                        ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #8b5cf6, #2563eb); border-color: transparent; color: #fff;">
                                    <i data-lucide="bell-plus" style="width: 13px; height: 13px;"></i>
                                    <span>Select for Alert</span>
                                </button>
                            </div>
                        </div>
                    `;
                }

                if (stockSearchModalMode === 'deep-dive') {
                    return `
                        <div class="stock-search-item" onclick="handleOpenDeepDiveFromModal('${ticker}')" style="cursor: pointer;">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge">${ticker}</div>
                                <div class="stock-search-details">
                                    <div class="stock-search-company-name" title="${name}">${name}</div>
                                    <div class="stock-search-meta-row">
                                        <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                        <span class="stock-search-tag type">${type}</span>
                                        ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleOpenDeepDiveFromModal('${ticker}')">
                                    <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
                                    <span>Open Deep Dive</span>
                                </button>
                            </div>
                        </div>
                    `;
                }

                if (stockSearchModalMode === 'backtest') {
                    const isAdded = (state.backtestTickers || []).some(t => String(t || '').toUpperCase().trim() === ticker.toUpperCase());
                    const isActive = ticker.toUpperCase() === (state.backtestTicker || '').toUpperCase();
                    return `
                        <div class="stock-search-item ${isActive ? 'active-backtest-item' : ''}" onclick="handleSelectStockForBacktest('${ticker}')" style="cursor: pointer;">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border-color: rgba(6, 182, 212, 0.4);">${ticker}</div>
                                <div class="stock-search-details">
                                    <div class="stock-search-company-name" title="${name}">
                                        ${name}
                                        ${isActive ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 700; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); padding: 1px 6px; border-radius: 4px;">CURRENTLY LOADED</span>' : (isAdded ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 600; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); padding: 1px 6px; border-radius: 4px;">IN STUDIO</span>' : '')}
                                    </div>
                                    <div class="stock-search-meta-row">
                                        <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                        <span class="stock-search-tag type">${type}</span>
                                        ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${isAdded ? `
                                    <button type="button" class="btn-table-remove btn-icon" onclick="event.stopPropagation(); removeBacktestTicker('${ticker}', event); performStockSearch(document.getElementById('stockSearchInput')?.value || '');" title="Remove ${ticker} from Backtest Studio" aria-label="Remove ${ticker}" style="width: 30px; height: 30px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                ` : ''}
                                ${isActive ? `
                                    <button type="button" class="btn-stock-search-add added" disabled style="opacity: 0.9; background: rgba(6, 182, 212, 0.18); color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.4);">
                                        <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                        <span>Active</span>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForBacktest('${ticker}')" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); border-color: transparent; color: #fff;">
                                        <i data-lucide="play-circle" style="width: 13px; height: 13px;"></i>
                                        <span>${isAdded ? 'Load in Studio' : 'Select for Backtest'}</span>
                                    </button>
                                `}
                            </div>
                        </div>
                    `;
                }

                if (isUniMode) {
                    return `
                        <div class="stock-search-item">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.35);">${ticker}</div>
                                <div class="stock-search-details">
                                    <div class="stock-search-company-name" title="${name}">${name}</div>
                                    <div class="stock-search-meta-row">
                                        <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                        <span class="stock-search-tag type">${type}</span>
                                        ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div>
                                ${isUni ? `
                                    <button type="button" class="btn-stock-search-add added" disabled>
                                        <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                        <span>In Universe</span>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-stock-search-add" onclick="handleAddStockToUniverseFromModal('${ticker}', this)" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: transparent; color: #fff;">
                                        <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                        <span>Add to Universe</span>
                                    </button>
                                `}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="stock-search-item">
                        <div class="stock-search-item-left">
                            <div class="stock-search-ticker-badge">${ticker}</div>
                            <div class="stock-search-details">
                                <div class="stock-search-company-name" title="${name}">${name}</div>
                                <div class="stock-search-meta-row">
                                    <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                    <span class="stock-search-tag type">${type}</span>
                                    ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div>
                            ${isTracked ? `
                                <button type="button" class="btn-stock-search-add added" disabled>
                                    <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                    <span>In Watchlist</span>
                                </button>
                            ` : `
                                <button type="button" class="btn-stock-search-add" onclick="handleAddStockFromModal('${ticker}', this)">
                                    <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                    <span>Add</span>
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        resultsList.innerHTML = `
            <div class="stock-search-empty-state">
                <div class="stock-search-empty-icon">
                    <i data-lucide="wifi-off" style="width: 30px; height: 30px; color: #ef4444;"></i>
                </div>
                <div class="stock-search-empty-text">Search failed</div>
                <div class="stock-search-empty-subtext">${escapeHtml(err.message || 'Unable to connect to search service.')}</div>
            </div>
        `;
    } finally {
        if (spinner) spinner.style.display = 'none';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

async function handleAddStockFromModal(ticker, btnElement) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();

    if (!state.watchlistTickers.includes(cleanTicker)) {
        state.watchlistTickers.push(cleanTicker);

        if (btnElement) {
            btnElement.classList.add('added');
            btnElement.disabled = true;
            btnElement.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i><span>In Watchlist</span>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        renderWatchlistTags();
        await saveWatchlistServer();
        await fetchWatchlistAnalysis();
    }
}

function updateScannerUniverseDisplay(count) {
    if (!count || isNaN(count) || count <= 0) return;
    const num = parseInt(count, 10);
    state.totalUniverseCount = num;
    
    const statUni = document.getElementById('scanStatUniverse');
    const uniCountBadge = document.getElementById('scanUniverseCountBadge');
    if (statUni) statUni.textContent = `${num} Assets`;
    if (uniCountBadge) uniCountBadge.textContent = `${num} Stocks`;

    if (state.scannerResults) {
        state.scannerResults.totalUniverseScanned = num;
        state.scannerResults.totalUniverse = num;
        state.scannerResults.totalAssets = num;
    }
    try {
        const cachedRaw = localStorage.getItem('findashiq_scanner_cache');
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.results) {
                cached.results.totalUniverseScanned = num;
                cached.results.totalUniverse = num;
                cached.results.totalAssets = num;
                localStorage.setItem('findashiq_scanner_cache', JSON.stringify(cached));
            }
        }
    } catch (e) { }
}

async function handleAddBatchStocksModal(tickers) {
    if (!Array.isArray(tickers) || tickers.length === 0) return;
    let added = false;
    for (const t of tickers) {
        const cleanTicker = t.trim().toUpperCase();
        if (!state.watchlistTickers.includes(cleanTicker)) {
            state.watchlistTickers.push(cleanTicker);
            added = true;
        }
    }
    if (added) {
        renderWatchlistTags();
        await saveWatchlistServer();
        closeAddStockModal();
        await fetchWatchlistAnalysis();
    }
}

async function handleAddBatchStocksUniverseModal(tickers) {
    if (!Array.isArray(tickers) || tickers.length === 0) return;
    let addedCount = 0;
    let lastTotal = 0;
    for (const t of tickers) {
        const clean = t.trim().toUpperCase();
        try {
            const res = await fetch('/api/scanner/universe/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: clean })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                addedCount++;
                if (data.totalUniverse) lastTotal = data.totalUniverse;
                if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(clean);
            }
        } catch (e) { }
    }
    if (lastTotal > 0) {
        updateScannerUniverseDisplay(lastTotal);
    }
    closeAddStockModal();
    showAddUniverseAlert(`Added ${addedCount} stock${addedCount === 1 ? '' : 's'} to universe.`, 'success');
}

async function handleAddStockToUniverseFromModal(ticker, btnElement) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = `<div class="spinner-sm" style="width: 12px; height: 12px; border-width: 2px;"></div> <span>Adding...</span>`;
    }

    try {
        const res = await fetch('/api/scanner/universe/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: cleanTicker })
        });
        const data = await res.json();

        if (res.status === 409 || (!res.ok && data.message && data.message.includes('already in monitoring universe'))) {
            if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(cleanTicker);
            showAddUniverseAlert(data.message || `Stock ${cleanTicker} is already in monitoring universe`, 'duplicate');
            if (btnElement) {
                btnElement.classList.add('added');
                btnElement.disabled = true;
                btnElement.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> <span>In Universe</span>`;
            }
            return;
        }

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Failed to add ${cleanTicker} to universe.`);
        }

        if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(cleanTicker);

        if (btnElement) {
            btnElement.classList.add('added');
            btnElement.disabled = true;
            btnElement.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> <span>In Universe</span>`;
        }

        if (data.totalUniverse) {
            updateScannerUniverseDisplay(data.totalUniverse);
        }

        // Close the modal so the user can see the scanner page and the success alert.
        // The new stock is queued for background analysis — it will appear after the next scan.
        closeAddStockModal();

        // Show the success alert on the now-visible scanner page.
        showAddUniverseAlert(
            `${data.message || `Added ${cleanTicker} to universe`} — it will appear in results after the next background scan.`,
            'success'
        );

        // Clear any stale ticker search query so results render in full.
        const searchInput = document.getElementById('scannerSearchQuery');
        if (searchInput) searchInput.value = '';

        // Immediately re-render existing results from memory — the new stock isn't in
        // the opportunity cache yet, but the existing ones should display right away.
        const currentOpps = state.allScannerOpportunities || state.scannerResults?.opportunities || [];
        if (currentOpps.length > 0) {
            renderScannerResults(currentOpps);
        } else {
            // Fallback: hit the server if local state is empty (e.g. cold-start edge case).
            await silentRefreshScannerCache();
        }

    } catch (err) {
        console.error('Add stock to universe error:', err);
        showAddUniverseAlert(err.message || 'Error adding stock to universe', 'error');
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = `<i data-lucide="plus" style="width: 13px; height: 13px;"></i> <span>Add to Universe</span>`;
        }
    } finally {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

async function handleOpenDeepDiveFromModal(ticker) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    closeAddStockModal();

    // Set input
    const input = document.getElementById('tickerInput');
    if (input) input.value = cleanTicker;

    // Switch to deep dive tab if needed
    if (state.activeTopTab !== 'terminal') {
        switchTopTab('terminal');
    }

    await handleAnalyze();
}

function handleSelectStockForBacktest(ticker) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    closeAddStockModal();

    if (state.activeTopTab !== 'backtest') {
        switchTopTab('backtest');
    }

    setBacktestTicker(cleanTicker);
}

function handleSelectStockForAlert(ticker, name = '') {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    closeAddStockModal();

    if (state.activeTopTab !== 'notifications') {
        switchTopTab('notifications');
    }

    const tickerSelect = document.getElementById('alertTickerSelect');
    const customInput = document.getElementById('alertCustomTicker');

    if (tickerSelect) {
        let optExists = Array.from(tickerSelect.options).some(opt => opt.value.toUpperCase() === cleanTicker);
        if (!optExists) {
            const newOpt = document.createElement('option');
            newOpt.value = cleanTicker;
            newOpt.textContent = name ? `${cleanTicker} — ${name}` : cleanTicker;
            newOpt.selected = true;
            tickerSelect.insertBefore(newOpt, tickerSelect.firstChild);
        }
        tickerSelect.value = cleanTicker;
    }

    if (customInput) {
        customInput.value = cleanTicker;
    }

    updateAlertPreview();

    const formEl = document.getElementById('createAlertForm');
    if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function populateAlertTickerOptions() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    if (!tickerSelect) return;
    const currentVal = tickerSelect.value;

    const trackedOptgroup = document.getElementById('alertWatchlistOptgroup') || tickerSelect.querySelector('optgroup[label*="Tracked"]') || tickerSelect.querySelector('optgroup');
    if (trackedOptgroup) {
        if (state.watchlistTickers && state.watchlistTickers.length > 0) {
            trackedOptgroup.innerHTML = state.watchlistTickers.map(ticker => {
                const stock = state.watchlistData?.[ticker] || state.stocksData?.[ticker];
                const name = stock?.profile?.name || stock?.name || ticker;
                return `<option value="${ticker}">${ticker} — ${name}</option>`;
            }).join('');
        } else {
            trackedOptgroup.innerHTML = `<option value="" disabled>(No stocks currently in watchlist)</option>`;
        }
    }

    if (currentVal && Array.from(tickerSelect.options).some(o => o.value === currentVal)) {
        tickerSelect.value = currentVal;
    } else {
        const firstValid = Array.from(tickerSelect.options).find(o => !o.disabled && o.value);
        if (firstValid) {
            tickerSelect.value = firstValid.value;
        }
    }
    updateAlertPreview();
}

// =============================================================
// DEEP DIVE LIVE AUTOCOMPLETE & SEARCH DROPDOWN CONTROLLER
// =============================================================

let deepDiveSearchDebounceTimer = null;
let deepDiveActiveAbortController = null;
let deepDiveSelectedIndex = -1;
let deepDiveCurrentResults = [];

function getActiveDeepDiveToken(fullInput) {
    if (!fullInput) return '';
    const parts = fullInput.split(',');
    return parts[parts.length - 1].trim();
}

function handleDeepDiveSearchFocus() {
    const inputVal = document.getElementById('tickerInput')?.value || '';
    const cleanToken = getActiveDeepDiveToken(inputVal);
    if (cleanToken.length >= 2) {
        handleDeepDiveSearchInput(inputVal);
    }
}

function handleDeepDiveSearchInput(fullValue) {
    const clearBtn = document.getElementById('tickerInputClearBtn');
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const spinner = document.getElementById('deepDiveSearchSpinner');

    if (clearBtn) {
        clearBtn.style.display = fullValue.trim().length > 0 ? 'flex' : 'none';
    }

    const token = getActiveDeepDiveToken(fullValue);

    if (deepDiveSearchDebounceTimer) {
        clearTimeout(deepDiveSearchDebounceTimer);
    }

    if (!token || token.length < 1) {
        if (dropdown) dropdown.style.display = 'none';
        if (spinner) spinner.style.display = 'none';
        deepDiveSelectedIndex = -1;
        deepDiveCurrentResults = [];
        return;
    }

    deepDiveSearchDebounceTimer = setTimeout(() => {
        performDeepDiveInlineSearch(token);
    }, 220);
}

async function performDeepDiveInlineSearch(token) {
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const resultsList = document.getElementById('deepDiveSearchResultsList');
    const spinner = document.getElementById('deepDiveSearchSpinner');

    if (!resultsList || !dropdown) return;

    if (spinner) spinner.style.display = 'flex';

    if (deepDiveActiveAbortController) {
        deepDiveActiveAbortController.abort();
    }
    deepDiveActiveAbortController = new AbortController();

    try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(token)}&limit=10`, {
            signal: deepDiveActiveAbortController.signal
        });

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const results = data.results || [];
        deepDiveCurrentResults = results;
        deepDiveSelectedIndex = -1;

        if (results.length === 0) {
            resultsList.innerHTML = `
                <div style="padding: 16px 12px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
                    No matching companies or tickers found for "<strong>${escapeHtml(token)}</strong>".
                </div>
            `;
        } else {
            resultsList.innerHTML = results.map((item, idx) => {
                const ticker = escapeHtml(item.ticker);
                const name = escapeHtml(item.name || item.ticker);
                const exchange = escapeHtml(item.exchange || 'Global');
                const type = escapeHtml(item.type || 'EQUITY');
                const sector = item.sector ? escapeHtml(item.sector) : '';

                return `
                    <div class="deep-dive-result-item" data-index="${idx}" onmouseenter="deepDiveSetHoverIndex(${idx})" onclick="selectDeepDiveStock('${ticker}', event)">
                        <div class="deep-dive-result-item-left">
                            <div class="stock-search-ticker-badge">${ticker}</div>
                            <div class="deep-dive-result-details">
                                <div class="deep-dive-result-name" title="${name}">${name}</div>
                                <div class="deep-dive-result-meta">
                                    <span class="stock-search-tag exchange">${exchange}</span>
                                    <span class="stock-search-tag type">${type}</span>
                                    ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <button type="button" class="deep-dive-result-btn" onclick="event.stopPropagation(); selectDeepDiveStock('${ticker}', event)">
                            <i data-lucide="sparkles" style="width: 12px; height: 12px;"></i>
                            <span>Analyze</span>
                        </button>
                    </div>
                `;
            }).join('');
        }

        dropdown.style.display = 'flex';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        if (err.name === 'AbortError') return;
        resultsList.innerHTML = `
            <div style="padding: 14px; text-align: center; color: var(--accent-red); font-size: 0.8rem;">
                Search error: ${escapeHtml(err.message)}
            </div>
        `;
        dropdown.style.display = 'flex';
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

function deepDiveSetHoverIndex(idx) {
    deepDiveSelectedIndex = idx;
    updateDeepDiveSelectedHighlight();
}

function updateDeepDiveSelectedHighlight() {
    const items = document.querySelectorAll('#deepDiveSearchResultsList .deep-dive-result-item');
    items.forEach((el, idx) => {
        el.classList.toggle('is-selected', idx === deepDiveSelectedIndex);
        if (idx === deepDiveSelectedIndex) {
            el.scrollIntoView({ block: 'nearest' });
        }
    });
}

function handleDeepDiveSearchKeyDown(event) {
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const isVisible = dropdown && dropdown.style.display !== 'none';

    if (event.key === 'ArrowDown') {
        if (isVisible && deepDiveCurrentResults.length > 0) {
            event.preventDefault();
            deepDiveSelectedIndex = (deepDiveSelectedIndex + 1) % deepDiveCurrentResults.length;
            updateDeepDiveSelectedHighlight();
        }
    } else if (event.key === 'ArrowUp') {
        if (isVisible && deepDiveCurrentResults.length > 0) {
            event.preventDefault();
            deepDiveSelectedIndex = (deepDiveSelectedIndex - 1 + deepDiveCurrentResults.length) % deepDiveCurrentResults.length;
            updateDeepDiveSelectedHighlight();
        }
    } else if (event.key === 'Enter') {
        if (isVisible && deepDiveSelectedIndex >= 0 && deepDiveSelectedIndex < deepDiveCurrentResults.length) {
            event.preventDefault();
            const item = deepDiveCurrentResults[deepDiveSelectedIndex];
            selectDeepDiveStock(item.ticker);
        } else {
            // Dismiss suggestions dropdown immediately on Enter
            if (dropdown) dropdown.style.display = 'none';
            deepDiveSelectedIndex = -1;
            if (deepDiveSearchDebounceTimer) {
                clearTimeout(deepDiveSearchDebounceTimer);
                deepDiveSearchDebounceTimer = null;
            }
            if (deepDiveActiveAbortController) {
                deepDiveActiveAbortController.abort();
                deepDiveActiveAbortController = null;
            }
            handleAnalyze(true);
        }
    } else if (event.key === 'Escape') {
        if (dropdown) dropdown.style.display = 'none';
        deepDiveSelectedIndex = -1;
    }
}

async function handleAddBatchStocksModal(tickersList) {
    if (!Array.isArray(tickersList) || tickersList.length === 0) return;
    let addedAny = false;
    for (const tk of tickersList) {
        const cleanTicker = String(tk || '').trim().toUpperCase();
        if (cleanTicker && !state.watchlistTickers.includes(cleanTicker)) {
            state.watchlistTickers.push(cleanTicker);
            addedAny = true;
        }
    }
    if (addedAny) {
        renderWatchlistTags();
        await saveWatchlistServer();
        await fetchWatchlistAnalysis();
        closeAddStockModal();
    }
}

async function handleAddBatchStocksUniverseModal(tickersList) {
    if (!Array.isArray(tickersList) || tickersList.length === 0) return;
    let addedCount = 0;
    for (const tk of tickersList) {
        const cleanTicker = String(tk || '').trim().toUpperCase();
        if (!cleanTicker) continue;
        try {
            const res = await fetch('/api/scanner/universe/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: cleanTicker })
            });
            if (res.ok) {
                addedCount++;
                if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(cleanTicker);
            }
        } catch (e) { }
    }
    if (addedCount > 0) {
        showAddUniverseAlert(`Added ${addedCount} stocks to monitoring universe.`, 'success');
        closeAddStockModal();
        await silentRefreshScannerCache();
    }
}

function selectDeepDiveStock(ticker, event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';
    deepDiveSelectedIndex = -1;

    const input = document.getElementById('tickerInput');
    if (!input || !ticker) return;

    const cleanTicker = normalizeTicker(ticker.trim().toUpperCase());
    const fullVal = input.value || '';
    const parts = fullVal.split(',').map(p => p.trim()).filter(Boolean);

    if (parts.length <= 1) {
        input.value = cleanTicker;
        state.activeTicker = cleanTicker;
        renderStockSelector([cleanTicker]);
    } else {
        parts[parts.length - 1] = cleanTicker;
        const deduplicated = [...new Set(parts.map(p => normalizeTicker(p.toUpperCase())))];
        input.value = deduplicated.join(', ');
        state.activeTicker = cleanTicker;
        renderStockSelector(deduplicated);
    }

    const clearBtn = document.getElementById('tickerInputClearBtn');
    if (clearBtn) clearBtn.style.display = 'flex';

    // Clear active preset buttons
    document.querySelectorAll('.preset-chip').forEach(btn => btn.classList.remove('active'));

    handleAnalyze(true);
}

function clearDeepDiveSearchInput() {
    const input = document.getElementById('tickerInput');
    const clearBtn = document.getElementById('tickerInputClearBtn');
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const spinner = document.getElementById('deepDiveSearchSpinner');

    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (spinner) spinner.style.display = 'none';
    if (dropdown) dropdown.style.display = 'none';
}

async function handleAddWatchlistTicker() {
    // Legacy fallback wrapper
    openAddStockModal();
}

async function refreshWatchlistData() {
    const refreshBtn = document.querySelector('.btn-watchlist-refresh');
    const refreshIcon = refreshBtn?.querySelector('i[data-lucide="refresh-cw"]');
    if (refreshIcon) refreshIcon.classList.add('spin-animation');
    if (refreshBtn) refreshBtn.classList.add('refreshing');

    try {
        setWatchlistSyncStatus('syncing', 'Refreshing live quotes...');
        await fetchWatchlistAnalysis(true);
    } finally {
        if (refreshIcon) refreshIcon.classList.remove('spin-animation');
        if (refreshBtn) refreshBtn.classList.remove('refreshing');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}
