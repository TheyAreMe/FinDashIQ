// =============================================================
// Global scanner countdown timer ID
let scannerCountdownTimerId = null;

async function initScanner() {
    try {
        state.scannerViewMode = localStorage.getItem('findashiq_scanner_view') || 'cards';
        let cached = null;

        // 1. Fetch live precalculated state and timing from server warm cache (<5ms)
        try {
            const res = await fetch('/api/scanner/cached');
            if (res.ok) {
                const serverCached = await res.json();
                if (serverCached && serverCached.opportunities) {
                    cached = {
                        timestamp: new Date(serverCached.timestamp || Date.now()).getTime(),
                        criteria: serverCached.criteria || {},
                        results: serverCached
                    };
                    try {
                        localStorage.setItem('findashiq_scanner_cache', JSON.stringify(cached));
                    } catch (e) { }
                }
            }
        } catch (e) {
            console.warn('Could not fetch server scanner cache:', e);
        }

        // 2. Fallback to localStorage cache if server was unreachable
        if (!cached || !cached.results || !cached.results.opportunities || cached.results.opportunities.length === 0) {
            const cachedRaw = localStorage.getItem('findashiq_scanner_cache');
            if (cachedRaw) {
                try {
                    cached = JSON.parse(cachedRaw);
                } catch (e) { }
            }
        }

        if (cached && cached.results && cached.results.opportunities) {
            state.scannerResults = cached.results;
            state.allScannerOpportunities = cached.results.opportunities || [];

            // Restore form criteria if saved (ensure minConviction defaults to 85)
            if (cached.criteria) {
                const c = cached.criteria;
                const mkt = document.getElementById('scannerSelectMarket');
                const strat = document.getElementById('scannerSelectStrategy');
                const etf = document.getElementById('scannerSelectEtfBasket');
                const sec = document.getElementById('scannerSelectSector');
                const thm = document.getElementById('scannerSelectTheme');
                const cnv = document.getElementById('scannerSelectMinConviction');
                if (mkt && c.market) mkt.value = c.market;
                if (strat && c.strategy) strat.value = c.strategy;
                if (etf && c.etfBasket) etf.value = c.etfBasket;
                if (sec && c.sector) sec.value = c.sector;
                if (thm && c.theme) thm.value = c.theme;
                if (cnv && c.minConviction && c.minConviction !== '50') cnv.value = c.minConviction;
            }

            // Sync timing display & countdown
            updateScannerTimingDisplay(cached.results);

            // Sync admin-only controls (Force Update & Interval selector)
            syncScannerAdminControls(cached.results);

            // Update summary metrics for universe size
            const totalUni = cached.results.totalUniverseScanned || cached.results.totalUniverse || cached.results.totalAssets;
            if (totalUni) {
                updateScannerUniverseDisplay(totalUni);
            }

            if (cached.results.universeTickers && Array.isArray(cached.results.universeTickers)) {
                state.scannerUniverseTickers = new Set(cached.results.universeTickers.map(t => t.toUpperCase()));
            } else if (!state.scannerUniverseTickers || state.scannerUniverseTickers.size === 0) {
                loadScannerUniverseTickers();
            }

            // Execute fast in-memory filter according to active criteria (defaults to minConviction >= 85%)
            await handleRunScanner(false, 100, true);
        }
    } catch (e) {
        console.warn('Error initializing scanner:', e);
    }
}

async function loadScannerUniverseTickers() {
    try {
        const res = await fetch('/api/scanner/universe');
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
                const items = data.data.items || [];
                state.scannerUniverseTickers = new Set(items.map(it => (it.ticker || '').toUpperCase()));
                if (data.data.tickers && Array.isArray(data.data.tickers)) {
                    data.data.tickers.forEach(t => state.scannerUniverseTickers.add(t.toUpperCase()));
                }
                if (data.data.totalUniverse) {
                    updateScannerUniverseDisplay(data.data.totalUniverse);
                }
            }
        }
    } catch (e) {
        console.warn('Failed to fetch scanner universe tickers:', e);
    }
}

function setScannerSyncStatus(status, text) {
    const el = document.getElementById('scannerSyncStatusText');
    const dot = document.getElementById('scannerSyncDot');
    const badge = document.getElementById('scannerSyncBadge');
    if (!el) return;

    el.textContent = text;
    if (badge) {
        badge.className = `sync-status-badge ${status}`;
    }
    if (dot) {
        dot.className = `sync-status-dot ${status}`;
    }
}

function formatScannerLocalTime(epochOrIso) {
    if (!epochOrIso) return null;
    let date;
    if (typeof epochOrIso === 'number') {
        // Handle seconds or milliseconds epoch
        const ms = epochOrIso > 1e11 ? epochOrIso : epochOrIso * 1000;
        date = new Date(ms);
    } else {
        date = new Date(epochOrIso);
    }
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function updateScannerTimingDisplay(data) {
    if (!data) return;
    const lastScanEl = document.getElementById('scannerLiveLastScan');
    const nextScanEl = document.getElementById('scannerLiveNextScan');
    const statTimestamp = document.getElementById('scanStatTimestamp');
    const scanningBadge = document.getElementById('scannerScanningBadge');
    const syncBadge = document.getElementById('scannerSyncBadge');

    // Resolve epoch timestamps (UTC seconds) to format in user's local timezone
    const lastEpoch = data.lastScanEpoch || data.timestamp_epoch || state.scannerResults?.lastScanEpoch || state.scannerResults?.timestamp_epoch;
    const nextEpoch = data.nextScanEpoch || state.scannerResults?.nextScanEpoch;

    let userTz = 'Local Timezone';
    try {
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
            userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Timezone';
        }
    } catch (e) { }

    const lastTime = (lastEpoch ? formatScannerLocalTime(lastEpoch) : null) || data.lastScanTime || state.scannerResults?.lastScanTime || 'Initial';
    const nextTime = (nextEpoch ? formatScannerLocalTime(nextEpoch) : null) || data.nextScanTime || state.scannerResults?.nextScanTime || 'Pending';

    if (lastScanEl) lastScanEl.textContent = lastTime;
    if (nextScanEl) nextScanEl.textContent = nextTime;
    if (statTimestamp) {
        statTimestamp.textContent = `Last: ${lastTime} • Next: ${nextTime}`;
        statTimestamp.title = `Times formatted in your local browser timezone (${userTz})`;
    }

    if (data.isScanning) {
        if (scanningBadge) scanningBadge.style.display = 'inline-flex';
        if (syncBadge) syncBadge.style.display = 'none';
        setScannerSyncStatus('syncing', 'Scanning in progress...');
    } else {
        if (scanningBadge) scanningBadge.style.display = 'none';
        if (syncBadge) syncBadge.style.display = 'inline-flex';
        setScannerSyncStatus('synced', 'Live & Synced');
    }

    // Start live countdown timer to nextScanEpoch only if changed or timer not running
    const targetEpoch = data.nextScanEpoch || state.scannerResults?.nextScanEpoch;
    if (targetEpoch) {
        if (targetEpoch !== currentCountdownTargetEpoch || !scannerCountdownTimerId) {
            startScannerCountdown(targetEpoch);
        }
    } else if (data.nextScanInSeconds || state.scannerResults?.nextScanInSeconds) {
        const sec = data.nextScanInSeconds || state.scannerResults?.nextScanInSeconds;
        const computedEpoch = (Date.now() / 1000) + sec;
        if (!scannerCountdownTimerId || Math.abs((currentCountdownTargetEpoch || 0) - computedEpoch) > 5) {
            startScannerCountdown(computedEpoch);
        }
    }
}

