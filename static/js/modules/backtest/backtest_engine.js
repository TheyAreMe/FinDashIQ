function ensureApexChartsLoaded() {
    if (typeof ApexCharts !== 'undefined') {
        return Promise.resolve();
    }
    if (_apexChartsPromise) {
        return _apexChartsPromise;
    }
    _apexChartsPromise = new Promise((resolve, reject) => {
        let checks = 0;
        const checkInterval = setInterval(() => {
            checks++;
            if (typeof ApexCharts !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            } else if (checks > 30) {
                clearInterval(checkInterval);
                const existingScript = document.querySelector('script[src*="apexcharts"]');
                if (existingScript && !existingScript.dataset.fallbackInjected) {
                    existingScript.dataset.fallbackInjected = 'true';
                    let subChecks = 0;
                    const subInterval = setInterval(() => {
                        subChecks++;
                        if (typeof ApexCharts !== 'undefined') {
                            clearInterval(subInterval);
                            resolve();
                        } else if (subChecks > 30) {
                            clearInterval(subInterval);
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
                            script.async = true;
                            script.onload = () => resolve();
                            script.onerror = (err) => {
                                _apexChartsPromise = null;
                                reject(err);
                            };
                            document.head.appendChild(script);
                        }
                    }, 50);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = (err) => {
                        _apexChartsPromise = null;
                        reject(err);
                    };
                    document.head.appendChild(script);
                }
            }
        }, 50);
    });
    return _apexChartsPromise;
}

function getChartThemeDefaults() {
    const isBright = state.theme === 'bright';
    return {
        themeMode: isBright ? 'light' : 'dark',
        gridBorderColor: isBright ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        labelColor: isBright ? '#475569' : '#94a3b8',
        axisBorderColor: isBright ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        tooltipTheme: isBright ? 'light' : 'dark'
    };
}

// Request sequence tracking for backtest studio to eliminate race conditions
let _backtestCurrentRequestId = 0;
let _isBacktestLoading = false;
let _hideBacktestTimer = null;

/**
 * Initialize the Backtesting Studio View
 */
async function initBacktestStudio(targetTicker = null) {
    const ticker = (targetTicker || state.backtestTicker || state.activeTicker || 'NVDA').toUpperCase().trim();
    state.backtestTicker = ticker;

    const reqId = ++_backtestCurrentRequestId;

    // Decoupled: Immediately sync and render paper trades in background without blocking on backtest charts
    loadPaperTrades();

    // Show loading immediately across overlay, header badge, and tab pills
    const stock = state.stocksData[ticker];
    const hasData = stock && stock.timeseries && stock.timeseries.length >= 20;
    showBacktestLoading(
        ticker,
        hasData ? `Analyzing ${ticker}...` : `Fetching Data for ${ticker}...`,
        hasData ? 'Simulating strategy models & rendering equity curve...' : 'Fetching daily historical candles & computing multi-factor indicators...'
    );

    // 1. Sync Ticker Input Field
    const tickerInput = document.getElementById('btTickerInput');
    if (tickerInput) tickerInput.value = ticker;

    // 2. Render Watchlist Quick-Pills
    renderBacktestWatchlistPills();

    // 3. Sync Controls (Timeframe, Mode, Strategy, Risk Inputs)
    syncBacktestControlsUI();

    // Yield so browser paints the loading overlay, header badge, and tab spinner before intensive execution
    await new Promise(resolve => setTimeout(resolve, 25));

    if (reqId !== _backtestCurrentRequestId) return;

    // 4. Ensure Stock Timeseries Data is Loaded
    await loadBacktestStockData(ticker);

    if (reqId !== _backtestCurrentRequestId) return;

    // 5. Immediately re-render pills so the selected stock shows its price, name, and badge dynamically
    renderBacktestWatchlistPills();

    // 6. Run Calculation and Render All Subsystems
    await recalculateCurrentBacktest(reqId);
}

// -------------------------------------------------------------
// BACKTEST STUDIO LOADING INDICATOR STATE & CONTROLS
// -------------------------------------------------------------
function showBacktestLoading(ticker, customText, customSubtext) {
    _isBacktestLoading = true;
    if (_hideBacktestTimer) {
        clearTimeout(_hideBacktestTimer);
        _hideBacktestTimer = null;
    }
    const cleanT = (ticker || state.backtestTicker || 'Asset').toUpperCase().trim();
    const overlay = document.getElementById('btChartsLoadingOverlay');
    const titleEl = document.getElementById('btChartsLoadingTitle');
    const subtextEl = document.getElementById('btChartsLoadingSubtext');
    const badge = document.getElementById('btHeaderLoadingBadge');
    const badgeText = document.getElementById('btHeaderLoadingText');

    if (badge) {
        badge.style.display = 'inline-flex';
        if (badgeText) {
            badgeText.textContent = customText || `Loading ${cleanT}...`;
        }
    }

    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        if (titleEl) {
            titleEl.textContent = `Loading Market History for ${escapeHtml(cleanT)}...`;
        }
        if (subtextEl) {
            subtextEl.textContent = customSubtext || 'Fetching historical candles & computing multi-factor indicators...';
        }
    }

    // Toggle loading class on matching tab pill
    document.querySelectorAll('#btWatchlistTabsList .bt-asset-tab').forEach(tab => {
        if (tab.dataset.ticker === cleanT) {
            tab.classList.add('is-loading');
        } else {
            tab.classList.remove('is-loading');
        }
    });
}
window.showBacktestLoading = showBacktestLoading;

function hideBacktestLoading() {
    _isBacktestLoading = false;
    if (_hideBacktestTimer) {
        clearTimeout(_hideBacktestTimer);
        _hideBacktestTimer = null;
    }
    const overlay = document.getElementById('btChartsLoadingOverlay');
    const badge = document.getElementById('btHeaderLoadingBadge');

    if (overlay) {
        overlay.style.opacity = '0';
        _hideBacktestTimer = setTimeout(() => {
            if (!_isBacktestLoading && overlay) {
                overlay.style.display = 'none';
            }
            _hideBacktestTimer = null;
        }, 220);
    }

    if (badge) {
        badge.style.display = 'none';
    }

    document.querySelectorAll('#btWatchlistTabsList .bt-asset-tab.is-loading').forEach(tab => {
        tab.classList.remove('is-loading');
    });
}
window.hideBacktestLoading = hideBacktestLoading;

/**
 * Ensure market history and technical signals are downloaded for backtesting
 */
async function loadBacktestStockData(ticker, targetTf = null) {
    const cleanTicker = (ticker || 'NVDA').toUpperCase().trim();
    const activeTf = (targetTf || state.backtestTimeframe || '1y').toLowerCase();
    const stock = state.stocksData[cleanTicker];

    const TF_BARS_MAP = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 1260
    };
    const requiredBars = TF_BARS_MAP[activeTf] || 252;

    // If timeseries has sufficient depth for the requested timeframe, or if already attempted for this timeframe and has data, no network fetch needed
    if (stock && stock.timeseries && (stock.timeseries.length >= requiredBars || (stock._backtestFetchedTf === activeTf && stock.timeseries.length >= 5))) {
        return;
    }

    showBacktestLoading(cleanTicker);

    // If chart instances don't exist yet, also prepare containers with spinners
    const eqContainer = document.getElementById('equityChartContainer');
    const ddContainer = document.getElementById('drawdownChartContainer');

    if (eqContainer && !state.charts.equity) {
        eqContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; gap: 12px; color: var(--text-secondary);">
                <div class="spinner" style="width: 32px; height: 32px; border-width: 3px;"></div>
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">Loading Market History for ${escapeHtml(cleanTicker)}...</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">Fetching daily historical candles &amp; computing multi-factor indicators</div>
            </div>`;
    }
    if (ddContainer && !state.charts.drawdown) {
        ddContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 140px; color: var(--text-muted); font-size: 0.78rem;">
                Preparing return relative to initial investment...
            </div>`;
    }

    let backtestPeriod = '5y';
    if (activeTf === 'max') {
        backtestPeriod = 'max';
    } else if (['2y', '3y', '5y'].includes(activeTf)) {
        backtestPeriod = '5y';
    } else if (['1mo', '3mo', '6mo', '1y'].includes(activeTf)) {
        backtestPeriod = '5y';
    }

    try {
        let data = null;
        try {
            const res = await fetch(`/api/stocks/${encodeURIComponent(cleanTicker)}?period=${backtestPeriod}&includeBacktests=0`);
            if (res.ok) {
                data = await res.json();
            }
        } catch (e) {
            console.warn('GET /api/stocks failed, trying POST /api/analyze fallback:', e);
        }

        if (!data || !data.timeseries || data.timeseries.length === 0) {
            const postRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tickers: [cleanTicker],
                    period: backtestPeriod,
                    interval: '1d',
                    phase: 'full'
                })
            });
            if (postRes.ok) {
                const postData = await postRes.json();
                if (postData && postData.stocks && postData.stocks[cleanTicker]) {
                    data = postData.stocks[cleanTicker];
                }
            }
        }

        if (data && data.timeseries && data.timeseries.length > 0) {
            const existing = state.stocksData[cleanTicker] || {};
            // Use whichever timeseries is longer so we never downgrade historical depth
            const mergedTs = (data.timeseries.length >= (existing.timeseries?.length || 0)) ? data.timeseries : existing.timeseries;
            if (data.fullTimeseries) delete data.fullTimeseries;
            state.stocksData[cleanTicker] = {
                ...existing,
                ...data,
                timeseries: mergedTs,
                profile: { ...(existing.profile || {}), ...(data.profile || {}) },
                aiAnalysis: existing.aiAnalysis || data.aiAnalysis || null,
                news: (existing.news && existing.news.length > 0) ? existing.news : (data.news || []),
                currentPrice: data.currentPrice || (data.profile && data.profile.currentPrice) || (existing.profile && existing.profile.currentPrice) || (mergedTs[mergedTs.length - 1] ? mergedTs[mergedTs.length - 1].close : 0),
                _backtestFetchedTf: activeTf
            };
            trimClientStockCache();
        } else if (state.stocksData[cleanTicker]) {
            state.stocksData[cleanTicker]._backtestFetchedTf = activeTf;
        }
    } catch (err) {
        console.error('Error fetching stock data for backtesting studio:', err);
    } finally {
        const loadedStock = state.stocksData[cleanTicker];
        if (!loadedStock || !loadedStock.timeseries || loadedStock.timeseries.length === 0) {
            hideBacktestLoading();
        }
    }
}

