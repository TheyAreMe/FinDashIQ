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
    'XYZ': 'Block Inc.',
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

const TICKER_ALIASES = {};

function normalizeTicker(ticker) {
    if (!ticker) return '';
    const clean = String(ticker).trim().toUpperCase();
    return TICKER_ALIASES[clean] || clean;
}

function getAssetCompanyName(ticker, stockOrProfile) {
    if (!ticker) return '';
    const cleanT = normalizeTicker(String(ticker).trim().toUpperCase());
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
    backtestStrategy: 'omni_consensus',
    backtestTicker: 'NVDA',
    backtestTickers: (function () {
        try {
            const raw = localStorage.getItem('findashiq_backtest_tickers');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { }
        return ['NVDA', 'MSFT', 'AAPL', 'TSLA', 'SPCX', 'PLTR', 'TSM', 'IFX.DE'];
    })(),
    backtestTimeframe: '1y',
    backtestMode: 'long_only',
    backtestCapital: 10000,
    backtestStopLoss: 5.0,
    backtestTakeProfit: 12.0,
    backtestSlippage: 0.10,
    backtestShowTradeMarkers: (function () {
        try {
            const val = localStorage.getItem('findashiq_bt_trade_markers');
            return val !== '0'; // Default to true (visible) unless user explicitly turned off
        } catch (e) {
            return true;
        }
    })(),

    paperTrades: [],
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
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const seen = new Set();
                    const cleanList = [];
                    parsed.forEach(t => {
                        const cleanT = String(t || '').toUpperCase().trim();
                        if (cleanT && !seen.has(cleanT)) {
                            seen.add(cleanT);
                            cleanList.push(cleanT);
                        }
                    });
                    if (cleanList.length > 0) return cleanList;
                }
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
    watchlistData: (function () {
        try {
            const raw = localStorage.getItem('findashiq_watchlist_cache');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.data && typeof parsed.data === 'object') {
                    return parsed.data;
                }
            }
        } catch (e) { }
        return {};
    })(),
    scannerUniverseTickers: new Set(),
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
        conviction: null,
        stoch: null,
        rsi: null,
        macd: null,
        cmf: null,
        equity: null,
        drawdown: null
    }
};

/**
 * Dynamic Memory Management & LRU Cache Trimmer
 * Prevents V8 Heap exhaustion and memory spikes on mobile/touch devices
 */
function trimClientStockCache() {
    if (!state.stocksData) return;
    const isMobile = window.innerWidth < 768 || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
    const maxStocks = isMobile ? 8 : 20;
    const keys = Object.keys(state.stocksData);
    if (keys.length <= maxStocks) return;

    const activeT = (state.activeTicker || '').toUpperCase();
    const btT = (state.backtestTicker || '').toUpperCase();
    const wlSet = new Set(Object.keys(state.watchlistData || {}).map(k => k.toUpperCase()));

    // Evict oldest cached stocks that are neither the active terminal stock, active backtest asset, nor in the watchlist
    const evictable = keys.filter(k => {
        const ku = k.toUpperCase();
        return ku !== activeT && ku !== btT && !wlSet.has(ku);
    });

    const toEvictCount = keys.length - maxStocks;
    for (let i = 0; i < Math.min(toEvictCount, evictable.length); i++) {
        const victim = evictable[i];
        delete state.stocksData[victim];
    }
}

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

    // 5. Reset In-Memory State & Paper Trades
    state.watchlistTickers = [];
    state.watchlistData = {};
    state.alerts = [];
    state.copilotHistory = [];
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
            if (state.user && state.user.role === 'admin') {
                loadSystemUpdatesInfo(false);
            }
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
                    <button type="button" class="user-dropdown-item" onclick="openProfileModal('updates')">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="refresh-cw" style="width: 14px; color: var(--accent-cyan);"></i> System Updates
                            </div>
                            <span id="userMenuUpdateBadge" class="badge-pill badge-bullish" style="font-size: 0.62rem; display: none; padding: 2px 6px;">Update</span>
                        </div>
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
    state.aiSettings = { apiKey: '', model: 'gemini-3.7-flash' };

    // Completely wipe all user-specific DOM & data immediately
    clearUserSessionDOM();
    loadPaperTrades();

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
    const updatesTabBtn = document.getElementById('tabBtnProfileUpdates');
    if (updatesTabBtn) {
        updatesTabBtn.style.display = state.user.role === 'admin' ? 'inline-flex' : 'none';
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
    const btnUpdates = document.getElementById('tabBtnProfileUpdates');

    const paneDetails = document.getElementById('profileTabPaneDetails');
    const paneSecurity = document.getElementById('profileTabPaneSecurity');
    const paneUsers = document.getElementById('profileTabPaneUsers');
    const paneUpdates = document.getElementById('profileTabPaneUpdates');

    if (btnDetails) btnDetails.classList.toggle('active', tabKey === 'details');
    if (btnSecurity) btnSecurity.classList.toggle('active', tabKey === 'security');
    if (btnUsers) btnUsers.classList.toggle('active', tabKey === 'users');
    if (btnUpdates) btnUpdates.classList.toggle('active', tabKey === 'updates');

    if (paneDetails) paneDetails.classList.toggle('active', tabKey === 'details');
    if (paneSecurity) paneSecurity.classList.toggle('active', tabKey === 'security');
    if (paneUsers) paneUsers.classList.toggle('active', tabKey === 'users');
    if (paneUpdates) paneUpdates.classList.toggle('active', tabKey === 'updates');

    if (tabKey === 'users' && state.user && state.user.role === 'admin') {
        loadAdminUsersList();
    }
    if (tabKey === 'updates' && state.user && state.user.role === 'admin') {
        loadSystemUpdatesInfo(false);
    }
    lucide.createIcons();
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

    const currentVer = data.current_version || '0.1.4';
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
    if (!tickerString) return;

    // Sanitize preset tickers
    const rawTickers = tickerString.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    const newTickers = rawTickers.map(t => normalizeTicker(t));
    const cleanTickerString = newTickers.join(', ');

    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput) tickerInput.value = cleanTickerString;

    // Highlight active preset chip in UI
    document.querySelectorAll('.preset-chip').forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', onClickAttr.includes(tickerString) || onClickAttr.includes(cleanTickerString));
    });

    if (newTickers.length > 0) {
        state.activeTicker = newTickers[0];
        // Render immediate skeleton/cached tabs so active stock selector updates at 0ms
        renderStockSelector(newTickers);
    }

    handleAnalyze(true);
}

function showChartLoading(period) {
    const overlay = document.getElementById('chartLoadingOverlay');
    const titleEl = document.getElementById('chartLoadingTimeframe');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
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
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay && overlay.style.opacity === '0') {
                overlay.style.display = 'none';
            }
        }, 200);
    }
}

function setTimeframe(period) {
    state.currentPeriod = period;
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });

    state._renderedChartsTicker = null;
    showChartLoading(period);

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

async function switchActiveStock(ticker) {
    if (!ticker) return;
    ticker = ticker.trim().toUpperCase();
    if (state.activeTicker !== ticker) {
        state._renderedChartsTicker = null;
    }
    state.activeTicker = ticker;

    document.querySelectorAll('.ticker-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.ticker === ticker);
    });

    const stock = state.stocksData[ticker] || state.watchlistData?.[ticker];
    if (stock && stock.profile && !stock.error) {
        if (!state.stocksData[ticker]) {
            state.stocksData[ticker] = { ...stock };
        }
        renderActiveStock();
        // If timeseries data not loaded yet, fetch analysis immediately
        if (!stock.timeseries || stock.timeseries.length === 0) {
            handleAnalyze(true);
        }
    } else {
        handleAnalyze(true);
    }
}

function hasValidCandleTimeseries(stock) {
    if (!stock || !stock.timeseries || !Array.isArray(stock.timeseries) || stock.timeseries.length < 5) {
        return false;
    }
    const first = stock.timeseries[0];
    const last = stock.timeseries[stock.timeseries.length - 1];
    return typeof first?.close === 'number' && typeof first?.open === 'number' && typeof last?.close === 'number';
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

    const stock = state.stocksData[state.activeTicker];

    // Re-render subtab content strictly client-side without re-triggering network analysis
    if (tabKey === 'charts') {
        const hasCandles = hasValidCandleTimeseries(stock);
        if (hasCandles) {
            // Only re-render if charts haven't been rendered yet for this ticker
            if (!(state.charts.primary && state._renderedChartsTicker === state.activeTicker)) {
                try {
                    renderPrimaryChart(stock.timeseries);
                    renderConvictionChart(stock.timeseries);
                    renderStochChart(stock.timeseries);
                    renderRSIChart(stock.timeseries);
                    renderMACDChart(stock.timeseries);
                    renderCMFChart(stock.timeseries);
                    state._renderedChartsTicker = state.activeTicker;
                } catch (e) {
                    console.warn('Charts render warning:', e);
                }
            }
            if (!_isAnalyzing) {
                hideChartLoading();
            }
        } else {
            // Full candle timeseries is still calculating in background; show spinner overlay
            showChartLoading(state.currentPeriod);
            if (!_isAnalyzing) {
                handleAnalyze();
            }
        }
    } else if (tabKey === 'ai') {
        renderAIIntelligence(stock ? stock.aiAnalysis : null);
        if (stock) {
            renderNewsIntelligence(stock);
        }
    } else if (tabKey === 'fundamentals') {
        if (stock && stock.signals) {
            renderTechnicalSignals(stock.signals);
        }
    }

    // Trigger resize for ApexCharts strictly after charts tab is shown and charts exist
    if (tabKey === 'charts' && state.charts.primary) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }

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
        'charts': 'Charts',
        'backtest': 'Backtesting',
        'fundamentals': 'Fundamentals'
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



let _isAnalyzing = false;
let _analyzeRequestId = 0;
let _analyzeAbortController = null;

