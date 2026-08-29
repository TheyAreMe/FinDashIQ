// Curated global company names map for instantaneous 0ms client-side resolution
const GLOBAL_COMPANY_NAMES = {
    'NVDA': 'NVIDIA Corporation',
    'MSFT': 'Microsoft Corporation',
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla Inc.',
    'IFX.DE': 'Infineon Technologies AG',
    'SAP.DE': 'SAP SE',
    'SU.PA': 'Schneider Electric S.E.',
    'TSM': 'Taiwan Semiconductor Manufacturing',
    'SPCX': 'S&P CapEx Equity ETF',
    'EXXT.DE': 'iShares NASDAQ 100 ETF (DE)',
    'XDWT.DE': 'Xtrackers MSCI World Information Tech ETF',
    'NEL.OL': 'Nel ASA',
    'PLTR': 'Palantir Technologies Inc.',
    'AMZN': 'Amazon.com Inc.',
    'GOOGL': 'Alphabet Inc.',
    'GOOG': 'Alphabet Inc.',
    'META': 'Meta Platforms Inc.',
    'AMD': 'Advanced Micro Devices Inc.',
    'ASML': 'ASML Holding N.V.',
    'COIN': 'Coinbase Global Inc.',
    'SONY': 'Sony Group Corporation',
    'PYPL': 'PayPal Holdings Inc.',
    'INTC': 'Intel Corporation',
    'QCOM': 'Qualcomm Inc.',
    'AVGO': 'Broadcom Inc.',
    'OR.PA': "L'Oréal S.A.",
    'AIR.PA': 'Airbus SE',
    'MC.PA': 'LVMH Moët Hennessy Louis Vuitton',
    'SIE.DE': 'Siemens AG',
    'ALV.DE': 'Allianz SE',
    'BMW.DE': 'Bayerische Motoren Werke AG',
    'MBG.DE': 'Mercedes-Benz Group AG',
    'VOW3.DE': 'Volkswagen AG',
    'ENPH': 'Enphase Energy Inc.',
    'FSLR': 'First Solar Inc.',
    'SEDG': 'SolarEdge Technologies Inc.',
    'BEPC': 'Brookfield Renewable Corp',
    'RUN': 'Sunrun Inc.',
    'SNOW': 'Snowflake Inc.',
    'CRWD': 'CrowdStrike Holdings Inc.',
    'PANW': 'Palo Alto Networks Inc.',
    'DDOG': 'Datadog Inc.',
    'NET': 'Cloudflare Inc.',
    'ZS': 'Zscaler Inc.',
    'ARM': 'Arm Holdings plc',
    'SMCI': 'Super Micro Computer Inc.',
    'MRVL': 'Marvell Technology Inc.',
    'MU': 'Micron Technology Inc.',
    'PATH': 'UiPath Inc.',
    'C3AI': 'C3.ai Inc.',
    'ISRG': 'Intuitive Surgical Inc.',
    'VRTX': 'Vertex Pharmaceuticals Inc.',
    'CRSP': 'CRISPR Therapeutics AG',
    'ILMN': 'Illumina Inc.',
    'SQ': 'Block Inc.',
    'SHOP': 'Shopify Inc.',
    'MELI': 'MercadoLibre Inc.',
    'SE': 'Sea Limited',
    'ABNB': 'Airbnb Inc.',
    'UBER': 'Uber Technologies Inc.',
    'DASH': 'DoorDash Inc.',
    'BKNG': 'Booking Holdings Inc.',
    'SPOT': 'Spotify Technology S.A.',
    'ABB': 'ABB Ltd',
    'ROK': 'Rockwell Automation Inc.',
    'EMR': 'Emerson Electric Co.'
};

function getAssetCompanyName(ticker, stockOrProfile) {
    if (!ticker) return '';
    const cleanT = String(ticker).trim().toUpperCase();
    const profile = stockOrProfile?.profile || stockOrProfile || {};
    const name = profile.name || profile.shortName || profile.longName;
    
    if (name && typeof name === 'string' && name.trim().length > 0 && name.trim().toUpperCase() !== cleanT) {
        return name.trim();
    }
    
    if (GLOBAL_COMPANY_NAMES[cleanT]) {
        return GLOBAL_COMPANY_NAMES[cleanT];
    }
    
    // Check known state watchlist or stocks data
    if (state?.stocksData?.[cleanT]?.profile?.name && state.stocksData[cleanT].profile.name.toUpperCase() !== cleanT) {
        return state.stocksData[cleanT].profile.name;
    }
    if (state?.watchlistData?.[cleanT]?.profile?.name && state.watchlistData[cleanT].profile.name.toUpperCase() !== cleanT) {
        return state.watchlistData[cleanT].profile.name;
    }

    return cleanT;
}

// Pure Vector SVG Flags Dictionary (100% self-contained, 0ms network latency, cross-platform PC/Mac/Mobile)
const SVG_COUNTRY_FLAGS = {
    'us': `<svg class="flag-svg" viewBox="0 0 741 390" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="741" height="390" fill="#b22234"/><path d="M0,30H741M0,90H741M0,150H741M0,210H741M0,270H741M0,330H741" stroke="#fff" stroke-width="30"/><rect width="296" height="210" fill="#3c3b6e"/><g fill="#fff"><circle cx="40" cy="35" r="8"/><circle cx="100" cy="35" r="8"/><circle cx="160" cy="35" r="8"/><circle cx="220" cy="35" r="8"/><circle cx="70" cy="70" r="8"/><circle cx="130" cy="70" r="8"/><circle cx="190" cy="70" r="8"/><circle cx="250" cy="70" r="8"/><circle cx="40" cy="105" r="8"/><circle cx="100" cy="105" r="8"/><circle cx="160" cy="105" r="8"/><circle cx="220" cy="105" r="8"/><circle cx="70" cy="140" r="8"/><circle cx="130" cy="140" r="8"/><circle cx="190" cy="140" r="8"/><circle cx="250" cy="140" r="8"/><circle cx="40" cy="175" r="8"/><circle cx="100" cy="175" r="8"/><circle cx="160" cy="175" r="8"/><circle cx="220" cy="175" r="8"/></g></svg>`,
    'de': `<svg class="flag-svg" viewBox="0 0 5 3" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="1" y="0" fill="#111"/><rect width="5" height="1" y="1" fill="#DD0000"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>`,
    'fr': `<svg class="flag-svg" viewBox="0 0 3 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="2" x="0" fill="#0055A4"/><rect width="1" height="2" x="1" fill="#FFFFFF"/><rect width="1" height="2" x="2" fill="#EF4135"/></svg>`,
    'jp': `<svg class="flag-svg" viewBox="0 0 3 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="2" fill="#FFFFFF"/><circle cx="1.5" cy="1" r="0.6" fill="#BC002D"/></svg>`,
    'tw': `<svg class="flag-svg" viewBox="0 0 3 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="2" fill="#FE0000"/><rect width="1.5" height="1" fill="#000095"/><circle cx="0.75" cy="0.5" r="0.3" fill="#FFFFFF"/><circle cx="0.75" cy="0.5" r="0.22" fill="#000095"/><circle cx="0.75" cy="0.5" r="0.17" fill="#FFFFFF"/></svg>`,
    'gb': `<svg class="flag-svg" viewBox="0 0 60 30" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><clipPath id="gb-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="gb-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#gb-s)"><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#gb-t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>`,
    'no': `<svg class="flag-svg" viewBox="0 0 22 16" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="22" height="16" fill="#BA0C2F"/><path d="M0,8h22M8,0v16" stroke="#fff" stroke-width="4"/><path d="M0,8h22M8,0v16" stroke="#00205B" stroke-width="2"/></svg>`,
    'ch': `<svg class="flag-svg" viewBox="0 0 32 32" width="14" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#D52B1E"/><path d="M13 6h6v20h-6zM6 13h20v6H6z" fill="#fff"/></svg>`,
    'nl': `<svg class="flag-svg" viewBox="0 0 9 6" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" y="0" fill="#AE1C28"/><rect width="9" height="2" y="2" fill="#FFF"/><rect width="9" height="2" y="4" fill="#21468B"/></svg>`,
    'cn': `<svg class="flag-svg" viewBox="0 0 30 20" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#DE2910"/><circle cx="5" cy="5" r="3" fill="#FFDE00"/><circle cx="10" cy="2" r="1" fill="#FFDE00"/><circle cx="12" cy="4" r="1" fill="#FFDE00"/><circle cx="12" cy="7" r="1" fill="#FFDE00"/><circle cx="10" cy="9" r="1" fill="#FFDE00"/></svg>`,
    'ca': `<svg class="flag-svg" viewBox="0 0 4 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="2" fill="#FF0000"/><rect width="2" height="2" x="1" fill="#FFFFFF"/><rect width="1" height="2" x="3" fill="#FF0000"/><path d="M2,0.4 L2.2,0.9 L2.7,0.7 L2.5,1.1 L2.9,1.3 L2.3,1.5 L2.1,1.8 L2,1.6 L1.9,1.8 L1.7,1.5 L1.1,1.3 L1.5,1.1 L1.3,0.7 L1.8,0.9 Z" fill="#FF0000"/></svg>`,
    'br': `<svg class="flag-svg" viewBox="0 0 20 14" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#009C3B"/><polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#FFDF00"/><circle cx="10" cy="7" r="3.5" fill="#002776"/><path d="M6.8,8 a3.5,3.5 0 0,1 6.4,-2" stroke="#fff" stroke-width="0.7" fill="none"/></svg>`,
    'se': `<svg class="flag-svg" viewBox="0 0 16 10" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="10" fill="#006AA7"/><path d="M5,0v10M0,5h16" stroke="#FECC00" stroke-width="2"/></svg>`,
    'eu': `<svg class="flag-svg" viewBox="0 0 3 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="2" fill="#003399"/><circle cx="1.5" cy="0.4" r="0.08" fill="#FFCC00"/><circle cx="1.5" cy="1.6" r="0.08" fill="#FFCC00"/><circle cx="0.9" cy="1" r="0.08" fill="#FFCC00"/><circle cx="2.1" cy="1" r="0.08" fill="#FFCC00"/><circle cx="1.1" cy="0.6" r="0.08" fill="#FFCC00"/><circle cx="1.9" cy="0.6" r="0.08" fill="#FFCC00"/><circle cx="1.1" cy="1.4" r="0.08" fill="#FFCC00"/><circle cx="1.9" cy="1.4" r="0.08" fill="#FFCC00"/></svg>`
};

function getCountryFlagHtml(countryOrEmoji, codeHint = '') {
    const raw = String(countryOrEmoji || codeHint || '').trim().toLowerCase();
    
    // Exact emoji match
    const EMOJI_MAP = {
        '🇺🇸': 'us', '🇩🇪': 'de', '🇫🇷': 'fr', '🇯🇵': 'jp', '🇹🇼': 'tw',
        '🇬🇧': 'gb', '🇳🇴': 'no', '🇨🇭': 'ch', '🇨🇳': 'cn', '🇨🇦': 'ca',
        '🇦🇺': 'au', '🇳🇱': 'nl', '🇧🇷': 'br', '🇸🇪': 'se', '🇩🇰': 'no',
        '🇪🇺': 'eu', '🇮🇳': 'gb', '🇰🇷': 'jp', '🇸🇬': 'gb', '🇭🇰': 'cn'
    };

    let code = EMOJI_MAP[countryOrEmoji] || EMOJI_MAP[codeHint];

    if (!code) {
        if (raw.includes('united states') || raw.includes('usa') || raw.includes('us') || raw.includes('marketwatch') || raw.includes('cnbc') || raw.includes('finviz') || raw.includes('bloomberg') || raw.includes('dow jones') || raw.includes('wall street')) code = 'us';
        else if (raw.includes('germany') || raw.includes('deutschland') || raw.includes('de') || raw.includes('handelsblatt') || raw.includes('tagesschau') || raw.includes('finanzen')) code = 'de';
        else if (raw.includes('france') || raw.includes('fr') || raw.includes('boursorama') || raw.includes('les echos') || raw.includes('le figaro')) code = 'fr';
        else if (raw.includes('japan') || raw.includes('jp') || raw.includes('nikkei') || raw.includes('tokyo') || raw.includes('minkabu')) code = 'jp';
        else if (raw.includes('taiwan') || raw.includes('tw') || raw.includes('tsmc') || raw.includes('taipei')) code = 'tw';
        else if (raw.includes('united kingdom') || raw.includes('uk') || raw.includes('gb') || raw.includes('reuters') || raw.includes('financial times') || raw.includes('ft.com') || raw.includes('london')) code = 'gb';
        else if (raw.includes('norway') || raw.includes('no') || raw.includes('oslo') || raw.includes('e24') || raw.includes('dagens')) code = 'no';
        else if (raw.includes('switzerland') || raw.includes('ch') || raw.includes('swiss') || raw.includes('zürich') || raw.includes('nzz')) code = 'ch';
        else if (raw.includes('china') || raw.includes('cn') || raw.includes('shanghai') || raw.includes('xinhua') || raw.includes('caixin')) code = 'cn';
        else if (raw.includes('canada') || raw.includes('ca') || raw.includes('toronto') || raw.includes('globe and mail')) code = 'ca';
        else if (raw.includes('australia') || raw.includes('au') || raw.includes('sydney') || raw.includes('afr')) code = 'gb';
        else if (raw.includes('netherlands') || raw.includes('nl') || raw.includes('amsterdam') || raw.includes('fd.nl')) code = 'nl';
        else if (raw.includes('brazil') || raw.includes('br') || raw.includes('sao paulo') || raw.includes('valor')) code = 'br';
        else if (raw.includes('sweden') || raw.includes('se') || raw.includes('stockholm') || raw.includes('di.se')) code = 'se';
    }

    if (code && SVG_COUNTRY_FLAGS[code]) {
        return `<span class="flag-icon-badge" title="${escapeHtml(countryOrEmoji || code.toUpperCase())}">${SVG_COUNTRY_FLAGS[code]}</span>`;
    }

    return `<span class="flag-icon-badge" title="Global Wire"><i data-lucide="globe" style="width: 13px; height: 13px; color: var(--accent-cyan); vertical-align: middle;"></i></span>`;
}

