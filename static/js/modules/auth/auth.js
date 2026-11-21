
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        syncModalBodyScroll();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        syncModalBodyScroll();
    }
}


// =============================================================
// AUTHENTICATION & USER PROFILE ENGINE
// =============================================================

function clearUserSessionDOM() {
    state.isDemoMode = false;
    const demoBanner = document.getElementById('demoModeBanner');
    if (demoBanner) demoBanner.classList.remove('active');

    // 1. Reset Watchlist Recommendation Hub DOM with shimmer skeletons (DES-2)
    const watchlistGrid = document.getElementById('watchlistCardsGrid');
    if (watchlistGrid) {
        const skeletonCards = Array.from({ length: 4 }, () => `
            <div class="skeleton-card" aria-hidden="true">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="skeleton skeleton-line tall"></div>
                    <div class="skeleton skeleton-line" style="width: 64px; height: 18px;"></div>
                </div>
                <div class="skeleton skeleton-chart"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line short"></div>
            </div>
        `).join('');
        watchlistGrid.innerHTML = skeletonCards;
    }
    const watchlistTags = document.getElementById('watchlistTagsList');
    if (watchlistTags) watchlistTags.innerHTML = '';
    const topWatchlistCount = document.getElementById('topWatchlistCount');
    if (topWatchlistCount) topWatchlistCount.textContent = '...';

    // 2. Reset Alerts & Notifications Hub DOM
    const alertsList = document.getElementById('activeAlertsList');
    if (alertsList) {
        alertsList.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 20px;">
                Loading alert rules...
            </div>
        `;
    }
    const alertsBadge = document.getElementById('activeAlertsBadge');
    if (alertsBadge) alertsBadge.textContent = '0 Rules Active';
    const topAlertsCount = document.getElementById('topAlertsCount');
    if (topAlertsCount) topAlertsCount.textContent = '0 Active';

    // 3. Reset AI Copilot Chat Messages
    const chatContainer = document.getElementById('copilotMessages');
    if (chatContainer) {
        chatContainer.innerHTML = `
            <div class="chat-bubble chat-bubble-ai">
                <i data-lucide="sparkles" style="width: 14px; color: var(--accent-purple); display: inline; vertical-align: middle; margin-right: 4px;"></i>
                FinDashIQ AI Copilot initialized. Ask anything about strategy, entry/exit levels, momentum indicators, or macro risks.
            </div>
        `;
    }

    // 4. Reset User Profile / Header / Admin directory
    const headerUser = document.getElementById('headerUserContainer');
    if (headerUser) headerUser.innerHTML = '';
    const adminTable = document.getElementById('adminUsersTableBody');
    if (adminTable) adminTable.innerHTML = '';

    // 5. Reset In-Memory State & Paper Trades
    state.watchlistTickers = [];
    state.watchlistData = {};
    state.alerts = [];
    state.copilotHistory = {};
    state.paperTrades = [];
    const ptBody = document.getElementById('paperTradesTableBody');
    if (ptBody) ptBody.innerHTML = '';
}

function setAppAuthState(isAuthenticated) {
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainAppContainer');

    if (isAuthenticated) {
        if (authScreen) authScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    } else {
        if (authScreen) authScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        clearUserSessionDOM();
    }
    renderUserHeader();
    syncScannerAdminControls(state.scannerResults);
    if (typeof refreshIcons === 'function') refreshIcons(document.getElementById('topHeader') || document.body);
}

async function checkSessionUser() {
    try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        if (data.csrfToken && typeof updateCsrfToken === 'function') {
            updateCsrfToken(data.csrfToken);
        }
        if (data.authenticated && data.user) {
            state.user = data.user;
            if (data.user.theme) {
                applyAppTheme(data.user.theme, false);
            }
            if (data.user.language) {
                state.language = data.user.language;
                localStorage.setItem('findashiq_language', data.user.language);
                if (typeof initI18n === 'function') initI18n(data.user.language);
            }
            if (data.user.aiSettings) {
                state.aiSettings = normalizeClientAISettings(data.user.aiSettings);
            } else {
                state.aiSettings = normalizeClientAISettings(null);
            }
            syncAISettingsModalUI();
            updateAIBadges();
            syncCurrencySelects();
            if (state.user && state.user.role === 'admin') {
                loadSystemUpdatesInfo(false);
            }
            return true;
        } else {
            state.user = null;
            state.aiSettings = normalizeClientAISettings(null);
            syncAISettingsModalUI();
            clearUserSessionDOM();
            return false;
        }
    } catch (e) {
        state.user = null;
        state.aiSettings = normalizeClientAISettings(null);
        syncAISettingsModalUI();
        clearUserSessionDOM();
        return false;
    }
}

function renderUserHeader() {
    const container = document.getElementById('headerUserContainer');
    if (!container) return;

    if (state.isDemoMode && !state.user) {
        container.innerHTML = `
            <button type="button" class="user-pill-btn" onclick="exitDemoMode()" title="Exit Demo Mode & Sign In">
                <span class="user-role-badge user">DEMO</span>
                <span class="user-pill-name">Sign In</span>
            </button>
        `;
        if (typeof refreshIcons === 'function') refreshIcons(container);
        return;
    }

    if (state.user) {
        const avatarIcon = _escHtmlSafe(state.user.avatar || 'user');
        const safeDisplay = _escHtmlSafe(state.user.displayName || state.user.username);
        const safeUsername = _escHtmlSafe(state.user.username);
        const roleLabel = _escHtmlSafe((state.user.role || 'user').toUpperCase());
        const roleClass = state.user.role === 'admin' ? 'admin' : 'user';

        container.innerHTML = `
            <button type="button" class="user-pill-btn" onclick="toggleUserDropdown(event)" title="Signed in as ${safeDisplay}">
                <div class="user-avatar-badge">
                    <i data-lucide="${avatarIcon}" style="width: 14px; height: 14px;"></i>
                </div>
                <span class="user-pill-name">${safeDisplay}</span>
                <span class="user-role-badge ${roleClass}">${roleLabel}</span>
                <i data-lucide="chevron-down" style="width: 12px; color: var(--text-muted);"></i>
            </button>

            <div id="headerUserDropdownMenu" class="user-dropdown-menu">
                <div class="user-dropdown-header">
                    <div class="user-dropdown-header-name">${safeDisplay}</div>
                    <div class="user-dropdown-header-role">@${safeUsername} • ${roleLabel}</div>
                </div>

                <button type="button" class="user-dropdown-item" onclick="openProfileModal('details')">
                    <i data-lucide="user-check" style="width: 14px; color: var(--accent-blue);"></i> ${t('My Profile & Preferences')}
                </button>

                <button type="button" class="user-dropdown-item theme-toggle-btn" onclick="toggleAppTheme()" title="${t('Switch between Dark and Bright themes')}">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="${state.theme === 'bright' ? 'sun' : 'moon'}" style="width: 14px; color: ${state.theme === 'bright' ? 'var(--accent-orange)' : 'var(--accent-blue)'};"></i>
                        <span>${t('Theme Mode')}</span>
                    </div>
                    <span class="theme-pill-badge">${state.theme === 'bright' ? '☀️ ' + t('Bright') : '🌙 ' + t('Dark')}</span>
                </button>

                <button type="button" class="user-dropdown-item" onclick="openAISettings()">
                    <i data-lucide="settings" style="width: 14px; color: var(--accent-amber);"></i> ${t('AI Settings')}
                </button>

                <button type="button" class="user-dropdown-item" onclick="openProfileModal('security')">
                    <i data-lucide="key" style="width: 14px; color: var(--accent-purple);"></i> ${t('Change Password')}
                </button>

                ${state.user.role === 'admin' ? `
                    <button type="button" class="user-dropdown-item" onclick="openProfileModal('users')">
                        <i data-lucide="users" style="width: 14px; color: var(--accent-green);"></i> ${t('Manage Users & Roles')}
                    </button>
                    <button type="button" class="user-dropdown-item" onclick="openProfileModal('updates')">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="refresh-cw" style="width: 14px; color: var(--accent-cyan);"></i> ${t('System Updates')}
                            </div>
                            <span id="userMenuUpdateBadge" class="badge-pill badge-bullish" style="font-size: 0.62rem; display: none; padding: 2px 6px;">${t('Update')}</span>
                        </div>
                    </button>
                ` : ''}

                <button type="button" class="user-dropdown-item" onclick="openHelpModal('overview')">
                    <i data-lucide="book-open" style="width: 14px; color: var(--accent-cyan);"></i> ${t('Help & Documentation (Wiki)')}
                </button>

                <button type="button" class="user-dropdown-item" onclick="openImpressumModal('impressum')">
                    <i data-lucide="scale" style="width: 14px; color: var(--accent-orange);"></i> ${t('Impressum & Legal')}
                </button>

                <div class="user-dropdown-divider"></div>

                <button type="button" class="user-dropdown-item danger" onclick="handleLogout()">
                    <i data-lucide="log-out" style="width: 14px;"></i> ${t('Sign Out')}
                </button>
            </div>
        `;
    } else {
        container.innerHTML = ``;
    }
    if (typeof refreshIcons === 'function') refreshIcons(container);
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('headerUserDropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
        if (typeof refreshIcons === 'function') refreshIcons(menu);
    }
}

async function handleLogin() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const msg = document.getElementById('authStatusMessage');
    const btn = document.getElementById('btnLoginSubmit');

    const username = usernameInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    if (!username || !password) return;

    if (btn) btn.disabled = true;
    if (msg) {
        msg.style.display = 'block';
        msg.style.background = 'rgba(59, 130, 246, 0.15)';
        msg.style.color = '#60a5fa';
        msg.style.border = '1px solid rgba(59, 130, 246, 0.3)';
        msg.textContent = 'Authenticating terminal credentials...';
    }

    const turnstileToken = document.querySelector('#authTurnstileContainer [name="cf-turnstile-response"]')?.value || '';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, turnstileToken })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            if (data.csrfToken && typeof updateCsrfToken === 'function') {
                updateCsrfToken(data.csrfToken);
            }
            // Immediately wipe any previous user session DOM & state before revealing UI
            clearUserSessionDOM();

            state.user = data.user;
            if (data.user.theme) {
                applyAppTheme(data.user.theme, false);
            }
            if (data.user.language) {
                state.language = data.user.language;
                localStorage.setItem('findashiq_language', data.user.language);
                if (typeof initI18n === 'function') initI18n(data.user.language);
            }
            if (data.user.aiSettings) {
                state.aiSettings = normalizeClientAISettings(data.user.aiSettings);
            } else {
                state.aiSettings = normalizeClientAISettings(null);
            }
            syncAISettingsModalUI();
            updateAIBadges();
            syncCurrencySelects();

            setAppAuthState(true);

            // Clear login inputs
            if (passwordInput) passwordInput.value = '';

            // Refresh user-specific watchlist, alerts, scanner, and paper trades
            await Promise.all([
                fetchForexRates(),
                checkInitialAIStatus(),
                initWatchlist(),
                initAlerts(),
                loadPaperTrades()
            ]);
        } else {
            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(239, 68, 68, 0.15)';
                msg.style.color = '#ef4444';
                msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                msg.textContent = data.error || 'Authentication failed. Please verify credentials.';
            }
        }
    } catch (err) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = 'Server connection error during authentication.';
        }
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout error:', e);
    }
    state.user = null;
    state.aiSettings = normalizeClientAISettings(null);
    _modalDraftApiKeys = { gemini: '', anthropic: '', openai: '' };

    // Completely wipe all user-specific DOM & data immediately
    clearUserSessionDOM();
    loadPaperTrades();

    syncAISettingsModalUI();
    updateAIBadges('none');
    closeProfileModal();
    setAppAuthState(false);

    const msg = document.getElementById('authStatusMessage');
    if (msg) msg.style.display = 'none';
}

function openProfileModal(tabKey = 'details') {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    // Close any open dropdown menu
    document.getElementById('headerUserDropdownMenu')?.classList.remove('show');

    if (!state.user) {
        openAuthModal();
        return;
    }

    // Populate user profile info
    const nameEl = document.getElementById('profileModalDisplayName');
    const roleBadge = document.getElementById('profileModalRoleBadge');
    const userSub = document.getElementById('profileModalUsernameSub');
    const avatarContainer = document.getElementById('profileModalAvatarIcon');

    if (nameEl) nameEl.textContent = state.user.displayName || state.user.username;
    if (userSub) userSub.textContent = `@${state.user.username}`;
    if (roleBadge) {
        roleBadge.textContent = (state.user.role || 'user').toUpperCase();
        roleBadge.className = `badge-pill ${state.user.role === 'admin' ? 'badge-bullish' : 'badge-neutral'}`;
    }
    if (avatarContainer) {
        avatarContainer.innerHTML = `<i data-lucide="${state.user.avatar || 'user'}" style="width: 22px; height: 22px;"></i>`;
    }

    // Form inputs
    const inputName = document.getElementById('profileInputDisplayName');
    const inputEmail = document.getElementById('profileInputEmail');
    const selectRisk = document.getElementById('profileSelectRisk');
    const selectCurrency = document.getElementById('profileSelectCurrency');
    const selectLanguage = document.getElementById('profileSelectLanguage');
    const selectTheme = document.getElementById('profileSelectTheme');

    if (inputName) inputName.value = state.user.displayName || '';
    if (inputEmail) inputEmail.value = state.user.email || '';
    if (selectRisk && state.user.riskProfile) selectRisk.value = state.user.riskProfile;
    if (selectCurrency && state.user.baseCurrency) selectCurrency.value = state.user.baseCurrency;
    if (selectLanguage) selectLanguage.value = state.user.language || state.language || 'en';
    if (selectTheme) selectTheme.value = state.user.theme || state.theme || 'dark';

    if (typeof syncLanguageSelects === 'function') {
        syncLanguageSelects();
    }

    // Set avatar radio button
    const avatarRadios = document.querySelectorAll('input[name="avatarIcon"]');
    avatarRadios.forEach(radio => {
        radio.checked = radio.value === (state.user.avatar || 'user');
    });

    // Show or hide admin user management tab button
    const adminTabBtn = document.getElementById('tabBtnProfileUsers');
    if (adminTabBtn) {
        adminTabBtn.style.display = state.user.role === 'admin' ? 'inline-flex' : 'none';
    }
    const updatesTabBtn = document.getElementById('tabBtnProfileUpdates');
    if (updatesTabBtn) {
        updatesTabBtn.style.display = state.user.role === 'admin' ? 'inline-flex' : 'none';
    }
    const maintTabBtn = document.getElementById('tabBtnProfileMaintenance');
    if (maintTabBtn) {
        maintTabBtn.style.display = state.user.role === 'admin' ? 'inline-flex' : 'none';
    }

    // Reset status message
    const msg = document.getElementById('profileStatusMessage');
    if (msg) msg.style.display = 'none';

    switchProfileModalTab(tabKey);
    modal.style.display = 'flex';
    lucide.createIcons();
}

function closeProfileModal() {
    stopMaintenanceTelemetryPolling();
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function switchProfileModalTab(tabKey) {
    const btnDetails = document.getElementById('tabBtnProfileDetails');
    const btnSecurity = document.getElementById('tabBtnProfileSecurity');
    const btnUsers = document.getElementById('tabBtnProfileUsers');
    const btnUpdates = document.getElementById('tabBtnProfileUpdates');
    const btnMaint = document.getElementById('tabBtnProfileMaintenance');

    const paneDetails = document.getElementById('profileTabPaneDetails');
    const paneSecurity = document.getElementById('profileTabPaneSecurity');
    const paneUsers = document.getElementById('profileTabPaneUsers');
    const paneUpdates = document.getElementById('profileTabPaneUpdates');
    const paneMaint = document.getElementById('profileTabPaneMaintenance');

    if (btnDetails) btnDetails.classList.toggle('active', tabKey === 'details');
    if (btnSecurity) btnSecurity.classList.toggle('active', tabKey === 'security');
    if (btnUsers) btnUsers.classList.toggle('active', tabKey === 'users');
    if (btnUpdates) btnUpdates.classList.toggle('active', tabKey === 'updates');
    if (btnMaint) btnMaint.classList.toggle('active', tabKey === 'maintenance');

    if (paneDetails) paneDetails.classList.toggle('active', tabKey === 'details');
    if (paneSecurity) paneSecurity.classList.toggle('active', tabKey === 'security');
    if (paneUsers) paneUsers.classList.toggle('active', tabKey === 'users');
    if (paneUpdates) paneUpdates.classList.toggle('active', tabKey === 'updates');
    if (paneMaint) paneMaint.classList.toggle('active', tabKey === 'maintenance');

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }

    if (tabKey === 'users' && state.user && state.user.role === 'admin') {
        loadAdminUsersList();
    }
    if (tabKey === 'updates' && state.user && state.user.role === 'admin') {
        loadSystemUpdatesInfo(false);
    }
    if (tabKey === 'maintenance' && state.user && state.user.role === 'admin') {
        startMaintenanceTelemetryPolling();
        loadMaintenanceStatus(false);
    } else {
        stopMaintenanceTelemetryPolling();
    }
}

function openSystemUpdatesModal() {
    if (state.user && state.user.role === 'admin') {
        openProfileModal('updates');
    } else {
        window.open('https://github.com/TheyAreMe/FinDashIQ/releases', '_blank');
    }
}

let isCheckingSystemUpdates = false;

async function loadSystemUpdatesInfo(force = false) {
    if (isCheckingSystemUpdates) return;
    isCheckingSystemUpdates = true;

    const btn = document.getElementById('btnCheckUpdatesNow');

    if (btn && force) {
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="refresh-cw" class="spin-animation" style="width: 14px; height: 14px;"></i> <span>Checking GitHub...</span>`;
        lucide.createIcons();
    }

    try {
        const url = `/api/admin/check-updates${force ? '?force=true' : ''}`;
        const res = await fetch(url);
        const data = await res.json();

        renderSystemUpdatesUI(data);
    } catch (err) {
        console.warn('System updates check error:', err);
        const subtext = document.getElementById('updateStatusSubtext');
        if (subtext) subtext.textContent = 'Unable to connect to GitHub releases: ' + (err.message || 'Network error');
    } finally {
        isCheckingSystemUpdates = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> <span>Check for Updates</span>`;
            lucide.createIcons();
        }
    }
}

function renderSystemUpdatesUI(data) {
    if (!data) return;

    const currentVer = data.current_version || '0.1.6';
    const latestVer = data.latest_version || currentVer;
    const isUpdateAvailable = Boolean(data.update_available);

    // Header & Footer Indicators
    const footerBadge = document.getElementById('footerUpdateAvailableBadge');
    const footerText = document.getElementById('footerUpdateAvailableText');
    const menuBadge = document.getElementById('userMenuUpdateBadge');

    if (isUpdateAvailable) {
        if (footerBadge) {
            footerBadge.style.display = 'inline-flex';
            if (footerText) footerText.textContent = `Update v${latestVer} Available`;
        }
        if (menuBadge) {
            menuBadge.style.display = 'inline-flex';
            menuBadge.textContent = `v${latestVer}`;
        }
    } else {
        if (footerBadge) footerBadge.style.display = 'none';
        if (menuBadge) menuBadge.style.display = 'none';
    }

    // Modal Pane Elements
    const curVerBadge = document.getElementById('updateCurrentVersionBadge');
    const stateBadge = document.getElementById('updateStatusStateBadge');
    const subtext = document.getElementById('updateStatusSubtext');
    const iconContainer = document.getElementById('updateStatusIconContainer');
    const detailsCard = document.getElementById('updateDetailsCard');

    if (curVerBadge) curVerBadge.textContent = `v${currentVer}`;

    if (isUpdateAvailable) {
        if (stateBadge) {
            stateBadge.className = 'badge-pill badge-bullish';
            stateBadge.textContent = `Update Available (v${latestVer})`;
        }
        if (iconContainer) {
            iconContainer.style.background = 'rgba(16, 185, 129, 0.15)';
            iconContainer.style.color = 'var(--accent-green)';
            iconContainer.innerHTML = '<i data-lucide="sparkles" style="width: 22px; height: 22px;"></i>';
        }
        if (subtext) {
            const dateStr = data.latest_release_date ? new Date(data.latest_release_date).toLocaleDateString() : 'recently';
            subtext.textContent = `New official release v${latestVer} published on ${dateStr}.`;
        }
        if (detailsCard) {
            detailsCard.style.display = 'block';
            const titleEl = document.getElementById('updateReleaseTitle');
            const metaEl = document.getElementById('updateReleaseMeta');
            const linkEl = document.getElementById('updateReleaseGithubLink');
            const bodyEl = document.getElementById('updateReleaseBody');

            if (titleEl) titleEl.textContent = data.latest_release_name || `Release v${latestVer}`;
            if (metaEl && data.latest_release_date) {
                metaEl.textContent = `Released: ${new Date(data.latest_release_date).toLocaleString()}`;
            }
            if (linkEl && data.latest_release_url) {
                linkEl.href = data.latest_release_url;
            }
            if (bodyEl) {
                const cleanBody = (data.latest_release_notes || 'No release notes provided.')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\r?\n/g, '<br>');
                bodyEl.innerHTML = cleanBody;
            }
        }
    } else {
        if (stateBadge) {
            stateBadge.className = 'badge-pill badge-neutral';
            stateBadge.textContent = 'Up to Date';
        }
        if (iconContainer) {
            iconContainer.style.background = 'rgba(59, 130, 246, 0.1)';
            iconContainer.style.color = 'var(--accent-blue)';
            iconContainer.innerHTML = '<i data-lucide="check-circle" style="width: 22px; height: 22px;"></i>';
        }
        if (subtext) {
            const cacheNotice = data.cached ? ' (Cached)' : '';
            subtext.textContent = `You are running the latest version of FinDashIQ (v${currentVer}).${cacheNotice}`;
        }
        if (detailsCard) {
            detailsCard.style.display = 'none';
        }
    }

    // Render Recent Releases History List
    const historyContainer = document.getElementById('updateRecentReleasesList');
    if (historyContainer && Array.isArray(data.recent_releases) && data.recent_releases.length > 0) {
        historyContainer.innerHTML = data.recent_releases.map(rel => {
            const isCurrent = rel.version === currentVer;
            const dateFormatted = rel.published_at ? new Date(rel.published_at).toLocaleDateString() : '';
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.8rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; color: var(--text-primary);">${rel.name || 'v' + rel.version}</span>
                        ${isCurrent ? '<span class="badge-pill badge-neutral" style="font-size: 0.65rem;">Installed</span>' : ''}
                        ${rel.prerelease ? '<span class="badge-pill badge-warning" style="font-size: 0.65rem;">Pre-release</span>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: var(--text-muted); font-size: 0.72rem;">${dateFormatted}</span>
                        <a href="${rel.html_url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.72rem; display: flex; align-items: center; gap: 3px;">
                            <span>GitHub</span> <i data-lucide="external-link" style="width: 11px;"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

function handleManualCheckUpdates() {
    loadSystemUpdatesInfo(true);
}

function openHelpTopic(topic = 'overview') {
    openHelpModal(topic);
}

function openHelpModal(topic = 'overview') {
    const modal = document.getElementById('helpModal');
    if (!modal) return;

    // Close any open dropdown menu
    document.getElementById('headerUserDropdownMenu')?.classList.remove('show');

    modal.style.display = 'flex';
    switchHelpTab(topic);
    lucide.createIcons();
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function switchHelpTab(tabKey) {
    const navButtons = document.querySelectorAll('.help-nav-btn');
    navButtons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(`'${tabKey}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const mobileSelect = document.getElementById('helpModalMobileSelect');
    if (mobileSelect && mobileSelect.value !== tabKey) {
        mobileSelect.value = tabKey;
    }

    const sections = document.querySelectorAll('.help-doc-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetMap = {
        'overview': 'helpTabOverview',
        'watchlist': 'helpTabWatchlist',
        'terminal': 'helpTabTerminal',
        'scanner': 'helpTabScanner',
        'backtest': 'helpTabBacktest',
        'news': 'helpTabNews',
        'currency': 'helpTabCurrency',
        'notifications': 'helpTabNotifications',
        'telegram': 'helpTabTelegram',
        'discord': 'helpTabDiscord',
        'email': 'helpTabEmail',
        'browser': 'helpTabBrowser',
        'webhooks': 'helpTabTelegram',
        'api': 'helpTabApi',
        'auth': 'helpTabAuth',
        'architecture': 'helpTabArchitecture',
        'legal': 'helpTabLegal'
    };

    const targetId = targetMap[tabKey] || 'helpTabOverview';
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.classList.add('active');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openImpressumModal(topic = 'impressum') {
    const modal = document.getElementById('impressumModal');
    if (!modal) return;

    // Close any open dropdown menu
    document.getElementById('headerUserDropdownMenu')?.classList.remove('show');

    modal.style.display = 'flex';
    switchImpressumTab(topic);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeImpressumModal() {
    const modal = document.getElementById('impressumModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function switchImpressumTab(tabKey) {
    const btnLegal = document.getElementById('tabBtnImpressumLegal');
    const btnDisclaimer = document.getElementById('tabBtnImpressumDisclaimer');
    const btnPrivacy = document.getElementById('tabBtnImpressumPrivacy');
    const btnAttributions = document.getElementById('tabBtnImpressumAttributions');
    const btnTerms = document.getElementById('tabBtnImpressumTerms');

    const paneLegal = document.getElementById('impressumTabPaneLegal');
    const paneDisclaimer = document.getElementById('impressumTabPaneDisclaimer');
    const panePrivacy = document.getElementById('impressumTabPanePrivacy');
    const paneAttributions = document.getElementById('impressumTabPaneAttributions');
    const paneTerms = document.getElementById('impressumTabPaneTerms');

    if (btnLegal) btnLegal.classList.toggle('active', tabKey === 'impressum');
    if (btnDisclaimer) btnDisclaimer.classList.toggle('active', tabKey === 'disclaimer');
    if (btnPrivacy) btnPrivacy.classList.toggle('active', tabKey === 'privacy');
    if (btnAttributions) btnAttributions.classList.toggle('active', tabKey === 'attributions');
    if (btnTerms) btnTerms.classList.toggle('active', tabKey === 'terms');

    if (paneLegal) {
        paneLegal.style.display = tabKey === 'impressum' ? 'block' : 'none';
        paneLegal.classList.toggle('active', tabKey === 'impressum');
    }
    if (paneDisclaimer) {
        paneDisclaimer.style.display = tabKey === 'disclaimer' ? 'block' : 'none';
        paneDisclaimer.classList.toggle('active', tabKey === 'disclaimer');
    }
    if (panePrivacy) {
        panePrivacy.style.display = tabKey === 'privacy' ? 'block' : 'none';
        panePrivacy.classList.toggle('active', tabKey === 'privacy');
    }
    if (paneAttributions) {
        paneAttributions.style.display = tabKey === 'attributions' ? 'block' : 'none';
        paneAttributions.classList.toggle('active', tabKey === 'attributions');
    }
    if (paneTerms) {
        paneTerms.style.display = tabKey === 'terms' ? 'block' : 'none';
        paneTerms.classList.toggle('active', tabKey === 'terms');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =============================================================
// CREATOR SUPPORT & OFFICIAL FLOATING WIDGET HANDLERS
// =============================================================
// CREATOR SUPPORT & DIRECT OFFICIAL VENDOR WIDGET HANDLERS
// =============================================================

async function handleUpdateProfile() {
    const displayName = document.getElementById('profileInputDisplayName')?.value.trim() || '';
    const email = document.getElementById('profileInputEmail')?.value.trim() || '';
    const riskProfile = document.getElementById('profileSelectRisk')?.value || 'Balanced';
    const baseCurrency = document.getElementById('profileSelectCurrency')?.value || 'USD';
    const language = document.getElementById('profileSelectLanguage')?.value || state.language || 'en';
    const theme = document.getElementById('profileSelectTheme')?.value || state.theme || 'dark';
    const avatar = document.querySelector('input[name="avatarIcon"]:checked')?.value || 'user';

    const msg = document.getElementById('profileStatusMessage');

    try {
        const res = await fetch('/api/auth/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, email, riskProfile, baseCurrency, language, theme, avatar })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            state.user = data.user;
            if (data.user.theme) {
                applyAppTheme(data.user.theme, false);
            }
            if (data.user.baseCurrency) {
                localStorage.setItem('findashiq_base_currency', data.user.baseCurrency);
            }
            if (data.user.language) {
                if (typeof handleLanguageChange === 'function') {
                    await handleLanguageChange(data.user.language);
                } else if (typeof initI18n === 'function') {
                    initI18n(data.user.language);
                }
            } else {
                renderUserHeader();
            }
            syncCurrencySelects();

            // Live recalculate open views
            if (typeof renderActiveStock === 'function') renderActiveStock();
            if (typeof renderWatchlist === 'function') renderWatchlist();
            if (typeof renderScannerResults === 'function' && state.scannerResults) {
                const scannerSearchInput = document.getElementById('scannerSearchQuery');
                if (scannerSearchInput && scannerSearchInput.value.trim()) {
                    handleScannerSearchFilter(scannerSearchInput.value);
                } else {
                    renderScannerResults(state.scannerResults.opportunities || []);
                }
            }
            if (typeof renderBacktest === 'function') renderBacktest();
            if (typeof lucide !== 'undefined') lucide.createIcons();

            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(16, 185, 129, 0.15)';
                msg.style.color = '#10b981';
                msg.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                msg.textContent = '✅ Profile preferences updated successfully!';
            }
        } else {
            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(239, 68, 68, 0.15)';
                msg.style.color = '#ef4444';
                msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                msg.textContent = `❌ ${data.error || 'Failed to update profile.'}`;
            }
        }
    } catch (e) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = `❌ Network error: ${e.message}`;
        }
    }
}

async function handleChangePassword() {
    const currentPassword = document.getElementById('passInputCurrent')?.value || '';
    const newPassword = document.getElementById('passInputNew')?.value || '';
    const confirmPassword = document.getElementById('passInputConfirm')?.value || '';
    const msg = document.getElementById('profileStatusMessage');

    if (!currentPassword || !newPassword) return;

    if (newPassword.length < 12) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = '❌ New password must be at least 12 characters long.';
        }
        return;
    }

    if (newPassword !== confirmPassword) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = '❌ New password and confirmation do not match.';
        }
        return;
    }

    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            document.getElementById('passInputCurrent').value = '';
            document.getElementById('passInputNew').value = '';
            document.getElementById('passInputConfirm').value = '';

            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(16, 185, 129, 0.15)';
                msg.style.color = '#10b981';
                msg.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                msg.textContent = '✅ Password successfully updated!';
            }
        } else {
            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(239, 68, 68, 0.15)';
                msg.style.color = '#ef4444';
                msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                msg.textContent = `❌ ${data.error || 'Password update failed.'}`;
            }
        }
    } catch (e) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = `❌ Network error: ${e.message}`;
        }
    }
}

