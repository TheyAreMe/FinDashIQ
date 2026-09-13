const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    GBp: 'p',
    CHF: 'Fr.',
    NOK: 'kr',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    SEK: 'kr',
    DKK: 'kr'
};

function getUserBaseCurrency() {
    return (state.user?.baseCurrency || localStorage.getItem('findashiq_base_currency') || 'USD').toUpperCase();
}

function getCurrencySymbol(curr) {
    if (!curr) return '$';
    const c = String(curr).trim();
    return CURRENCY_SYMBOLS[c.toUpperCase()] || CURRENCY_SYMBOLS[c] || c;
}

function convertPrice(amount, fromCurr = 'USD', toCurr = null) {
    if (amount === null || amount === undefined || isNaN(amount)) return null;
    const targetCurr = (toCurr || getUserBaseCurrency()).toUpperCase();
    let sourceCurr = (fromCurr || 'USD').trim();

    let cleanAmount = Number(amount);
    // Handle British pence (GBp)
    if (sourceCurr === 'GBp' || (sourceCurr === 'GBP' && fromCurr === 'GBp')) {
        cleanAmount = cleanAmount / 100.0;
        sourceCurr = 'GBP';
    } else {
        sourceCurr = sourceCurr.toUpperCase();
    }

    if (sourceCurr === targetCurr) {
        return cleanAmount;
    }

    const rates = state.exchangeRates || {};
    const fromRate = rates[sourceCurr] || 1.0;
    const toRate = rates[targetCurr] || 1.0;

    // Convert from source to USD, then from USD to target currency
    const inUSD = cleanAmount / fromRate;
    return inUSD * toRate;
}

function formatPrice(amount, fromCurr = 'USD', toCurr = null, decimals = 2) {
    if (amount === null || amount === undefined || isNaN(amount)) return '--';
    const targetCurr = (toCurr || getUserBaseCurrency()).toUpperCase();
    const converted = convertPrice(amount, fromCurr, targetCurr);
    if (converted === null || isNaN(converted)) return '--';

    const symbol = getCurrencySymbol(targetCurr);
    const formattedNum = Number(converted).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    if (targetCurr === 'NOK' || targetCurr === 'SEK' || targetCurr === 'DKK') {
        return `${formattedNum} ${symbol}`;
    }
    return `${symbol}${formattedNum}`;
}

function formatCompactPrice(amount, fromCurr = 'USD', toCurr = null) {
    if (amount === null || amount === undefined || isNaN(amount) || amount === 0) return 'N/A';
    const targetCurr = (toCurr || getUserBaseCurrency()).toUpperCase();
    const converted = convertPrice(amount, fromCurr, targetCurr);
    if (converted === null || isNaN(converted)) return 'N/A';

    const symbol = getCurrencySymbol(targetCurr);
    const abs = Math.abs(converted);
    let valStr = '';
    if (abs >= 1e12) valStr = (converted / 1e12).toFixed(2) + ' T';
    else if (abs >= 1e9) valStr = (converted / 1e9).toFixed(2) + ' B';
    else if (abs >= 1e6) valStr = (converted / 1e6).toFixed(2) + ' M';
    else if (abs >= 1e3) valStr = (converted / 1e3).toFixed(2) + ' K';
    else valStr = converted.toFixed(2);

    if (targetCurr === 'NOK' || targetCurr === 'SEK' || targetCurr === 'DKK') {
        return `${valStr} ${symbol}`;
    }
    return `${symbol}${valStr}`;
}

function formatPriceOrRange(val, fromCurr = 'USD', toCurr = null) {
    if (val === null || val === undefined) return '--';
    if (typeof val === 'number') {
        return formatPrice(val, fromCurr, toCurr);
    }
    const str = String(val).trim();
    if (!str || str === '--') return '--';

    // Handle ranges like "$128.50 - $130.00" or "$128.50 – $130.00" or "128.50 - 130.00"
    if (str.includes('-') || str.includes('–') || str.includes('—')) {
        const parts = str.split(/[\–\—\-]/).map(p => p.trim());
        if (parts.length === 2) {
            const num1 = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
            const num2 = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
            if (!isNaN(num1) && !isNaN(num2)) {
                return `${formatPrice(num1, fromCurr, toCurr)} – ${formatPrice(num2, fromCurr, toCurr)}`;
            }
        }
    }

    // Handle single price strings like "$125.50"
    const singleNum = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (!isNaN(singleNum) && /[$€£¥kr]/i.test(str)) {
        return formatPrice(singleNum, fromCurr, toCurr);
    }

    return str;
}

async function fetchForexRates() {
    try {
        const res = await fetch('/api/forex/rates');
        const data = await res.json();
        if (data.success && data.rates) {
            state.exchangeRates = { ...state.exchangeRates, ...data.rates };
        }
    } catch (e) {
        console.warn('Could not refresh live forex rates, using fallback matrix:', e);
    }
}

function syncCurrencySelects() {
    const baseCurr = getUserBaseCurrency();
    const headerSel = document.getElementById('headerCurrencySelect');
    const profileSel = document.getElementById('profileSelectCurrency');
    if (headerSel) headerSel.value = baseCurr;
    if (profileSel) profileSel.value = baseCurr;
}

async function handleCurrencyChange(newCurrency) {
    if (!newCurrency) return;
    const cleanCurr = newCurrency.toUpperCase().trim();
    localStorage.setItem('findashiq_base_currency', cleanCurr);

    if (state.user) {
        state.user.baseCurrency = cleanCurr;
        try {
            fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: state.user.displayName,
                    email: state.user.email,
                    riskProfile: state.user.riskProfile,
                    baseCurrency: cleanCurr,
                    theme: state.user.theme,
                    avatar: state.user.avatar
                })
            });
        } catch (e) { }
    }

    syncCurrencySelects();

    // Dynamically recalculate & re-render all open views with new currency
    if (typeof renderActiveStock === 'function') renderActiveStock();
    if (typeof renderWatchlist === 'function') renderWatchlist();
    const scannerSearchInput = document.getElementById('scannerSearchQuery');
    if (typeof handleScannerSearchFilter === 'function' && scannerSearchInput && scannerSearchInput.value.trim()) {
        handleScannerSearchFilter(scannerSearchInput.value);
    } else {
        const scannerOpps = state.scannerResults?.opportunities || (Array.isArray(state.scannerResults) ? state.scannerResults : null);
        if (typeof renderScannerResults === 'function' && scannerOpps) renderScannerResults(scannerOpps);
    }
    if (typeof renderBacktest === 'function') renderBacktest();
    if (typeof renderAlerts === 'function') renderAlerts();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