// State Management
const state = {
    currentPeriod: '6mo',
    chartType: 'candlestick',
    activeTicker: 'AAPL',
    activeMainTab: 'ai',
    activeTopTab: 'watchlist',
    backtestStrategy: 'quant',
    theme: (function () {
        try {
            return localStorage.getItem('findashiq_theme') || localStorage.getItem('synthequant_theme') || 'dark';
        } catch (e) {
            return 'dark';
        }
    })(),
    user: null, // { username, role, displayName, email, avatar, riskProfile, theme, baseCurrency, ... }
    aiStatus: 'none', // 'active' | 'quota_exceeded' | 'none'
    aiSettings: {
        apiKey: '',
        model: 'gemini-3.7-flash'
    },
    exchangeRates: {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        CHF: 0.88,
        NOK: 10.65,
        JPY: 154.50,
        CAD: 1.36,
        AUD: 1.52,
        SEK: 10.45,
        DKK: 6.87
    },
    watchlistTickers: (function () {
        try {
            const raw = localStorage.getItem('findashiq_watchlist_tickers');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { }
        return ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
    })(),
    watchlistViewMode: (function () {
        try {
            return localStorage.getItem('findashiq_watchlist_view') || 'cards';
        } catch (e) {
            return 'cards';
        }
    })(),
    watchlistData: {},
    alerts: [],
    stocksData: {},
    overlays: {
        superTrend: true,
        sma20: true,
        sma50: true,
        vwap: true,
        bb: true,
        kc: false
    },
    charts: {
        primary: null,
        stoch: null,
        rsi: null,
        macd: null,
        cmf: null,
        equity: null
    }
};

// -------------------------------------------------------------
// CURRENCY & FOREX CONVERSION ENGINE
// -------------------------------------------------------------

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
    const scannerOpps = state.scannerResults?.opportunities || (Array.isArray(state.scannerResults) ? state.scannerResults : null);
    if (typeof renderScannerResults === 'function' && scannerOpps) renderScannerResults(scannerOpps);
    if (typeof renderBacktest === 'function') renderBacktest();
    if (typeof renderAlerts === 'function') renderAlerts();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

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
    } catch (e) {}

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
        } catch (e) {}
    } catch (e) {
        console.warn('Initial AI status check error:', e);
    }
}

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

    // 1. Initialize Top Tab (Default: Watchlist)
    switchTopTab('watchlist');

    // 2. Preset Terminal default input
    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput && !tickerInput.value.trim()) {
        tickerInput.value = 'AAPL';
    }

    // 3. If not already authenticated via SSR, verify session
    if (!isAuthenticated) {
        isAuthenticated = await checkSessionUser();
        setAppAuthState(isAuthenticated);
    }

    // 4. Instant parallel background startup hydration
    const runBackgroundInit = () => {
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

// =============================================================
// AUTHENTICATION & USER PROFILE ENGINE
// =============================================================

function clearUserSessionDOM() {
    // 1. Reset Watchlist Recommendation Hub DOM immediately
    const watchlistGrid = document.getElementById('watchlistCardsGrid');
    if (watchlistGrid) {
        watchlistGrid.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
                <div class="spinner" style="margin: 0 auto 16px auto;"></div>
                <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Loading User Watchlist Recommendations...</div>
                <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">Initializing multi-factor technical indicators, real-time news catalysts, and AI conviction scores...</div>
            </div>
        `;
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
    const chatContainer = document.getElementById('copilotChatMessages');
    if (chatContainer) {
        chatContainer.innerHTML = `
            <div class="chat-bubble-ai">
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

    // 5. Reset In-Memory State
    state.watchlistTickers = [];
    state.watchlistData = {};
    state.alerts = [];
    state.copilotHistory = [];
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
    lucide.createIcons();
}

async function checkSessionUser() {
    try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        if (data.authenticated && data.user) {
            state.user = data.user;
            if (data.user.theme) {
                applyAppTheme(data.user.theme, false);
            }
            if (data.user.aiSettings) {
                state.aiSettings = {
                    apiKey: data.user.aiSettings.apiKey || '',
                    model: data.user.aiSettings.model || 'gemini-3.7-flash'
                };
            }
            const apiKeyEl = document.getElementById('aiApiKeyInput');
            const modelEl = document.getElementById('aiModelSelect');
            if (apiKeyEl) apiKeyEl.value = state.aiSettings.apiKey;
            if (modelEl) modelEl.value = state.aiSettings.model;
            syncCurrencySelects();
            return true;
        } else {
            state.user = null;
            state.aiSettings = { apiKey: '', model: 'gemini-3.7-flash' };
            clearUserSessionDOM();
            return false;
        }
    } catch (e) {
        state.user = null;
        state.aiSettings = { apiKey: '', model: 'gemini-3.7-flash' };
        clearUserSessionDOM();
        return false;
    }
}

function renderUserHeader() {
    const container = document.getElementById('headerUserContainer');
    if (!container) return;

    if (state.user) {
        const avatarIcon = state.user.avatar || 'user';
        const roleLabel = (state.user.role || 'user').toUpperCase();
        const roleClass = state.user.role === 'admin' ? 'admin' : 'user';

        container.innerHTML = `
            <div class="user-pill-btn" onclick="toggleUserDropdown(event)" title="Signed in as ${state.user.displayName}">
                <div class="user-avatar-badge">
                    <i data-lucide="${avatarIcon}" style="width: 14px; height: 14px;"></i>
                </div>
                <span class="user-pill-name">${state.user.displayName || state.user.username}</span>
                <span class="user-role-badge ${roleClass}">${roleLabel}</span>
                <i data-lucide="chevron-down" style="width: 12px; color: var(--text-muted);"></i>
            </div>

            <div id="headerUserDropdownMenu" class="user-dropdown-menu">
                <div class="user-dropdown-header">
                    <div class="user-dropdown-header-name">${state.user.displayName || state.user.username}</div>
                    <div class="user-dropdown-header-role">@${state.user.username} • ${roleLabel}</div>
                </div>

                <button type="button" class="user-dropdown-item" onclick="openProfileModal('details')">
                    <i data-lucide="user-check" style="width: 14px; color: var(--accent-blue);"></i> My Profile &amp; Preferences
                </button>

                <button type="button" class="user-dropdown-item theme-toggle-btn" onclick="toggleAppTheme()" title="Switch between Dark and Bright themes">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="${state.theme === 'bright' ? 'sun' : 'moon'}" style="width: 14px; color: ${state.theme === 'bright' ? 'var(--accent-orange)' : 'var(--accent-blue)'};"></i>
                        <span>Theme Mode</span>
                    </div>
                    <span class="theme-pill-badge">${state.theme === 'bright' ? '☀️ Bright' : '🌙 Dark'}</span>
                </button>

                <button type="button" class="user-dropdown-item" onclick="openAISettings()">
                    <i data-lucide="settings" style="width: 14px; color: var(--accent-amber);"></i> AI Settings
                </button>

                <button type="button" class="user-dropdown-item" onclick="openProfileModal('security')">
                    <i data-lucide="key" style="width: 14px; color: var(--accent-purple);"></i> Change Password
                </button>

                ${state.user.role === 'admin' ? `
                    <button type="button" class="user-dropdown-item" onclick="openProfileModal('users')">
                        <i data-lucide="users" style="width: 14px; color: var(--accent-green);"></i> Manage Users &amp; Roles
                    </button>
                ` : ''}

                <button type="button" class="user-dropdown-item" onclick="openHelpModal('overview')">
                    <i data-lucide="book-open" style="width: 14px; color: var(--accent-cyan);"></i> Help &amp; Documentation (Wiki)
                </button>

                <button type="button" class="user-dropdown-item" onclick="openImpressumModal('impressum')">
                    <i data-lucide="scale" style="width: 14px; color: var(--accent-orange);"></i> Impressum &amp; Legal
                </button>

                <div class="user-dropdown-divider"></div>

                <button type="button" class="user-dropdown-item danger" onclick="handleLogout()">
                    <i data-lucide="log-out" style="width: 14px;"></i> Sign Out
                </button>
            </div>
        `;
    } else {
        container.innerHTML = ``;
    }
    lucide.createIcons();
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('headerUserDropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
        lucide.createIcons();
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

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            // Immediately wipe any previous user session DOM & state before revealing UI
            clearUserSessionDOM();

            state.user = data.user;
            if (data.user.theme) {
                applyAppTheme(data.user.theme, false);
            }
            if (data.user.aiSettings) {
                state.aiSettings = {
                    apiKey: data.user.aiSettings.apiKey || '',
                    model: data.user.aiSettings.model || 'gemini-3.7-flash'
                };
            } else {
                state.aiSettings = { apiKey: '', model: 'gemini-3.7-flash' };
            }
            const apiKeyEl = document.getElementById('aiApiKeyInput');
            const modelEl = document.getElementById('aiModelSelect');
            if (apiKeyEl) apiKeyEl.value = state.aiSettings.apiKey;
            if (modelEl) modelEl.value = state.aiSettings.model;
            updateAIBadges();
            syncCurrencySelects();

            setAppAuthState(true);

            // Clear login inputs
            if (passwordInput) passwordInput.value = '';

            // Refresh user-specific watchlist, alerts, and scanner
            await Promise.all([
                fetchForexRates(),
                checkInitialAIStatus(),
                initWatchlist(),
                initAlerts()
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
            msg.textContent = `Network error: ${err.message}`;
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
    state.aiSettings = { apiKey: '', model: 'gemini-3.7-flash' };

    // Completely wipe all user-specific DOM & data immediately
    clearUserSessionDOM();

    const apiKeyEl = document.getElementById('aiApiKeyInput');
    if (apiKeyEl) apiKeyEl.value = '';
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
    const selectTheme = document.getElementById('profileSelectTheme');

    if (inputName) inputName.value = state.user.displayName || '';
    if (inputEmail) inputEmail.value = state.user.email || '';
    if (selectRisk && state.user.riskProfile) selectRisk.value = state.user.riskProfile;
    if (selectCurrency && state.user.baseCurrency) selectCurrency.value = state.user.baseCurrency;
    if (selectTheme) selectTheme.value = state.user.theme || state.theme || 'dark';

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

    // Reset status message
    const msg = document.getElementById('profileStatusMessage');
    if (msg) msg.style.display = 'none';

    switchProfileModalTab(tabKey);
    modal.style.display = 'flex';
    lucide.createIcons();
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function switchProfileModalTab(tabKey) {
    const btnDetails = document.getElementById('tabBtnProfileDetails');
    const btnSecurity = document.getElementById('tabBtnProfileSecurity');
    const btnUsers = document.getElementById('tabBtnProfileUsers');

    const paneDetails = document.getElementById('profileTabPaneDetails');
    const paneSecurity = document.getElementById('profileTabPaneSecurity');
    const paneUsers = document.getElementById('profileTabPaneUsers');

    if (btnDetails) btnDetails.classList.toggle('active', tabKey === 'details');
    if (btnSecurity) btnSecurity.classList.toggle('active', tabKey === 'security');
    if (btnUsers) btnUsers.classList.toggle('active', tabKey === 'users');

    if (paneDetails) paneDetails.classList.toggle('active', tabKey === 'details');
    if (paneSecurity) paneSecurity.classList.toggle('active', tabKey === 'security');
    if (paneUsers) paneUsers.classList.toggle('active', tabKey === 'users');

    if (tabKey === 'users' && state.user && state.user.role === 'admin') {
        loadAdminUsersList();
    }
    lucide.createIcons();
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
        'webhooks': 'helpTabWebhooks',
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

async function handleUpdateProfile() {
    const displayName = document.getElementById('profileInputDisplayName')?.value.trim() || '';
    const email = document.getElementById('profileInputEmail')?.value.trim() || '';
    const riskProfile = document.getElementById('profileSelectRisk')?.value || 'Balanced';
    const baseCurrency = document.getElementById('profileSelectCurrency')?.value || 'USD';
    const theme = document.getElementById('profileSelectTheme')?.value || state.theme || 'dark';
    const avatar = document.querySelector('input[name="avatarIcon"]:checked')?.value || 'user';

    const msg = document.getElementById('profileStatusMessage');

    try {
        const res = await fetch('/api/auth/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, email, riskProfile, baseCurrency, theme, avatar })
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
            renderUserHeader();
            syncCurrencySelects();

            // Live recalculate open views
            if (typeof renderActiveStock === 'function') renderActiveStock();
            if (typeof renderWatchlist === 'function') renderWatchlist();
            if (typeof renderScannerResults === 'function' && state.scannerResults) {
                renderScannerResults(state.scannerResults.opportunities || []);
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
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 16px;">${data.error || 'Failed to load user directory.'}</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        data.users.forEach(u => {
            const tr = document.createElement('tr');
            const isSelf = state.user && state.user.username === u.username;
            const roleBadgeClass = u.role === 'admin' ? 'user-role-badge admin' : 'user-role-badge user';
            const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';

            tr.innerHTML = `
                <td style="font-weight: 700; color: #fff;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="${u.avatar || 'user'}" style="width: 14px; color: ${u.role === 'admin' ? '#c084fc' : '#60a5fa'};"></i>
                        @${u.username}
                        ${isSelf ? '<span style="font-size: 0.65rem; color: var(--accent-cyan);">(You)</span>' : ''}
                    </div>
                </td>
                <td>${u.displayName || '-'}</td>
                <td><span class="${roleBadgeClass}">${(u.role || 'user').toUpperCase()}</span></td>
                <td style="color: var(--text-muted); font-size: 0.72rem;">${createdDate}</td>
                <td style="text-align: right;">
                    <button type="button" class="btn-table-delete" onclick="handleAdminDeleteUser('${u.username}')" ${isSelf ? 'disabled title="Cannot delete own active account"' : ''}>
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
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
    if (!confirm(`Are you sure you want to permanently delete the account @${targetUsername}?`)) {
        return;
    }

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

function openAISettings() {
    const modal = document.getElementById('aiSettingsModal');
    const apiKeyEl = document.getElementById('aiApiKeyInput');
    const modelEl = document.getElementById('aiModelSelect');
    const statusEl = document.getElementById('aiTestStatus');

    // Close user dropdown if open
    document.getElementById('headerUserDropdownMenu')?.classList.remove('show');

    if (apiKeyEl) apiKeyEl.value = state.aiSettings.apiKey;
    if (modelEl) modelEl.value = state.aiSettings.model || 'gemini-3.7-flash';
    if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
    }
    if (modal) modal.style.display = 'flex';
}

function closeAISettings() {
    const modal = document.getElementById('aiSettingsModal');
    if (modal) modal.style.display = 'none';
}

async function testAIConnection() {
    const apiKey = document.getElementById('aiApiKeyInput')?.value.trim();
    const model = document.getElementById('aiModelSelect')?.value || 'gemini-3.7-flash';
    const statusEl = document.getElementById('aiTestStatus');
    const btn = document.getElementById('btnTestAI');

    if (!statusEl) return;

    if (!apiKey) {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = '#ef4444';
        statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusEl.innerHTML = '⚠️ Please paste a Google Gemini API Key first.';
        return;
    }

    if (btn) btn.disabled = true;
    statusEl.style.display = 'block';
    statusEl.style.background = 'rgba(59, 130, 246, 0.15)';
    statusEl.style.color = '#60a5fa';
    statusEl.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    statusEl.innerHTML = `<em>Testing connection to Google ${model}...</em>`;

    try {
        const res = await fetch('/api/test-gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, model })
        });

        let data;
        const rawText = await res.text();
        try {
            data = JSON.parse(rawText);
        } catch (jsonErr) {
            data = { success: false, error: `Server error (${res.status}): ${rawText.substring(0, 120)}` };
        }

        if (data.models && data.models.length > 0) {
            let html = `<div style="font-weight: 700; margin-bottom: 6px; color: #fff;">Diagnostic Results per Model:</div>`;
            data.models.forEach(m => {
                let row = '';
                if (m.status === 'online') {
                    row = `<span style="color: #10b981;">✅ <strong>${m.model}</strong>: Active &amp; Responding</span>`;
                } else if (m.status === 'rate_limited') {
                    row = `<span style="color: #f59e0b;">⏳ <strong>${m.model}</strong>: Rate Limited / Free Tier Quota Exceeded</span>`;
                } else {
                    row = `<span style="color: #ef4444;">❌ <strong>${m.model}</strong>: ${m.message}</span>`;
                }
                html += `<div style="padding: 3px 0; font-size: 0.78rem;">${row}</div>`;
            });

            if (data.models && data.models.length > 0) {
                const currentTested = data.models.find(m => m.model === model) || data.models[0];
                if (currentTested && currentTested.status === 'rate_limited') {
                    updateAIBadges('quota_exceeded');
                } else if (currentTested && currentTested.status === 'online') {
                    updateAIBadges('active');
                }
            } else if (res.ok && data.success) {
                updateAIBadges('active');
            }

            if (data.success) {
                statusEl.style.background = 'rgba(16, 185, 129, 0.12)';
                statusEl.style.color = '#e2e8f0';
                statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                html += `<div style="margin-top: 8px; font-size: 0.76rem; color: #10b981; border-top: 1px solid rgba(16,185,129,0.2); padding-top: 6px;"><strong>✨ Auto-Fallback Active:</strong> If your selected model is rate-limited, queries will seamlessly route to an active fallback model.</div>`;
            } else {
                statusEl.style.background = 'rgba(239, 68, 68, 0.12)';
                statusEl.style.color = '#e2e8f0';
                statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            }
            statusEl.innerHTML = html;
        } else if (res.ok && data.success) {
            updateAIBadges('active');
            statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
            statusEl.style.color = '#10b981';
            statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            statusEl.innerHTML = `✅ <strong>Connected!</strong> Google Gemini API verified with ${model}.`;
        } else {
            statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
            statusEl.style.color = '#ef4444';
            statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            statusEl.innerHTML = `❌ <strong>Error:</strong> ${data.error || 'Connection failed.'}`;
        }
    } catch (err) {
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = '#ef4444';
        statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusEl.innerHTML = `❌ <strong>Network Error:</strong> ${err.message}`;
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function saveAISettings() {
    const key = document.getElementById('aiApiKeyInput')?.value.trim() || '';
    const model = document.getElementById('aiModelSelect')?.value || 'gemini-3.7-flash';
    state.aiSettings.apiKey = key;
    state.aiSettings.model = model;

    if (state.user) {
        state.user.aiSettings = { apiKey: key, model: model };
        try {
            await fetch('/api/auth/update-ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key, model: model })
            });
        } catch (e) {
            console.error('Error saving AI settings to user account:', e);
        }
    }

    closeAISettings();
    await checkInitialAIStatus();
    handleAnalyze();
}

function setPreset(tickerString) {
    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput) tickerInput.value = tickerString;
    handleAnalyze();
}

function showChartLoading(period) {
    const overlay = document.getElementById('chartLoadingOverlay');
    const titleEl = document.getElementById('chartLoadingTimeframe');
    if (overlay) {
        overlay.style.display = 'flex';
        if (titleEl) {
            const periodLabels = {
                '1mo': '1-Month (1M)',
                '3mo': '3-Month (3M)',
                '6mo': '6-Month (6M)',
                '1y': '1-Year (1Y)',
                '2y': '2-Year (2Y)',
                '5y': '5-Year (5Y)',
                'max': 'All-Time History (MAX)'
            };
            titleEl.textContent = `Loading ${periodLabels[period] || (period ? period.toUpperCase() : 'Chart')} Data...`;
        }
    }
}

function hideChartLoading() {
    const overlay = document.getElementById('chartLoadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function setTimeframe(period) {
    state.currentPeriod = period;
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });

    showChartLoading(period);

    // Instant client-side slice & render if full timeseries is already in state
    const activeStock = state.stocksData[state.activeTicker];
    if (activeStock) {
        const fullTs = activeStock.fullTimeseries || activeStock.timeseries || [];
        if (fullTs.length > 0) {
            const PERIOD_SLICE_BARS = {
                '1mo': 22,
                '3mo': 65,
                '6mo': 130,
                '1y': 252,
                '2y': 504,
                '5y': 1260,
                'max': fullTs.length
            };
            const sliceLimit = PERIOD_SLICE_BARS[period] || fullTs.length;
            activeStock.timeseries = fullTs.slice(-sliceLimit);
            renderActiveStock();
        }
    }

    handleAnalyze(true);
}

function setChartType(type) {
    state.chartType = type;
    document.getElementById('typeCandleBtn')?.classList.toggle('active', type === 'candlestick');
    document.getElementById('typeLineBtn')?.classList.toggle('active', type === 'area');
    renderActiveStock();
}

function toggleOverlay(indicatorKey) {
    state.overlays[indicatorKey] = !state.overlays[indicatorKey];

    const btnMap = {
        superTrend: 'toggleSuperTrend',
        sma20: 'toggleSMA20',
        sma50: 'toggleSMA50',
        vwap: 'toggleVWAP',
        bb: 'toggleBB',
        kc: 'toggleKC'
    };

    const btn = document.getElementById(btnMap[indicatorKey]);
    if (btn) {
        btn.classList.toggle('active', state.overlays[indicatorKey]);
    }

    renderActiveStock();
}

function setBacktestStrategy(strategyKey) {
    state.backtestStrategy = strategyKey;
    document.getElementById('stratQuantBtn')?.classList.toggle('active', strategyKey === 'quant');
    document.getElementById('stratSuperBtn')?.classList.toggle('active', strategyKey === 'supertrend');
    document.getElementById('stratMomBtn')?.classList.toggle('active', strategyKey === 'momentum');

    renderBacktest();
}

function switchActiveStock(ticker) {
    if (!ticker || !state.stocksData[ticker]) return;
    state.activeTicker = ticker;

    document.querySelectorAll('.ticker-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.ticker === ticker);
    });

    renderActiveStock();
}

function switchMainTab(tabKey) {
    state.activeMainTab = tabKey;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    updateMobileTabState(tabKey);

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `tabPane-${tabKey}`);
    });

    // Re-render or redraw charts when their tab becomes visible
    if (tabKey === 'charts') {
        const stock = state.stocksData[state.activeTicker];
        if (stock && stock.timeseries) {
            renderPrimaryChart(stock.timeseries);
            renderStochChart(stock.timeseries);
            renderRSIChart(stock.timeseries);
            renderMACDChart(stock.timeseries);
            renderCMFChart(stock.timeseries);
        }
    } else if (tabKey === 'backtest') {
        renderBacktest();
    }

    // Trigger resize for ApexCharts to render properly in newly visible tabs
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 50);

    lucide.createIcons();
}

function toggleMobileSubtabMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdown = document.getElementById('mobileCustomTabDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
        lucide.createIcons();
    }
}

function selectMobileSubtab(tabKey) {
    const dropdown = document.getElementById('mobileCustomTabDropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
    switchMainTab(tabKey);
}

function updateMobileTabState(tabKey) {
    const tab = tabKey || state.activeMainTab || 'ai';

    const labelMap = {
        'ai': 'AI Intelligence',
        'charts': 'Charts & Technicals',
        'backtest': 'Backtesting & Strategy',
        'fundamentals': 'Fundamentals & Consensus'
    };

    const iconMap = {
        'ai': 'sparkles',
        'charts': 'line-chart',
        'backtest': 'play-circle',
        'fundamentals': 'layers'
    };

    const mobileLabel = document.getElementById('mobileActiveTabLabel');
    if (mobileLabel) {
        mobileLabel.textContent = labelMap[tab] || 'AI Intelligence';
    }

    const mobileIcon = document.getElementById('mobileActiveTabIcon');
    if (mobileIcon) {
        mobileIcon.setAttribute('data-lucide', iconMap[tab] || 'sparkles');
    }

    document.querySelectorAll('.custom-tab-dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}



async function handleAnalyze(forceRefresh = false) {
    // Immediately dismiss suggestions dropdown and cancel pending search
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';
    deepDiveSelectedIndex = -1;
    if (deepDiveSearchDebounceTimer) {
        clearTimeout(deepDiveSearchDebounceTimer);
        deepDiveSearchDebounceTimer = null;
    }
    if (deepDiveActiveAbortController) {
        deepDiveActiveAbortController.abort();
        deepDiveActiveAbortController = null;
    }

    const inputVal = document.getElementById('tickerInput')?.value.trim();
    if (!inputVal) return;

    const errorAlert = document.getElementById('errorAlert');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const dashboardContent = document.getElementById('dashboardContent');

    if (errorAlert) errorAlert.style.display = 'none';

    let tickers = inputVal.split(',').map(t => t.trim()).filter(t => t);
    if (tickers.length === 0) return;

    // Check if any entered token is a company name (or needs resolution)
    const needsResolution = tickers.some(t => t.includes(' ') || (t.length > 5 && !t.includes('.')) || t !== t.toUpperCase() || !state.stocksData[t.toUpperCase()]);
    if (needsResolution) {
        try {
            const resolveResp = await fetch('/api/stocks/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queries: tickers })
            });
            if (resolveResp.ok) {
                const resolveData = await resolveResp.json();
                if (resolveData.success && resolveData.tickers && resolveData.tickers.length > 0) {
                    tickers = resolveData.tickers;
                    const input = document.getElementById('tickerInput');
                    if (input) input.value = resolveData.tickerString;
                }
            }
        } catch (e) {
            tickers = tickers.map(t => t.toUpperCase());
        }
    } else {
        tickers = tickers.map(t => t.toUpperCase());
    }

    // Stage 0: Instant Rendering from existing state/watchlist data if available
    const availableExisting = tickers.filter(t => state.stocksData[t] || state.watchlistData[t]);
    if (availableExisting.length > 0) {
        availableExisting.forEach(t => {
            if (!state.stocksData[t] && state.watchlistData[t]) {
                state.stocksData[t] = state.watchlistData[t];
            }
        });
        if (!state.stocksData[state.activeTicker] && availableExisting.length > 0) {
            state.activeTicker = availableExisting[0];
        }
        renderStockSelector(tickers);
        if (state.stocksData[state.activeTicker]) {
            renderActiveStock();
        }
    } else {
        if (loadingOverlay) loadingOverlay.style.display = 'block';
        if (dashboardContent) dashboardContent.style.opacity = '0.4';
    }

    try {
        // =========================================================
        // STAGE 1: Fast-Path Hydration (Quotes, Price Banner, Delta in <100ms)
        // =========================================================
        const fastResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: tickers,
                period: '1mo',
                interval: '1d',
                phase: 'fast'
            })
        });

        if (fastResponse.ok) {
            const fastData = await fastResponse.json();
            if (fastData && fastData.stocks) {
                Object.keys(fastData.stocks).forEach(tk => {
                    const existing = state.stocksData[tk] || {};
                    state.stocksData[tk] = {
                        ...existing,
                        ...fastData.stocks[tk],
                        timeseries: existing.timeseries || fastData.stocks[tk].sparkline || [],
                        aiAnalysis: existing.aiAnalysis || null
                    };
                });

                if (!tickers.includes(state.activeTicker)) {
                    state.activeTicker = tickers[0];
                }

                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (dashboardContent) dashboardContent.style.opacity = '1';

                renderStockSelector(tickers);
                renderActiveStock();
            }
        }

        // =========================================================
        // STAGE 2: Full Deep Hydration (Candlesticks, Backtests, Oscillators, AI Copilot)
        // =========================================================
        const fullResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: tickers,
                period: state.currentPeriod,
                interval: '1d',
                forceRefresh: forceRefresh,
                phase: 'full',
                apiKey: state.aiSettings.apiKey,
                model: state.aiSettings.model
            })
        });

        const fullData = await fullResponse.json();
        if (fullResponse.ok && fullData && fullData.stocks) {
            state.stocksData = fullData.stocks;

            const availableTickers = Object.keys(state.stocksData);
            if (!availableTickers.includes(state.activeTicker)) {
                state.activeTicker = availableTickers[0] || 'AAPL';
            }

            renderStockSelector(availableTickers);
            renderActiveStock();
            evaluateAlertRules(state.stocksData);
        } else if (!fastResponse.ok && fullData?.error) {
            throw new Error(fullData.error || 'Failed to analyze requested stocks.');
        }

    } catch (err) {
        console.error('Analyze error:', err);
        if (errorAlert) {
            errorAlert.textContent = err.message || 'An error occurred while analyzing stocks.';
            errorAlert.style.display = 'block';
        }
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (dashboardContent) dashboardContent.style.opacity = '1';
        hideChartLoading();
        lucide.createIcons();
    }
}

function renderStockSelector(tickers) {
    const container = document.getElementById('tickerTabsList');
    if (!container) return;
    container.innerHTML = '';

    if (!tickers || tickers.length === 0) return;

    tickers.forEach(ticker => {
        const stock = state.stocksData[ticker];
        if (!stock || stock.error) return;

        const profile = stock.profile || {};
        const changePercent = typeof profile.changePercent === 'number' ? profile.changePercent : 0;
        const isBullish = changePercent >= 0;

        const compName = getAssetCompanyName(ticker, stock);
        const tab = document.createElement('div');
        tab.className = `ticker-tab ${ticker === state.activeTicker ? 'active' : ''}`;
        const instCurr = profile.currency || 'USD';
        const baseCurr = getUserBaseCurrency();
        const displayPrice = formatPrice(profile.currentPrice, instCurr, baseCurr);

        tab.dataset.ticker = ticker;
        tab.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
                <span class="ticker-tab-symbol">${ticker}</span>
                <span class="ticker-tab-name" title="${compName}">${compName}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
                <span class="ticker-tab-price mono">${displayPrice}</span>
                <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'}">
                    ${isBullish ? '+' : ''}${changePercent.toFixed(2)}%
                </span>
            </div>
        `;
        tab.onclick = () => switchActiveStock(ticker);
        container.appendChild(tab);
    });
}

function renderActiveStock() {
    const stock = state.stocksData[state.activeTicker];
    const errorAlert = document.getElementById('errorAlert');

    if (!stock) {
        // Active ticker data not loaded yet; safely return without flashing error banner
        return;
    }

    if (stock.error) {
        if (errorAlert) {
            errorAlert.textContent = stock.error || `No data found for ${state.activeTicker}`;
            errorAlert.style.display = 'block';
        }
        return;
    }

    if (errorAlert) {
        errorAlert.style.display = 'none';
    }

    const profile = stock.profile || {};
    const signals = stock.signals || {};
    const timeseries = stock.timeseries || [];
    const aiAnalysis = stock.aiAnalysis || {};

    const instCurr = profile.currency || 'USD';
    const baseCurr = getUserBaseCurrency();
    const isDiffCurr = instCurr.toUpperCase() !== baseCurr.toUpperCase();

    // 1. Update Header Quote & Tab Section Titles with Company Name
    const compName = getAssetCompanyName(state.activeTicker, stock);
    const subTitleText = (compName && compName.toUpperCase() !== state.activeTicker.toUpperCase()) 
        ? `${state.activeTicker} (${compName})` 
        : state.activeTicker;

    setText('quoteSymbol', state.activeTicker);
    setText('quoteName', compName);
    setText('quoteSector', profile.sector || 'Equities');
    setText('mainChartTitle', `${state.activeTicker} - Price Action & Quantitative Overlays (${instCurr})`);
    setText('mainChartSubtitle', compName);
    setText('fundamentalsSubtitle', subTitleText);
    setText('valuationSubtitle', subTitleText);
    setText('backtestSubtitle', subTitleText);
    setText('aiHeaderSubtitle', subTitleText);
    setText('aiNewsSidebarSubtitle', subTitleText);

    const price = typeof profile.currentPrice === 'number' ? formatPrice(profile.currentPrice, instCurr, baseCurr) : '--';
    setText('quotePrice', price);

    const nativePriceEl = document.getElementById('quoteNativePrice');
    if (nativePriceEl) {
        if (isDiffCurr && typeof profile.currentPrice === 'number') {
            nativePriceEl.style.display = 'block';
            nativePriceEl.textContent = `Native: ${formatPrice(profile.currentPrice, instCurr, instCurr)} (${instCurr})`;
        } else {
            nativePriceEl.style.display = 'none';
        }
    }

    const change = typeof profile.change === 'number' ? profile.change : 0;
    const changePercent = typeof profile.changePercent === 'number' ? profile.changePercent : 0;
    const isUp = change >= 0;

    const changeBadge = document.getElementById('quoteChangeBadge');
    if (changeBadge) {
        changeBadge.className = `change-badge ${isUp ? 'badge-bullish' : 'badge-bearish'} mono`;
        changeBadge.innerHTML = `
            <i data-lucide="${isUp ? 'trending-up' : 'trending-down'}" style="width: 16px;"></i>
            ${isUp ? '+' : ''}${change.toFixed(2)} (${isUp ? '+' : ''}${changePercent.toFixed(2)}%)
        `;
    }

    const dayLow = typeof profile.dayLow === 'number' ? formatPrice(profile.dayLow, instCurr, baseCurr) : '--';
    const dayHigh = typeof profile.dayHigh === 'number' ? formatPrice(profile.dayHigh, instCurr, baseCurr) : '--';
    setText('quoteDayRange', `${dayLow} - ${dayHigh}`);
    setText('quotePrevClose', typeof profile.previousClose === 'number' ? formatPrice(profile.previousClose, instCurr, baseCurr) : '--');
    setText('quoteVolume', formatCompactNumber(profile.volume));
    setText('quoteVWAP', typeof profile.vwap === 'number' ? formatPrice(profile.vwap, instCurr, baseCurr) : '--');
    setText('quoteATR', typeof profile.atr === 'number' ? `±${formatPrice(profile.atr, instCurr, baseCurr)}` : '--');

    // 2. Update Stats Grid
    setText('stockCurrencyBadge', `${baseCurr}${isDiffCurr ? ` (Native: ${instCurr})` : ''}`);
    setText('statMarketCap', typeof profile.marketCap === 'number' ? formatCompactPrice(profile.marketCap, instCurr, baseCurr) : 'N/A');
    setText('statPE', profile.peRatio ? `${profile.peRatio}x` : 'N/A');
    setText('statForwardPE', profile.forwardPE ? `${profile.forwardPE}x` : 'N/A');
    setText('statATR', typeof profile.atr === 'number' ? formatPrice(profile.atr, instCurr, baseCurr) : 'N/A');
    setText('statCMF', typeof profile.cmf === 'number' ? `${profile.cmf > 0 ? '+' : ''}${profile.cmf.toFixed(3)}` : 'N/A');
    setText('statBeta', profile.beta ? `${profile.beta}` : 'N/A');
    setText('statDivYield', profile.dividendYield !== null && profile.dividendYield !== undefined ? `${profile.dividendYield}%` : '0.00%');
    setText('statAvgVolume', formatCompactNumber(profile.avgVolume));

    // 52-Week Range Bar
    const low52 = profile.fiftyTwoWeekLow;
    const high52 = profile.fiftyTwoWeekHigh;
    const curPrice = profile.currentPrice;
    const stat52Progress = document.getElementById('stat52Progress');

    if (typeof low52 === 'number' && typeof high52 === 'number' && typeof curPrice === 'number' && high52 > low52) {
        const pct = Math.min(100, Math.max(0, ((curPrice - low52) / (high52 - low52)) * 100));
        if (stat52Progress) stat52Progress.style.width = `${pct}%`;
        setText('stat52Position', `Position: ${pct.toFixed(0)}%`);
        setText('stat52Low', `Low: ${formatPrice(low52, instCurr, baseCurr)}`);
        setText('stat52High', `High: ${formatPrice(high52, instCurr, baseCurr)}`);
    } else {
        if (stat52Progress) stat52Progress.style.width = '0%';
        setText('stat52Position', 'Position: N/A');
        setText('stat52Low', 'Low: N/A');
        setText('stat52High', 'High: N/A');
    }

    // 3. Update Technical Signals & Rating
    renderTechnicalSignals(signals);

    // 4. Update AI Financial Intelligence Panel & News Intelligence
    renderAIIntelligence(aiAnalysis);
    renderNewsIntelligence(stock);

    // 5. Render Primary Dynamic Charts
    renderPrimaryChart(timeseries);
    renderStochChart(timeseries);
    renderRSIChart(timeseries);
    renderMACDChart(timeseries);
    renderCMFChart(timeseries);

    // 6. Render Backtesting Simulation Panel
    renderBacktest();

    // 7. Ensure active tab is displayed and icons are rendered
    switchMainTab(state.activeMainTab);
    lucide.createIcons();
}

function renderNewsIntelligence(stock) {
    if (!stock) return;
    const news = stock.news || [];
    const ai = stock.aiAnalysis || {};
    const synth = ai.newsSynthesis || {};

    // 1. Update News Count & Sentiment Badge
    const sentimentBadge = document.getElementById('aiNewsSentimentBadge');
    if (sentimentBadge) {
        const sentiment = synth.sentiment || 'Neutral';
        const score = synth.sentimentScore || 50;
        const color = synth.sentimentColor || 'neutral';
        sentimentBadge.textContent = synth.sentimentBadge || `${sentiment} (${score}%)`;
        sentimentBadge.className = `badge-pill ${color === 'bullish' ? 'badge-bullish' : (color === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }

    // Update Conviction Delta Badge
    const deltaBadge = document.getElementById('aiNewsDeltaBadge');
    if (deltaBadge) {
        const delta = synth.convictionDelta || 0.0;
        if (delta > 0) {
            deltaBadge.textContent = `+${delta.toFixed(1)}% Conviction Boost`;
            deltaBadge.className = 'badge-pill badge-bullish';
            deltaBadge.style.display = 'inline-block';
        } else if (delta < 0) {
            deltaBadge.textContent = `${delta.toFixed(1)}% Conviction Drag`;
            deltaBadge.className = 'badge-pill badge-bearish';
            deltaBadge.style.display = 'inline-block';
        } else {
            deltaBadge.textContent = `+0.0% Neutral Flow`;
            deltaBadge.className = 'badge-pill badge-neutral';
            deltaBadge.style.display = 'inline-block';
        }
    }

    const countEl = document.getElementById('aiNewsCount');
    if (countEl) {
        countEl.textContent = `${news.length}`;
    }

    // 2. Render AI News Summary & Catalyst Takeaway Bullets
    const summaryEl = document.getElementById('aiNewsSummaryText');
    if (summaryEl) {
        if (synth.summary) {
            summaryEl.innerHTML = formatMarkdownResponse(synth.summary);
        } else {
            summaryEl.innerHTML = `<em>Synthesizing global financial headlines and macroeconomic market impact...</em>`;
        }
    }

    const bulletsContainer = document.getElementById('aiNewsCatalystBulletsContainer');
    const bulletsList = document.getElementById('aiNewsCatalystBullets');
    if (bulletsContainer && bulletsList) {
        const bullets = synth.catalystBullets || [];
        if (bullets.length > 0) {
            bulletsContainer.style.display = 'block';
            bulletsList.innerHTML = bullets.map(item => {
                let flag = '🌐';
                let publisher = 'Market Wire';
                let headline = '';
                let url = '#';
                let timeAgo = '';

                if (typeof item === 'object' && item !== null) {
                    flag = item.flag || '🌐';
                    publisher = item.publisher || 'Financial Wire';
                    headline = item.headline || item.title || '';
                    url = item.url || '#';
                    timeAgo = item.timeAgo || '';
                } else if (typeof item === 'string') {
                    // Extract regex match if legacy format: **[🇺🇸 MarketWatch]** Headline
                    const match = item.match(/\*\*\[(.*?)\]\*\*\s*(.*)/);
                    if (match) {
                        const tag = match[1].trim();
                        const parts = tag.split(' ');
                        flag = parts[0] || '🌐';
                        publisher = parts.slice(1).join(' ') || 'News';
                        headline = match[2].trim();
                    } else {
                        headline = item;
                    }
                }

                return `
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="catalyst-takeaway-card">
                        <div class="catalyst-takeaway-header">
                            <span class="catalyst-tag">${getCountryFlagHtml(flag, publisher)} <span>${escapeHtml(publisher)}</span></span>
                            ${timeAgo ? `<span class="catalyst-time">${escapeHtml(timeAgo)}</span>` : ''}
                        </div>
                        <div class="catalyst-takeaway-title">${formatMarkdownResponse(headline)}</div>
                    </a>
                `;
            }).join('');
        } else {
            bulletsContainer.style.display = 'none';
        }
    }

    // Refresh modal list if modal is currently open
    const modal = document.getElementById('globalNewsModal');
    if (modal && modal.style.display === 'flex') {
        renderGlobalNewsModalList();
    }
}

// Global News Modal Functions
let currentModalNewsFilter = 'all';
let currentModalNewsQuery = '';

function openGlobalNewsModal() {
    const modal = document.getElementById('globalNewsModal');
    if (!modal) return;

    const stock = state.stocksData[state.activeTicker];
    const compName = getAssetCompanyName(state.activeTicker, stock);
    const badgeEl = document.getElementById('newsModalStockBadge');
    if (badgeEl) {
        badgeEl.textContent = `${state.activeTicker} (${compName})`;
    }

    const searchInput = document.getElementById('globalNewsSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    currentModalNewsQuery = '';
    currentModalNewsFilter = 'all';

    ['newsFilterAllBtn', 'newsFilterCatalystsBtn', 'newsFilterTier1Btn'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
    document.getElementById('newsFilterAllBtn')?.classList.add('active');

    renderGlobalNewsModalList();
    modal.style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeGlobalNewsModal() {
    const modal = document.getElementById('globalNewsModal');
    if (modal) modal.style.display = 'none';
}

function setNewsModalFilter(filterType) {
    currentModalNewsFilter = filterType;
    ['newsFilterAllBtn', 'newsFilterCatalystsBtn', 'newsFilterTier1Btn'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
    if (filterType === 'all') document.getElementById('newsFilterAllBtn')?.classList.add('active');
    if (filterType === 'catalysts') document.getElementById('newsFilterCatalystsBtn')?.classList.add('active');
    if (filterType === 'tier1') document.getElementById('newsFilterTier1Btn')?.classList.add('active');

    renderGlobalNewsModalList();
}

function filterGlobalNewsModal(query) {
    currentModalNewsQuery = String(query || '').trim().toLowerCase();
    renderGlobalNewsModalList();
}

function renderGlobalNewsModalList() {
    const container = document.getElementById('globalNewsModalList');
    const footerCount = document.getElementById('globalNewsModalFooterCount');
    if (!container) return;

    const stock = state.stocksData[state.activeTicker];
    const news = stock?.news || [];

    let filtered = news.filter(item => {
        if (currentModalNewsQuery) {
            const title = (item.title || '').toLowerCase();
            const summary = (item.summary || '').toLowerCase();
            const pub = (item.publisher || '').toLowerCase();
            if (!title.includes(currentModalNewsQuery) && !summary.includes(currentModalNewsQuery) && !pub.includes(currentModalNewsQuery)) {
                return false;
            }
        }
        if (currentModalNewsFilter === 'catalysts') {
            const t = (item.title || '').toLowerCase();
            const isCat = t.includes('earnings') || t.includes('revenue') || t.includes('deal') || t.includes('ai') || t.includes('upgrade') || t.includes('sec') || t.includes('investigation') || t.includes('price target') || t.includes('surge') || t.includes('plunge');
            if (!isCat) return false;
        }
        if (currentModalNewsFilter === 'tier1') {
            const pub = (item.publisher || '').toLowerCase();
            const isTier1 = pub.includes('reuters') || pub.includes('bloomberg') || pub.includes('dow jones') || pub.includes('marketwatch') || pub.includes('handelsblatt') || pub.includes('nikkei') || pub.includes('ft') || pub.includes('financial times') || pub.includes('cnbc');
            if (!isTier1) return false;
        }
        return true;
    });

    if (footerCount) {
        footerCount.textContent = `Showing ${filtered.length} of ${news.length} wire articles`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 48px 20px;">
                <i data-lucide="newspaper" style="width: 32px; height: 32px; margin: 0 auto 10px auto; opacity: 0.4; display: block;"></i>
                No matching news articles found for current filter.
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(item => {
        const flag = item.flag || '🌐';
        const country = item.country || 'Global';
        const publisher = item.publisher || 'Financial Wire';
        const timeAgo = item.timeAgo || item.time || 'Recent';
        const title = escapeHtml(item.title || '');
        const summary = escapeHtml(item.summary || '');
        const url = escapeHtml(item.url || '#');

        return `
            <div class="news-modal-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="news-origin-badge" style="font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">${getCountryFlagHtml(flag || country, country)} <span>${escapeHtml(country)}</span></span>
                        <span class="news-publisher-tag" style="font-size: 0.72rem; font-weight: 700; color: var(--accent-cyan);">${publisher}</span>
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${timeAgo}</span>
                </div>
                <div style="font-size: 0.90rem; font-weight: 700; color: var(--text-primary); line-height: 1.4;">${title}</div>
                ${summary ? `<div class="news-modal-summary">${summary}</div>` : ''}
                <div style="display: flex; justify-content: flex-end; margin-top: 2px;">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.76rem; color: var(--accent-blue); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                        <span>Read Original Article</span>
                        <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAIIntelligence(ai) {
    if (!ai) return;

    const score = ai.convictionScore || 50;
    const bias = ai.directionalBias || 'Neutral';
    const stanceColor = ai.stanceColor || 'neutral';

    const scoreEl = document.getElementById('aiConvictionScore');
    if (scoreEl) {
        scoreEl.textContent = `${score}%`;
        scoreEl.style.color = stanceColor === 'bullish' ? 'var(--accent-green)' : (stanceColor === 'bearish' ? 'var(--accent-red)' : 'var(--accent-blue)');
    }

    const biasEl = document.getElementById('aiDirectionalBias');
    if (biasEl) {
        biasEl.textContent = bias;
        biasEl.className = `badge-pill ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }

    const barEl = document.getElementById('aiConvictionBar');
    if (barEl) {
        barEl.style.width = `${score}%`;
        barEl.style.background = stanceColor === 'bullish' ? 'linear-gradient(90deg, #3b82f6, #10b981)' : (stanceColor === 'bearish' ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #64748b, #3b82f6)');
    }

    const bdEl = document.getElementById('aiConvictionBreakdown');
    if (bdEl) {
        bdEl.innerHTML = '';
        const bd = ai.convictionBreakdown || {};
        const labels = {
            'trend': 'Trend',
            'momentum': 'Momentum',
            'flow': 'Money Flow',
            'price': 'Price Action',
            'news': 'Catalysts',
            'volatility': 'Volatility',
            'backtest': 'Backtest'
        };
        Object.keys(bd).forEach(k => {
            const val = bd[k];
            if (val !== 0) {
                const span = document.createElement('span');
                const isPos = val > 0;
                span.style.cssText = `display: inline-flex; align-items: center; gap: 2px; padding: 1px 6px; border-radius: 4px; font-size: 0.68rem; font-family: var(--font-mono); font-weight: 600; background: ${isPos ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; color: ${isPos ? '#34d399' : '#f87171'}; border: 1px solid ${isPos ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};`;
                span.textContent = `${labels[k] || k}: ${isPos ? '+' : ''}${val}`;
                bdEl.appendChild(span);
            }
        });
    }

    // 2. Executive Thesis Narrative (HTML Markdown Rendered)
    const thesisEl = document.getElementById('aiThesisText');
    if (thesisEl) {
        thesisEl.innerHTML = formatMarkdownResponse(ai.executiveThesis || 'AI thesis computed.');
    }

    // Catalysts
    const catList = document.getElementById('aiCatalystsList');
    if (catList) {
        catList.innerHTML = '';
        (ai.catalysts || []).forEach(cat => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'flex-start';
            li.style.gap = '8px';
            li.innerHTML = `<span style="color: var(--accent-green); flex-shrink: 0; margin-top: 1px;">✔</span> <span>${formatMarkdownResponse(cat)}</span>`;
            catList.appendChild(li);
        });
    }

    // Risks
    const riskList = document.getElementById('aiRisksList');
    if (riskList) {
        riskList.innerHTML = '';
        (ai.risks || []).forEach(r => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'flex-start';
            li.style.gap = '8px';
            li.innerHTML = `<span style="color: var(--accent-red); flex-shrink: 0; margin-top: 1px;">⚠</span> <span>${formatMarkdownResponse(r)}</span>`;
            riskList.appendChild(li);
        });
    }

    // Trade Levels Matrix
    const stock = state.stocksData[state.activeTicker];
    const instCurr = stock?.profile?.currency || 'USD';
    const baseCurr = getUserBaseCurrency();

    const levels = ai.tradeLevels || {};
    const entryDisplay = (levels.entryLow !== undefined && levels.entryHigh !== undefined)
        ? `${formatPrice(levels.entryLow, instCurr, baseCurr)} – ${formatPrice(levels.entryHigh, instCurr, baseCurr)}`
        : formatPriceOrRange(levels.entryZone, instCurr, baseCurr);

    const riskDisplay = (levels.riskPerShareNum !== undefined)
        ? formatPrice(levels.riskPerShareNum, instCurr, baseCurr)
        : formatPriceOrRange(levels.riskPerShare, instCurr, baseCurr);

    const rewardDisplay = (levels.rewardPerShareNum !== undefined)
        ? formatPrice(levels.rewardPerShareNum, instCurr, baseCurr)
        : formatPriceOrRange(levels.rewardPerShare, instCurr, baseCurr);

    setText('aiEntryZone', entryDisplay);
    setText('aiStopLoss', typeof levels.stopLoss === 'number' ? formatPrice(levels.stopLoss, instCurr, baseCurr) : formatPriceOrRange(levels.stopLoss, instCurr, baseCurr));
    setText('aiTarget1', typeof levels.target1 === 'number' ? formatPrice(levels.target1, instCurr, baseCurr) : formatPriceOrRange(levels.target1, instCurr, baseCurr));
    setText('aiTarget2', typeof levels.target2 === 'number' ? formatPrice(levels.target2, instCurr, baseCurr) : formatPriceOrRange(levels.target2, instCurr, baseCurr));
    setText('aiRiskReward', levels.riskRewardRatio || '2.5:1');
    setText('aiRiskAmt', riskDisplay);
    setText('aiRewardAmt', rewardDisplay);

    // Update AI Tab Badge
    const tabBadgeAI = document.getElementById('tabBadgeAI');
    const mobileBadgeAI = document.getElementById('mobileBadgeAI');
    if (tabBadgeAI) {
        tabBadgeAI.textContent = `${score}% ${bias}`;
        tabBadgeAI.className = `tab-mini-badge ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }
    if (mobileBadgeAI) {
        mobileBadgeAI.textContent = `${score}% ${bias}`;
        mobileBadgeAI.className = `tab-mini-badge ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}`;
    }
    updateMobileTabState(state.activeMainTab);


    // Scenarios
    const sc = ai.scenario30d || {};
    if (sc.bullCase) {
        setText('scenarioBullProb', `${sc.bullCase.probability ?? '--'}% Prob`);
        setText('scenarioBullPrice', typeof sc.bullCase.target === 'number' ? formatPrice(sc.bullCase.target, instCurr, baseCurr) : '$--');
        setText('scenarioBullReturn', typeof sc.bullCase.returnPct === 'number' ? `+${sc.bullCase.returnPct}% Expected Upside` : '--');
    } else {
        setText('scenarioBullProb', '--% Prob');
        setText('scenarioBullPrice', '$--');
        setText('scenarioBullReturn', '-- Expected Upside');
    }
    if (sc.baseCase) {
        setText('scenarioBaseProb', `${sc.baseCase.probability ?? '--'}% Prob`);
        setText('scenarioBasePrice', typeof sc.baseCase.target === 'number' ? formatPrice(sc.baseCase.target, instCurr, baseCurr) : '$--');
        setText('scenarioBaseReturn', typeof sc.baseCase.returnPct === 'number' ? `${sc.baseCase.returnPct >= 0 ? '+' : ''}${sc.baseCase.returnPct}% Expected Drift` : '--');
    } else {
        setText('scenarioBaseProb', '--% Prob');
        setText('scenarioBasePrice', '$--');
        setText('scenarioBaseReturn', '-- Expected Drift');
    }
    if (sc.bearCase) {
        setText('scenarioBearProb', `${sc.bearCase.probability ?? '--'}% Prob`);
        setText('scenarioBearPrice', typeof sc.bearCase.target === 'number' ? formatPrice(sc.bearCase.target, instCurr, baseCurr) : '$--');
        setText('scenarioBearReturn', typeof sc.bearCase.returnPct === 'number' ? `${sc.bearCase.returnPct}% Downside Exposure` : '--');
    } else {
        setText('scenarioBearProb', '--% Prob');
        setText('scenarioBearPrice', '$--');
        setText('scenarioBearReturn', '-- Downside Exposure');
    }
}

async function handleCopilotSubmit() {
    const input = document.getElementById('copilotInput');
    const question = input?.value.trim();
    if (!question) return;

    if (input) input.value = '';
    await askCopilot(question);
}

function askCopilotPrompt(question) {
    askCopilot(question);
}

function clearCopilotChat() {
    const container = document.getElementById('copilotMessages');
    if (!container) return;
    container.innerHTML = `
        <div class="chat-bubble chat-bubble-ai">
            👋 Hello! I am your <strong>FinDashIQ AI Copilot</strong>. I analyze real-time technical indicators, momentum oscillators, institutional capital flow, and historical backtests. Ask me anything about the selected stock!
        </div>
    `;
}

function formatMarkdownResponse(text) {
    if (!text) return '';

    // Bold **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    formatted = formatted.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

    // Code blocks `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="mono" style="background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 4px; font-size: 0.85em;">$1</code>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

async function askCopilot(question) {
    const container = document.getElementById('copilotMessages');
    if (!container) return;

    // Append user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = question;
    container.appendChild(userBubble);

    // Append AI loading bubble
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble chat-bubble-ai';
    aiBubble.innerHTML = `<em>Analyzing quantitative metrics...</em>`;
    container.appendChild(aiBubble);
    container.scrollTop = container.scrollHeight;

    try {
        const stock = state.stocksData[state.activeTicker] || {};
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticker: state.activeTicker,
                question: question,
                stockData: stock,
                apiKey: state.aiSettings.apiKey,
                model: state.aiSettings.model
            })
        });

        const data = await response.json();
        const answerRaw = data.answer || 'I could not generate an answer.';
        if (answerRaw.includes('quota') || answerRaw.includes('429') || answerRaw.includes('Quota exceeded')) {
            if (state.aiSettings.apiKey && state.aiSettings.apiKey.length > 6) {
                updateAIBadges('quota_exceeded');
            }
        } else if (state.aiSettings.apiKey && state.aiSettings.apiKey.length > 6) {
            updateAIBadges('active');
        }
        aiBubble.innerHTML = formatMarkdownResponse(answerRaw);

    } catch (err) {
        aiBubble.innerHTML = `<span style="color: var(--accent-red);">Error querying AI: ${err.message}</span>`;
    }

    container.scrollTop = container.scrollHeight;
}

function renderTechnicalSignals(signals) {
    const overall = signals.overall || 'Neutral';
    const bullish = signals.bullishCount || 0;
    const bearish = signals.bearishCount || 0;
    const neutral = signals.neutralCount || 0;
    const total = Math.max(1, bullish + bearish + neutral);

    const overallBadge = document.getElementById('overallRatingBadge');
    const countBadge = document.getElementById('signalsCountBadge');

    let badgeClass = 'badge-neutral';
    let iconName = 'minus';
    if (overall.includes('Buy')) {
        badgeClass = 'badge-bullish';
        iconName = 'trending-up';
    } else if (overall.includes('Sell')) {
        badgeClass = 'badge-bearish';
        iconName = 'trending-down';
    }

    if (overallBadge) {
        overallBadge.className = `overall-rating-badge ${badgeClass}`;
        overallBadge.innerHTML = `<i data-lucide="${iconName}"></i> <span>${overall}</span>`;
    }

    if (countBadge) {
        countBadge.className = `badge-pill ${badgeClass}`;
        countBadge.textContent = `${bullish} Bullish / ${bearish} Bearish`;
    }

    // Update Fundamentals Tab Badge
    const tabBadgeSignals = document.getElementById('tabBadgeSignals');
    const mobileBadgeSignals = document.getElementById('mobileBadgeSignals');
    if (tabBadgeSignals) {
        tabBadgeSignals.textContent = overall;
        tabBadgeSignals.className = `tab-mini-badge ${badgeClass}`;
    }
    if (mobileBadgeSignals) {
        mobileBadgeSignals.textContent = overall;
        mobileBadgeSignals.className = `tab-mini-badge ${badgeClass}`;
    }
    updateMobileTabState(state.activeMainTab);


    setText('bullishCount', bullish);
    setText('neutralCount', neutral);
    setText('bearishCount', bearish);

    const meterBullish = document.getElementById('meterBullish');
    const meterNeutral = document.getElementById('meterNeutral');
    const meterBearish = document.getElementById('meterBearish');

    if (meterBullish) meterBullish.style.width = `${(bullish / total) * 100}%`;
    if (meterNeutral) meterNeutral.style.width = `${(neutral / total) * 100}%`;
    if (meterBearish) meterBearish.style.width = `${(bearish / total) * 100}%`;

    // Render Individual Signal Rows
    const listContainer = document.getElementById('signalsList');
    if (listContainer) {
        listContainer.innerHTML = '';
        const indicators = signals.indicators || {};
        const stock = state.stocksData[state.activeTicker];
        const instCurr = stock?.profile?.currency || 'USD';
        const baseCurr = getUserBaseCurrency();

        for (const [key, item] of Object.entries(indicators)) {
            const row = document.createElement('div');
            row.className = 'signal-row';

            let statusClass = 'badge-neutral';
            if (item.status === 'bullish') statusClass = 'badge-bullish';
            if (item.status === 'bearish') statusClass = 'badge-bearish';

            let valDisplay = item.value;
            if (typeof item.value === 'number' && (key === 'SuperTrend' || key === 'VWAP' || key === 'SMA_50' || key === 'SMA_20')) {
                valDisplay = formatPrice(item.value, instCurr, baseCurr);
            } else if (typeof item.value === 'string' && item.value.startsWith('ATR: $')) {
                const num = parseFloat(item.value.replace(/[^0-9.]/g, ''));
                if (!isNaN(num)) valDisplay = `ATR: ±${formatPrice(num, instCurr, baseCurr)}`;
            }

            row.innerHTML = `
                <div class="signal-name-desc">
                    <span class="signal-name">${key.replace('_', ' ')}</span>
                    <span class="signal-desc">${item.desc || ''}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${valDisplay !== undefined ? `<span class="mono" style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${valDisplay}</span>` : ''}
                    <span class="badge-pill ${statusClass}">${item.signal}</span>
                </div>
            `;
            listContainer.appendChild(row);
        }
    }
}

// -------------------------------------------------------------
// BACKTESTING SIMULATION ENGINE & UI
// -------------------------------------------------------------

function renderBacktest() {
    const stock = state.stocksData[state.activeTicker];
    if (!stock) return;

    const backtests = stock.backtests || {};
    const bt = backtests[state.backtestStrategy] || calculateClientBacktest(stock.timeseries, state.backtestStrategy);
    if (!bt) return;

    const returnPct = bt.strategyReturnPct || 0;
    const bhPct = bt.buyHoldReturnPct || 0;
    const alpha = bt.alpha || (returnPct - bhPct);
    const isReturnPositive = returnPct >= 0;

    const returnEl = document.getElementById('btReturnVal');
    if (returnEl) {
        returnEl.textContent = `${isReturnPositive ? '+' : ''}${returnPct.toFixed(2)}%`;
        returnEl.style.color = isReturnPositive ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    // Update Backtest Tab Badge
    const tabBadgeBacktest = document.getElementById('tabBadgeBacktest');
    const mobileBadgeBacktest = document.getElementById('mobileBadgeBacktest');
    if (tabBadgeBacktest) {
        tabBadgeBacktest.textContent = `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}% Return`;
        tabBadgeBacktest.className = `tab-mini-badge ${isReturnPositive ? 'badge-bullish' : 'badge-bearish'}`;
    }
    if (mobileBadgeBacktest) {
        mobileBadgeBacktest.textContent = `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}% Return`;
        mobileBadgeBacktest.className = `tab-mini-badge ${isReturnPositive ? 'badge-bullish' : 'badge-bearish'}`;
    }
    updateMobileTabState(state.activeMainTab);


    const instCurr = stock.profile?.currency || 'USD';
    const baseCurr = getUserBaseCurrency();

    setText('btBenchVal', `Buy & Hold: ${bhPct >= 0 ? '+' : ''}${bhPct.toFixed(2)}% (Alpha: ${alpha >= 0 ? '+' : ''}${alpha.toFixed(2)}%)`);
    setText('btCapitalVal', formatPrice(bt.finalEquity || 10000, instCurr, baseCurr));
    setText('btHoldingStatus', bt.isCurrentlyHolding ? '🟢 Position: IN POSITION (Active Long)' : '⚪ Position: In Cash (100%)');
    setText('btWinRateVal', `${(bt.winRatePct || 0).toFixed(1)}%`);
    setText('btTradesCount', `${bt.totalTrades || 0} Closed Trades (${bt.winningTrades || 0} Wins / ${bt.losingTrades || 0} Losses)`);
    setText('btProfitFactor', `${(bt.profitFactor || 1).toFixed(2)}x`);
    setText('btMaxDrawdown', `Max Drawdown: -${(bt.maxDrawdownPct || 0).toFixed(2)}%`);
    setText('totalOrdersBadge', `${(bt.trades || []).length} Total Orders`);

    renderEquityChart(bt.equityCurve);
    renderTradesTable(bt.trades);
}

function calculateClientBacktest(timeseries, strategy, initialCapital = 10000) {
    if (!timeseries || timeseries.length < 5) return null;

    let capital = initialCapital;
    let position = 0;
    let entryPrice = 0;
    let entryDate = '';
    const trades = [];
    const closedTrades = [];
    const equityCurve = [];
    const initialPrice = timeseries[0].close || 1;
    let peakEquity = capital;
    let maxDrawdown = 0;

    timeseries.forEach((p, idx) => {
        const date = p.time;
        const ts = p.timestamp;
        const close = p.close;
        if (!close) return;

        let buySignal = false;
        let sellSignal = false;
        let buyReason = '';
        let sellReason = '';

        if (strategy === 'quant') {
            let score = 0;
            if (p.superTrendDir === 1) score += 2; else score -= 2;
            if (p.macdHist > 0) score += 1; else if (p.macdHist < 0) score -= 1;
            if (p.rsi > 45) score += 1; else if (p.rsi < 40) score -= 1;
            if (p.sma20 && close > p.sma20) score += 1; else if (p.sma20 && close < p.sma20) score -= 1;
            if (p.stochK > p.stochD) score += 1; else if (p.stochK < p.stochD) score -= 1;

            if (score >= 2) { buySignal = true; buyReason = `Quant Bullish (Score +${score})`; }
            else if (score <= -1) { sellSignal = true; sellReason = `Quant Bearish (Score ${score})`; }
        } else if (strategy === 'supertrend') {
            if (p.superTrendDir === 1) { buySignal = true; buyReason = 'SuperTrend Uptrend Green'; }
            else { sellSignal = true; sellReason = 'SuperTrend Downtrend Red'; }
        } else if (strategy === 'momentum') {
            if ((p.macdHist || 0) > 0 && (p.rsi || 50) > 45) { buySignal = true; buyReason = `MACD Expansion + RSI (${(p.rsi || 50).toFixed(1)})`; }
            else if ((p.macdHist || 0) < 0 && (p.rsi || 50) < 50) { sellSignal = true; sellReason = 'MACD Contraction & Weak RSI'; }
        }

        if (position === 0 && buySignal) {
            const shares = capital / close;
            position = shares;
            entryPrice = close;
            entryDate = date;
            trades.push({
                id: trades.length + 1,
                action: 'BUY',
                date: date,
                timestamp: ts,
                price: close,
                shares: shares,
                capital: capital,
                reason: buyReason
            });
        } else if (position > 0 && sellSignal) {
            const exitPrice = close;
            const pnl = (exitPrice - entryPrice) * position;
            const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
            capital = position * exitPrice;

            const tradeRecord = {
                id: trades.length + 1,
                action: 'SELL',
                entryDate: entryDate,
                date: date,
                timestamp: ts,
                entryPrice: entryPrice,
                price: exitPrice,
                shares: position,
                pnl: pnl,
                pnlPct: pnlPct,
                capital: capital,
                reason: sellReason
            };
            trades.push(tradeRecord);
            closedTrades.push(tradeRecord);
            position = 0;
        }

        const currentEquity = position === 0 ? capital : position * close;
        const buyHoldEquity = initialCapital * (close / initialPrice);

        if (currentEquity > peakEquity) peakEquity = currentEquity;
        const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;

        equityCurve.push({
            date: date,
            timestamp: ts,
            strategyEquity: currentEquity,
            buyHoldEquity: buyHoldEquity,
            inMarket: position > 0
        });
    });

    const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].strategyEquity : capital;
    const finalBuyHold = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].buyHoldEquity : capital;
    const stratReturn = ((finalEquity - initialCapital) / initialCapital) * 100;
    const bhReturn = ((finalBuyHold - initialCapital) / initialCapital) * 100;

    const winningTrades = closedTrades.filter(t => t.pnl > 0);
    const losingTrades = closedTrades.filter(t => t.pnl <= 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    const grossProfit = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 1);

    return {
        strategy: strategy,
        initialCapital: initialCapital,
        finalEquity: finalEquity,
        strategyReturnPct: stratReturn,
        buyHoldReturnPct: bhReturn,
        alpha: stratReturn - bhReturn,
        maxDrawdownPct: maxDrawdown,
        totalTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRatePct: winRate,
        profitFactor: profitFactor,
        isCurrentlyHolding: position > 0,
        trades: trades,
        equityCurve: equityCurve
    };
}

// Dynamic On-Demand Script Loader for ApexCharts (Reduces Initial Payload by ~455 KiB)
let _apexChartsPromise = null;
function ensureApexChartsLoaded() {
    if (typeof ApexCharts !== 'undefined') {
        return Promise.resolve();
    }
    if (_apexChartsPromise) {
        return _apexChartsPromise;
    }
    _apexChartsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => {
            _apexChartsPromise = null;
            console.error('Failed to load ApexCharts dynamically:', err);
            reject(err);
        };
        document.head.appendChild(script);
    });
    return _apexChartsPromise;
}

function getChartThemeDefaults() {
    const isBright = state.theme === 'bright';
    return {
        themeMode: isBright ? 'light' : 'dark',
        gridBorderColor: isBright ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        labelColor: isBright ? '#475569' : '#94a3b8',
        axisBorderColor: isBright ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        tooltipTheme: isBright ? 'light' : 'dark'
    };
}

async function renderEquityChart(equityCurve) {
    if (!equityCurve || equityCurve.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#equityChartContainer");
    if (!container) return;

    if (state.charts.equity) {
        try { state.charts.equity.destroy(); } catch (e) { console.warn(e); }
        state.charts.equity = null;
    }
    container.innerHTML = '';

    const themeOpts = getChartThemeDefaults();

    const stratSeries = equityCurve.map(p => ({
        x: p.timestamp || new Date(p.date).getTime(),
        y: p.strategyEquity
    }));

    const bhSeries = equityCurve.map(p => ({
        x: p.timestamp || new Date(p.date).getTime(),
        y: p.buyHoldEquity
    }));

    const options = {
        series: [
            { name: 'Strategy Portfolio ($)', data: stratSeries },
            { name: 'Buy & Hold Benchmark ($)', data: bhSeries }
        ],
        chart: {
            id: 'equityCurveChart',
            type: 'line',
            height: 260,
            background: 'transparent',
            toolbar: { show: true, tools: { zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: ['#10b981', '#64748b'],
        stroke: { width: [3, 2], dashArray: [0, 4], curve: 'smooth' },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM \'yy', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            labels: { style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' }, formatter: val => `$${val ? val.toFixed(0) : ''}` }
        },
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: { theme: themeOpts.tooltipTheme, shared: true, x: { format: 'dd MMM yyyy' }, y: { formatter: val => `$${val ? val.toFixed(2) : ''}` } }
    };

    state.charts.equity = new ApexCharts(container, options);
    state.charts.equity.render();
}

function renderTradesTable(trades) {
    const tbody = document.getElementById('tradesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!trades || trades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">No trades generated for this strategy and timeframe.</td></tr>';
        return;
    }

    const stock = state.stocksData[state.activeTicker];
    const instCurr = stock?.profile?.currency || 'USD';
    const baseCurr = getUserBaseCurrency();

    trades.slice().reverse().forEach((t, i) => {
        const isBuy = t.action === 'BUY';
        const isProfit = (t.pnl || 0) >= 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="mono" style="color: var(--text-muted); font-size: 0.78rem;">#${t.id || (trades.length - i)}</td>
            <td>
                <span class="badge-pill ${isBuy ? 'badge-bullish' : 'badge-bearish'}">
                    ${isBuy ? 'BUY / OPEN' : 'SELL / CLOSE'}
                </span>
            </td>
            <td class="mono" style="font-size: 0.8rem;">${t.date}</td>
            <td class="mono" style="font-weight: 700;">${t.price ? formatPrice(t.price, instCurr, baseCurr) : '--'}</td>
            <td class="mono" style="font-weight: 700; color: ${isBuy ? 'var(--text-muted)' : (isProfit ? 'var(--accent-green)' : 'var(--accent-red)')};">
                ${isBuy ? '--' : `${isProfit ? '+' : ''}${formatPrice(t.pnl, instCurr, baseCurr)}`}
            </td>
            <td class="mono" style="font-weight: 700; color: ${isBuy ? 'var(--text-muted)' : (isProfit ? 'var(--accent-green)' : 'var(--accent-red)')};">
                ${isBuy ? '--' : `${isProfit ? '+' : ''}${t.pnlPct.toFixed(2)}%`}
            </td>
            <td class="mono" style="font-weight: 700;">${t.capital ? formatPrice(t.capital, instCurr, baseCurr) : '--'}</td>
            <td style="font-size: 0.78rem; color: var(--text-secondary);">${t.reason || '--'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// -------------------------------------------------------------
// PRIMARY DYNAMIC CHART RENDERING (ApexCharts)
// -------------------------------------------------------------

async function renderPrimaryChart(timeseries) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#primaryChartContainer");
    if (!container) return;

    if (state.charts.primary) {
        try { state.charts.primary.destroy(); } catch (e) { console.warn(e); }
        state.charts.primary = null;
    }
    container.innerHTML = '';

    const isCandle = state.chartType === 'candlestick';
    const seriesData = [];
    const seriesColors = [];
    const strokeWidths = [];
    const strokeDashes = [];

    if (isCandle) {
        const validCandles = timeseries.filter(p => p.open !== null && p.high !== null && p.low !== null && p.close !== null);
        seriesData.push({
            name: 'Price (OHLC)',
            type: 'candlestick',
            data: validCandles.map(p => ({
                x: p.timestamp || new Date(p.time).getTime(),
                y: [p.open, p.high, p.low, p.close]
            }))
        });
        seriesColors.push('#10b981');
        strokeWidths.push(1);
        strokeDashes.push(0);
    } else {
        const validLine = timeseries.filter(p => p.close !== null);
        seriesData.push({
            name: 'Close Price',
            type: 'area',
            data: validLine.map(p => ({
                x: p.timestamp || new Date(p.time).getTime(),
                y: p.close
            }))
        });
        seriesColors.push('#3b82f6');
        strokeWidths.push(2.5);
        strokeDashes.push(0);
    }

    // 1. SuperTrend Overlay
    if (state.overlays.superTrend) {
        const stData = timeseries.filter(p => p.superTrend !== null).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.superTrend
        }));
        if (stData.length > 0) {
            seriesData.push({ name: 'SuperTrend', type: 'line', data: stData });
            seriesColors.push('#10b981');
            strokeWidths.push(2.5);
            strokeDashes.push(0);
        }
    }

    // 2. VWAP Overlay
    if (state.overlays.vwap) {
        const vwapData = timeseries.filter(p => p.vwap !== null).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.vwap
        }));
        if (vwapData.length > 0) {
            seriesData.push({ name: 'VWAP', type: 'line', data: vwapData });
            seriesColors.push('#8b5cf6');
            strokeWidths.push(2);
            strokeDashes.push(0);
        }
    }

    // 3. SMA 20 Overlay
    if (state.overlays.sma20) {
        const data = timeseries.filter(p => typeof p.sma20 === 'number' && !isNaN(p.sma20)).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.sma20
        }));
        if (data.length > 0) {
            seriesData.push({ name: 'SMA 20', type: 'line', data: data });
            seriesColors.push('#06b6d4');
            strokeWidths.push(2);
            strokeDashes.push(0);
        }
    }

    // 4. SMA 50 Overlay
    if (state.overlays.sma50) {
        const data = timeseries.filter(p => typeof p.sma50 === 'number' && !isNaN(p.sma50)).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.sma50
        }));
        if (data.length > 0) {
            seriesData.push({ name: 'SMA 50', type: 'line', data: data });
            seriesColors.push('#f59e0b');
            strokeWidths.push(2);
            strokeDashes.push(0);
        }
    }

    // 5. Bollinger Bands
    if (state.overlays.bb) {
        const upper = timeseries.filter(p => typeof p.bbUpper === 'number' && !isNaN(p.bbUpper)).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.bbUpper
        }));
        const lower = timeseries.filter(p => typeof p.bbLower === 'number' && !isNaN(p.bbLower)).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.bbLower
        }));
        if (upper.length > 0 && lower.length > 0) {
            seriesData.push({ name: 'Upper BB', type: 'line', data: upper });
            seriesColors.push('#38bdf8');
            strokeWidths.push(1.5);
            strokeDashes.push(4);

            seriesData.push({ name: 'Lower BB', type: 'line', data: lower });
            seriesColors.push('#38bdf8');
            strokeWidths.push(1.5);
            strokeDashes.push(4);
        }
    }

    // 6. Keltner Channels
    if (state.overlays.kc) {
        const kcUpper = timeseries.filter(p => typeof p.kcUpper === 'number' && !isNaN(p.kcUpper)).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.kcUpper
        }));
        const kcLower = timeseries.filter(p => typeof p.kcLower === 'number' && !isNaN(p.kcLower)).map(p => ({
            x: p.timestamp || new Date(p.time).getTime(),
            y: p.kcLower
        }));
        if (kcUpper.length > 0 && kcLower.length > 0) {
            seriesData.push({ name: 'Upper KC', type: 'line', data: kcUpper });
            seriesColors.push('#ec4899');
            strokeWidths.push(1.5);
            strokeDashes.push(2);

            seriesData.push({ name: 'Lower KC', type: 'line', data: kcLower });
            seriesColors.push('#ec4899');
            strokeWidths.push(1.5);
            strokeDashes.push(2);
        }
    }

    const themeOpts = getChartThemeDefaults();

    const options = {
        series: seriesData,
        chart: {
            id: 'primaryStockChart',
            type: 'line',
            height: 440,
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
                autoSelected: 'zoom'
            },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: seriesColors,
        stroke: {
            width: strokeWidths,
            dashArray: strokeDashes,
            curve: 'smooth'
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#10b981',
                    downward: '#ef4444'
                },
                wick: { useFillColor: true }
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' },
                datetimeFormatter: { year: 'yyyy', month: 'MMM \'yy', day: 'dd MMM' }
            },
            axisBorder: { color: themeOpts.axisBorderColor },
            axisTicks: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            labels: {
                style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' },
                formatter: val => typeof val === 'number' ? `$${val.toFixed(2)}` : ''
            },
            tooltip: { enabled: true }
        },
        grid: {
            borderColor: themeOpts.gridBorderColor,
            strokeDashArray: 3
        },
        tooltip: {
            theme: themeOpts.tooltipTheme,
            shared: true,
            x: { format: 'dd MMM yyyy' }
        }
    };

    state.charts.primary = new ApexCharts(container, options);
    state.charts.primary.render();
}