async function loadAdminUsersList() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 16px;">Loading accounts directory...</td></tr>`;

    try {
        const res = await fetch('/api/auth/users');
        const data = await res.json();
        if (!res.ok || !data.success) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 16px;">${_escHtmlSafe(data.error || 'Failed to load user directory.')}</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        data.users.forEach(u => {
            const tr = document.createElement('tr');
            const isSelf = state.user && state.user.username === u.username;
            const roleBadgeClass = u.role === 'admin' ? 'user-role-badge admin' : 'user-role-badge user';
            const createdDate = _escHtmlSafe(u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A');
            const safeUsername = _escHtmlSafe(u.username);
            const safeDisplay = _escHtmlSafe(u.displayName || '-');
            const safeAvatar = _escHtmlSafe(u.avatar || 'user');
            const safeRole = _escHtmlSafe((u.role || 'user').toUpperCase());

            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--text-primary);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="${safeAvatar}" style="width: 14px; color: ${u.role === 'admin' ? '#c084fc' : '#60a5fa'};"></i>
                        @${safeUsername}
                        ${isSelf ? '<span style="font-size: 0.65rem; color: var(--accent-cyan);">(You)</span>' : ''}
                    </div>
                </td>
                <td>${safeDisplay}</td>
                <td><span class="${roleBadgeClass}">${safeRole}</span></td>
                <td style="color: var(--text-muted); font-size: 0.72rem;">${createdDate}</td>
                <td style="text-align: right;">
                    <button type="button" class="btn-table-delete" data-username="${safeUsername}" ${isSelf ? 'disabled title="Cannot delete own active account"' : ''}>
                        Delete
                    </button>
                </td>
            `;
            const delBtn = tr.querySelector('.btn-table-delete');
            if (delBtn && !isSelf) {
                delBtn.addEventListener('click', () => handleAdminDeleteUser(u.username));
            }
            tbody.appendChild(tr);
        });
        if (typeof refreshIcons === 'function') refreshIcons(tbody);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 16px;">Network error loading directory.</td></tr>`;
    }
}

