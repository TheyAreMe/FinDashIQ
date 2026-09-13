/**
 * FinDashIQ Main Application Bootstrapper & Lifecycle Orchestrator
 * Coordinates domain modules (Core, Auth, Watchlist, Terminal, Backtesting, Scanner, Alerts)
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Fast bootstrap from server-rendered auth state if present
    let isAuthenticated = false;
    if (typeof window.__INITIAL_AUTH__ !== 'undefined' && window.__INITIAL_AUTH__ && window.__INITIAL_USER__) {
        state.user = window.__INITIAL_USER__;
        if (state.user.theme) {
            state.theme = state.user.theme;
        }
        if (state.user.baseCurrency) {
            state.baseCurrency = state.user.baseCurrency;
        }
        if (state.user.aiSettings) {
            state.aiSettings = {
                apiKey: state.user.aiSettings.apiKey || '',
                model: state.user.aiSettings.model || 'gemini-3.7-flash'
            };
        }
        isAuthenticated = true;
        setAppAuthState(true);
    }

    // Apply initial theme mode
    applyAppTheme(state.theme, false);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const apiKeyEl = document.getElementById('aiApiKeyInput');
    const modelEl = document.getElementById('aiModelSelect');
    if (apiKeyEl) apiKeyEl.value = state.aiSettings.apiKey;
    if (modelEl) modelEl.value = state.aiSettings.model;
    updateAIBadges();
    // Initialize i18n language bundle
    if (typeof initI18n === 'function') {
        initI18n(state.language);
    }

    // 1. Initialize Top Tab (Default: Watchlist)
    switchTopTab('watchlist');

    // 2. Preset Terminal default input & pre-render Active Stock Selector tabs
    const tickerInput = document.getElementById('tickerInput');
    const defaultTickers = tickerInput && tickerInput.value.trim()
        ? tickerInput.value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
        : ['AAPL', 'NVDA', 'MSFT'];
    if (tickerInput && !tickerInput.value.trim()) {
        tickerInput.value = defaultTickers.join(', ');
    }
    if (!state.activeTicker) {
        state.activeTicker = defaultTickers[0] || 'AAPL';
    }
    renderStockSelector(defaultTickers);

    // 3. If not already authenticated via SSR, verify session
    if (!isAuthenticated) {
        isAuthenticated = await checkSessionUser();
        setAppAuthState(isAuthenticated);
    }

    // 4. Instant parallel background startup hydration
    const runBackgroundInit = () => {
        loadPaperTrades();
        if (isAuthenticated) {
            initWatchlist();
            initScanner();
            initAlerts();
            fetchForexRates().then(() => syncCurrencySelects());
            checkInitialAIStatus();
        } else {
            fetchForexRates().then(() => syncCurrencySelects());
        }
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(runBackgroundInit, { timeout: 200 });
    } else {
        setTimeout(runBackgroundInit, 0);
    }

    // Close user dropdown and mobile subtab dropdown on outside click
    document.addEventListener('click', (e) => {
        const container = document.getElementById('headerUserContainer');
        const menu = document.getElementById('headerUserDropdownMenu');
        if (menu && container && !container.contains(e.target)) {
            menu.classList.remove('show');
        }

        const customTabDropdown = document.getElementById('mobileCustomTabDropdown');
        if (customTabDropdown && !customTabDropdown.contains(e.target)) {
            customTabDropdown.classList.remove('open');
        }

        const deepDiveSearchWrapper = document.getElementById('deepDiveSearchWrapper');
        const deepDiveDropdown = document.getElementById('deepDiveSearchDropdown');
        if (deepDiveDropdown && deepDiveSearchWrapper && !deepDiveSearchWrapper.contains(e.target)) {
            deepDiveDropdown.style.display = 'none';
        }
    });

    // Modal backdrop click and scroll lock synchronization
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                overlay.classList.remove('active');
                syncModalBodyScroll();
            }
        });
    });

    // ESC key listener to close open modals and restore scroll
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                if (overlay.style.display !== 'none') {
                    overlay.style.display = 'none';
                    overlay.classList.remove('active');
                }
            });
            syncModalBodyScroll();
        }
    });

    // MutationObserver to automatically keep body/html scroll lock in sync whenever any modal display style changes
    if (typeof MutationObserver !== 'undefined') {
        const modalObserver = new MutationObserver(() => {
            syncModalBodyScroll();
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            modalObserver.observe(overlay, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    }
});