let currentCountdownTargetEpoch = null;
let isScannerPollingRefresh = false;

function startScannerCountdown(nextScanEpoch) {
    if (scannerCountdownTimerId) {
        clearInterval(scannerCountdownTimerId);
        scannerCountdownTimerId = null;
    }

    currentCountdownTargetEpoch = nextScanEpoch;

    const countdownEl = document.getElementById('scannerCountdownTimer');
    if (!countdownEl || !nextScanEpoch || nextScanEpoch <= 0) {
        if (countdownEl) countdownEl.textContent = '';
        return;
    }

    let pollCounter = 0;

    const updateTimer = () => {
        const nowSec = Date.now() / 1000;
        const diff = Math.floor(nextScanEpoch - nowSec);

        if (diff <= 0) {
            // Background scan is due or currently computing on the server
            countdownEl.textContent = '(Updating...)';
            setScannerSyncStatus('syncing', 'Scanning in progress...');

            // Only poll if user is actively on the scanner tab!
            // When user is on other tabs (paper trades, watchlist, etc.), do not poll or refresh.
            if (state.activeTopTab === 'scanner') {
                pollCounter++;
                // Poll gently every 15 seconds instead of spamming every 1-4 seconds
                if (pollCounter === 1 || pollCounter % 15 === 0) {
                    if (!isScannerPollingRefresh) {
                        isScannerPollingRefresh = true;
                        silentRefreshScannerCache().finally(() => {
                            isScannerPollingRefresh = false;
                        });
                    }
                }
            }
            return;
        }

        // Active future countdown
        pollCounter = 0;
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        countdownEl.textContent = `(in ${mins}m ${secs < 10 ? '0' : ''}${secs}s)`;
    };

    updateTimer();
    scannerCountdownTimerId = setInterval(updateTimer, 1000);
}

async function silentRefreshScannerCache() {
    try {
        const res = await fetch('/api/scanner/cached');
        if (res.ok) {
            const data = await res.json();
            if (data && data.opportunities) {
                // Check if server data is actually new
                const prevEpoch = state.scannerResults?.timestamp_epoch || state.scannerResults?.timestamp;
                const newEpoch = data.timestamp_epoch || data.timestamp;
                const isNewScan = !prevEpoch || (newEpoch && newEpoch !== prevEpoch);

                if (data.universeTickers && Array.isArray(data.universeTickers)) {
                    state.scannerUniverseTickers = new Set(data.universeTickers.map(t => t.toUpperCase()));
                }

                syncScannerAdminControls(data);

                // Update summary metrics for universe size
                const totalUni = data.totalUniverseScanned || data.totalUniverse || data.totalAssets;
                if (totalUni) {
                    updateScannerUniverseDisplay(totalUni);
                }

                if (isNewScan) {
                    state.scannerResults = data;
                    state.allScannerOpportunities = data.opportunities || [];
                    updateScannerTimingDisplay(data);

                    // Re-evaluate opportunities ONLY if user is actively looking at scanner tab
                    if (state.activeTopTab === 'scanner') {
                        await handleRunScanner(false, 100, true);
                    }
                } else {
                    // Cache has not changed on server yet, just update sync/scanning status if needed
                    if (data.isScanning !== undefined) {
                        const scanningBadge = document.getElementById('scannerScanningBadge');
                        const syncBadge = document.getElementById('scannerSyncBadge');
                        if (data.isScanning) {
                            if (scanningBadge) scanningBadge.style.display = 'inline-flex';
                            if (syncBadge) syncBadge.style.display = 'none';
                            setScannerSyncStatus('syncing', 'Scanning in progress...');
                        } else {
                            if (scanningBadge) scanningBadge.style.display = 'none';
                            if (syncBadge) syncBadge.style.display = 'inline-flex';
                            setScannerSyncStatus('synced', 'Live & Synced');
                        }
                    }
                    if (data.nextScanEpoch && data.nextScanEpoch !== currentCountdownTargetEpoch) {
                        updateScannerTimingDisplay(data);
                    }
                }
            }
        }
    } catch (e) {
        console.warn('[Scanner] Silent refresh error:', e);
    }
}

// Background sync & tab visibility listeners
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (state.activeTopTab === 'scanner') {
            silentRefreshScannerCache();
        }
    }
});

// Periodic heartbeat: every 30s ensure timing and cache are synchronized
setInterval(() => {
    if (state.activeTopTab === 'scanner') {
        const nowSec = Date.now() / 1000;
        const nextEpoch = state.scannerResults?.nextScanEpoch || 0;
        if (nowSec >= nextEpoch - 5 || !scannerCountdownTimerId) {
            silentRefreshScannerCache();
        }
    }
}, 30000);

function syncScannerAdminControls(data) {
    const isAdmin = state.user ? (state.user.role === 'admin') : Boolean(data?.isAdmin);
    const btnForce = document.getElementById('btnForceScannerRefresh');
    const intervalGroup = document.getElementById('adminScannerIntervalGroup');
    const intervalSelect = document.getElementById('adminSelectScanInterval');

    if (btnForce) btnForce.style.display = isAdmin ? 'inline-flex' : 'none';
    if (intervalGroup) intervalGroup.style.display = isAdmin ? 'inline-flex' : 'none';

    const intervalMins = data?.scanIntervalMinutes || state.scannerResults?.scanIntervalMinutes;
    if (intervalSelect && intervalMins) {
        intervalSelect.value = String(intervalMins);
    }
}