async function handleAnalyze(forceRefresh = false) {
    if (_isAnalyzing && !forceRefresh) {
        return;
    }

    // Cancel any previous in-flight analysis request
    if (_analyzeAbortController) {
        try {
            _analyzeAbortController.abort();
        } catch (e) { }
        _analyzeAbortController = null;
    }
    _analyzeAbortController = new AbortController();
    const abortSignal = _analyzeAbortController.signal;

    const myRequestId = ++_analyzeRequestId;
    _isAnalyzing = true;

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
    if (!inputVal) {
        _isAnalyzing = false;
        return;
    }

    const errorAlert = document.getElementById('errorAlert');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const dashboardContent = document.getElementById('dashboardContent');

    if (errorAlert) errorAlert.style.display = 'none';

    let tickers = inputVal.split(',').map(t => t.trim()).filter(Boolean);
    if (tickers.length === 0) {
        _isAnalyzing = false;
        return;
    }

    try {
        // Fast sanitize tickers
        let cleanedTickers = tickers.map(t => normalizeTicker(t.toUpperCase()));

        // Check if any entered token is a company name (needs server resolution)
        const needsResolution = tickers.some(t => t.includes(' ') || (t.length > 6 && !t.includes('.') && !t.includes('-')));
        if (needsResolution) {
            try {
                const resolveResp = await fetch('/api/stocks/resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ queries: tickers }),
                    signal: abortSignal
                });
                if (resolveResp.ok) {
                    const resolveData = await resolveResp.json();
                    if (myRequestId !== _analyzeRequestId) return;
                    if (resolveData.success && resolveData.tickers && resolveData.tickers.length > 0) {
                        cleanedTickers = resolveData.tickers.map(t => normalizeTicker(t));
                        const input = document.getElementById('tickerInput');
                        if (input) input.value = resolveData.tickerString;
                    }
                }
            } catch (e) {
                if (e.name === 'AbortError') return;
                cleanedTickers = tickers.map(t => normalizeTicker(t.toUpperCase()));
            }
        }

        if (myRequestId !== _analyzeRequestId) return;

        tickers = [...new Set(cleanedTickers.map(t => normalizeTicker(t)))];
        const normalizedInput = tickers.join(', ');
        const input = document.getElementById('tickerInput');
        if (input && input.value !== normalizedInput && inputVal.split(',').some(t => normalizeTicker(t.trim().toUpperCase()) !== t.trim().toUpperCase())) {
            input.value = normalizedInput;
        }

        // Ensure activeTicker is valid and points to one of the current tickers
        if (!state.activeTicker || !tickers.includes(state.activeTicker)) {
            state.activeTicker = tickers[0];
        }

        // Stage 0: Instant Rendering from existing state/watchlist data
        renderStockSelector(tickers);

        tickers.forEach(t => {
            if (!state.stocksData[t] && state.watchlistData && state.watchlistData[t]) {
                state.stocksData[t] = { ...state.watchlistData[t] };
            }
        });

        if (state.stocksData[state.activeTicker]) {
            renderActiveStock();
        } else {
            if (loadingOverlay) loadingOverlay.style.display = 'block';
            if (dashboardContent) dashboardContent.style.opacity = '0.4';
        }

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
            }),
            signal: abortSignal
        });

        if (myRequestId !== _analyzeRequestId) return;

        if (fastResponse.ok) {
            const fastData = await fastResponse.json();
            if (myRequestId !== _analyzeRequestId) return;

            if (fastData && fastData.stocks) {
                Object.keys(fastData.stocks).forEach(tk => {
                    const existing = state.stocksData[tk] || {};
                    const fastStock = fastData.stocks[tk] || {};
                    state.stocksData[tk] = {
                        ...existing,
                        ...fastStock,
                        sparkline: fastStock.sparkline || existing.sparkline || [],
                        timeseries: (existing.timeseries && existing.timeseries.length > 0 && typeof existing.timeseries[0]?.open === 'number') ? existing.timeseries : [],
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
            }),
            signal: abortSignal
        });

        if (myRequestId !== _analyzeRequestId) return;

        const fullData = await fullResponse.json();
        if (myRequestId !== _analyzeRequestId) return;

        if (fullResponse.ok && fullData && fullData.stocks) {
            Object.keys(fullData.stocks).forEach(tk => {
                const stockObj = fullData.stocks[tk];
                if (stockObj && stockObj.fullTimeseries && stockObj.timeseries) {
                    delete stockObj.fullTimeseries;
                }
                state.stocksData[tk] = stockObj;
            });
            trimClientStockCache();

            if (!tickers.includes(state.activeTicker)) {
                state.activeTicker = tickers[0] || 'AAPL';
            }

            // Invalidate chart ticker cache so full candle dataset renders immediately
            state._renderedChartsTicker = null;

            renderStockSelector(tickers);
            renderActiveStock();
            evaluateAlertRules(state.stocksData);
        } else if (!fastResponse.ok && fullData?.error) {
            throw new Error(fullData.error || 'Failed to analyze requested stocks.');
        }

    } catch (err) {
        if (err.name === 'AbortError') return;
        if (myRequestId !== _analyzeRequestId) return;
        console.error('Analyze error:', err);
        if (errorAlert) {
            errorAlert.textContent = err.message || 'An error occurred while analyzing stocks.';
            errorAlert.style.display = 'block';
        }
    } finally {
        if (myRequestId === _analyzeRequestId) {
            _isAnalyzing = false;
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            if (dashboardContent) dashboardContent.style.opacity = '1';
            hideChartLoading();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

function renderStockSelector(tickers) {
    const container = document.getElementById('tickerTabsList');
    if (!container) return;
    container.innerHTML = '';

    if (!tickers || tickers.length === 0) return;

    // Clean and deduplicate tickers
    const cleanTickers = [...new Set(tickers.map(t => String(t || '').trim().toUpperCase()).filter(Boolean))];
    if (cleanTickers.length === 0) return;

    // Ensure state.activeTicker is valid and in list
    if (!state.activeTicker || !cleanTickers.includes(state.activeTicker)) {
        state.activeTicker = cleanTickers[0];
    }

    cleanTickers.forEach(ticker => {
        const stock = state.stocksData[ticker] || state.watchlistData?.[ticker];
        const tab = document.createElement('div');
        tab.className = `ticker-tab ${ticker === state.activeTicker ? 'active' : ''}`;
        tab.dataset.ticker = ticker;

        if (stock && stock.profile && !stock.error) {
            const profile = stock.profile || {};
            const changePercent = typeof profile.changePercent === 'number' ? profile.changePercent : 0;
            const isBullish = changePercent >= 0;
            const compName = getAssetCompanyName(ticker, stock);
            const instCurr = profile.currency || 'USD';
            const baseCurr = getUserBaseCurrency();
            const displayPrice = typeof profile.currentPrice === 'number' ? formatPrice(profile.currentPrice, instCurr, baseCurr) : '--';

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
        } else {
            // Skeleton / placeholder tab while data is hydrating
            const compName = getAssetCompanyName(ticker, null) || ticker;
            tab.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
                    <span class="ticker-tab-symbol">${ticker}</span>
                    <span class="ticker-tab-name" title="${compName}">${compName}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
                    <span class="ticker-tab-price mono" style="opacity: 0.6;">Loading...</span>
                    <span class="badge-pill badge-neutral" style="opacity: 0.7;">--%</span>
                </div>
            `;
        }

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

    // 5. Activate and render only the currently active subtab
    switchMainTab(state.activeMainTab || 'ai');
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
let currentModalCatalystItem = null;

function openGlobalNewsModal(customTicker = null, initialQuery = '', initialFilter = 'all', catalystItem = null) {
    const modal = document.getElementById('globalNewsModal');
    if (!modal) return;

    if (customTicker) {
        state.activeTicker = customTicker;
    }

    currentModalCatalystItem = catalystItem || null;

    const stock = state.stocksData[state.activeTicker] || state.watchlistData[state.activeTicker];
    const compName = getAssetCompanyName(state.activeTicker, stock);
    const badgeEl = document.getElementById('newsModalStockBadge');
    if (badgeEl) {
        badgeEl.textContent = `${state.activeTicker} (${compName})`;
    }

    const searchInput = document.getElementById('globalNewsSearchInput');
    if (searchInput) {
        searchInput.value = initialQuery || '';
    }
    currentModalNewsQuery = String(initialQuery || '').trim().toLowerCase();
    currentModalNewsFilter = initialFilter || 'all';

    ['newsFilterAllBtn', 'newsFilterCatalystsBtn', 'newsFilterTier1Btn'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
    if (initialFilter === 'catalysts') {
        document.getElementById('newsFilterCatalystsBtn')?.classList.add('active');
    } else if (initialFilter === 'tier1') {
        document.getElementById('newsFilterTier1Btn')?.classList.add('active');
    } else {
        document.getElementById('newsFilterAllBtn')?.classList.add('active');
    }

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

    const stock = state.stocksData[state.activeTicker] || state.watchlistData[state.activeTicker];
    let news = stock?.news ? [...stock.news] : [];

    if (currentModalCatalystItem) {
        const headline = currentModalCatalystItem.headline || '';
        const exists = news.some(n => (n.title || '').toLowerCase() === headline.toLowerCase());
        if (!exists && headline) {
            news.unshift({
                title: currentModalCatalystItem.headline,
                publisher: currentModalCatalystItem.publisher || 'Financial Wire',
                time: currentModalCatalystItem.time || 'Active Session',
                summary: currentModalCatalystItem.summary || `Breaking market catalyst event detected with relative volume of ${currentModalCatalystItem.volRatio || 'elevated'}.`,
                url: currentModalCatalystItem.link || `https://finance.yahoo.com/quote/${state.activeTicker}/news`,
                country: 'US',
                flag: '🇺🇸'
            });
        }
    }

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
        const url = escapeHtml(item.url || item.link || '#');

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
    if (!ai) {
        const thesisEl = document.getElementById('aiThesisText');
        if (thesisEl) {
            thesisEl.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Generating quantitative AI investment thesis &amp; market synthesis...</span>';
        }
        const scoreEl = document.getElementById('aiConvictionScore');
        if (scoreEl) scoreEl.textContent = '--%';
        const biasEl = document.getElementById('aiDirectionalBias');
        if (biasEl) {
            biasEl.textContent = 'Analyzing...';
            biasEl.className = 'badge-pill badge-neutral';
        }
        const barEl = document.getElementById('aiConvictionBar');
        if (barEl) barEl.style.width = '0%';
        const bdEl = document.getElementById('aiConvictionBreakdown');
        if (bdEl) bdEl.innerHTML = '';
        return;
    }

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
// INSTITUTIONAL QUANTITATIVE BACKTESTING STUDIO & ENGINE
// -------------------------------------------------------------

// Active backtest result cache
let _currentBacktestResult = null;

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
        let checks = 0;
        const checkInterval = setInterval(() => {
            checks++;
            if (typeof ApexCharts !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            } else if (checks > 30) {
                clearInterval(checkInterval);
                const existingScript = document.querySelector('script[src*="apexcharts"]');
                if (existingScript && !existingScript.dataset.fallbackInjected) {
                    existingScript.dataset.fallbackInjected = 'true';
                    let subChecks = 0;
                    const subInterval = setInterval(() => {
                        subChecks++;
                        if (typeof ApexCharts !== 'undefined') {
                            clearInterval(subInterval);
                            resolve();
                        } else if (subChecks > 30) {
                            clearInterval(subInterval);
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
                            script.async = true;
                            script.onload = () => resolve();
                            script.onerror = (err) => {
                                _apexChartsPromise = null;
                                reject(err);
                            };
                            document.head.appendChild(script);
                        }
                    }, 50);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = (err) => {
                        _apexChartsPromise = null;
                        reject(err);
                    };
                    document.head.appendChild(script);
                }
            }
        }, 50);
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

// Request sequence tracking for backtest studio to eliminate race conditions
let _backtestCurrentRequestId = 0;
let _isBacktestLoading = false;
let _hideBacktestTimer = null;

/**
 * Initialize the Backtesting Studio View
 */
async function initBacktestStudio(targetTicker = null) {
    const ticker = (targetTicker || state.backtestTicker || state.activeTicker || 'NVDA').toUpperCase().trim();
    state.backtestTicker = ticker;

    const reqId = ++_backtestCurrentRequestId;

    // Decoupled: Immediately sync and render paper trades in background without blocking on backtest charts
    loadPaperTrades();

    // Show loading immediately across overlay, header badge, and tab pills
    const stock = state.stocksData[ticker];
    const hasData = stock && stock.timeseries && stock.timeseries.length >= 20;
    showBacktestLoading(
        ticker,
        hasData ? `Analyzing ${ticker}...` : `Fetching Data for ${ticker}...`,
        hasData ? 'Simulating strategy models & rendering equity curve...' : 'Fetching daily historical candles & computing multi-factor indicators...'
    );

    // 1. Sync Ticker Input Field
    const tickerInput = document.getElementById('btTickerInput');
    if (tickerInput) tickerInput.value = ticker;

    // 2. Render Watchlist Quick-Pills
    renderBacktestWatchlistPills();

    // 3. Sync Controls (Timeframe, Mode, Strategy, Risk Inputs)
    syncBacktestControlsUI();

    // Yield so browser paints the loading overlay, header badge, and tab spinner before intensive execution
    await new Promise(resolve => setTimeout(resolve, 25));

    if (reqId !== _backtestCurrentRequestId) return;

    // 4. Ensure Stock Timeseries Data is Loaded
    await loadBacktestStockData(ticker);

    if (reqId !== _backtestCurrentRequestId) return;

    // 5. Immediately re-render pills so the selected stock shows its price, name, and badge dynamically
    renderBacktestWatchlistPills();

    // 6. Run Calculation and Render All Subsystems
    await recalculateCurrentBacktest(reqId);
}

// -------------------------------------------------------------
// BACKTEST STUDIO LOADING INDICATOR STATE & CONTROLS
// -------------------------------------------------------------
function showBacktestLoading(ticker, customText, customSubtext) {
    _isBacktestLoading = true;
    if (_hideBacktestTimer) {
        clearTimeout(_hideBacktestTimer);
        _hideBacktestTimer = null;
    }
    const cleanT = (ticker || state.backtestTicker || 'Asset').toUpperCase().trim();
    const overlay = document.getElementById('btChartsLoadingOverlay');
    const titleEl = document.getElementById('btChartsLoadingTitle');
    const subtextEl = document.getElementById('btChartsLoadingSubtext');
    const badge = document.getElementById('btHeaderLoadingBadge');
    const badgeText = document.getElementById('btHeaderLoadingText');

    if (badge) {
        badge.style.display = 'inline-flex';
        if (badgeText) {
            badgeText.textContent = customText || `Loading ${cleanT}...`;
        }
    }

    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        if (titleEl) {
            titleEl.textContent = `Loading Market History for ${escapeHtml(cleanT)}...`;
        }
        if (subtextEl) {
            subtextEl.textContent = customSubtext || 'Fetching historical candles & computing multi-factor indicators...';
        }
    }

    // Toggle loading class on matching tab pill
    document.querySelectorAll('#btWatchlistTabsList .bt-asset-tab').forEach(tab => {
        if (tab.dataset.ticker === cleanT) {
            tab.classList.add('is-loading');
        } else {
            tab.classList.remove('is-loading');
        }
    });
}
window.showBacktestLoading = showBacktestLoading;

function hideBacktestLoading() {
    _isBacktestLoading = false;
    if (_hideBacktestTimer) {
        clearTimeout(_hideBacktestTimer);
        _hideBacktestTimer = null;
    }
    const overlay = document.getElementById('btChartsLoadingOverlay');
    const badge = document.getElementById('btHeaderLoadingBadge');

    if (overlay) {
        overlay.style.opacity = '0';
        _hideBacktestTimer = setTimeout(() => {
            if (!_isBacktestLoading && overlay) {
                overlay.style.display = 'none';
            }
            _hideBacktestTimer = null;
        }, 220);
    }

    if (badge) {
        badge.style.display = 'none';
    }

    document.querySelectorAll('#btWatchlistTabsList .bt-asset-tab.is-loading').forEach(tab => {
        tab.classList.remove('is-loading');
    });
}
window.hideBacktestLoading = hideBacktestLoading;

/**
 * Ensure market history and technical signals are downloaded for backtesting
 */
async function loadBacktestStockData(ticker, targetTf = null) {
    const cleanTicker = (ticker || 'NVDA').toUpperCase().trim();
    const activeTf = (targetTf || state.backtestTimeframe || '1y').toLowerCase();
    const stock = state.stocksData[cleanTicker];

    const TF_BARS_MAP = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 1260
    };
    const requiredBars = TF_BARS_MAP[activeTf] || 252;

    // If timeseries has sufficient depth for the requested timeframe, or if already attempted for this timeframe and has data, no network fetch needed
    if (stock && stock.timeseries && (stock.timeseries.length >= requiredBars || (stock._backtestFetchedTf === activeTf && stock.timeseries.length >= 5))) {
        return;
    }

    showBacktestLoading(cleanTicker);

    // If chart instances don't exist yet, also prepare containers with spinners
    const eqContainer = document.getElementById('equityChartContainer');
    const ddContainer = document.getElementById('drawdownChartContainer');

    if (eqContainer && !state.charts.equity) {
        eqContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; gap: 12px; color: var(--text-secondary);">
                <div class="spinner" style="width: 32px; height: 32px; border-width: 3px;"></div>
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">Loading Market History for ${escapeHtml(cleanTicker)}...</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">Fetching daily historical candles &amp; computing multi-factor indicators</div>
            </div>`;
    }
    if (ddContainer && !state.charts.drawdown) {
        ddContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 140px; color: var(--text-muted); font-size: 0.78rem;">
                Preparing return relative to initial investment...
            </div>`;
    }

    let backtestPeriod = '5y';
    if (activeTf === 'max') {
        backtestPeriod = 'max';
    } else if (['2y', '3y', '5y'].includes(activeTf)) {
        backtestPeriod = '5y';
    } else if (['1mo', '3mo', '6mo', '1y'].includes(activeTf)) {
        backtestPeriod = '5y';
    }

    try {
        let data = null;
        try {
            const res = await fetch(`/api/stocks/${encodeURIComponent(cleanTicker)}?period=${backtestPeriod}&includeBacktests=0`);
            if (res.ok) {
                data = await res.json();
            }
        } catch (e) {
            console.warn('GET /api/stocks failed, trying POST /api/analyze fallback:', e);
        }

        if (!data || !data.timeseries || data.timeseries.length === 0) {
            const postRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tickers: [cleanTicker],
                    period: backtestPeriod,
                    interval: '1d',
                    phase: 'full'
                })
            });
            if (postRes.ok) {
                const postData = await postRes.json();
                if (postData && postData.stocks && postData.stocks[cleanTicker]) {
                    data = postData.stocks[cleanTicker];
                }
            }
        }

        if (data && data.timeseries && data.timeseries.length > 0) {
            const existing = state.stocksData[cleanTicker] || {};
            // Use whichever timeseries is longer so we never downgrade historical depth
            const mergedTs = (data.timeseries.length >= (existing.timeseries?.length || 0)) ? data.timeseries : existing.timeseries;
            if (data.fullTimeseries) delete data.fullTimeseries;
            state.stocksData[cleanTicker] = {
                ...existing,
                ...data,
                timeseries: mergedTs,
                profile: { ...(existing.profile || {}), ...(data.profile || {}) },
                aiAnalysis: existing.aiAnalysis || data.aiAnalysis || null,
                news: (existing.news && existing.news.length > 0) ? existing.news : (data.news || []),
                currentPrice: data.currentPrice || (data.profile && data.profile.currentPrice) || (existing.profile && existing.profile.currentPrice) || (mergedTs[mergedTs.length - 1] ? mergedTs[mergedTs.length - 1].close : 0),
                _backtestFetchedTf: activeTf
            };
            trimClientStockCache();
        } else if (state.stocksData[cleanTicker]) {
            state.stocksData[cleanTicker]._backtestFetchedTf = activeTf;
        }
    } catch (err) {
        console.error('Error fetching stock data for backtesting studio:', err);
    } finally {
        const loadedStock = state.stocksData[cleanTicker];
        if (!loadedStock || !loadedStock.timeseries || loadedStock.timeseries.length === 0) {
            hideBacktestLoading();
        }
    }
}

/**
 * Render Watchlist Asset Selector in Studio matching the General Page Stock Selector
 */
