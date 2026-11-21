// Security & UI Utility Primitives (CSRF Fetch Interceptor, Scoped Icons, Escape, Toasts, Confirm, A11y, Confluence)
function getCsrfToken() {
    if (typeof window !== 'undefined' && window.__CSRF_TOKEN__) {
        return String(window.__CSRF_TOKEN__);
    }
    const meta = (typeof document !== 'undefined') ? document.querySelector('meta[name="csrf-token"]') : null;
    return meta ? String(meta.getAttribute('content') || '') : '';
}

function updateCsrfToken(token) {
    if (!token || typeof window === 'undefined') return;
    window.__CSRF_TOKEN__ = String(token);
    const meta = (typeof document !== 'undefined') ? document.querySelector('meta[name="csrf-token"]') : null;
    if (meta) meta.setAttribute('content', String(token));
}

if (typeof window !== 'undefined' && typeof window.fetch === 'function' && !window.__finDashFetchWrapped) {
    const _nativeFetch = window.fetch.bind(window);
    window.__finDashFetchWrapped = true;
    window.fetch = function (input, init) {
        const opts = init ? { ...init } : {};
        const method = String(opts.method || (input && typeof input === 'object' && input.method) || 'GET').toUpperCase();
        const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        const isSameOrigin = !urlStr || urlStr.startsWith('/') || urlStr.startsWith(window.location.origin);

        if (isSameOrigin && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const csrfTok = getCsrfToken();
            if (csrfTok) {
                if (opts.headers instanceof Headers) {
                    if (!opts.headers.has('X-CSRF-Token')) opts.headers.set('X-CSRF-Token', csrfTok);
                } else {
                    opts.headers = { ...(opts.headers || {}) };
                    if (!opts.headers['X-CSRF-Token'] && !opts.headers['x-csrf-token']) {
                        opts.headers['X-CSRF-Token'] = csrfTok;
                    }
                }
            }
        }
        return _nativeFetch(input, opts);
    };
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function refreshIcons(rootEl = null) {
    if (typeof lucide === 'undefined' || !lucide.createIcons) return;
    try {
        if (rootEl && rootEl instanceof Element) {
            lucide.createIcons({ root: rootEl });
        } else {
            lucide.createIcons();
        }
    } catch (_err) {
        try { lucide.createIcons(); } catch (_e) { }
    }
}

function showToast(message, type = 'info', durationMs = 4500) {
    const cleanMsg = String(message || '').trim();
    if (!cleanMsg || typeof document === 'undefined') return;
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    const tone = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
    const iconName = tone === 'success' ? 'check-circle'
        : tone === 'error' ? 'alert-octagon'
        : tone === 'warning' ? 'alert-triangle'
        : 'info';

    const item = document.createElement('div');
    item.className = `toast-item toast-${tone}`;
    item.setAttribute('role', 'status');
    item.innerHTML = `
        <i data-lucide="${iconName}" style="width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;"></i>
        <div style="flex: 1;">${escapeHtml(cleanMsg)}</div>
        <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
    `;

    const dismiss = () => {
        if (item.parentNode) item.remove();
    };
    const closeBtn = item.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    container.appendChild(item);
    refreshIcons(item);
    if (durationMs > 0) {
        setTimeout(dismiss, durationMs);
    }
}

let _lastFocusedBeforeModal = null;
function openAccessibleModal(modalEl, displayMode = 'flex') {
    if (!modalEl) return;
    _lastFocusedBeforeModal = document.activeElement;
    modalEl.style.display = displayMode;
    syncModalBodyScroll();
    const focusable = modalEl.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusable && typeof focusable.focus === 'function') {
        setTimeout(() => focusable.focus(), 20);
    }
}

function closeAccessibleModal(modalEl) {
    if (!modalEl) return;
    modalEl.style.display = 'none';
    syncModalBodyScroll();
    if (_lastFocusedBeforeModal && _lastFocusedBeforeModal.isConnected && typeof _lastFocusedBeforeModal.focus === 'function') {
        try { _lastFocusedBeforeModal.focus(); } catch (_err) { }
        _lastFocusedBeforeModal = null;
    }
}

