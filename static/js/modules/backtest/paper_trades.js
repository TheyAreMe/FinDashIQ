function getPaperTradesStorageKey() {
    const userKey = state.user?.username ? `_${state.user.username.toLowerCase().trim()}` : '_guest';
    return `findashiq_paper_trades${userKey}`;
}

/**
 * Load paper trades from persistent server API with user account isolation
 */
async function loadPaperTrades() {
    // 1. Instant cache hydration: Render from local storage immediately for 0ms UI painting
    try {
        const raw = localStorage.getItem(getPaperTradesStorageKey());
        if (raw) {
            const cachedList = JSON.parse(raw);
            if (Array.isArray(cachedList)) {
                state.paperTrades = cachedList;
                renderPaperTrades();
            }
        }
    } catch (e) { }

    // 2. Asynchronously sync with backend server
    try {
        const res = await fetch('/api/paper-trades');
        if (res.ok) {
            const data = await res.json();
            const list = data.trades || data.paperTrades;
            if (data && Array.isArray(list)) {
                state.paperTrades = list;
                try {
                    localStorage.setItem(getPaperTradesStorageKey(), JSON.stringify(list));
                } catch (e) { }
                renderPaperTrades();
                // Proactively refresh live quotes if any open positions lack current market price
                const hasOpenMissing = list.some(t => {
                    if ((t.status || 'OPEN').toUpperCase() === 'CLOSED') return false;
                    const s = state.stocksData[t.ticker] || state.watchlistData?.[t.ticker];
                    return !s || (!s.currentPrice && !s.profile?.currentPrice);
                });
                if (hasOpenMissing) {
                    refreshPaperTradesLive();
                }
                return;
            }
        }
    } catch (e) {
        console.warn('Could not sync paper trades with backend server, using localStorage fallback:', e);
    }

    // Fallback to local storage for current user if offline
    try {
        const raw = localStorage.getItem(getPaperTradesStorageKey());
        if (raw) {
            state.paperTrades = JSON.parse(raw);
        } else if (!state.paperTrades) {
            state.paperTrades = [];
        }
    } catch (e) {
        if (!state.paperTrades) state.paperTrades = [];
    }
    renderPaperTrades();

    const hasOpenMissing = (state.paperTrades || []).some(t => {
        if ((t.status || 'OPEN').toUpperCase() === 'CLOSED') return false;
        const s = state.stocksData[t.ticker] || state.watchlistData?.[t.ticker];
        return !s || (!s.currentPrice && !s.profile?.currentPrice);
    });
    if (hasOpenMissing) {
        refreshPaperTradesLive();
    }
}

/**
 * Live Mark-to-Market Refresh for all active paper trading positions without switching tabs
 */
async function refreshPaperTradesLive(event) {
    if (event) {
        try {
            event.preventDefault();
            event.stopPropagation();
        } catch (e) { }
    }
    const btn = document.getElementById('btnRefreshPaperTrades');
    if (btn && btn.classList.contains('syncing')) return;
    if (btn) btn.classList.add('syncing');

    const icon = btn?.querySelector('.sync-icon');
    if (icon) icon.classList.add('spinning');
    const label = btn?.querySelector('.refresh-label');
    if (label) label.textContent = 'Updating...';

    try {
        // 1. Re-sync paper trades from server API
        try {
            const ptRes = await fetch('/api/paper-trades');
            if (ptRes.ok) {
                const ptData = await ptRes.json();
                const list = ptData.trades || ptData.paperTrades;
                if (Array.isArray(list)) {
                    state.paperTrades = list;
                    try {
                        localStorage.setItem(getPaperTradesStorageKey(), JSON.stringify(list));
                    } catch (e) { }
                }
            }
        } catch (e) {
            console.warn('Paper trades re-sync warning:', e);
        }

        // 2. Identify all open position symbols
        const openTickers = [...new Set(
            (state.paperTrades || [])
                .filter(t => (t.status || 'OPEN').toUpperCase() !== 'CLOSED')
                .map(t => (t.ticker || '').toUpperCase().trim())
                .filter(Boolean)
        )];

        // 3. Batch fetch fresh live quotes and historical bars if open positions exist
        if (openTickers.length > 0) {
            const resp = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tickers: openTickers,
                    period: '1mo',
                    interval: '1d',
                    phase: 'fast',
                    forceRefresh: true
                })
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.stocks) {
                    Object.keys(data.stocks).forEach(tk => {
                        const fresh = data.stocks[tk];
                        const existing = state.stocksData[tk] || {};
                        const curPrice = (typeof fresh.currentPrice === 'number' && fresh.currentPrice > 0)
                            ? fresh.currentPrice
                            : (fresh.profile && typeof fresh.profile.currentPrice === 'number' && fresh.profile.currentPrice > 0)
                                ? fresh.profile.currentPrice
                                : (fresh.timeseries && fresh.timeseries.length > 0 ? fresh.timeseries[fresh.timeseries.length - 1].close : null);
                        state.stocksData[tk] = {
                            ...existing,
                            ...fresh,
                            currentPrice: curPrice !== null ? curPrice : existing.currentPrice
                        };
                    });
                }
            }
        }

        // 4. Render updated positions in place with new mark-to-market valuations
        renderPaperTrades();

        // 5. Visual success feedback
        if (btn) btn.classList.add('synced');
        if (label) label.textContent = 'Updated!';
    } catch (err) {
        console.error('Failed to update paper trade positions live:', err);
        if (label) label.textContent = 'Failed';
    } finally {
        setTimeout(() => {
            const currentBtn = document.getElementById('btnRefreshPaperTrades');
            const currentIcon = currentBtn?.querySelector('.sync-icon');
            const currentLabel = currentBtn?.querySelector('.refresh-label');

            if (currentIcon) currentIcon.classList.remove('spinning');
            if (currentBtn) {
                currentBtn.classList.remove('syncing');
                currentBtn.classList.remove('synced');
            }
            if (currentLabel) currentLabel.textContent = 'Update Positions';
        }, 1200);
    }
}
window.refreshPaperTradesLive = refreshPaperTradesLive;