function renderBacktestWatchlistPills() {
    const container = document.getElementById('btWatchlistTabsList');
    if (!container) return;
    container.innerHTML = '';

    // Initialize or load backtestTickers from state/localStorage
    if (!state.backtestTickers || !Array.isArray(state.backtestTickers) || state.backtestTickers.length === 0) {
        let loaded = null;
        try {
            const raw = localStorage.getItem('findashiq_backtest_tickers');
            if (raw) loaded = JSON.parse(raw);
        } catch (e) { }
        if (Array.isArray(loaded) && loaded.length > 0) {
            state.backtestTickers = [...new Set(loaded.map(t => normalizeTicker(t)))];
        } else {
            state.backtestTickers = ['NVDA', 'MSFT', 'AAPL', 'TSLA', 'SPCX', 'PLTR', 'TSM', 'IFX.DE'];
        }
    }

    const currentTicker = normalizeTicker((state.backtestTicker || state.backtestTickers[0] || 'NVDA').toUpperCase().trim());
    if (!state.backtestTicker || state.backtestTicker !== currentTicker) {
        state.backtestTicker = currentTicker;
    }

    // Ensure active backtest ticker is in the list
    if (state.backtestTicker && !state.backtestTickers.some(t => String(t || '').toUpperCase().trim() === state.backtestTicker)) {
        state.backtestTickers.unshift(state.backtestTicker);
        try {
            localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
        } catch (e) { }
    }

    // Deduplicate and assemble tabs
    const seen = new Set();
    const tickers = [];

    state.backtestTickers.forEach(t => {
        const cleanT = String(t || '').toUpperCase().trim();
        if (cleanT && !seen.has(cleanT)) {
            seen.add(cleanT);
            tickers.push(cleanT);
        }
    });

    if (tickers.length === 0) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; color: var(--text-muted); font-size: 0.8rem;">
                <span>No backtest assets selected.</span>
                <button type="button" class="btn-secondary" onclick="openAddStockModal('backtest')" style="padding: 3px 9px; font-size: 0.72rem;">
                    + Search Asset
                </button>
            </div>
        `;
        return;
    }

    const baseCurr = getUserBaseCurrency();

    tickers.forEach(cleanT => {
        const isActive = cleanT === state.backtestTicker;

        // Retrieve stock data from stocksData or watchlistData
        const stock = state.stocksData[cleanT] || state.watchlistData[cleanT] || {};
        const profile = stock.profile || {};
        const compName = getAssetCompanyName(cleanT, stock);
        const instCurr = profile.currency || 'USD';

        // Price & change
        const currentPrice = profile.currentPrice || stock.currentPrice || (stock.timeseries && stock.timeseries.length > 0 ? stock.timeseries[stock.timeseries.length - 1].close : null);
        const changePercent = typeof profile.changePercent === 'number'
            ? profile.changePercent
            : (typeof stock.changePercent === 'number' ? stock.changePercent : null);

        const isBullish = (changePercent || 0) >= 0;
        const isLoading = _isBacktestLoading && cleanT === state.backtestTicker;
        const tab = document.createElement('div');
        tab.className = `ticker-tab bt-asset-tab ${isActive ? 'active' : ''} ${isLoading ? 'is-loading' : ''}`;
        tab.dataset.ticker = cleanT;
        tab.setAttribute('role', 'button');
        tab.setAttribute('tabindex', '0');
        tab.setAttribute('title', `Backtest ${compName} (${cleanT})`);

        let priceHtml = '';
        const displayPrice = typeof currentPrice === 'number' ? formatPrice(currentPrice, instCurr, baseCurr) : null;
        if (displayPrice) {
            priceHtml = `
                <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
                    <span class="ticker-tab-price mono">${displayPrice}</span>
                    ${changePercent !== null ? `
                        <span class="badge-pill ${isBullish ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.68rem; padding: 2px 6px;">
                            ${isBullish ? '+' : ''}${changePercent.toFixed(2)}%
                        </span>
                    ` : ''}
                </div>`;
        }

        tab.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
                <span class="ticker-tab-symbol">${cleanT}</span>
                <span class="ticker-tab-name" title="${escapeHtml(compName)}">${escapeHtml(compName)}</span>
            </div>
            ${priceHtml}
            <button type="button" class="bt-tab-remove-btn" onclick="event.stopPropagation(); removeBacktestTicker('${cleanT}', event);" title="Remove ${cleanT} from Backtest" aria-label="Remove ${cleanT}">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        tab.onclick = () => setBacktestTicker(cleanT);
        tab.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') setBacktestTicker(cleanT); };

        container.appendChild(tab);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
    preloadBacktestTickersQuotes();
}

/**
 * Remove a ticker from Backtest Studio assets
 */
function removeBacktestTicker(ticker, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (!ticker) return;
    const cleanT = ticker.trim().toUpperCase();

    if (!state.backtestTickers) state.backtestTickers = [];
    state.backtestTickers = state.backtestTickers.filter(t => String(t || '').toUpperCase().trim() !== cleanT);

    try {
        localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
    } catch (e) { }

    // If removed ticker was active, switch to next available ticker
    if (state.backtestTicker === cleanT) {
        if (state.backtestTickers.length > 0) {
            state.backtestTicker = state.backtestTickers[0];
            initBacktestStudio(state.backtestTicker);
        } else {
            state.backtestTicker = null;
            const resContainer = document.getElementById('btSummaryCardsGrid');
            if (resContainer) {
                resContainer.innerHTML = '<div class="glass-card" style="grid-column: 1 / -1; padding: 25px; text-align: center; color: var(--text-muted);">No backtest asset selected. Click [Search Asset] above to load a symbol.</div>';
            }
        }
    }

    renderBacktestWatchlistPills();
}

/**
 * Synchronize Backtest Studio Assets with the active Watchlist
 */
function syncBacktestWithWatchlist() {
    const btn = document.getElementById('btnSyncBacktestWatchlist');
    if (btn && btn.classList.contains('syncing')) return;
    if (btn) btn.classList.add('syncing');

    const icon = btn?.querySelector('.sync-icon');
    if (icon) icon.classList.add('spinning');

    // Retrieve active watchlist tickers
    let sourceTickers = [];
    if (Array.isArray(state.watchlistTickers) && state.watchlistTickers.length > 0) {
        sourceTickers = [...state.watchlistTickers];
    } else {
        try {
            const raw = localStorage.getItem('findashiq_watchlist_tickers');
            if (raw) sourceTickers = JSON.parse(raw);
        } catch (e) { }
    }

    if (!Array.isArray(sourceTickers) || sourceTickers.length === 0) {
        sourceTickers = ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
    }

    // Deduplicate while preserving order
    const seen = new Set();
    const cleanList = [];
    sourceTickers.forEach(t => {
        const cleanT = String(t || '').toUpperCase().trim();
        if (cleanT && !seen.has(cleanT)) {
            seen.add(cleanT);
            cleanList.push(cleanT);
        }
    });

    state.backtestTickers = cleanList;
    try {
        localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
    } catch (e) { }

    // Ensure active backtest ticker is in the synced list
    if (state.backtestTickers.length > 0) {
        if (!state.backtestTicker || !state.backtestTickers.includes(state.backtestTicker)) {
            state.backtestTicker = state.backtestTickers[0];
            initBacktestStudio(state.backtestTicker);
        }
    }

    // Re-render Backtest Watchlist Pills
    renderBacktestWatchlistPills();

    // Visual feedback: definitively stop spinning and show synced feedback
    setTimeout(() => {
        const currentBtn = document.getElementById('btnSyncBacktestWatchlist');
        const currentIcon = currentBtn?.querySelector('.sync-icon');
        const currentLabel = currentBtn?.querySelector('.sync-label');

        if (currentIcon) currentIcon.classList.remove('spinning');
        if (currentBtn) {
            currentBtn.classList.remove('syncing');
            currentBtn.classList.add('synced');
        }
        if (currentLabel) currentLabel.textContent = 'Synced!';

        setTimeout(() => {
            const b = document.getElementById('btnSyncBacktestWatchlist');
            const ic = b?.querySelector('.sync-icon');
            const l = b?.querySelector('.sync-label');
            if (ic) ic.classList.remove('spinning');
            if (b) b.classList.remove('synced', 'syncing');
            if (l) l.textContent = 'Sync to Watchlist';
        }, 1600);
    }, 450);
}

let _isPreloadingBacktestQuotes = false;
async function preloadBacktestTickersQuotes() {
    if (_isPreloadingBacktestQuotes) return;
    const missing = (state.backtestTickers || []).filter(t => {
        const s = state.stocksData[t] || state.watchlistData[t];
        return !s || (!s.currentPrice && !s.profile?.currentPrice);
    });
    if (missing.length === 0) return;

    _isPreloadingBacktestQuotes = true;
    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tickers: missing,
                period: '1mo',
                interval: '1d',
                phase: 'fast'
            })
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.stocks) {
                Object.keys(data.stocks).forEach(tk => {
                    const existing = state.stocksData[tk] || {};
                    state.stocksData[tk] = {
                        ...existing,
                        ...data.stocks[tk],
                        currentPrice: data.stocks[tk].currentPrice || data.stocks[tk].profile?.currentPrice
                    };
                });
                renderBacktestWatchlistPills();
            }
        }
    } catch (e) {
        console.warn('Preload backtest quotes failed:', e);
    } finally {
        _isPreloadingBacktestQuotes = false;
    }
}

/**
 * Set active backtest ticker and refresh studio
 */
function setBacktestTicker(ticker) {
    if (!ticker) return;
    const cleanT = ticker.toUpperCase().trim();
    if (!state.backtestTickers) state.backtestTickers = [];
    if (!state.backtestTickers.some(t => String(t || '').toUpperCase().trim() === cleanT)) {
        state.backtestTickers.push(cleanT);
        try {
            localStorage.setItem('findashiq_backtest_tickers', JSON.stringify(state.backtestTickers));
        } catch (e) { }
    }
    state.backtestTicker = cleanT;

    // Immediately toggle active class and loading spinner in DOM for instant visual response
    document.querySelectorAll('#btWatchlistTabsList .bt-asset-tab').forEach(tab => {
        const isMatch = tab.dataset.ticker === cleanT;
        tab.classList.toggle('active', isMatch);
        if (isMatch) {
            tab.classList.add('is-loading');
        } else {
            tab.classList.remove('is-loading');
        }
    });

    const stock = state.stocksData[cleanT];
    const hasData = stock && stock.timeseries && stock.timeseries.length >= 20;
    showBacktestLoading(
        cleanT,
        hasData ? `Analyzing ${cleanT}...` : `Fetching Data for ${cleanT}...`,
        hasData ? 'Simulating strategy models & rendering equity curve...' : 'Fetching daily historical candles & computing multi-factor indicators...'
    );

    initBacktestStudio(cleanT);
}

/**
 * Apply ticker entered manually
 */
function applyBacktestTicker(ticker) {
    if (!ticker) return;
    setBacktestTicker(ticker);
}

/**
 * Deep-link directly into backtest studio from Deep-Dive stock header or AI Matrix
 */
function launchBacktestFromCurrentStock(ticker = null) {
    const target = (ticker || state.activeTicker || state.backtestTicker || 'NVDA').toUpperCase().trim();
    state.backtestTicker = target;
    switchTopTab('backtest');
}

/**
 * Sync UI control states with current state variables
 */
function syncBacktestControlsUI() {
    // Timeframe buttons
    document.querySelectorAll('#btTimeframeGroup .btn-toggle, #btTimeframeGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tf === state.backtestTimeframe);
    });

    // Mode buttons
    const btnLongOnly = document.getElementById('btModeLongOnly');
    const btnLongShort = document.getElementById('btModeLongShort');
    if (btnLongOnly) btnLongOnly.classList.toggle('active', state.backtestMode === 'long_only');
    if (btnLongShort) btnLongShort.classList.toggle('active', state.backtestMode === 'long_short');

    // Strategy select
    const stratSelect = document.getElementById('btStrategySelect');
    if (stratSelect && state.backtestStrategy) stratSelect.value = state.backtestStrategy;

    // Risk inputs
    const capInput = document.getElementById('btCapitalInput');
    const slInput = document.getElementById('btStopLossInput');
    const tpInput = document.getElementById('btTakeProfitInput');
    const slipInput = document.getElementById('btSlippageInput');
    if (capInput) capInput.value = state.backtestCapital;
    if (slInput) slInput.value = state.backtestStopLoss;
    if (tpInput) tpInput.value = state.backtestTakeProfit;
    if (slipInput) slipInput.value = state.backtestSlippage;

    // Trade markers toggle
    const btnMarkers = document.getElementById('btnToggleTradeMarkers');
    const textMarkers = document.getElementById('btnToggleTradeMarkersText');
    const isMarkersOn = state.backtestShowTradeMarkers === true;
    if (btnMarkers) btnMarkers.classList.toggle('active', isMarkersOn);
    if (textMarkers) textMarkers.textContent = isMarkersOn ? 'Markers: On' : 'Markers: Off';
}

/**
 * Set timeframe (0ms in-memory slice)
 */
function setBacktestTimeframe(tf) {
    if (!tf) return;
    state.backtestTimeframe = tf;
    document.querySelectorAll('#btTimeframeGroup .btn-toggle, #btTimeframeGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tf === tf);
    });
    recalculateCurrentBacktest();
}

/**
 * Toggle execution mode (long-only vs long & short)
 */
function setBacktestMode(mode) {
    if (!mode) return;
    state.backtestMode = mode;
    const btnLongOnly = document.getElementById('btModeLongOnly');
    const btnLongShort = document.getElementById('btModeLongShort');
    if (btnLongOnly) btnLongOnly.classList.toggle('active', mode === 'long_only');
    if (btnLongShort) btnLongShort.classList.toggle('active', mode === 'long_short');
    recalculateCurrentBacktest();
}

/**
 * Change strategy dropdown or matrix table selection
 */
function onBacktestStrategySelectChange(strategy) {
    if (!strategy) return;
    state.backtestStrategy = strategy;
    const stratSelect = document.getElementById('btStrategySelect');
    if (stratSelect) {
        stratSelect.value = strategy;
    }
    recalculateCurrentBacktest();
}
window.onBacktestStrategySelectChange = onBacktestStrategySelectChange;

// -------------------------------------------------------------
// HIGH-PERFORMANCE IN-MEMORY SIMULATION CACHE & INPUT DEBOUNCER
// -------------------------------------------------------------
const _backtestCache = new Map();
const MAX_BACKTEST_CACHE_SIZE = 80;

function getBacktestCacheKey(ticker, tf, strategy, options) {
    return [
        (ticker || state.backtestTicker || 'NVDA').toUpperCase().trim(),
        tf || options?.timeframe || state.backtestTimeframe || '1y',
        strategy,
        options?.initialCapital ?? state.backtestCapital ?? 10000,
        options?.stopLossPct ?? state.backtestStopLoss ?? 5.0,
        options?.takeProfitPct ?? state.backtestTakeProfit ?? 12.0,
        options?.slippagePct ?? state.backtestSlippage ?? 0.10,
        options?.mode ?? state.backtestMode ?? 'long_only'
    ].join('::');
}

let _btDebounceTimer = null;
function debouncedRecalculateBacktest(delay = 150) {
    if (_btDebounceTimer) {
        clearTimeout(_btDebounceTimer);
    }
    _btDebounceTimer = setTimeout(() => {
        _btDebounceTimer = null;
        recalculateCurrentBacktest();
    }, delay);
}
window.debouncedRecalculateBacktest = debouncedRecalculateBacktest;

/**
 * Backwards compatibility bridge
 */
function renderBacktest() {
    recalculateCurrentBacktest();
}

/**
 * Core Orchestrator: Recalculates and updates all UI elements
 */
async function recalculateCurrentBacktest(expectedReqId = null) {
    if (expectedReqId !== null && expectedReqId !== _backtestCurrentRequestId) {
        return;
    }

    // 1. Sync User-Configured Risk Inputs
    const capEl = document.getElementById('btCapitalInput');
    const slEl = document.getElementById('btStopLossInput');
    const tpEl = document.getElementById('btTakeProfitInput');
    const slipEl = document.getElementById('btSlippageInput');
    const stratEl = document.getElementById('btStrategySelect');

    if (capEl) state.backtestCapital = parseFloat(capEl.value) || 10000;
    if (slEl) state.backtestStopLoss = parseFloat(slEl.value) || 5.0;
    if (tpEl) state.backtestTakeProfit = parseFloat(tpEl.value) || 12.0;
    if (slipEl) state.backtestSlippage = parseFloat(slipEl.value) || 0.10;
    if (stratEl) {
        if (state.backtestStrategy) {
            stratEl.value = state.backtestStrategy;
        } else {
            state.backtestStrategy = stratEl.value || 'omni_consensus';
        }
    }

    const ticker = state.backtestTicker || 'NVDA';
    const stock = state.stocksData[ticker];
    const activeTf = (state.backtestTimeframe || '1y').toLowerCase();

    const TF_BARS_MAP = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 1260
    };
    const minRequiredBars = Math.min(TF_BARS_MAP[activeTf] || 252, 1260);

    const isFetchedForTf = stock && (stock._backtestFetchedTf === activeTf || (stock.timeseries && stock.timeseries.length >= minRequiredBars));

    if (!stock || !stock.timeseries || (!isFetchedForTf && stock.timeseries.length < minRequiredBars)) {
        showBacktestLoading(ticker, `Loading ${activeTf.toUpperCase()} history for ${ticker}...`);
        try {
            await loadBacktestStockData(ticker, activeTf);
            if (expectedReqId !== null && expectedReqId !== _backtestCurrentRequestId) return;
            if (state.stocksData[ticker] && state.stocksData[ticker].timeseries && state.stocksData[ticker].timeseries.length >= 5) {
                await recalculateCurrentBacktest(expectedReqId);
            } else {
                hideBacktestLoading();
                const eqContainer = document.getElementById('equityChartContainer');
                if (eqContainer) {
                    eqContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No historical market data returned for ${escapeHtml(ticker)}. Please verify symbol.</div>`;
                }
            }
        } catch (e) {
            hideBacktestLoading();
        }
        return;
    }

    if (!stock || !stock.timeseries || stock.timeseries.length < 5) {
        hideBacktestLoading();
        const eqContainer = document.getElementById('equityChartContainer');
        if (eqContainer) {
            eqContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Insufficient historical market data returned for ${escapeHtml(ticker)} (minimum 5 daily bars required).</div>`;
        }
        return;
    }

    // Update overlay text to let user know charts are rendering
    if (_isBacktestLoading) {
        const titleEl = document.getElementById('btChartsLoadingTitle');
        const subtextEl = document.getElementById('btChartsLoadingSubtext');
        const badgeText = document.getElementById('btHeaderLoadingText');
        if (titleEl) titleEl.textContent = `Rendering Charts for ${escapeHtml(ticker)}...`;
        if (subtextEl) subtextEl.textContent = 'Plotting algorithmic equity curve & net return...';
        if (badgeText) badgeText.textContent = `Rendering ${ticker}...`;
    }

    const options = {
        ticker: ticker,
        timeframe: state.backtestTimeframe || '1y',
        initialCapital: state.backtestCapital,
        stopLossPct: state.backtestStopLoss,
        takeProfitPct: state.backtestTakeProfit,
        slippagePct: state.backtestSlippage,
        mode: state.backtestMode || 'long_only'
    };

    const bt = calculateClientBacktest(stock.timeseries, state.backtestStrategy, options);
    _currentBacktestResult = bt;

    if (!bt) {
        hideBacktestLoading();
        return;
    }

    // 2. Populate Header & Subtitle Context
    const instCurr = stock.profile?.currency || 'USD';
    const baseCurr = getUserBaseCurrency();
    const assetName = getAssetCompanyName(ticker, stock);
    const subtitleEl = document.getElementById('btStudioSubtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `${assetName} (${ticker}) — ${bt.totalBars} Bars Analyzed (${state.backtestTimeframe.toUpperCase()} Slice) — Mode: ${state.backtestMode === 'long_short' ? 'Long & Short (Derivatives)' : 'Long-Only (Spot Equity)'}`;
    }

    // 3. Populate Scorecards Ribbon
    const returnPct = bt.strategyReturnPct || 0;
    const bhPct = bt.buyHoldReturnPct || 0;
    const alpha = bt.alpha || (returnPct - bhPct);
    const isReturnPositive = returnPct >= 0;

    const returnEl = document.getElementById('btReturnVal');
    if (returnEl) {
        returnEl.textContent = `${isReturnPositive ? '+' : ''}${returnPct.toFixed(2)}%`;
        returnEl.style.color = isReturnPositive ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    setText('btBenchVal', `Buy & Hold: ${bhPct >= 0 ? '+' : ''}${bhPct.toFixed(2)}% (Alpha: ${alpha >= 0 ? '+' : ''}${alpha.toFixed(2)}%)`);
    setText('btCapitalVal', formatPrice(bt.finalEquity || 10000, instCurr, baseCurr));

    let positionText = '⚪ Position: In Cash (100%)';
    if (bt.isCurrentlyHolding) {
        positionText = bt.holdingSide === 'SHORT'
            ? '🔴 Position: ACTIVE SHORT (Derivatives)'
            : '🟢 Position: ACTIVE LONG (In Market)';
    }
    setText('btHoldingStatus', positionText);
    setText('btWinRateVal', `${(bt.winRatePct || 0).toFixed(1)}%`);
    setText('btTradesCount', `${bt.totalTrades || 0} Closed Trades (${bt.winningTrades || 0} Wins / ${bt.losingTrades || 0} Losses)`);
    setText('btProfitFactor', `${(bt.profitFactor || 1).toFixed(2)}x`);
    setText('btMaxDrawdown', `Max Drawdown: -${(bt.maxDrawdownPct || 0).toFixed(2)}%`);
    setText('btSharpeVal', bt.sharpeRatio.toFixed(2));
    setText('btSortinoVal', `Sortino Ratio: ${bt.sortinoRatio.toFixed(2)}`);


    // 4. Render Dual-Pane Charts with In-Place Updates & Buy/Sell Annotations
    try {
        // Minimum overlay display time ensures the indicator is visible even when
        // stock data is cached and chart renders complete nearly instantly.
        // Runs in parallel with chart renders — no extra latency when renders take longer.
        await Promise.all([
            renderEquityChart(bt.equityCurve, bt.trades),
            renderDrawdownChart(bt.equityCurve, bt.trades),
            _isBacktestLoading ? new Promise(resolve => setTimeout(resolve, 300)) : Promise.resolve()
        ]);

        if (expectedReqId !== null && expectedReqId !== _backtestCurrentRequestId) {
            return;
        }

        // Give the browser one frame to paint rendered charts before releasing overlay
        await new Promise(resolve => requestAnimationFrame(resolve));
    } catch (renderErr) {
        console.error('[recalculateCurrentBacktest] Chart rendering error:', renderErr);
    } finally {
        if (expectedReqId === null || expectedReqId === _backtestCurrentRequestId) {
            hideBacktestLoading();
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 80);
        }
    }

    // 5. Render Multi-Strategy Comparative Matrix Grid (Non-blocking background frame)
    scheduleMultiStrategyComparison(stock.timeseries, options);
}

/**
 * 0ms Slicing & Algorithmic Strategy Backtesting Simulation Engine
 */
function calculateClientBacktest(rawTimeseries, strategy, options = {}) {
    if (!rawTimeseries || rawTimeseries.length < 5) return null;

    const ticker = options.ticker || state.backtestTicker || 'NVDA';
    const tf = options.timeframe || state.backtestTimeframe || '1y';
    const initialCapital = Number(options.initialCapital || state.backtestCapital || 10000);
    const stopLossPct = Number(options.stopLossPct ?? state.backtestStopLoss ?? 5.0);
    const takeProfitPct = Number(options.takeProfitPct ?? state.backtestTakeProfit ?? 12.0);
    const slippagePct = Number(options.slippagePct ?? state.backtestSlippage ?? 0.10);
    const mode = options.mode || state.backtestMode || 'long_only';

    const cacheKey = getBacktestCacheKey(ticker, tf, strategy, {
        initialCapital, stopLossPct, takeProfitPct, slippagePct, mode
    });

    if (!options.bypassCache && _backtestCache.has(cacheKey)) {
        return _backtestCache.get(cacheKey);
    }

    // 0ms In-Memory Timeframe Slice (~252 trading days/yr)
    const TF_BARS = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 999999
    };
    const barsCount = TF_BARS[tf.toLowerCase()] || 252;
    const timeseries = rawTimeseries.slice(-barsCount);

    if (timeseries.length < 5) return null;

    let capital = initialCapital;
    let position = 0; // shares: >0 for Long, <0 for Short, 0 for Cash
    let entryPrice = 0;
    let entryDate = '';
    let entryReason = '';
    const slippageRate = (slippagePct / 100);

    const trades = [];
    const closedTrades = [];
    const equityCurve = [];
    const initialPrice = timeseries[0].close || 1;
    let peakEquity = capital;
    let maxDrawdown = 0;

    timeseries.forEach((p, idx) => {
        const date = p.time;
        const ts = p.timestamp || new Date(date).getTime();
        const close = p.close;
        const high = p.high || close;
        const low = p.low || close;
        if (!close) return;

        const prevP = idx > 0 ? timeseries[idx - 1] : null;
        const prevClose = prevP ? prevP.close : close;

        let exitedThisBar = false;

        // -------------------------------------------------------------
        // 1. INTRA-BAR RISK CHECKS: Stop-Loss & Take-Profit
        // -------------------------------------------------------------
        if (position > 0) {
            // Check Long Stop-Loss
            if (low <= entryPrice * (1 - stopLossPct / 100)) {
                const exitPrice = entryPrice * (1 - stopLossPct / 100) * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'SELL',
                    side: 'LONG_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: position,
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🛑 Stop-Loss Hit (-${stopLossPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
            // Check Long Take-Profit
            else if (high >= entryPrice * (1 + takeProfitPct / 100)) {
                const exitPrice = entryPrice * (1 + takeProfitPct / 100) * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'SELL',
                    side: 'LONG_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: position,
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🎯 Take-Profit Reached (+${takeProfitPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
        } else if (position < 0 && mode === 'long_short') {
            // Check Short Stop-Loss
            if (high >= entryPrice * (1 + stopLossPct / 100)) {
                const exitPrice = entryPrice * (1 + stopLossPct / 100) * (1 + slippageRate);
                const pnl = (entryPrice - exitPrice) * Math.abs(position);
                const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100;
                capital = capital + pnl;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'COVER',
                    side: 'SHORT_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: Math.abs(position),
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🛑 Short Stop-Loss Hit (-${stopLossPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
            // Check Short Take-Profit
            else if (low <= entryPrice * (1 - takeProfitPct / 100)) {
                const exitPrice = entryPrice * (1 - takeProfitPct / 100) * (1 + slippageRate);
                const pnl = (entryPrice - exitPrice) * Math.abs(position);
                const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100;
                capital = capital + pnl;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'COVER',
                    side: 'SHORT_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: Math.abs(position),
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: `🎯 Short Take-Profit Reached (+${takeProfitPct.toFixed(1)}%)`
                };
                trades.push(tradeRecord);
                closedTrades.push(tradeRecord);
                position = 0;
                exitedThisBar = true;
            }
        }

        // -------------------------------------------------------------
        // 2. STRATEGY SIGNAL GENERATION
        // -------------------------------------------------------------
        let buySignal = false;
        let sellSignal = false;
        let buyReason = '';
        let sellReason = '';

        if (strategy === 'omni_consensus') {
            // 👑 Omni-Consensus Master Ensemble: All 9 Indicators Unified
            let score = 0;
            let maxScore = 0;

            // 1. AI Conviction Indicator (Weight: 2.0)
            const rawConv = (p.aiConviction !== undefined ? p.aiConviction : p.conviction);
            const convScore = (rawConv !== undefined && rawConv !== null && !isNaN(rawConv))
                ? Number(rawConv)
                : (50 + (p.superTrendDir === 1 ? 20 : -20) + ((p.macdHist || 0) > 0 ? 15 : -15));
            const normConv = Math.max(-1, Math.min(1, (convScore - 50) / 50));
            score += normConv * 2.0;
            maxScore += 2.0;

            // 2. SuperTrend (Weight: 1.5)
            score += (p.superTrendDir === 1 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            // 3. EMA 9 / 21 Cross (Weight: 1.5)
            const ema9 = p.ema9 || p.sma20 || close;
            const ema21 = p.ema21 || p.sma50 || close;
            score += (ema9 > ema21 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            // 4. MACD Momentum & Histogram (Weight: 1.5)
            score += ((p.macdHist || 0) > 0 ? 1 : -1) * 1.5;
            maxScore += 1.5;

            // 5. Chaikin Money Flow (CMF) (Weight: 1.5)
            const cmf = p.cmf || 0;
            score += (cmf > 0.04 ? 1 : (cmf < -0.04 ? -1 : 0)) * 1.5;
            maxScore += 1.5;

            // 6. Bollinger Bands Volatility & Mean-Reversion (Weight: 1.0)
            if (p.bbUpper && p.bbLower) {
                if (close < p.bbLower) score += 1.0;
                else if (close > p.bbUpper) score -= 1.0;
                else score += (close > (p.bbUpper + p.bbLower) / 2 ? 0.3 : -0.3);
            }
            maxScore += 1.0;

            // 7. RSI Relative Strength (Weight: 1.0)
            const rsi = p.rsi || 50;
            score += (rsi > 52 ? 1 : (rsi < 48 ? -1 : 0)) * 1.0;
            maxScore += 1.0;

            // 8. Stochastic Oscillator Cross (Weight: 1.0)
            if (p.stochK && p.stochD) {
                score += (p.stochK > p.stochD ? 1 : -1) * 1.0;
            }
            maxScore += 1.0;

            // 9. VWAP / Volume Regime (Weight: 1.0)
            if (p.vwap) {
                score += (close > p.vwap ? 1 : -1) * 1.0;
            } else {
                score += (close > (p.sma20 || close) ? 0.5 : -0.5);
            }
            maxScore += 1.0;

            const consensusPct = (score / maxScore) * 100;
            if (consensusPct >= 35 && (idx === 0 || position <= 0)) {
                buySignal = true;
                buyReason = `👑 Omni-Consensus Bullish (+${consensusPct.toFixed(0)}% Agreement)`;
            } else if (consensusPct <= -35 || (consensusPct < 0 && position > 0)) {
                sellSignal = true;
                sellReason = `👑 Omni-Consensus Bearish (${consensusPct.toFixed(0)}% Agreement)`;
            }
        } else if (strategy === 'ai_conviction') {
            const rawConv = (p.aiConviction !== undefined ? p.aiConviction : p.conviction);
            const convScore = (rawConv !== undefined && rawConv !== null && !isNaN(rawConv))
                ? Number(rawConv)
                : (50 + (p.superTrendDir === 1 ? 20 : -20) + ((p.macdHist || 0) > 0 ? 15 : -15));
            if (convScore >= 60 && (idx === 0 || position <= 0)) {
                buySignal = true;
                buyReason = `🤖 AI High Conviction (${convScore.toFixed(0)}% Score)`;
            } else if (convScore <= 40 || (convScore < 48 && position > 0)) {
                sellSignal = true;
                sellReason = `🤖 AI Conviction Weakened (${convScore.toFixed(0)}% Score)`;
            }
        } else if (strategy === 'supertrend') {
            if (p.superTrendDir === 1 && (idx === 0 || !prevP || prevP.superTrendDir !== 1 || position <= 0)) {
                buySignal = true;
                buyReason = 'SuperTrend Uptrend Regime (Green)';
            } else if (p.superTrendDir === -1) {
                sellSignal = true;
                sellReason = 'SuperTrend Downtrend Regime (Red)';
            }
        } else if (strategy === 'ema_cross') {
            const ema9 = p.ema9 || p.sma20 || close;
            const ema21 = p.ema21 || p.sma50 || close;
            const prevEma9 = prevP ? (prevP.ema9 || prevP.sma20 || prevClose) : ema9;
            const prevEma21 = prevP ? (prevP.ema21 || prevP.sma50 || prevClose) : ema21;
            if (ema9 > ema21 && (idx === 0 || prevEma9 <= prevEma21 || position <= 0)) {
                buySignal = true;
                buyReason = 'EMA 9 / 21 Golden Cross';
            } else if (ema9 < ema21 && (idx === 0 || prevEma9 >= prevEma21 || position > 0)) {
                sellSignal = true;
                sellReason = 'EMA 9 / 21 Death Cross';
            }
        } else if (strategy === 'bollinger') {
            if (p.bbLower && close <= p.bbLower * 1.01 && (idx === 0 || prevClose > (prevP?.bbLower || 0) * 1.01 || position <= 0)) {
                buySignal = true;
                buyReason = 'Bollinger Lower Band Oversold Bounce';
            } else if (p.bbUpper && close >= p.bbUpper * 0.99) {
                sellSignal = true;
                sellReason = 'Bollinger Upper Band Overbought Exhaustion';
            }
        } else if (strategy === 'momentum') {
            const isBullish = (p.macdHist || 0) > 0 && (p.rsi || 50) > 50;
            const prevBullish = prevP ? ((prevP.macdHist || 0) > 0 && (prevP.rsi || 50) > 50) : false;
            if (isBullish && (idx === 0 || !prevBullish || position <= 0)) {
                buySignal = true;
                buyReason = `MACD Expansion + Bullish RSI (${(p.rsi || 50).toFixed(1)})`;
            } else if ((p.macdHist || 0) < 0 || (p.rsi || 50) < 45) {
                sellSignal = true;
                sellReason = 'MACD Contraction & Weakening Momentum';
            }
        } else if (strategy === 'stochastic') {
            const k = p.stochK || 50;
            const d = p.stochD || 50;
            const prevK = prevP ? (prevP.stochK || 50) : k;
            const prevD = prevP ? (prevP.stochD || 50) : d;
            if (k > d && k < 80 && (idx === 0 || prevK <= prevD || position <= 0)) {
                buySignal = true;
                buyReason = 'Stochastic %K > %D Bullish Rebound';
            } else if (k < d && (idx === 0 || prevK >= prevD || position > 0)) {
                sellSignal = true;
                sellReason = 'Stochastic %K < %D Bearish Cross';
            }
        } else if (strategy === 'cmf_breakout') {
            const isBreakout = (p.cmf || 0) > 0.05 && close > (p.sma20 || close);
            const prevBreakout = prevP ? ((prevP.cmf || 0) > 0.05 && prevClose > (prevP.sma20 || prevClose)) : false;
            if (isBreakout && (idx === 0 || !prevBreakout || position <= 0)) {
                buySignal = true;
                buyReason = `CMF Accumulation (+${(p.cmf || 0).toFixed(2)}) above SMA20`;
            } else if ((p.cmf || 0) < -0.05 || (position > 0 && close < (p.sma20 || close) * 0.98)) {
                sellSignal = true;
                sellReason = `CMF Institutional Distribution (${(p.cmf || 0).toFixed(2)})`;
            }
        }

        // -------------------------------------------------------------
        // 3. ORDER EXECUTION & POSITION STATE MACHINE
        // -------------------------------------------------------------
        if (mode === 'long_only') {
            if (position === 0 && buySignal && !exitedThisBar) {
                const execPrice = close * (1 + slippageRate);
                const shares = capital / execPrice;
                position = shares;
                entryPrice = execPrice;
                entryDate = date;
                entryReason = buyReason;
                trades.push({
                    id: trades.length + 1,
                    action: 'BUY',
                    side: 'LONG',
                    date: date,
                    timestamp: ts,
                    price: execPrice,
                    shares: shares,
                    capital: capital,
                    reason: buyReason
                });
            } else if (position > 0 && sellSignal) {
                const exitPrice = close * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                const tradeRecord = {
                    id: trades.length + 1,
                    action: 'SELL',
                    side: 'LONG_EXIT',
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
        } else {
            // Mode: Long & Short (Bidirectional Derivatives)
            if (position === 0 && !exitedThisBar) {
                if (buySignal) {
                    const execPrice = close * (1 + slippageRate);
                    const shares = capital / execPrice;
                    position = shares;
                    entryPrice = execPrice;
                    entryDate = date;
                    entryReason = buyReason;
                    trades.push({
                        id: trades.length + 1,
                        action: 'BUY (LONG)',
                        side: 'LONG',
                        date: date,
                        timestamp: ts,
                        price: execPrice,
                        shares: shares,
                        capital: capital,
                        reason: buyReason
                    });
                } else if (sellSignal) {
                    const execPrice = close * (1 - slippageRate);
                    const shares = capital / execPrice;
                    position = -shares;
                    entryPrice = execPrice;
                    entryDate = date;
                    entryReason = sellReason;
                    trades.push({
                        id: trades.length + 1,
                        action: 'SELL (SHORT)',
                        side: 'SHORT',
                        date: date,
                        timestamp: ts,
                        price: execPrice,
                        shares: shares,
                        capital: capital,
                        reason: sellReason
                    });
                }
            } else if (position > 0 && sellSignal) {
                // Close Long and Flip to Short
                const exitPrice = close * (1 - slippageRate);
                const pnl = (exitPrice - entryPrice) * position;
                const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
                capital = position * exitPrice;

                trades.push({
                    id: trades.length + 1,
                    action: 'SELL (CLOSE LONG)',
                    side: 'LONG_EXIT',
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
                });
                closedTrades.push(trades[trades.length - 1]);

                // Flip to Short
                const shortShares = capital / exitPrice;
                position = -shortShares;
                entryPrice = exitPrice;
                entryDate = date;
                trades.push({
                    id: trades.length + 1,
                    action: 'SELL (OPEN SHORT)',
                    side: 'SHORT',
                    date: date,
                    timestamp: ts,
                    price: exitPrice,
                    shares: shortShares,
                    capital: capital,
                    reason: `Flip to Short: ${sellReason}`
                });
            } else if (position < 0 && buySignal) {
                // Close Short and Flip to Long
                const exitPrice = close * (1 + slippageRate);
                const pnl = (entryPrice - exitPrice) * Math.abs(position);
                const pnlPct = ((entryPrice - exitPrice) / entryPrice) * 100;
                capital = capital + pnl;

                trades.push({
                    id: trades.length + 1,
                    action: 'COVER (CLOSE SHORT)',
                    side: 'SHORT_EXIT',
                    entryDate: entryDate,
                    date: date,
                    timestamp: ts,
                    entryPrice: entryPrice,
                    price: exitPrice,
                    shares: Math.abs(position),
                    pnl: pnl,
                    pnlPct: pnlPct,
                    capital: capital,
                    reason: buyReason
                });
                closedTrades.push(trades[trades.length - 1]);

                // Flip to Long
                const longShares = capital / exitPrice;
                position = longShares;
                entryPrice = exitPrice;
                entryDate = date;
                trades.push({
                    id: trades.length + 1,
                    action: 'BUY (OPEN LONG)',
                    side: 'LONG',
                    date: date,
                    timestamp: ts,
                    price: exitPrice,
                    shares: longShares,
                    capital: capital,
                    reason: `Flip to Long: ${buyReason}`
                });
            }
        }

        // -------------------------------------------------------------
        // 4. MARK-TO-MARKET PORTFOLIO VALUATION & DRAWDOWN
        // -------------------------------------------------------------
        let currentEquity = capital;
        if (position > 0) {
            currentEquity = position * close;
        } else if (position < 0) {
            currentEquity = capital + (entryPrice - close) * Math.abs(position);
        }

        const buyHoldEquity = initialCapital * (close / initialPrice);

        if (currentEquity > peakEquity) peakEquity = currentEquity;
        const dd = Math.max(0, ((peakEquity - currentEquity) / peakEquity) * 100);
        if (dd > maxDrawdown) maxDrawdown = dd;

        equityCurve.push({
            date: date,
            timestamp: ts,
            strategyEquity: currentEquity,
            buyHoldEquity: buyHoldEquity,
            drawdownPct: dd,
            inMarket: position !== 0
        });
    });

    const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].strategyEquity : capital;
    const finalBuyHold = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].buyHoldEquity : capital;
    const stratReturn = ((finalEquity - initialCapital) / initialCapital) * 100;
    const bhReturn = ((finalBuyHold - initialCapital) / initialCapital) * 100;

    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) <= 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    const grossProfit = winningTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + (t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 1.0);

    // Calculate Sharpe and Sortino Ratios from daily equity returns
    let dailyReturns = [];
    for (let i = 1; i < equityCurve.length; i++) {
        const prev = equityCurve[i - 1].strategyEquity || 1;
        const curr = equityCurve[i].strategyEquity || 1;
        dailyReturns.push((curr - prev) / prev);
    }
    let meanReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
    let variance = dailyReturns.length > 1 ? dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (dailyReturns.length - 1) : 0;
    let stdDev = Math.sqrt(variance);

    let downsideVariance = dailyReturns.length > 1 ? dailyReturns.reduce((a, b) => a + Math.pow(Math.min(0, b), 2), 0) / (dailyReturns.length - 1) : 0;
    let downsideStdDev = Math.sqrt(downsideVariance);

    const annualFactor = Math.sqrt(252);
    const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * annualFactor : 0;
    const sortinoRatio = downsideStdDev > 0 ? (meanReturn / downsideStdDev) * annualFactor : (sharpeRatio > 0 ? 99 : 0);

    const result = {
        strategy: strategy,
        totalBars: timeseries.length,
        initialCapital: initialCapital,
        finalEquity: finalEquity,
        strategyReturnPct: stratReturn,
        buyHoldReturnPct: bhReturn,
        alpha: stratReturn - bhReturn,
        maxDrawdownPct: maxDrawdown,
        sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
        sortinoRatio: isNaN(sortinoRatio) ? 0 : sortinoRatio,
        totalTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRatePct: winRate,
        profitFactor: profitFactor,
        isCurrentlyHolding: position !== 0,
        holdingSide: position > 0 ? 'LONG' : (position < 0 ? 'SHORT' : 'CASH'),
        trades: trades,
        closedTrades: closedTrades,
        equityCurve: equityCurve
    };

    if (_backtestCache.size >= MAX_BACKTEST_CACHE_SIZE) {
        const oldestKey = _backtestCache.keys().next().value;
        _backtestCache.delete(oldestKey);
    }
    _backtestCache.set(cacheKey, result);

    return result;
}

/**
 * Render Upper Chart: Strategy Portfolio Value vs Buy & Hold Benchmark
 */
/**
 * Helper: Attach SVG titles to annotation markers for tooltips
 */
function attachAnnotationTitles(container, pointAnnotations) {
    setTimeout(() => {
        try {
            const annotationGroups = container.querySelectorAll('.apexcharts-point-annotations g');
            annotationGroups.forEach((g, idx) => {
                const anno = pointAnnotations[idx];
                if (!anno || !anno.tradeData) return;
                const t = anno.tradeData;
                const pnlText = t.pnl !== undefined ? `\nRealized PnL: ${t.pnl >= 0 ? '+' : ''}$${Math.abs(t.pnl).toFixed(2)} (${(t.pnlPct || 0) >= 0 ? '+' : ''}${Number(t.pnlPct || 0).toFixed(2)}%)` : '';
                const tooltipText = `${t.action} @ $${Number(t.price || 0).toFixed(2)}\nDate: ${t.date || ''}\nShares: ${Number(t.shares || 0).toFixed(2)}\nCapital: $${Number(t.capital || 0).toFixed(2)}${pnlText}\nSignal: ${t.reason || 'Technical Trigger'}`;

                let titleEl = g.querySelector('title');
                if (!titleEl) {
                    titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                    g.appendChild(titleEl);
                }
                titleEl.textContent = tooltipText;
                g.style.cursor = 'pointer';
            });
        } catch (e) {
            console.warn('Could not attach SVG annotation titles:', e);
        }
    }, 80);
}

/**
 * Render Upper Chart: Strategy Portfolio Value vs Buy & Hold Benchmark
 */
async function renderEquityChart(equityCurve, trades = []) {
    if (!equityCurve || equityCurve.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#equityChartContainer");
    if (!container) return;

    const themeOpts = getChartThemeDefaults();
    const initialCapital = Number(state.backtestCapital || equityCurve[0]?.strategyEquity || 10000);

    const stratSeries = equityCurve.map(p => ({
        x: p.timestamp || new Date(p.date).getTime(),
        y: Math.round(p.strategyEquity * 100) / 100
    }));

    const bhSeries = equityCurve.map(p => ({
        x: p.timestamp || new Date(p.date).getTime(),
        y: Math.round(p.buyHoldEquity * 100) / 100
    }));

    // Strategy net outcome color: Green (#10b981) for overall profit/gain, Red (#ef4444) for loss
    const finalStratEquity = stratSeries.length > 0 ? stratSeries[stratSeries.length - 1].y : initialCapital;
    const isGain = finalStratEquity >= initialCapital;
    const stratColor = isGain ? '#10b981' : '#ef4444';

    // Update legend dot & header icon dynamically
    const stratDot = document.getElementById('btStratLegendDot');
    if (stratDot) stratDot.style.background = stratColor;
    const eqIcon = document.getElementById('btEquityTitleIcon');
    if (eqIcon) eqIcon.style.color = stratColor;
    const retDot = document.getElementById('btReturnLegendDot');
    if (retDot) retDot.style.background = stratColor;
    const retIcon = document.getElementById('btReturnTitleIcon');
    if (retIcon) retIcon.style.color = stratColor;

    // Dynamic Y-axis scale to ensure strategy and buy&hold curves are always clearly and fully visible
    const allVals = [...stratSeries.map(p => p.y), ...bhSeries.map(p => p.y)].filter(v => typeof v === 'number' && !isNaN(v));
    const dataMin = allVals.length > 0 ? Math.min(...allVals) : 0;
    const dataMax = allVals.length > 0 ? Math.max(...allVals) : 10000;
    const yMin = Math.floor(Math.min(dataMin * 0.95, initialCapital * 0.95));
    const yMax = Math.ceil(Math.max(dataMax * 1.05, initialCapital * 1.05));

    const yaxisConfig = {
        min: yMin,
        max: yMax,
        forceNiceScale: true,
        labels: {
            style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' },
            formatter: val => `$${val ? Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 }) : ''}`
        }
    };

    // Build lookup maps for trades by date and timestamp
    const tradesByDate = new Map();
    const tradesByTs = new Map();
    (trades || []).forEach(t => {
        if (t.date) tradesByDate.set(t.date, t);
        if (t.timestamp) tradesByTs.set(t.timestamp, t);
    });

    // Store current data maps globally for tooltip dynamic lookup
    window._btActiveTradesByDate = tradesByDate;
    window._btActiveTradesByTs = tradesByTs;
    window._btActiveTradesList = trades || [];
    window._btActiveEquityCurve = equityCurve;

    // Build Point Annotations for BUY / SELL executions on the Strategy equity line (only if enabled)
    const equityByTs = new Map();
    stratSeries.forEach(pt => equityByTs.set(pt.x, pt.y));

    const pointAnnotations = [];
    const showMarkers = state.backtestShowTradeMarkers === true;

    if (showMarkers && trades && trades.length > 0) {
        trades.forEach(t => {
            const ts = t.timestamp || new Date(t.date).getTime();
            let matchingEquity = equityByTs.get(ts);
            if (matchingEquity === undefined) {
                const curvePt = equityCurve.find(p => (p.timestamp === ts) || (p.date === t.date));
                matchingEquity = curvePt ? Math.round(curvePt.strategyEquity * 100) / 100 : (t.capital || 10000);
            }

            // Accurate trade badge colors:
            // Long Entry -> Green (#10b981)
            // Short Entry -> Amber (#f59e0b)
            // Exits with Profit -> Green (#10b981)
            // Exits with Loss -> Red (#ef4444)
            let badgeColor = '#10b981';
            const actionUpper = (t.action || '').toUpperCase();
            if (t.side === 'LONG' || actionUpper.includes('BUY')) {
                badgeColor = '#10b981';
            } else if (t.side === 'SHORT' || actionUpper.includes('SHORT')) {
                badgeColor = '#f59e0b';
            }
            if (t.pnl !== undefined && (t.side === 'LONG_EXIT' || t.side === 'SHORT_EXIT' || actionUpper.includes('SELL') || actionUpper.includes('COVER') || actionUpper.includes('CLOSE'))) {
                badgeColor = (t.pnl >= 0) ? '#10b981' : '#ef4444';
            }

            pointAnnotations.push({
                x: ts,
                y: matchingEquity,
                marker: {
                    size: 6,
                    fillColor: badgeColor,
                    strokeColor: '#ffffff',
                    strokeWidth: 2,
                    shape: 'circle',
                    radius: 3,
                    hover: { size: 8.5 }
                },
                tradeData: t
            });
        });
    }

    // Cleanly recreate chart on data/strategy update to guarantee stroke widths, colors, and series rendering
    if (state.charts.equity) {
        try { state.charts.equity.destroy(); } catch (e) { console.warn(e); }
        state.charts.equity = null;
    }
    container.innerHTML = '';

    const options = {
        series: [
            { name: 'Strategy Portfolio ($)', data: stratSeries },
            { name: 'Buy & Hold Benchmark ($)', data: bhSeries }
        ],
        chart: {
            id: 'equityCurveChart',
            group: 'backtest_studio',
            type: 'line',
            height: 290,
            background: 'transparent',
            toolbar: { show: true, tools: { zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
            animations: { enabled: false }
        },
        annotations: {
            points: pointAnnotations
        },
        theme: { mode: themeOpts.themeMode },
        colors: [stratColor, '#64748b'],
        stroke: { width: [3.5, 2.0], dashArray: [0, 4], curve: 'smooth' },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: themeOpts.labelColor, fontSize: '11px', fontFamily: 'JetBrains Mono' }, datetimeFormatter: { month: 'MMM \'yy', day: 'dd MMM' } },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: yaxisConfig,
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: {
            theme: themeOpts.tooltipTheme,
            shared: true,
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const curve = window._btActiveEquityCurve || equityCurve;
                if (dataPointIndex < 0 || !curve || !curve[dataPointIndex]) return '';
                const p = curve[dataPointIndex];
                const stratVal = (p.strategyEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const bhVal = (p.buyHoldEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const d = new Date(p.timestamp || p.date);
                const dateStr = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

                // Check if an order was executed on this date
                const dateMap = window._btActiveTradesByDate || tradesByDate;
                const tsMap = window._btActiveTradesByTs || tradesByTs;
                const trade = dateMap?.get(p.date) || tsMap?.get(p.timestamp);
                let tradeHtml = '';

                if (trade) {
                    const actionUpper = (trade.action || '').toUpperCase();
                    let isTradeProfit = true;
                    if (trade.pnl !== undefined) {
                        isTradeProfit = (trade.pnl >= 0);
                    } else if (actionUpper.includes('BUY') || trade.side === 'LONG') {
                        isTradeProfit = true;
                    } else if (actionUpper.includes('SHORT')) {
                        isTradeProfit = true;
                    }
                    const isTradeBuy = trade.side === 'LONG' || actionUpper.includes('BUY');
                    const tradeColor = isTradeProfit ? '#10b981' : '#ef4444';
                    const tradeBg = isTradeProfit ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)';
                    const tradeBorder = isTradeProfit ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';

                    let pnlRow = '';
                    if (trade.pnl !== undefined && (trade.side === 'LONG_EXIT' || trade.side === 'SHORT_EXIT' || actionUpper.includes('SELL') || actionUpper.includes('COVER') || actionUpper.includes('CLOSE'))) {
                        const isPnlPos = (trade.pnl || 0) >= 0;
                        const pnlColor = isPnlPos ? '#10b981' : '#ef4444';
                        pnlRow = `
                            <div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; font-weight: 800; color: ${pnlColor}; font-size: 0.76rem;" class="mono">
                                <span>Realized PnL:</span>
                                <span>${isPnlPos ? '+' : ''}$${Math.abs(trade.pnl).toFixed(2)} (${(trade.pnlPct || 0) >= 0 ? '+' : ''}${Number(trade.pnlPct || 0).toFixed(2)}%)</span>
                            </div>
                        `;
                    }

                    tradeHtml = `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); background: ${tradeBg}; border: 1px solid ${tradeBorder}; border-radius: 6px; padding: 8px 10px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 800; font-size: 0.78rem;">
                                <span style="color: ${tradeColor}; display: flex; align-items: center; gap: 4px;">
                                    ${isTradeBuy ? '▲' : '▼'} ${escapeHtml(trade.action || 'ORDER')}
                                </span>
                                <span class="mono" style="color: var(--text-primary);">$${Number(trade.price || 0).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;" class="mono">
                                <span>${Number(trade.shares || 0).toFixed(2)} shares</span>
                                <span>Cap: $${Number(trade.capital || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            ${pnlRow}
                            ${trade.reason ? `
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px; line-height: 1.3; font-style: italic;">
                                    ${escapeHtml(trade.reason)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }

                return `
                    <div style="background: ${themeOpts.themeMode === 'light' ? '#ffffff' : '#0f172a'}; border: 1px solid ${themeOpts.themeMode === 'light' ? '#cbd5e1' : 'rgba(255,255,255,0.15)'}; border-radius: 8px; padding: 10px 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-family: Inter, system-ui, sans-serif; min-width: 220px; max-width: 300px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">
                            <span>${dateStr}</span>
                            ${trade ? `<span style="background: ${(trade.pnl !== undefined ? trade.pnl >= 0 : (trade.action && (trade.action.includes('BUY') || trade.side === 'LONG'))) ? '#059669' : '#dc2626'}; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800;">ORDER EXECUTED</span>` : ''}
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 0.76rem; margin-bottom: 3px;">
                            <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 5px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${stratColor}; display: inline-block;"></span>
                                Strategy Portfolio:
                            </span>
                            <strong class="mono" style="color: ${stratColor};">$${stratVal}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 0.76rem;">
                            <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 5px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b; display: inline-block;"></span>
                                Buy &amp; Hold:
                            </span>
                            <span class="mono" style="color: #94a3b8;">$${bhVal}</span>
                        </div>
                        ${tradeHtml}
                    </div>
                `;
            }
        }
    };

    state.charts.equity = new ApexCharts(container, options);
    await state.charts.equity.render();
    attachAnnotationTitles(container, pointAnnotations);
}

/**
 * Render Lower Chart: Performance Relative to Initial Investment (% Net Return vs Starting Capital)
 */
async function renderDrawdownChart(equityCurve, trades = []) {
    if (!equityCurve || equityCurve.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#drawdownChartContainer");
    if (!container) return;

    const themeOpts = getChartThemeDefaults();
    const initialCapital = Number(state.backtestCapital || equityCurve[0]?.strategyEquity || 10000);

    const stratSeries = equityCurve.map(p => {
        const retPct = initialCapital > 0 ? ((p.strategyEquity - initialCapital) / initialCapital) * 100 : 0;
        return {
            x: p.timestamp || new Date(p.date).getTime(),
            y: Math.round(retPct * 100) / 100
        };
    });

    const bhSeries = equityCurve.map(p => {
        const retPct = initialCapital > 0 ? ((p.buyHoldEquity - initialCapital) / initialCapital) * 100 : 0;
        return {
            x: p.timestamp || new Date(p.date).getTime(),
            y: Math.round(retPct * 100) / 100
        };
    });

    // Strategy net outcome color: Green for overall gain / positive return, Red for loss / negative return
    const finalStratReturn = stratSeries.length > 0 ? stratSeries[stratSeries.length - 1].y : 0;
    const isGain = finalStratReturn >= 0;
    const stratColor = isGain ? '#10b981' : '#ef4444';
    const stratGradientTo = isGain ? '#059669' : '#b91c1c';

    // Compute dynamic Y-axis bounds ensuring 0.0% Initial Capital baseline is visible and positive gains are fully shown
    const allVals = [...stratSeries.map(p => p.y), ...bhSeries.map(p => p.y)].filter(v => typeof v === 'number' && !isNaN(v));
    const dataMin = allVals.length > 0 ? Math.min(...allVals) : 0;
    const dataMax = allVals.length > 0 ? Math.max(...allVals) : 0;

    // Ensure comfortable headroom for positive winnings (+%) and negative drawdowns (-%) around 0.0%
    const yMin = Math.floor(Math.min(-5, dataMin < 0 ? dataMin * 1.15 : -5));
    const yMax = Math.ceil(Math.max(5, dataMax > 0 ? dataMax * 1.15 : 5));

    const yaxisConfig = {
        min: yMin,
        max: yMax,
        forceNiceScale: true,
        labels: {
            style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono' },
            formatter: val => `${val > 0 ? '+' : ''}${val !== null && val !== undefined ? Number(val).toFixed(1) : '0'}%`
        }
    };

    // Point Annotations for Trade Executions if enabled
    const showMarkers = state.backtestShowTradeMarkers === true;
    const activeTrades = trades && trades.length > 0 ? trades : (window._btActiveTradesList || []);
    const pointAnnotations = [];

    const stratByTs = new Map();
    stratSeries.forEach(pt => stratByTs.set(pt.x, pt.y));

    if (showMarkers && activeTrades && activeTrades.length > 0) {
        activeTrades.forEach(t => {
            const ts = t.timestamp || new Date(t.date).getTime();
            let matchingY = stratByTs.get(ts);
            if (matchingY === undefined) {
                const curvePt = equityCurve.find(p => (p.timestamp === ts) || (p.date === t.date));
                const eq = curvePt ? curvePt.strategyEquity : (t.capital || initialCapital);
                matchingY = initialCapital > 0 ? Math.round(((eq - initialCapital) / initialCapital) * 10000) / 100 : 0;
            }

            let badgeColor = '#10b981';
            const actionUpper = (t.action || '').toUpperCase();
            if (t.side === 'LONG' || actionUpper.includes('BUY')) {
                badgeColor = '#10b981';
            } else if (t.side === 'SHORT' || actionUpper.includes('SHORT')) {
                badgeColor = '#f59e0b';
            }
            if (t.pnl !== undefined && (t.side === 'LONG_EXIT' || t.side === 'SHORT_EXIT' || actionUpper.includes('SELL') || actionUpper.includes('COVER') || actionUpper.includes('CLOSE'))) {
                badgeColor = (t.pnl >= 0) ? '#10b981' : '#ef4444';
            }

            pointAnnotations.push({
                x: ts,
                y: matchingY,
                marker: {
                    size: 5.5,
                    fillColor: badgeColor,
                    strokeColor: '#ffffff',
                    strokeWidth: 2,
                    shape: 'circle',
                    radius: 3,
                    hover: { size: 8 }
                },
                tradeData: t
            });
        });
    }

    const annotationsConfig = {
        yaxis: [
            {
                y: 0,
                borderColor: 'rgba(148, 163, 184, 0.45)',
                strokeDashArray: 4,
                label: {
                    borderColor: 'transparent',
                    style: {
                        color: '#94a3b8',
                        background: themeOpts.themeMode === 'light' ? 'rgba(241, 245, 249, 0.85)' : 'rgba(15, 23, 42, 0.85)',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 600
                    },
                    text: '0.0% Initial Capital'
                }
            }
        ],
        points: pointAnnotations
    };

    if (state.charts.drawdown) {
        try { state.charts.drawdown.destroy(); } catch (e) { console.warn(e); }
        state.charts.drawdown = null;
    }
    container.innerHTML = '';

    const options = {
        series: [
            { name: 'Strategy (% vs Initial)', data: stratSeries },
            { name: 'Buy & Hold (% vs Initial)', data: bhSeries }
        ],
        chart: {
            id: 'relativeReturnCurveChart',
            group: 'backtest_studio',
            type: 'area',
            height: 200,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: [stratColor, '#64748b'],
        plotOptions: {
            area: {
                fillTo: 'origin'
            }
        },
        fill: {
            type: ['gradient', 'none'],
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: [stratGradientTo],
                inverseColors: false,
                opacityFrom: 0.35,
                opacityTo: 0.04,
                stops: [0, 100]
            }
        },
        stroke: { width: [2.5, 1.8], dashArray: [0, 4], curve: 'smooth' },
        annotations: annotationsConfig,
        xaxis: {
            type: 'datetime',
            labels: { show: false },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: yaxisConfig,
        grid: { borderColor: themeOpts.gridBorderColor, strokeDashArray: 3 },
        tooltip: {
            theme: themeOpts.tooltipTheme,
            shared: true,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: val => `${val > 0 ? '+' : ''}${val !== null && val !== undefined ? Number(val).toFixed(2) : '0.00'}% vs Initial`
            }
        }
    };

    state.charts.drawdown = new ApexCharts(container, options);
    await state.charts.drawdown.render();
    attachAnnotationTitles(container, pointAnnotations);
}

function toggleBacktestTradeMarkers() {
    state.backtestShowTradeMarkers = !state.backtestShowTradeMarkers;
    try {
        localStorage.setItem('findashiq_bt_trade_markers', state.backtestShowTradeMarkers ? '1' : '0');
    } catch (e) { }

    const btn = document.getElementById('btnToggleTradeMarkers');
    const text = document.getElementById('btnToggleTradeMarkersText');
    if (btn) btn.classList.toggle('active', state.backtestShowTradeMarkers);
    if (text) text.textContent = state.backtestShowTradeMarkers ? 'Markers: On' : 'Markers: Off';

    if (window._btActiveEquityCurve) {
        renderEquityChart(window._btActiveEquityCurve, window._btActiveTradesList || []);
        renderDrawdownChart(window._btActiveEquityCurve, window._btActiveTradesList || []);
    }
}

// Alias for semantic clarity
const renderRelativeReturnChart = renderDrawdownChart;

// -------------------------------------------------------------
// WEB WORKER & DEFERRED BENCHMARK MATRIX ENGINE (PHASES 2 & 3)
// -------------------------------------------------------------
let _backtestWorker = null;
let _backtestWorkerRequestId = 0;

function getBacktestWorker() {
    if (_backtestWorker !== null) return _backtestWorker;
    if (typeof Worker !== 'undefined') {
        try {
            const ver = window.__ASSET_VERSION__ || (Date.now().toString());
            _backtestWorker = new Worker(`/static/js/backtest_worker.js?v=${encodeURIComponent(ver)}`);
        } catch (e) {
            console.warn('[BacktestStudio] Web Worker init failed, using main-thread fallback:', e);
            _backtestWorker = false;
        }
    } else {
        _backtestWorker = false;
    }
    return _backtestWorker;
}

/**
 * Schedule non-blocking execution of the 8-strategy matrix
 */
function scheduleMultiStrategyComparison(timeseries, options) {
    const tbody = document.getElementById('btBenchmarkMatrixBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="matrix-loading-row">
                <td colspan="11" style="text-align: center; padding: 22px; color: var(--text-muted); font-size: 0.8rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <div class="bt-spinner-ring"></div>
                        <span>Simulating 8 comparative strategies for ${escapeHtml(options.ticker || state.backtestTicker || '')}...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    // Lightweight worker payload transfer optimization:
    // 1. Slice timeseries to the active timeframe (e.g. 252 bars for 1y instead of sending 11,500 bars)
    const TF_BARS = {
        '1mo': 22,
        '3mo': 65,
        '6mo': 130,
        '1y': 252,
        '2y': 504,
        '3y': 756,
        '5y': 1260,
        'max': 999999
    };
    const tfKey = (options.timeframe || state.backtestTimeframe || '1y').toLowerCase();
    const barsLimit = TF_BARS[tfKey] || 252;
    const sliced = (timeseries && timeseries.length > barsLimit) ? timeseries.slice(-barsLimit) : (timeseries || []);

    // 2. Strip all unused indicator fields (50 fields down to ~18 fields)
    const lightweightTimeseries = sliced.map(p => ({
        time: p.time,
        timestamp: p.timestamp,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
        superTrendDir: p.superTrendDir,
        macdHist: p.macdHist,
        ema9: p.ema9,
        ema21: p.ema21,
        sma20: p.sma20,
        sma50: p.sma50,
        cmf: p.cmf,
        bbUpper: p.bbUpper,
        bbLower: p.bbLower,
        rsi: p.rsi,
        stochK: p.stochK,
        stochD: p.stochD,
        vwap: p.vwap,
        conviction: p.aiConviction !== undefined ? p.aiConviction : p.conviction,
        aiConviction: p.aiConviction !== undefined ? p.aiConviction : p.conviction
    }));

    const worker = getBacktestWorker();
    if (worker) {
        const requestId = ++_backtestWorkerRequestId;
        let timeoutId = setTimeout(() => {
            if (_backtestWorkerRequestId === requestId) {
                console.warn('[BacktestStudio] Worker matrix timeout, falling back to main thread');
                renderMultiStrategyComparison(lightweightTimeseries, options);
            }
        }, 3000);

        worker.onmessage = function (e) {
            const data = e.data || {};
            if (data.action === 'matrix_result') {
                if (data.requestId === requestId) {
                    clearTimeout(timeoutId);
                    renderBenchmarkMatrixFromResults(data.results);
                }
            }
        };
        worker.onerror = function (err) {
            if (_backtestWorkerRequestId === requestId) {
                clearTimeout(timeoutId);
                console.warn('[BacktestWorker] Worker error, falling back to main thread:', err);
                renderMultiStrategyComparison(lightweightTimeseries, options);
            }
        };
        try {
            worker.postMessage({
                action: 'simulate_matrix',
                timeseries: lightweightTimeseries,
                options: options,
                requestId: requestId
            });
        } catch (postErr) {
            clearTimeout(timeoutId);
            console.warn('[BacktestWorker] Worker postMessage failed, falling back to main thread:', postErr);
            renderMultiStrategyComparison(lightweightTimeseries, options);
        }
    } else {
        // Deferred main-thread execution so primary charts & scorecards paint first
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => renderMultiStrategyComparison(lightweightTimeseries, options), { timeout: 100 });
        } else {
            setTimeout(() => renderMultiStrategyComparison(lightweightTimeseries, options), 0);
        }
    }
}

/**
 * Render Side-by-Side Multi-Strategy Comparative Matrix Grid (Synchronous or Fallback)
 */
function renderMultiStrategyComparison(timeseries, options) {
    if (!timeseries || timeseries.length < 5) return;

    const STRATEGIES = [
        { key: 'omni_consensus', name: '👑 Omni-Consensus Master Ensemble', desc: 'All 9 Indicators Unified' },
        { key: 'ai_conviction', name: '🤖 AI Conviction Model', desc: 'Dynamic Thresholding' },
        { key: 'supertrend', name: '📈 SuperTrend Trend Follower', desc: 'ATR Volatility Trailing' },
        { key: 'ema_cross', name: '⚡ EMA 9 / 21 Cross', desc: 'Golden / Death Cross' },
        { key: 'bollinger', name: '🎯 Bollinger Bands', desc: '20-day 2σ Mean Reversion' },
        { key: 'momentum', name: '🌊 MACD + RSI Dual Momentum', desc: 'Trend & Velocity' },
        { key: 'stochastic', name: '⚡ Stochastic Oscillator', desc: '14, 3, 3 Momentum Cross' },
        { key: 'cmf_breakout', name: '💧 CMF Volume Breakout', desc: 'Chaikin Money Flow' }
    ];

    const results = [];
    STRATEGIES.forEach(s => {
        const sim = calculateClientBacktest(timeseries, s.key, options);
        if (sim) {
            results.push({ ...s, sim: sim });
        }
    });

    results.sort((a, b) => b.sim.strategyReturnPct - a.sim.strategyReturnPct);
    renderBenchmarkMatrixFromResults(results);
}

/**
 * Render Benchmark Matrix DOM using DocumentFragment for maximum performance
 */
function renderBenchmarkMatrixFromResults(results) {
    const tbody = document.getElementById('btBenchmarkMatrixBody');
    if (!tbody || !results || results.length === 0) return;

    const fragment = document.createDocumentFragment();

    results.forEach(item => {
        const isCurrent = item.key === state.backtestStrategy;
        const returnPct = item.sim.strategyReturnPct || 0;
        const alpha = item.sim.alpha || 0;
        const isReturnPos = returnPct >= 0;
        const isAlphaPos = alpha >= 0;

        const tr = document.createElement('tr');
        if (isCurrent) tr.className = 'benchmark-row-active';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 700; color: ${isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)'}; display: flex; align-items: center; gap: 6px;">
                    ${escapeHtml(item.name)}
                    ${isCurrent ? '<span class="badge-pill badge-bullish" style="font-size: 0.65rem; padding: 2px 6px;">Active</span>' : ''}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(item.desc)}</div>
            </td>
            <td class="mono" style="font-size: 0.78rem;">${state.backtestMode === 'long_short' ? 'Long/Short' : 'Long-Only'}</td>
            <td class="mono" style="font-weight: 800; color: ${isReturnPos ? 'var(--accent-green)' : 'var(--accent-red)'};">
                ${isReturnPos ? '+' : ''}${returnPct.toFixed(2)}%
            </td>
            <td class="mono" style="font-weight: 700; color: ${isAlphaPos ? 'var(--accent-green)' : 'var(--accent-red)'};">
                ${isAlphaPos ? '+' : ''}${alpha.toFixed(2)}%
            </td>
            <td class="mono" style="font-weight: 700;">${(item.sim.winRatePct || 0).toFixed(1)}%</td>
            <td class="mono">${(item.sim.profitFactor || 1).toFixed(2)}x</td>
            <td class="mono" style="color: var(--accent-cyan); font-weight: 700;">${(item.sim.sharpeRatio || 0).toFixed(2)}</td>
            <td class="mono">${(item.sim.sortinoRatio || 0).toFixed(2)}</td>
            <td class="mono" style="color: var(--accent-red); font-weight: 700;">-${(item.sim.maxDrawdownPct || 0).toFixed(2)}%</td>
            <td class="mono" style="color: var(--text-secondary);">${item.sim.totalTrades || 0}</td>
            <td>
                ${isCurrent
                ? '<span class="badge-pill badge-neutral" style="font-size: 0.72rem;">Selected</span>'
                : `<button type="button" class="btn-toggle" onclick="onBacktestStrategySelectChange('${item.key}')" style="padding: 4px 10px; font-size: 0.75rem;">Select</button>`
            }
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

/**
 * Export Backtest Trades to CSV File
 */
function exportBacktestTradesCSV() {
    if (!_currentBacktestResult || !_currentBacktestResult.trades || _currentBacktestResult.trades.length === 0) {
        alert('No trades available to export. Run a backtest simulation first.');
        return;
    }

    const ticker = state.backtestTicker || 'NVDA';
    const strat = state.backtestStrategy || 'omni_consensus';
    const tf = state.backtestTimeframe || '1y';
    const trades = _currentBacktestResult.trades;

    const headers = ['Trade_ID', 'Action', 'Side', 'Entry_Date', 'Exit_Date', 'Execution_Price', 'Shares', 'PnL_USD', 'PnL_Percent', 'Portfolio_Capital', 'Reason'];
    const rows = trades.map(t => [
        t.id,
        `"${(t.action || '').replace(/"/g, '""')}"`,
        `"${(t.side || '').replace(/"/g, '""')}"`,
        t.entryDate || t.date || '',
        t.entryDate ? t.date : '',
        (t.price || 0).toFixed(2),
        (t.shares || 0).toFixed(4),
        (t.pnl || 0).toFixed(2),
        (t.pnlPct || 0).toFixed(2),
        (t.capital || 0).toFixed(2),
        `"${(t.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinDashIQ_Backtest_${ticker}_${strat}_${tf}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// FORWARD PAPER TRADING ENGINE (CLOUD-SYNCED & PERSISTENT)
// -------------------------------------------------------------

/**
 * Get user-isolated localStorage key for paper trades
 */
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
async function refreshPaperTradesLive() {
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

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
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
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
        const validCandles = timeseries.filter(p => typeof p.open === 'number' && typeof p.high === 'number' && typeof p.low === 'number' && typeof p.close === 'number' && !isNaN(p.open) && !isNaN(p.high) && !isNaN(p.low) && !isNaN(p.close));
        if (validCandles.length > 0) {
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
            const validLine = timeseries.filter(p => typeof p.close === 'number' && !isNaN(p.close));
            if (validLine.length > 0) {
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
        }
    } else {
        const validLine = timeseries.filter(p => typeof p.close === 'number' && !isNaN(p.close));
        if (validLine.length > 0) {
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
    }

    if (seriesData.length === 0) return;

    // 1. SuperTrend Overlay
    if (state.overlays.superTrend) {
        const stData = timeseries.filter(p => typeof p.superTrend === 'number' && !isNaN(p.superTrend)).map(p => ({
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
        const vwapData = timeseries.filter(p => typeof p.vwap === 'number' && !isNaN(p.vwap)).map(p => ({
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

    try {
        state.charts.primary = new ApexCharts(container, options);
        await state.charts.primary.render();
    } catch (chartErr) {
        console.warn('[renderPrimaryChart] ApexCharts render error:', chartErr);
    }
}

// -------------------------------------------------------------
// HISTORICAL AI CONVICTION SCORE CHART (ApexCharts)
// -------------------------------------------------------------

async function renderConvictionChart(timeseries) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    const container = document.querySelector("#convictionChartContainer");
    if (!container) return;

    if (state.charts.conviction) {
        try { state.charts.conviction.destroy(); } catch (e) { console.warn(e); }
        state.charts.conviction = null;
    }
    container.innerHTML = '';

    const themeOpts = getChartThemeDefaults();

    const convData = timeseries.filter(p => typeof p.aiConviction === 'number' && !isNaN(p.aiConviction)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.aiConviction
    }));

    const emaData = timeseries.filter(p => typeof p.aiConvictionEma === 'number' && !isNaN(p.aiConvictionEma)).map(p => ({
        x: p.timestamp || new Date(p.time).getTime(),
        y: p.aiConvictionEma
    }));

    if (convData.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Historical AI conviction data is being computed...</div>';
        return;
    }

    const latestConv = convData[convData.length - 1].y;
    const latestEma = emaData.length > 0 ? emaData[emaData.length - 1].y : latestConv;

    // Calculate stability & jitter metrics over active timeseries window
    const countAbove50 = convData.filter(p => p.y >= 50.0).length;
    const pctAbove50 = (countAbove50 / convData.length) * 100.0;

    let diffs = [];
    for (let i = 1; i < convData.length; i++) {
        diffs.push(Math.abs(convData[i].y - convData[i - 1].y));
    }
    const meanDiff = diffs.length > 0 ? (diffs.reduce((a, b) => a + b, 0) / diffs.length) : 0;
    const jitterVariance = diffs.length > 0 ? (diffs.reduce((acc, v) => acc + Math.pow(v - meanDiff, 2), 0) / diffs.length) : 0;
    const jitterStdDev = Math.sqrt(jitterVariance);

    // Update labels & badges
    setText('currentConvictionChartLabel', `Conviction: ${latestConv.toFixed(0)}% (EMA: ${latestEma.toFixed(0)}%)`);
    setText('convictionStabilityLabel', `${pctAbove50.toFixed(0)}% Days ≥50% • Jitter: ±${jitterStdDev.toFixed(1)} pts`);

    const badge = document.getElementById('convictionRegimeBadge');
    if (badge) {
        badge.className = 'badge-pill';
        if (pctAbove50 >= 75.0) {
            badge.classList.add('badge-bullish');
            badge.textContent = 'Stable Bullish Regime';
        } else if (pctAbove50 >= 50.0) {
            badge.classList.add('badge-bullish');
            badge.textContent = 'Moderate Bullish Bias';
        } else if (pctAbove50 >= 35.0) {
            badge.classList.add('badge-neutral');
            badge.textContent = 'Neutral / Transition';
        } else {
            badge.classList.add('badge-bearish');
            badge.textContent = 'Bearish Regime';
        }
    }

    const options = {
        series: [
            {
                name: 'AI Conviction (%)',
                type: 'area',
                data: convData
            },
            {
                name: '5-Day Trend (EMA)',
                type: 'line',
                data: emaData
            }
        ],
        chart: {
            id: 'convictionChart',
            height: 200,
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: themeOpts.themeMode },
        colors: ['#3b82f6', '#06b6d4'],
        stroke: {
            width: [2, 2.5],
            curve: 'smooth',
            dashArray: [0, 0]
        },
        fill: {
            type: ['gradient', 'solid'],
            gradient: {
                shade: themeOpts.themeMode,
                type: 'vertical',
                opacityFrom: 0.35,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        annotations: {
            yaxis: [
                {
                    y: 50,
                    borderColor: '#f59e0b',
                    strokeDashArray: 4,
                    borderWidth: 1.5
                }
            ]
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' },
                datetimeFormatter: { month: 'MMM', day: 'dd MMM' }
            },
            axisBorder: { color: themeOpts.axisBorderColor }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: {
                style: { colors: themeOpts.labelColor, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' },
                formatter: val => typeof val === 'number' ? val.toFixed(0) + '%' : ''
            }
        },
        grid: {
            borderColor: themeOpts.gridBorderColor,
            strokeDashArray: 3
        },
        tooltip: {
            theme: themeOpts.tooltipTheme,
            shared: true,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => {
                    if (typeof val !== 'number') return '';
                    const stance = val >= 75 ? 'Strong Bullish' : (val >= 60 ? 'Bullish' : (val >= 50 ? 'Moderate Bull' : (val >= 35 ? 'Neutral/Bear' : 'Strong Bearish')));
                    return `${val.toFixed(1)}% (${stance})`;
                }
            }
        }
    };

    state.charts.conviction = new ApexCharts(container, options);
    state.charts.conviction.render();
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

    if (stochK.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Stochastic oscillator data is being computed...</div>';
        return;
    }

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

    if (rsiData.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">RSI momentum data is being computed...</div>';
        return;
    }

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

    if (macdLine.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">MACD trend data is being computed...</div>';
        return;
    }

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

    if (cmfData.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Money flow data is being computed...</div>';
        return;
    }

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

        // Parse current input tickers or fallback to active ticker / default
        const inputVal = document.getElementById('tickerInput')?.value.trim();
        let inputTickers = inputVal ? inputVal.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) : [];
        if (inputTickers.length === 0) {
            inputTickers = [state.activeTicker || 'AAPL'];
            const inputEl = document.getElementById('tickerInput');
            if (inputEl) inputEl.value = inputTickers.join(', ');
        }

        if (!state.activeTicker || !inputTickers.includes(state.activeTicker)) {
            state.activeTicker = inputTickers[0];
        }

        // Render stock selector tabs immediately so active tab is visible right away
        renderStockSelector(inputTickers);

        const currentStock = state.stocksData[state.activeTicker];
        const hasTimeseries = currentStock && !currentStock.error && currentStock.timeseries && currentStock.timeseries.length > 0;

        if (hasTimeseries) {
            renderActiveStock();
            if (!currentStock.aiAnalysis && !_isAnalyzing) {
                handleAnalyze();
            }
        } else {
            if (currentStock && currentStock.profile) {
                renderActiveStock();
            }
            if (!_isAnalyzing) {
                handleAnalyze();
            }
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    } else if (tabKey === 'watchlist') {
        renderWatchlist();
    } else if (tabKey === 'scanner') {
        if (state.scannerResults && state.scannerResults.opportunities && state.scannerResults.opportunities.length > 0) {
            const searchInput = document.getElementById('scannerSearchQuery');
            if (searchInput && searchInput.value.trim()) {
                handleScannerSearchFilter(searchInput.value);
            } else {
                renderScannerResults(state.scannerResults.opportunities);
            }
            updateScannerTimingDisplay(state.scannerResults);
            syncScannerAdminControls(state.scannerResults);

            // Always check for background updates when opening tab if due or stale (>30s)
            const nowSec = Date.now() / 1000;
            const nextEpoch = state.scannerResults.nextScanEpoch || 0;
            const lastEpoch = state.scannerResults.timestamp_epoch || 0;
            if (nowSec >= nextEpoch || (nowSec - lastEpoch) > 30) {
                silentRefreshScannerCache();
            }
        } else {
            initScanner();
        }
    } else if (tabKey === 'backtest') {
        ensureApexChartsLoaded();
        renderPaperTrades();
        loadPaperTrades();
        initBacktestStudio();
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    } else if (tabKey === 'notifications') {
        populateAlertTickerOptions();
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
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(t => normalizeTicker(t)) : null;
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
    if (!state.watchlistData || Object.keys(state.watchlistData).length === 0) {
        const cached = loadWatchlistLocalCache();
        if (cached && Object.keys(cached).length > 0) {
            state.watchlistData = cached;
        }
    }

    if (state.watchlistData && Object.keys(state.watchlistData).length > 0) {
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
        if (res.ok) {
            const data = await res.json();
            if (data.tickers && data.tickers.length > 0) {
                state.watchlistTickers = data.tickers;
                saveWatchlistTickersLocal(data.tickers);
            }
        }
    } catch (e) {
        state.watchlistTickers = loadWatchlistTickersLocal() || state.watchlistTickers || ["NVDA", "MSFT", "IFX.DE", "TSM", "SPCX", "EXXT.DE", "XDWT.DE", "NEL.OL"];
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
                // Merge fast-path data into state seamlessly without wiping existing timeseries / AI
                Object.keys(fastData.stocks).forEach(tk => {
                    const existing = state.watchlistData[tk] || {};
                    state.watchlistData[tk] = {
                        ...existing,
                        ...fastData.stocks[tk],
                        timeseries: (existing.timeseries && existing.timeseries.length > 0 && typeof existing.timeseries[0]?.open === 'number') ? existing.timeseries : (fastData.stocks[tk].timeseries || []),
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
                // Merge full-path data into state
                Object.keys(fullData.stocks).forEach(tk => {
                    state.watchlistData[tk] = {
                        ...(state.watchlistData[tk] || {}),
                        ...fullData.stocks[tk]
                    };
                });
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
                        <div style="font-weight: 700; margin-bottom: 6px;">Unable to reach market data servers</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Please verify your network connection and retry.</div>
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
    } catch (e) { }

    // Persist to user profile if logged in
    if (state.user) {
        state.user.watchlistViewMode = cleanMode;
        try {
            fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watchlistViewMode: cleanMode })
            }).catch(() => { });
        } catch (e) { }
    }

    renderWatchlist();
}

function renderWatchlist() {
    try {
        if (!state.watchlistTickers) state.watchlistTickers = [];
        const cardsGrid = document.getElementById('watchlistCardsGrid');
        const tableWrapper = document.getElementById('watchlistTableWrapper');
        const countBadge = document.getElementById('topWatchlistCount');
        if (countBadge) countBadge.textContent = `${state.watchlistTickers.length} Stocks`;
        populateAlertTickerOptions();
        renderBacktestWatchlistPills();

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
    } catch (err) {
        console.error('[renderWatchlist] Unexpected error:', err);
        // Failsafe: clear spinner and show error state so the page is not stuck
        const cardsGrid = document.getElementById('watchlistCardsGrid');
        if (cardsGrid && cardsGrid.querySelector('.spinner')) {
            cardsGrid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 0.85rem; color: var(--accent-red); margin-bottom: 8px;">⚠️ Watchlist render error</div>
                    <div style="font-size: 0.78rem;">${err.message || 'Unknown error'}</div>
                </div>
            `;
        }
    }
}

