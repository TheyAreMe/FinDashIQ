// -------------------------------------------------------------
// ZERO-MAINTENANCE DYNAMIC INTERNATIONALIZATION (i18n) ENGINE
// -------------------------------------------------------------

const I18N_LANGUAGES = [
    { code: 'en', name: 'English (US)', native: 'English', flagCode: 'us', locale: 'en-US' },
    { code: 'de', name: 'Deutsch (DE)', native: 'Deutsch', flagCode: 'de', locale: 'de-DE' },
    { code: 'es', name: 'Español (ES)', native: 'Español', flagCode: 'es', locale: 'es-ES' },
    { code: 'fr', name: 'Français (FR)', native: 'Français', flagCode: 'fr', locale: 'fr-FR' },
    { code: 'it', name: 'Italiano (IT)', native: 'Italiano', flagCode: 'it', locale: 'it-IT' },
    { code: 'pt', name: 'Português (BR)', native: 'Português', flagCode: 'br', locale: 'pt-BR' },
    { code: 'ja', name: '日本語 (JA)', native: '日本語', flagCode: 'jp', locale: 'ja-JP' }
];

const _i18nMemoryBundle = {};
let _isTranslating = false;

function getCurrentLanguage() {
    return (state.language || localStorage.getItem('findashiq_language') || 'en').toLowerCase().trim();
}

function getLanguageInfo(code) {
    const target = (code || getCurrentLanguage()).toLowerCase();
    return I18N_LANGUAGES.find(l => l.code === target) || I18N_LANGUAGES[0];
}

/**
 * Translates a single text string.
 * Checks memory bundle, session cache, or returns original string if target is English.
 */
function t(text, fallback = null) {
    if (!text || typeof text !== 'string') return text;
    const lang = getCurrentLanguage();
    if (lang === 'en') return text;

    const clean = text.trim();
    if (!clean) return text;

    if (_i18nMemoryBundle[lang] && _i18nMemoryBundle[lang][clean]) {
        return _i18nMemoryBundle[lang][clean];
    }
    return fallback !== null ? fallback : text;
}
window.t = t;

/**
 * Initializes i18n bundle on startup or language change.
 */
async function initI18n(targetLang = null) {
    const lang = (targetLang || getCurrentLanguage()).toLowerCase();
    state.language = lang;
    document.documentElement.setAttribute('lang', lang);

    // Sync select dropdown in Profile modal
    syncLanguageSelects();

    if (lang === 'en') {
        restoreOriginalDOM();
        return;
    }

    // Check memory or session cache first
    try {
        const cached = sessionStorage.getItem(`findashiq_i18n_${lang}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object') {
                _i18nMemoryBundle[lang] = { ...(_i18nMemoryBundle[lang] || {}), ...parsed };
            }
        }
    } catch (e) { }

    // Fetch cached server bundle
    try {
        const res = await fetch(`/api/i18n/bundle/${lang}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.translations) {
                _i18nMemoryBundle[lang] = { ...(_i18nMemoryBundle[lang] || {}), ...data.translations };
                try {
                    sessionStorage.setItem(`findashiq_i18n_${lang}`, JSON.stringify(_i18nMemoryBundle[lang]));
                } catch (e) { }
            }
        }
    } catch (e) {
        console.warn('[i18n] Could not fetch server translation bundle:', e);
    }

    // Scan DOM for untranslated strings & translate
    await translatePageDOM(lang);
}
window.initI18n = initI18n;

/**
 * Switch the application language dynamically.
 */