async function renderStochChart(timeseries) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#stochChartContainer");
    if (!container) return;

    if (state.charts.stoch) {
        try { state.charts.stoch.destroy(); } catch (e) { console.warn(e); }
        state.charts.stoch = null;
    }
    container.innerHTML = '';

    const themeOpts = getChartThemeDefaults();

    const stochK = timeseries.filter(p => typeof p.stochK === 'number' && !isNaN(p.stochK)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.stochK
    }));

    const stochD = timeseries.filter(p => typeof p.stochD === 'number' && !isNaN(p.stochD)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.stochD
    }));

    const latestK = stochK.length > 0 ? stochK[stochK.length - 1].y : 50;
    const latestD = stochD.length > 0 ? stochD[stochD.length - 1].y : 50;
    setText('currentStochLabel', `%K: ${typeof latestK === 'number' ? latestK.toFixed(1) : '--'} / %D: ${typeof latestD === 'number' ? latestD.toFixed(1) : '--'}`);

    const options = {
        series: [
            { name: '%K Line (14,3)', data: stochK },
            { name: '%D Line (3)', data: stochD }
        ],
        chart: {
            id: 'stochChart',
            type: 'line',
            height: 180,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: ['#06b6d4', '#f59e0b'],
        stroke: { width: [2, 2], curve: 'smooth' },
        annotations: {
            yaxis: [
                {
                    y: 80,
                    borderColor: '#ef4444',
                    strokeDashArray: 3,
                    label: { text: '80 Overbought', style: { color: '#ef4444', background: state.theme === 'bright' ? '#ffffff' : '#1e293b', fontSize: '10px' } }
                },
                {
                    y: 20,
                    borderColor: '#10b981',
                    strokeDashArray: 3,
                    label: { text: '20 Oversold', style: { color: '#10b981', background: state.theme === 'bright' ? '#ffffff' : '#1e293b', fontSize: '10px' } }
                }
            ]
        },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, formatter: val => typeof val === 'number' ? val.toFixed(0) : '' }
        },
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: { theme: themeOpts.tooltipTheme, shared: true, x: { format: 'dd MMM yyyy' } }
    };

    state.charts.stoch = new ApexCharts(container, options);
    state.charts.stoch.render();
}