function renderWatchlistTags() {
    // Lightweight count synchronization helper for backwards-compatibility
    const countBadge = document.getElementById('topWatchlistCount');
    if (countBadge) countBadge.textContent = `${state.watchlistTickers.length} Stocks`;
    populateAlertTickerOptions();
    renderBacktestWatchlistPills();
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

function formatTablePeriodChange(timeseries) {
    if (!timeseries || timeseries.length < 2) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';
    const closes = timeseries.map(p => p.close).filter(c => typeof c === 'number' && !isNaN(c));
    if (closes.length < 2) return '<span style="color: var(--text-muted); font-size: 0.75rem;">--</span>';

    const startPrice = closes[0];
    const endPrice = closes[closes.length - 1];
    const periodChangePct = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const isBull = periodChangePct >= 0;

    return `
        <span class="badge-pill ${isBull ? 'badge-bullish' : 'badge-bearish'}" style="font-size: 0.75rem; padding: 2px 8px;">
            ${isBull ? '+' : ''}${periodChangePct.toFixed(2)}%
        </span>
    `;
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

function detectWatchlistCatalyst(ticker, stock) {
    if (!stock || stock.error) return null;

    // 1. Direct viral catalyst if already computed (e.g. from scanner dataset)
    if (stock.viralCatalyst) return stock.viralCatalyst;

    const profile = stock.profile || {};
    const signals = stock.signals || {};
    const ai = stock.aiAnalysis || {};
    const indicators = signals.indicators || {};
    const changePercent = profile.changePercent || 0;
    const volRatio = profile.volumeRatio || 1.0;
    const news = stock.news || [];
    const rsiVal = indicators.RSI ? indicators.RSI.value : (indicators.RSI?.val || null);

    // 2. High-impact catalyst keyword detection in breaking news items
    const catalystKeywords = [
        'takeover', 'buyout', 'acquisition', 'surge', 'soar', 'skyrocket',
        'short squeeze', 'rally', 'beat', 'record profit', 'fda approval',
        'breakout', 'partnership', 'expansion', 'ai platform', 'upgrade', 'contract', 'growth'
    ];

    let foundNews = null;
    for (const n of news.slice(0, 8)) {
        const title = (n.title || '').toLowerCase();
        for (const kw of catalystKeywords) {
            if (title.includes(kw)) {
                foundNews = n;
                break;
            }
        }
        if (foundNews) break;
    }

    if (foundNews && (volRatio >= 1.15 || Math.abs(changePercent) >= 1.5)) {
        return {
            catalystType: '🔥 Viral Catalyst',
            headline: foundNews.title,
            summary: foundNews.summary || foundNews.description || '',
            publisher: foundNews.publisher || 'Financial Wire',
            time: foundNews.time || 'Active Session',
            volRatio: `${volRatio.toFixed(1)}x Vol`
        };
    }

    // 3. Heavy Institutional Volume Surge or Massive Session Price Mover
    if (volRatio >= 1.35 || Math.abs(changePercent) >= 3.0) {
        return {
            catalystType: '⚡ Volume Surge',
            headline: `Heavy Session Momentum (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% | ${volRatio.toFixed(1)}x Vol)`,
            summary: `Significant institutional activity detected (${volRatio.toFixed(1)}x vs 20-day SMA) with ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% session price movement.`,
            publisher: 'Exchange Tape Flow',
            time: 'Active Session',
            volRatio: `${volRatio.toFixed(1)}x Vol`
        };
    }

    // 4. Extreme RSI Oversold Mean-Reversion setup
    if (rsiVal !== null && rsiVal <= 28) {
        return {
            catalystType: '💎 Deep Oversold',
            headline: `Deep RSI Oversold Extreme (${rsiVal.toFixed(1)})`,
            summary: `RSI dropped to ${rsiVal.toFixed(1)}, entering historic oversold territory for asymmetric mean-reversion opportunity.`,
            publisher: 'Quantitative Scanner',
            time: 'Active Signal',
            volRatio: `${volRatio.toFixed(1)}x Vol`
        };
    }

    return null;
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
        const catalyst = detectWatchlistCatalyst(ticker, stock);

        card.innerHTML = `
            <div class="watchlist-card-header">
                <div class="watchlist-card-title-col">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div class="card-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                            <i data-lucide="grip-vertical" style="width: 14px; height: 14px;"></i>
                        </div>
                        <span class="watchlist-card-symbol">${ticker}</span>
                        ${catalyst ? `
                        <div class="catalyst-indicator-wrapper" onmouseenter="positionCatalystPopover(this)" onclick="handleScannerCatalystClick('${ticker}', event)" title="View Catalyst News">
                            <span class="catalyst-dot-pulse" aria-label="Market Catalyst Active"></span>
                            <div class="catalyst-hover-popover">
                                <div class="popover-cat-header">
                                    <span class="popover-cat-tag">${catalyst.catalystType || '🔥 Catalyst'}</span>
                                    <span class="popover-cat-vol mono">${catalyst.volRatio || ''}</span>
                                </div>
                                <div class="popover-cat-headline">${escapeHtml(catalyst.headline || '')}</div>
                                ${catalyst.summary ? `<div class="popover-cat-summary">${escapeHtml(catalyst.summary)}</div>` : ''}
                                <div class="popover-cat-footer">
                                    <span>${escapeHtml(catalyst.publisher || 'Wire')} • ${escapeHtml(catalyst.time || 'Active')}</span>
                                    <button type="button" class="popover-cat-btn" onclick="handleScannerCatalystClick('${ticker}', event)" title="Open Full News Story">
                                        <span>View News</span>
                                        <i data-lucide="external-link" style="width: 10px; height: 10px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ` : ''}
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

        const sixMonthHtml = formatTablePeriodChange(timeseries);
        const synthHtml = formatTableSynthesis(ai, stock);
        const catalyst = detectWatchlistCatalyst(ticker, stock);

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
                ${sixMonthHtml}
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
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span class="badge-pill ${stanceColor === 'bullish' ? 'badge-bullish' : (stanceColor === 'bearish' ? 'badge-bearish' : 'badge-neutral')}" style="font-size: 0.65rem; padding: 1px 6px;">${bias}</span>
                        ${catalyst ? `
                        <div class="catalyst-indicator-wrapper" onmouseenter="positionCatalystPopover(this)" onclick="handleScannerCatalystClick('${ticker}', event)" title="View Market Catalyst">
                            <span class="catalyst-dot-pulse" style="width: 8px; height: 8px;" aria-label="Market Catalyst Active"></span>
                            <div class="catalyst-hover-popover" style="text-align: left;">
                                <div class="popover-cat-header">
                                    <span class="popover-cat-tag">${catalyst.catalystType || '🔥 Catalyst'}</span>
                                    <span class="popover-cat-vol mono">${catalyst.volRatio || ''}</span>
                                </div>
                                <div class="popover-cat-headline">${escapeHtml(catalyst.headline || '')}</div>
                                ${catalyst.summary ? `<div class="popover-cat-summary">${escapeHtml(catalyst.summary)}</div>` : ''}
                                <div class="popover-cat-footer">
                                    <span>${escapeHtml(catalyst.publisher || 'Wire')} • ${escapeHtml(catalyst.time || 'Active')}</span>
                                    <button type="button" class="popover-cat-btn" onclick="handleScannerCatalystClick('${ticker}', event)" title="Open Full News Story">
                                        <span>View News</span>
                                        <i data-lucide="external-link" style="width: 10px; height: 10px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </td>
            <td style="text-align: center;">
                ${synthHtml}
            </td>
            <td style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button type="button" class="btn-table-action" onclick="openStockDeepDive('${ticker}')" title="Deep-Dive Single Stock Analysis">
                        <i data-lucide="arrow-right-circle" style="width: 14px; height: 14px;"></i>
                        <span>Deep Dive</span>
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

async function openStockDeepDive(ticker, targetSubtab = null) {
    if (!ticker) return;
    ticker = ticker.trim().toUpperCase();
    state.activeTicker = ticker;

    const tickerInput = document.getElementById('tickerInput');
    if (tickerInput) tickerInput.value = ticker;

    // Render stock selector immediately with the requested ticker tab active
    renderStockSelector([ticker]);

    // Switch to Terminal top tab
    switchTopTab('terminal');
    if (targetSubtab) {
        switchMainTab(targetSubtab);
    }

    const currentStock = state.stocksData[ticker];
    const hasFullData = currentStock && !currentStock.error && currentStock.timeseries && currentStock.timeseries.length > 0 && currentStock.aiAnalysis;

    if (hasFullData) {
        renderActiveStock();
    } else {
        if (state.watchlistData && state.watchlistData[ticker] && !state.watchlistData[ticker].error) {
            if (!state.stocksData[ticker]) {
                state.stocksData[ticker] = { ...state.watchlistData[ticker] };
            }
            renderActiveStock();
        }
        await handleAnalyze();
    }

    // Scroll to dashboard content
    document.getElementById('dashboardContent')?.scrollIntoView({ behavior: 'smooth' });
}

async function handleScannerCatalystClick(ticker, event) {
    if (event) {
        event.stopPropagation();
    }
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();

    const opp = state.scannerResults?.opportunities?.find(o => o.ticker === cleanTicker);
    const catalyst = opp?.viralCatalyst || null;

    // 1. Set active ticker for modal context
    state.activeTicker = cleanTicker;

    // 2. Open Global News Modal with catalyst preloaded (stays on current scanner page)
    const headlineQuery = catalyst?.headline ? catalyst.headline.slice(0, 32) : '';
    openGlobalNewsModal(cleanTicker, headlineQuery, 'all', catalyst);
}

function positionCatalystPopover(wrapper) {
    if (!wrapper) return;
    const popover = wrapper.querySelector('.catalyst-hover-popover');
    if (!popover) return;

    // Reset inline styles to read natural layout dimensions
    popover.style.left = '0px';
    popover.style.right = 'auto';

    const rect = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const pad = 14;

    // If popover bleeds past the right viewport boundary:
    if (rect.right > viewportWidth - pad) {
        const overflow = rect.right - (viewportWidth - pad);
        popover.style.left = `-${Math.ceil(overflow)}px`;
    }

    // Check if adjustment causes left overflow:
    const adjustedRect = popover.getBoundingClientRect();
    if (adjustedRect.left < pad) {
        popover.style.left = `${Math.ceil(pad - rect.left)}px`;
    }
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

let stockSearchModalMode = 'watchlist'; // 'watchlist' | 'deep-dive' | 'alert' | 'universe' | 'backtest'



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
    const doneBtn = document.getElementById('stockSearchDoneBtn') || document.querySelector('#addStockModal .btn-stock-search-done');
    const suggRow = document.getElementById('stockSearchSuggestionsRow');

    if (!modal) return;

    if (mode === 'alert') {
        if (titleEl) titleEl.textContent = 'Search Stock for Signal Alert';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol to configure signal alert trigger';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="bell-plus" style="color: var(--accent-purple); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Select any stock or ETF to populate into the Signal Alert Trigger configurator.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Close';
    } else if (mode === 'deep-dive') {
        if (titleEl) titleEl.textContent = 'Search Stock for Deep Dive';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol to analyze in Deep-Dive terminal';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="sparkles" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Select any exchange listing to load full technical and AI analysis in the Deep-Dive terminal.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Close';
    } else if (mode === 'universe' || mode === 'scanner') {
        if (titleEl) titleEl.textContent = 'Add Stock to Monitoring Universe';
        if (subtitleEl) subtitleEl.textContent = 'Search global stocks & ETFs to expand automated background scanner coverage';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="layers-plus" style="color: var(--accent-blue); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Added stocks are validated via live market data feeds and continuously monitored in background scans.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Done';

        if (!state.scannerUniverseTickers || state.scannerUniverseTickers.size === 0) {
            loadScannerUniverseTickers();
        }
    } else if (mode === 'backtest') {
        if (titleEl) titleEl.textContent = 'Search Asset for Backtesting';
        if (subtitleEl) subtitleEl.textContent = 'Search global equities & ETFs across international exchanges to run simulation';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="play-circle" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Click any stock or ETF to immediately load historical data and backtest strategies in the Studio.';
        if (input) input.placeholder = 'Search company name or ticker symbol (e.g. NVDA, AAPL, SAP.DE)...';
        if (doneBtn) doneBtn.textContent = 'Close';
        if (suggRow) {
            suggRow.innerHTML = `
                <span class="stock-search-suggestions-label">Quick Assets:</span>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('NVDA')">NVDA</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('AAPL')">AAPL</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('MSFT')">MSFT</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('TSLA')">TSLA</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('SAP')">SAP</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('PLTR')">PLTR</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('SPY')">SPY</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('QQQ')">QQQ</button>
            `;
        }
    } else {
        if (titleEl) titleEl.textContent = 'Add Stock to Watchlist';
        if (subtitleEl) subtitleEl.textContent = 'Search by company name or ticker symbol with exchange disambiguation';
        if (iconEl) iconEl.innerHTML = `<i data-lucide="plus-circle" style="color: var(--accent-cyan); width: 22px; height: 22px;"></i>`;
        if (footerNoteEl) footerNoteEl.textContent = 'Added stocks immediately sync to your personalized profile and compute quantitative indicators.';
        if (input) input.placeholder = 'e.g. Apple, PayPal, Infineon, SAP, NVDA, TSLA...';
        if (doneBtn) doneBtn.textContent = 'Done';
        if (suggRow) {
            suggRow.innerHTML = `
                <span class="stock-search-suggestions-label">Popular:</span>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Apple')">Apple</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('NVIDIA')">NVIDIA</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('PayPal')">PayPal</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Infineon')">Infineon</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('SAP')">SAP</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Microsoft')">Microsoft</button>
                <button type="button" class="stock-search-chip" onclick="setStockSearchQuery('Clean Energy')">Clean Energy</button>
            `;
        }
    }

    // Reset input state
    if (input) input.value = initialQuery || '';
    if (clearBtn) clearBtn.style.display = initialQuery ? 'flex' : 'none';
    if (spinner) spinner.style.display = 'none';

    // Show initial prompt or trigger search
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
                const rawResolved = batchData.resolved || [];
                const seenBatch = new Set();
                const resolved = [];
                for (const item of rawResolved) {
                    const tk = String(item.ticker || '').toUpperCase().trim();
                    if (tk && !seenBatch.has(tk)) {
                        seenBatch.add(tk);
                        resolved.push(item);
                    }
                }
                if (resolved.length > 0) {
                    const isUniMode = stockSearchModalMode === 'universe' || stockSearchModalMode === 'scanner';
                    const inWatchlist = (t) => state.watchlistTickers.includes(t);
                    const inUniverse = (t) => Boolean(state.scannerUniverseTickers && state.scannerUniverseTickers.has(t.toUpperCase()));

                    const unaddedWatchlist = resolved.filter(r => !inWatchlist(r.ticker));
                    const unaddedUniverse = resolved.filter(r => !inUniverse(r.ticker));

                    let batchHeaderHtml = '';
                    if (stockSearchModalMode === 'watchlist' && unaddedWatchlist.length > 1) {
                        batchHeaderHtml = `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: var(--radius-sm); margin-bottom: 8px;">
                                <span style="font-size: 0.82rem; font-weight: 600; color: var(--accent-cyan);">${resolved.length} stocks resolved</span>
                                <button type="button" class="btn-stock-search-add" onclick="handleAddBatchStocksModal(${JSON.stringify(unaddedWatchlist.map(u => u.ticker)).replace(/"/g, '&quot;')})">
                                    <i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i>
                                    <span>Add All (${unaddedWatchlist.length})</span>
                                </button>
                            </div>
                        `;
                    } else if (isUniMode && unaddedUniverse.length > 1) {
                        batchHeaderHtml = `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: var(--radius-sm); margin-bottom: 8px;">
                                <span style="font-size: 0.82rem; font-weight: 600; color: var(--accent-blue);">${resolved.length} stocks resolved</span>
                                <button type="button" class="btn-stock-search-add" onclick="handleAddBatchStocksUniverseModal(${JSON.stringify(unaddedUniverse.map(u => u.ticker)).replace(/"/g, '&quot;')})" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: transparent; color: #fff;">
                                    <i data-lucide="plus-circle" style="width: 13px; height: 13px;"></i>
                                    <span>Add All to Universe (${unaddedUniverse.length})</span>
                                </button>
                            </div>
                        `;
                    }

                    resultsList.innerHTML = batchHeaderHtml + resolved.map(item => {
                        const ticker = escapeHtml(item.ticker);
                        const name = escapeHtml(item.name || item.ticker);
                        const exchange = escapeHtml(item.exchange || 'Global');
                        const type = escapeHtml(item.type || 'EQUITY');
                        const isTracked = inWatchlist(item.ticker);
                        const isUni = inUniverse(item.ticker);

                        if (stockSearchModalMode === 'alert') {
                            return `
                                <div class="stock-search-item" onclick="handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4);">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">${name}</div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #8b5cf6, #2563eb); border-color: transparent; color: #fff;">
                                            <i data-lucide="bell-plus" style="width: 13px; height: 13px;"></i>
                                            <span>Select for Alert</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }

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

                        if (stockSearchModalMode === 'backtest') {
                            const isAdded = (state.backtestTickers || []).some(t => String(t || '').toUpperCase().trim() === ticker.toUpperCase());
                            const isActive = ticker.toUpperCase() === (state.backtestTicker || '').toUpperCase();
                            return `
                                <div class="stock-search-item ${isActive ? 'active-backtest-item' : ''}" onclick="handleSelectStockForBacktest('${ticker}')" style="cursor: pointer;">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border-color: rgba(6, 182, 212, 0.4);">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">
                                                ${name}
                                                ${isActive ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 700; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); padding: 1px 6px; border-radius: 4px;">CURRENTLY LOADED</span>' : (isAdded ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 600; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); padding: 1px 6px; border-radius: 4px;">IN STUDIO</span>' : '')}
                                            </div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        ${isAdded ? `
                                            <button type="button" class="btn-table-remove btn-icon" onclick="event.stopPropagation(); removeBacktestTicker('${ticker}', event); performStockSearch(document.getElementById('stockSearchInput')?.value || '');" title="Remove ${ticker} from Backtest Studio" aria-label="Remove ${ticker}" style="width: 30px; height: 30px;">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        ` : ''}
                                        ${isActive ? `
                                            <button type="button" class="btn-stock-search-add added" disabled style="opacity: 0.9; background: rgba(6, 182, 212, 0.18); color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.4);">
                                                <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                                <span>Active</span>
                                            </button>
                                        ` : `
                                            <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForBacktest('${ticker}')" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); border-color: transparent; color: #fff;">
                                                <i data-lucide="play-circle" style="width: 13px; height: 13px;"></i>
                                                <span>${isAdded ? 'Load in Studio' : 'Select for Backtest'}</span>
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }

                        if (isUniMode) {
                            return `
                                <div class="stock-search-item">
                                    <div class="stock-search-item-left">
                                        <div class="stock-search-ticker-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.35);">${ticker}</div>
                                        <div class="stock-search-details">
                                            <div class="stock-search-company-name" title="${name}">${name}</div>
                                            <div class="stock-search-meta-row">
                                                <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                                <span class="stock-search-tag type">${type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        ${isUni ? `
                                            <button type="button" class="btn-stock-search-add added" disabled>
                                                <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                                <span>In Universe</span>
                                            </button>
                                        ` : `
                                            <button type="button" class="btn-stock-search-add" onclick="handleAddStockToUniverseFromModal('${ticker}', this)" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: transparent; color: #fff;">
                                                <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                                <span>Add to Universe</span>
                                            </button>
                                        `}
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
        const rawResults = data.results || [];
        const seenTickers = new Set();
        const results = [];
        for (const item of rawResults) {
            const tk = String(item.ticker || '').toUpperCase().trim();
            if (tk && !seenTickers.has(tk)) {
                seenTickers.add(tk);
                results.push(item);
            }
        }

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
                const isUni = Boolean(state.scannerUniverseTickers && state.scannerUniverseTickers.has(item.ticker.toUpperCase()));
                const isUniMode = stockSearchModalMode === 'universe' || stockSearchModalMode === 'scanner';

                if (stockSearchModalMode === 'alert') {
                    return `
                        <div class="stock-search-item" onclick="handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4);">${ticker}</div>
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
                                <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForAlert('${ticker}', '${name.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #8b5cf6, #2563eb); border-color: transparent; color: #fff;">
                                    <i data-lucide="bell-plus" style="width: 13px; height: 13px;"></i>
                                    <span>Select for Alert</span>
                                </button>
                            </div>
                        </div>
                    `;
                }

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

                if (stockSearchModalMode === 'backtest') {
                    const isAdded = (state.backtestTickers || []).some(t => String(t || '').toUpperCase().trim() === ticker.toUpperCase());
                    const isActive = ticker.toUpperCase() === (state.backtestTicker || '').toUpperCase();
                    return `
                        <div class="stock-search-item ${isActive ? 'active-backtest-item' : ''}" onclick="handleSelectStockForBacktest('${ticker}')" style="cursor: pointer;">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border-color: rgba(6, 182, 212, 0.4);">${ticker}</div>
                                <div class="stock-search-details">
                                    <div class="stock-search-company-name" title="${name}">
                                        ${name}
                                        ${isActive ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 700; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); padding: 1px 6px; border-radius: 4px;">CURRENTLY LOADED</span>' : (isAdded ? '<span style="margin-left: 6px; font-size: 0.68rem; font-weight: 600; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); padding: 1px 6px; border-radius: 4px;">IN STUDIO</span>' : '')}
                                    </div>
                                    <div class="stock-search-meta-row">
                                        <span class="stock-search-tag exchange" title="Listing Exchange">${exchange}</span>
                                        <span class="stock-search-tag type">${type}</span>
                                        ${sector ? `<span class="stock-search-tag sector">${sector}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${isAdded ? `
                                    <button type="button" class="btn-table-remove btn-icon" onclick="event.stopPropagation(); removeBacktestTicker('${ticker}', event); performStockSearch(document.getElementById('stockSearchInput')?.value || '');" title="Remove ${ticker} from Backtest Studio" aria-label="Remove ${ticker}" style="width: 30px; height: 30px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                ` : ''}
                                ${isActive ? `
                                    <button type="button" class="btn-stock-search-add added" disabled style="opacity: 0.9; background: rgba(6, 182, 212, 0.18); color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.4);">
                                        <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                        <span>Active</span>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-stock-search-add" onclick="event.stopPropagation(); handleSelectStockForBacktest('${ticker}')" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); border-color: transparent; color: #fff;">
                                        <i data-lucide="play-circle" style="width: 13px; height: 13px;"></i>
                                        <span>${isAdded ? 'Load in Studio' : 'Select for Backtest'}</span>
                                    </button>
                                `}
                            </div>
                        </div>
                    `;
                }

                if (isUniMode) {
                    return `
                        <div class="stock-search-item">
                            <div class="stock-search-item-left">
                                <div class="stock-search-ticker-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.35);">${ticker}</div>
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
                                ${isUni ? `
                                    <button type="button" class="btn-stock-search-add added" disabled>
                                        <i data-lucide="check" style="width: 13px; height: 13px;"></i>
                                        <span>In Universe</span>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-stock-search-add" onclick="handleAddStockToUniverseFromModal('${ticker}', this)" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: transparent; color: #fff;">
                                        <i data-lucide="plus" style="width: 13px; height: 13px;"></i>
                                        <span>Add to Universe</span>
                                    </button>
                                `}
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

async function handleAddStockToUniverseFromModal(ticker, btnElement) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = `<div class="spinner-sm" style="width: 12px; height: 12px; border-width: 2px;"></div> <span>Adding...</span>`;
    }

    try {
        const res = await fetch('/api/scanner/universe/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: cleanTicker })
        });
        const data = await res.json();

        if (res.status === 409 || (!res.ok && data.message && data.message.includes('already in monitoring universe'))) {
            if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(cleanTicker);
            showAddUniverseAlert(data.message || `Stock ${cleanTicker} is already in monitoring universe`, 'duplicate');
            if (btnElement) {
                btnElement.classList.add('added');
                btnElement.disabled = true;
                btnElement.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> <span>In Universe</span>`;
            }
            return;
        }

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Failed to add ${cleanTicker} to universe.`);
        }

        if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(cleanTicker);

        if (btnElement) {
            btnElement.classList.add('added');
            btnElement.disabled = true;
            btnElement.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> <span>In Universe</span>`;
        }

        if (data.totalUniverse) {
            const uniCountBadge = document.getElementById('scanUniverseCountBadge');
            const statUni = document.getElementById('scanStatUniverse');
            if (uniCountBadge) uniCountBadge.textContent = `${data.totalUniverse} Stocks`;
            if (statUni) statUni.textContent = `${data.totalUniverse} Assets`;
        }

        // Close the modal so the user can see the scanner page and the success alert.
        // The new stock is queued for background analysis — it will appear after the next scan.
        closeAddStockModal();

        // Show the success alert on the now-visible scanner page.
        showAddUniverseAlert(
            `${data.message || `Added ${cleanTicker} to universe`} — it will appear in results after the next background scan.`,
            'success'
        );

        // Clear any stale ticker search query so results render in full.
        const searchInput = document.getElementById('scannerSearchQuery');
        if (searchInput) searchInput.value = '';

        // Immediately re-render existing results from memory — the new stock isn't in
        // the opportunity cache yet, but the existing ones should display right away.
        const currentOpps = state.allScannerOpportunities || state.scannerResults?.opportunities || [];
        if (currentOpps.length > 0) {
            renderScannerResults(currentOpps);
        } else {
            // Fallback: hit the server if local state is empty (e.g. cold-start edge case).
            await silentRefreshScannerCache();
        }

    } catch (err) {
        console.error('Add stock to universe error:', err);
        showAddUniverseAlert(err.message || 'Error adding stock to universe', 'error');
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = `<i data-lucide="plus" style="width: 13px; height: 13px;"></i> <span>Add to Universe</span>`;
        }
    } finally {
        if (typeof lucide !== 'undefined') lucide.createIcons();
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

function handleSelectStockForBacktest(ticker) {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    closeAddStockModal();

    if (state.activeTopTab !== 'backtest') {
        switchTopTab('backtest');
    }

    setBacktestTicker(cleanTicker);
}

function handleSelectStockForAlert(ticker, name = '') {
    if (!ticker) return;
    const cleanTicker = ticker.trim().toUpperCase();
    closeAddStockModal();

    if (state.activeTopTab !== 'notifications') {
        switchTopTab('notifications');
    }

    const tickerSelect = document.getElementById('alertTickerSelect');
    const customInput = document.getElementById('alertCustomTicker');

    if (tickerSelect) {
        let optExists = Array.from(tickerSelect.options).some(opt => opt.value.toUpperCase() === cleanTicker);
        if (!optExists) {
            const newOpt = document.createElement('option');
            newOpt.value = cleanTicker;
            newOpt.textContent = name ? `${cleanTicker} — ${name}` : cleanTicker;
            newOpt.selected = true;
            tickerSelect.insertBefore(newOpt, tickerSelect.firstChild);
        }
        tickerSelect.value = cleanTicker;
    }

    if (customInput) {
        customInput.value = cleanTicker;
    }

    updateAlertPreview();

    const formEl = document.getElementById('createAlertForm');
    if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function populateAlertTickerOptions() {
    const tickerSelect = document.getElementById('alertTickerSelect');
    if (!tickerSelect) return;
    const currentVal = tickerSelect.value;

    const trackedOptgroup = document.getElementById('alertWatchlistOptgroup') || tickerSelect.querySelector('optgroup[label*="Tracked"]') || tickerSelect.querySelector('optgroup');
    if (trackedOptgroup) {
        if (state.watchlistTickers && state.watchlistTickers.length > 0) {
            trackedOptgroup.innerHTML = state.watchlistTickers.map(ticker => {
                const stock = state.watchlistData?.[ticker] || state.stocksData?.[ticker];
                const name = stock?.profile?.name || stock?.name || ticker;
                return `<option value="${ticker}">${ticker} — ${name}</option>`;
            }).join('');
        } else {
            trackedOptgroup.innerHTML = `<option value="" disabled>(No stocks currently in watchlist)</option>`;
        }
    }

    if (currentVal && Array.from(tickerSelect.options).some(o => o.value === currentVal)) {
        tickerSelect.value = currentVal;
    } else {
        const firstValid = Array.from(tickerSelect.options).find(o => !o.disabled && o.value);
        if (firstValid) {
            tickerSelect.value = firstValid.value;
        }
    }
    updateAlertPreview();
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
            handleAnalyze(true);
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

async function handleAddBatchStocksUniverseModal(tickersList) {
    if (!Array.isArray(tickersList) || tickersList.length === 0) return;
    let addedCount = 0;
    for (const tk of tickersList) {
        const cleanTicker = String(tk || '').trim().toUpperCase();
        if (!cleanTicker) continue;
        try {
            const res = await fetch('/api/scanner/universe/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: cleanTicker })
            });
            if (res.ok) {
                addedCount++;
                if (state.scannerUniverseTickers) state.scannerUniverseTickers.add(cleanTicker);
            }
        } catch (e) { }
    }
    if (addedCount > 0) {
        showAddUniverseAlert(`Added ${addedCount} stocks to monitoring universe.`, 'success');
        closeAddStockModal();
        await silentRefreshScannerCache();
    }
}

function selectDeepDiveStock(ticker, event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('deepDiveSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';
    deepDiveSelectedIndex = -1;

    const input = document.getElementById('tickerInput');
    if (!input || !ticker) return;

    const cleanTicker = normalizeTicker(ticker.trim().toUpperCase());
    const fullVal = input.value || '';
    const parts = fullVal.split(',').map(p => p.trim()).filter(Boolean);

    if (parts.length <= 1) {
        input.value = cleanTicker;
        state.activeTicker = cleanTicker;
        renderStockSelector([cleanTicker]);
    } else {
        parts[parts.length - 1] = cleanTicker;
        const deduplicated = [...new Set(parts.map(p => normalizeTicker(p.toUpperCase())))];
        input.value = deduplicated.join(', ');
        state.activeTicker = cleanTicker;
        renderStockSelector(deduplicated);
    }

    const clearBtn = document.getElementById('tickerInputClearBtn');
    if (clearBtn) clearBtn.style.display = 'flex';

    // Clear active preset buttons
    document.querySelectorAll('.preset-chip').forEach(btn => btn.classList.remove('active'));

    handleAnalyze(true);
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
    const refreshBtn = document.querySelector('.btn-watchlist-refresh');
    const refreshIcon = refreshBtn?.querySelector('i[data-lucide="refresh-cw"]');
    if (refreshIcon) refreshIcon.classList.add('spin-animation');
    if (refreshBtn) refreshBtn.classList.add('refreshing');

    try {
        setWatchlistSyncStatus('syncing', 'Refreshing live quotes...');
        await fetchWatchlistAnalysis(true);
    } finally {
        if (refreshIcon) refreshIcon.classList.remove('spin-animation');
        if (refreshBtn) refreshBtn.classList.remove('refreshing');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

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
            const statUni = document.getElementById('scanStatUniverse');
            const uniCountBadge = document.getElementById('scanUniverseCountBadge');

            const totalUni = cached.results.totalUniverseScanned || cached.results.totalUniverse || (cached.results.opportunities || []).length;
            if (statUni) statUni.textContent = `${totalUni} Assets`;
            if (uniCountBadge) uniCountBadge.textContent = `${totalUni} Stocks`;

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
                const uniCountBadge = document.getElementById('scanUniverseCountBadge');
                const statUni = document.getElementById('scanStatUniverse');
                if (uniCountBadge && data.data.totalUniverse) {
                    uniCountBadge.textContent = `${data.data.totalUniverse} Stocks`;
                }
                if (statUni && data.data.totalUniverse) {
                    statUni.textContent = `${data.data.totalUniverse} Assets`;
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

    // Start live countdown timer to nextScanEpoch
    const targetEpoch = data.nextScanEpoch || state.scannerResults?.nextScanEpoch;
    if (targetEpoch) {
        startScannerCountdown(targetEpoch);
    } else if (data.nextScanInSeconds || state.scannerResults?.nextScanInSeconds) {
        const sec = data.nextScanInSeconds || state.scannerResults?.nextScanInSeconds;
        startScannerCountdown((Date.now() / 1000) + sec);
    }
}

let isScannerPollingRefresh = false;

function startScannerCountdown(nextScanEpoch) {
    if (scannerCountdownTimerId) {
        clearInterval(scannerCountdownTimerId);
        scannerCountdownTimerId = null;
    }

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

            // Poll every 4 seconds until the server publishes the updated scan results
            pollCounter++;
            if (pollCounter === 1 || pollCounter % 4 === 0) {
                if (!isScannerPollingRefresh) {
                    isScannerPollingRefresh = true;
                    silentRefreshScannerCache().finally(() => {
                        isScannerPollingRefresh = false;
                    });
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
                if (data.universeTickers && Array.isArray(data.universeTickers)) {
                    state.scannerUniverseTickers = new Set(data.universeTickers.map(t => t.toUpperCase()));
                }

                updateScannerTimingDisplay(data);
                syncScannerAdminControls(data);

                // Update summary metrics for universe size
                const statUni = document.getElementById('scanStatUniverse');
                const uniCountBadge = document.getElementById('scanUniverseCountBadge');
                const totalUni = data.totalUniverseScanned || data.totalUniverse || (data.opportunities || []).length;
                if (statUni) statUni.textContent = `${totalUni} Assets`;
                if (uniCountBadge) uniCountBadge.textContent = `${totalUni} Stocks`;

                // Re-evaluate opportunities against active criteria (conviction, market, strategy, etc.)
                await handleRunScanner(false, 100, true);
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
            if (typeof lucide !== 'undefined') lucide.createIcons();
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

    if (typeof lucide !== 'undefined') lucide.createIcons();

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
            const uniCountBadge = document.getElementById('scanUniverseCountBadge');
            const statUni = document.getElementById('scanStatUniverse');
            if (uniCountBadge) uniCountBadge.textContent = `${data.totalUniverse} Stocks`;
            if (statUni) statUni.textContent = `${data.totalUniverse} Assets`;
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
            if (typeof lucide !== 'undefined') lucide.createIcons();
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
        const statUni = document.getElementById('scanStatUniverse');
        const statOpp = document.getElementById('scanStatOpportunities');
        const statConv = document.getElementById('scanStatTopConviction');
        const subBadge = document.getElementById('scanResultsSubBadge');
        const uniCountBadge = document.getElementById('scanUniverseCountBadge');
        const topBadge = document.getElementById('topScannerBadge');

        const opps = data.opportunities || [];
        const totalUni = data.totalUniverseScanned || data.totalUniverse || 0;
        const matchingCount = typeof data.opportunitiesCount === 'number' ? data.opportunitiesCount : opps.length;
        if (statUni) statUni.textContent = `${totalUni} Assets`;
        if (uniCountBadge) uniCountBadge.textContent = `${totalUni} Stocks`;
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
                if (typeof lucide !== 'undefined') lucide.createIcons();
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

    if (typeof lucide !== 'undefined') lucide.createIcons();
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
        if (typeof lucide !== 'undefined') lucide.createIcons();
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
                    <button type="button" class="btn-scanner-add-wl" onclick="addTickerFromScanner('${item.ticker}')">
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
        if (typeof lucide !== 'undefined') lucide.createIcons();
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

