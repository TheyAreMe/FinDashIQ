function switchTopTab(tabKey) {
    state.activeTopTab = tabKey;

    document.querySelectorAll('.top-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.topTab === tabKey);
    });

    document.querySelectorAll('.top-view-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `topView-${tabKey}`);
    });

    if (tabKey === 'terminal') {
        ensureApexChartsLoaded(); // Preload charts in background

        // Parse current input tickers or fallback to active ticker / default
        const inputVal = document.getElementById('tickerInput')?.value.trim();
        let inputTickers = inputVal ? inputVal.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) : [];
        if (inputTickers.length === 0) {
            inputTickers = [state.activeTicker || 'AAPL'];
            const inputEl = document.getElementById('tickerInput');
            if (inputEl) inputEl.value = inputTickers.join(', ');
        }

        if (!state.activeTicker || !inputTickers.includes(state.activeTicker)) {
            state.activeTicker = inputTickers[0];
        }

        // Render stock selector tabs immediately so active tab is visible right away
        renderStockSelector(inputTickers);

        const currentStock = state.stocksData[state.activeTicker];
        const hasTimeseries = currentStock && !currentStock.error && currentStock.timeseries && currentStock.timeseries.length > 0;

        if (hasTimeseries) {
            renderActiveStock();
            if (!currentStock.aiAnalysis && !_isAnalyzing) {
                handleAnalyze();
            }
        } else {
            if (currentStock && currentStock.profile) {
                renderActiveStock();
            }
            if (!_isAnalyzing) {
                handleAnalyze();
            }
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    } else if (tabKey === 'watchlist') {
        renderWatchlist();
    } else if (tabKey === 'scanner') {
        if (state.scannerResults && state.scannerResults.opportunities && state.scannerResults.opportunities.length > 0) {
            const searchInput = document.getElementById('scannerSearchQuery');
            if (searchInput && searchInput.value.trim()) {
                handleScannerSearchFilter(searchInput.value);
            } else {
                renderScannerResults(state.scannerResults.opportunities);
            }
            updateScannerTimingDisplay(state.scannerResults);
            syncScannerAdminControls(state.scannerResults);

            // Always check for background updates when opening tab if due or stale (>30s)
            const nowSec = Date.now() / 1000;
            const nextEpoch = state.scannerResults.nextScanEpoch || 0;
            const lastEpoch = state.scannerResults.timestamp_epoch || 0;
            if (nowSec >= nextEpoch || (nowSec - lastEpoch) > 30) {
                silentRefreshScannerCache();
            }
        } else {
            initScanner();
        }
    } else if (tabKey === 'backtest') {
        ensureApexChartsLoaded();
        renderPaperTrades();
        loadPaperTrades();
        initBacktestStudio();
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    } else if (tabKey === 'notifications') {
        populateAlertTickerOptions();
        renderAlerts();
    }

    lucide.createIcons();
}

// =============================================================
// WATCHLIST RECOMMENDATION HUB ENGINE (3-STAGE PROGRESSIVE HYDRATION)
// =============================================================