async function handleLanguageChange(newLang) {
    if (!newLang) return;
    const lang = newLang.toLowerCase().trim();
    state.language = lang;
    localStorage.setItem('findashiq_language', lang);

    if (state.user) {
        state.user.language = lang;
    }

    syncLanguageSelects();
    await initI18n(lang);

    // Re-render active dynamic charts / views with localized currency & formatting
    if (typeof renderUserHeader === 'function') renderUserHeader();
    if (typeof renderWatchlist === 'function') renderWatchlist();
    if (typeof renderActiveStock === 'function' && state.stocksData && state.stocksData[state.activeTicker]) {
        renderActiveStock();
    }
    if (typeof renderScannerResults === 'function' && state.scannerResults) {
        renderScannerResults();
    }
    if (typeof renderBacktest === 'function') renderBacktest();
    if (typeof renderAlertsList === 'function') renderAlertsList();
    if (typeof renderPaperTrades === 'function') renderPaperTrades();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.handleLanguageChange = handleLanguageChange;

function syncLanguageSelects() {
    const lang = getCurrentLanguage();
    const info = getLanguageInfo(lang);

    const profileSel = document.getElementById('profileSelectLanguage');
    if (profileSel) profileSel.value = lang;

    const codeBadge = document.getElementById('profileLangCodeBadge');
    if (codeBadge) codeBadge.textContent = info.code.toUpperCase();

    const currentFlag = document.getElementById('profileLangCurrentFlag');
    if (currentFlag) currentFlag.innerHTML = typeof getCountryFlagSvg === 'function' ? getCountryFlagSvg(info.flagCode) : '';

    const currentLabel = document.getElementById('profileLangCurrentLabel');
    if (currentLabel) currentLabel.textContent = info.name;

    // Update active highlight in custom options
    const checks = document.querySelectorAll('.custom-lang-option .lang-opt-check');
    checks.forEach(check => {
        const optLang = check.getAttribute('data-lang');
        const isActive = optLang === lang;
        check.style.display = isActive ? 'inline-block' : 'none';
        const parentBtn = check.closest('.custom-lang-option');
        if (parentBtn) {
            parentBtn.classList.toggle('active', isActive);
        }
    });
}
window.syncLanguageSelects = syncLanguageSelects;

function toggleProfileLangDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('profileLangDropdownMenu');
    if (menu) {
        const isShowing = menu.style.display === 'block';
        menu.style.display = isShowing ? 'none' : 'block';
    }
}
window.toggleProfileLangDropdown = toggleProfileLangDropdown;

function selectProfileLanguage(code) {
    const menu = document.getElementById('profileLangDropdownMenu');
    if (menu) menu.style.display = 'none';
    const profileSel = document.getElementById('profileSelectLanguage');
    if (profileSel) profileSel.value = code;
    handleLanguageChange(code);
}
window.selectProfileLanguage = selectProfileLanguage;

// Close language dropdown on outside click
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.custom-lang-selector-wrapper');
    const menu = document.getElementById('profileLangDropdownMenu');
    if (menu && wrapper && !wrapper.contains(e.target)) {
        menu.style.display = 'none';
    }
});

const _translatedNodes = [];

function shouldSkipElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return true;
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'pre', 'code', 'svg', 'path', 'canvas'].includes(tag)) return true;
    if (el.classList.contains('mono') || el.classList.contains('ticker-tab-symbol') || el.classList.contains('flag-icon-badge') || el.classList.contains('flag-svg')) return true;
    if (el.hasAttribute('data-no-translate')) return true;
    return false;
}

function restoreOriginalDOM() {
    // Restore text nodes
    for (const node of _translatedNodes) {
        if (node && node._origText !== undefined) {
            node.nodeValue = node._origText;
        }
    }
    // Restore placeholders
    document.querySelectorAll('[data-orig-placeholder]').forEach(input => {
        if (input.dataset.origPlaceholder !== undefined) {
            input.placeholder = input.dataset.origPlaceholder;
        }
    });
    // Restore options
    document.querySelectorAll('select option[data-orig-text]').forEach(opt => {
        if (opt.dataset.origText !== undefined) {
            opt.textContent = opt.dataset.origText;
        }
    });
    // Restore titles
    document.querySelectorAll('[data-orig-title]').forEach(el => {
        if (el.dataset.origTitle !== undefined) {
            el.title = el.dataset.origTitle;
        }
    });
}

/**
 * Traverses DOM elements with static text, collects untranslated phrases, and requests batch translation.
 */