function showConfirmModal(opts = {}) {
    const title = opts.title || 'Confirm Action';
    const message = opts.message || 'Are you sure you want to proceed?';
    const confirmText = opts.confirmText || 'Confirm';
    const cancelText = opts.cancelText || 'Cancel';
    const danger = opts.danger !== false;

    const modal = document.getElementById('confirmActionModal');
    if (!modal) {
        return Promise.resolve(false);
    }

    const titleEl = document.getElementById('confirmActionTitleText');
    const msgEl = document.getElementById('confirmActionMessage');
    const approveBtn = document.getElementById('btnConfirmApprove');
    const cancelBtn = document.getElementById('btnConfirmCancel');
    const closeX = document.getElementById('btnConfirmCloseX');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (approveBtn) {
        approveBtn.textContent = confirmText;
        approveBtn.style.background = danger ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '';
    }
    if (cancelBtn) cancelBtn.textContent = cancelText;

    return new Promise((resolve) => {
        let settled = false;
        const finish = (choice) => {
            if (settled) return;
            settled = true;
            document.removeEventListener('keydown', onKey);
            if (approveBtn) approveBtn.onclick = null;
            if (cancelBtn) cancelBtn.onclick = null;
            if (closeX) closeX.onclick = null;
            modal.onclick = null;
            closeAccessibleModal(modal);
            resolve(choice);
        };
        const onKey = (ev) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                finish(false);
            }
        };
        if (approveBtn) approveBtn.onclick = () => finish(true);
        if (cancelBtn) cancelBtn.onclick = () => finish(false);
        if (closeX) closeX.onclick = () => finish(false);
        modal.onclick = (ev) => {
            if (ev.target === modal) finish(false);
        };
        document.addEventListener('keydown', onKey);
        openAccessibleModal(modal, 'flex');
    });
}

function renderConfluenceGauge(confluence) {
    if (!confluence || typeof confluence !== 'object') return '';
    const score = Math.max(0, Math.min(100, Number(confluence.score || 0)));
    const aligned = Number(confluence.alignedCount || 0);
    const total = Number(confluence.totalOscillators || 0);
    const dir = String(confluence.direction || 'Mixed');
    const tier = String(confluence.tier || 'Confluence');

    let tierClass = 'confluence-tier-mod';
    let barColor = 'var(--accent-cyan, #06b6d4)';
    if (score >= 72) {
        tierClass = dir === 'Bearish' ? 'badge-bearish-text' : 'confluence-tier-high';
        barColor = dir === 'Bearish' ? 'var(--accent-red, #ef4444)' : 'var(--accent-green, #10b981)';
    } else if (score < 45) {
        tierClass = 'confluence-tier-div';
        barColor = '#f59e0b';
    }

    const badge = confluence.badgeLabel || (total ? `${aligned}/${total} ${dir}` : dir);
    return `
        <div class="confluence-gauge" title="${escapeHtml(tier)} (${score.toFixed(0)}%)">
            <div class="confluence-gauge-top">
                <span style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Technical Confluence</span>
                <span class="${tierClass} mono">${escapeHtml(badge)} · ${score.toFixed(0)}%</span>
            </div>
            <div class="confluence-gauge-bar">
                <div class="confluence-gauge-fill" style="width: ${score.toFixed(1)}%; background: ${barColor};"></div>
            </div>
        </div>
    `;
}

window.getCsrfToken = getCsrfToken;
window.updateCsrfToken = updateCsrfToken;
window.escapeHtml = escapeHtml;
window.refreshIcons = refreshIcons;
window.showToast = showToast;
window.showConfirmModal = showConfirmModal;
window.openAccessibleModal = openAccessibleModal;
window.closeAccessibleModal = closeAccessibleModal;
window.renderConfluenceGauge = renderConfluenceGauge;