async function handleAdminCreateUser() {
    const username = document.getElementById('newAccUsername')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('newAccPassword')?.value.trim() || '';
    const displayName = document.getElementById('newAccDisplayName')?.value.trim() || '';
    const role = document.getElementById('newAccRole')?.value || 'user';
    const msg = document.getElementById('profileStatusMessage');

    if (!username || !password) return;

    try {
        const res = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, displayName, role })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            document.getElementById('newAccUsername').value = '';
            document.getElementById('newAccPassword').value = '';
            document.getElementById('newAccDisplayName').value = '';

            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(16, 185, 129, 0.15)';
                msg.style.color = '#10b981';
                msg.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                msg.textContent = `✅ Account @${username} created successfully!`;
            }
            await loadAdminUsersList();
        } else {
            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(239, 68, 68, 0.15)';
                msg.style.color = '#ef4444';
                msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                msg.textContent = `❌ ${data.error || 'Failed to create user.'}`;
            }
        }
    } catch (e) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = `❌ Network error: ${e.message}`;
        }
    }
}

async function handleAdminDeleteUser(targetUsername) {
    const confirmed = (typeof showConfirmModal === 'function')
        ? await showConfirmModal({
            title: 'Delete User Account',
            message: `Are you sure you want to permanently delete the account @${targetUsername}? This action cannot be undone.`,
            confirmText: 'Delete Account',
            danger: true
        })
        : false;
    if (!confirmed) return;

    const msg = document.getElementById('profileStatusMessage');
    try {
        const res = await fetch(`/api/auth/users/${encodeURIComponent(targetUsername)}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (res.ok && data.success) {
            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(16, 185, 129, 0.15)';
                msg.style.color = '#10b981';
                msg.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                msg.textContent = `✅ Account @${targetUsername} removed.`;
            }
            await loadAdminUsersList();
        } else {
            if (msg) {
                msg.style.display = 'block';
                msg.style.background = 'rgba(239, 68, 68, 0.15)';
                msg.style.color = '#ef4444';
                msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                msg.textContent = `❌ ${data.error || 'Failed to delete user.'}`;
            }
        }
    } catch (e) {
        if (msg) {
            msg.style.display = 'block';
            msg.style.background = 'rgba(239, 68, 68, 0.15)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            msg.textContent = `❌ Network error: ${e.message}`;
        }
    }
}

let _modalDraftProvider = 'gemini';
let _modalDraftApiKeys = { gemini: '', anthropic: '', openai: '' };

function _escHtmlSafe(str) {
    if (typeof escapeHtml === 'function') return escapeHtml(str);
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function populateAIModelDropdown(provider, selectedModel = '', liveModels = null) {
    const modelEl = document.getElementById('aiModelSelect');
    if (!modelEl) return;

    const cleanProvider = inferAIProvider(provider, selectedModel);
    const cfg = AI_PROVIDER_CATALOG[cleanProvider] || AI_PROVIDER_CATALOG.gemini;
    const baseModels = Array.isArray(liveModels) && liveModels.length > 0 ? liveModels : (cfg.models || []);
    const targetModel = selectedModel || cfg.defaultModel;

    modelEl.innerHTML = '';
    let foundSelected = false;

    baseModels.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.label || m.id;
        if (m.id === targetModel) {
            opt.selected = true;
            foundSelected = true;
        }
        modelEl.appendChild(opt);
    });

    if (!foundSelected && targetModel) {
        const customOpt = document.createElement('option');
        customOpt.value = targetModel;
        customOpt.textContent = `${targetModel} (Saved)`;
        customOpt.selected = true;
        modelEl.appendChild(customOpt);
    }
}

function syncAISettingsModalUI(providerOverride = null, preferredModel = null) {
    const norm = normalizeClientAISettings(state.aiSettings);
    const provider = providerOverride ? inferAIProvider(providerOverride, preferredModel) : norm.provider;
    const cfg = AI_PROVIDER_CATALOG[provider] || AI_PROVIDER_CATALOG.gemini;

    const providerEl = document.getElementById('aiProviderSelect');
    const customModelEl = document.getElementById('aiCustomModelInput');
    const apiKeyEl = document.getElementById('aiApiKeyInput');
    const apiKeyLabelEl = document.getElementById('aiApiKeyLabel');
    const docsLinkEl = document.getElementById('aiProviderDocsLink');
    const hintEl = document.getElementById('aiSavedKeyHint');
    const clearBtn = document.getElementById('btnClearAIKey');

    _modalDraftProvider = provider;
    if (providerOverride === null) {
        _modalDraftApiKeys = { ...norm.apiKeys };
    }

    const serverConfigured = Boolean(norm.configuredProviders && norm.configuredProviders[provider]);
    const keyHint = (norm.keyHints && norm.keyHints[provider]) || (provider === norm.provider ? norm.keyHint : '');

    if (providerEl) providerEl.value = provider;
    populateAIModelDropdown(provider, preferredModel || (provider === norm.provider ? norm.model : cfg.defaultModel));
    if (customModelEl && providerOverride === null) {
        customModelEl.value = norm.customModel || '';
    }
    if (apiKeyLabelEl) apiKeyLabelEl.textContent = cfg.keyLabel;
    if (apiKeyEl) {
        apiKeyEl.placeholder = serverConfigured
            ? `Saved on server (${keyHint || '••••'}) — leave blank to keep`
            : cfg.keyPlaceholder;
        apiKeyEl.value = _modalDraftApiKeys[provider] || '';
    }
    if (hintEl) {
        if (serverConfigured) {
            hintEl.style.display = 'flex';
            const txtSpan = hintEl.querySelector('#aiSavedKeyHintText');
            if (txtSpan) txtSpan.textContent = `Encrypted server key active (${keyHint || '••••'})`;
        } else {
            hintEl.style.display = 'none';
        }
    }
    if (clearBtn) {
        clearBtn.style.display = serverConfigured ? 'inline-flex' : 'none';
    }
    if (docsLinkEl) {
        docsLinkEl.href = cfg.docsUrl;
        docsLinkEl.textContent = `${cfg.docsLabel} →`;
    }
}

function onAIProviderChange() {
    const providerEl = document.getElementById('aiProviderSelect');
    const apiKeyEl = document.getElementById('aiApiKeyInput');
    const customModelEl = document.getElementById('aiCustomModelInput');
    const statusEl = document.getElementById('aiTestStatus');

    if (apiKeyEl && _modalDraftProvider) {
        _modalDraftApiKeys[_modalDraftProvider] = apiKeyEl.value.trim();
    }

    const nextProvider = providerEl?.value || 'gemini';
    if (customModelEl) customModelEl.value = '';
    if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
    }
    syncAISettingsModalUI(nextProvider);
}

async function fetchLiveAIModels() {
    const provider = document.getElementById('aiProviderSelect')?.value || 'gemini';
    const apiKey = document.getElementById('aiApiKeyInput')?.value.trim() || '';
    const btn = document.getElementById('btnFetchAIModels');
    const statusEl = document.getElementById('aiTestStatus');
    const currentModel = document.getElementById('aiModelSelect')?.value || '';

    if (btn) btn.disabled = true;
    try {
        const res = await fetch('/api/ai/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, apiKey })
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.models) && data.models.length > 0) {
            populateAIModelDropdown(provider, currentModel, data.models);
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.style.background = 'rgba(16, 185, 129, 0.12)';
                statusEl.style.color = '#10b981';
                statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                statusEl.innerHTML = `✅ Loaded <strong>${data.models.length}</strong> live models from ${_escHtmlSafe(AI_PROVIDER_CATALOG[provider]?.name || provider)}.`;
            }
        } else if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(245, 158, 11, 0.12)';
            statusEl.style.color = '#f59e0b';
            statusEl.style.border = '1px solid rgba(245, 158, 11, 0.3)';
            statusEl.innerHTML = `⚠️ ${_escHtmlSafe(data.error || 'Could not fetch live model list; showing curated defaults.')}`;
        }
    } catch (err) {
        if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
            statusEl.style.color = '#ef4444';
            statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            statusEl.innerHTML = `❌ <strong>Network Error:</strong> ${_escHtmlSafe(err.message)}`;
        }
    } finally {
        if (btn) btn.disabled = false;
    }
}

function openAISettings() {
    const modal = document.getElementById('aiSettingsModal');
    const statusEl = document.getElementById('aiTestStatus');

    document.getElementById('headerUserDropdownMenu')?.classList.remove('show');

    syncAISettingsModalUI(null);
    if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
    }
    if (typeof openAccessibleModal === 'function') {
        openAccessibleModal(modal, 'flex');
    } else if (modal) {
        modal.style.display = 'flex';
    }
    if (typeof refreshIcons === 'function') refreshIcons(modal);
}

function closeAISettings() {
    const modal = document.getElementById('aiSettingsModal');
    if (typeof closeAccessibleModal === 'function') {
        closeAccessibleModal(modal);
    } else if (modal) {
        modal.style.display = 'none';
    }
}

async function testAIConnection() {
    const provider = document.getElementById('aiProviderSelect')?.value || 'gemini';
    const apiKey = document.getElementById('aiApiKeyInput')?.value.trim() || '';
    const customModel = document.getElementById('aiCustomModelInput')?.value.trim() || '';
    const selectedModel = document.getElementById('aiModelSelect')?.value || (AI_PROVIDER_CATALOG[provider]?.defaultModel || 'gemini-4-hydrogen');
    const model = customModel || selectedModel;
    const providerName = AI_PROVIDER_CATALOG[provider]?.name || provider;
    const statusEl = document.getElementById('aiTestStatus');
    const btn = document.getElementById('btnTestAI');

    if (!statusEl) return;

    const norm = normalizeClientAISettings(state.aiSettings);
    const hasSaved = Boolean(norm.configuredProviders && norm.configuredProviders[provider]);
    if (!apiKey && !hasSaved) {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = '#ef4444';
        statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusEl.innerHTML = `⚠️ Please paste a ${_escHtmlSafe(providerName)} API Key first.`;
        return;
    }

    if (btn) btn.disabled = true;
    statusEl.style.display = 'block';
    statusEl.style.background = 'rgba(59, 130, 246, 0.15)';
    statusEl.style.color = '#60a5fa';
    statusEl.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    statusEl.innerHTML = `<em>Testing connection to ${_escHtmlSafe(providerName)} (${_escHtmlSafe(model)})...</em>`;

    try {
        const res = await fetch('/api/test-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, apiKey, model })
        });

        let data;
        const rawText = await res.text();
        try {
            data = JSON.parse(rawText);
        } catch (jsonErr) {
            data = { success: false, error: `Server error (${res.status}): ${rawText.substring(0, 120)}` };
        }

        if (data.models && data.models.length > 0) {
            let html = `<div style="font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">Diagnostic Results (${_escHtmlSafe(providerName)}):</div>`;
            data.models.forEach(m => {
                let row = '';
                const safeModel = _escHtmlSafe(m.model);
                const rawMsg = String(m.message || '');
                const shortMsg = _escHtmlSafe(rawMsg.length > 140 ? `${rawMsg.slice(0, 140)}...` : rawMsg);
                if (m.status === 'online') {
                    row = `<span style="color: #10b981;">✅ <strong>${safeModel}</strong>: Active &amp; Responding</span>`;
                } else if (m.status === 'quota_zero') {
                    row = `<span style="color: #f59e0b;">💳 <strong>${safeModel}</strong>: Paid Tier / Billing Required (Free Tier quota is 0) — switch to Gemini 4 Hydrogen or Gemini 3.8 Flash</span>`;
                } else if (m.status === 'overloaded') {
                    row = `<span style="color: #f59e0b;">⏳ <strong>${safeModel}</strong>: Temporary High Demand (503) — traffic spike at provider; fallback model handles queries automatically</span>`;
                } else if (m.status === 'rate_limited') {
                    row = `<span style="color: #f59e0b;">⏳ <strong>${safeModel}</strong>: Rate Limited / Quota Exceeded${shortMsg ? ` — <span style="opacity:0.85;">${shortMsg}</span>` : ''}</span>`;
                } else if (m.status === 'timeout') {
                    row = `<span style="color: #ef4444;">⏱️ <strong>${safeModel}</strong>: Request timed out (high latency on reasoning tier — try Gemini 3.8 Flash or Gemini 3.1 Flash-Lite)</span>`;
                } else {
                    row = `<span style="color: #ef4444;">❌ <strong>${safeModel}</strong>: ${shortMsg}</span>`;
                }
                html += `<div style="padding: 3px 0; font-size: 0.78rem;">${row}</div>`;
            });

            if (data.success) {
                statusEl.style.background = 'rgba(16, 185, 129, 0.12)';
                statusEl.style.color = 'var(--text-primary)';
                statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                html += `<div style="margin-top: 8px; font-size: 0.76rem; color: #10b981; border-top: 1px solid rgba(16,185,129,0.2); padding-top: 6px;"><strong>✨ Auto-Fallback Active:</strong> If your selected model is rate-limited, queries automatically route to the provider's fallback tier.</div>`;
            } else if (data.keyValid) {
                const countHint = data.availableModelsCount ? ` (${data.availableModelsCount} live models accessible)` : '';
                statusEl.style.background = 'rgba(245, 158, 11, 0.12)';
                statusEl.style.color = 'var(--text-primary)';
                statusEl.style.border = '1px solid rgba(245, 158, 11, 0.35)';
                html += `<div style="margin-top: 8px; font-size: 0.76rem; color: #f59e0b; border-top: 1px solid rgba(245,158,11,0.25); padding-top: 6px;"><strong>🔑 API Key Verified${_escHtmlSafe(countHint)}:</strong> Your key is valid, but the tested model hit billing quota or latency limits. Click <strong>Fetch Live Models</strong> or choose <strong>Gemini 3.8 Flash</strong> / <strong>Gemini 3.1 Flash-Lite</strong>.</div>`;
            } else {
                statusEl.style.background = 'rgba(239, 68, 68, 0.12)';
                statusEl.style.color = 'var(--text-primary)';
                statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            }
            statusEl.innerHTML = html;
        } else if (res.ok && data.success) {
            statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
            statusEl.style.color = '#10b981';
            statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            statusEl.innerHTML = `✅ <strong>Connected!</strong> ${_escHtmlSafe(providerName)} verified with ${_escHtmlSafe(model)}.`;
        } else {
            statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
            statusEl.style.color = '#ef4444';
            statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            statusEl.innerHTML = `❌ <strong>Error:</strong> ${_escHtmlSafe(data.error || 'Connection failed.')}`;
        }
    } catch (err) {
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = '#ef4444';
        statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusEl.innerHTML = `❌ <strong>Network Error:</strong> ${_escHtmlSafe(err.message)}`;
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function saveAISettings() {
    const provider = document.getElementById('aiProviderSelect')?.value || 'gemini';
    const key = document.getElementById('aiApiKeyInput')?.value.trim() || '';
    const model = document.getElementById('aiModelSelect')?.value || (AI_PROVIDER_CATALOG[provider]?.defaultModel || 'gemini-4-hydrogen');
    const customModel = document.getElementById('aiCustomModelInput')?.value.trim() || '';

    _modalDraftApiKeys[provider] = key;
    const savePayload = {
        provider: provider,
        model: model,
        customModel: customModel
    };
    if (key) savePayload.apiKey = key;
    const nonEmptyDrafts = {};
    Object.keys(_modalDraftApiKeys).forEach(k => {
        if (_modalDraftApiKeys[k]) nonEmptyDrafts[k] = _modalDraftApiKeys[k];
    });
    if (Object.keys(nonEmptyDrafts).length > 0) {
        savePayload.apiKeys = nonEmptyDrafts;
    }

    try {
        sessionStorage.removeItem('findashiq_ai_status_cache');
    } catch (e) { }

    if (state.user) {
        try {
            const res = await fetch('/api/auth/update-ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload)
            });
            const data = await res.json();
            if (res.ok && data.user) {
                state.user = data.user;
                state.aiSettings = normalizeClientAISettings(data.user.aiSettings);
                _modalDraftApiKeys = { gemini: '', anthropic: '', openai: '' };
            }
        } catch (e) {
            console.error('Error saving AI settings to user account:', e);
        }
    } else {
        state.aiSettings = normalizeClientAISettings(savePayload);
    }

    closeAISettings();
    syncAISettingsModalUI(null);
    await checkInitialAIStatus();
    if (typeof showToast === 'function') {
        showToast('AI provider & model settings saved.', 'success');
    }
    if (state.activeTopTab === 'terminal' && state.activeTicker && typeof handleAnalyze === 'function') {
        handleAnalyze();
    }
}

