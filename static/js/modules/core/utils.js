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

function formatModelName(modelKey) {
    if (!modelKey) return 'Gemini 3.7 Flash';
    if (modelKey === 'gemini-3.7-flash') return 'Gemini 3.7 Flash';
    if (modelKey === 'gemini-3.6-flash') return 'Gemini 3.6 Flash';
    if (modelKey.startsWith('gemini-')) {
        return modelKey.replace('gemini-', 'Gemini ').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return modelKey;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function updateAIBadges(overrideStatus = null) {
    const hasKey = state.aiSettings.apiKey && state.aiSettings.apiKey.trim().length > 6;
    const badgeText = document.getElementById('headerAIBadgeText');
    const headerBadge = document.getElementById('headerAIBadge');
    const dot = headerBadge ? headerBadge.querySelector('.live-dot') : null;
    const currentModel = state.aiSettings.model || 'gemini-3.7-flash';
    const modelName = formatModelName(currentModel);

    if (overrideStatus) {
        state.aiStatus = overrideStatus;
    }

    if (!badgeText || !headerBadge) return;

    if (!hasKey) {
        // Red state: No API key available
        state.aiStatus = 'none';
        badgeText.textContent = 'No AI model available';
        headerBadge.style.borderColor = 'rgba(239, 68, 68, 0.45)';
        headerBadge.style.color = '#ef4444';
        headerBadge.style.background = 'rgba(239, 68, 68, 0.08)';
        headerBadge.title = 'No AI model active — Click to enter Google Gemini API Key';
        if (dot) {
            dot.style.backgroundColor = '#ef4444';
            dot.style.boxShadow = '0 0 8px #ef4444';
        }
    } else if (state.aiStatus === 'quota_exceeded' || state.aiStatus === 'rate_limited') {
        // Orange state: Key is present for the specific model, but quota/rate-limit reached
        badgeText.textContent = `${modelName} (Quota Exceeded)`;
        headerBadge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        headerBadge.style.color = '#f59e0b';
        headerBadge.style.background = 'rgba(245, 158, 11, 0.08)';
        headerBadge.title = `${modelName} Quota Exceeded — Click to manage API Key or Model`;
        if (dot) {
            dot.style.backgroundColor = '#f59e0b';
            dot.style.boxShadow = '0 0 8px #f59e0b';
        }
    } else {
        // Green state: Active model key without issues
        badgeText.textContent = `${modelName} Active`;
        headerBadge.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        headerBadge.style.color = '#10b981';
        headerBadge.style.background = 'rgba(16, 185, 129, 0.08)';
        headerBadge.title = `${modelName} Active — Click to manage AI Intelligence Settings`;
        if (dot) {
            dot.style.backgroundColor = '#10b981';
            dot.style.boxShadow = '0 0 8px #10b981';
        }
    }

    lucide.createIcons();
}

async function checkInitialAIStatus() {
    const apiKey = state.aiSettings.apiKey?.trim() || '';
    const model = state.aiSettings.model || 'gemini-3.7-flash';

    if (!apiKey || apiKey.length < 6) {
        updateAIBadges('none');
        return;
    }

    // Check session cache first to avoid repeating test API calls on every page refresh
    try {
        const cachedRaw = sessionStorage.getItem('findashiq_ai_status_cache');
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.key === apiKey && cached.model === model && (Date.now() - cached.time < 900000)) {
                updateAIBadges(cached.status);
                return;
            }
        }
    } catch (e) { }

    // Show active by default when key is present, verify in background
    updateAIBadges('active');

    try {
        const res = await fetch('/api/test-gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, model })
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
                key: apiKey,
                model: model,
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