function applyAppTheme(theme, persist = false) {
    const cleanTheme = (theme === 'bright' || theme === 'light') ? 'bright' : 'dark';
    state.theme = cleanTheme;
    document.documentElement.setAttribute('data-theme', cleanTheme);
    document.body.setAttribute('data-theme', cleanTheme);

    try {
        localStorage.setItem('findashiq_theme', cleanTheme);
    } catch (e) { }

    // Synchronize select inside Profile modal if present
    const themeSelect = document.getElementById('profileSelectTheme');
    if (themeSelect) themeSelect.value = cleanTheme;

    if (persist && state.user) {
        fetch('/api/auth/update-theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: cleanTheme })
        }).then(r => r.json()).then(data => {
            if (data.user) state.user = data.user;
        }).catch(e => console.warn('Could not persist theme preference:', e));
    }

    updateChartsTheme(cleanTheme);
    renderUserHeader();
    lucide.createIcons();
}

function toggleAppTheme() {
    const newTheme = state.theme === 'bright' ? 'dark' : 'bright';
    applyAppTheme(newTheme, true);
}

function updateChartsTheme(theme) {
    const isBright = theme === 'bright';
    const gridColor = isBright ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    const labelColor = isBright ? '#475569' : '#94a3b8';
    const tooltipTheme = isBright ? 'light' : 'dark';
    const borderColor = isBright ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)';

    Object.values(state.charts).forEach(chart => {
        if (chart && typeof chart.updateOptions === 'function') {
            try {
                chart.updateOptions({
                    theme: { mode: tooltipTheme },
                    grid: { borderColor: gridColor },
                    xaxis: {
                        labels: { style: { colors: labelColor } },
                        axisBorder: { color: borderColor },
                        axisTicks: { color: borderColor }
                    },
                    yaxis: {
                        labels: { style: { colors: labelColor } }
                    },
                    tooltip: { theme: tooltipTheme }
                }, false, false);
            } catch (e) {
                // Chart might be mid-render or destroyed
            }
        }
    });
}