async function clearSavedProviderKey() {
    const provider = document.getElementById('aiProviderSelect')?.value || 'gemini';
    const model = document.getElementById('aiModelSelect')?.value || (AI_PROVIDER_CATALOG[provider]?.defaultModel || 'gemini-4-hydrogen');
    const customModel = document.getElementById('aiCustomModelInput')?.value.trim() || '';
    const providerName = AI_PROVIDER_CATALOG[provider]?.name || provider;

    _modalDraftApiKeys[provider] = '';
    const apiKeyEl = document.getElementById('aiApiKeyInput');
    if (apiKeyEl) apiKeyEl.value = '';

    if (state.user) {
        try {
            const res = await fetch('/api/auth/update-ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, model, customModel, clearKey: true })
            });
            const data = await res.json();
            if (res.ok && data.user) {
                state.user = data.user;
                state.aiSettings = normalizeClientAISettings(data.user.aiSettings);
            }
        } catch (e) {
            console.error('Error clearing AI key:', e);
        }
    }
    try { sessionStorage.removeItem('findashiq_ai_status_cache'); } catch (_e) { }
    syncAISettingsModalUI(provider);
    updateAIBadges();
    if (typeof showToast === 'function') {
        showToast(`Cleared saved ${providerName} API key.`, 'info');
    }
}