async function handleAdminForceUpdate() {
    const btn = document.getElementById('btnForceScannerRefresh');
    const scanningBadge = document.getElementById('scannerScanningBadge');
    const syncBadge = document.getElementById('scannerSyncBadge');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width: 12px; height: 12px; border-width: 2px; margin-right: 4px;"></div> <span>Triggering...</span>`;
    }
    if (scanningBadge) scanningBadge.style.display = 'inline-flex';
    if (syncBadge) syncBadge.style.display = 'none';
    setScannerSyncStatus('syncing', 'Scanning in progress...');

    try {
        const res = await fetch('/api/scanner/force-update', { method: 'POST' });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to trigger background scan.');
        }

        showAddUniverseAlert('Background scan started, fresh data will be ready in ~5s.', 'info');

        // Smooth non-blocking poll until scan completes
        let attempts = 0;
        const pollInterval = setInterval(async () => {
            attempts++;
            try {
                const sRes = await fetch('/api/scanner/status');
                if (sRes.ok) {
                    const status = await sRes.json();
                    if (!status.isScanning || attempts > 15) {
                        clearInterval(pollInterval);
                        if (scanningBadge) scanningBadge.style.display = 'none';
                        if (syncBadge) syncBadge.style.display = 'inline-flex';
                        setScannerSyncStatus('synced', 'Live & Synced');
                        await initScanner();
                        showAddUniverseAlert('Background scan completed! Fresh market data is live.', 'success');
                    }
                }
            } catch (e) {
                clearInterval(pollInterval);
            }
        }, 1500);

    } catch (err) {
        console.error('Force update error:', err);
        showAddUniverseAlert(err.message, 'error');
        if (scanningBadge) scanningBadge.style.display = 'none';
        if (syncBadge) syncBadge.style.display = 'inline-flex';
        setScannerSyncStatus('synced', 'Live & Synced');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> <span>Force Update</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: btn });
        }
    }
}

async function handleAdminChangeInterval(minutes) {
    try {
        const res = await fetch('/api/scanner/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intervalMinutes: parseInt(minutes, 10) })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to update scan interval.');
        }

        const formattedInterval = `${minutes} min`;
        const localNextTime = data.nextScanEpoch ? formatScannerLocalTime(data.nextScanEpoch) : (data.nextScanTime || 'scheduled');
        showAddUniverseAlert(`Scan interval updated to ${formattedInterval}. Next background scan: ${localNextTime}.`, 'success');

        // Update local scanner state
        if (!state.scannerResults) {
            state.scannerResults = {};
        }
        state.scannerResults.scanIntervalMinutes = data.intervalMinutes || parseInt(minutes, 10);
        if (data.nextScanTime) state.scannerResults.nextScanTime = data.nextScanTime;
        if (data.lastScanTime) state.scannerResults.lastScanTime = data.lastScanTime;
        if (data.nextScanEpoch) state.scannerResults.nextScanEpoch = data.nextScanEpoch;
        if (data.lastScanEpoch) state.scannerResults.lastScanEpoch = data.lastScanEpoch;
        if (data.nextScanInSeconds !== undefined) state.scannerResults.nextScanInSeconds = data.nextScanInSeconds;

        // Persist updated timings to localStorage cache
        try {
            const cachedRaw = localStorage.getItem('findashiq_scanner_cache');
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                if (cached && cached.results) {
                    if (data.nextScanTime) cached.results.nextScanTime = data.nextScanTime;
                    if (data.lastScanTime) cached.results.lastScanTime = data.lastScanTime;
                    if (data.nextScanEpoch) cached.results.nextScanEpoch = data.nextScanEpoch;
                    if (data.lastScanEpoch) cached.results.lastScanEpoch = data.lastScanEpoch;
                    if (data.nextScanInSeconds !== undefined) cached.results.nextScanInSeconds = data.nextScanInSeconds;
                    cached.results.scanIntervalMinutes = state.scannerResults.scanIntervalMinutes;
                    localStorage.setItem('findashiq_scanner_cache', JSON.stringify(cached));
                }
            }
        } catch (e) { }

        // Immediately refresh the Last Scan / Next Due display & live countdown timer
        updateScannerTimingDisplay({
            ...state.scannerResults,
            ...data
        });
    } catch (e) {
        console.error('Failed to change scan interval:', e);
        showAddUniverseAlert(e.message, 'error');
    }
}

function showAddUniverseAlert(message, type = 'success') {
    const box = document.getElementById('addUniverseAlertBox');
    if (!box) return;
    box.style.display = 'flex';

    if (type === 'error' || type === 'duplicate') {
        box.style.background = 'rgba(239, 68, 68, 0.12)';
        box.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        box.style.color = '#f87171';
        box.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px; height: 16px; flex-shrink: 0;"></i> <span>${message}</span>`;
    } else if (type === 'info') {
        box.style.background = 'rgba(59, 130, 246, 0.12)';
        box.style.border = '1px solid rgba(59, 130, 246, 0.3)';
        box.style.color = '#60a5fa';
        box.innerHTML = `<i data-lucide="info" style="width: 16px; height: 16px; flex-shrink: 0;"></i> <span>${message}</span>`;
    } else {
        box.style.background = 'rgba(16, 185, 129, 0.12)';
        box.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        box.style.color = '#34d399';
        box.innerHTML = `<i data-lucide="check-circle-2" style="width: 16px; height: 16px; flex-shrink: 0;"></i> <span>${message}</span>`;
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: box });

    setTimeout(() => {
        if (box) box.style.display = 'none';
    }, 6500);
}