function formatModelName(modelKey, providerKey = null) {
    if (!modelKey) {
        const prov = (typeof inferAIProvider === 'function') ? inferAIProvider(providerKey, '') : 'gemini';
        const fallbackId = (typeof AI_PROVIDER_CATALOG !== 'undefined' && AI_PROVIDER_CATALOG[prov]?.defaultModel) || 'gemini-4-hydrogen';
        modelKey = fallbackId;
    }
    if (typeof AI_PROVIDER_CATALOG !== 'undefined') {
        const catalogList = providerKey && AI_PROVIDER_CATALOG[providerKey]
            ? [AI_PROVIDER_CATALOG[providerKey]]
            : Object.values(AI_PROVIDER_CATALOG);
        for (const pCfg of catalogList) {
            const match = (pCfg.models || []).find(m => m.id === modelKey);
            if (match && match.label) {
                return match.label.replace(/\s*\([^)]*\)\s*$/, '');
            }
        }
    }
    if (modelKey.startsWith('gemini-')) {
        return modelKey.replace('gemini-', 'Gemini ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (modelKey.startsWith('claude-')) {
        return modelKey.replace('claude-', 'Claude ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (modelKey.startsWith('gpt-')) {
        return modelKey.replace(/^gpt-/i, 'GPT-').replace(/-/g, ' ');
    }
    return modelKey;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function updateAIBadges(overrideStatus = null) {
    const aiCfg = (typeof getActiveAIRequestConfig === 'function')
        ? getActiveAIRequestConfig()
        : {
            provider: state.aiSettings?.provider || 'gemini',
            model: state.aiSettings?.customModel || state.aiSettings?.model || 'gemini-4-hydrogen',
            apiKey: state.aiSettings?.apiKey || '',
            hasKey: Boolean(state.aiSettings?.hasKey)
        };
    const hasKey = Boolean(aiCfg.hasKey || (aiCfg.apiKey && aiCfg.apiKey.trim().length > 6));
    const badgeText = document.getElementById('headerAIBadgeText');
    const headerBadge = document.getElementById('headerAIBadge');
    const dot = headerBadge ? headerBadge.querySelector('.live-dot') : null;
    const currentModel = aiCfg.model;
    const modelName = formatModelName(currentModel, aiCfg.provider);

    if (overrideStatus) {
        state.aiStatus = overrideStatus;
    }

    if (!badgeText || !headerBadge) return;

    if (!hasKey) {
        state.aiStatus = 'none';
        badgeText.textContent = 'No AI model available';
        headerBadge.style.borderColor = 'rgba(239, 68, 68, 0.45)';
        headerBadge.style.color = '#ef4444';
        headerBadge.style.background = 'rgba(239, 68, 68, 0.08)';
        headerBadge.title = 'Built-in Quant AI Active — Click to add Gemini, Claude, or OpenAI key';
        if (dot) {
            dot.style.backgroundColor = '#ef4444';
            dot.style.boxShadow = '0 0 8px #ef4444';
        }
    } else if (state.aiStatus === 'quota_exceeded' || state.aiStatus === 'rate_limited') {
        badgeText.textContent = `${modelName} (Quota Exceeded)`;
        headerBadge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        headerBadge.style.color = '#f59e0b';
        headerBadge.style.background = 'rgba(245, 158, 11, 0.08)';
        headerBadge.title = `${modelName} Quota Exceeded — Click to manage API Key, Provider, or Model`;
        if (dot) {
            dot.style.backgroundColor = '#f59e0b';
            dot.style.boxShadow = '0 0 8px #f59e0b';
        }
    } else {
        badgeText.textContent = `${modelName} Active`;
        headerBadge.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        headerBadge.style.color = '#10b981';
        headerBadge.style.background = 'rgba(16, 185, 129, 0.08)';
        headerBadge.title = `${modelName} Active — Click to manage AI Provider & Model Settings`;
        if (dot) {
            dot.style.backgroundColor = '#10b981';
            dot.style.boxShadow = '0 0 8px #10b981';
        }
    }

    refreshIcons(headerBadge);
}

async function checkInitialAIStatus() {
    if (!state.user || state.isDemoMode) {
        updateAIBadges('none');
        return;
    }

    const aiCfg = (typeof getActiveAIRequestConfig === 'function')
        ? getActiveAIRequestConfig()
        : {
            provider: state.aiSettings?.provider || 'gemini',
            model: state.aiSettings?.customModel || state.aiSettings?.model || 'gemini-4-hydrogen',
            apiKey: state.aiSettings?.apiKey || '',
            hasKey: Boolean(state.aiSettings?.hasKey)
        };
    const apiKey = (aiCfg.apiKey || '').trim();
    const hasConfiguredKey = Boolean(aiCfg.hasKey || apiKey.length >= 6);
    const provider = aiCfg.provider;
    const model = aiCfg.model;

    if (!hasConfiguredKey) {
        updateAIBadges('none');
        return;
    }

    const cacheSig = `${provider}:${model}:${aiCfg.keyHint || (apiKey ? apiKey.slice(-4) : 'saved')}`;
    try {
        const cachedRaw = sessionStorage.getItem('findashiq_ai_status_cache');
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.sig === cacheSig && (Date.now() - cached.time < 900000)) {
                updateAIBadges(cached.status);
                return;
            }
        }
    } catch (e) { }

    updateAIBadges('active');

    try {
        const payload = { provider, model };
        if (apiKey.length >= 6) payload.apiKey = apiKey;

        const res = await fetch('/api/test-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            updateAIBadges('none');
            return;
        }

        const data = await res.json();
        let targetStatus = 'active';
        if (data.models && data.models.length > 0) {
            const currentTested = data.models.find(m => m.model === model) || data.models[0];
            if (currentTested && currentTested.status === 'rate_limited') {
                targetStatus = 'quota_exceeded';
            } else if (currentTested && currentTested.status === 'online') {
                targetStatus = 'active';
            } else if (data.success) {
                targetStatus = 'active';
            } else if (currentTested && (currentTested.status === 'invalid_key' || currentTested.status === 'not_found')) {
                targetStatus = 'none';
            } else {
                targetStatus = 'none';
            }
        } else if (data.success) {
            targetStatus = 'active';
        } else {
            targetStatus = 'none';
        }

        updateAIBadges(targetStatus);
        try {
            sessionStorage.setItem('findashiq_ai_status_cache', JSON.stringify({
                sig: cacheSig,
                status: targetStatus,
                time: Date.now()
            }));
        } catch (e) { }
    } catch (e) {
        console.warn('Initial AI status check error:', e);
    }
}