async function enterDemoMode() {
    try {
        const res = await fetch('/api/demo/showcase');
        const data = await res.json();
        if (!res.ok || !data.success || !data.stocks) {
            throw new Error(data.error || 'Could not load demo showcase.');
        }

        state.user = null;
        state.isDemoMode = true;
        state.watchlistTickers = Array.isArray(data.tickers) ? data.tickers : Object.keys(data.stocks);
        state.watchlistData = data.stocks;
        state.stocksData = { ...data.stocks };
        state.activeTicker = state.watchlistTickers[0] || 'NVDA';

        const authScreen = document.getElementById('authScreen');
        const mainApp = document.getElementById('mainAppContainer');
        const demoBanner = document.getElementById('demoModeBanner');
        if (authScreen) authScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        if (demoBanner) demoBanner.classList.add('active');

        renderUserHeader();
        updateAIBadges('none');
        if (typeof renderWatchlist === 'function') renderWatchlist();
        if (typeof renderActiveStock === 'function') renderActiveStock();
        if (typeof showToast === 'function') {
            showToast('Exploring read-only Live Demo showcase. Sign in to run live market updates.', 'info');
        }
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message || 'Demo showcase unavailable.', 'error');
    }
}

function exitDemoMode() {
    state.isDemoMode = false;
    const demoBanner = document.getElementById('demoModeBanner');
    if (demoBanner) demoBanner.classList.remove('active');
    setAppAuthState(false);
}