/**
 * Render Paper Trading Positions Table
 */
function renderPaperTrades() {
    const tbody = document.getElementById('paperTradesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const trades = state.paperTrades || [];
    if (trades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; color: var(--text-muted); padding: 25px;">No paper trades active. Click [ + New Paper Trade ] to simulate forward execution.</td></tr>';
        return;
    }

    const baseCurr = getUserBaseCurrency();

    trades.slice().reverse().forEach((t, i) => {
        const tr = document.createElement('tr');
        const isLong = (t.side || 'LONG').toUpperCase() === 'LONG';
        const isClosed = (t.status || 'OPEN').toUpperCase() === 'CLOSED';
        const stock = state.stocksData[t.ticker] || state.watchlistData?.[t.ticker] || {};
        const profile = stock.profile || {};
        const instCurr = profile.currency || 'USD';

        // Calculate live price
        let currentPrice = typeof t.exitPrice === 'number' ? t.exitPrice : null;
        if (!isClosed) {
            if (typeof stock.currentPrice === 'number' && stock.currentPrice > 0) {
                currentPrice = stock.currentPrice;
            } else if (profile && typeof profile.currentPrice === 'number' && profile.currentPrice > 0) {
                currentPrice = profile.currentPrice;
            } else if (stock.timeseries && stock.timeseries.length > 0) {
                currentPrice = stock.timeseries[stock.timeseries.length - 1].close;
            } else {
                currentPrice = t.entryPrice;
            }
        }

        // Calculate Course Development & PnL since Buy
        let pnl = t.realizedPnl || 0;
        let pnlPct = t.realizedPnlPct || 0;
        if (!isClosed && typeof currentPrice === 'number' && typeof t.entryPrice === 'number' && t.entryPrice > 0) {
            if (isLong) {
                pnl = (currentPrice - t.entryPrice) * (t.shares || 1);
                pnlPct = ((currentPrice - t.entryPrice) / t.entryPrice) * 100;
            } else {
                pnl = (t.entryPrice - currentPrice) * (t.shares || 1);
                pnlPct = ((t.entryPrice - currentPrice) / t.entryPrice) * 100;
            }
        }

        const isProfit = pnl >= 0;

        // Check if active position triggered SL or TP
        let triggerBadgeHtml = '';
        if (!isClosed && typeof currentPrice === 'number') {
            if (t.stopLoss && typeof t.stopLoss === 'number') {
                const slHit = isLong ? currentPrice <= t.stopLoss : currentPrice >= t.stopLoss;
                if (slHit) {
                    triggerBadgeHtml = '<span class="badge-pill badge-bearish" style="font-size: 0.65rem; margin-left: 4px; padding: 1px 5px;" title="Current price has hit or passed Stop-Loss level">SL Hit</span>';
                }
            }
            if (!triggerBadgeHtml && t.takeProfit && typeof t.takeProfit === 'number') {
                const tpHit = isLong ? currentPrice >= t.takeProfit : currentPrice <= t.takeProfit;
                if (tpHit) {
                    triggerBadgeHtml = '<span class="badge-pill badge-bullish" style="font-size: 0.65rem; margin-left: 4px; padding: 1px 5px;" title="Current price has reached Take-Profit target">TP Hit</span>';
                }
            }
        }

        const compName = getAssetCompanyName(t.ticker, stock);
        const allocatedCap = t.capital || ((t.entryPrice || 0) * (t.shares || 1));

        tr.innerHTML = `
            <td class="mono" style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(t.id || String(i + 1))}</td>
            <td>
                <span class="mono" style="font-weight: 800; color: var(--accent-cyan); cursor: pointer;" onclick="setBacktestTicker('${escapeHtml(t.ticker)}')" title="${escapeHtml(compName)} (${escapeHtml(t.ticker)})">
                    ${escapeHtml(t.ticker)}
                </span>
            </td>
            <td>
                <span class="badge-pill ${isLong ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.70rem; padding: 2px 6px;">
                    ${isLong ? 'LONG' : 'SHORT'}
                </span>
            </td>
            <td class="mono">${Number(t.shares || 1).toFixed(2)}</td>
            <td class="mono">${formatPrice(t.entryPrice, instCurr, baseCurr)}</td>
            <td class="mono" style="font-weight: 700; color: var(--text-primary);">${formatPrice(currentPrice || t.entryPrice, instCurr, baseCurr)}</td>
            <td class="mono">${formatPrice(allocatedCap, instCurr, baseCurr, 0)}</td>
            <td class="mono" style="color: var(--accent-red); font-size: 0.76rem;">${t.stopLoss ? formatPrice(t.stopLoss, instCurr, baseCurr) : '--'}</td>
            <td class="mono" style="color: var(--accent-green); font-size: 0.76rem;">${t.takeProfit ? formatPrice(t.takeProfit, instCurr, baseCurr) : '--'}</td>
            <td class="mono" style="font-weight: 800; color: ${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'};">
                ${isProfit ? '+' : '-'}${formatPrice(Math.abs(pnl), instCurr, baseCurr)}
            </td>
            <td class="mono" style="font-weight: 800; color: ${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'};">
                ${isProfit ? '+' : ''}${pnlPct.toFixed(2)}%
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span class="badge-pill ${isClosed ? 'badge-neutral' : 'badge-bullish'}" style="font-size: 0.68rem; padding: 2px 5px;">
                        ${isClosed ? 'CLOSED' : 'ACTIVE'}
                    </span>
                    ${triggerBadgeHtml}
                </div>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                    ${!isClosed ? `
                        <button type="button" class="btn-toggle" onclick="closePaperTradePosition('${escapeHtml(t.id)}', ${currentPrice})" style="padding: 3px 8px; font-size: 0.70rem; color: var(--accent-amber); border-color: rgba(245, 158, 11, 0.35);" title="Close position at current market price">
                            Close
                        </button>
                    ` : ''}
                    <button type="button" class="btn-table-remove btn-icon" onclick="deletePaperTrade('${escapeHtml(t.id)}')" title="Delete Record" aria-label="Delete Record" style="width: 24px; height: 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: tbody });
}

/**
 * Populate AI Tactical Execution Levels in the Paper Trade Modal
 */
/**
 * Render Quick Selection Pills for active Watchlist & Backtest assets in Paper Trade Modal
 */
function renderPtAssetQuickPills(activeTicker) {
    const container = document.getElementById('ptAssetQuickPills');
    if (!container) return;

    const candidateTickers = new Set([
        ...(state.watchlistTickers || []),
        ...(state.backtestTickers || []),
        state.activeTicker,
        'NVDA', 'MSFT', 'AAPL', 'TSLA', 'SPCX', 'PLTR', 'TSM', 'IFX.DE'
    ]);

    const cleanActive = (activeTicker || state.activeTicker || 'NVDA').toUpperCase().trim();
    const pills = [];
    candidateTickers.forEach(t => {
        if (!t) return;
        const cleanT = String(t).toUpperCase().trim();
        if (cleanT && !pills.includes(cleanT)) pills.push(cleanT);
    });

    container.innerHTML = pills.slice(0, 10).map(t => `
        <button type="button" class="pt-asset-pill ${t === cleanActive ? 'active' : ''}" onclick="selectPtTicker('${t}')">
            ${t}
        </button>
    `).join('');
}

/**
 * Set Order Side (LONG / SHORT) via modern segmented control
 */
function setPtOrderSide(side) {
    const sideInput = document.getElementById('ptModalSide');
    const btnLong = document.getElementById('ptSideBtnLong');
    const btnShort = document.getElementById('ptSideBtnShort');
    const resolved = (side || 'LONG').toUpperCase();

    if (sideInput) sideInput.value = resolved;
    if (btnLong) {
        if (resolved === 'LONG') btnLong.classList.add('active-long');
        else btnLong.classList.remove('active-long');
    }
    if (btnShort) {
        if (resolved === 'SHORT') btnShort.classList.add('active-short');
        else btnShort.classList.remove('active-short');
    }
    updatePtLiveCalculations();
}

/**
 * Set Capital from Quick Preset Chips
 */
function setPtCapital(amount) {
    const capEl = document.getElementById('ptModalCapital');
    if (capEl) capEl.value = amount;
    updatePtLiveCalculations();
}

/**
 * Revert Entry Price to Live Market Price
 */
function revertPtToLivePrice() {
    const ticker = document.getElementById('ptModalTicker')?.value || state.activeTicker || 'NVDA';
    const cleanT = ticker.toUpperCase().trim();
    const stock = state.stocksData?.[cleanT] || state.watchlistData?.[cleanT] || {};
    const priceVal = stock.currentPrice || stock.profile?.currentPrice || (stock.timeseries?.length ? stock.timeseries[stock.timeseries.length - 1].close : null);
    const priceEl = document.getElementById('ptModalEntryPrice');
    if (priceEl && priceVal) {
        priceEl.value = Number(priceVal).toFixed(2);
        updatePtLiveCalculations();
    }
}

/**
 * Apply Stop Loss Percentage Preset (e.g. 5 for -5%)
 */
function applyPtSlPreset(pct) {
    const priceEl = document.getElementById('ptModalEntryPrice');
    const slEl = document.getElementById('ptModalStopLoss');
    const side = (document.getElementById('ptModalSide')?.value || 'LONG').toUpperCase();
    const isLong = side === 'LONG';
    const entryPrice = parseFloat(priceEl?.value) || 100;

    if (slEl && entryPrice > 0) {
        const sl = isLong ? entryPrice * (1 - pct / 100) : entryPrice * (1 + pct / 100);
        slEl.value = Math.max(0.01, sl).toFixed(2);
        updatePtLiveCalculations();
    }
}

/**
 * Apply Take Profit Percentage Preset (e.g. 12 for +12%)
 */
function applyPtTpPreset(pct) {
    const priceEl = document.getElementById('ptModalEntryPrice');
    const tpEl = document.getElementById('ptModalTakeProfit');
    const side = (document.getElementById('ptModalSide')?.value || 'LONG').toUpperCase();
    const isLong = side === 'LONG';
    const entryPrice = parseFloat(priceEl?.value) || 100;

    if (tpEl && entryPrice > 0) {
        const tp = isLong ? entryPrice * (1 + pct / 100) : entryPrice * (1 - pct / 100);
        tpEl.value = Math.max(0.01, tp).toFixed(2);
        updatePtLiveCalculations();
    }
}

/**
 * Set Strategy Tag
 */
function setPtReason(text) {
    const reasonEl = document.getElementById('ptModalReason');
    if (reasonEl) reasonEl.value = text;
}

/**
 * Populate Paper Trade Quote Badge
 */
function populatePtAiLevels(ticker) {
    const cleanT = (ticker || state.activeTicker || '').toUpperCase().trim();
    const stock = state.stocksData?.[cleanT] || state.watchlistData?.[cleanT] || (cleanT === (state.activeTicker || '').toUpperCase() ? state.stocksData?.[state.activeTicker] : null) || {};
    const profile = stock.profile || {};
    let currentPrice = profile.currentPrice || stock.currentPrice || (stock.timeseries?.length ? stock.timeseries[stock.timeseries.length - 1].close : null);
    const changePct = profile.changePercent !== undefined ? profile.changePercent : (stock.changePercent !== undefined ? stock.changePercent : null);
    const isBull = (changePct || 0) >= 0;

    // Quote Badge
    const quoteBadge = document.getElementById('ptAssetQuoteBadge');
    if (quoteBadge) {
        let badgeHtml = currentPrice ? `<span style="color: var(--text-primary); font-weight: 700;">$${Number(currentPrice).toFixed(2)}</span>` : '';
        if (changePct !== null && changePct !== undefined) {
            const col = isBull ? 'var(--accent-green)' : 'var(--accent-red)';
            badgeHtml += ` <span style="color: ${col}; font-weight: 700;">(${isBull ? '+' : ''}${Number(changePct).toFixed(2)}%)</span>`;
        }
        quoteBadge.innerHTML = badgeHtml;
    }
}

/**
 * Recalculate Live Risk/Reward, Shares, Distance Badges, and Risk Amounts
 */
function updatePtLiveCalculations() {
    const capital = parseFloat(document.getElementById('ptModalCapital')?.value) || 0;
    const entryPrice = parseFloat(document.getElementById('ptModalEntryPrice')?.value) || 0;
    const stopLoss = parseFloat(document.getElementById('ptModalStopLoss')?.value) || 0;
    const takeProfit = parseFloat(document.getElementById('ptModalTakeProfit')?.value) || 0;
    const side = (document.getElementById('ptModalSide')?.value || 'LONG').toUpperCase();
    const isLong = side === 'LONG';

    const shares = entryPrice > 0 ? (capital / entryPrice) : 0;

    // Update approx shares under entry price
    const sharesCalcEl = document.getElementById('ptLiveSharesCalc');
    if (sharesCalcEl) sharesCalcEl.textContent = shares > 0 ? shares.toFixed(2) : '0.00';

    let riskPerShare = 0;
    let rewardPerShare = 0;

    if (isLong) {
        if (stopLoss > 0) riskPerShare = Math.max(0, entryPrice - stopLoss);
        if (takeProfit > 0) rewardPerShare = Math.max(0, takeProfit - entryPrice);
    } else {
        if (stopLoss > 0) riskPerShare = Math.max(0, stopLoss - entryPrice);
        if (takeProfit > 0) rewardPerShare = Math.max(0, entryPrice - takeProfit);
    }

    const totalRisk = riskPerShare * shares;
    const totalReward = rewardPerShare * shares;
    const riskPct = entryPrice > 0 ? (riskPerShare / entryPrice) * 100 : 0;
    const rewardPct = entryPrice > 0 ? (rewardPerShare / entryPrice) * 100 : 0;

    // Update distance badges
    const slBadge = document.getElementById('ptSlDistanceBadge');
    if (slBadge) {
        slBadge.textContent = riskPct > 0 ? `-${riskPct.toFixed(1)}%` : '--';
    }
    const tpBadge = document.getElementById('ptTpDistanceBadge');
    if (tpBadge) {
        tpBadge.textContent = rewardPct > 0 ? `+${rewardPct.toFixed(1)}%` : '--';
    }

    const sharesEl = document.getElementById('ptLiveShares');
    if (sharesEl) sharesEl.textContent = shares > 0 ? shares.toFixed(2) : '0.00';

    const riskAmtEl = document.getElementById('ptLiveRiskAmt');
    if (riskAmtEl) riskAmtEl.textContent = totalRisk > 0 ? `-$${totalRisk.toFixed(2)}` : '$0.00';

    const riskPctEl = document.getElementById('ptLiveRiskPct');
    if (riskPctEl) riskPctEl.textContent = riskPct > 0 ? `(-${riskPct.toFixed(1)}%)` : '(0.0%)';

    const rewardAmtEl = document.getElementById('ptLiveRewardAmt');
    if (rewardAmtEl) rewardAmtEl.textContent = totalReward > 0 ? `+$${totalReward.toFixed(2)}` : '$0.00';

    const rewardPctEl = document.getElementById('ptLiveRewardPct');
    if (rewardPctEl) rewardPctEl.textContent = rewardPct > 0 ? `(+${rewardPct.toFixed(1)}%)` : '(0.0%)';

    const rrEl = document.getElementById('ptLiveRiskReward');
    if (rrEl) {
        if (totalRisk > 0 && totalReward > 0) {
            const ratio = (totalReward / totalRisk).toFixed(1);
            rrEl.textContent = `${ratio} : 1`;
            if (parseFloat(ratio) >= 2.0) {
                rrEl.style.color = 'var(--accent-green)';
            } else if (parseFloat(ratio) >= 1.0) {
                rrEl.style.color = 'var(--accent-amber)';
            } else {
                rrEl.style.color = 'var(--accent-red)';
            }
        } else {
            rrEl.textContent = '2.4 : 1';
            rrEl.style.color = 'var(--text-primary)';
        }
    }
}

/**
 * Open Paper Trade Modal
 */
function openNewPaperTradeModal(ticker = null, side = null, entryPrice = null) {
    const targetTicker = (ticker || state.activeTicker || state.backtestTicker || 'NVDA').toUpperCase().trim();
    const modal = document.getElementById('paperTradeModal');
    if (!modal) return;

    const stock = state.stocksData?.[targetTicker] || state.watchlistData?.[targetTicker] || {};
    const ai = stock.aiAnalysis || {};
    const levels = ai.tradeLevels || {};

    // Auto-detect side if not explicitly provided
    let resolvedSide = side ? side.toUpperCase() : 'LONG';
    if (!side) {
        if (stock.decision?.action && stock.decision.action.toUpperCase().includes('SELL')) {
            resolvedSide = 'SHORT';
        }
    }

    // Render Quick Selection Pills
    renderPtAssetQuickPills(targetTicker);

    // Populate search field and hidden value
    const searchEl = document.getElementById('ptTickerSearchInput');
    const hiddenTickerEl = document.getElementById('ptModalTicker');
    const priceEl = document.getElementById('ptModalEntryPrice');
    const capEl = document.getElementById('ptModalCapital');
    const slEl = document.getElementById('ptModalStopLoss');
    const tpEl = document.getElementById('ptModalTakeProfit');
    const reasonEl = document.getElementById('ptModalReason');

    if (searchEl) {
        const companyName = getAssetCompanyName(targetTicker, stock);
        searchEl.value = companyName !== targetTicker ? `${targetTicker} \u2013 ${companyName}` : targetTicker;
    }
    const clearBtn = document.getElementById('ptTickerClearBtn');
    if (clearBtn) clearBtn.style.display = searchEl?.value ? 'flex' : 'none';

    if (hiddenTickerEl) hiddenTickerEl.value = targetTicker;
    setPtOrderSide(resolvedSide);
    if (capEl && !capEl.value) capEl.value = 5000;

    let defaultPrice = entryPrice;
    if (!defaultPrice) {
        if (stock.currentPrice) defaultPrice = stock.currentPrice;
        else if (stock.profile?.currentPrice) defaultPrice = stock.profile.currentPrice;
        else if (levels.currentPrice) defaultPrice = levels.currentPrice;
        else if (levels.entryLow) defaultPrice = levels.entryLow;
        else if (stock.timeseries?.length) defaultPrice = stock.timeseries[stock.timeseries.length - 1].close;
        else defaultPrice = 100;
    }
    if (priceEl && defaultPrice) priceEl.value = Number(defaultPrice).toFixed(2);

    // Quote badge
    populatePtAiLevels(targetTicker);

    // Pre-fill Stop Loss (-5%) & Take Profit (+12%)
    if (slEl && defaultPrice) {
        const sl = resolvedSide === 'SHORT' ? defaultPrice * 1.05 : defaultPrice * 0.95;
        slEl.value = Number(sl).toFixed(2);
    }

    if (tpEl && defaultPrice) {
        const tp = resolvedSide === 'SHORT' ? defaultPrice * 0.88 : defaultPrice * 1.12;
        tpEl.value = Number(tp).toFixed(2);
    }

    if (reasonEl) {
        const strategy = stock.decision?.primaryStrategy || stock.signals?.primaryStrategy;
        const bias = stock.decision?.bias || (resolvedSide === 'SHORT' ? 'Bearish' : 'Bullish');
        if (strategy) {
            reasonEl.value = `${strategy} (${bias} Setup)`;
        } else {
            reasonEl.value = `Quantitative ${bias} Setup`;
        }
    }

    if (tpEl) {
        if (levels.target1) {
            tpEl.value = Number(levels.target1).toFixed(2);
        } else if (defaultPrice) {
            tpEl.value = Number(defaultPrice * (resolvedSide === 'SHORT' ? 0.90 : 1.12)).toFixed(2);
        }
    }

    if (reasonEl) {
        const strategy = stock.decision?.primaryStrategy || stock.signals?.primaryStrategy;
        const bias = stock.decision?.bias || 'Bullish';
        if (strategy) {
            reasonEl.value = `${strategy} (${bias} Tactical Setup)`;
        } else {
            reasonEl.value = `AI Execution Matrix ${bias} Setup`;
        }
    }

    updatePtLiveCalculations();
    hidePtTickerDropdown();
    modal.style.display = 'flex';
    modal.classList.add('active');
    syncModalBodyScroll();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons({ root: modal });
}

/**
 * Deep-link from AI Matrix Tactical Card
 */
function openPaperTradeModalFromMatrix() {
    const ticker = state.activeTicker || 'NVDA';
    const stock = state.stocksData?.[ticker];
    let side = 'LONG';
    if (stock && stock.decision && stock.decision.action && stock.decision.action.includes('SELL')) {
        side = 'SHORT';
    }
    openNewPaperTradeModal(ticker, side);
}

/**
 * Close Paper Trade Modal
 */
function closePaperTradeModal() {
    const modal = document.getElementById('paperTradeModal');
    if (!modal) return;
    hidePtTickerDropdown();
    modal.style.display = 'none';
    modal.classList.remove('active');
    syncModalBodyScroll();
}

/**
 * Paper Trade Ticker Search Handlers
 */
let _ptSearchDebounce = null;

function handlePtTickerFocus(input) {
    if (input) {
        setTimeout(() => input.select(), 40);
    }
    handlePtTickerSearch('', true);
}

function clearPtTickerSearch(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const input = document.getElementById('ptTickerSearchInput');
    const clearBtn = document.getElementById('ptTickerClearBtn');
    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    handlePtTickerSearch('', true);
}

function handlePtTickerBlur(input) {
    setTimeout(() => {
        hidePtTickerDropdown();
        if (input && input.value) {
            const raw = input.value.trim();
            const typed = raw.split(/[\u2013\u2014\s-]/)[0].toUpperCase().replace(/[^A-Z0-9.]/g, '');
            const current = document.getElementById('ptModalTicker')?.value?.trim().toUpperCase();
            if (typed && typed !== current) {
                selectPtTicker(typed);
            }
        }
    }, 240);
}

function handlePtTickerKeydown(event) {
    if (event.key === 'Escape') {
        hidePtTickerDropdown();
        return;
    }
    if (event.key === 'Enter') {
        event.preventDefault();
        const dropdown = document.getElementById('ptTickerDropdown');
        const firstItem = dropdown?.querySelector('.pt-ticker-item');
        if (firstItem && dropdown.style.display !== 'none') {
            const tk = firstItem.dataset.ticker;
            const nm = firstItem.dataset.name || '';
            const pr = firstItem.dataset.price || '';
            selectPtTicker(tk, nm, pr);
        } else {
            const input = document.getElementById('ptTickerSearchInput');
            if (input && input.value.trim()) {
                const typed = input.value.trim().split(/[\u2013\u2014\s-]/)[0].toUpperCase().replace(/[^A-Z0-9.]/g, '');
                if (typed) selectPtTicker(typed);
            }
        }
    }
}

/**
 * Paper Trade – Ticker Search with Instant Local + Debounced Remote Lookup
 */
function handlePtTickerSearch(query, isFocus = false) {
    const dropdown = document.getElementById('ptTickerDropdown');
    if (!dropdown) return;

    const clearBtn = document.getElementById('ptTickerClearBtn');
    if (clearBtn) {
        clearBtn.style.display = (query && query.trim().length > 0) ? 'flex' : 'none';
    }

    // Attach event delegation for reliable mousedown selection (avoids blur race conditions)
    if (!dropdown._hasDelegate) {
        dropdown.onmousedown = (e) => {
            e.preventDefault();
            const item = e.target.closest('.pt-ticker-item');
            if (!item) return;
            const tk = item.dataset.ticker;
            const nm = item.dataset.name || '';
            const pr = item.dataset.price || '';
            selectPtTicker(tk, nm, pr);
        };
        dropdown._hasDelegate = true;
    }

    let q = (query || '').trim();
    // If query has formatted "TICKER – Name", and we just focused or clicked, show all candidate assets
    if (q.includes('\u2013') || q.includes(' - ')) {
        q = isFocus ? '' : q.split(/[\u2013\u2014-]/)[0].trim();
    }
    const qUpper = q.toUpperCase();

    // 1. Build comprehensive local candidate list
    const candidateTickers = new Set([
        ...(state.watchlistTickers || []),
        ...(state.backtestTickers || []),
        ...Object.keys(state.stocksData || {}),
        ...Object.keys(GLOBAL_COMPANY_NAMES)
    ]);

    let localResults = [];
    candidateTickers.forEach(ticker => {
        if (!ticker) return;
        const cleanT = ticker.toUpperCase().trim();
        const stock = state.stocksData?.[cleanT] || state.watchlistData?.[cleanT] || {};
        const name = getAssetCompanyName(cleanT, stock);
        const nameUpper = (name || '').toUpperCase();
        if (!qUpper || cleanT.includes(qUpper) || nameUpper.includes(qUpper)) {
            const priceVal = stock.currentPrice || stock.profile?.currentPrice;
            const price = priceVal ? '$' + Number(priceVal).toFixed(2) : '';
            localResults.push({ ticker: cleanT, name: name !== cleanT ? name : '', price });
        }
    });

    // Sort: exact matches first, then starts-with, then rest
    localResults.sort((a, b) => {
        const aExact = a.ticker === qUpper ? 0 : a.ticker.startsWith(qUpper) ? 1 : 2;
        const bExact = b.ticker === qUpper ? 0 : b.ticker.startsWith(qUpper) ? 1 : 2;
        if (aExact !== bExact) return aExact - bExact;
        return a.ticker.localeCompare(b.ticker);
    });

    renderPtDropdownItems(localResults.slice(0, 10));

    // 2. If user typed a search term (length >= 1), trigger debounced server search to find any global ticker
    if (_ptSearchDebounce) clearTimeout(_ptSearchDebounce);
    if (qUpper && qUpper.length >= 1) {
        _ptSearchDebounce = setTimeout(async () => {
            try {
                const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(qUpper)}&limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.results)) {
                        // Merge server results with local results
                        const seen = new Set(localResults.map(r => r.ticker));
                        data.results.forEach(item => {
                            const tk = String(item.ticker || '').toUpperCase().trim();
                            if (tk && !seen.has(tk)) {
                                seen.add(tk);
                                const priceVal = state.stocksData?.[tk]?.currentPrice;
                                localResults.push({
                                    ticker: tk,
                                    name: item.name || '',
                                    price: priceVal ? '$' + Number(priceVal).toFixed(2) : ''
                                });
                            }
                        });
                        renderPtDropdownItems(localResults.slice(0, 12));
                    }
                }
            } catch (err) {
                console.warn('Paper trade server search failed:', err);
            }
        }, 200);
    }
}

function renderPtDropdownItems(results) {
    const dropdown = document.getElementById('ptTickerDropdown');
    if (!dropdown) return;

    if (!results || results.length === 0) {
        dropdown.innerHTML = `<div class="pt-ticker-dropdown-empty">No matching assets found</div>`;
    } else {
        dropdown.innerHTML = results.map(r => `
            <div class="pt-ticker-item" data-ticker="${escapeHtml(r.ticker)}" data-name="${escapeHtml(r.name || '')}" data-price="${escapeHtml(r.price || '')}">
                <span class="pt-ticker-symbol">${escapeHtml(r.ticker)}</span>
                ${r.name ? `<span class="pt-ticker-name" title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</span>` : ''}
                ${r.price ? `<span class="pt-ticker-price mono">${escapeHtml(r.price)}</span>` : ''}
            </div>
        `).join('');
    }
    dropdown.style.display = 'block';
}

function hidePtTickerDropdown() {
    const dropdown = document.getElementById('ptTickerDropdown');
    if (dropdown) dropdown.style.display = 'none';
}

/**
 * Select a ticker in Paper Trade modal and asynchronously load levels if needed
 */
async function selectPtTicker(ticker, name = '', price = '') {
    if (!ticker) return;
    const cleanT = ticker.toUpperCase().trim();
    const searchEl = document.getElementById('ptTickerSearchInput');
    const hiddenEl = document.getElementById('ptModalTicker');
    const priceEl = document.getElementById('ptModalEntryPrice');
    const sideEl = document.getElementById('ptModalSide');
    const slEl = document.getElementById('ptModalStopLoss');
    const tpEl = document.getElementById('ptModalTakeProfit');
    const reasonEl = document.getElementById('ptModalReason');
    const clearBtn = document.getElementById('ptTickerClearBtn');

    const displayName = name || getAssetCompanyName(cleanT, state.stocksData?.[cleanT]);
    if (searchEl) {
        searchEl.value = displayName && displayName !== cleanT ? `${cleanT} \u2013 ${displayName}` : cleanT;
        searchEl.blur();
    }
    if (clearBtn) clearBtn.style.display = 'flex';
    if (hiddenEl) hiddenEl.value = cleanT;

    hidePtTickerDropdown();
    renderPtAssetQuickPills(cleanT);

    let stock = state.stocksData?.[cleanT] || state.watchlistData?.[cleanT] || {};
    let ai = stock.aiAnalysis || {};
    let levels = ai.tradeLevels || {};

    // Auto-detect side
    let resolvedSide = 'LONG';
    if (stock.decision?.action && stock.decision.action.toUpperCase().includes('SELL')) {
        resolvedSide = 'SHORT';
    }
    setPtOrderSide(resolvedSide);

    // Auto-populate entry price if available
    let resolvedPrice = null;
    if (price && typeof price === 'string' && price.startsWith('$')) {
        resolvedPrice = parseFloat(price.replace('$', ''));
    }
    if (!resolvedPrice || isNaN(resolvedPrice)) {
        if (stock.currentPrice) resolvedPrice = stock.currentPrice;
        else if (stock.profile?.currentPrice) resolvedPrice = stock.profile.currentPrice;
        else if (levels.currentPrice) resolvedPrice = levels.currentPrice;
        else if (levels.entryLow) resolvedPrice = levels.entryLow;
        else if (stock.timeseries?.length) resolvedPrice = stock.timeseries[stock.timeseries.length - 1].close;
        else resolvedPrice = 100;
    }
    if (priceEl && resolvedPrice) priceEl.value = Number(resolvedPrice).toFixed(2);

    // Quote badge
    populatePtAiLevels(cleanT);

    // Pre-fill Stop Loss & Take Profit
    if (slEl && resolvedPrice) {
        const sl = resolvedSide === 'SHORT' ? resolvedPrice * 1.05 : resolvedPrice * 0.95;
        slEl.value = Number(sl).toFixed(2);
    }

    if (tpEl && resolvedPrice) {
        const tp = resolvedSide === 'SHORT' ? resolvedPrice * 0.88 : resolvedPrice * 1.12;
        tpEl.value = Number(tp).toFixed(2);
    }

    if (reasonEl) {
        const strategy = stock.decision?.primaryStrategy || stock.signals?.primaryStrategy;
        const bias = stock.decision?.bias || (resolvedSide === 'SHORT' ? 'Bearish' : 'Bullish');
        if (strategy) {
            reasonEl.value = `${strategy} (${bias} Setup)`;
        } else {
            reasonEl.value = `Quantitative ${bias} Setup`;
        }
    }

    updatePtLiveCalculations();

    // If stock is not in memory or has incomplete timeseries/levels, fetch from server!
    if (!stock.timeseries || stock.timeseries.length < 5 || !stock.currentPrice) {
        const quoteBadge = document.getElementById('ptAssetQuoteBadge');
        if (quoteBadge) {
            quoteBadge.innerHTML = `<span style="color: var(--accent-cyan); font-weight: 600;"><span class="spinner-sm" style="display:inline-block; vertical-align:middle; width:11px; height:11px; margin-right:4px;"></span>Fetching live data for ${cleanT}...</span>`;
        }
        try {
            const res = await fetch(`/api/stocks/${encodeURIComponent(cleanT)}?period=1mo`);
            if (res.ok) {
                const data = await res.json();
                if (data && !data.error) {
                    state.stocksData[cleanT] = data;
                    trimClientStockCache();
                    stock = data;

                    const freshPrice = stock.currentPrice || stock.profile?.currentPrice;
                    if (freshPrice && priceEl) {
                        priceEl.value = Number(freshPrice).toFixed(2);
                        if (slEl) {
                            const sl = resolvedSide === 'SHORT' ? freshPrice * 1.05 : freshPrice * 0.95;
                            slEl.value = Number(sl).toFixed(2);
                        }
                        if (tpEl) {
                            const tp = resolvedSide === 'SHORT' ? freshPrice * 0.88 : freshPrice * 1.12;
                            tpEl.value = Number(tp).toFixed(2);
                        }
                    }
                    populatePtAiLevels(cleanT);
                    updatePtLiveCalculations();
                }
            }
        } catch (e) {
            console.warn('Background fetch for paper trade stock levels failed:', e);
        }
    }
}

/**
 * Handle Paper Trade Form Submit
 */
async function submitPaperTradeForm(event) {
    if (event) event.preventDefault();

    // Read from hidden ticker field (set by selectPtTicker), fall back to raw search input
    const hiddenTicker = document.getElementById('ptModalTicker')?.value?.trim();
    const rawSearch = document.getElementById('ptTickerSearchInput')?.value?.trim();
    const extractedFromSearch = rawSearch ? rawSearch.split(/[\u2013\u2014\s-]/)[0].toUpperCase().replace(/[^A-Z0-9.]/g, '') : '';
    const ticker = ((hiddenTicker && hiddenTicker.length > 0) ? hiddenTicker : extractedFromSearch || 'NVDA').toUpperCase();
    const side = document.getElementById('ptModalSide')?.value || 'LONG';
    const capital = parseFloat(document.getElementById('ptModalCapital')?.value) || 5000;
    const entryPrice = parseFloat(document.getElementById('ptModalEntryPrice')?.value) || 100;
    const stopLoss = parseFloat(document.getElementById('ptModalStopLoss')?.value) || null;
    const takeProfit = parseFloat(document.getElementById('ptModalTakeProfit')?.value) || null;
    const reason = document.getElementById('ptModalReason')?.value || 'AI Tactical Matrix Trade Setup';

    const shares = entryPrice > 0 ? (capital / entryPrice) : 1;

    const payload = {
        ticker: ticker,
        side: side,
        capital: capital,
        entryPrice: entryPrice,
        shares: shares,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        reason: reason,
        status: 'OPEN'
    };

    try {
        const res = await fetch('/api/paper-trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await res.json();
            if (data.trade) {
                state.paperTrades.push(data.trade);
            }
        }
    } catch (e) {
        console.warn('Failed to save paper trade to server API, storing locally:', e);
        payload.id = 'pt_' + Date.now();
        payload.entryDate = new Date().toISOString().split('T')[0];
        state.paperTrades.push(payload);
    }

    try {
        localStorage.setItem(getPaperTradesStorageKey(), JSON.stringify(state.paperTrades));
    } catch (e) { }

    closePaperTradeModal();
    renderPaperTrades();
}

/**
 * Close an active Paper Trade position
 */
async function closePaperTradePosition(tradeId, currentPrice) {
    if (!tradeId) return;
    const trade = state.paperTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const exitPrice = Number(currentPrice || trade.entryPrice);
    const isLong = (trade.side || 'LONG').toUpperCase() === 'LONG';
    let realizedPnl = 0;
    let realizedPnlPct = 0;

    if (isLong) {
        realizedPnl = (exitPrice - trade.entryPrice) * (trade.shares || 1);
        realizedPnlPct = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    } else {
        realizedPnl = (trade.entryPrice - exitPrice) * (trade.shares || 1);
        realizedPnlPct = ((trade.entryPrice - exitPrice) / trade.entryPrice) * 100;
    }

    try {
        await fetch(`/api/paper-trades/${encodeURIComponent(tradeId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'CLOSED',
                exitPrice: exitPrice,
                realizedPnl: realizedPnl,
                realizedPnlPct: realizedPnlPct
            })
        });
    } catch (e) {
        console.warn('Failed to patch paper trade on server:', e);
    }

    trade.status = 'CLOSED';
    trade.exitPrice = exitPrice;
    trade.realizedPnl = realizedPnl;
    trade.realizedPnlPct = realizedPnlPct;

    try {
        localStorage.setItem(getPaperTradesStorageKey(), JSON.stringify(state.paperTrades));
    } catch (e) { }

    renderPaperTrades();
}

/**
 * Delete a Paper Trade position
 */
async function deletePaperTrade(tradeId) {
    if (!tradeId) return;
    try {
        await fetch(`/api/paper-trades/${encodeURIComponent(tradeId)}`, { method: 'DELETE' });
    } catch (e) {
        console.warn('Failed to delete paper trade on server:', e);
    }

    state.paperTrades = state.paperTrades.filter(t => t.id !== tradeId);
    try {
        localStorage.setItem(getPaperTradesStorageKey(), JSON.stringify(state.paperTrades));
    } catch (e) { }

    renderPaperTrades();
}