function syncModalBodyScroll() {
    const hasOpenModal = Array.from(document.querySelectorAll('.modal-overlay')).some(m => {
        const style = window.getComputedStyle(m);
        return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (hasOpenModal) {
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
    }
}



function openKofiWidget() {
    closeBmacWidget();
    const overlay = document.getElementById('kofiDirectOverlay');
    const frame = document.getElementById('kofiOfficialFrame');
    if (!overlay || !frame) return;

    if (!frame.src || frame.src === 'about:blank') {
        frame.src = frame.getAttribute('data-src') || 'https://ko-fi.com/theyareme/?hidefeed=true&widget=true&embed=true';
    }

    overlay.style.display = 'flex';
    document.body.classList.add('widget-open');
}

function closeKofiWidget() {
    const overlay = document.getElementById('kofiDirectOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('widget-open');
}

function openBmacWidget() {
    closeKofiWidget();
    const overlay = document.getElementById('bmacDirectOverlay');
    const frame = document.getElementById('bmacOfficialFrame');
    if (!overlay || !frame) return;

    if (!frame.src || frame.src === 'about:blank') {
        frame.src = frame.getAttribute('data-src') || 'https://www.buymeacoffee.com/widget/page/theyareme?custom_height=560&color=%23f59e0b';
    }

    overlay.style.display = 'flex';
    document.body.classList.add('widget-open');
}

function closeBmacWidget() {
    const overlay = document.getElementById('bmacDirectOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('widget-open');
}

// Global window bindings for inline HTML handlers
window.openKofiWidget = openKofiWidget;
window.closeKofiWidget = closeKofiWidget;
window.openBmacWidget = openBmacWidget;
window.closeBmacWidget = closeBmacWidget;

// Close direct vendor widgets on outside click
document.addEventListener('mousedown', (e) => {
    // 1. Ko-fi direct overlay outside click
    const kofiOverlay = document.getElementById('kofiDirectOverlay');
    if (kofiOverlay && kofiOverlay.style.display !== 'none') {
        const container = kofiOverlay.querySelector('.vendor-direct-container');
        if (container && !container.contains(e.target) && !e.target.closest('.footer-badge-btn, .auth-badge-btn')) {
            closeKofiWidget();
        }
    }

    // 2. Buy Me a Coffee direct overlay outside click
    const bmacOverlay = document.getElementById('bmacDirectOverlay');
    if (bmacOverlay && bmacOverlay.style.display !== 'none') {
        const container = bmacOverlay.querySelector('.vendor-direct-container');
        if (container && !container.contains(e.target) && !e.target.closest('.footer-badge-btn, .auth-badge-btn')) {
            closeBmacWidget();
        }
    }
});

// Close direct vendor widgets on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeKofiWidget();
        closeBmacWidget();
    }
});

/**
 * Resilient fetch wrapper with transparent retry for graceful server restart recovery.
 * If the server is in the middle of a 350ms soft-restart (returns 502/503 or network failure),
 * automatically retries after a short backoff so the user experiences zero interruption.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 2, delayMs = 400) {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, options);
            if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
                continue;
            }
            return res;
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}
window.fetchWithRetry = fetchWithRetry;


