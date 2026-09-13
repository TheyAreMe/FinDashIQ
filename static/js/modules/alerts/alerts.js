async function initAlerts() {
    try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        state.alerts = data.alerts || [];
    } catch (e) {
        state.alerts = [];
    }
    populateAlertTickerOptions();
    renderAlerts();
    loadAlertHistory();
    updateAlertPreview();
    startBackgroundAlertEngine();
}

function handleSignalTypeChange() {
    const select = document.getElementById('alertSignalType');
    const option = select?.selectedOptions[0];
    if (!option) return;

    const desc = option.getAttribute('data-desc') || '';
    const descBox = document.getElementById('signalDescBox');
    if (descBox && desc) descBox.textContent = desc;

    updateAlertPreview();
}

function handleChannelChange() {
    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const targetLabel = document.getElementById('channelTargetLabel');
    const targetInput = document.getElementById('alertChannelTarget');
    const targetHelp = document.getElementById('channelTargetHelp');
    const permBtn = document.getElementById('btnBrowserPermission');

    const userEmail = state.user?.email || 'analyst@findashiq.com';

    if (permBtn) {
        permBtn.style.display = (channel === 'Browser Push') ? 'inline-flex' : 'none';
        if (channel === 'Browser Push' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                permBtn.innerHTML = '<i data-lucide="check" style="width: 11px;"></i><span>Notifications Active</span>';
                permBtn.style.color = 'var(--accent-green)';
            } else if (Notification.permission === 'denied') {
                permBtn.innerHTML = '<i data-lucide="bell-off" style="width: 11px;"></i><span>Permission Blocked</span>';
                permBtn.style.color = 'var(--accent-red)';
            } else {
                permBtn.innerHTML = '<i data-lucide="bell" style="width: 11px;"></i><span>Enable Desktop Alerts</span>';
                permBtn.style.color = 'var(--accent-cyan)';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    const guideLink = document.getElementById('alertSetupGuideLink');

    if (channel === 'Telegram Bot') {
        if (targetLabel) targetLabel.textContent = 'Telegram Destination (Private DMs, Public Channels, or Groups)';
        if (targetInput) {
            targetInput.placeholder = 'e.g. "auto" (Personal DMs / Private Groups), @PublicChannel, or Chat ID';
            targetInput.value = 'auto';
            targetInput.disabled = false;
        }
        if (targetHelp) {
            targetHelp.innerHTML = `
                <div><strong>Supported Destination Options:</strong></div>
                <div>&bull; <strong>Option A (Personal DMs):</strong> Type <code>auto</code> or numeric Chat ID <em>(send /start to bot first)</em></div>
                <div>&bull; <strong>Option B (Public Channel/Group):</strong> Type <code>@PublicChannel</code> <em>(group must be set to Public + bot is Admin)</em></div>
                <div>&bull; <strong>Option C (Private Group):</strong> Type <code>auto</code> or <code>-100...</code> <em>(bot is Admin + send /test in group)</em></div>
            `;
        }
        if (guideLink) {
            guideLink.setAttribute('onclick', "openHelpTopic('telegram')");
            guideLink.setAttribute('title', "Open Telegram Bot Setup Guide");
        }
    } else if (channel === 'Email Webhook') {
        if (targetLabel) targetLabel.textContent = 'Destination Recipient Email Address / Webhook';
        if (targetInput) {
            targetInput.placeholder = 'e.g. trader@yourdomain.com or https://hooks.zapier.com/...';
            targetInput.value = userEmail;
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Dispatches structured HTML executive notification memos via SMTP (or email webhook).';
        if (guideLink) {
            guideLink.setAttribute('onclick', "openHelpTopic('email')");
            guideLink.setAttribute('title', "Open Email & SMTP Setup Guide");
        }
    } else if (channel === 'Discord Webhook') {
        if (targetLabel) targetLabel.textContent = 'Discord Channel Webhook URL';
        if (targetInput) {
            targetInput.placeholder = 'https://discord.com/api/webhooks/...';
            targetInput.value = 'https://discord.com/api/webhooks/trading-desk/signals';
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Pushes formatted quantitative embed cards into your Discord trading channels.';
        if (guideLink) {
            guideLink.setAttribute('onclick', "openHelpTopic('discord')");
            guideLink.setAttribute('title', "Open Discord Webhook Setup Guide");
        }
    } else if (channel === 'Browser Push') {
        if (targetLabel) targetLabel.textContent = 'Desktop Notification Priority & Sound Engine';
        if (targetInput) {
            targetInput.placeholder = 'In-App Desktop Toast';
            targetInput.value = 'High Priority • Real-time Audio Synthesizer Chime';
            targetInput.disabled = true;
        }
        if (targetHelp) targetHelp.textContent = 'Triggers instant browser desktop push notifications with high-priority audio alerts.';
        if (guideLink) {
            guideLink.setAttribute('onclick', "openHelpTopic('browser')");
            guideLink.setAttribute('title', "Open Browser Push & Audio Chimes Guide");
        }
    } else if (channel === 'Custom API Webhook') {
        if (targetLabel) targetLabel.textContent = 'HTTP Endpoint URL (JSON POST Webhook)';
        if (targetInput) {
            targetInput.placeholder = 'https://api.yourdomain.com/webhook/orders';
            targetInput.value = 'https://api.findashiq.internal/hooks/trader';
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Sends standard REST JSON quantitative payload (event, ticker, signal, news, metrics) to your custom trading bot or API listener.';
        if (guideLink) {
            guideLink.setAttribute('onclick', "openHelpTopic('api')");
            guideLink.setAttribute('title', "Open Custom REST API Webhooks Guide");
        }
    }

    updateAlertPreview();
}

async function requestBrowserNotificationPermission() {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications.');
        return;
    }
    const perm = await Notification.requestPermission();
    const btn = document.getElementById('btnBrowserPermission');
    if (btn) {
        if (perm === 'granted') {
            btn.innerHTML = '<i data-lucide="check" style="width: 11px;"></i><span>Notifications Enabled</span>';
            btn.style.color = 'var(--accent-green)';
            playAlertChime();
        } else {
            btn.innerHTML = '<i data-lucide="bell-off" style="width: 11px;"></i><span>Permission Denied</span>';
            btn.style.color = 'var(--accent-red)';
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function playAlertChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.warn('Audio chime omitted:', e);
    }
}

function updateAlertPreview() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    const rawTicker = tickerSelect?.value || '*WATCHLIST*';
    const isGlobal = rawTicker === '*WATCHLIST*' || rawTicker === 'ALL_WATCHLIST';

    const sigSelect = document.getElementById('alertSignalType');
    const selectedOption = sigSelect?.selectedOptions[0];
    const sigName = selectedOption?.textContent || 'SuperTrend Bullish Flip';
    const thresh = selectedOption?.getAttribute('data-thresh') || 'Trigger Level Reached';
    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const target = document.getElementById('alertChannelTarget')?.value || '@quant_desk';

    const previewEl = document.getElementById('alertLivePreviewText');
    if (previewEl) {
        if (isGlobal) {
            previewEl.innerHTML = `🌐 When <strong>ANY asset in your active Watchlist</strong> triggers <strong>${sigName}</strong> (<em>${thresh}</em>), dispatch alert via <strong>${channel}</strong> to <code>${target}</code>.`;
        } else {
            previewEl.innerHTML = `⚡ When <strong>${rawTicker}</strong> triggers <strong>${sigName}</strong> (<em>${thresh}</em>), dispatch alert via <strong>${channel}</strong> to <code>${target}</code>.`;
        }
    }
}

function renderAlerts() {
    const list = document.getElementById('activeAlertsList');
    const badge = document.getElementById('activeAlertsBadge');
    const topAlertsCount = document.getElementById('topAlertsCount');
    const activeCount = state.alerts.filter(a => a.active).length;

    if (badge) badge.textContent = `${activeCount} Rules Active`;
    if (topAlertsCount) topAlertsCount.textContent = `${activeCount} Active`;
    if (!list) return;

    list.innerHTML = '';
    if (state.alerts.length === 0) {
        list.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 24px;">
                <i data-lucide="bell-off" style="width: 28px; height: 28px; margin: 0 auto 8px auto; opacity: 0.5; display: block;"></i>
                No signal alert triggers configured yet. Create your first quantitative rule above!
            </div>
        `;
        lucide.createIcons();
        return;
    }

    state.alerts.forEach(rule => {
        const card = document.createElement('div');
        card.className = 'alert-rule-card';
        const channelTargetText = rule.channelTarget ? ` (<code>${escapeHtml(rule.channelTarget)}</code>)` : '';
        const sigName = rule.signalName || rule.signalType;
        const categoryBadge = rule.category ? `<span class="badge-pill badge-neutral" style="font-size: 0.65rem; padding: 1px 6px;">${escapeHtml(rule.category)}</span>` : '';

        const isGlobal = rule.ticker === '*WATCHLIST*' || rule.ticker === 'ALL_WATCHLIST' || rule.ticker === 'WATCHLIST';
        const compName = isGlobal ? 'Entire Tracked Watchlist Portfolio' : (state.stocksData?.[rule.ticker]?.profile?.name || state.watchlistData?.[rule.ticker]?.profile?.name || '');

        const tickerBadge = isGlobal ?
            `<span class="badge-pill" style="font-size: 0.72rem; background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.4); font-weight: 700;">🌐 ALL WATCHLIST ASSETS</span>` :
            `<strong style="font-size: 0.95rem; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; line-height: 1.1;">${escapeHtml(rule.ticker)}</strong>`;

        card.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                    <span class="badge-pill ${rule.active ? 'badge-bullish' : 'badge-neutral'}" style="font-size: 0.7rem;">
                        ${rule.active ? '🟢 ACTIVE' : '⚪ PAUSED'}
                    </span>
                    ${categoryBadge}
                    <div style="display: inline-flex; flex-direction: column; min-width: 0;">
                        ${tickerBadge}
                        ${compName ? `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; line-height: 1.2;">${escapeHtml(compName)}</span>` : ''}
                    </div>
                    <span style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 700; margin-left: 4px;">${escapeHtml(sigName)}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
                    Condition: <strong style="color: var(--text-primary);">${escapeHtml(rule.threshold)}</strong> • Channel: <strong style="color: var(--accent-purple);">${escapeHtml(rule.channel)}</strong>${channelTargetText}
                </div>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
                <button type="button" class="btn-toggle" style="padding: 5px 10px; font-size: 0.75rem;" onclick="testTriggerAlert('${rule.id}', '${rule.ticker}', '${sigName}', '${rule.channel}', '${rule.threshold}', '${rule.channelTarget || ''}')" title="Simulate trigger message">
                    <i data-lucide="send" style="width: 12px;"></i> Test
                </button>
                <button type="button" class="btn-toggle" style="padding: 5px 10px; font-size: 0.75rem; color: ${rule.active ? 'var(--accent-green)' : 'var(--text-muted)'};" onclick="toggleAlertRule('${rule.id}', ${!rule.active})">
                    ${rule.active ? 'Pause' : 'Enable'}
                </button>
                <button type="button" class="btn-toggle" style="padding: 5px 8px; color: var(--accent-red);" onclick="deleteAlertRule('${rule.id}')" title="Delete rule">
                    <i data-lucide="trash-2" style="width: 13px;"></i>
                </button>
            </div>
        `;
        list.appendChild(card);
    });

    lucide.createIcons();
}

async function handleTestTriggerFromForm() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    const ticker = tickerSelect?.value || '*WATCHLIST*';

    const sigSelect = document.getElementById('alertSignalType');
    const selectedOption = sigSelect?.selectedOptions[0];
    const signalName = selectedOption?.textContent || 'SuperTrend Bullish Flip';
    const threshold = selectedOption?.getAttribute('data-thresh') || 'Trigger Level Reached';

    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const channelTarget = document.getElementById('alertChannelTarget')?.value || '@quant_desk';

    await testTriggerAlert('form-preview', ticker, signalName, channel, threshold, channelTarget);
}

async function handleCreateAlert() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    const ticker = tickerSelect?.value || '*WATCHLIST*';

    const sigSelect = document.getElementById('alertSignalType');
    const selectedOption = sigSelect?.selectedOptions[0];
    const signalType = selectedOption?.value || 'supertrend_bull';
    const signalName = selectedOption?.textContent || 'SuperTrend Bullish Flip';
    const category = selectedOption?.getAttribute('data-cat') || 'Trend & Volatility';
    const condition = selectedOption?.getAttribute('data-cond') || 'direction_flip';
    const threshold = selectedOption?.getAttribute('data-thresh') || 'Uptrend Confirmation';

    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const channelTarget = document.getElementById('alertChannelTarget')?.value || '@quant_desk';

    try {
        const res = await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker, signalType, signalName, category, condition, threshold, channel, channelTarget })
        });
        const data = await res.json();
        if (data.alerts) {
            state.alerts = data.alerts;
            renderAlerts();
        }
        updateAlertPreview();
    } catch (e) {
        console.error('Failed to create alert:', e);
    }
}

async function toggleAlertRule(id, active) {
    try {
        const res = await fetch(`/api/alerts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active })
        });
        const data = await res.json();
        if (data.alerts) {
            state.alerts = data.alerts;
            renderAlerts();
        }
    } catch (e) {
        console.error('Failed to toggle alert:', e);
    }
}