/**
 * Render Watchlist Asset Selector in Studio matching the General Page Stock Selector
 */
function renderBacktestWatchlistPills() {
    const container = document.getElementById('btWatchlistTabsList');
    if (!container) return;
    container.innerHTML = '';

    // Initialize or load backtestTickers from state/localStorage
    if (!state.backtestTickers || !Array.isArray(state.backtestTickers) || state.backtestTickers.length === 0) {
        let loaded = null;
        try {
            const raw = localStorage.getItem('findashiq_backtest_tickers');
            if (raw) loaded = JSON.parse(raw);
        } catch (e) { }
        if (Array.isArray(loaded) && loaded.length > 0) {
            state.backtestTickers = [...new Set(loaded.map(t => normalizeTicker(t)))];
        } else {
            state.backtestTickers = ['NVDA', 'MSFT', 'AAPL', 'TSLA', 'SPCX', 'PLTR', 'TSM', 'IFX.DE'];
        }
    }

    const currentTicker = normalizeTicker((state.backtestTicker || state.backtestTickers[0] || 'NVDA').toUpperCase().trim());
    if (!state.backtestTicker || state.backtestTicker !== currentTicker) {
        state.backtestTicker = currentTicker;
    }

    // Ensure active backtest ticker is in the list
    if (state.backtestTicker && !state.backtestTickers.some(t => String(t || '').toUpperCase().trim() === state.backtestTicker)) {
        state.backtestTickers.unshift(state.backtestTicker);
        try {
            localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
        } catch (e) { }
    }

    // Deduplicate and assemble tabs
    const seen = new Set();
    const tickers = [];

    state.backtestTickers.forEach(t => {
        const cleanT = String(t || '').toUpperCase().trim();
        if (cleanT && !seen.has(cleanT)) {
            seen.add(cleanT);
            tickers.push(cleanT);
        }
    });

    if (tickers.length === 0) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; color: var(--text-muted); font-size: 0.8rem;">
                <span>No backtest assets selected.</span>
                <button type="button" class="btn-secondary" onclick="openAddStockModal('backtest')" style="padding: 3px 9px; font-size: 0.72rem;">
                    + Search Asset
                </button>
            </div>
        `;
        return;
    }

    const baseCurr = getUserBaseCurrency();

    tickers.forEach(cleanT => {
        const isActive = cleanT === state.backtestTicker;

        // Retrieve stock data from stocksData or watchlistData
        const stock = state.stocksData[cleanT] || state.watchlistData[cleanT] || {};
        const profile = stock.profile || {};
        const compName = getAssetCompanyName(cleanT, stock);
        const instCurr = profile.currency || 'USD';

        // Price & change
        const currentPrice = profile.currentPrice || stock.currentPrice || (stock.timeseries && stock.timeseries.length > 0 ? stock.timeseries[stock.timeseries.length - 1].close : null);
        const changePercent = typeof profile.changePercent === 'number'
            ? profile.changePercent
            : (typeof stock.changePercent === 'number' ? stock.changePercent : null);

        const isBullish = (changePercent || 0) >= 0;
        const isLoading = _isBacktestLoading && cleanT === state.backtestTicker;
        const tab = document.createElement('div');
        tab.className = `ticker-tab bt-asset-tab ${isActive ? 'active' : ''} ${isLoading ? 'is-loading' : ''}`;
        tab.dataset.ticker = cleanT;
        tab.setAttribute('role', 'button');
        tab.setAttribute('tabindex', '0');
        tab.setAttribute('title', `Backtest ${compName} (${cleanT})`);

        let priceHtml = '';
        const displayPrice = typeof currentPrice === 'number' ? formatPrice(currentPrice, instCurr, baseCurr) : null;
        if (displayPrice) {
            priceHtml = `
                <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
                    <span class="ticker-tab-price mono">${displayPrice}</span>
                    ${changePercent !== null ? `
                        <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.68rem; padding: 2px 6px;">
                            ${isBullish ? '+' : ''}${changePercent.toFixed(2)}%
                        </span>
                    ` : ''}
                </div>`;
        }

        tab.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
                <span class="ticker-tab-symbol">${cleanT}</span>
                <span class="ticker-tab-name" title="${escapeHtml(compName)}">${escapeHtml(compName)}</span>
            </div>
            ${priceHtml}
            <button type="button" class="bt-tab-remove-btn" onclick="event.stopPropagation(); removeBacktestTicker('${cleanT}', event);" title="Remove ${cleanT} from Backtest" aria-label="Remove ${cleanT}">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        tab.onclick = () => setBacktestTicker(cleanT);
        tab.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') setBacktestTicker(cleanT); };

        container.appendChild(tab);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
    preloadBacktestTickersQuotes();
}

/**
 * Remove a ticker from Backtest Studio assets
 */
function removeBacktestTicker(ticker, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (!ticker) return;
    const cleanT = ticker.trim().toUpperCase();

    if (!state.backtestTickers) state.backtestTickers = [];
    state.backtestTickers = state.backtestTickers.filter(t => String(t || '').toUpperCase().trim() !== cleanT);

    try {
        localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
    } catch (e) { }

    // If removed ticker was active, switch to next available ticker
    if (state.backtestTicker === cleanT) {
        if (state.backtestTickers.length > 0) {
            state.backtestTicker = state.backtestTickers[0];
            initBacktestStudio(state.backtestTicker);
        } else {
            state.backtestTicker = null;
            const resContainer = document.getElementById('btSummaryCardsGrid');
            if (resContainer) {
                resContainer.innerHTML = '<div class="glass-card" style="grid-column: 1 / -1; padding: 25px; text-align: center; color: var(--text-muted);">No backtest asset selected. Click [Search Asset] above to load a symbol.</div>';
            }
        }
    }

    renderBacktestWatchlistPills();
}

/**
 * Synchronize Backtest Studio Assets with the active Watchlist
 */
function syncBacktestWithWatchlist() {
    const btn = document.getElementById('btnSyncBacktestWatchlist');
    if (btn && btn.classList.contains('syncing')) return;
    if (btn) btn.classList.add('syncing');

    const icon = btn?.querySelector('.sync-icon');
    if (icon) icon.classList.add('spinning');

    // Retrieve active watchlist tickers
    let sourceTickers = [];
    if (Array.isArray(state.watchlistTickers) && state.watchlistTickers.length > 0) {
        sourceTickers = [...state.watchlistTickers];
    } else {
        try {
            const raw = localStorage.getItem('findashiq_watchlist_tickers');
            if (raw) sourceTickers = JSON.parse(raw);
        } catch (e) { }
    }

    if (!Array.isArray(sourceTickers) || sourceTickers.length === 0) {
        sourceTickers = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
    }

    // Deduplicate while preserving order
    const seen = new Set();
    const cleanList = [];
    sourceTickers.forEach(t => {
        const cleanT = String(t || '').toUpperCase().trim();
        if (cleanT && !seen.has(cleanT)) {
            seen.add(cleanT);
            cleanList.push(cleanT);
        }
    });

    state.backtestTickers = cleanList;
    try {
        localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
    } catch (e) { }

    // Ensure active backtest ticker is in the synced list
    if (state.backtestTickers.length > 0) {
        if (!state.backtestTicker || !state.backtestTickers.includes(state.backtestTicker)) {
            state.backtestTicker = state.backtestTickers[0];
            initBacktestStudio(state.backtestTicker);
        }
    }

    // Re-render Backtest Watchlist Pills
    renderBacktestWatchlistPills();

    // Visual feedback: definitively stop spinning and show synced feedback
    setTimeout(() => {
        const currentBtn = document.getElementById('btnSyncBacktestWatchlist');
        const currentIcon = currentBtn?.querySelector('.sync-icon');
        const currentLabel = currentBtn?.querySelector('.sync-label');

        if (currentIcon) currentIcon.classList.remove('spinning');
        if (currentBtn) {
            currentBtn.classList.remove('syncing');
            currentBtn.classList.add('synced');
        }
        if (currentLabel) currentLabel.textContent = 'Synced!';

        setTimeout(() => {
            const b = document.getElementById('btnSyncBacktestWatchlist');
            const ic = b?.querySelector('.sync-icon');
            const l = b?.querySelector('.sync-label');
            if (ic) ic.classList.remove('spinning');
            if (b) b.classList.remove('synced', 'syncing');
            if (l) l.textContent = 'Sync to Watchlist';
        }, 1600);
    }, 450);
}

let _isPreloadingBacktestQuotes = false;
async function preloadBacktestTickersQuotes() {
    if (_isPreloadingBacktestQuotes) return;
    const missing = (state.backtestTickers || []).filter(t => {
        const s = state.stocksData[t] || state.watchlistData[t];
        return !s || (!s.currentPrice && !s.profile?.currentPrice);
    });
    if (missing.length === 0) return;

    _isPreloadingBacktestQuotes = true;
    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: missing,
                period: '1mo',
                interval: '1d',
                phase: 'fast'
            })
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.stocks) {
                Object.keys(data.stocks).forEach(tk => {
                    const existing = state.stocksData[tk] || {};
                    state.stocksData[tk] = {
                        ...existing,
                        ...data.stocks[tk],
                        currentPrice: data.stocks[tk].currentPrice || data.stocks[tk].profile?.currentPrice
                    };
                });
                renderBacktestWatchlistPills();
            }
        }
    } catch (e) {
        console.warn('Preload backtest quotes failed:', e);
    } finally {
        _isPreloadingBacktestQuotes = false;
    }
}

/**
 * Set active backtest ticker and refresh studio
 */
function setBacktestTicker(ticker) {
    if (!ticker) return;
    const cleanT = ticker.toUpperCase().trim();
    if (!state.backtestTickers) state.backtestTickers = [];
    if (!state.backtestTickers.some(t => String(t || '').toUpperCase().trim() === cleanT)) {
        state.backtestTickers.push(cleanT);
        try {
            localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
        } catch (e) { }
    }
    state.backtestTicker = cleanT;

    // Immediately toggle active class and loading spinner in DOM for instant visual response
    document.querySelectorAll('#btWatchlistTabsList .bt-asset-tab').forEach(tab => {
        const isMatch = tab.dataset.ticker === cleanT;
        tab.classList.toggle('active', isMatch);
        if (isMatch) {
            tab.classList.add('is-loading');
        } else {
            tab.classList.remove('is-loading');
        }
    });

    const stock = state.stocksData[cleanT];
    const hasData = stock && stock.timeseries && stock.timeseries.length >= 20;
    showBacktestLoading(
        cleanT,
        hasData ? `Analyzing ${cleanT}...` : `Fetching Data for ${cleanT}...`,
        hasData ? 'Simulating strategy models & rendering equity curve...' : 'Fetching daily historical candles & computing multi-factor indicators...'
    );

    initBacktestStudio(cleanT);
}

/**
 * Apply ticker entered manually
 */
function applyBacktestTicker(ticker) {
    if (!ticker) return;
    setBacktestTicker(ticker);
}

/**
 * Deep-link directly into backtest studio from Deep-Dive stock header or AI Matrix
 */
function launchBacktestFromCurrentStock(ticker = null) {
    const target = (ticker || state.activeTicker || state.backtestTicker || 'NVDA').toUpperCase().trim();
    state.backtestTicker = target;
    switchTopTab('backtest');
}

/**
 * Sync UI control states with current state variables
 */
function syncBacktestControlsUI() {
    // Timeframe buttons
    document.querySelectorAll('#btTimeframeGroup .btn-toggle, #btTimeframeGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tf === state.backtestTimeframe);
    });

    // Mode buttons
    const btnLongOnly = document.getElementById('btModeLongOnly');
    const btnLongShort = document.getElementById('btModeLongShort');
    if (btnLongOnly) btnLongOnly.classList.toggle('active', state.backtestMode === 'long_only');
    if (btnLongShort) btnLongShort.classList.toggle('active', state.backtestMode === 'long_short');

    // Strategy select
    const stratSelect = document.getElementById('btStrategySelect');
    if (stratSelect && state.backtestStrategy) stratSelect.value = state.backtestStrategy;

    // Risk inputs
    const capInput = document.getElementById('btCapitalInput');
    const slInput = document.getElementById('btStopLossInput');
    const tpInput = document.getElementById('btTakeProfitInput');
    const slipInput = document.getElementById('btSlippageInput');
    if (capInput) capInput.value = state.backtestCapital;
    if (slInput) slInput.value = state.backtestStopLoss;
    if (tpInput) tpInput.value = state.backtestTakeProfit;
    if (slipInput) slipInput.value = state.backtestSlippage;

    // Trade markers toggle
    const btnMarkers = document.getElementById('btnToggleTradeMarkers');
    const textMarkers = document.getElementById('btnToggleTradeMarkersText');
    const isMarkersOn = state.backtestShowTradeMarkers === true;
    if (btnMarkers) btnMarkers.classList.toggle('active', isMarkersOn);
    if (textMarkers) textMarkers.textContent = isMarkersOn ? 'Markers: On' : 'Markers: Off';
}

/**
 * Set timeframe (0ms in-memory slice)
 */
function setBacktestTimeframe(tf) {
    if (!tf) return;
    state.backtestTimeframe = tf;
    document.querySelectorAll('#btTimeframeGroup .btn-toggle, #btTimeframeGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tf === tf);
    });
    recalculateCurrentBacktest();
}

/**
 * Toggle execution mode (long-only vs long & short)
 */
function setBacktestMode(mode) {
    if (!mode) return;
    state.backtestMode = mode;
    const btnLongOnly = document.getElementById('btModeLongOnly');
    const btnLongShort = document.getElementById('btModeLongShort');
    if (btnLongOnly) btnLongOnly.classList.toggle('active', mode === 'long_only');
    if (btnLongShort) btnLongShort.classList.toggle('active', mode === 'long_short');
    recalculateCurrentBacktest();
}

/**
 * Change strategy dropdown or matrix table selection
 */
function onBacktestStrategySelectChange(strategy) {
    if (!strategy) return;
    state.backtestStrategy = strategy;
    const stratSelect = document.getElementById('btStrategySelect');
    if (stratSelect) {
        stratSelect.value = strategy;
    }
    recalculateCurrentBacktest();
}
window.onBacktestStrategySelectChange = onBacktestStrategySelectChange;

// -------------------------------------------------------------
// HIGH-PERFORMANCE IN-MEMORY SIMULATION CACHE & INPUT DEBOUNCER
// -------------------------------------------------------------
const _backtestCache = new Map();
const MAX_BACKTEST_CACHE_SIZE = 80;

function getBacktestCacheKey(ticker, tf, strategy, options) {
    return [
        (ticker || state.backtestTicker || 'NVDA').toUpperCase().trim(),
        tf || options?.timeframe || state.backtestTimeframe || '1y',
        strategy,
        options?.initialCapital ?? state.backtestCapital ?? 10000,
        options?.stopLossPct ?? state.backtestStopLoss ?? 5.0,
        options?.takeProfitPct ?? state.backtestTakeProfit ?? 12.0,
        options?.slippagePct ?? state.backtestSlippage ?? 0.10,
        options?.mode ?? state.backtestMode ?? 'long_only'
    ].join('::');
}

let _btDebounceTimer = null;
function debouncedRecalculateBacktest(delay = 150) {
    if (_btDebounceTimer) {
        clearTimeout(_btDebounceTimer);
    }
    _btDebounceTimer = setTimeout(() => {
        _btDebounceTimer = null;
        recalculateCurrentBacktest();
    }, delay);
}
window.debouncedRecalculateBacktest = debouncedRecalculateBacktest;

/**
 * Backwards compatibility bridge
 */
function renderBacktest() {
    recalculateCurrentBacktest();
}

/**
 * Core Orchestrator: Recalculates and updates all UI elements
 */
async function recalculateCurrentBacktest(expectedReqId = null) {
    if (expectedReqId !== null && expectedReqId !== _backtestCurrentRequestId) {
        return;
    }

    // 1. Sync User-Configured Risk Inputs
    const capEl = document.getElementById('btCapitalInput');
    const slEl = document.getElementById('btStopLossInput');
    const tpEl = document.getElementById('btTakeProfitInput');
    const slipEl = document.getElementById('btSlippageInput');
    const stratEl = document.getElementById('btStrategySelect');

    if (capEl) state.backtestCapital = parseFloat(capEl.value) || 10000;
    if (slEl) state.backtestStopLoss = parseFloat(slEl.value) || 5.0;
    if (tpEl) state.backtestTakeProfit = parseFloat(tpEl.value) || 12.0;
    if (slipEl) state.backtestSlippage = parseFloat(slipEl.value) || 0.10;
    if (stratEl) {
        if (state.backtestStrategy) {
            stratEl.value = state.backtestStrategy;
        } else {
            state.backtestStrategy = stratEl.value || 'omni_consensus';
        }
    }

    const ticker = state.backtestTicker || 'NVDA';
    const stock = state.stocksData[ticker];
    const activeTf = (state.backtestTimeframe || '1y').toLowerCase();

    const TF_BARS_MAP = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 1260
    };
    const minRequiredBars = Math.min(TF_BARS_MAP[activeTf] || 252, 1260);

    const isFetchedForTf = stock && (stock._backtestFetchedTf === activeTf || (stock.timeseries && stock.timeseries.length >= minRequiredBars));

    if (!stock || !stock.timeseries || (!isFetchedForTf && stock.timeseries.length < minRequiredBars)) {
        showBacktestLoading(ticker, `Loading ${activeTf.toUpperCase()} history for ${ticker}...`);
        try {
            await loadBacktestStockData(ticker, activeTf);
            if (expectedReqId !== null && expectedReqId !== _backtestCurrentRequestId) return;
            if (state.stocksData[ticker] && state.stocksData[ticker].timeseries && state.stocksData[ticker].timeseries.length >= 5) {
                await recalculateCurrentBacktest(expectedReqId);
            } else {
                hideBacktestLoading();
                const eqContainer = document.getElementById('equityChartContainer');
                if (eqContainer) {
                    eqContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No historical market data returned for ${escapeHtml(ticker)}. Please verify symbol.</div>`;
                }
            }
        } catch (e) {
            hideBacktestLoading();
        }
        return;
    }

    if (!stock || !stock.timeseries || stock.timeseries.length < 5) {
        hideBacktestLoading();
        const eqContainer = document.getElementById('equityChartContainer');
        if (eqContainer) {
            eqContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Insufficient historical market data returned for ${escapeHtml(ticker)} (minimum 5 daily bars required).</div>`;
        }
        return;
    }

    // Update overlay text to let user know charts are rendering
    if (_isBacktestLoading) {
        const titleEl = document.getElementById('btChartsLoadingTitle');
        const subtextEl = document.getElementById('btChartsLoadingSubtext');
        const badgeText = document.getElementById('btHeaderLoadingText');
        if (titleEl) titleEl.textContent = `Rendering Charts for ${escapeHtml(ticker)}...`;
        if (subtextEl) subtextEl.textContent = 'Plotting algorithmic equity curve & net return...';
        if (badgeText) badgeText.textContent = `Rendering ${ticker}...`;
    }

    const options = {
        ticker: ticker,
        timeframe: state.backtestTimeframe || '1y',
        initialCapital: state.backtestCapital,
        stopLossPct: state.backtestStopLoss,
        takeProfitPct: state.backtestTakeProfit,
        slippagePct: state.backtestSlippage,
        mode: state.backtestMode || 'long_only'
    };

    const bt = calculateClientBacktest(stock.timeseries, state.backtestStrategy, options);
    _currentBacktestResult = bt;

    if (!bt) {
        hideBacktestLoading();
        return;
    }

    // 2. Populate Header & Subtitle Context
    const instCurr = stock.profile?.currency || 'USD';
    const baseCurr = getUserBaseCurrency();
    const assetName = getAssetCompanyName(ticker, stock);
    const subtitleEl = document.getElementById('btStudioSubtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `${assetName} (${ticker}) — ${bt.totalBars} Bars Analyzed (${state.backtestTimeframe.toUpperCase()} Slice) — Mode: ${state.backtestMode === 'long_short' ? 'Long & Short (Derivatives)' : 'Long-Only (Spot Equity)'}`;
    }

    // 3. Populate Scorecards Ribbon
    const returnPct = bt.strategyReturnPct || 0;
    const bhPct = bt.buyHoldReturnPct || 0;
    const alpha = bt.alpha || (returnPct - bhPct);
    const isReturnPositive = returnPct >= 0;

    const returnEl = document.getElementById('btReturnVal');
    if (returnEl) {
        returnEl.textContent = `${isReturnPositive ? '+' : ''}${returnPct.toFixed(2)}%`;
        returnEl.style.color = isReturnPositive ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    setText('btBenchVal', `Buy & Hold: ${bhPct >= 0 ? '+' : ''}${bhPct.toFixed(2)}% (Alpha: ${alpha >= 0 ? '+' : ''}${alpha.toFixed(2)}%)`);
    setText('btCapitalVal', formatPrice(bt.finalEquity || 10000, instCurr, baseCurr));

    let positionText = '⚪ Position: In Cash (100%)';
    if (bt.isCurrentlyHolding) {
        positionText = bt.holdingSide === 'SHORT'
            ? '🔴 Position: ACTIVE SHORT (Derivatives)'
            : '🟢 Position: ACTIVE LONG (In Market)';
    }
    setText('btHoldingStatus', positionText);
    setText('btWinRateVal', `${(bt.winRatePct || 0).toFixed(1)}%`);
    setText('btTradesCount', `${bt.totalTrades || 0} Closed Trades (${bt.winningTrades || 0} Wins / ${bt.losingTrades || 0} Losses)`);
    setText('btProfitFactor', `${(bt.profitFactor || 1).toFixed(2)}x`);
    setText('btMaxDrawdown', `Max Drawdown: -${(bt.maxDrawdownPct || 0).toFixed(2)}%`);
    setText('btSharpeVal', bt.sharpeRatio.toFixed(2));
    setText('btSortinoVal', `Sortino Ratio: ${bt.sortinoRatio.toFixed(2)}`);


    // 4. Render Dual-Pane Charts with In-Place Updates & Buy/Sell Annotations
    try {
        // Minimum overlay display time ensures the indicator is visible even when
        // stock data is cached and chart renders complete nearly instantly.
        // Runs in parallel with chart renders — no extra latency when renders take longer.
        await Promise.all([
            renderEquityChart(bt.equityCurve, bt.trades),
            renderDrawdownChart(bt.equityCurve, bt.trades),
            _isBacktestLoading ? new Promise(resolve => setTimeout(resolve, 300)) : Promise.resolve()
        ]);

        if (expectedReqId !== null && expectedReqId !== _backtestCurrentRequestId) {
            return;
        }

        // Give the browser one frame to paint rendered charts before releasing overlay
        await new Promise(resolve => requestAnimationFrame(resolve));
    } catch (renderErr) {
        console.error('[recalculateCurrentBacktest] Chart rendering error:', renderErr);
    } finally {
        if (expectedReqId === null || expectedReqId === _backtestCurrentRequestId) {
            hideBacktestLoading();
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 80);
        }
    }

    // 5. Render Multi-Strategy Comparative Matrix Grid (Non-blocking background frame)
    scheduleMultiStrategyComparison(stock.timeseries, options);
}

/**
 * 0ms Slicing & Algorithmic Strategy Backtesting Simulation Engine
 */
function calculateClientBacktest(rawTimeseries, strategy, options = {}) {
    if (!rawTimeseries || rawTimeseries.length < 5) return null;

    const ticker = options.ticker || state.backtestTicker || 'NVDA';
    const tf = options.timeframe || state.backtestTimeframe || '1y';
    const initialCapital = Number(options.initialCapital || state.backtestCapital || 10000);
    const stopLossPct = Number(options.stopLossPct ?? state.backtestStopLoss ?? 5.0);
    const takeProfitPct = Number(options.takeProfitPct ?? state.backtestTakeProfit ?? 12.0);
    const slippagePct = Number(options.slippagePct ?? state.backtestSlippage ?? 0.10);
    const mode = options.mode || state.backtestMode || 'long_only';

    const cacheKey = getBacktestCacheKey(ticker, tf, strategy, {
        initialCapital, stopLossPct, takeProfitPct, slippagePct, mode
    });

    if (!options.bypassCache && _backtestCache.has(cacheKey)) {
        return _backtestCache.get(cacheKey);
    }

    // 0ms In-Memory Timeframe Slice (~252 trading days/yr)
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
    let entryReason = '';
    const slippageRate = (slippagePct / 100);

    const trades = [];
    const closedTrades = [];
    const equityCurve = [];
    const initialPrice = timeseries[0].close || 1;
    let peakEquity = capital;
    let maxDrawdown = 0;

    timeseries.forEach((p, idx) => {
        const date = p.time;
        const ts = p.timestamp || new Date(date).getTime();
        const close = p.close;
        const high = p.high || close;
        const low = p.low || close;
        if (!close) return;

        const prevP = idx > 0 ? timeseries[idx - 1] : null;
        const prevClose = prevP ? prevP.close : close;

        let exitedThisBar = false;

        // -------------------------------------------------------------
        // 1. INTRA-BAR RISK CHECKS: Stop-Loss & Take-Profit
        // -------------------------------------------------------------
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

        // -------------------------------------------------------------
        // 2. STRATEGY SIGNAL GENERATION
        // -------------------------------------------------------------
        let buySignal = false;
        let sellSignal = false;
        let buyReason = '';
        let sellReason = '';

        if (strategy === 'omni_consensus') {
            // 👑 Omni-Consensus Master Ensemble: All 9 Indicators Unified
            let score = 0;
            let maxScore = 0;

            // 1. AI Conviction Indicator (Weight: 2.0)
            const rawConv = (p.aiConviction !== undefined ? p.aiConviction : p.conviction);
            const convScore = (rawConv !== undefined && rawConv !== null && !isNaN(rawConv))
                ? Number(rawConv)
                : (50 + (p.superTrendDir === 1 ? 20 : -20) + ((p.macdHist || 0) > 0 ? 15 : -15));
            const normConv = Math.max(-1, Math.min(1, (convScore - 50) / 50));
            score += normConv * 2.0;
            maxScore += 2.0;

            // 2. SuperTrend (Weight: 1.5)
            score += (p.superTrendDir === 1 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            // 3. EMA 9 / 21 Cross (Weight: 1.5)
            const ema9 = p.ema9 || p.sma20 || close;
            const ema21 = p.ema21 || p.sma50 || close;
            score += (ema9 > ema21 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            // 4. MACD Momentum & Histogram (Weight: 1.5)
            score += ((p.macdHist || 0) > 0 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            // 5. Chaikin Money Flow (CMF) (Weight: 1.5)
            const cmf = p.cmf || 0;
            score += (cmf > 0.04 ? 1 : (cmf < -0.04 ? -1 : 0)) * 1.5;
            maxScore += 1.5;

            // 6. Bollinger Bands Volatility & Mean-Reversion (Weight: 1.0)
            if (p.bbUpper && p.bbLower) {
                if (close < p.bbLower) score += 1.0;
                else if (close > p.bbUpper) score -= 1.0;
                else score += (close > (p.bbUpper + p.bbLower) / 2 ? 0.3 : -0.3);
            }
            maxScore += 1.0;

            // 7. RSI Relative Strength (Weight: 1.0)
            const rsi = p.rsi || 50;
            score += (rsi > 52 ? 1 : (rsi < 48 ? -1 : 0)) * 1.0;
            maxScore += 1.0;

            // 8. Stochastic Oscillator Cross (Weight: 1.0)
            if (p.stochK && p.stochD) {
                score += (p.stochK > p.stochD ? 1 : -1) * 1.0;
            }
            maxScore += 1.0;

            // 9. VWAP / Volume Regime (Weight: 1.0)
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

        // -------------------------------------------------------------
        // 3. ORDER EXECUTION & POSITION STATE MACHINE
        // -------------------------------------------------------------
        if (mode === 'long_only') {
            if (position === 0 && buySignal && !exitedThisBar) {
                const execPrice = close * (1 + slippageRate);
                const shares = capital / execPrice;
                position = shares;
                entryPrice = execPrice;
                entryDate = date;
                entryReason = buyReason;
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
            // Mode: Long & Short (Bidirectional Derivatives)
            if (position === 0 && !exitedThisBar) {
                if (buySignal) {
                    const execPrice = close * (1 + slippageRate);
                    const shares = capital / execPrice;
                    position = shares;
                    entryPrice = execPrice;
                    entryDate = date;
                    entryReason = buyReason;
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
                    entryReason = sellReason;
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
                // Close Long and Flip to Short
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
                // Close Short and Flip to Long
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

        // -------------------------------------------------------------
        // 4. MARK-TO-MARKET PORTFOLIO VALUATION & DRAWDOWN
        // -------------------------------------------------------------
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
    });

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

    // Calculate Sharpe and Sortino Ratios from daily equity returns
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

    const result = {
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
        profitFactor: profitFactor,
        isCurrentlyHolding: position !== 0,
        holdingSide: position > 0 ? 'LONG' : (position < 0 ? 'SHORT' : 'CASH'),
        trades: trades,
        closedTrades: closedTrades,
        equityCurve: equityCurve
    };

    if (_backtestCache.size >= MAX_BACKTEST_CACHE_SIZE) {
        const oldestKey = _backtestCache.keys().next().value;
        _backtestCache.delete(oldestKey);
    }
    _backtestCache.set(cacheKey, result);

    return result;
}

/**
 * Render Upper Chart: Strategy Portfolio Value vs Buy & Hold Benchmark
 */
/**
 * Helper: Attach SVG titles to annotation markers for tooltips
 */
function attachAnnotationTitles(container, pointAnnotations) {
    setTimeout(() => {
        try {
            const annotationGroups = container.querySelectorAll('.apexcharts-point-annotations g');
            annotationGroups.forEach((g, idx) => {
                const anno = pointAnnotations[idx];
                if (!anno || !anno.tradeData) return;
                const t = anno.tradeData;
                const pnlText = t.pnl !== undefined ? `\nRealized PnL: ${t.pnl >= 0 ? '+' : ''}$${Math.abs(t.pnl).toFixed(2)} (${(t.pnlPct || 0) >= 0 ? '+' : ''}${Number(t.pnlPct || 0).toFixed(2)}%)` : '';
                const tooltipText = `${t.action} @ $${Number(t.price || 0).toFixed(2)}\nDate: ${t.date || ''}\nShares: ${Number(t.shares || 0).toFixed(2)}\nCapital: $${Number(t.capital || 0).toFixed(2)}${pnlText}\nSignal: ${t.reason || 'Technical Trigger'}`;

                let titleEl = g.querySelector('title');
                if (!titleEl) {
                    titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                    g.appendChild(titleEl);
                }
                titleEl.textContent = tooltipText;
                g.style.cursor = 'pointer';
            });
        } catch (e) {
            console.warn('Could not attach SVG annotation titles:', e);
        }
    }, 80);
}

/**
 * Render Upper Chart: Strategy Portfolio Value vs Buy & Hold Benchmark
 */
async function renderEquityChart(equityCurve, trades = []) {
    if (!equityCurve || equityCurve.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#equityChartContainer");
    if (!container) return;

    const themeOpts = getChartThemeDefaults();
    const initialCapital = Number(state.backtestCapital || equityCurve[0]?.strategyEquity || 10000);

    const stratSeries = equityCurve.map(p => ({
        x: p.timestamp || new Date(p.date).getTime(),
        y: Math.round(p.strategyEquity * 100) / 100
    }));

    const bhSeries = equityCurve.map(p => ({
        x: p.timestamp || new Date(p.date).getTime(),
        y: Math.round(p.buyHoldEquity * 100) / 100
    }));

    // Strategy net outcome color: Green (#10b981) for overall profit/gain, Red (#ef4444) for loss
    const finalStratEquity = stratSeries.length > 0 ? stratSeries[stratSeries.length - 1].y : initialCapital;
    const isGain = finalStratEquity >= initialCapital;
    const stratColor = isGain ? '#10b981' : '#ef4444';

    // Update legend dot & header icon dynamically
    const stratDot = document.getElementById('btStratLegendDot');
    if (stratDot) stratDot.style.background = stratColor;
    const eqIcon = document.getElementById('btEquityTitleIcon');
    if (eqIcon) eqIcon.style.color = stratColor;
    const retDot = document.getElementById('btReturnLegendDot');
    if (retDot) retDot.style.background = stratColor;
    const retIcon = document.getElementById('btReturnTitleIcon');
    if (retIcon) retIcon.style.color = stratColor;

    // Dynamic Y-axis scale to ensure strategy and buy&hold curves are always clearly and fully visible
    const allVals = [...stratSeries.map(p => p.y), ...bhSeries.map(p => p.y)].filter(v => typeof v === 'number' && !isNaN(v));
    const dataMin = allVals.length > 0 ? Math.min(...allVals) : 0;
    const dataMax = allVals.length > 0 ? Math.max(...allVals) : 10000;
    const yMin = Math.floor(Math.min(dataMin * 0.95, initialCapital * 0.95));
    const yMax = Math.ceil(Math.max(dataMax * 1.05, initialCapital * 1.05));

    const yaxisConfig = {
        min: yMin,
        max: yMax,
        forceNiceScale: true,
        labels: {
            style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' },
            formatter: val => `$${val ? Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 }) : ''}`
        }
    };

    // Build lookup maps for trades by date and timestamp
    const tradesByDate = new Map();
    const tradesByTs = new Map();
    (trades || []).forEach(t => {
        if (t.date) tradesByDate.set(t.date, t);
        if (t.timestamp) tradesByTs.set(t.timestamp, t);
    });

    // Store current data maps globally for tooltip dynamic lookup
    window._btActiveTradesByDate = tradesByDate;
    window._btActiveTradesByTs = tradesByTs;
    window._btActiveTradesList = trades || [];
    window._btActiveEquityCurve = equityCurve;

    // Build Point Annotations for BUY / SELL executions on the Strategy equity line (only if enabled)
    const equityByTs = new Map();
    stratSeries.forEach(pt => equityByTs.set(pt.x, pt.y));

    const pointAnnotations = [];
    const showMarkers = state.backtestShowTradeMarkers === true;

    if (showMarkers && trades && trades.length > 0) {
        trades.forEach(t => {
            const ts = t.timestamp || new Date(t.date).getTime();
            let matchingEquity = equityByTs.get(ts);
            if (matchingEquity === undefined) {
                const curvePt = equityCurve.find(p => (p.timestamp === ts) || (p.date === t.date));
                matchingEquity = curvePt ? Math.round(curvePt.strategyEquity * 100) / 100 : (t.capital || 10000);
            }

            // Accurate trade badge colors:
            // Long Entry -> Green (#10b981)
            // Short Entry -> Amber (#f59e0b)
            // Exits with Profit -> Green (#10b981)
            // Exits with Loss -> Red (#ef4444)
            let badgeColor = '#10b981';
            const actionUpper = (t.action || '').toUpperCase();
            if (t.side === 'LONG' || actionUpper.includes('BUY')) {
                badgeColor = '#10b981';
            } else if (t.side === 'SHORT' || actionUpper.includes('SHORT')) {
                badgeColor = '#f59e0b';
            }
            if (t.pnl !== undefined && (t.side === 'LONG_EXIT' || t.side === 'SHORT_EXIT' || actionUpper.includes('SELL') || actionUpper.includes('COVER') || actionUpper.includes('CLOSE'))) {
                badgeColor = (t.pnl >= 0) ? '#10b981' : '#ef4444';
            }

            pointAnnotations.push({
                x: ts,
                y: matchingEquity,
                marker: {
                    size: 6,
                    fillColor: badgeColor,
                    strokeColor: '#ffffff',
                    strokeWidth: 2,
                    shape: 'circle',
                    radius: 3,
                    hover: { size: 8.5 }
                },
                tradeData: t
            });
        });
    }

    // Cleanly recreate chart on data/strategy update to guarantee stroke widths, colors, and series rendering
    if (state.charts.equity) {
        try { state.charts.equity.destroy(); } catch (e) { console.warn(e); }
        state.charts.equity = null;
    }
    container.innerHTML = '';

    const options = {
        series: [
            { name: 'Strategy Portfolio ($)', data: stratSeries },
            { name: 'Buy & Hold Benchmark ($)', data: bhSeries }
        ],
        chart: {
            id: 'equityCurveChart',
            group: 'backtest_studio',
            type: 'line',
            height: 290,
            background: 'transparent',
            toolbar: { show: true, tools: { zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
            animations: { enabled: false }
        },
        annotations: {
            points: pointAnnotations
        },
        theme: { mode: themeOpts.themeMode },
        colors: [stratColor, '#64748b'],
        stroke: { width: [3.5, 2.0], dashArray: [0, 4], curve: 'smooth' },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM \'yy', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: yaxisConfig,
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: {
            theme: themeOpts.tooltipTheme,
            shared: true,
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const curve = window._btActiveEquityCurve || equityCurve;
                if (dataPointIndex < 0 || !curve || !curve[dataPointIndex]) return '';
                const p = curve[dataPointIndex];
                const stratVal = (p.strategyEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const bhVal = (p.buyHoldEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const d = new Date(p.timestamp || p.date);
                const dateStr = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

                // Check if an order was executed on this date
                const dateMap = window._btActiveTradesByDate || tradesByDate;
                const tsMap = window._btActiveTradesByTs || tradesByTs;
                const trade = dateMap?.get(p.date) || tsMap?.get(p.timestamp);
                let tradeHtml = '';

                if (trade) {
                    const actionUpper = (trade.action || '').toUpperCase();
                    let isTradeProfit = true;
                    if (trade.pnl !== undefined) {
                        isTradeProfit = (trade.pnl >= 0);
                    } else if (actionUpper.includes('BUY') || trade.side === 'LONG') {
                        isTradeProfit = true;
                    } else if (actionUpper.includes('SHORT')) {
                        isTradeProfit = true;
                    }
                    const isTradeBuy = trade.side === 'LONG' || actionUpper.includes('BUY');
                    const tradeColor = isTradeProfit ? '#10b981' : '#ef4444';
                    const tradeBg = isTradeProfit ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)';
                    const tradeBorder = isTradeProfit ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';

                    let pnlRow = '';
                    if (trade.pnl !== undefined && (trade.side === 'LONG_EXIT' || trade.side === 'SHORT_EXIT' || actionUpper.includes('SELL') || actionUpper.includes('COVER') || actionUpper.includes('CLOSE'))) {
                        const isPnlPos = (trade.pnl || 0) >= 0;
                        const pnlColor = isPnlPos ? '#10b981' : '#ef4444';
                        pnlRow = `
                            <div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; font-weight: 800; color: ${pnlColor}; font-size: 0.76rem;" class="mono">
                                <span>Realized PnL:</span>
                                <span>${isPnlPos ? '+' : ''}$${Math.abs(trade.pnl).toFixed(2)} (${(trade.pnlPct || 0) >= 0 ? '+' : ''}${Number(trade.pnlPct || 0).toFixed(2)}%)</span>
                            </div>
                        `;
                    }

                    tradeHtml = `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); background: ${tradeBg}; border: 1px solid ${tradeBorder}; border-radius: 6px; padding: 8px 10px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 800; font-size: 0.78rem;">
                                <span style="color: ${tradeColor}; display: flex; align-items: center; gap: 4px;">
                                    ${isTradeBuy ? '▲' : '▼'} ${escapeHtml(trade.action || 'ORDER')}
                                </span>
                                <span class="mono" style="color: var(--text-primary);">$${Number(trade.price || 0).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;" class="mono">
                                <span>${Number(trade.shares || 0).toFixed(2)} shares</span>
                                <span>Cap: $${Number(trade.capital || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            ${pnlRow}
                            ${trade.reason ? `
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px; line-height: 1.3; font-style: italic;">
                                    ${escapeHtml(trade.reason)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }

                return `
                    <div style="background: ${themeOpts.themeMode === 'light' ? '#ffffff' : '#0f172a'}; border: 1px solid ${themeOpts.themeMode === 'light' ? '#cbd5e1' : 'rgba(255,255,255,0.15)'}; border-radius: 8px; padding: 10px 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-family: Inter, system-ui, sans-serif; min-width: 220px; max-width: 300px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">
                            <span>${dateStr}</span>
                            ${trade ? `<span style="background: ${(trade.pnl !== undefined ? trade.pnl >= 0 : (trade.action && (trade.action.includes('BUY') || trade.side === 'LONG'))) ? '#059669' : '#dc2626'}; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800;">ORDER EXECUTED</span>` : ''}
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 0.76rem; margin-bottom: 3px;">
                            <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 5px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${stratColor}; display: inline-block;"></span>
                                Strategy Portfolio:
                            </span>
                            <strong class="mono" style="color: ${stratColor};">$${stratVal}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 0.76rem;">
                            <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 5px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b; display: inline-block;"></span>
                                Buy &amp; Hold:
                            </span>
                            <span class="mono" style="color: #94a3b8;">$${bhVal}</span>
                        </div>
                        ${tradeHtml}
                    </div>
                `;
            }
        }
    };

    state.charts.equity = new ApexCharts(container, options);
    await state.charts.equity.render();
    attachAnnotationTitles(container, pointAnnotations);
}

/**
 * Render Lower Chart: Performance Relative to Initial Investment (% Net Return vs Starting Capital)
 */
async function renderDrawdownChart(equityCurve, trades = []) {
    if (!equityCurve || equityCurve.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#drawdownChartContainer");
    if (!container) return;

    const themeOpts = getChartThemeDefaults();
    const initialCapital = Number(state.backtestCapital || equityCurve[0]?.strategyEquity || 10000);

    const stratSeries = equityCurve.map(p => {
        const retPct = initialCapital > 0 ? ((p.strategyEquity - initialCapital) / initialCapital) * 100 : 0;
        return {
            x: p.timestamp || new Date(p.date).getTime(),
            y: Math.round(retPct * 100) / 100
        };
    });

    const bhSeries = equityCurve.map(p => {
        const retPct = initialCapital > 0 ? ((p.buyHoldEquity - initialCapital) / initialCapital) * 100 : 0;
        return {
            x: p.timestamp || new Date(p.date).getTime(),
            y: Math.round(retPct * 100) / 100
        };
    });

    // Strategy net outcome color: Green for overall gain / positive return, Red for loss / negative return
    const finalStratReturn = stratSeries.length > 0 ? stratSeries[stratSeries.length - 1].y : 0;
    const isGain = finalStratReturn >= 0;
    const stratColor = isGain ? '#10b981' : '#ef4444';
    const stratGradientTo = isGain ? '#059669' : '#b91c1c';

    // Compute dynamic Y-axis bounds ensuring 0.0% Initial Capital baseline is visible and positive gains are fully shown
    const allVals = [...stratSeries.map(p => p.y), ...bhSeries.map(p => p.y)].filter(v => typeof v === 'number' && !isNaN(v));
    const dataMin = allVals.length > 0 ? Math.min(...allVals) : 0;
    const dataMax = allVals.length > 0 ? Math.max(...allVals) : 0;

    // Ensure comfortable headroom for positive winnings (+%) and negative drawdowns (-%) around 0.0%
    const yMin = Math.floor(Math.min(-5, dataMin < 0 ? dataMin * 1.15 : -5));
    const yMax = Math.ceil(Math.max(5, dataMax > 0 ? dataMax * 1.15 : 5));

    const yaxisConfig = {
        min: yMin,
        max: yMax,
        forceNiceScale: true,
        labels: {
            style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' },
            formatter: val => `${val > 0 ? '+' : ''}${val !== null && val !== undefined ? Number(val).toFixed(1) : '0'}%`
        }
    };

    // Point Annotations for Trade Executions if enabled
    const showMarkers = state.backtestShowTradeMarkers === true;
    const activeTrades = trades && trades.length > 0 ? trades : (window._btActiveTradesList || []);
    const pointAnnotations = [];

    const stratByTs = new Map();
    stratSeries.forEach(pt => stratByTs.set(pt.x, pt.y));

    if (showMarkers && activeTrades && activeTrades.length > 0) {
        activeTrades.forEach(t => {
            const ts = t.timestamp || new Date(t.date).getTime();
            let matchingY = stratByTs.get(ts);
            if (matchingY === undefined) {
                const curvePt = equityCurve.find(p => (p.timestamp === ts) || (p.date === t.date));
                const eq = curvePt ? curvePt.strategyEquity : (t.capital || initialCapital);
                matchingY = initialCapital > 0 ? Math.round(((eq - initialCapital) / initialCapital) * 10000) / 100 : 0;
            }

            let badgeColor = '#10b981';
            const actionUpper = (t.action || '').toUpperCase();
            if (t.side === 'LONG' || actionUpper.includes('BUY')) {
                badgeColor = '#10b981';
            } else if (t.side === 'SHORT' || actionUpper.includes('SHORT')) {
                badgeColor = '#f59e0b';
            }
            if (t.pnl !== undefined && (t.side === 'LONG_EXIT' || t.side === 'SHORT_EXIT' || actionUpper.includes('SELL') || actionUpper.includes('COVER') || actionUpper.includes('CLOSE'))) {
                badgeColor = (t.pnl >= 0) ? '#10b981' : '#ef4444';
            }

            pointAnnotations.push({
                x: ts,
                y: matchingY,
                marker: {
                    size: 5.5,
                    fillColor: badgeColor,
                    strokeColor: '#ffffff',
                    strokeWidth: 2,
                    shape: 'circle',
                    radius: 3,
                    hover: { size: 8 }
                },
                tradeData: t
            });
        });
    }

    const annotationsConfig = {
        yaxis: [
            {
                y: 0,
                borderColor: 'rgba(148, 163, 184, 0.45)',
                strokeDashArray: 4,
                label: {
                    borderColor: 'transparent',
                    style: {
                        color: '#94a3b8',
                        background: themeOpts.themeMode === 'light' ? 'rgba(241, 245, 249, 0.85)' : 'rgba(15, 23, 42, 0.85)',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 600
                    },
                    text: '0.0% Initial Capital'
                }
            }
        ],
        points: pointAnnotations
    };

    if (state.charts.drawdown) {
        try { state.charts.drawdown.destroy(); } catch (e) { console.warn(e); }
        state.charts.drawdown = null;
    }
    container.innerHTML = '';

    const options = {
        series: [
            { name: 'Strategy (% vs Initial)', data: stratSeries },
            { name: 'Buy & Hold (% vs Initial)', data: bhSeries }
        ],
        chart: {
            id: 'relativeReturnCurveChart',
            group: 'backtest_studio',
            type: 'area',
            height: 200,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: [stratColor, '#64748b'],
        plotOptions: {
            area: {
                fillTo: 'origin'
            }
        },
        fill: {
            type: ['gradient', 'none'],
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: [stratGradientTo],
                inverseColors: false,
                opacityFrom: 0.35,
                opacityTo: 0.04,
                stops: [0, 100]
            }
        },
        stroke: { width: [2.5, 1.8], dashArray: [0, 4], curve: 'smooth' },
        annotations: annotationsConfig,
        xaxis: {
            type: 'datetime',
            labels: { show: false },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: yaxisConfig,
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: {
            theme: themeOpts.tooltipTheme,
            shared: true,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: val => `${val > 0 ? '+' : ''}${val !== null && val !== undefined ? Number(val).toFixed(2) : '0.00'}% vs Initial`
            }
        }
    };

    state.charts.drawdown = new ApexCharts(container, options);
    await state.charts.drawdown.render();
    attachAnnotationTitles(container, pointAnnotations);
}

function toggleBacktestTradeMarkers() {
    state.backtestShowTradeMarkers = !state.backtestShowTradeMarkers;
    try {
        localStorage.setItem('findashiq_bt_trade_markers', state.backtestShowTradeMarkers ? '1' : '0');
    } catch (e) { }

    const btn = document.getElementById('btnToggleTradeMarkers');
    const text = document.getElementById('btnToggleTradeMarkersText');
    if (btn) btn.classList.toggle('active', state.backtestShowTradeMarkers);
    if (text) text.textContent = state.backtestShowTradeMarkers ? 'Markers: On' : 'Markers: Off';

    if (window._btActiveEquityCurve) {
        renderEquityChart(window._btActiveEquityCurve, window._btActiveTradesList || []);
        renderDrawdownChart(window._btActiveEquityCurve, window._btActiveTradesList || []);
    }
}

// Alias for semantic clarity
const renderRelativeReturnChart = renderDrawdownChart;

// -------------------------------------------------------------
// WEB WORKER & DEFERRED BENCHMARK MATRIX ENGINE (PHASES 2 & 3)
// -------------------------------------------------------------
let _backtestWorker = null;
let _backtestWorkerRequestId = 0;

function getBacktestWorker() {
    if (_backtestWorker !== null) return _backtestWorker;
    if (typeof Worker !== 'undefined') {
        try {
            const ver = window.__ASSET_VERSION__ || (Date.now().toString());
            _backtestWorker = new Worker(`/static/js/backtest_worker.js?v=${encodeURIComponent(ver)}`);
        } catch (e) {
            console.warn('[BacktestStudio] Web Worker init failed, using main-thread fallback:', e);
            _backtestWorker = false;
        }
    } else {
        _backtestWorker = false;
    }
    return _backtestWorker;
}

/**
 * Schedule non-blocking execution of the 8-strategy matrix
 */
function scheduleMultiStrategyComparison(timeseries, options) {
    const tbody = document.getElementById('btBenchmarkMatrixBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="matrix-loading-row">
                <td colspan="11" style="text-align: center; padding: 22px; color: var(--text-muted); font-size: 0.8rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <div class="bt-spinner-ring"></div>
                        <span>Simulating 8 comparative strategies for ${escapeHtml(options.ticker || state.backtestTicker || '')}...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    // Lightweight worker payload transfer optimization:
    // 1. Slice timeseries to the active timeframe (e.g. 252 bars for 1y instead of sending 11,500 bars)
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
    const tfKey = (options.timeframe || state.backtestTimeframe || '1y').toLowerCase();
    const barsLimit = TF_BARS[tfKey] || 252;
    const sliced = (timeseries && timeseries.length > barsLimit) ? timeseries.slice(-barsLimit) : (timeseries || []);

    // 2. Strip all unused indicator fields (50 fields down to ~18 fields)
    const lightweightTimeseries = sliced.map(p => ({
        time: p.time,
        timestamp: p.timestamp,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
        superTrendDir: p.superTrendDir,
        macdHist: p.macdHist,
        ema9: p.ema9,
        ema21: p.ema21,
        sma20: p.sma20,
        sma50: p.sma50,
        cmf: p.cmf,
        bbUpper: p.bbUpper,
        bbLower: p.bbLower,
        rsi: p.rsi,
        stochK: p.stochK,
        stochD: p.stochD,
        vwap: p.vwap,
        conviction: p.aiConviction !== undefined ? p.aiConviction : p.conviction,
        aiConviction: p.aiConviction !== undefined ? p.aiConviction : p.conviction
    }));

    const worker = getBacktestWorker();
    if (worker) {
        const requestId = ++_backtestWorkerRequestId;
        let timeoutId = setTimeout(() => {
            if (_backtestWorkerRequestId === requestId) {
                console.warn('[BacktestStudio] Worker matrix timeout, falling back to main thread');
                renderMultiStrategyComparison(lightweightTimeseries, options);
            }
        }, 3000);

        worker.onmessage = function (e) {
            const data = e.data || {};
            if (data.action === 'matrix_result') {
                if (data.requestId === requestId) {
                    clearTimeout(timeoutId);
                    renderBenchmarkMatrixFromResults(data.results);
                }
            }
        };
        worker.onerror = function (err) {
            if (_backtestWorkerRequestId === requestId) {
                clearTimeout(timeoutId);
                console.warn('[BacktestWorker] Worker error, falling back to main thread:', err);
                renderMultiStrategyComparison(lightweightTimeseries, options);
            }
        };
        try {
            worker.postMessage({
                action: 'simulate_matrix',
                timeseries: lightweightTimeseries,
                options: options,
                requestId: requestId
            });
        } catch (postErr) {
            clearTimeout(timeoutId);
            console.warn('[BacktestWorker] Worker postMessage failed, falling back to main thread:', postErr);
            renderMultiStrategyComparison(lightweightTimeseries, options);
        }
    } else {
        // Deferred main-thread execution so primary charts & scorecards paint first
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => renderMultiStrategyComparison(lightweightTimeseries, options), { timeout: 100 });
        } else {
            setTimeout(() => renderMultiStrategyComparison(lightweightTimeseries, options), 0);
        }
    }
}

/**
 * Render Side-by-Side Multi-Strategy Comparative Matrix Grid (Synchronous or Fallback)
 */
function renderMultiStrategyComparison(timeseries, options) {
    if (!timeseries || timeseries.length < 5) return;

    const STRATEGIES = [
        { key: 'omni_consensus', name: '👑 Omni-Consensus Master Ensemble', desc: 'All 9 Indicators Unified' },
        { key: 'ai_conviction', name: '🤖 AI Conviction Model', desc: 'Dynamic Thresholding' },
        { key: 'supertrend', name: '📈 SuperTrend Trend Follower', desc: 'ATR Volatility Trailing' },
        { key: 'ema_cross', name: '⚡ EMA 9 / 21 Cross', desc: 'Golden / Death Cross' },
        { key: 'bollinger', name: '🎯 Bollinger Bands', desc: '20-day 2σ Mean Reversion' },
        { key: 'momentum', name: '🌊 MACD + RSI Dual Momentum', desc: 'Trend & Velocity' },
        { key: 'stochastic', name: '⚡ Stochastic Oscillator', desc: '14, 3, 3 Momentum Cross' },
        { key: 'cmf_breakout', name: '💧 CMF Volume Breakout', desc: 'Chaikin Money Flow' }
    ];

    const results = [];
    STRATEGIES.forEach(s => {
        const sim = calculateClientBacktest(timeseries, s.key, options);
        if (sim) {
            results.push({ ...s, sim: sim });
        }
    });

    results.sort((a, b) => b.sim.strategyReturnPct - a.sim.strategyReturnPct);
    renderBenchmarkMatrixFromResults(results);
}

/**
 * Render Benchmark Matrix DOM using DocumentFragment for maximum performance
 */
function renderBenchmarkMatrixFromResults(results) {
    const tbody = document.getElementById('btBenchmarkMatrixBody');
    if (!tbody || !results || results.length === 0) return;

    const fragment = document.createDocumentFragment();

    results.forEach(item => {
        const isCurrent = item.key === state.backtestStrategy;
        const returnPct = item.sim.strategyReturnPct || 0;
        const alpha = item.sim.alpha || 0;
        const isReturnPos = returnPct >= 0;
        const isAlphaPos = alpha >= 0;

        const tr = document.createElement('tr');
        if (isCurrent) tr.className = 'benchmark-row-active';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 700; color: ${isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)'}; display: flex; align-items: center; gap: 6px;">
                    ${escapeHtml(item.name)}
                    ${isCurrent ? '<span class="badge-pill badge-bullish" style="font-size: 0.65rem; padding: 2px 6px;">Active</span>' : ''}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(item.desc)}</div>
            </td>
            <td class="mono" style="font-size: 0.78rem;">${state.backtestMode === 'long_short' ? 'Long/Short' : 'Long-Only'}</td>
            <td class="mono" style="font-weight: 800; color: ${isReturnPos ? 'var(--accent-green)' : 'var(--accent-red)'};">
                ${isReturnPos ? '+' : ''}${returnPct.toFixed(2)}%
            </td>
            <td class="mono" style="font-weight: 700; color: ${isAlphaPos ? 'var(--accent-green)' : 'var(--accent-red)'};">
                ${isAlphaPos ? '+' : ''}${alpha.toFixed(2)}%
            </td>
            <td class="mono" style="font-weight: 700;">${(item.sim.winRatePct || 0).toFixed(1)}%</td>
            <td class="mono">${(item.sim.profitFactor || 1).toFixed(2)}x</td>
            <td class="mono" style="color: var(--accent-cyan); font-weight: 700;">${(item.sim.sharpeRatio || 0).toFixed(2)}</td>
            <td class="mono">${(item.sim.sortinoRatio || 0).toFixed(2)}</td>
            <td class="mono" style="color: var(--accent-red); font-weight: 700;">-${(item.sim.maxDrawdownPct || 0).toFixed(2)}%</td>
            <td class="mono" style="color: var(--text-secondary);">${item.sim.totalTrades || 0}</td>
            <td>
                ${isCurrent
                ? '<span class="badge-pill badge-neutral" style="font-size: 0.72rem;">Selected</span>'
                : `<button type="button" class="btn-toggle" onclick="onBacktestStrategySelectChange('${item.key}')" style="padding: 4px 10px; font-size: 0.75rem;">Select</button>`
            }
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

/**
 * Export Backtest Trades to CSV File
 */
function exportBacktestTradesCSV() {
    if (!_currentBacktestResult || !_currentBacktestResult.trades || _currentBacktestResult.trades.length === 0) {
        alert('No trades available to export. Run a backtest simulation first.');
        return;
    }

    const ticker = state.backtestTicker || 'NVDA';
    const strat = state.backtestStrategy || 'omni_consensus';
    const tf = state.backtestTimeframe || '1y';
    const trades = _currentBacktestResult.trades;

    const headers = ['Trade_ID', 'Action', 'Side', 'Entry_Date', 'Exit_Date', 'Execution_Price', 'Shares', 'PnL_USD', 'PnL_Percent', 'Portfolio_Capital', 'Reason'];
    const rows = trades.map(t => [
        t.id,
        `"${(t.action || '').replace(/"/g, '""')}"`,
        `"${(t.side || '').replace(/"/g, '""')}"`,
        t.entryDate || t.date || '',
        t.entryDate ? t.date : '',
        (t.price || 0).toFixed(2),
        (t.shares || 0).toFixed(4),
        (t.pnl || 0).toFixed(2),
        (t.pnlPct || 0).toFixed(2),
        (t.capital || 0).toFixed(2),
        `"${(t.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinDashIQ_Backtest_${ticker}_${strat}_${tf}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// FORWARD PAPER TRADING ENGINE (CLOUD-SYNCED & PERSISTENT)
// -------------------------------------------------------------

/**
 * Get user-isolated localStorage key for paper trades
 */