async function renderRSIChart(timeseries) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#rsiChartContainer");
    if (!container) return;

    if (state.charts.rsi) {
        try { state.charts.rsi.destroy(); } catch (e) { console.warn(e); }
        state.charts.rsi = null;
    }
    container.innerHTML = '';

    const themeOpts = getChartThemeDefaults();

    const rsiData = timeseries.filter(p => typeof p.rsi === 'number' && !isNaN(p.rsi)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.rsi
    }));

    const latestRsi = rsiData.length > 0 ? rsiData[rsiData.length - 1].y : 50;
    setText('currentRsiLabel', `RSI: ${typeof latestRsi === 'number' ? latestRsi.toFixed(2) : '--'}`);

    const options = {
        series: [{ name: 'RSI (14)', data: rsiData }],
        chart: {
            id: 'rsiChart',
            type: 'line',
            height: 180,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: ['#a855f7'],
        stroke: { width: 2, curve: 'smooth' },
        annotations: {
            yaxis: [
                { y: 70, borderColor: '#ef4444', strokeDashArray: 3, label: { text: '70 Overbought', style: { color: '#ef4444', background: state.theme === 'bright' ? '#ffffff' : '#1e293b', fontSize: '10px' } } },
                { y: 30, borderColor: '#10b981', strokeDashArray: 3, label: { text: '30 Oversold', style: { color: '#10b981', background: state.theme === 'bright' ? '#ffffff' : '#1e293b', fontSize: '10px' } } }
            ]
        },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, formatter: val => typeof val === 'number' ? val.toFixed(0) : '' }
        },
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: { theme: themeOpts.tooltipTheme, x: { format: 'dd MMM yyyy' }, y: { formatter: val => typeof val === 'number' ? val.toFixed(2) : '' } }
    };

    state.charts.rsi = new ApexCharts(container, options);
    state.charts.rsi.render();
}