async function deleteAlertRule(id) {
    try {
        const res = await fetch(`/api/alerts/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.alerts) {
            state.alerts = data.alerts;
            renderAlerts();
        }
    } catch (e) {
        console.error('Failed to delete alert:', e);
    }
}

function getAlertHistoryStorageKey() {
    const username = state.user?.username || 'guest';
    return `findashiq_alert_history_${username}`;
}

function loadAlertHistory() {
    const logContainer = document.getElementById('alertHistoryLog');
    if (!logContainer) return;

    try {
        const raw = localStorage.getItem(getAlertHistoryStorageKey());
        state.alertHistory = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(state.alertHistory)) state.alertHistory = [];
    } catch (e) {
        state.alertHistory = [];
    }

    logContainer.innerHTML = '';
    if (state.alertHistory.length === 0) {
        renderAlertHistoryEmptyState();
        return;
    }

    // Render stored items
    state.alertHistory.forEach(item => {
        renderAlertNotificationItem(item, false);
    });
}

function renderAlertHistoryEmptyState(customMessage) {
    const logContainer = document.getElementById('alertHistoryLog');
    if (!logContainer) return;
    logContainer.innerHTML = `
        <div id="alertHistoryEmptyState" style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 36px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <i data-lucide="bell-off" style="width: 24px; height: 24px; color: var(--text-muted); margin-bottom: 8px; opacity: 0.5;"></i>
            <div>${escapeHtml(customMessage || 'No signal alerts in activity log.')}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; opacity: 0.75;">Triggered alerts and dispatch receipts will appear here in real-time.</div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAlertNotificationItem(notif, shouldSave = true) {
    const logContainer = document.getElementById('alertHistoryLog');
    if (!logContainer) return;

    const emptyEl = document.getElementById('alertHistoryEmptyState');
    if (emptyEl) {
        emptyEl.remove();
    }

    if (shouldSave) {
        if (!Array.isArray(state.alertHistory)) state.alertHistory = [];
        const itemToSave = {
            ...notif,
            id: notif.id || `notif_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            timestamp: notif.timestamp || new Date().toLocaleTimeString()
        };
        state.alertHistory.unshift(itemToSave);
        if (state.alertHistory.length > 50) {
            state.alertHistory = state.alertHistory.slice(0, 50);
        }
        try {
            localStorage.setItem(getAlertHistoryStorageKey(), JSON.stringify(state.alertHistory));
        } catch (e) { }
    }

    const item = document.createElement('div');
    item.className = 'alert-log-item';
    const targetDisplay = notif.channelTarget ? ` (<code>${escapeHtml(notif.channelTarget)}</code>)` : '';
    const isSim = notif.isSimulated !== false;

    let newsMetaHtml = '';
    if (notif.newsHeadline || notif.newsUrl) {
        newsMetaHtml = `
            <div style="margin-top: 8px; padding: 10px 12px; background: rgba(0,0,0,0.18); border: 1px solid var(--border-subtle); border-radius: 6px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 0.74rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between;">
                    <span>📰 ${escapeHtml(notif.newsPublisher || 'Breaking Wire')}</span>
                    ${notif.sentiment ? `<span class="badge-pill ${notif.sentiment.toLowerCase().includes('bull') ? 'badge-bullish' : (notif.sentiment.toLowerCase().includes('bear') ? 'badge-neutral' : 'badge-neutral')}" style="font-size: 0.65rem;">${escapeHtml(notif.sentiment)}</span>` : ''}
                </div>
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); line-height: 1.3;">
                    ${escapeHtml(notif.newsHeadline || '')}
                </div>
                ${notif.newsSummary ? `<div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(notif.newsSummary)}</div>` : ''}
                ${notif.newsUrl && notif.newsUrl !== '#' ? `
                    <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
                        <a href="${escapeHtml(notif.newsUrl)}" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: var(--accent-blue); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                            <span>Read Full Article</span>
                            <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }

    const deliveryStatusHtml = notif.delivered ?
        `<span style="color: var(--accent-green); font-weight: 700; font-size: 0.72rem;">✔ ${escapeHtml(notif.status || 'Delivered Successfully')}</span>` :
        `<span style="color: var(--accent-red); font-weight: 700; font-size: 0.72rem;">⚠ ${escapeHtml(notif.status || 'Delivery Failed')}</span>`;

    const isGlobal = notif.isGlobalWatchlist || notif.ticker === '*WATCHLIST*';
    const tickerTag = isGlobal ? `🌐 WATCHLIST • ${escapeHtml(notif.ticker)}` : escapeHtml(notif.ticker);

    item.innerHTML = `
        <div class="alert-log-header">
            <span class="badge-pill ${notif.sentiment?.toLowerCase().includes('bear') ? 'badge-neutral' : 'badge-bullish'}" style="font-size: 0.7rem;">
                ${tickerTag} • ${isSim ? 'SIMULATED TRIGGER' : 'LIVE TRIGGER'}
            </span>
            <span class="alert-log-time">${notif.timestamp ? (notif.timestamp.includes(' ') ? notif.timestamp.split(' ')[1] : notif.timestamp) : 'Just now'}</span>
        </div>
        <div class="alert-log-title">${escapeHtml(notif.title || '')}</div>
        <div class="alert-log-body">${escapeHtml(notif.message || '')}</div>
        ${newsMetaHtml}
        <div class="alert-log-footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <span>Channel: ${escapeHtml(notif.channel || 'Telegram')}${targetDisplay}</span>
            ${deliveryStatusHtml}
        </div>
    `;

    if (shouldSave) {
        logContainer.insertBefore(item, logContainer.firstChild);
    } else {
        logContainer.appendChild(item);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==============================================================================
// 🔄 AUTONOMOUS BACKGROUND SIGNAL MONITORING & INTERVAL ENGINE
// ==============================================================================

const POLL_INTERVAL_STEPS = [1, 2, 5, 10, 15, 30, 45, 60, 120, 180, 240, 360, 480, 720, 1440]; // minutes
let bgPollingIntervalMinutes = 15;
let bgCountdownSeconds = 900;
let bgCountdownIntervalId = null;
let isBgMonitoringPaused = false;
let isBgCheckInProgress = false;

function getBgPollingStorageKey() {
    return 'findashiq_bg_poll_interval_' + (state.user?.username || 'guest');
}

function getBgPausedStorageKey() {
    return 'findashiq_bg_poll_paused_' + (state.user?.username || 'guest');
}

function formatIntervalMinutes(minutes) {
    if (minutes < 60) return `${minutes} Minute${minutes === 1 ? '' : 's'}`;
    const hours = minutes / 60;
    if (Number.isInteger(hours)) return `${hours} Hour${hours === 1 ? '' : 's'}`;
    return `${hours.toFixed(1)} Hours`;
}

function formatCountdownSeconds(seconds) {
    if (seconds <= 0) return '00:00';
    if (seconds < 60) return `00:${seconds < 10 ? '0' : ''}${seconds}`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m < 60) return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM}m ${s < 10 ? '0' : ''}${s}s`;
}

function updateCountdownUI() {
    const timerEl = document.getElementById('bgCountdownTimer');
    const badgeEl = document.getElementById('bgEngineStatusBadge');
    const pulseDot = document.getElementById('bgEnginePulseDot');
    const countdownText = document.getElementById('bgEngineCountdownText');

    if (isBgMonitoringPaused) {
        if (timerEl) timerEl.textContent = 'PAUSED';
        if (badgeEl) {
            badgeEl.className = 'badge-pill badge-neutral';
            badgeEl.textContent = 'Paused';
        }
        if (pulseDot) {
            pulseDot.className = 'pulse-dot-paused';
        }
        if (countdownText) {
            countdownText.innerHTML = 'Autonomous background monitoring is currently <strong style="color: var(--accent-amber);">paused</strong>.';
        }
        return;
    }

    if (badgeEl) {
        badgeEl.className = 'badge-pill badge-positive';
        badgeEl.textContent = 'Active • Auto-Polling';
    }
    if (pulseDot) {
        pulseDot.className = 'pulse-dot-active';
    }
    if (countdownText && !countdownText.querySelector('#bgCountdownTimer')) {
        countdownText.innerHTML = `Next automated calculation &amp; news wire scan in: <strong id="bgCountdownTimer" style="color: var(--accent-cyan); font-family: monospace; font-size: 0.82rem;">${formatCountdownSeconds(bgCountdownSeconds)}</strong>`;
    } else {
        const liveTimerEl = document.getElementById('bgCountdownTimer');
        if (liveTimerEl) liveTimerEl.textContent = formatCountdownSeconds(bgCountdownSeconds);
    }
}

function updatePauseButtonUI() {
    const btn = document.getElementById('btnBgPauseToggle');
    if (!btn) return;

    if (isBgMonitoringPaused) {
        btn.innerHTML = '<i data-lucide="play" id="bgPauseIcon" style="width: 13px; height: 13px;"></i><span id="bgPauseText">Resume</span>';
        btn.style.color = 'var(--accent-green)';
    } else {
        btn.innerHTML = '<i data-lucide="pause" id="bgPauseIcon" style="width: 13px; height: 13px;"></i><span id="bgPauseText">Pause</span>';
        btn.style.color = 'var(--text-secondary)';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getBgNextPollStorageKey() {
    return 'findashiq_bg_next_poll_' + (state.user?.username || 'guest');
}

function scheduleNextBackgroundPoll(minutes) {
    const mins = minutes || bgPollingIntervalMinutes || 15;
    const intervalMs = mins * 60 * 1000;
    const nextTimestamp = Date.now() + intervalMs;
    try {
        localStorage.setItem(getBgNextPollStorageKey(), nextTimestamp.toString());
    } catch (e) { }
    bgCountdownSeconds = Math.round(intervalMs / 1000);
}

function handlePollingIntervalChange(stepIndex) {
    const idx = parseInt(stepIndex, 10);
    const minutes = POLL_INTERVAL_STEPS[Math.max(0, Math.min(idx, POLL_INTERVAL_STEPS.length - 1))] || 15;
    bgPollingIntervalMinutes = minutes;

    try {
        localStorage.setItem(getBgPollingStorageKey(), minutes.toString());
    } catch (e) { }

    const displayEl = document.getElementById('bgIntervalDisplay');
    if (displayEl) {
        displayEl.textContent = formatIntervalMinutes(minutes) + (minutes === 15 ? ' (Recommended)' : '');
    }

    scheduleNextBackgroundPoll(minutes);
    updateCountdownUI();
}

function toggleBackgroundEngine() {
    isBgMonitoringPaused = !isBgMonitoringPaused;
    try {
        localStorage.setItem(getBgPausedStorageKey(), isBgMonitoringPaused ? 'true' : 'false');
    } catch (e) { }
    updatePauseButtonUI();
    updateCountdownUI();
    if (typeof showNotification === 'function') {
        showNotification(isBgMonitoringPaused ? 'Background signal monitoring paused' : 'Background signal monitoring resumed', 'info');
    }
}

function startBackgroundAlertEngine() {
    try {
        const savedMinutes = parseInt(localStorage.getItem(getBgPollingStorageKey()), 10);
        if (savedMinutes && POLL_INTERVAL_STEPS.includes(savedMinutes)) {
            bgPollingIntervalMinutes = savedMinutes;
        }
        const savedPaused = localStorage.getItem(getBgPausedStorageKey()) === 'true';
        isBgMonitoringPaused = savedPaused;

        // Restore remaining seconds from next scheduled poll timestamp
        const savedNextTimestamp = parseInt(localStorage.getItem(getBgNextPollStorageKey()), 10);
        if (savedNextTimestamp && !isNaN(savedNextTimestamp)) {
            const remainingMs = savedNextTimestamp - Date.now();
            if (remainingMs > 1000) {
                bgCountdownSeconds = Math.round(remainingMs / 1000);
            } else {
                // Time already elapsed while page was closed/reloaded; trigger poll after 2 seconds
                bgCountdownSeconds = 2;
            }
        } else {
            scheduleNextBackgroundPoll(bgPollingIntervalMinutes);
        }
    } catch (e) {
        scheduleNextBackgroundPoll(bgPollingIntervalMinutes);
    }

    const slider = document.getElementById('bgPollingIntervalSlider');
    const displayEl = document.getElementById('bgIntervalDisplay');
    const stepIdx = POLL_INTERVAL_STEPS.indexOf(bgPollingIntervalMinutes);
    if (slider && stepIdx !== -1) slider.value = stepIdx;
    if (displayEl) {
        displayEl.textContent = formatIntervalMinutes(bgPollingIntervalMinutes) + (bgPollingIntervalMinutes === 15 ? ' (Recommended)' : '');
    }

    updatePauseButtonUI();
    updateCountdownUI();

    if (bgCountdownIntervalId) clearInterval(bgCountdownIntervalId);
    bgCountdownIntervalId = setInterval(() => {
        if (isBgMonitoringPaused) return;

        // Recalculate remaining seconds from next scheduled timestamp for 100% clock drift and reload resilience
        try {
            const nextTimestamp = parseInt(localStorage.getItem(getBgNextPollStorageKey()), 10);
            if (nextTimestamp && !isNaN(nextTimestamp)) {
                const diffMs = nextTimestamp - Date.now();
                bgCountdownSeconds = Math.max(0, Math.round(diffMs / 1000));
            } else {
                bgCountdownSeconds--;
            }
        } catch (e) {
            bgCountdownSeconds--;
        }

        if (bgCountdownSeconds <= 0) {
            scheduleNextBackgroundPoll(bgPollingIntervalMinutes);
            runBackgroundSignalCheck();
        }
        updateCountdownUI();
    }, 1000);
}

async function triggerManualSignalCheck() {
    if (isBgCheckInProgress) return;
    const btn = document.getElementById('btnBgCheckNow');
    const icon = document.getElementById('bgRefreshIcon');
    const btnText = document.getElementById('bgCheckNowText');

    // Immediately reset the schedule and countdown on click
    scheduleNextBackgroundPoll(bgPollingIntervalMinutes);
    updateCountdownUI();

    if (icon) icon.classList.add('spin-animation');
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Scanning...';

    try {
        const result = await runBackgroundSignalCheck(true);
        // Resync schedule after scan completes
        scheduleNextBackgroundPoll(bgPollingIntervalMinutes);
        updateCountdownUI();

        if (typeof showNotification === 'function') {
            if (result.scannedCount > 0) {
                if (result.activeRuleCount > 0) {
                    showNotification(`Signal scan complete • Evaluated ${result.scannedCount} assets across ${result.activeRuleCount} active rules`, 'success');
                } else {
                    showNotification(`Scanned ${result.scannedCount} watchlist assets • Note: 0 active trigger rules configured`, 'info');
                }
            } else {
                showNotification('No assets found to scan. Add stocks to your watchlist or create a trigger rule.', 'warning');
            }
        }
    } catch (err) {
        console.error('Manual signal check error:', err);
        if (typeof showNotification === 'function') {
            showNotification('Failed to complete signal scan: ' + (err.message || 'Network error'), 'error');
        }
    } finally {
        if (icon) icon.classList.remove('spin-animation');
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Check Signals Now';
        updateCountdownUI();
    }
}

async function runBackgroundSignalCheck(isManual = false) {
    if (isBgCheckInProgress) return { scannedCount: 0, activeRuleCount: 0 };

    isBgCheckInProgress = true;
    let scannedCount = 0;
    let activeRuleCount = 0;

    try {
        const activeRules = (state.alerts || []).filter(a => a.active);
        activeRuleCount = activeRules.length;

        // Collect all tickers to scan
        const tickerSet = new Set();

        if (activeRules.length > 0) {
            const hasGlobal = activeRules.some(r => r.ticker === '*WATCHLIST*' || r.ticker === 'ALL_WATCHLIST' || r.ticker === 'WATCHLIST');
            if (hasGlobal) {
                (state.watchlistTickers || ['AAPL', 'NVDA', 'MSFT']).forEach(t => tickerSet.add(t));
            }
            activeRules.forEach(r => {
                if (r.ticker && !r.ticker.startsWith('*')) tickerSet.add(r.ticker);
            });
        } else {
            // Fallback for manual check or default watchlist monitoring
            (state.watchlistTickers || ['AAPL', 'NVDA', 'MSFT']).forEach(t => tickerSet.add(t));
        }

        const tickers = Array.from(tickerSet).filter(Boolean);
        scannedCount = tickers.length;

        if (tickers.length === 0) return { scannedCount: 0, activeRuleCount };

        const resp = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: tickers,
                period: '1mo',
                interval: '1d',
                phase: 'fast',
                forceRefresh: true
            })
        });

        if (!resp.ok) {
            throw new Error(`Server returned HTTP ${resp.status}`);
        }

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
            if (activeRules.length > 0) {
                evaluateAlertRules(state.stocksData);
            }
        }

        return { scannedCount, activeRuleCount };
    } catch (err) {
        console.warn('Background signal check error:', err);
        throw err;
    } finally {
        isBgCheckInProgress = false;
    }
}

function evaluateAlertRules(stocksData) {
    if (!state.alerts || state.alerts.length === 0 || !stocksData) return;

    const activeRules = state.alerts.filter(a => a.active);
    if (activeRules.length === 0) return;

    activeRules.forEach(rule => {
        const isGlobal = rule.ticker === '*WATCHLIST*' || rule.ticker === 'ALL_WATCHLIST' || rule.ticker === 'WATCHLIST';
        const tickersToEvaluate = isGlobal ? (state.watchlistTickers || Object.keys(stocksData)) : [rule.ticker];

        tickersToEvaluate.forEach(ticker => {
            const stock = stocksData[ticker];
            if (!stock || stock.error) return;

            const signals = stock.signals?.indicators || {};
            const newsSignal = signals.News_Catalyst || (stock.news && stock.news.length > 0 ? {
                headline: stock.news[0].title,
                summary: stock.news[0].summary || stock.news[0].title,
                publisher: stock.news[0].publisher || 'Breaking Wire',
                url: stock.news[0].url || '#',
                sentiment: 'Neutral',
                status: 'neutral'
            } : null);

            const sigType = rule.signalType;
            let triggered = false;
            let triggerTitle = '';
            let triggerMsg = '';
            let newsMeta = null;

            // 1. Trend & Volatility Indicators
            if (sigType === 'supertrend_bull_flip' && (signals.SuperTrend?.status === 'bullish' || signals.SuperTrend?.direction === 1)) {
                triggered = true;
                triggerTitle = `🟢 ${isGlobal ? '[Watchlist] ' : ''}SuperTrend Bullish Flip: ${ticker}`;
                triggerMsg = `SuperTrend turned Bullish (Uptrend confirmation) for ${ticker} at $${(stock.currentPrice || 0).toFixed(2)}.`;
            } else if (sigType === 'supertrend_bear_flip' && (signals.SuperTrend?.status === 'bearish' || signals.SuperTrend?.direction === -1)) {
                triggered = true;
                triggerTitle = `🔴 ${isGlobal ? '[Watchlist] ' : ''}SuperTrend Bearish Flip: ${ticker}`;
                triggerMsg = `SuperTrend turned Bearish (Downtrend signal) for ${ticker} at $${(stock.currentPrice || 0).toFixed(2)}.`;
            } else if (sigType === 'ema_golden_cross' && (signals.SMA_Cross?.status === 'golden_cross' || signals.SMA_Cross?.status === 'bullish')) {
                triggered = true;
                triggerTitle = `✨ ${isGlobal ? '[Watchlist] ' : ''}EMA Golden Cross: ${ticker}`;
                triggerMsg = `Fast Moving Average crossed above 200-period baseline for ${ticker}.`;
            } else if (sigType === 'ema_death_cross' && (signals.SMA_Cross?.status === 'death_cross' || signals.SMA_Cross?.status === 'bearish')) {
                triggered = true;
                triggerTitle = `⚠️ ${isGlobal ? '[Watchlist] ' : ''}EMA Death Cross: ${ticker}`;
                triggerMsg = `Fast Moving Average crossed below 200-period baseline for ${ticker}.`;
            } else if (sigType === 'bollinger_upper' && (signals.Bollinger_Bands?.status === 'overbought' || (stock.currentPrice && signals.Bollinger_Bands?.upper && stock.currentPrice >= signals.Bollinger_Bands.upper))) {
                triggered = true;
                triggerTitle = `🚀 ${isGlobal ? '[Watchlist] ' : ''}Bollinger Upper Breakout: ${ticker}`;
                triggerMsg = `Price breached Upper 2.0-StdDev Bollinger Band at $${(stock.currentPrice || 0).toFixed(2)}.`;
            } else if (sigType === 'bollinger_lower' && (signals.Bollinger_Bands?.status === 'oversold' || (stock.currentPrice && signals.Bollinger_Bands?.lower && stock.currentPrice <= signals.Bollinger_Bands.lower))) {
                triggered = true;
                triggerTitle = `🛡️ ${isGlobal ? '[Watchlist] ' : ''}Bollinger Lower Dip: ${ticker}`;
                triggerMsg = `Price touched Lower 2.0-StdDev Bollinger Band at $${(stock.currentPrice || 0).toFixed(2)}.`;
            }
            // 2. Momentum & Oscillators
            else if (sigType === 'rsi_oversold' && (signals.RSI?.value < 30.0 || signals.RSI?.status === 'oversold')) {
                triggered = true;
                triggerTitle = `⚡ ${isGlobal ? '[Watchlist] ' : ''}RSI Deep Oversold: ${ticker}`;
                triggerMsg = `14-period RSI dropped to ${(signals.RSI?.value || 28).toFixed(1)} (< 30.0 Oversold) for ${ticker}.`;
            } else if (sigType === 'rsi_overbought' && (signals.RSI?.value > 70.0 || signals.RSI?.status === 'overbought')) {
                triggered = true;
                triggerTitle = `🔥 ${isGlobal ? '[Watchlist] ' : ''}RSI Overbought: ${ticker}`;
                triggerMsg = `14-period RSI climbed to ${(signals.RSI?.value || 72).toFixed(1)} (> 70.0 Overbought) for ${ticker}.`;
            } else if (sigType === 'macd_bull_cross' && (signals.MACD?.status === 'bullish' || signals.MACD?.histogram > 0)) {
                triggered = true;
                triggerTitle = `📊 ${isGlobal ? '[Watchlist] ' : ''}MACD Bullish Cross: ${ticker}`;
                triggerMsg = `Fast MACD Line crossed above Signal Line for ${ticker}.`;
            } else if (sigType === 'macd_bear_cross' && (signals.MACD?.status === 'bearish' || signals.MACD?.histogram < 0)) {
                triggered = true;
                triggerTitle = `📉 ${isGlobal ? '[Watchlist] ' : ''}MACD Bearish Cross: ${ticker}`;
                triggerMsg = `Fast MACD Line crossed below Signal Line for ${ticker}.`;
            } else if (sigType === 'stoch_oversold_cross' && (signals.Stochastic?.status === 'oversold' || signals.Stochastic?.status === 'bullish')) {
                triggered = true;
                triggerTitle = `💫 ${isGlobal ? '[Watchlist] ' : ''}Stochastic Oversold Reversal: ${ticker}`;
                triggerMsg = `Stochastic %K crossed %D in oversold zone (< 20) for ${ticker}.`;
            }
            // 3. Institutional Flow
            else if (sigType === 'cmf_inflow' && (signals.CMF?.value > 0.15 || signals.CMF?.status === 'inflow')) {
                triggered = true;
                triggerTitle = `🌊 ${isGlobal ? '[Watchlist] ' : ''}CMF Heavy Inflow: ${ticker}`;
                triggerMsg = `Chaikin Money Flow surged to +${(signals.CMF?.value || 0.18).toFixed(2)} (Institutional Accumulation).`;
            } else if (sigType === 'cmf_outflow' && (signals.CMF?.value < -0.15 || signals.CMF?.status === 'outflow')) {
                triggered = true;
                triggerTitle = `🔻 ${isGlobal ? '[Watchlist] ' : ''}CMF Heavy Outflow: ${ticker}`;
                triggerMsg = `Chaikin Money Flow dropped to ${(signals.CMF?.value || -0.18).toFixed(2)} (Distribution).`;
            } else if (sigType === 'vwap_cross_above' && (signals.VWAP?.status === 'bullish' || (stock.currentPrice && signals.VWAP?.value && stock.currentPrice > signals.VWAP.value))) {
                triggered = true;
                triggerTitle = `🏛️ ${isGlobal ? '[Watchlist] ' : ''}Price Above Daily VWAP: ${ticker}`;
                triggerMsg = `Price holds above Daily Volume-Weighted Average Price at $${(stock.currentPrice || 0).toFixed(2)}.`;
            } else if (sigType === 'vwap_cross_below' && (signals.VWAP?.status === 'bearish' || (stock.currentPrice && signals.VWAP?.value && stock.currentPrice < signals.VWAP.value))) {
                triggered = true;
                triggerTitle = `🔻 ${isGlobal ? '[Watchlist] ' : ''}Price Below Daily VWAP: ${ticker}`;
                triggerMsg = `Price dropped below Daily Volume-Weighted Average Price at $${(stock.currentPrice || 0).toFixed(2)}.`;
            }
            // 4. Quantitative AI & Risk Execution
            else if (sigType === 'ai_conviction_high' && (stock.conviction_score >= 80 || stock.ai_rating === 'Strong Buy')) {
                triggered = true;
                triggerTitle = `🧠 ${isGlobal ? '[Watchlist] ' : ''}AI Conviction Upgrade (≥ 80%): ${ticker}`;
                triggerMsg = `Algorithmic conviction reached ${(stock.conviction_score || 85).toFixed(1)}% (Strong Bullish).`;
            } else if (sigType === 'ai_conviction_drop' && (stock.conviction_score < 45 || stock.ai_rating === 'Sell')) {
                triggered = true;
                triggerTitle = `⚠️ ${isGlobal ? '[Watchlist] ' : ''}AI Conviction Deterioration (< 45%): ${ticker}`;
                triggerMsg = `Algorithmic conviction score dropped to ${(stock.conviction_score || 40).toFixed(1)}%.`;
            } else if (sigType === 'daily_spike_pct' && (stock.changePercent || 0) >= 3.5) {
                triggered = true;
                triggerTitle = `🚀 ${isGlobal ? '[Watchlist] ' : ''}Intraday Volatility Spike: ${ticker}`;
                triggerMsg = `Price surged +${(stock.changePercent || 0).toFixed(2)}% in daily session at $${(stock.currentPrice || 0).toFixed(2)}.`;
            } else if (sigType === 'daily_drop_pct' && (stock.changePercent || 0) <= -3.5) {
                triggered = true;
                triggerTitle = `📉 ${isGlobal ? '[Watchlist] ' : ''}Intraday Volatility Drop: ${ticker}`;
                triggerMsg = `Price declined ${(stock.changePercent || 0).toFixed(2)}% in daily session at $${(stock.currentPrice || 0).toFixed(2)}.`;
            }
            // 5. Breaking News Catalysts
            else if (sigType === 'news_breaking_catalyst' && newsSignal) {
                triggered = true;
                triggerTitle = `🚨 ${isGlobal ? '[Watchlist] ' : ''}Breaking News Catalyst: ${ticker}`;
                triggerMsg = `High-impact breaking catalyst headline: "${newsSignal.headline}"`;
                newsMeta = newsSignal;
            } else if (sigType === 'news_sentiment_bullish' && newsSignal && (newsSignal.status === 'bullish' || (newsSignal.sentiment && newsSignal.sentiment.toLowerCase().includes('bull')))) {
                triggered = true;
                triggerTitle = `📈 ${isGlobal ? '[Watchlist] ' : ''}Bullish Catalyst Wire: ${ticker}`;
                triggerMsg = `Positive upgrade / earnings wire: "${newsSignal.headline}"`;
                newsMeta = newsSignal;
            } else if (sigType === 'news_sentiment_bearish' && newsSignal && (newsSignal.status === 'bearish' || (newsSignal.sentiment && newsSignal.sentiment.toLowerCase().includes('bear')))) {
                triggered = true;
                triggerTitle = `📉 ${isGlobal ? '[Watchlist] ' : ''}Adverse Event Wire: ${ticker}`;
                triggerMsg = `Adverse news event headline: "${newsSignal.headline}"`;
                newsMeta = newsSignal;
            } else if (sigType === 'news_tier1_source' && newsSignal) {
                triggered = true;
                triggerTitle = `🏛️ ${isGlobal ? '[Watchlist] ' : ''}Tier-1 Wire Breaking: ${ticker}`;
                triggerMsg = `${newsSignal.publisher} wire headline: "${newsSignal.headline}"`;
                newsMeta = newsSignal;
            }

            if (triggered) {
                const dedupeKey = `alert_${rule.id}_${ticker}_${sigType}_${(newsMeta?.headline || '').slice(0, 25)}`;
                if (window[dedupeKey]) return;
                window[dedupeKey] = true;
                // 30-minute cooldown per specific trigger event
                setTimeout(() => { delete window[dedupeKey]; }, 1800000);

                if (rule.channel === 'Browser Push') {
                    playAlertChime();
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(triggerTitle, {
                                body: triggerMsg,
                                icon: '/static/img/logo.png'
                            });
                        } catch (e) { }
                    }
                    renderAlertNotificationItem({
                        ticker: ticker,
                        isGlobalWatchlist: isGlobal,
                        title: triggerTitle,
                        message: triggerMsg,
                        channel: rule.channel,
                        channelTarget: rule.channelTarget,
                        timestamp: new Date().toLocaleTimeString(),
                        newsHeadline: newsMeta?.headline,
                        newsSummary: newsMeta?.summary,
                        newsPublisher: newsMeta?.publisher,
                        newsUrl: newsMeta?.url,
                        sentiment: newsMeta?.sentiment || 'Bullish',
                        isSimulated: false,
                        status: 'Delivered',
                        delivered: true
                    });
                } else {
                    // Remote Dispatch to Telegram, Discord, Email, or Custom Webhooks
                    fetch('/api/alerts/test-trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ticker: ticker,
                            signalName: rule.signalName || triggerTitle,
                            channel: rule.channel,
                            threshold: rule.threshold || triggerMsg,
                            channelTarget: rule.channelTarget,
                            newsUrl: newsMeta?.url || '#'
                        })
                    }).then(r => r.json()).then(data => {
                        if (data && data.notification) {
                            renderAlertNotificationItem(data.notification);
                        }
                    }).catch(e => console.warn('Background alert dispatch error:', e));
                }
            }
        });
    });
}

async function testTriggerAlert(id, ticker, signalName, channel, threshold = 'Trigger Level Reached', channelTarget = '') {
    try {
        const res = await fetch('/api/alerts/test-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker, signalName, channel, threshold, channelTarget })
        });
        const data = await res.json();
        if (data.notification) {
            if (channel === 'Browser Push') {
                playAlertChime();
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification(data.notification.title || 'Signal Triggered', {
                            body: data.notification.message || 'Trigger event fired.',
                            icon: '/static/img/logo.png'
                        });
                    } catch (e) { }
                }
            }
            renderAlertNotificationItem(data.notification);
        }
    } catch (e) {
        console.error('Failed to test alert trigger:', e);
    }
}

function clearAlertHistory() {
    state.alertHistory = [];
    try {
        localStorage.removeItem(getAlertHistoryStorageKey());
        localStorage.removeItem('findashiq_alert_logs_' + (state.user?.username || 'guest'));
    } catch (e) { }
    renderAlertHistoryEmptyState('Alert activity log cleared.');
    if (typeof showNotification === 'function') {
        showNotification('Signal activity log cleared', 'info');
    }
}