async function translatePageDOM(targetLang = null) {
    if (_isTranslating) return;
    const lang = (targetLang || getCurrentLanguage()).toLowerCase();
    if (lang === 'en') {
        restoreOriginalDOM();
        return;
    }

    _isTranslating = true;
    const missing = new Set();
    const bundle = _i18nMemoryBundle[lang] || {};

    function isTranslatableString(str) {
        if (!str || typeof str !== 'string') return false;
        const clean = str.trim();
        if (clean.length < 2) return false;
        // Skip pure numbers, currency symbols, percentages, ISO dates, math expressions
        if (/^[\$€£¥\d\.\,\+\-\%\/\:\s\(\)\#\_\>\<\=\|]+$/.test(clean)) return false;
        // Must contain at least one word character
        if (!/[a-zA-Z\u00C0-\u024F]/.test(clean)) return false;
        // Skip stock ticker symbols (e.g. AAPL, NVDA, TSLA, SPY)
        if (/^[A-Z]{1,5}$/.test(clean)) return false;
        // Skip technical indicators acronyms
        if (['RSI', 'MACD', 'VWAP', 'CMF', 'ATR', 'SMA', 'EMA', 'BB', 'OBV'].includes(clean)) return false;
        return true;
    }

    function walkTextNodes(element) {
        if (shouldSkipElement(element)) return;

        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.nodeValue;
                const trimmed = text.trim();
                if (isTranslatableString(trimmed)) {
                    if (child._origText === undefined) {
                        child._origText = text;
                        child._origTrimmed = trimmed;
                        _translatedNodes.push(child);
                    }
                    const orig = child._origTrimmed;
                    if (bundle[orig]) {
                        child.nodeValue = text.replace(trimmed, bundle[orig]);
                    } else {
                        missing.add(orig);
                    }
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                walkTextNodes(child);
            }
        }
    }

    // 1. Walk text nodes in the DOM
    walkTextNodes(document.body);

    // 2. Translatable Input & Textarea Placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
        if (shouldSkipElement(input)) return;
        if (!input.dataset.origPlaceholder) {
            input.dataset.origPlaceholder = input.placeholder;
        }
        const orig = input.dataset.origPlaceholder.trim();
        if (isTranslatableString(orig)) {
            if (bundle[orig]) {
                input.placeholder = bundle[orig];
            } else {
                missing.add(orig);
            }
        }
    });

    // 3. Translatable Select Options
    document.querySelectorAll('select option').forEach(opt => {
        if (!opt.dataset.origText) {
            opt.dataset.origText = opt.textContent.trim();
        }
        const orig = opt.dataset.origText;
        if (isTranslatableString(orig)) {
            if (bundle[orig]) {
                opt.textContent = bundle[orig];
            } else {
                missing.add(orig);
            }
        }
    });

    // 4. Translatable Tooltips & Titles
    document.querySelectorAll('[title]').forEach(el => {
        if (shouldSkipElement(el)) return;
        if (!el.dataset.origTitle) {
            el.dataset.origTitle = el.title.trim();
        }
        const orig = el.dataset.origTitle;
        if (isTranslatableString(orig)) {
            if (bundle[orig]) {
                el.title = bundle[orig];
            } else {
                missing.add(orig);
            }
        }
    });

    // 5. If new / untranslated strings found, request batch translation from server
    if (missing.size > 0) {
        try {
            const res = await fetch('/api/i18n/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetLang: lang,
                    strings: Array.from(missing)
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.translations) {
                    _i18nMemoryBundle[lang] = { ...(_i18nMemoryBundle[lang] || {}), ...data.translations };
                    
                    try {
                        sessionStorage.setItem(`findashiq_i18n_${lang}`, JSON.stringify(_i18nMemoryBundle[lang]));
                    } catch (e) { }

                    // Apply newly fetched translations to DOM text nodes
                    for (const node of _translatedNodes) {
                        const orig = node._origTrimmed;
                        if (orig && data.translations[orig]) {
                            node.nodeValue = node._origText.replace(orig, data.translations[orig]);
                        }
                    }
                    // Apply to placeholders
                    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
                        const orig = input.dataset.origPlaceholder?.trim();
                        if (orig && data.translations[orig]) {
                            input.placeholder = data.translations[orig];
                        }
                    });
                    // Apply to select options
                    document.querySelectorAll('select option').forEach(opt => {
                        const orig = opt.dataset.origText;
                        if (orig && data.translations[orig]) {
                            opt.textContent = data.translations[orig];
                        }
                    });
                    // Apply to titles
                    document.querySelectorAll('[title]').forEach(el => {
                        const orig = el.dataset.origTitle;
                        if (orig && data.translations[orig]) {
                            el.title = data.translations[orig];
                        }
                    });
                }
            }
        } catch (err) {
            console.warn('[i18n] Error translating missing DOM strings:', err);
        }
    }

    _isTranslating = false;
}
window.translatePageDOM = translatePageDOM;

/**
 * Locale-aware formatters using native browser Intl APIs
 */
function formatLocalizedDate(date, options = {}) {
    if (!date) return '';
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const langInfo = getLanguageInfo();
    return new Intl.DateTimeFormat(langInfo.locale || 'en-US', {
        dateStyle: options.dateStyle || 'medium',
        ...options
    }).format(d);
}
window.formatLocalizedDate = formatLocalizedDate;

function formatLocalizedNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    const langInfo = getLanguageInfo();
    return new Intl.NumberFormat(langInfo.locale || 'en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(Number(num));
}
window.formatLocalizedNumber = formatLocalizedNumber;