async function renderMACDChart(timeseries) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#macdChartContainer");
    if (!container) return;

    if (state.charts.macd) {
        try { state.charts.macd.destroy(); } catch (e) { console.warn(e); }
        state.charts.macd = null;
    }
    container.innerHTML = '';

    const themeOpts = getChartThemeDefaults();

    const macdLine = timeseries.filter(p => typeof p.macd === 'number' && !isNaN(p.macd)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.macd
    }));

    const signalLine = timeseries.filter(p => typeof p.macdSignal === 'number' && !isNaN(p.macdSignal)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.macdSignal
    }));

    const histData = timeseries.filter(p => typeof p.macdHist === 'number' && !isNaN(p.macdHist)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.macdHist
    }));

    const options = {
        series: [
            { name: 'MACD Line', type: 'line', data: macdLine },
            { name: 'Signal Line', type: 'line', data: signalLine },
            { name: 'Histogram', type: 'bar', data: histData }
        ],
        chart: {
            id: 'macdChart',
            type: 'line',
            height: 180,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: ['#3b82f6', '#f97316', '#10b981'],
        stroke: { width: [2, 2, 0], curve: 'smooth' },
        plotOptions: {
            bar: {
                columnWidth: '60%',
                colors: {
                    ranges: [
                        { from: -1000, to: 0, color: '#ef4444' },
                        { from: 0.0001, to: 1000, color: '#10b981' }
                    ]
                }
            }
        },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, formatter: val => typeof val === 'number' ? val.toFixed(2) : '0.00' }
        },
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: { theme: themeOpts.tooltipTheme, shared: true, x: { format: 'dd MMM yyyy' } }
    };

    state.charts.macd = new ApexCharts(container, options);
    state.charts.macd.render();
}