async function handleAddStockToUniverse(tickerParam) {
    let ticker = tickerParam;
    if (!ticker) {
        const input = document.getElementById('inputAddStockUniverse');
        if (input && input.value.trim()) {
            ticker = input.value.trim().toUpperCase();
        }
    }

    if (!ticker) {
        openAddStockModal('universe');
        return;
    }

    const btn = document.getElementById('btnAddStockUniverse') || document.getElementById('btnOpenAddUniverseModal');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width: 12px; height: 12px; border-width: 2px;"></div> <span>Adding...</span>`;
    }

    try {
        const res = await fetch('/api/scanner/universe/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker })
        });
        const data = await res.json();

        if (res.status === 409 || (!res.ok && data.message && data.message.includes('already in monitoring universe'))) {
            if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(ticker);
            showAddUniverseAlert(data.message || `Stock ${ticker} is already in monitoring universe`, 'duplicate');
            return;
        }

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Failed to add ${ticker} to universe.`);
        }

        if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(ticker);
        showAddUniverseAlert(data.message || `Added stock ${ticker} to universe`, 'success');
        const input = document.getElementById('inputAddStockUniverse');
        if (input) input.value = '';

        if (data.totalUniverse) {
            updateScannerUniverseDisplay(data.totalUniverse);
        }

        // Set search query to the newly added ticker so the user immediately locates it!
        const searchInput = document.getElementById('scannerSearchQuery');
        if (searchInput) {
            searchInput.value = ticker;
            setTimeout(async () => {
                await silentRefreshScannerCache();
                handleScannerSearchFilter(ticker);
            }, 1800);
        }

    } catch (err) {
        console.error('Add stock error:', err);
        showAddUniverseAlert(err.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="plus-circle" style="width: 15px; height: 15px;"></i> <span>Add Stock to Universe</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: btn });
        }
    }
}

function handleScannerSearchFilter(query) {
    const cleanQuery = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('btnClearScannerSearch');
    if (clearBtn) clearBtn.style.display = cleanQuery ? 'block' : 'none';

    const allOpps = state.allScannerOpportunities || state.scannerResults?.opportunities || [];
    if (!cleanQuery) {
        renderScannerResults(allOpps);
        return;
    }

    const filtered = allOpps.filter(opp => {
        const t = (opp.ticker || '').toLowerCase();
        const n = (opp.name || '').toLowerCase();
        const s = (opp.sector || '').toLowerCase();
        const m = (opp.market || '').toLowerCase();
        const cat = (opp.viralCatalyst?.headline || '').toLowerCase();
        const thesis = (opp.aiThesis || '').toLowerCase();

        return t.includes(cleanQuery) || n.includes(cleanQuery) || s.includes(cleanQuery) ||
            m.includes(cleanQuery) || cat.includes(cleanQuery) || thesis.includes(cleanQuery);
    });

    renderScannerResults(filtered);
}

function clearScannerSearch() {
    const input = document.getElementById('scannerSearchQuery');
    if (input) input.value = '';
    handleScannerSearchFilter('');
}

function handleScannerFilterChange(source) {
    const mkt = document.getElementById('scannerSelectMarket');
    const strat = document.getElementById('scannerSelectStrategy');
    const etf = document.getElementById('scannerSelectEtfBasket');

    // Harmonize conflicting dropdowns
    if (source === 'etf' && etf && etf.value !== 'all') {
        if (mkt) mkt.value = 'all';
    } else if (source === 'market' && mkt && mkt.value !== 'all') {
        if (etf && etf.value !== 'all') {
            etf.value = 'all';
        }
    }

    handleRunScanner(false, 100);
}

function resetScannerFilters() {
    const mkt = document.getElementById('scannerSelectMarket');
    const strat = document.getElementById('scannerSelectStrategy');
    const etf = document.getElementById('scannerSelectEtfBasket');
    const sec = document.getElementById('scannerSelectSector');
    const thm = document.getElementById('scannerSelectTheme');
    const cnv = document.getElementById('scannerSelectMinConviction');
    const chkWl = document.getElementById('scanCheckExcludeWatchlist');
    const searchInput = document.getElementById('scannerSearchQuery');

    if (chkWl) chkWl.checked = true;
    if (sec) sec.value = 'all';
    if (thm) thm.value = 'all';
    if (mkt) mkt.value = 'all';
    if (strat) strat.value = 'all';
    if (etf) etf.value = 'all';
    if (cnv) cnv.value = '85';
    if (searchInput) searchInput.value = '';

    handleRunScanner(false, 100);
}

function applyScannerPreset(presetKey) {
    resetScannerFilters();
}

async function handleRunScanner(forceRefresh = false, customLimit = null, silent = false) {
    const btn = document.getElementById('btnRunScanner');
    const market = document.getElementById('scannerSelectMarket')?.value || 'all';
    const strategy = document.getElementById('scannerSelectStrategy')?.value || 'all';
    const etfBasket = document.getElementById('scannerSelectEtfBasket')?.value || 'all';
    const sector = document.getElementById('scannerSelectSector')?.value || 'all';
    const theme = document.getElementById('scannerSelectTheme')?.value || 'all';
    const marketCap = 'all';
    const minConviction = parseInt(document.getElementById('scannerSelectMinConviction')?.value || '85', 10);
    const excludeWatchlist = document.getElementById('scanCheckExcludeWatchlist')?.checked ?? true;

    const limit = customLimit || 100;
    const requiredIndicators = [];

    const grid = document.getElementById('scannerResultsGrid');
    const tableWrap = document.getElementById('scannerTableWrapper');

    if (!silent) {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<div class="spinner" style="width: 14px; height: 14px; border-width: 2px; margin-right: 4px;"></div> <span>Filtering...</span>`;
        }
        if (grid) grid.style.transition = 'opacity 0.2s ease';
        if (tableWrap) tableWrap.style.transition = 'opacity 0.2s ease';
        if (grid) grid.style.opacity = '0.5';
        if (tableWrap) tableWrap.style.opacity = '0.5';
    }

    try {
        // Fast in-memory query to backend (<10ms)
        const res = await fetch('/api/scanner/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                market,
                strategy,
                etfBasket,
                sector,
                theme,
                marketCap,
                minConviction,
                excludeWatchlist,
                requiredIndicators,
                forceRefresh: false,
                limit: limit
            })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to execute market scan.');
        }

        if (limit && data.opportunities && data.opportunities.length > limit) {
            data.opportunities = data.opportunities.slice(0, limit);
        }

        state.scannerResults = data;
        state.allScannerOpportunities = data.opportunities || [];

        try {
            localStorage.setItem('findashiq_scanner_cache', JSON.stringify({
                timestamp: Date.now(),
                results: data,
                criteria: { market, strategy, etfBasket, sector, theme, marketCap, minConviction, limit }
            }));
        } catch (e) { }

        // Update stats aligned with actual matching opportunities
        const statOpp = document.getElementById('scanStatOpportunities');
        const statConv = document.getElementById('scanStatTopConviction');
        const subBadge = document.getElementById('scanResultsSubBadge');
        const topBadge = document.getElementById('topScannerBadge');

        const opps = data.opportunities || [];
        const totalUni = data.totalUniverseScanned || data.totalUniverse || data.totalAssets || state.totalUniverseCount;
        if (totalUni) {
            updateScannerUniverseDisplay(totalUni);
        }
        const matchingCount = typeof data.opportunitiesCount === 'number' ? data.opportunitiesCount : opps.length;
        if (statOpp) statOpp.textContent = `${matchingCount} Found`;
        if (statConv) statConv.textContent = opps.length > 0 ? `${opps[0].convictionScore}%` : '--%';
        if (subBadge) subBadge.textContent = `${matchingCount} Setups`;
        if (topBadge) topBadge.textContent = `${matchingCount} Stock${matchingCount === 1 ? '' : 's'}`;

        updateScannerTimingDisplay(data);
        syncScannerAdminControls(data);

        // Apply recommendation search query if user typed something
        const searchInput = document.getElementById('scannerSearchQuery');
        if (searchInput && searchInput.value.trim()) {
            handleScannerSearchFilter(searchInput.value);
        } else {
            renderScannerResults(opps);
        }

    } catch (err) {
        console.error('Scanner filter error:', err);
    } finally {
        if (!silent) {
            if (grid) grid.style.opacity = '1';
            if (tableWrap) tableWrap.style.opacity = '1';
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i data-lucide="sparkles" style="width: 17px; height: 17px;"></i> <span>Run Scan</span>`;
                if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: btn });
            }
        }
    }
}

function setScannerViewMode(mode) {
    const cleanMode = (mode === 'table') ? 'table' : 'cards';
    state.scannerViewMode = cleanMode;
    try {
        localStorage.setItem('findashiq_scanner_view', cleanMode);
    } catch (e) { }

    const btnCards = document.getElementById('btnScannerViewCards');
    const btnTable = document.getElementById('btnScannerViewTable');
    if (btnCards && btnTable) {
        btnCards.classList.toggle('active', cleanMode === 'cards');
        btnTable.classList.toggle('active', cleanMode === 'table');
    }

    const searchInput = document.getElementById('scannerSearchQuery');
    const q = (searchInput?.value || '').trim();
    if (q) {
        handleScannerSearchFilter(q);
    } else {
        const oppList = state.allScannerOpportunities || state.scannerResults?.opportunities || [];
        renderScannerResults(oppList);
    }
}

// =============================================================
// SCANNER DRAG & DROP REORDERING CONTROLLERS
// =============================================================

let scannerDragState = {
    draggedTicker: null,
    draggedType: null
};

function setupScannerCardDragAndDrop(card, ticker) {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', (e) => {
        scannerDragState.draggedTicker = ticker;
        scannerDragState.draggedType = 'card';
        card.classList.add('is-dragging');
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', ticker);
        }
    });

    card.addEventListener('dragover', (e) => {
        if (!scannerDragState.draggedTicker || scannerDragState.draggedTicker === ticker) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

        const rect = card.getBoundingClientRect();
        const isAfter = (e.clientX - rect.left) > (rect.width / 2);

        card.classList.toggle('drag-over-before', !isAfter);
        card.classList.toggle('drag-over-after', isAfter);
    });

    card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over-before', 'drag-over-after');
    });

    card.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragged = scannerDragState.draggedTicker;
        card.classList.remove('drag-over-before', 'drag-over-after');

        if (!dragged || dragged === ticker) return;

        const rect = card.getBoundingClientRect();
        const isAfter = (e.clientX - rect.left) > (rect.width / 2);

        reorderScannerOpportunities(dragged, ticker, isAfter);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging', 'drag-over-before', 'drag-over-after');
        document.querySelectorAll('.scanner-card').forEach(c => {
            c.classList.remove('is-dragging', 'drag-over-before', 'drag-over-after');
        });
        scannerDragState.draggedTicker = null;
        scannerDragState.draggedType = null;
    });
}

function setupScannerTableRowDragAndDrop(row, ticker) {
    row.setAttribute('draggable', 'true');

    row.addEventListener('dragstart', (e) => {
        scannerDragState.draggedTicker = ticker;
        scannerDragState.draggedType = 'table';
        row.classList.add('is-table-dragging');
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', ticker);
        }
    });

    row.addEventListener('dragover', (e) => {
        if (!scannerDragState.draggedTicker || scannerDragState.draggedTicker === ticker) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

        const rect = row.getBoundingClientRect();
        const isAfter = (e.clientY - rect.top) > (rect.height / 2);

        row.classList.toggle('drag-over-top', !isAfter);
        row.classList.toggle('drag-over-bottom', isAfter);
    });

    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    row.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragged = scannerDragState.draggedTicker;
        row.classList.remove('drag-over-top', 'drag-over-bottom');

        if (!dragged || dragged === ticker) return;

        const rect = row.getBoundingClientRect();
        const isAfter = (e.clientY - rect.top) > (rect.height / 2);

        reorderScannerOpportunities(dragged, ticker, isAfter);
    });

    row.addEventListener('dragend', () => {
        row.classList.remove('is-table-dragging', 'drag-over-top', 'drag-over-bottom');
        document.querySelectorAll('.scanner-table tbody tr').forEach(r => {
            r.classList.remove('is-table-dragging', 'drag-over-top', 'drag-over-bottom');
        });
        scannerDragState.draggedTicker = null;
        scannerDragState.draggedType = null;
    });
}

function reorderScannerOpportunities(draggedTicker, targetTicker, isAfter) {
    const oppList = state.scannerResults?.opportunities;
    if (!Array.isArray(oppList)) return;

    const fromIdx = oppList.findIndex(item => item.ticker === draggedTicker);
    if (fromIdx === -1) return;

    const [draggedItem] = oppList.splice(fromIdx, 1);
    let toIdx = oppList.findIndex(item => item.ticker === targetTicker);
    if (toIdx === -1) {
        oppList.push(draggedItem);
    } else {
        if (isAfter) toIdx++;
        oppList.splice(toIdx, 0, draggedItem);
    }

    try {
        const cachedRaw = localStorage.getItem('findashiq_scanner_cache');
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.results) {
                cached.results.opportunities = oppList;
                localStorage.setItem('findashiq_scanner_cache', JSON.stringify(cached));
            }
        }
    } catch (e) { }

    renderScannerResults(oppList);
}

function renderScannerResults(opportunities) {
    const oppList = Array.isArray(opportunities)
        ? opportunities
        : (opportunities?.opportunities || state.scannerResults?.opportunities || []);

    const viewMode = state.scannerViewMode || localStorage.getItem('findashiq_scanner_view') || 'cards';
    state.scannerViewMode = viewMode;

    const btnCards = document.getElementById('btnScannerViewCards');
    const btnTable = document.getElementById('btnScannerViewTable');
    const subBadge = document.getElementById('scanResultsSubBadge');
    const topBadge = document.getElementById('topScannerBadge');
    if (btnCards && btnTable) {
        btnCards.classList.toggle('active', viewMode === 'cards');
        btnTable.classList.toggle('active', viewMode === 'table');
    }
    if (subBadge) {
        const searchInput = document.getElementById('scannerSearchQuery');
        const q = (searchInput?.value || '').trim();
        const totalCount = (state.allScannerOpportunities || state.scannerResults?.opportunities || []).length;
        if (q && totalCount > 0) {
            subBadge.textContent = `Showing ${oppList.length} of ${totalCount} opportunities`;
        } else {
            subBadge.textContent = `${oppList.length} Setups`;
        }
    }
    if (topBadge) {
        topBadge.textContent = `${oppList.length} Stock${oppList.length === 1 ? '' : 's'}`;
    }
    const statOpp = document.getElementById('scanStatOpportunities');
    if (statOpp) {
        statOpp.textContent = `${oppList.length} Found`;
    }

    const cardsGrid = document.getElementById('scannerResultsGrid');
    const tableWrapper = document.getElementById('scannerTableWrapper');

    if (viewMode === 'table') {
        if (cardsGrid) cardsGrid.style.display = 'none';
        if (tableWrapper) tableWrapper.style.display = 'block';
        renderScannerTable(oppList);
    } else {
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (cardsGrid) cardsGrid.style.display = 'grid';
        renderScannerCards(oppList);
    }

    const scannerContainer = document.getElementById('topView-scanner');
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        if (scannerContainer) {
            lucide.createIcons({ root: scannerContainer });
        } else {
            lucide.createIcons();
        }
    }
}

function renderScannerCards(oppList) {
    const grid = document.getElementById('scannerResultsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!oppList || oppList.length === 0) {
        const searchInput = document.getElementById('scannerSearchQuery');
        const isSearch = searchInput && searchInput.value.trim().length > 0;
        grid.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; color: var(--text-muted);">
                <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
                <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${isSearch ? 'No Opportunities Matched Search Query' : 'No Opportunities Matched Current Filters'}</div>
                <div style="font-size: 0.82rem; margin-top: 4px; color: var(--text-secondary); max-width: 480px; margin: 6px auto 16px auto;">
                    ${isSearch ? `No assets matching "${escapeHtml(searchInput.value)}" found in current scan recommendations.` : 'Try lowering the Minimum AI Conviction threshold, choosing a broader Regional Market, or unchecking "Exclude Watchlist".'}
                </div>
                ${isSearch ? `
                    <button type="button" class="btn-scanner-run" style="margin: 0 auto; display: inline-flex;" onclick="clearScannerSearch()">
                        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                        <span>Clear Search Query</span>
                    </button>
                ` : `
                    <button type="button" class="btn-scanner-run" style="margin: 0 auto; display: inline-flex;" onclick="resetScannerFilters()">
                        <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
                        <span>Reset All Filters &amp; Show All</span>
                    </button>
                `}
            </div>
        `;
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: grid });
        return;
    }

    oppList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'scanner-card';
        if (item.viralCatalyst) {
            card.classList.add('has-viral-catalyst');
        }
        setupScannerCardDragAndDrop(card, item.ticker);

        const isBullish = (item.changePercent || 0) >= 0;
        const sparklineSvg = generateSvgSparkline(item.timeseries || [], isBullish);
        const instCurr = item.currency || 'USD';
        const baseCurr = getUserBaseCurrency();

        const matrix = item.executionMatrix || {};
        const matrixEntry = (matrix.entryLow !== undefined && matrix.entryHigh !== undefined)
            ? `${formatPrice(matrix.entryLow, instCurr, baseCurr)} – ${formatPrice(matrix.entryHigh, instCurr, baseCurr)}`
            : formatPriceOrRange(matrix.entryZone, instCurr, baseCurr);

        const matrixStop = (matrix.stopLossNum !== undefined)
            ? formatPrice(matrix.stopLossNum, instCurr, baseCurr)
            : formatPriceOrRange(matrix.stopLoss, instCurr, baseCurr);

        const matrixTP1 = (matrix.takeProfit1Num !== undefined)
            ? formatPrice(matrix.takeProfit1Num, instCurr, baseCurr)
            : formatPriceOrRange(matrix.takeProfit1, instCurr, baseCurr);

        const priceDisplay = formatPrice(item.currentPrice, instCurr, baseCurr);
        const rsiDisplay = (item.rsi !== null && item.rsi !== undefined) ? item.rsi.toFixed(1) : '--';
        const cmfDisplay = (item.cmf !== null && item.cmf !== undefined) ? `${item.cmf > 0 ? '+' : ''}${item.cmf.toFixed(2)}` : '--';
        const vwapDisplay = item.vwap ? formatPrice(item.vwap, instCurr, baseCurr) : '--';
        const isAlreadyInWatchlist = state.watchlistTickers.includes(item.ticker);

        const marketBadgeMap = {
            'us': '🏛️ US',
            'europe': '🏰 Europe',
            'asia': '🌏 Asia-Pac',
            'emerging': '⚡ Emerging',
            'clean_energy': '🌿 Clean Energy',
            'global_etfs': '📊 ETF'
        };
        const mktBadgeText = marketBadgeMap[item.market] || '🌐 Global';

        const compName = getAssetCompanyName(item.ticker, item);
        card.innerHTML = `
            <div class="scanner-card-header">
                <div class="scanner-card-title-col">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div class="card-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                            <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                        </div>
                        <span class="scanner-card-symbol">${item.ticker}</span>
                        <span class="badge-pill ${item.badgeClass || 'badge-neutral'} scanner-bias-badge">
                            ${item.directionalBias || 'Neutral'}
                        </span>
                        ${item.viralCatalyst ? `
                        <div class="catalyst-indicator-wrapper" onmouseenter="positionCatalystPopover(this)" onclick="handleScannerCatalystClick('${item.ticker}', event)" title="View Catalyst News">
                            <span class="catalyst-dot-pulse" aria-label="Market Catalyst Active"></span>
                            <div class="catalyst-hover-popover">
                                <div class="popover-cat-header">
                                    <span class="popover-cat-tag">${item.viralCatalyst.catalystType || '🔥 Catalyst'}</span>
                                    <span class="popover-cat-vol mono">${item.viralCatalyst.volRatio || ''}</span>
                                </div>
                                <div class="popover-cat-headline">${escapeHtml(item.viralCatalyst.headline || '')}</div>
                                ${item.viralCatalyst.summary ? `<div class="popover-cat-summary">${escapeHtml(item.viralCatalyst.summary)}</div>` : ''}
                                <div class="popover-cat-footer">
                                    <span>${escapeHtml(item.viralCatalyst.publisher || 'Wire')} • ${escapeHtml(item.viralCatalyst.time || 'Active')}</span>
                                    <button type="button" class="popover-cat-btn" onclick="handleScannerCatalystClick('${item.ticker}', event)" title="Open Full News Story">
                                        <span>View News</span>
                                        <i data-lucide="external-link" style="width: 10px; height: 10px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="scanner-card-name" title="${compName}">${compName}</div>
                </div>

                <div class="scanner-card-badges">
                    <span class="badge-pill badge-neutral" style="font-size: 0.68rem; padding: 2px 6px;">
                        ${mktBadgeText}
                    </span>
                    <span class="badge-pill badge-neutral" style="font-size: 0.68rem; padding: 2px 6px;">
                        ${item.sector || 'Equities'}
                    </span>
                    ${item.parentETF ? `
                    <span class="badge-pill" style="font-size: 0.66rem; padding: 1px 6px; background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); border: 1px solid rgba(59, 130, 246, 0.25);">
                        ${item.parentETF}
                    </span>` : ''}
                </div>
            </div>

            <!-- Price & AI Conviction Area -->
            <div class="scanner-card-price-row">
                <div>
                    <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Live Quote</span>
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);" class="mono">${priceDisplay}</div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">AI Conviction</span>
                    <div style="font-size: 1.15rem; font-weight: 800; color: ${item.stanceColor || 'var(--accent-green)'};" class="mono">${item.convictionScore ?? 50}%</div>
                </div>
            </div>

            <!-- Trend Sparkline with Timeframe Axis -->
            ${sparklineSvg}

            <!-- Key Indicators Bar -->
            <div class="card-indicators-bar">
                <div class="card-ind-item">
                    <div class="card-ind-label">SuperTrend</div>
                    <div class="card-ind-val mono" style="color: ${item.superTrend === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)'};">
                        ${item.superTrend === 'bullish' ? '🟢 Bull' : '🔴 Bear'}
                    </div>
                </div>
                <div class="card-ind-item">
                    <div class="card-ind-label">RSI(14)</div>
                    <div class="card-ind-val mono" style="color: ${item.rsi > 70 ? 'var(--accent-red)' : (item.rsi < 35 ? 'var(--accent-green)' : 'var(--text-primary)')};">
                        ${rsiDisplay}
                    </div>
                </div>
                <div class="card-ind-item">
                    <div class="card-ind-label">CMF Flow</div>
                    <div class="card-ind-val mono" style="color: ${item.cmf > 0.05 ? 'var(--accent-green)' : (item.cmf < -0.05 ? 'var(--accent-red)' : 'var(--text-primary)')};">
                        ${cmfDisplay}
                    </div>
                </div>
                <div class="card-ind-item">
                    <div class="card-ind-label">VWAP</div>
                    <div class="card-ind-val mono">${vwapDisplay}</div>
                </div>
            </div>

            <!-- Execution Matrix Box -->
            <div class="scanner-exec-matrix">
                <div class="scanner-exec-row">
                    <span class="scanner-exec-label">🎯 Entry Zone</span>
                    <span class="scanner-exec-val">${matrixEntry}</span>
                </div>
                <div class="scanner-exec-row">
                    <span class="scanner-exec-label">🛑 Volatility Stop-Loss</span>
                    <span class="scanner-exec-val" style="color: var(--accent-red);">${matrixStop} (${matrix.stopLossPercent || '--'})</span>
                </div>
                <div class="scanner-exec-row">
                    <span class="scanner-exec-label">🚀 Take-Profit 1 (TP1)</span>
                    <span class="scanner-exec-val" style="color: var(--accent-green);">${matrixTP1} (${matrix.takeProfit1Percent || '--'})</span>
                </div>
                <div class="scanner-exec-row" style="border-top: 1px dashed var(--border-subtle); padding-top: 4px; margin-top: 2px;">
                    <span class="scanner-exec-label">⚖️ Risk / Reward Ratio</span>
                    <span class="scanner-exec-val" style="color: var(--accent-cyan); font-weight: 800;">${matrix.riskRewardRatio || '2.5:1'}</span>
                </div>
            </div>

            <!-- AI Thesis & Strategy Match -->
            <div class="scanner-thesis-box">
                <div class="scanner-thesis-header">
                    <i data-lucide="brain" style="width: 12px; height: 12px;"></i>
                    <span>AI Thesis &amp; Strategy Confluence</span>
                </div>
                <div class="scanner-thesis-content">${item.aiThesis}</div>
            </div>

            <!-- Action Buttons -->
            <div class="scanner-card-actions">
                ${isAlreadyInWatchlist ? `
                    <button type="button" class="btn-scanner-add-wl in-watchlist" disabled>
                        <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                        <span>In Watchlist</span>
                    </button>
                ` : `
                    <button type="button" class="btn-scanner-add-wl" onclick="addScannedStockToWatchlist('${item.ticker}', this)">
                        <i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i>
                        <span>Add to Watchlist</span>
                    </button>
                `}
                <button type="button" class="btn-scanner-deepdive" onclick="openStockDeepDive('${item.ticker}')" title="Deep Dive ${item.ticker}">
                    <i data-lucide="line-chart" style="width: 13px; height: 13px;"></i>
                    <span>Deep Dive</span>
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function renderScannerTable(oppList) {
    const tbody = document.getElementById('scannerTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!oppList || oppList.length === 0) {
        const searchInput = document.getElementById('scannerSearchQuery');
        const isSearch = searchInput && searchInput.value.trim().length > 0;
        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 48px; color: var(--text-muted);">
                    <div style="font-size: 1.8rem; margin-bottom: 8px;">🔍</div>
                    <div style="font-weight: 700; color: var(--text-primary);">${isSearch ? 'No Opportunities Matched Search Query' : 'No Opportunities Matched Current Filters'}</div>
                    <div style="font-size: 0.8rem; margin-top: 4px; margin-bottom: 16px; color: var(--text-secondary);">
                        ${isSearch ? `No assets matching "${escapeHtml(searchInput.value)}" found in current scan recommendations.` : 'Try adjusting your scanner filter criteria or running a fresh scan.'}
                    </div>
                    ${isSearch ? `
                        <button type="button" class="btn-scanner-run" style="margin: 0 auto; display: inline-flex;" onclick="clearScannerSearch()">
                            <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                            <span>Clear Search Query</span>
                        </button>
                    ` : `
                        <button type="button" class="btn-scanner-run" style="margin: 0 auto; display: inline-flex;" onclick="resetScannerFilters()">
                            <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
                            <span>Reset All Filters &amp; Show All</span>
                        </button>
                    `}
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            const tableWrap = document.getElementById('scannerTableWrapper');
            lucide.createIcons({ root: tableWrap || document.body });
        }
        return;
    }

    oppList.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'scanner-table-row';
        setupScannerTableRowDragAndDrop(tr, item.ticker);

        const isBullish = (item.changePercent || 0) >= 0;
        const instCurr = item.currency || 'USD';
        const baseCurr = getUserBaseCurrency();

        const matrix = item.executionMatrix || {};
        const matrixEntry = (matrix.entryLow !== undefined && matrix.entryHigh !== undefined)
            ? `${formatPrice(matrix.entryLow, instCurr, baseCurr)} – ${formatPrice(matrix.entryHigh, instCurr, baseCurr)}`
            : formatPriceOrRange(matrix.entryZone, instCurr, baseCurr);

        const matrixStop = (matrix.stopLossNum !== undefined)
            ? formatPrice(matrix.stopLossNum, instCurr, baseCurr)
            : formatPriceOrRange(matrix.stopLoss, instCurr, baseCurr);

        const matrixTP1 = (matrix.takeProfit1Num !== undefined)
            ? formatPrice(matrix.takeProfit1Num, instCurr, baseCurr)
            : formatPriceOrRange(matrix.takeProfit1, instCurr, baseCurr);

        const priceDisplay = formatPrice(item.currentPrice, instCurr, baseCurr);
        const rsiDisplay = (item.rsi !== null && item.rsi !== undefined) ? item.rsi.toFixed(1) : '--';
        const cmfDisplay = (item.cmf !== null && item.cmf !== undefined) ? `${item.cmf > 0 ? '+' : ''}${item.cmf.toFixed(2)}` : '--';
        const vwapDisplay = item.vwap ? formatPrice(item.vwap, instCurr, baseCurr) : '--';
        const isAlreadyInWatchlist = state.watchlistTickers.includes(item.ticker);

        const compName = getAssetCompanyName(item.ticker, item);
        const sixMonthHtml = formatTablePeriodChange(item.timeseries || []);

        tr.innerHTML = `
            <td class="col-sticky-drag" style="width: 32px; padding: 12px 4px 12px 12px; text-align: center;">
                <div class="table-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                    <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                </div>
            </td>
            <td class="col-sticky-asset">
                <div style="display: flex; flex-direction: column; gap: 1px; min-width: 0;">
                    <span class="watchlist-table-ticker">${item.ticker}</span>
                    <span class="watchlist-table-name" title="${compName}">${compName}</span>
                    <span class="watchlist-table-sector">${item.sector || 'Equities'}</span>
                </div>
            </td>
            <td style="text-align: right;">
                <div class="mono" style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${priceDisplay}</div>
            </td>
            <td style="text-align: right;">
                <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.75rem; padding: 2px 8px;">
                    ${isBullish ? '+' : ''}${(item.changePercent || 0).toFixed(2)}%
                </span>
            </td>
            <td style="text-align: center;">
                ${sixMonthHtml}
            </td>
            <td style="text-align: center;">
                <span class="badge-pill ${item.superTrend === 'bullish' ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.72rem; padding: 2px 7px;">
                    ${item.superTrend === 'bullish' ? '🟢 Bull' : '🔴 Bear'}
                </span>
            </td>
            <td style="text-align: center;">
                <span class="mono" style="font-weight: 700; font-size: 0.82rem; color: ${item.rsi > 70 ? 'var(--accent-red)' : (item.rsi < 35 ? 'var(--accent-green)' : 'var(--text-primary)')};">${rsiDisplay}</span>
            </td>
            <td style="text-align: center;">
                <span class="mono" style="font-weight: 600; font-size: 0.82rem; color: ${item.cmf > 0.05 ? 'var(--accent-green)' : (item.cmf < -0.05 ? 'var(--accent-red)' : 'var(--text-muted)')};">${cmfDisplay}</span>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                    <span class="mono" style="font-weight: 800; font-size: 0.88rem; color: ${item.stanceColor || 'var(--accent-green)'};">${item.convictionScore ?? 50}%</span>
                    <span class="badge-pill ${item.badgeClass || 'badge-neutral'}" style="font-size: 0.65rem; padding: 1px 6px;">${item.directionalBias || 'Neutral'}</span>
                </div>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;" title="Entry: ${matrixEntry}&#10;Stop Loss: ${matrixStop}&#10;Take Profit: ${matrixTP1}&#10;Risk/Reward: ${matrix.riskRewardRatio || '2.5:1'}">
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 7px; background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); font-weight: 700; font-family: 'JetBrains Mono', monospace; cursor: help;">
                        ${matrix.riskRewardRatio || '2.5:1'}
                    </span>
                    <div style="font-size: 0.68rem; color: var(--text-muted); display: flex; gap: 3px;" class="mono">
                        <span style="color: var(--accent-red);" title="Stop Loss">${matrixStop}</span>/<span style="color: var(--accent-green);" title="Take Profit">${matrixTP1}</span>
                    </div>
                </div>
            </td>
            <td style="font-size: 0.75rem; color: var(--text-secondary); max-width: 220px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${item.viralCatalyst ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span class="badge-pill clickable" style="font-size: 0.63rem; padding: 1px 6px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(239, 68, 68, 0.22)); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" onclick="handleScannerCatalystClick('${item.ticker}', event)" title="Click to view news: ${escapeHtml(item.viralCatalyst.headline)}">
                            <span>${item.viralCatalyst.catalystType || '🔥 Catalyst'}</span>
                            <i data-lucide="external-link" style="width: 8px; height: 8px;"></i>
                        </span>
                    </div>` : ''}
                    <div style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.35;" title="${escapeHtml(item.aiThesis || '')}">
                        ${item.aiThesis || '--'}
                    </div>
                </div>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button type="button" class="btn-table-action" onclick="openStockDeepDive('${item.ticker}')" title="Deep Dive Analysis">
                        <i data-lucide="arrow-right-circle" style="width: 14px; height: 14px;"></i>
                        <span>Deep Dive</span>
                    </button>
                    ${isAlreadyInWatchlist ? `
                        <button type="button" class="btn-table-action in-watchlist" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.3); color: var(--accent-green);" disabled title="Already in Watchlist">
                            <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                        </button>
                    ` : `
                        <button type="button" class="btn-table-action" onclick="addScannedStockToWatchlist('${item.ticker}', this)" title="Add to Watchlist">
                            <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                        </button>
                    `}
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

async function addScannedStockToWatchlist(ticker, btn) {
    if (!ticker) return;
    const cleanTicker = String(ticker).trim().toUpperCase();

    if (!state.watchlistTickers.includes(cleanTicker)) {
        state.watchlistTickers.push(cleanTicker);
        renderWatchlistTags();
        await saveWatchlistServer();
        // Background fetch data for new stock
        fetchWatchlistAnalysis(false);
    }

    if (btn) {
        btn.classList.add('in-watchlist');
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> <span>In Watchlist</span>`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: btn });
    }

    const badge = document.getElementById('topWatchlistCount');
    if (badge) badge.textContent = `${state.watchlistTickers.length} Stocks`;
}

// Global alias for backwards compatibility
if (typeof window !== 'undefined') {
    window.addTickerFromScanner = addScannedStockToWatchlist;
    window.addScannedStockToWatchlist = addScannedStockToWatchlist;
}

// -------------------------------------------------------------
// SIGNAL ALERTS & NOTIFICATIONS HUB
// -------------------------------------------------------------