// -------------------------------------------------------------
// SERVER MAINTENANCE & 1-CLICK RAM OPTIMIZATION CONTROLLERS
// -------------------------------------------------------------
let maintenancePollingTimerId = null;
let isOptimizingMemory = false;

function startMaintenanceTelemetryPolling() {
    stopMaintenanceTelemetryPolling();
    maintenancePollingTimerId = setInterval(() => {
        const paneMaint = document.getElementById('profileTabPaneMaintenance');
        const modal = document.getElementById('profileModal');
        if (modal && modal.style.display !== 'none' && paneMaint && paneMaint.classList.contains('active')) {
            loadMaintenanceStatus(true);
        } else {
            stopMaintenanceTelemetryPolling();
        }
    }, 10000);
}

function stopMaintenanceTelemetryPolling() {
    if (maintenancePollingTimerId) {
        clearInterval(maintenancePollingTimerId);
        maintenancePollingTimerId = null;
    }
}

async function loadMaintenanceStatus(silent = false) {
    const btnRefresh = document.getElementById('btnRefreshMaintTelemetry');
    if (!silent && btnRefresh) {
        btnRefresh.disabled = true;
        btnRefresh.innerHTML = `<i data-lucide="refresh-cw" class="spin-animation" style="width: 13px; height: 13px;"></i> <span>Refreshing...</span>`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons({ root: btnRefresh });
        }
    }

    try {
        const res = await fetch('/api/admin/maintenance/status');
        if (!res.ok) {
            throw new Error(`Failed to load server status (${res.status})`);
        }
        const data = await res.json();
        renderMaintenanceUI(data);
    } catch (err) {
        console.warn('Maintenance status error:', err);
    } finally {
        if (!silent && btnRefresh) {
            btnRefresh.disabled = false;
            btnRefresh.innerHTML = `<i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> <span>Refresh</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: btnRefresh });
            }
        }
    }
}

function renderMaintenanceUI(data) {
    if (!data) return;

    // Platform & Uptime Hero
    const platformBadge = document.getElementById('maintPlatformBadge');
    const statusBadge = document.getElementById('maintStatusBadge');
    const uptimeSub = document.getElementById('maintUptimeSubtext');

    if (platformBadge && data.environment) {
        platformBadge.textContent = data.environment.platform_display || data.environment.os_name || 'Server';
    }
    if (statusBadge) {
        statusBadge.textContent = 'Healthy';
        statusBadge.className = 'badge-pill badge-bullish';
    }
    if (uptimeSub && data.uptime) {
        const pidStr = data.environment?.worker_pid ? ` • PID: ${data.environment.worker_pid}` : '';
        uptimeSub.textContent = `Uptime: ${data.uptime.uptime_formatted || '0m'}${pidStr} • Time: ${data.timestamp || ''}`;
    }

    // Process / Cluster RAM Card
    const ramCardLabel = document.getElementById('maintRamCardLabel');
    const rssVal = document.getElementById('maintProcessRssVal');
    const rssSub = document.getElementById('maintProcessRssSub');

    if (data.gunicorn_cluster) {
        const cluster = data.gunicorn_cluster;
        if (ramCardLabel) ramCardLabel.textContent = 'Gunicorn Cluster RAM';
        if (rssVal) {
            rssVal.textContent = `${cluster.total_cluster_rss_mb.toFixed(0)} MB`;
            rssVal.style.color = cluster.total_cluster_rss_mb > 700 ? 'var(--accent-amber)' : 'var(--text-primary)';
        }
        if (rssSub) {
            const currentRss = typeof data.process_memory_mb === 'number' ? data.process_memory_mb.toFixed(0) : '--';
            rssSub.textContent = `${cluster.worker_count} workers (${currentRss} MB current) + master`;
            if (Array.isArray(cluster.workers)) {
                rssSub.title = cluster.workers.map(w => `PID ${w.pid}: ${w.rss_mb} MB${w.is_current ? ' [current]' : ''}`).join(', ');
            }
        }
    } else {
        if (ramCardLabel) ramCardLabel.textContent = 'Server Process RAM';
        if (rssVal && typeof data.process_memory_mb === 'number') {
            rssVal.textContent = `${data.process_memory_mb.toFixed(1)} MB`;
            rssVal.style.color = data.process_memory_mb > 500 ? 'var(--accent-amber)' : 'var(--text-primary)';
        }
        if (rssSub) {
            rssSub.textContent = 'Resident physical memory';
        }
    }

    // OS Physical RAM Card
    const osVal = document.getElementById('maintOsMemVal');
    const osSub = document.getElementById('maintOsMemSub');
    if (osVal && data.os_memory) {
        osVal.textContent = `${data.os_memory.used_percent}%`;
        if (osSub) {
            osSub.textContent = `${data.os_memory.available_gb} GB free of ${data.os_memory.total_gb} GB`;
        }
    }

    // In-Memory Caches Card
    const memCachesVal = document.getElementById('maintMemCachesVal');
    const memItemsSub = document.getElementById('maintMemItemsSub');
    if (memCachesVal && data.caches) {
        memCachesVal.textContent = `${data.caches.in_memory_caches_count} Caches`;
        if (memItemsSub) {
            memItemsSub.textContent = `${data.caches.in_memory_items_count} active items`;
        }
    }

    // Persistent Disk Cache Card
    const diskFilesVal = document.getElementById('maintDiskFilesVal');
    const diskSizeSub = document.getElementById('maintDiskSizeSub');
    if (diskFilesVal && data.caches) {
        diskFilesVal.textContent = `${data.caches.disk_files_count} Files`;
        if (diskSizeSub) {
            diskSizeSub.textContent = `${data.caches.disk_size_mb} MB on disk`;
        }
    }

    // Note: static icons in telemetry cards do not need re-rendering on every polling tick
}

async function handle1ClickOptimize() {
    if (isOptimizingMemory) return;
    isOptimizingMemory = true;

    const btn = document.getElementById('btn1ClickOptimizeRam');
    const banner = document.getElementById('maintOptimizeResultBanner');
    const bannerMsg = document.getElementById('maintOptimizeResultMsg');
    const statsPills = document.getElementById('maintOptimizeStatsPills');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="refresh-cw" class="spin-animation" style="width: 16px; height: 16px;"></i> <span>Optimizing Memory...</span>`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons({ root: btn });
        }
    }

    try {
        const res = await fetch('/api/admin/maintenance/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Optimization failed');
        }

        // Show result banner
        if (banner && bannerMsg) {
            banner.style.display = 'block';
            banner.style.background = 'rgba(16, 185, 129, 0.08)';
            banner.style.borderColor = 'rgba(16, 185, 129, 0.25)';
            banner.style.color = '#34d399';
            
            if (data.gunicorn_recycled) {
                bannerMsg.innerHTML = `<i data-lucide="check-circle-2" style="width: 16px; height: 16px; color: #10b981; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>Memory Optimized &amp; Rolling Worker Recycle Initiated!</span>`;
            } else {
                bannerMsg.innerHTML = `<i data-lucide="check-circle-2" style="width: 16px; height: 16px; color: #10b981; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>RAM Optimization completed!</span>`;
            }

            if (statsPills) {
                const reclaimed = data.reclaimed_mb || 0;
                const before = data.before_rss_mb || 0;
                const after = data.after_rss_mb || 0;
                const pruned = (data.pruned_files?.ai || 0) + (data.pruned_files?.news || 0);
                const recycleBadge = data.gunicorn_recycled
                    ? `<span class="badge-pill badge-bullish" style="font-size: 0.72rem;">Rolling Worker Recycle (0s Downtime)</span>`
                    : '';

                statsPills.innerHTML = `
                    <span class="badge-pill badge-bullish" style="font-weight: 700; font-size: 0.72rem;">Heap Trimmed: ${reclaimed} MB</span>
                    <span class="badge-pill badge-neutral" style="font-size: 0.72rem;">Worker: ${before} MB ➔ ${after} MB</span>
                    <span class="badge-pill badge-neutral" style="font-size: 0.72rem;">Pruned: ${pruned} files</span>
                    ${recycleBadge}
                `;
            }

            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: banner });
            }
        }

        // Wait a brief moment to allow rolling reload to start, then refresh telemetry
        setTimeout(async () => {
            await loadMaintenanceStatus(true);
        }, 1200);

    } catch (err) {
        console.error('RAM optimize error:', err);
        if (banner && bannerMsg) {
            banner.style.display = 'block';
            banner.style.background = 'rgba(239, 68, 68, 0.08)';
            banner.style.borderColor = 'rgba(239, 68, 68, 0.25)';
            banner.style.color = '#f87171';
            bannerMsg.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #ef4444; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>Optimization error: ${err.message || 'Unknown error'}</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: banner });
            }
        }
    } finally {
        isOptimizingMemory = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="sparkles" style="width: 16px; height: 16px;"></i> <span>Optimize Memory Now</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: btn });
            }
        }
    }
}