async function renderCMFChart(timeseries) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#cmfChartContainer");
    if (!container) return;

    if (state.charts.cmf) {
        try { state.charts.cmf.destroy(); } catch (e) { console.warn(e); }
        state.charts.cmf = null;
    }
    container.innerHTML = '';

    const themeOpts = getChartThemeDefaults();

    const cmfData = timeseries.filter(p => typeof p.cmf === 'number' && !isNaN(p.cmf)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.cmf
    }));

    const latestCmf = cmfData.length > 0 ? cmfData[cmfData.length - 1].y : 0;
    setText('currentCmfLabel', `CMF: ${typeof latestCmf === 'number' ? (latestCmf > 0 ? '+' : '') + latestCmf.toFixed(3) : 'N/A'}`);

    const options = {
        series: [{
            name: 'Chaikin Money Flow',
            type: 'bar',
            data: cmfData
        }],
        chart: {
            id: 'cmfChart',
            type: 'bar',
            height: 180,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        plotOptions: {
            bar: {
                columnWidth: '70%',
                colors: {
                    ranges: [
                        { from: -1, to: 0, color: '#ef4444' },
                        { from: 0.00001, to: 1, color: '#10b981' }
                    ]
                }
            }
        },
        annotations: {
            yaxis: [
                { y: 0.05, borderColor: '#10b981', strokeDashArray: 2, label: { text: '+0.05 Strong Inflow', style: { color: '#10b981', background: state.theme === 'bright' ? '#ffffff' : '#1e293b', fontSize: '9px' } } },
                { y: -0.05, borderColor: '#ef4444', strokeDashArray: 2, label: { text: '-0.05 Outflow', style: { color: '#ef4444', background: state.theme === 'bright' ? '#ffffff' : '#1e293b', fontSize: '9px' } } }
            ]
        },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            min: -0.5,
            max: 0.5,
            tickAmount: 4,
            labels: { style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' }, formatter: val => typeof val === 'number' ? val.toFixed(2) : '' }
        },
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: { theme: themeOpts.tooltipTheme, x: { format: 'dd MMM yyyy' }, y: { formatter: val => typeof val === 'number' ? val.toFixed(3) : '' } }
    };

    state.charts.cmf = new ApexCharts(container, options);
    state.charts.cmf.render();
}

function formatCompactNumber(number) {
    if (!number || isNaN(number)) return '--';
    if (number >= 1e12) return (number / 1e12).toFixed(2) + ' T';
    if (number >= 1e9) return (number / 1e9).toFixed(2) + ' B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + ' M';
    if (number >= 1e3) return (number / 1e3).toFixed(1) + ' K';
    return number.toLocaleString();
}

// =============================================================
// TOP-LEVEL NAVIGATION & MULTI-VIEW SWITCHER
// =============================================================
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
        if (!state.stocksData || Object.keys(state.stocksData).length === 0) {
            handleAnalyze();
        }
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    } else if (tabKey === 'watchlist') {
        renderWatchlist();
    } else if (tabKey === 'scanner') {
        if (state.scannerResults && state.scannerResults.opportunities) {
            renderScannerResults(state.scannerResults.opportunities);
        } else {
            handleRunScanner(false);
        }
    } else if (tabKey === 'notifications') {
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
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
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
    const cached = loadWatchlistLocalCache();
    if (cached && Object.keys(cached).length > 0) {
        state.watchlistData = cached;
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
        const data = await res.json();
        if (data.tickers && data.tickers.length > 0) {
            state.watchlistTickers = data.tickers;
            saveWatchlistTickersLocal(data.tickers);
        } else {
            state.watchlistTickers = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
        }
    } catch (e) {
        state.watchlistTickers = loadWatchlistTickersLocal() || ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
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
                // Merge fast-path data into state seamlessly
                Object.keys(fastData.stocks).forEach(tk => {
                    const existing = state.watchlistData[tk] || {};
                    state.watchlistData[tk] = {
                        ...existing,
                        ...fastData.stocks[tk],
                        // Preserve full timeseries / AI if existing
                        timeseries: existing.timeseries || fastData.stocks[tk].sparkline || [],
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
                state.watchlistData = fullData.stocks;
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
                        ⚠️ Error loading watchlist: ${err.message}.
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
    } catch (e) {}

    // Persist to user profile if logged in
    if (state.user) {
        state.user.watchlistViewMode = cleanMode;
        try {
            fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watchlistViewMode: cleanMode })
            }).catch(() => {});
        } catch (e) {}
    }

    renderWatchlist();
}

function renderWatchlist() {
    const cardsGrid = document.getElementById('watchlistCardsGrid');
    const tableWrapper = document.getElementById('watchlistTableWrapper');
    const countBadge = document.getElementById('topWatchlistCount');
    if (countBadge) countBadge.textContent = `${state.watchlistTickers.length} Stocks`;

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
}