function saveWatchlistLocalCache(data) {
    try {
        localStorage.setItem('findashiq_watchlist_cache', JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    } catch (e) { }
}

function loadWatchlistLocalCache() {
    try {
        const raw = localStorage.getItem('findashiq_watchlist_cache');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.data || null;
    } catch (e) {
        return null;
    }
}

function saveWatchlistTickersLocal(tickers) {
    try {
        if (Array.isArray(tickers) && tickers.length > 0) {
            localStorage.setItem('findashiq_watchlist_tickers', JSON.stringify(tickers));
        }
    } catch (e) { }
}

function loadWatchlistTickersLocal() {
    try {
        const raw = localStorage.getItem('findashiq_watchlist_tickers');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(t => normalizeTicker(t)) : null;
    } catch (e) {
        return null;
    }
}

function setWatchlistSyncStatus(status, text) {
    const el = document.getElementById('watchlistSyncStatusText');
    const dot = document.getElementById('watchlistSyncDot');
    const badge = document.getElementById('watchlistSyncBadge');
    if (!el) return;

    el.textContent = text;
    if (badge) {
        badge.className = `sync-status-badge ${status}`;
    }
    if (dot) {
        dot.className = `sync-status-dot ${status}`;
    }
}

async function initWatchlist() {
    // Stage 0: Instant 0ms Local Cache Hydration
    if (!state.watchlistData || Object.keys(state.watchlistData).length === 0) {
        const cached = loadWatchlistLocalCache();
        if (cached && Object.keys(cached).length > 0) {
            state.watchlistData = cached;
        }
    }

    if (state.watchlistData && Object.keys(state.watchlistData).length > 0) {
        renderWatchlist();
        setWatchlistSyncStatus('syncing', 'Restored from cache • Syncing live...');
    } else {
        const grid = document.getElementById('watchlistCardsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
                    <div class="spinner" style="margin: 0 auto 16px auto;"></div>
                    <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Loading Watchlist Recommendations...</div>
                    <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">Initializing user assets, technical indicators, and AI synthesis...</div>
                </div>
            `;
        }
    }

    const watchlistTags = document.getElementById('watchlistTagsList');
    if (watchlistTags) watchlistTags.innerHTML = '';

    try {
        const res = await fetch('/api/watchlist');
        if (res.ok) {
            const data = await res.json();
            if (data.tickers && data.tickers.length > 0) {
                state.watchlistTickers = data.tickers;
                saveWatchlistTickersLocal(data.tickers);
            }
        }
    } catch (e) {
        state.watchlistTickers = loadWatchlistTickersLocal() || state.watchlistTickers || ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
    }

    renderWatchlistTags();
    renderWatchlist();
    await fetchWatchlistAnalysis();
}

async function saveWatchlistServer() {
    saveWatchlistTickersLocal(state.watchlistTickers);
    try {
        await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tickers: state.watchlistTickers })
        });
    } catch (e) {
        console.error('Failed to save watchlist to server:', e);
    }
}

async function fetchWatchlistAnalysis(forceRefresh = false) {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) errorAlert.style.display = 'none';

    setWatchlistSyncStatus('syncing', 'Syncing live quotes...');

    try {
        // =========================================================
        // STAGE 1: Fast-Path Hydration (Quotes, Sparklines, Stance in <100ms)
        // =========================================================
        const fastResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: state.watchlistTickers,
                period: '1mo',
                interval: '1d',
                forceRefresh: forceRefresh,
                phase: 'fast'
            })
        });

        if (fastResponse.ok) {
            const fastData = await fastResponse.json();
            if (fastData && fastData.stocks) {
                // Merge fast-path data into state seamlessly without wiping existing timeseries / AI
                Object.keys(fastData.stocks).forEach(tk => {
                    const existing = state.watchlistData[tk] || {};
                    state.watchlistData[tk] = {
                        ...existing,
                        ...fastData.stocks[tk],
                        timeseries: (existing.timeseries && existing.timeseries.length > 0 && typeof existing.timeseries[0]?.open === 'number') ? existing.timeseries : (fastData.stocks[tk].timeseries || []),
                        aiAnalysis: existing.aiAnalysis || fastData.stocks[tk].aiAnalysis || null
                    };
                });

                saveWatchlistLocalCache(state.watchlistData);
                renderWatchlist();
            }
        }

        // =========================================================
        // STAGE 2: Full Background Hydration (Backtests, Oscillators, AI Synthesis)
        // =========================================================
        setWatchlistSyncStatus('syncing', 'Calculating full indicators & AI scenarios...');

        const fullResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: state.watchlistTickers,
                period: '6mo',
                interval: '1d',
                forceRefresh: forceRefresh,
                phase: 'full',
                apiKey: state.aiSettings.apiKey,
                model: state.aiSettings.model
            })
        });

        if (fullResponse.ok) {
            const fullData = await fullResponse.json();
            if (fullData && fullData.stocks) {
                // Merge full-path data into state
                Object.keys(fullData.stocks).forEach(tk => {
                    state.watchlistData[tk] = {
                        ...(state.watchlistData[tk] || {}),
                        ...fullData.stocks[tk]
                    };
                });
                saveWatchlistLocalCache(state.watchlistData);
                renderWatchlist();
                evaluateAlertRules(state.watchlistData);
                setWatchlistSyncStatus('synced', 'Live & Synced (Just now)');
            }
        } else {
            setWatchlistSyncStatus('partial', 'Live Quotes Active (Full metrics cached)');
        }

    } catch (err) {
        console.warn('Watchlist progressive fetch notice:', err);
        // If we already have cached/fast data rendered, do NOT clear the cards!
        if (Object.keys(state.watchlistData).length > 0) {
            setWatchlistSyncStatus('offline', 'Offline • Showing Cached Data');
            renderWatchlist();
        } else {
            setWatchlistSyncStatus('error', 'Connection Error');
            const grid = document.getElementById('watchlistCardsGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="glass-card" style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--accent-red);">
                        <div style="font-weight: 700; margin-bottom: 6px;">Unable to reach market data servers</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Please verify your network connection and retry.</div>
                    </div>
                `;
            }
        }
    } finally {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function setWatchlistViewMode(mode) {
    const cleanMode = (mode === 'table') ? 'table' : 'cards';
    state.watchlistViewMode = cleanMode;
    try {
        localStorage.setItem('findashiq_watchlist_view', cleanMode);
    } catch (e) { }

    // Persist to user profile if logged in
    if (state.user) {
        state.user.watchlistViewMode = cleanMode;
        try {
            fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watchlistViewMode: cleanMode })
            }).catch(() => { });
        } catch (e) { }
    }

    renderWatchlist();
}