let restartConfirmTimer = null;

async function handleSoftRestart() {
    const btn = document.getElementById('btnSoftRestartServer');
    if (!btn) return;

    if (!btn.classList.contains('confirming-restart')) {
        // Step 1: Prompt inline confirmation directly on the button
        btn.classList.add('confirming-restart');
        btn.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        btn.style.color = '#f87171';
        btn.innerHTML = `<i data-lucide="alert-triangle" style="width: 13px; height: 13px; color: #ef4444;"></i> <span>Click Again to Confirm Restart</span>`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons({ root: btn });
        }

        if (restartConfirmTimer) clearTimeout(restartConfirmTimer);
        restartConfirmTimer = setTimeout(() => {
            btn.classList.remove('confirming-restart');
            btn.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            btn.style.color = 'var(--accent-amber)';
            btn.innerHTML = `<i data-lucide="rotate-cw" style="width: 13px; height: 13px;"></i> <span>Soft Restart Server</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: btn });
            }
        }, 4000);
        return;
    }

    // Step 2: Confirmed! Clear timer and execute restart
    if (restartConfirmTimer) {
        clearTimeout(restartConfirmTimer);
        restartConfirmTimer = null;
    }
    btn.classList.remove('confirming-restart');
    btn.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    btn.style.color = 'var(--accent-amber)';
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="refresh-cw" class="spin-animation" style="width: 13px; height: 13px;"></i> <span>Restarting Server...</span>`;
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons({ root: btn });
    }

    const banner = document.getElementById('maintOptimizeResultBanner');
    const bannerMsg = document.getElementById('maintOptimizeResultMsg');
    const statsPills = document.getElementById('maintOptimizeStatsPills');

    if (banner && bannerMsg) {
        banner.style.display = 'block';
        banner.style.background = 'rgba(59, 130, 246, 0.08)';
        banner.style.borderColor = 'rgba(59, 130, 246, 0.25)';
        banner.style.color = '#60a5fa';
        bannerMsg.innerHTML = `<i data-lucide="refresh-cw" class="spin-animation" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>Server restarting... Reconnecting...</span>`;
        if (statsPills) {
            statsPills.innerHTML = `<span class="badge-pill badge-neutral" id="maintRestartAttemptBadge">Attempt 1/15</span>`;
        }
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons({ root: banner });
        }
    }

    try {
        const res = await fetch('/api/admin/maintenance/restart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        await res.json().catch(() => ({}));

        // Wait 1.0s before first reconnection check
        await new Promise(r => setTimeout(r, 1000));

        let reconnected = false;
        let attempts = 0;
        const maxAttempts = 15;

        while (attempts < maxAttempts) {
            attempts++;
            const attemptBadge = document.getElementById('maintRestartAttemptBadge');
            if (attemptBadge) attemptBadge.textContent = `Attempt ${attempts}/${maxAttempts}`;

            try {
                const checkRes = await fetch('/api/admin/maintenance/status?t=' + Date.now(), {
                    cache: 'no-store'
                });
                if (checkRes.ok) {
                    const newData = await checkRes.json();
                    if (newData && newData.success) {
                        reconnected = true;
                        renderMaintenanceUI(newData);

                        if (banner && bannerMsg) {
                            const isGunicorn = Boolean(newData.environment?.is_gunicorn);
                            const restartTitle = isGunicorn 
                                ? `Server successfully restarted! Fresh worker running (PID: ${newData.environment?.worker_pid || '--'}).`
                                : `Server runtime soft-recycle complete! Uptime reset & heap defragmented.`;

                            banner.style.background = 'rgba(16, 185, 129, 0.08)';
                            banner.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                            banner.style.color = '#34d399';
                            bannerMsg.innerHTML = `<i data-lucide="check-circle-2" style="width: 16px; height: 16px; color: #10b981; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>${restartTitle}</span>`;
                            if (statsPills) {
                                statsPills.innerHTML = `
                                    <span class="badge-pill badge-bullish" style="font-weight: 700; font-size: 0.72rem;">Uptime: ${newData.uptime?.uptime_formatted || '0m 00s'}</span>
                                    <span class="badge-pill badge-neutral" style="font-size: 0.72rem;">RAM: ${newData.process_memory_mb || '--'} MB</span>
                                    <span class="badge-pill badge-neutral" style="font-size: 0.72rem;">${newData.environment?.platform_display || 'Online'}</span>
                                `;
                            }
                            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                                lucide.createIcons({ root: banner });
                            }
                        }
                        break;
                    }
                }
            } catch (e) {
                // Server still restarting, wait and retry
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!reconnected) {
            if (banner && bannerMsg) {
                banner.style.background = 'rgba(245, 158, 11, 0.08)';
                banner.style.borderColor = 'rgba(245, 158, 11, 0.25)';
                banner.style.color = '#fbbf24';
                bannerMsg.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #f59e0b; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>Restart in progress or taking longer than expected. Click 'Refresh' to re-check.</span>`;
                if (typeof lucide !== 'undefined' && lucide.createIcons) {
                    lucide.createIcons({ root: banner });
                }
            }
        }

    } catch (err) {
        console.error('Soft restart error:', err);
        if (banner && bannerMsg) {
            banner.style.background = 'rgba(239, 68, 68, 0.08)';
            banner.style.borderColor = 'rgba(239, 68, 68, 0.25)';
            banner.style.color = '#f87171';
            bannerMsg.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #ef4444; display: inline-block; vertical-align: middle; margin-right: 6px;"></i> <span>Server restart failed: ${err.message || 'Connection error'}</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: banner });
            }
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="rotate-cw" style="width: 13px; height: 13px;"></i> <span>Soft Restart Server</span>`;
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ root: btn });
            }
        }
    }
}

// Global browser window bindings
if (typeof window !== 'undefined') {
    window.switchProfileModalTab = switchProfileModalTab;
    window.loadMaintenanceStatus = loadMaintenanceStatus;
    window.handle1ClickOptimize = handle1ClickOptimize;
    window.handleSoftRestart = handleSoftRestart;
    window.onAIProviderChange = onAIProviderChange;
    window.fetchLiveAIModels = fetchLiveAIModels;
    window.syncAISettingsModalUI = syncAISettingsModalUI;
    window.clearSavedProviderKey = clearSavedProviderKey;
    window.enterDemoMode = enterDemoMode;
    window.exitDemoMode = exitDemoMode;
}