function renderWatchlistTags() {
    // Lightweight count synchronization helper for backwards-compatibility
    const countBadge = document.getElementById('topWatchlistCount');
    if (countBadge) countBadge.textContent = `${state.watchlistTickers.length} Stocks`;
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

        const sparklineMini = generateTableSparkline(timeseries, isBullish);
        const synthHtml = formatTableSynthesis(ai, stock);

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
                <div style="display: flex; justify-content: center;">${sparklineMini}</div>
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
                    <span class="badge-pill ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}" style="font-size: 0.65rem; padding: 1px 6px;">${bias}</span>
                </div>
            </td>
            <td style="text-align: center;">
                ${synthHtml}
            </td>
            <td style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button type="button" class="btn-table-action" onclick="openStockDeepDive('${ticker}')" title="Deep-Dive Single Stock Analysis">
                        <i data-lucide="arrow-right-circle" style="width: 14px; height: 14px;"></i>
                        <span>Analyze</span>
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

async function openStockDeepDive(ticker) {
    if (!ticker) return;
    ticker = ticker.trim().toUpperCase();
    state.activeTicker = ticker;

    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput) tickerInput.value = ticker;

    // Switch to Terminal top tab
    switchTopTab('terminal');

    if (state.stocksData && state.stocksData[ticker] && !state.stocksData[ticker].error) {
        renderStockSelector([ticker]);
        renderActiveStock();
    } else if (state.watchlistData && state.watchlistData[ticker] && !state.watchlistData[ticker].error) {
        state.stocksData = { [ticker]: state.watchlistData[ticker] };
        renderStockSelector([ticker]);
        renderActiveStock();
    } else {
        await handleAnalyze();
    }

    // Scroll to dashboard content
    document.getElementById('dashboardContent')?.scrollIntoView({ behavior: 'smooth' });
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

// =============================================================
// ADD STOCK & COMPANY SEARCH MODAL CONTROLLER
// =============================================================

let stockSearchDebounceTimer = null;
let activeSearchAbortController = null;

let stockSearchModalMode = 'watchlist'; // 'watchlist' | 'deep-dive'

function openAddStockModal(mode = 'watchlist', initialQuery = '') {
    stockSearchModalMode = mode;
    const modal = document.getElementById('addStockModal');
    const input = document.getElementById('stockSearchModalInput');
    const clearBtn = document.getElementById('stockSearchClearBtn');
    const spinner = document.getElementById('stockSearchSpinner');
    const resultsList = document.getElementById('stockSearchResultsList');
    const titleEl = document.getElementById('stockSearchModalTitle');
    const subtitleEl = document.getElementById('stockSearchModalSubtitle');
    const iconEl = document.getElementById('stockSearchModalIcon');
    const footerNoteEl = document.getElementById('stockSearchModalFooterNote');

    if (!modal) return;

    if (mode === 'deep-dive') {
        if (titleEl) titleEl.textContent = 'Search Stock for Deep Dive';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol to analyze in Deep-Dive terminal';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="sparkles" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Select any exchange listing to load full technical and AI analysis in the Deep-Dive terminal.';
    } else {
        if (titleEl) titleEl.textContent = 'Add Stock to Watchlist';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol with exchange disambiguation';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="plus-circle" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Added stocks immediately sync to your personalized profile and compute quantitative indicators.';
    }

    // Reset input state
    if (input) input.value = initialQuery || '';
    if (clearBtn) clearBtn.style.display = initialQuery ? 'flex' : 'none';
    if (spinner) spinner.style.display = 'none';

    // Show initial empty prompt or trigger search
    if (initialQuery) {
        handleStockSearchInput(initialQuery);
    } else if (resultsList) {
        resultsList.innerHTML = `
            <div class="stock-search-empty-state">
                <div class="stock-search-empty-icon">
                    <i data-lucide="search" style="width: 32px; height: 32px; color: var(--text-muted);"></i>
                </div>
                <div class="stock-search-empty-text">Type a company name or ticker symbol to begin searching</div>
                <div class="stock-search-empty-subtext">If multiple listings or international exchanges exist (e.g. Frankfurt, XETRA, NASDAQ), all matching options will be presented for disambiguation.</div>
            </div>
        `;
    }

    modal.style.display = 'flex';
    setTimeout(() => {
        input?.focus();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function closeAddStockModal() {
    const modal = document.getElementById('addStockModal');
    if (modal) modal.style.display = 'none';
    if (activeSearchAbortController) {
        activeSearchAbortController.abort();
        activeSearchAbortController = null;
    }
}

function clearStockSearchInput() {
    const input = document.getElementById('stockSearchModalInput');
    const clearBtn = document.getElementById('stockSearchClearBtn');
    const spinner = document.getElementById('stockSearchSpinner');
    const resultsList = document.getElementById('stockSearchResultsList');

    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (spinner) spinner.style.display = 'none';

    if (resultsList) {
        resultsList.innerHTML = `
            <div class="stock-search-empty-state">
                <div class="stock-search-empty-icon">
                    <i data-lucide="search" style="width: 32px; height: 32px; color: var(--text-muted);"></i>
                </div>
                <div class="stock-search-empty-text">Type a company name or ticker symbol to begin searching</div>
                <div class="stock-search-empty-subtext">If multiple listings or international exchanges exist (e.g. Frankfurt, XETRA, NASDAQ), all matching options will be presented for disambiguation.</div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function setStockSearchQuery(query) {
    const input = document.getElementById('stockSearchModalInput');
    if (input) {
        input.value = query;
        handleStockSearchInput(query);
    }
}

function handleStockSearchInput(query) {
    const clearBtn = document.getElementById('stockSearchClearBtn');
    const clean = String(query || '').trim();

    if (clearBtn) {
        clearBtn.style.display = clean.length > 0 ? 'flex' : 'none';
    }

    if (stockSearchDebounceTimer) {
        clearTimeout(stockSearchDebounceTimer);
    }

    if (!clean) {
        clearStockSearchInput();
        return;
    }

    stockSearchDebounceTimer = setTimeout(() => {
        performStockSearch(clean);
    }, 250);
}

async function performStockSearch(query) {
    const spinner = document.getElementById('stockSearchSpinner');
    const resultsList = document.getElementById('stockSearchResultsList');
    if (!resultsList) return;

    if (spinner) spinner.style.display = 'flex';

    if (activeSearchAbortController) {
        activeSearchAbortController.abort();
    }
    activeSearchAbortController = new AbortController();

    // Batch resolution for multiple comma-separated companies/tickers
    if (query.includes(',')) {
        try {
            const batchResp = await fetch('/api/stocks/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query }),
                signal: activeSearchAbortController.signal
            });
            if (batchResp.ok) {
                const batchData = await batchResp.json();
                const resolved = batchData.resolved || [];
                if (resolved.length > 0) {
                    const unadded = resolved.filter(r => !state.watchlistTickers.includes(r.ticker));
                    const batchHeaderHtml = (stockSearchModalMode === 'watchlist' && unadded.length > 1) ? `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: var(--radius-sm); margin-bottom: 8px;">
                            <span style="font-size: 0.82rem; font-weight: 600; color: var(--accent-cyan);">${resolved.length} stocks resolved</span>
                            <button type="button" class="btn-stock-search-add" onclick="handleAddBatchStocksModal(${JSON.stringify(unadded.map(u => u.ticker)).replace(/"/g, '&quot;')})">
                                <i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i>
                                <span>Add All (${unadded.length})</span>
                            </button>
                        </div>
                    ` : '';

                    resultsList.innerHTML = batchHeaderHtml + resolved.map(item => {
                        const ticker = escapeHtml(item.ticker);
                        const name = escapeHtml(item.name || item.ticker);
                        const exchange = escapeHtml(item.exchange || 'Global');
                        const type = escapeHtml(item.type || 'EQUITY');
                        const isTracked = state.watchlistTickers.includes(item.ticker);

                        if (stockSearchModalMode === 'deep-dive') {
                            return `
                                <div class="stock-search-item" onclick="handleOpenDeepDiveFromModal('${ticker}')" style="cursor: pointer;">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">${name}</div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleOpenDeepDiveFromModal('${ticker}')">
                                            <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
                                            <span>Open Deep Dive</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }

                        return `
                            <div class="stock-search-item">
                                <div class="stock-search-item-left">
                                    <div class="stock-search-ticker-badge">${ticker}</div>
                                    <div class="stock-search-details">
                                        <div class="stock-search-company-name" title="${name}">${name}</div>
                                        <div class="stock-search-meta-row">
                                            <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                            <span class="stock-search-tag type">${type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    ${isTracked ? `
                                        <button type="button" class="btn-stock-search-add added" disabled>
                                            <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                            <span>In Watchlist</span>
                                        </button>
                                    ` : `
                                        <button type="button" class="btn-stock-search-add" onclick="handleAddStockFromModal('${ticker}', this)">
                                            <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                            <span>Add</span>
                                        </button>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('');
                    if (spinner) spinner.style.display = 'none';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    return;
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=15`, {
            signal: activeSearchAbortController.signal
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const results = data.results || [];

        if (results.length === 0) {
            resultsList.innerHTML = `
                <div class="stock-search-empty-state">
                    <div class="stock-search-empty-icon">
                        <i data-lucide="alert-circle" style="width: 30px; height: 30px; color: var(--accent-amber);"></i>
                    </div>
                    <div class="stock-search-empty-text">No stocks found for "${escapeHtml(query)}"</div>
                    <div class="stock-search-empty-subtext">Try searching by exact ticker symbol (e.g. <code>NVDA</code>, <code>SAP.DE</code>) or full company name.</div>
                </div>
            `;
        } else {
            resultsList.innerHTML = results.map(item => {
                const ticker = escapeHtml(item.ticker);
                const name = escapeHtml(item.name || item.ticker);
                const exchange = escapeHtml(item.exchange || 'Global');
                const type = escapeHtml(item.type || 'EQUITY');
                const sector = item.sector ? escapeHtml(item.sector) : '';
                const isTracked = state.watchlistTickers.includes(item.ticker);

                if (stockSearchModalMode === 'deep-dive') {
                    return `
                        <div class="stock-search-item" onclick="handleOpenDeepDiveFromModal('${ticker}')" style="cursor: pointer;">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge">${ticker}</div>
                                <div class="stock-search-details">
                                    <div class="stock-search-company-name" title="${name}">${name}</div>
                                    <div class="stock-search-meta-row">
                                        <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                        <span class="stock-search-tag type">${type}</span>
                                        ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleOpenDeepDiveFromModal('${ticker}')">
                                    <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
                                    <span>Open Deep Dive</span>
                                </button>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="stock-search-item">
                        <div class="stock-search-item-left">
                            <div class="stock-search-ticker-badge">${ticker}</div>
                            <div class="stock-search-details">
                                <div class="stock-search-company-name" title="${name}">${name}</div>
                                <div class="stock-search-meta-row">
                                    <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                    <span class="stock-search-tag type">${type}</span>
                                    ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div>
                            ${isTracked ? `
                                <button type="button" class="btn-stock-search-add added" disabled>
                                    <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                    <span>In Watchlist</span>
                                </button>
                            ` : `
                                <button type="button" class="btn-stock-search-add" onclick="handleAddStockFromModal('${ticker}', this)">
                                    <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                    <span>Add</span>
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        resultsList.innerHTML = `
            <div class="stock-search-empty-state">
                <div class="stock-search-empty-icon">
                    <i data-lucide="wifi-off" style="width: 30px; height: 30px; color: #ef4444;"></i>
                </div>
                <div class="stock-search-empty-text">Search failed</div>
                <div class="stock-search-empty-subtext">${escapeHtml(err.message || 'Unable to connect to search service.')}</div>
            </div>
        `;
    } finally {
        if (spinner) spinner.style.display = 'none';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

async function handleAddStockFromModal(ticker, btnElement) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();

    if (!state.watchlistTickers.includes(cleanTicker)) {
        state.watchlistTickers.push(cleanTicker);

        if (btnElement) {
            btnElement.classList.add('added');
            btnElement.disabled = true;
            btnElement.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i><span>In Watchlist</span>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        renderWatchlistTags();
        await saveWatchlistServer();
        await fetchWatchlistAnalysis();
    }
}

async function handleOpenDeepDiveFromModal(ticker) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    closeAddStockModal();
    
    // Set input
    const input = document.getElementById('tickerInput');
    if (input) input.value = cleanTicker;
    
    // Switch to deep dive tab if needed
    if (state.activeTopTab !== 'terminal') {
        switchTopTab('terminal');
    }
    
    await handleAnalyze();
}

// =============================================================
// DEEP DIVE LIVE AUTOCOMPLETE & SEARCH DROPDOWN CONTROLLER
// =============================================================

let deepDiveSearchDebounceTimer = null;
let deepDiveActiveAbortController = null;
let deepDiveSelectedIndex = -1;
let deepDiveCurrentResults = [];

function getActiveDeepDiveToken(fullInput) {
    if (!fullInput) return '';
    const parts = fullInput.split(',');
    return parts[parts.length - 1].trim();
}

function handleDeepDiveSearchFocus() {
    const inputVal = document.getElementById('tickerInput')?.value || '';
    const cleanToken = getActiveDeepDiveToken(inputVal);
    if (cleanToken.length >= 2) {
        handleDeepDiveSearchInput(inputVal);
    }
}

function handleDeepDiveSearchInput(fullValue) {
    const clearBtn = document.getElementById('tickerInputClearBtn');
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const spinner = document.getElementById('deepDiveSearchSpinner');

    if (clearBtn) {
        clearBtn.style.display = fullValue.trim().length > 0 ? 'flex' : 'none';
    }

    const token = getActiveDeepDiveToken(fullValue);

    if (deepDiveSearchDebounceTimer) {
        clearTimeout(deepDiveSearchDebounceTimer);
    }

    if (!token || token.length < 1) {
        if (dropdown) dropdown.style.display = 'none';
        if (spinner) spinner.style.display = 'none';
        deepDiveSelectedIndex = -1;
        deepDiveCurrentResults = [];
        return;
    }

    deepDiveSearchDebounceTimer = setTimeout(() => {
        performDeepDiveInlineSearch(token);
    }, 220);
}

async function performDeepDiveInlineSearch(token) {
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const resultsList = document.getElementById('deepDiveSearchResultsList');
    const spinner = document.getElementById('deepDiveSearchSpinner');

    if (!resultsList || !dropdown) return;

    if (spinner) spinner.style.display = 'flex';

    if (deepDiveActiveAbortController) {
        deepDiveActiveAbortController.abort();
    }
    deepDiveActiveAbortController = new AbortController();

    try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(token)}&limit=10`, {
            signal: deepDiveActiveAbortController.signal
        });

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const results = data.results || [];
        deepDiveCurrentResults = results;
        deepDiveSelectedIndex = -1;

        if (results.length === 0) {
            resultsList.innerHTML = `
                <div style="padding: 16px 12px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
                    No matching companies or tickers found for "<strong>${escapeHtml(token)}</strong>".
                </div>
            `;
        } else {
            resultsList.innerHTML = results.map((item, idx) => {
                const ticker = escapeHtml(item.ticker);
                const name = escapeHtml(item.name || item.ticker);
                const exchange = escapeHtml(item.exchange || 'Global');
                const type = escapeHtml(item.type || 'EQUITY');
                const sector = item.sector ? escapeHtml(item.sector) : '';

                return `
                    <div class="deep-dive-result-item" data-index="${idx}" onmouseenter="deepDiveSetHoverIndex(${idx})" onclick="selectDeepDiveStock('${ticker}', event)">
                        <div class="deep-dive-result-item-left">
                            <div class="stock-search-ticker-badge">${ticker}</div>
                            <div class="deep-dive-result-details">
                                <div class="deep-dive-result-name" title="${name}">${name}</div>
                                <div class="deep-dive-result-meta">
                                    <span class="stock-search-tag exchange">${exchange}</span>
                                    <span class="stock-search-tag type">${type}</span>
                                    ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <button type="button" class="deep-dive-result-btn" onclick="event.stopPropagation(); selectDeepDiveStock('${ticker}', event)">
                            <i data-lucide="sparkles" style="width: 12px; height: 12px;"></i>
                            <span>Analyze</span>
                        </button>
                    </div>
                `;
            }).join('');
        }

        dropdown.style.display = 'flex';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        if (err.name === 'AbortError') return;
        resultsList.innerHTML = `
            <div style="padding: 14px; text-align: center; color: var(--accent-red); font-size: 0.8rem;">
                Search error: ${escapeHtml(err.message)}
            </div>
        `;
        dropdown.style.display = 'flex';
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

function deepDiveSetHoverIndex(idx) {
    deepDiveSelectedIndex = idx;
    updateDeepDiveSelectedHighlight();
}

function updateDeepDiveSelectedHighlight() {
    const items = document.querySelectorAll('#deepDiveSearchResultsList .deep-dive-result-item');
    items.forEach((el, idx) => {
        el.classList.toggle('is-selected', idx === deepDiveSelectedIndex);
        if (idx === deepDiveSelectedIndex) {
            el.scrollIntoView({ block: 'nearest' });
        }
    });
}

function handleDeepDiveSearchKeyDown(event) {
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const isVisible = dropdown && dropdown.style.display !== 'none';

    if (event.key === 'ArrowDown') {
        if (isVisible && deepDiveCurrentResults.length > 0) {
            event.preventDefault();
            deepDiveSelectedIndex = (deepDiveSelectedIndex + 1) % deepDiveCurrentResults.length;
            updateDeepDiveSelectedHighlight();
        }
    } else if (event.key === 'ArrowUp') {
        if (isVisible && deepDiveCurrentResults.length > 0) {
            event.preventDefault();
            deepDiveSelectedIndex = (deepDiveSelectedIndex - 1 + deepDiveCurrentResults.length) % deepDiveCurrentResults.length;
            updateDeepDiveSelectedHighlight();
        }
    } else if (event.key === 'Enter') {
        if (isVisible && deepDiveSelectedIndex >= 0 && deepDiveSelectedIndex < deepDiveCurrentResults.length) {
            event.preventDefault();
            const item = deepDiveCurrentResults[deepDiveSelectedIndex];
            selectDeepDiveStock(item.ticker);
        } else {
            // Dismiss suggestions dropdown immediately on Enter
            if (dropdown) dropdown.style.display = 'none';
            deepDiveSelectedIndex = -1;
            if (deepDiveSearchDebounceTimer) {
                clearTimeout(deepDiveSearchDebounceTimer);
                deepDiveSearchDebounceTimer = null;
            }
            if (deepDiveActiveAbortController) {
                deepDiveActiveAbortController.abort();
                deepDiveActiveAbortController = null;
            }
        }
    } else if (event.key === 'Escape') {
        if (dropdown) dropdown.style.display = 'none';
        deepDiveSelectedIndex = -1;
    }
}

async function handleAddBatchStocksModal(tickersList) {
    if (!Array.isArray(tickersList) || tickersList.length === 0) return;
    let addedAny = false;
    for (const tk of tickersList) {
        const cleanTicker = String(tk || '').trim().toUpperCase();
        if (cleanTicker && !state.watchlistTickers.includes(cleanTicker)) {
            state.watchlistTickers.push(cleanTicker);
            addedAny = true;
        }
    }
    if (addedAny) {
        renderWatchlistTags();
        await saveWatchlistServer();
        await fetchWatchlistAnalysis();
        closeAddStockModal();
    }
}

function selectDeepDiveStock(ticker, event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';
    deepDiveSelectedIndex = -1;

    const input = document.getElementById('tickerInput');
    if (!input) return;

    const fullVal = input.value || '';
    const parts = fullVal.split(',');
    if (parts.length > 1) {
        parts[parts.length - 1] = ' ' + ticker;
        input.value = parts.join(',').trim() + ', ';
        input.focus();
    } else {
        input.value = ticker;
        handleAnalyze();
    }
}

function clearDeepDiveSearchInput() {
    const input = document.getElementById('tickerInput');
    const clearBtn = document.getElementById('tickerInputClearBtn');
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    const spinner = document.getElementById('deepDiveSearchSpinner');

    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (spinner) spinner.style.display = 'none';
    if (dropdown) dropdown.style.display = 'none';
}

async function handleAddWatchlistTicker() {
    // Legacy fallback wrapper
    openAddStockModal();
}

async function refreshWatchlistData() {
    await fetchWatchlistAnalysis(true);
}

// =============================================================
// AI QUANTITATIVE STOCK SCANNER & OPPORTUNITY DISCOVERY
// =============================================================

async function initScanner() {
    try {
        state.scannerViewMode = localStorage.getItem('findashiq_scanner_view') || 'cards';
        let cached = null;
        const cachedRaw = localStorage.getItem('findashiq_scanner_cache');
        if (cachedRaw) {
            try {
                cached = JSON.parse(cachedRaw);
            } catch (e) { }
        }

        // If local cache is empty, attempt to fetch server disk cache from /api/scanner/cached
        if (!cached || !cached.results || !cached.results.opportunities || cached.results.opportunities.length === 0) {
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
            } catch (e) { }
        }

        if (cached && cached.results && cached.results.opportunities) {
            state.scannerResults = cached.results;

            // Restore form criteria if saved
            if (cached.criteria) {
                const c = cached.criteria;
                const sec = document.getElementById('scannerSelectSector');
                const thm = document.getElementById('scannerSelectTheme');
                const cap = document.getElementById('scannerSelectMarketCap');
                const cnv = document.getElementById('scannerSelectMinConviction');
                if (sec && c.sector) sec.value = c.sector;
                if (thm && c.theme) thm.value = c.theme;
                if (cap && c.marketCap) cap.value = c.marketCap;
                if (cnv && c.minConviction) cnv.value = c.minConviction;
            }

            // Update summary metrics instantly
            const statUni = document.getElementById('scanStatUniverse');
            const statOpp = document.getElementById('scanStatOpportunities');
            const statConv = document.getElementById('scanStatTopConviction');
            const statTimestamp = document.getElementById('scanStatTimestamp');
            const topBadge = document.getElementById('topScannerBadge');

            const opps = cached.results.opportunities || [];
            if (statUni) statUni.textContent = `${cached.results.totalUniverseScanned || 35} Assets`;
            if (statOpp) statOpp.textContent = `${opps.length} Found`;
            if (statConv) statConv.textContent = opps.length > 0 ? `${opps[0].convictionScore}%` : '--%';

            const ageMinutes = Math.floor((Date.now() - (cached.timestamp || Date.now())) / 60000);
            const timeText = ageMinutes <= 1 ? 'Just now' : (ageMinutes < 60 ? `${ageMinutes}m ago` : `${Math.floor(ageMinutes / 60)}h ago`);
            if (statTimestamp) statTimestamp.textContent = `Cached (${timeText})`;
            if (topBadge) topBadge.textContent = `${opps.length} Setups`;

            renderScannerResults(opps);
        }
    } catch (e) {
        console.warn('Error restoring scanner cache:', e);
    }
}

async function handleRunScanner(forceRefresh = false) {
    const btn = document.getElementById('btnRunScanner');
    const btnForce = document.getElementById('btnForceScannerRefresh');
    const resultsGrid = document.getElementById('scannerResultsGrid');

    const sector = document.getElementById('scannerSelectSector')?.value || 'all';
    const theme = document.getElementById('scannerSelectTheme')?.value || 'all';
    const marketCap = document.getElementById('scannerSelectMarketCap')?.value || 'all';
    const minConviction = parseInt(document.getElementById('scannerSelectMinConviction')?.value || '50', 10);
    const excludeWatchlist = document.getElementById('scanCheckExcludeWatchlist')?.checked ?? true;

    const requiredIndicators = [];
    if (document.getElementById('scanCheckSuperTrend')?.checked) requiredIndicators.push('supertrend_bullish');
    if (document.getElementById('scanCheckRSI')?.checked) requiredIndicators.push('rsi_oversold_bounce');
    if (document.getElementById('scanCheckCMF')?.checked) requiredIndicators.push('cmf_accumulation');
    if (document.getElementById('scanCheckVWAP')?.checked) requiredIndicators.push('price_above_vwap');
    if (document.getElementById('scanCheckMACD')?.checked) requiredIndicators.push('macd_bullish');

    if (forceRefresh) {
        if (btnForce) {
            btnForce.disabled = true;
            btnForce.innerHTML = `<div class="spinner" style="width: 12px; height: 12px; border-width: 2px; margin-right: 4px;"></div> <span>Updating...</span>`;
        }
    } else {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<div class="spinner" style="width: 14px; height: 14px; border-width: 2px; margin-right: 4px;"></div> <span>Scanning...</span>`;
        }
    }

    if (resultsGrid) {
        resultsGrid.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-muted);">
                <div class="spinner" style="margin: 0 auto 16px auto;"></div>
                <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Scanning Thematic &amp; Ecological Markets...</div>
                <div style="font-size: 0.82rem; margin-top: 6px; color: var(--text-secondary);">
                    Executing multi-factor indicator validation, CMF capital flow checks, and AI Buy target generation...
                </div>
            </div>
        `;
    }

    try {
        const res = await fetch('/api/scanner/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sector,
                theme,
                marketCap,
                minConviction,
                excludeWatchlist,
                requiredIndicators,
                forceRefresh
            })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to execute market scan.');
        }

        state.scannerResults = data;

        // Persist to localStorage for instant 0ms restoration on future page loads
        try {
            localStorage.setItem('findashiq_scanner_cache', JSON.stringify({
                timestamp: Date.now(),
                results: data,
                criteria: { sector, theme, marketCap, minConviction }
            }));
        } catch (e) { }

        // Update stats
        const statUni = document.getElementById('scanStatUniverse');
        const statOpp = document.getElementById('scanStatOpportunities');
        const statConv = document.getElementById('scanStatTopConviction');
        const statTimestamp = document.getElementById('scanStatTimestamp');
        const topBadge = document.getElementById('topScannerBadge');

        const opps = data.opportunities || [];
        if (statUni) statUni.textContent = `${data.totalUniverseScanned || 0} Assets`;
        if (statOpp) statOpp.textContent = `${opps.length} Found`;
        if (statConv) statConv.textContent = opps.length > 0 ? `${opps[0].convictionScore}%` : '--%';
        if (statTimestamp) statTimestamp.textContent = 'Cached (Just now)';
        if (topBadge) topBadge.textContent = `${opps.length} Setups`;

        renderScannerResults(opps);

    } catch (err) {
        console.error('Scanner error:', err);
        if (resultsGrid) {
            resultsGrid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--accent-red);">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">⚠️</div>
                    <div style="font-weight: 700;">Scanner Error</div>
                    <div style="font-size: 0.82rem; margin-top: 4px; color: var(--text-secondary);">${err.message || 'Failed to complete market scan.'}</div>
                </div>
            `;
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="sparkles" style="width: 17px; height: 17px;"></i> <span>Run Scan</span>`;
        }
        if (btnForce) {
            btnForce.disabled = false;
            btnForce.innerHTML = `<i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> <span>Force Update</span>`;
        }
        lucide.createIcons();
    }
}

function applyScannerPreset(presetKey) {
    document.querySelectorAll('.scanner-preset-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('onclick')?.includes(`'${presetKey}'`));
    });

    const sec = document.getElementById('scannerSelectSector');
    const thm = document.getElementById('scannerSelectTheme');
    const cnv = document.getElementById('scannerSelectMinConviction');
    const cap = document.getElementById('scannerSelectMarketCap');
    const chkSt = document.getElementById('scanCheckSuperTrend');
    const chkRsi = document.getElementById('scanCheckRSI');
    const chkCmf = document.getElementById('scanCheckCMF');
    const chkVwap = document.getElementById('scanCheckVWAP');
    const chkMacd = document.getElementById('scanCheckMACD');

    if (chkSt) chkSt.checked = false;
    if (chkRsi) chkRsi.checked = false;
    if (chkCmf) chkCmf.checked = false;
    if (chkVwap) chkVwap.checked = false;
    if (chkMacd) chkMacd.checked = false;
    if (cap) cap.value = 'all';

    if (presetKey === 'eco') {
        if (thm) thm.value = 'eco_esg';
        if (sec) sec.value = 'all';
        if (cnv) cnv.value = '50';
    } else if (presetKey === 'ai') {
        if (thm) thm.value = 'ai_deeptech';
        if (sec) sec.value = 'all';
        if (cnv) cnv.value = '50';
    } else if (presetKey === 'cmf') {
        if (thm) thm.value = 'all';
        if (sec) sec.value = 'all';
        if (chkCmf) chkCmf.checked = true;
        if (cnv) cnv.value = '50';
    } else if (presetKey === 'supertrend') {
        if (thm) thm.value = 'all';
        if (sec) sec.value = 'all';
        if (chkSt) chkSt.checked = true;
        if (cnv) cnv.value = '50';
    } else if (presetKey === 'dip') {
        if (thm) thm.value = 'all';
        if (sec) sec.value = 'all';
        if (chkRsi) chkRsi.checked = true;
        if (cnv) cnv.value = '50';
    } else {
        if (thm) thm.value = 'all';
        if (sec) sec.value = 'all';
        if (cnv) cnv.value = '50';
    }

    handleRunScanner(false);
}