function renderWatchlist() {
    try {
        if (!state.watchlistTickers) state.watchlistTickers = [];
        const cardsGrid = document.getElementById('watchlistCardsGrid');
        const tableWrapper = document.getElementById('watchlistTableWrapper');
        const countBadge = document.getElementById('topWatchlistCount');
        if (countBadge) countBadge.textContent = `${state.watchlistTickers.length} Stocks`;
        populateAlertTickerOptions();
        renderBacktestWatchlistPills();

        // Ensure toggle buttons state matches active mode
        const btnCards = document.getElementById('btnWatchlistViewCards');
        const btnTable = document.getElementById('btnWatchlistViewTable');
        if (btnCards && btnTable) {
            btnCards.classList.toggle('active', state.watchlistViewMode === 'cards');
            btnTable.classList.toggle('active', state.watchlistViewMode === 'table');
        }

        if (state.watchlistViewMode === 'table') {
            if (cardsGrid) cardsGrid.style.display = 'none';
            if (tableWrapper) tableWrapper.style.display = 'block';
            renderWatchlistTable();
        } else {
            if (tableWrapper) tableWrapper.style.display = 'none';
            if (cardsGrid) cardsGrid.style.display = 'grid';
            renderWatchlistCards();
        }
    } catch (err) {
        console.error('[renderWatchlist] Unexpected error:', err);
        // Failsafe: clear spinner and show error state so the page is not stuck
        const cardsGrid = document.getElementById('watchlistCardsGrid');
        if (cardsGrid && cardsGrid.querySelector('.spinner')) {
            cardsGrid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 0.85rem; color: var(--accent-red); margin-bottom: 8px;">⚠️ Watchlist render error</div>
                    <div style="font-size: 0.78rem;">${err.message || 'Unknown error'}</div>
                </div>
            `;
        }
    }
}

function renderWatchlistTags() {
    // Lightweight count synchronization helper for backwards-compatibility
    const countBadge = document.getElementById('topWatchlistCount');
    if (countBadge) countBadge.textContent = `${state.watchlistTickers.length} Stocks`;
    populateAlertTickerOptions();
    renderBacktestWatchlistPills();
}

function formatShortDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr).slice(5, 10);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
        return String(dateStr);
    }
}

function formatTablePeriodChange(timeseries) {
    if (!timeseries || timeseries.length < 2) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';
    const closes = timeseries.map(p => p.close).filter(c => typeof c === 'number' && !isNaN(c));
    if (closes.length < 2) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';

    const startPrice = closes[0];
    const endPrice = closes[closes.length - 1];
    const periodChangePct = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const isBull = periodChangePct >= 0;

    return `
        <span class="badge-pill ${isBull ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.75rem; padding: 2px 8px;">
            ${isBull ? '+' : ''}${periodChangePct.toFixed(2)}%
        </span>
    `;
}

function generateTableSparkline(timeseries, isBullish) {
    if (!timeseries || timeseries.length < 2) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';
    const points = timeseries.slice(-24);
    const closes = points.map(p => p.close).filter(c => c !== null && c !== undefined);
    if (closes.length < 2) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';

    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const width = 110;
    const height = 28;

    const startPrice = closes[0];
    const endPrice = closes[closes.length - 1];
    const periodChangePct = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const isPeriodBullish = periodChangePct >= 0;

    const coords = closes.map((val, idx) => {
        const x = (idx / (closes.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) };
    });

    const color = isPeriodBullish ? '#10b981' : '#ef4444';
    const fillId = `tbl-grad-${Math.random().toString(36).substr(2, 9)}`;
    const linePath = `M ${coords.map(c => `${c.x},${c.y}`).join(' L ')}`;
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return `
        <svg viewBox="0 0 ${width} ${height}" style="width: 105px; height: 26px; overflow: visible; display: block;" preserveAspectRatio="none">
            <defs>
                <linearGradient id="${fillId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
                </linearGradient>
            </defs>
            <path d="${areaPath}" fill="url(#${fillId})" />
            <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="${coords[coords.length - 1].x}" cy="${coords[coords.length - 1].y}" r="2.5" fill="${color}" stroke="#0f172a" stroke-width="1" />
        </svg>
    `;
}

function generateSvgSparkline(timeseries, isBullish) {
    if (!timeseries || timeseries.length < 2) return '';
    const points = timeseries.slice(-30);
    const closes = points.map(p => p.close).filter(c => c !== null && c !== undefined);
    if (closes.length < 2) return '';

    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const width = 320;
    const height = 50;

    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    const startDateStr = formatShortDate(startPoint.time);
    const endDateStr = formatShortDate(endPoint.time);

    const startPrice = closes[0];
    const endPrice = closes[closes.length - 1];
    const periodChangePct = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const isPeriodBullish = periodChangePct >= 0;
    const periodDays = points.length;

    const coords = closes.map((val, idx) => {
        const x = (idx / (closes.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 14) - 7;
        return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) };
    });

    const color = isPeriodBullish ? '#10b981' : '#ef4444';
    const fillId = `grad-${Math.random().toString(36).substr(2, 9)}`;
    const linePath = `M ${coords.map(c => `${c.x},${c.y}`).join(' L ')}`;
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    const lastCoord = coords[coords.length - 1];
    const startY = coords[0].y;

    return `
        <div class="sparkline-wrapper">
            <div class="sparkline-svg-container">
                <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="${fillId}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="${color}" stop-opacity="0.25" />
                            <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
                        </linearGradient>
                    </defs>
                    <!-- Baseline start price reference line -->
                    <line x1="0" y1="${startY}" x2="${width}" y2="${startY}" stroke="rgba(255,255,255,0.1)" stroke-dasharray="3,3" stroke-width="1" />
                    <!-- Area & Price Line -->
                    <path d="${areaPath}" fill="url(#${fillId})" />
                    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                    <!-- Latest point marker dot -->
                    <circle cx="${lastCoord.x}" cy="${lastCoord.y}" r="3.5" fill="${color}" stroke="#0f172a" stroke-width="1.5" />
                </svg>
                <div class="sparkline-range-labels">
                    <span>$${max.toFixed(1)}</span>
                    <span>$${min.toFixed(1)}</span>
                </div>
            </div>

            <!-- Timeframe & % Change Axis -->
            <div class="sparkline-axis-bar">
                <span class="sparkline-axis-time" title="Start of visible chart (${startDateStr})">${startDateStr}</span>
                <span class="sparkline-axis-badge ${isPeriodBullish ? 'bullish' : 'bearish'}" title="${periodDays}-session return from ${startDateStr} to ${endDateStr}">
                    ${periodDays}D Trend: ${isPeriodBullish ? '+' : ''}${periodChangePct.toFixed(2)}%
                </span>
                <span class="sparkline-axis-time" title="Latest bar (${endDateStr})">${endDateStr}</span>
            </div>
        </div>
    `;
}

function detectWatchlistCatalyst(ticker, stock) {
    if (!stock || stock.error) return null;

    // 1. Direct viral catalyst if already computed (e.g. from scanner dataset)
    if (stock.viralCatalyst) return stock.viralCatalyst;

    const profile = stock.profile || {};
    const signals = stock.signals || {};
    const ai = stock.aiAnalysis || {};
    const indicators = signals.indicators || {};
    const changePercent = profile.changePercent || 0;
    const volRatio = profile.volumeRatio || 1.0;
    const news = stock.news || [];
    const rsiVal = indicators.RSI ? indicators.RSI.value : (indicators.RSI?.val || null);

    // 2. High-impact catalyst keyword detection in breaking news items
    const catalystKeywords = [
        'takeover', 'buyout', 'acquisition', 'surge', 'soar', 'skyrocket',
        'short squeeze', 'rally', 'beat', 'record profit', 'fda approval',
        'breakout', 'partnership', 'expansion', 'ai platform', 'upgrade', 'contract', 'growth'
    ];

    let foundNews = null;
    for (const n of news.slice(0, 8)) {
        const title = (n.title || '').toLowerCase();
        for (const kw of catalystKeywords) {
            if (title.includes(kw)) {
                foundNews = n;
                break;
            }
        }
        if (foundNews) break;
    }

    if (foundNews && (volRatio >= 1.15 || Math.abs(changePercent) >= 1.5)) {
        return {
            catalystType: '🔥 Viral Catalyst',
            headline: foundNews.title,
            summary: foundNews.summary || foundNews.description || '',
            publisher: foundNews.publisher || 'Financial Wire',
            time: foundNews.time || 'Active Session',
            volRatio: `${volRatio.toFixed(1)}x Vol`
        };
    }

    // 3. Heavy Institutional Volume Surge or Massive Session Price Mover
    if (volRatio >= 1.35 || Math.abs(changePercent) >= 3.0) {
        return {
            catalystType: '⚡ Volume Surge',
            headline: `Heavy Session Momentum (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% | ${volRatio.toFixed(1)}x Vol)`,
            summary: `Significant institutional activity detected (${volRatio.toFixed(1)}x vs 20-day SMA) with ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% session price movement.`,
            publisher: 'Exchange Tape Flow',
            time: 'Active Session',
            volRatio: `${volRatio.toFixed(1)}x Vol`
        };
    }

    // 4. Extreme RSI Oversold Mean-Reversion setup
    if (rsiVal !== null && rsiVal <= 28) {
        return {
            catalystType: '💎 Deep Oversold',
            headline: `Deep RSI Oversold Extreme (${rsiVal.toFixed(1)})`,
            summary: `RSI dropped to ${rsiVal.toFixed(1)}, entering historic oversold territory for asymmetric mean-reversion opportunity.`,
            publisher: 'Quantitative Scanner',
            time: 'Active Signal',
            volRatio: `${volRatio.toFixed(1)}x Vol`
        };
    }

    return null;
}

function renderWatchlistCards() {
    const grid = document.getElementById('watchlistCardsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!state.watchlistTickers || state.watchlistTickers.length === 0) {
        grid.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
                Your watchlist is currently empty. Use the "Add Stock" button above to add assets.
            </div>
        `;
        return;
    }

    state.watchlistTickers.forEach(ticker => {
        const stock = state.watchlistData[ticker];
        const card = document.createElement('div');
        card.className = 'watchlist-card';
        setupCardDragAndDrop(card, ticker);

        if (!stock) {
            const compName = getAssetCompanyName(ticker, null);
            card.innerHTML = `
                <div class="watchlist-card-header">
                    <div class="watchlist-card-title-col">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div class="card-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                                <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                            </div>
                            <span class="watchlist-card-symbol">${ticker}</span>
                        </div>
                        <div class="watchlist-card-name" title="${compName}">${compName}</div>
                    </div>
                    <div class="watchlist-card-price-col">
                        <span class="badge-pill badge-neutral" style="font-size: 0.72rem;">Loading...</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; color: var(--text-muted); font-size: 0.8rem; gap: 8px;">
                    <div class="spinner" style="width: 20px; height: 20px;"></div>
                    <span>Hydrating live quotes & AI thesis...</span>
                </div>
                <button type="button" class="btn-deep-dive" onclick="openStockDeepDive('${ticker}')">
                    <span>Open Deep-Dive</span>
                </button>
            `;
            grid.appendChild(card);
            return;
        }

        if (stock.error) {
            card.innerHTML = `
                <div class="watchlist-card-header">
                    <div class="watchlist-card-title-col">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div class="card-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                                <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                            </div>
                            <span class="watchlist-card-symbol">${ticker}</span>
                        </div>
                        <div class="watchlist-card-name" style="color: var(--accent-red);">Data Unavailable</div>
                    </div>
                    <div class="watchlist-card-price-col">
                        <span class="badge-pill badge-bearish">Error</span>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); padding: 16px 0;">
                    ${stock.error || 'Unable to download market data for this symbol.'}
                </div>
                <button type="button" class="btn-deep-dive" onclick="openStockDeepDive('${ticker}')">
                    <span>Try Deep-Dive</span>
                </button>
            `;
            grid.appendChild(card);
            return;
        }

        const profile = stock.profile || {};
        const signals = stock.signals || {};
        const ai = stock.aiAnalysis || {};
        const indicators = signals.indicators || {};
        const timeseries = (stock.timeseries && stock.timeseries.length > 0) ? stock.timeseries : (stock.sparkline || []);
        const changePercent = profile.changePercent || 0;
        const isBullish = changePercent >= 0;
        const conviction = ai.convictionScore || (signals.score !== undefined ? Math.min(100, Math.max(0, 50 + signals.score * 5)) : 50);
        const bias = ai.directionalBias || signals.overall || 'Neutral';
        const stanceColor = ai.stanceColor || (conviction >= 55 ? 'bullish' : (conviction <= 40 ? 'bearish' : 'neutral'));
        const instCurr = profile.currency || 'USD';
        const baseCurr = getUserBaseCurrency();
        const isDiffCurr = instCurr.toUpperCase() !== baseCurr.toUpperCase();
        const priceDisplay = formatPrice(profile.currentPrice, instCurr, baseCurr);

        const rsiVal = indicators.RSI ? indicators.RSI.value : '--';
        const stStatus = indicators.SuperTrend ? (indicators.SuperTrend.status === 'bullish' ? '🟢 Bull' : '🔴 Bear') : '--';
        const cmfVal = profile.cmf !== null && profile.cmf !== undefined ? `${profile.cmf > 0 ? '+' : ''}${profile.cmf.toFixed(2)}` : '--';
        const vwapVal = profile.vwap ? formatPrice(profile.vwap, instCurr, baseCurr) : '--';

        const sparklineHtml = generateSvgSparkline(timeseries, isBullish);
        const synthText = ai.newsSynthesis?.summary || ai.executiveThesis || (stock.isFastHydration ? '⚡ Live quotes, sparklines & indicators loaded. Synthesizing AI catalysts & backtests in background...' : `Technical indicators and quantitative momentum signals are actively tracked for ${ticker}.`);

        const compName = getAssetCompanyName(ticker, stock);
        const catalyst = detectWatchlistCatalyst(ticker, stock);

        card.innerHTML = `
            <div class="watchlist-card-header">
                <div class="watchlist-card-title-col">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div class="card-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                            <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                        </div>
                        <span class="watchlist-card-symbol">${ticker}</span>
                        ${catalyst ? `
                        <div class="catalyst-indicator-wrapper" onmouseenter="positionCatalystPopover(this)" onclick="handleScannerCatalystClick('${ticker}', event)" title="View Catalyst News">
                            <span class="catalyst-dot-pulse" aria-label="Market Catalyst Active"></span>
                            <div class="catalyst-hover-popover">
                                <div class="popover-cat-header">
                                    <span class="popover-cat-tag">${catalyst.catalystType || '🔥 Catalyst'}</span>
                                    <span class="popover-cat-vol mono">${catalyst.volRatio || ''}</span>
                                </div>
                                <div class="popover-cat-headline">${escapeHtml(catalyst.headline || '')}</div>
                                ${catalyst.summary ? `<div class="popover-cat-summary">${escapeHtml(catalyst.summary)}</div>` : ''}
                                <div class="popover-cat-footer">
                                    <span>${escapeHtml(catalyst.publisher || 'Wire')} • ${escapeHtml(catalyst.time || 'Active')}</span>
                                    <button type="button" class="popover-cat-btn" onclick="handleScannerCatalystClick('${ticker}', event)" title="Open Full News Story">
                                        <span>View News</span>
                                        <i data-lucide="external-link" style="width: 10px; height: 10px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="watchlist-card-name" title="${compName}">${compName}</div>
                </div>

                <div class="watchlist-card-price-col">
                    <div style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">
                        <span class="watchlist-card-price mono">${priceDisplay}</span>
                        <button type="button" class="btn-card-remove" onclick="removeWatchlistTicker('${ticker}')" title="Remove ${ticker} from Watchlist" aria-label="Remove ${ticker}">
                            <i data-lucide="x" style="width: 13px; height: 13px;"></i>
                        </button>
                    </div>
                    <div class="watchlist-card-meta-row">
                        <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'} watchlist-card-1d-badge" title="Daily Session Change">
                            1D: ${isBullish ? '+' : ''}${changePercent.toFixed(2)}%
                        </span>
                        <span class="watchlist-card-native-price mono" title="Native Price in ${instCurr}">
                            ${isDiffCurr && profile.currentPrice !== null && profile.currentPrice !== undefined ? `${formatPrice(profile.currentPrice, instCurr, instCurr)}` : '&nbsp;'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Trend Sparkline with Timeframe Axis -->
            ${sparklineHtml}

            <!-- AI Conviction & Recommendation -->
            <div class="card-conviction-row">
                <div>
                    <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">AI Conviction</span>
                    <div style="font-size: 1.1rem; font-weight: 800; color: ${stanceColor === 'bullish' ? 'var(--accent-green)' : (stanceColor === 'bearish' ? 'var(--accent-red)' : 'var(--accent-blue)')};" class="mono">${conviction}%</div>
                </div>
                <span class="badge-pill ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}" style="font-size: 0.78rem;">
                    ${bias}
                </span>
            </div>

            <!-- Key Indicators Bar -->
            <div class="card-indicators-bar">
                <div class="card-ind-item">
                    <div class="card-ind-label">RSI(14)</div>
                    <div class="card-ind-val mono" style="color: ${rsiVal > 70 ? 'var(--accent-red)' : (rsiVal < 30 ? 'var(--accent-green)' : 'var(--text-primary)')};">${rsiVal}</div>
                </div>
                <div class="card-ind-item">
                    <div class="card-ind-label">SuperTrend</div>
                    <div class="card-ind-val mono">${stStatus}</div>
                </div>
                <div class="card-ind-item">
                    <div class="card-ind-label">CMF Flow</div>
                    <div class="card-ind-val mono" style="color: ${profile.cmf > 0.05 ? 'var(--accent-green)' : (profile.cmf < -0.05 ? 'var(--accent-red)' : 'var(--text-primary)')};">${cmfVal}</div>
                </div>
                <div class="card-ind-item">
                    <div class="card-ind-label">VWAP</div>
                    <div class="card-ind-val mono">${vwapVal}</div>
                </div>
            </div>

            <!-- Synthesis Brief -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="newspaper" style="width: 12px; height: 12px;"></i>
                    <span>News & Market Synthesis</span>
                </span>
                ${ai.newsSynthesis?.sentiment ? `<span class="badge-pill ${ai.newsSynthesis.sentiment.toLowerCase().includes('bull') ? 'badge-bullish' : (ai.newsSynthesis.sentiment.toLowerCase().includes('bear') ? 'badge-neutral' : 'badge-neutral')}" style="font-size: 0.68rem; padding: 1px 6px;">${ai.newsSynthesis.sentiment}</span>` : ''}
            </div>
            <div class="card-synthesis-box">
                ${formatMarkdownResponse(synthText)}
            </div>

            <!-- Deep Dive Button -->
            <button type="button" class="btn-deep-dive" onclick="openStockDeepDive('${ticker}')">
                <i data-lucide="arrow-right-circle" style="width: 15px; height: 15px;"></i>
                <span>Deep-Dive Single Stock Analysis</span>
            </button>
        `;

        grid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function formatTableSynthesis(ai, stock) {
    if (!stock) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';

    if (stock.isFastHydration && (!ai || !ai.newsSynthesis)) {
        return `
            <div style="display: flex; justify-content: center;" title="Live quote loaded. Synthesizing AI catalysts in background...">
                <span class="badge-pill badge-neutral" style="font-size: 0.72rem; padding: 2px 8px;">⚡ Syncing</span>
            </div>
        `;
    }

    const news = ai?.newsSynthesis || {};
    const sentiment = news.sentiment || ai?.directionalBias || 'Neutral';
    const summary = news.summary || ai?.executiveThesis || `Technical momentum and news catalysts actively tracked.`;

    const sLower = sentiment.toLowerCase();
    const isBull = sLower.includes('bull');
    const isBear = sLower.includes('bear');
    const badgeClass = isBull ? 'badge-bullish' : (isBear ? 'badge-bearish' : 'badge-neutral');
    const label = isBull ? 'Bullish' : (isBear ? 'Bearish' : 'Neutral');

    // Clean tooltip text for mouse hover
    const cleanTooltip = summary
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

    return `
        <div style="display: flex; justify-content: center;" title="${escapeHtml(cleanTooltip)}">
            <span class="badge-pill ${badgeClass}" style="font-size: 0.72rem; padding: 2px 8px; cursor: help;">
                ${label}
            </span>
        </div>
    `;
}

function renderWatchlistTable() {
    const tbody = document.getElementById('watchlistTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!state.watchlistTickers || state.watchlistTickers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Your watchlist is currently empty. Use the "Add Stock" button above to add assets.
                </td>
            </tr>
        `;
        return;
    }

    state.watchlistTickers.forEach(ticker => {
        const stock = state.watchlistData[ticker];
        const tr = document.createElement('tr');
        tr.className = 'watchlist-table-row';
        setupTableRowDragAndDrop(tr, ticker);

        if (!stock || stock.error) {
            tr.innerHTML = `
                <td class="col-sticky-drag" style="width: 32px; padding: 12px 4px 12px 12px; text-align: center;">
                    <div class="table-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                        <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                    </div>
                </td>
                <td class="col-sticky-asset">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="watchlist-table-ticker">${ticker}</span>
                        <span style="font-size: 0.8rem; color: var(--accent-red);">Data Unavailable</span>
                    </div>
                </td>
                <td colspan="8" style="font-size: 0.8rem; color: var(--text-muted);">
                    ${stock?.error || 'Unable to download market data for this symbol.'}
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <button type="button" class="btn-table-action" onclick="openStockDeepDive('${ticker}')" title="Try Deep Dive">
                            <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
                        </button>
                        <button type="button" class="btn-table-remove" onclick="removeWatchlistTicker('${ticker}')" title="Remove ${ticker}" aria-label="Remove ${ticker}">
                            <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
            return;
        }

        const profile = stock.profile || {};
        const signals = stock.signals || {};
        const ai = stock.aiAnalysis || {};
        const indicators = signals.indicators || {};
        const timeseries = (stock.timeseries && stock.timeseries.length > 0) ? stock.timeseries : (stock.sparkline || []);
        const changePercent = profile.changePercent || 0;
        const isBullish = changePercent >= 0;
        const conviction = ai.convictionScore || (signals.score !== undefined ? Math.min(100, Math.max(0, 50 + signals.score * 5)) : 50);
        const bias = ai.directionalBias || signals.overall || 'Neutral';
        const stanceColor = ai.stanceColor || (conviction >= 55 ? 'bullish' : (conviction <= 40 ? 'bearish' : 'neutral'));
        const instCurr = profile.currency || 'USD';
        const baseCurr = getUserBaseCurrency();
        const isDiffCurr = instCurr.toUpperCase() !== baseCurr.toUpperCase();
        const priceDisplay = formatPrice(profile.currentPrice, instCurr, baseCurr);

        const rsiVal = indicators.RSI ? indicators.RSI.value : '--';
        const stStatus = indicators.SuperTrend ? (indicators.SuperTrend.status === 'bullish' ? '🟢 Bull' : '🔴 Bear') : '--';
        const cmfVal = profile.cmf !== null && profile.cmf !== undefined ? `${profile.cmf > 0 ? '+' : ''}${profile.cmf.toFixed(2)}` : '--';

        const sixMonthHtml = formatTablePeriodChange(timeseries);
        const synthHtml = formatTableSynthesis(ai, stock);
        const catalyst = detectWatchlistCatalyst(ticker, stock);

        const compName = getAssetCompanyName(ticker, stock);
        tr.innerHTML = `
            <td class="col-sticky-drag" style="width: 32px; padding: 12px 4px 12px 12px; text-align: center;">
                <div class="table-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                    <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                </div>
            </td>
            <td class="col-sticky-asset">
                <div style="display: flex; flex-direction: column; gap: 1px; min-width: 0;">
                    <span class="watchlist-table-ticker">${ticker}</span>
                    <span class="watchlist-table-name" title="${compName}">${compName}</span>
                    <span class="watchlist-table-sector">${profile.sector || 'Equities'}</span>
                </div>
            </td>
            <td style="text-align: right;">
                <div class="mono" style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${priceDisplay}</div>
                ${isDiffCurr && profile.currentPrice !== null && profile.currentPrice !== undefined ? `<div style="font-size: 0.68rem; color: var(--text-muted);">${formatPrice(profile.currentPrice, instCurr, instCurr)} (${instCurr})</div>` : ''}
            </td>
            <td style="text-align: right;">
                <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.75rem; padding: 2px 8px;">
                    ${isBullish ? '+' : ''}${changePercent.toFixed(2)}%
                </span>
            </td>
            <td style="text-align: center;">
                ${sixMonthHtml}
            </td>
            <td style="text-align: center;">
                <span class="badge-pill ${indicators.SuperTrend?.status === 'bullish' ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.72rem; padding: 2px 7px;">
                    ${stStatus}
                </span>
            </td>
            <td style="text-align: center;">
                <span class="mono" style="font-weight: 700; font-size: 0.82rem; color: ${rsiVal > 70 ? 'var(--accent-red)' : (rsiVal < 30 ? 'var(--accent-green)' : 'var(--text-primary)')};">${rsiVal}</span>
            </td>
            <td style="text-align: center;">
                <span class="mono" style="font-weight: 600; font-size: 0.82rem; color: ${profile.cmf > 0.05 ? 'var(--accent-green)' : (profile.cmf < -0.05 ? 'var(--accent-red)' : 'var(--text-muted)')};">${cmfVal}</span>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                    <span class="mono" style="font-weight: 800; font-size: 0.88rem; color: ${stanceColor === 'bullish' ? 'var(--accent-green)' : (stanceColor === 'bearish' ? 'var(--accent-red)' : 'var(--accent-blue)')};">${conviction}%</span>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span class="badge-pill ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}" style="font-size: 0.65rem; padding: 1px 6px;">${bias}</span>
                        ${catalyst ? `
                        <div class="catalyst-indicator-wrapper" onmouseenter="positionCatalystPopover(this)" onclick="handleScannerCatalystClick('${ticker}', event)" title="View Market Catalyst">
                            <span class="catalyst-dot-pulse" style="width: 8px; height: 8px;" aria-label="Market Catalyst Active"></span>
                            <div class="catalyst-hover-popover" style="text-align: left;">
                                <div class="popover-cat-header">
                                    <span class="popover-cat-tag">${catalyst.catalystType || '🔥 Catalyst'}</span>
                                    <span class="popover-cat-vol mono">${catalyst.volRatio || ''}</span>
                                </div>
                                <div class="popover-cat-headline">${escapeHtml(catalyst.headline || '')}</div>
                                ${catalyst.summary ? `<div class="popover-cat-summary">${escapeHtml(catalyst.summary)}</div>` : ''}
                                <div class="popover-cat-footer">
                                    <span>${escapeHtml(catalyst.publisher || 'Wire')} • ${escapeHtml(catalyst.time || 'Active')}</span>
                                    <button type="button" class="popover-cat-btn" onclick="handleScannerCatalystClick('${ticker}', event)" title="Open Full News Story">
                                        <span>View News</span>
                                        <i data-lucide="external-link" style="width: 10px; height: 10px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </td>
            <td style="text-align: center;">
                ${synthHtml}
            </td>
            <td style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button type="button" class="btn-table-action" onclick="openStockDeepDive('${ticker}')" title="Deep-Dive Single Stock Analysis">
                        <i data-lucide="arrow-right-circle" style="width: 14px; height: 14px;"></i>
                        <span>Deep Dive</span>
                    </button>
                    <button type="button" class="btn-table-remove" onclick="removeWatchlistTicker('${ticker}')" title="Remove ${ticker} from Watchlist" aria-label="Remove ${ticker}">
                        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =============================================================
// WATCHLIST DRAG & DROP REORDERING CONTROLLERS
// =============================================================

let watchlistDragState = {
    draggedTicker: null,
    draggedType: null
};

function setupCardDragAndDrop(card, ticker) {
    card.setAttribute('draggable', 'true');
    card.dataset.ticker = ticker;

    card.addEventListener('dragstart', (e) => {
        watchlistDragState.draggedTicker = ticker;
        watchlistDragState.draggedType = 'card';
        card.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ticker);
    });

    card.addEventListener('dragover', (e) => {
        if (!watchlistDragState.draggedTicker || watchlistDragState.draggedTicker === ticker) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = card.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const isAfter = e.clientX > midX;

        card.classList.toggle('drag-over-before', !isAfter);
        card.classList.toggle('drag-over-after', isAfter);
    });

    card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over-before', 'drag-over-after');
    });

    card.addEventListener('drop', async (e) => {
        e.preventDefault();
        const dragged = watchlistDragState.draggedTicker;
        card.classList.remove('drag-over-before', 'drag-over-after');

        if (!dragged || dragged === ticker) return;

        const rect = card.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const isAfter = e.clientX > midX;

        reorderWatchlistTickers(dragged, ticker, isAfter);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging', 'drag-over-before', 'drag-over-after');
        document.querySelectorAll('.watchlist-card').forEach(c => {
            c.classList.remove('is-dragging', 'drag-over-before', 'drag-over-after');
        });
        watchlistDragState.draggedTicker = null;
        watchlistDragState.draggedType = null;
    });
}

function setupTableRowDragAndDrop(row, ticker) {
    row.setAttribute('draggable', 'true');
    row.dataset.ticker = ticker;

    row.addEventListener('dragstart', (e) => {
        watchlistDragState.draggedTicker = ticker;
        watchlistDragState.draggedType = 'table';
        row.classList.add('is-table-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ticker);
    });

    row.addEventListener('dragover', (e) => {
        if (!watchlistDragState.draggedTicker || watchlistDragState.draggedTicker === ticker) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const isAfter = e.clientY > midY;

        row.classList.toggle('drag-over-top', !isAfter);
        row.classList.toggle('drag-over-bottom', isAfter);
    });

    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    row.addEventListener('drop', async (e) => {
        e.preventDefault();
        const dragged = watchlistDragState.draggedTicker;
        row.classList.remove('drag-over-top', 'drag-over-bottom');

        if (!dragged || dragged === ticker) return;

        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const isAfter = e.clientY > midY;

        reorderWatchlistTickers(dragged, ticker, isAfter);
    });

    row.addEventListener('dragend', () => {
        row.classList.remove('is-table-dragging', 'drag-over-top', 'drag-over-bottom');
        document.querySelectorAll('.watchlist-table-row').forEach(r => {
            r.classList.remove('is-table-dragging', 'drag-over-top', 'drag-over-bottom');
        });
        watchlistDragState.draggedTicker = null;
        watchlistDragState.draggedType = null;
    });
}

async function reorderWatchlistTickers(draggedTicker, targetTicker, isAfter) {
    if (!draggedTicker || !targetTicker || draggedTicker === targetTicker) return;

    const fromIdx = state.watchlistTickers.indexOf(draggedTicker);
    if (fromIdx === -1) return;

    state.watchlistTickers.splice(fromIdx, 1);
    let toIdx = state.watchlistTickers.indexOf(targetTicker);
    if (toIdx === -1) {
        state.watchlistTickers.push(draggedTicker);
    } else {
        if (isAfter) toIdx++;
        state.watchlistTickers.splice(toIdx, 0, draggedTicker);
    }

    renderWatchlist();
    await saveWatchlistServer();
}

async function openStockDeepDive(ticker, targetSubtab = null) {
    if (!ticker) return;
    ticker = ticker.trim().toUpperCase();
    state.activeTicker = ticker;

    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput) tickerInput.value = ticker;

    // Render stock selector immediately with the requested ticker tab active
    renderStockSelector([ticker]);

    // Switch to Terminal top tab
    switchTopTab('terminal');
    if (targetSubtab) {
        switchMainTab(targetSubtab);
    }

    const currentStock = state.stocksData[ticker];
    const hasFullData = currentStock && !currentStock.error && currentStock.timeseries && currentStock.timeseries.length > 0 && currentStock.aiAnalysis;

    if (hasFullData) {
        renderActiveStock();
    } else {
        if (state.watchlistData && state.watchlistData[ticker] && !state.watchlistData[ticker].error) {
            if (!state.stocksData[ticker]) {
                state.stocksData[ticker] = { ...state.watchlistData[ticker] };
            }
            renderActiveStock();
        }
        await handleAnalyze();
    }

    // Scroll to dashboard content
    document.getElementById('dashboardContent')?.scrollIntoView({ behavior: 'smooth' });
}

async function handleScannerCatalystClick(ticker, event) {
    if (event) {
        event.stopPropagation();
    }
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();

    const opp = state.scannerResults?.opportunities?.find(o => o.ticker === cleanTicker);
    const catalyst = opp?.viralCatalyst || null;

    // 1. Set active ticker for modal context
    state.activeTicker = cleanTicker;

    // 2. Open Global News Modal with catalyst preloaded (stays on current scanner page)
    const headlineQuery = catalyst?.headline ? catalyst.headline.slice(0, 32) : '';
    openGlobalNewsModal(cleanTicker, headlineQuery, 'all', catalyst);
}

function positionCatalystPopover(wrapper) {
    if (!wrapper) return;
    const popover = wrapper.querySelector('.catalyst-hover-popover');
    if (!popover) return;

    // Reset inline styles to read natural layout dimensions
    popover.style.left = '0px';
    popover.style.right = 'auto';

    const rect = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const pad = 14;

    // If popover bleeds past the right viewport boundary:
    if (rect.right > viewportWidth - pad) {
        const overflow = rect.right - (viewportWidth - pad);
        popover.style.left = `-${Math.ceil(overflow)}px`;
    }

    // Check if adjustment causes left overflow:
    const adjustedRect = popover.getBoundingClientRect();
    if (adjustedRect.left < pad) {
        popover.style.left = `${Math.ceil(pad - rect.left)}px`;
    }
}

async function removeWatchlistTicker(ticker) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    state.watchlistTickers = state.watchlistTickers.filter(t => t !== cleanTicker);

    if (state.watchlistData && state.watchlistData[cleanTicker]) {
        delete state.watchlistData[cleanTicker];
        saveWatchlistLocalCache(state.watchlistData);
    }

    renderWatchlist();
    await saveWatchlistServer();
}

async function resetWatchlistDefaults() {
    state.watchlistTickers = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
    saveWatchlistTickersLocal(state.watchlistTickers);
    renderWatchlist();
    await saveWatchlistServer();
    await fetchWatchlistAnalysis();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
