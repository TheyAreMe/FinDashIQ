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
    'es': `<svg class="flag-svg" viewBox="0 0 750 500" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="750" height="500" fill="#AA151B"/><rect width="750" height="250" y="125" fill="#F1BF00"/></svg>`,
    'it': `<svg class="flag-svg" viewBox="0 0 3 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="2" x="0" fill="#009246"/><rect width="1" height="2" x="1" fill="#FFFFFF"/><rect width="1" height="2" x="2" fill="#CE2B37"/></svg>`,
    'se': `<svg class="flag-svg" viewBox="0 0 16 10" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="10" fill="#006AA7"/><path d="M5,0v10M0,5h16" stroke="#FECC00" stroke-width="2"/></svg>`,
    'eu': `<svg class="flag-svg" viewBox="0 0 3 2" width="16" height="11" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="2" fill="#003399"/><circle cx="1.5" cy="0.4" r="0.08" fill="#FFCC00"/><circle cx="1.5" cy="1.6" r="0.08" fill="#FFCC00"/><circle cx="0.9" cy="1" r="0.08" fill="#FFCC00"/><circle cx="2.1" cy="1" r="0.08" fill="#FFCC00"/><circle cx="1.1" cy="0.6" r="0.08" fill="#FFCC00"/><circle cx="1.9" cy="0.6" r="0.08" fill="#FFCC00"/><circle cx="1.1" cy="1.4" r="0.08" fill="#FFCC00"/><circle cx="1.9" cy="1.4" r="0.08" fill="#FFCC00"/></svg>`
};

function getCountryFlagSvg(code) {
    const clean = String(code || 'us').trim().toLowerCase();
    return SVG_COUNTRY_FLAGS[clean] || SVG_COUNTRY_FLAGS['us'];
}

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
    language: (function () {
        try {
            return localStorage.getItem('findashiq_language') || 'en';
        } catch (e) {
            return 'en';
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