function setScannerViewMode(mode) {
    const cleanMode = (mode === 'table') ? 'table' : 'cards';
    state.scannerViewMode = cleanMode;
    try {
        localStorage.setItem('findashiq_scanner_view', cleanMode);
    } catch (e) {}

    const btnCards = document.getElementById('btnScannerViewCards');
    const btnTable = document.getElementById('btnScannerViewTable');
    if (btnCards && btnTable) {
        btnCards.classList.toggle('active', cleanMode === 'cards');
        btnTable.classList.toggle('active', cleanMode === 'table');
    }

    const oppList = state.scannerResults?.opportunities || [];
    renderScannerResults(oppList);
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
        document.querySelectorAll('.scanner-table-row').forEach(r => {
            r.classList.remove('is-table-dragging', 'drag-over-top', 'drag-over-bottom');
        });
        scannerDragState.draggedTicker = null;
        scannerDragState.draggedType = null;
    });
}

function reorderScannerOpportunities(draggedTicker, targetTicker, isAfter) {
    if (!draggedTicker || !targetTicker || draggedTicker === targetTicker) return;
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
    } catch (e) {}

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
    if (btnCards && btnTable) {
        btnCards.classList.toggle('active', viewMode === 'cards');
        btnTable.classList.toggle('active', viewMode === 'table');
    }
    if (subBadge) {
        subBadge.textContent = `${oppList.length} Setups`;
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

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderScannerCards(oppList) {
    const grid = document.getElementById('scannerResultsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!oppList || oppList.length === 0) {
        grid.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; color: var(--text-muted);">
                <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
                <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">No Opportunities Matched Current Filters</div>
                <div style="font-size: 0.82rem; margin-top: 4px; color: var(--text-secondary); max-width: 480px; margin: 6px auto 16px auto;">
                    Try lowering the Minimum AI Conviction threshold, clearing specific technical signal requirements, or unchecking "Exclude Watchlist".
                </div>
            </div>
        `;
        return;
    }

    oppList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'scanner-card';
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
                    </div>
                    <div class="scanner-card-name" title="${compName}">${compName}</div>
                </div>

                <div class="scanner-card-badges">
                    <span class="badge-pill badge-neutral" style="font-size: 0.68rem; padding: 2px 6px;">
                        ${item.sector || 'Equities'}
                    </span>
                    ${item.ecoBadge ? `
                    <span class="badge-pill" style="font-size: 0.66rem; padding: 1px 6px; background: rgba(16, 185, 129, 0.12); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.25);">
                        ${item.ecoBadge}
                    </span>` : ''}
                </div>
            </div>

            <!-- Price & Sparkline Area -->
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

            <!-- AI Thesis & ESG Catalyst -->
            <div class="scanner-thesis-box">
                <div style="font-weight: 700; font-size: 0.72rem; color: var(--accent-green); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="brain" style="width: 12px; height: 12px;"></i>
                    <span>AI Thesis &amp; Preference Match</span>
                </div>
                <div>${item.aiThesis}</div>
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
                        <span>+ Add to Watchlist</span>
                    </button>
                `}

                <button type="button" class="btn-scanner-deepdive" onclick="openStockDeepDive('${item.ticker}')">
                    <i data-lucide="search" style="width: 13px; height: 13px;"></i>
                    <span>Deep-Dive &rarr;</span>
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
        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 48px; color: var(--text-muted);">
                    <div style="font-size: 1.8rem; margin-bottom: 8px;">🔍</div>
                    <div style="font-weight: 700; color: var(--text-primary);">No Opportunities Matched Current Filters</div>
                    <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">
                        Try adjusting your scanner filter criteria or running a fresh scan.
                    </div>
                </td>
            </tr>
        `;
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
        const sparklineMini = generateTableSparkline(item.timeseries || [], isBullish);

        tr.innerHTML = `
            <td class="col-sticky-drag" style="width: 32px; padding: 12px 4px 12px 12px; text-align: center;">
                <div class="table-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                    <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                </div>
            </td>
            <td class="col-sticky-asset">
                <div style="display: flex; flex-direction: column; gap: 1px; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span class="watchlist-table-ticker">${item.ticker}</span>
                        ${item.ecoBadge ? `<span class="badge-pill" style="font-size: 0.65rem; padding: 1px 5px; background: rgba(16, 185, 129, 0.12); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.25);">${item.ecoBadge}</span>` : ''}
                    </div>
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
                <div style="display: flex; justify-content: center;">${sparklineMini}</div>
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
                <span class="mono" style="font-size: 0.82rem; color: var(--text-secondary);">${vwapDisplay}</span>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                    <span class="mono" style="font-weight: 800; font-size: 0.88rem; color: ${item.stanceColor || 'var(--accent-green)'};">${item.convictionScore ?? 50}%</span>
                    <span class="badge-pill ${item.badgeClass || 'badge-neutral'}" style="font-size: 0.65rem; padding: 1px 6px;">${item.directionalBias || 'Neutral'}</span>
                </div>
            </td>
            <td style="font-size: 0.75rem;">
                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 170px;">
                    <div><span style="color: var(--text-muted);">Entry:</span> <strong class="mono" style="color: var(--text-primary);">${matrixEntry}</strong></div>
                    <div style="display: flex; gap: 8px; font-size: 0.72rem;">
                        <span style="color: var(--accent-red);">SL: ${matrixStop}</span>
                        <span style="color: var(--accent-green);">TP: ${matrixTP1}</span>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700;">R/R: ${matrix.riskRewardRatio || '2.5:1'}</div>
                </div>
            </td>
            <td style="font-size: 0.75rem; color: var(--text-secondary); max-width: 220px;">
                <div style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.35;" title="${escapeHtml(item.aiThesis || '')}">
                    ${item.aiThesis || '--'}
                </div>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button type="button" class="btn-table-action" onclick="openStockDeepDive('${item.ticker}')" title="Deep-Dive Single Stock Analysis">
                        <i data-lucide="arrow-right-circle" style="width: 14px; height: 14px;"></i>
                        <span>Analyze</span>
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

    if (!state.watchlistTickers.includes(ticker)) {
        state.watchlistTickers.push(ticker);
        renderWatchlistTags();
        await saveWatchlistServer();
        // Background fetch data for new stock
        fetchWatchlistAnalysis(false);
    }

    if (btn) {
        btn.classList.add('in-watchlist');
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> <span>In Watchlist</span>`;
        lucide.createIcons();
    }

    const badge = document.getElementById('topWatchlistCount');
    if (badge) badge.textContent = `${state.watchlistTickers.length} Stocks`;
}

// -------------------------------------------------------------
// SIGNAL ALERTS & NOTIFICATIONS HUB
// -------------------------------------------------------------
async function initAlerts() {
    try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        state.alerts = data.alerts || [];
    } catch (e) {
        state.alerts = [];
    }
    renderAlerts();
    updateAlertPreview();
}

function handleSignalTypeChange() {
    const select = document.getElementById('alertSignalType');
    const option = select?.selectedOptions[0];
    if (!option) return;

    const condition = option.getAttribute('data-cond') || 'direction_flip';
    const threshold = option.getAttribute('data-thresh') || 'Uptrend Confirmation';
    const desc = option.getAttribute('data-desc') || '';

    const condEl = document.getElementById('alertCondition');
    const threshEl = document.getElementById('alertThreshold');
    const descBox = document.getElementById('signalDescBox');

    if (condEl) condEl.value = condition;
    if (threshEl) threshEl.value = threshold;
    if (descBox && desc) descBox.textContent = desc;

    updateAlertPreview();
}

function handleChannelChange() {
    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const targetLabel = document.getElementById('channelTargetLabel');
    const targetInput = document.getElementById('alertChannelTarget');
    const targetHelp = document.getElementById('channelTargetHelp');

    const userEmail = state.user?.email || 'analyst@findashiq.com';

    if (channel === 'Telegram Bot') {
        if (targetLabel) targetLabel.textContent = 'Telegram Chat ID / Username';
        if (targetInput) {
            targetInput.placeholder = 'e.g. @quant_trader or 123456789';
            targetInput.value = '@quant_desk';
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Sends instant markdown-formatted signal messages to your configured Telegram Chat ID.';
    } else if (channel === 'Email Webhook') {
        if (targetLabel) targetLabel.textContent = 'Destination Recipient Email Address';
        if (targetInput) {
            targetInput.placeholder = 'e.g. yourname@domain.com';
            targetInput.value = userEmail;
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Dispatches structured HTML executive notification memo to the recipient email address.';
    } else if (channel === 'Discord Webhook') {
        if (targetLabel) targetLabel.textContent = 'Discord Channel Webhook URL';
        if (targetInput) {
            targetInput.placeholder = 'https://discord.com/api/webhooks/...';
            targetInput.value = 'https://discord.com/api/webhooks/trading-desk/signals';
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Pushes formatted quantitative embed cards into your Discord trading channels.';
    } else if (channel === 'Browser Push') {
        if (targetLabel) targetLabel.textContent = 'Desktop Notification Priority & Sound';
        if (targetInput) {
            targetInput.placeholder = 'In-App Desktop Toast';
            targetInput.value = 'High Priority • Real-time Audio Chime';
            targetInput.disabled = true;
        }
        if (targetHelp) targetHelp.textContent = 'Triggers instant browser desktop push notifications with high-priority audio alerts.';
    } else if (channel === 'Custom API Webhook') {
        if (targetLabel) targetLabel.textContent = 'HTTP Endpoint URL (JSON POST Webhook)';
        if (targetInput) {
            targetInput.placeholder = 'https://api.yourdomain.com/webhook/orders';
            targetInput.value = 'https://api.findashiq.internal/hooks/trader';
            targetInput.disabled = false;
        }
        if (targetHelp) targetHelp.textContent = 'Sends raw JSON quantitative signal payload to your custom trading bot or API listener.';
    }

    updateAlertPreview();
}

function updateAlertPreview() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    const customTicker = document.getElementById('alertCustomTicker')?.value.trim();
    const ticker = customTicker ? customTicker.toUpperCase() : (tickerSelect?.value || 'NVDA');

    const sigSelect = document.getElementById('alertSignalType');
    const sigName = sigSelect?.selectedOptions[0]?.textContent || 'SuperTrend Bullish Flip';
    const thresh = document.getElementById('alertThreshold')?.value || 'Trigger Level Reached';
    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const target = document.getElementById('alertChannelTarget')?.value || '@quant_desk';

    const previewEl = document.getElementById('alertLivePreviewText');
    if (previewEl) {
        previewEl.innerHTML = `⚡ When <strong>${ticker}</strong> triggers <strong>${sigName}</strong> (<em>${thresh}</em>), dispatch alert via <strong>${channel}</strong> to <code>${target}</code>.`;
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
        const channelTargetText = rule.channelTarget ? ` (<code>${rule.channelTarget}</code>)` : '';
        const sigName = rule.signalName || rule.signalType;
        const categoryBadge = rule.category ? `<span class="badge-pill badge-neutral" style="font-size: 0.65rem; padding: 1px 6px;">${rule.category}</span>` : '';
        const compName = state.stocksData?.[rule.ticker]?.profile?.name || state.watchlistData?.[rule.ticker]?.profile?.name || '';

        card.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                    <span class="badge-pill ${rule.active ? 'badge-bullish' : 'badge-neutral'}" style="font-size: 0.7rem;">
                        ${rule.active ? '🟢 ACTIVE' : '⚪ PAUSED'}
                    </span>
                    ${categoryBadge}
                    <div style="display: inline-flex; flex-direction: column; min-width: 0;">
                        <strong style="font-size: 0.95rem; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; line-height: 1.1;">${rule.ticker}</strong>
                        ${compName ? `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; line-height: 1.2;">${compName}</span>` : ''}
                    </div>
                    <span style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 700; margin-left: 4px;">${sigName}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
                    Condition: <strong style="color: var(--text-primary);">${rule.threshold}</strong> • Channel: <strong style="color: var(--accent-purple);">${rule.channel}</strong>${channelTargetText}
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
    const customTicker = document.getElementById('alertCustomTicker')?.value.trim();
    const ticker = customTicker ? customTicker.toUpperCase() : (tickerSelect?.value || 'NVDA');

    const sigSelect = document.getElementById('alertSignalType');
    const selectedOption = sigSelect?.selectedOptions[0];
    const signalName = selectedOption?.textContent || 'SuperTrend Bullish Flip';

    const threshold = document.getElementById('alertThreshold')?.value || 'Trigger Level Reached';
    const channel = document.getElementById('alertChannel')?.value || 'Telegram Bot';
    const channelTarget = document.getElementById('alertChannelTarget')?.value || '@quant_desk';

    await testTriggerAlert('form-preview', ticker, signalName, channel, threshold, channelTarget);
}

async function handleCreateAlert() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    const customTicker = document.getElementById('alertCustomTicker')?.value.trim();
    const ticker = customTicker ? customTicker.toUpperCase() : (tickerSelect?.value || 'NVDA');

    const sigSelect = document.getElementById('alertSignalType');
    const selectedOption = sigSelect?.selectedOptions[0];
    const signalType = selectedOption?.value || 'supertrend_bull';
    const signalName = selectedOption?.textContent || 'SuperTrend Bullish Flip';
    const category = selectedOption?.getAttribute('data-cat') || 'Trend & Volatility';

    const condition = document.getElementById('alertCondition')?.value || 'direction_flip';
    const threshold = document.getElementById('alertThreshold')?.value || 'Uptrend Confirmation';
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
        if (document.getElementById('alertCustomTicker')) {
            document.getElementById('alertCustomTicker').value = '';
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

function renderAlertNotificationItem(notif) {
    const logContainer = document.getElementById('alertHistoryLog');
    if (!logContainer) return;

    if (logContainer.children.length === 1 && logContainer.firstElementChild.textContent.includes('cleared')) {
        logContainer.innerHTML = '';
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

    item.innerHTML = `
        <div class="alert-log-header">
            <span class="badge-pill ${notif.sentiment?.toLowerCase().includes('bear') ? 'badge-neutral' : 'badge-bullish'}" style="font-size: 0.7rem;">
                ${escapeHtml(notif.ticker)} • ${isSim ? 'SIMULATED TRIGGER' : 'LIVE TRIGGER'}
            </span>
            <span class="alert-log-time">${notif.timestamp ? (notif.timestamp.includes(' ') ? notif.timestamp.split(' ')[1] : notif.timestamp) : 'Just now'}</span>
        </div>
        <div class="alert-log-title">${escapeHtml(notif.title || '')}</div>
        <div class="alert-log-body">${escapeHtml(notif.message || '')}</div>
        ${newsMetaHtml}
        <div class="alert-log-footer">
            <span>Channel: ${escapeHtml(notif.channel || 'Telegram')}${targetDisplay}</span>
            <span style="color: var(--accent-green); font-weight: 700;">✔ Delivered Successfully</span>
        </div>
    `;

    logContainer.insertBefore(item, logContainer.firstChild);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function evaluateAlertRules(stocksData) {
    if (!state.alerts || state.alerts.length === 0 || !stocksData) return;
    
    const activeRules = state.alerts.filter(a => a.active);
    if (activeRules.length === 0) return;

    activeRules.forEach(rule => {
        const stock = stocksData[rule.ticker];
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

        if (sigType === 'news_breaking_catalyst' && newsSignal) {
            triggered = true;
            triggerTitle = `🚨 Breaking News Catalyst: ${rule.ticker}`;
            triggerMsg = `High-impact breaking news catalyst detected for ${rule.ticker}: "${newsSignal.headline}"`;
            newsMeta = newsSignal;
        } else if (sigType === 'news_sentiment_bullish' && newsSignal && newsSignal.status === 'bullish') {
            triggered = true;
            triggerTitle = `📈 Bullish Catalyst Detected: ${rule.ticker}`;
            triggerMsg = `Positive catalyst headline and upgraded momentum detected for ${rule.ticker}.`;
            newsMeta = newsSignal;
        } else if (sigType === 'news_sentiment_bearish' && newsSignal && newsSignal.status === 'bearish') {
            triggered = true;
            triggerTitle = `📉 Adverse Catalyst Alert: ${rule.ticker}`;
            triggerMsg = `Adverse news event or negative headline pressure detected for ${rule.ticker}.`;
            newsMeta = newsSignal;
        } else if (sigType === 'news_tier1_source' && newsSignal) {
            triggered = true;
            triggerTitle = `🏛️ Tier-1 Wire Breaking: ${rule.ticker}`;
            triggerMsg = `Premier publisher (${newsSignal.publisher}) wire headline detected for ${rule.ticker}.`;
            newsMeta = newsSignal;
        }

        if (triggered && newsMeta) {
            renderAlertNotificationItem({
                ticker: rule.ticker,
                title: triggerTitle,
                message: triggerMsg,
                channel: rule.channel,
                channelTarget: rule.channelTarget,
                timestamp: new Date().toLocaleTimeString(),
                newsHeadline: newsMeta.headline,
                newsSummary: newsMeta.summary,
                newsPublisher: newsMeta.publisher,
                newsUrl: newsMeta.url,
                sentiment: newsMeta.sentiment,
                isSimulated: false
            });
        }
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
            renderAlertNotificationItem(data.notification);
        }
    } catch (e) {
        console.error('Failed to test alert trigger:', e);
    }
}

function clearAlertHistory() {
    const log = document.getElementById('alertHistoryLog');
    if (log) log.innerHTML = '<div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 20px;">Alert activity log cleared.</div>';
}
