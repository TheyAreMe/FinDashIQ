// -------------------------------------------------------------
// PRIMARY DYNAMIC CHART RENDERING (ApexCharts)
// -------------------------------------------------------------

let _chartRenderGeneration = 0;
let _primaryRenderSeq = 0;

function buildChartRenderKey(ticker, timeseries, period) {
    const sym = String(ticker || '').trim().toUpperCase();
    const per = String(period || state?.currentPeriod || '6mo').trim().toLowerCase();
    const arr = Array.isArray(timeseries) ? timeseries : [];
    const len = arr.length;
    const firstTime = len > 0 ? (arr[0]?.time || arr[0]?.timestamp || '') : '';
    const lastPt = len > 0 ? arr[len - 1] : null;
    const lastTime = lastPt ? (lastPt.time || lastPt.timestamp || '') : '';
    const lastClose = (lastPt && typeof lastPt.close === 'number') ? lastPt.close : '';
    return `${sym}|${per}|${len}|${firstTime}|${lastTime}|${lastClose}`;
}

function clearDeepDiveCharts() {
    _chartRenderGeneration++;
    _primaryRenderSeq++;

    const chartKeys = ['primary', 'conviction', 'stoch', 'rsi', 'macd', 'cmf'];
    chartKeys.forEach(k => {
        if (state?.charts?.[k]) {
            try { state.charts[k].destroy(); } catch (e) { console.warn(e); }
            state.charts[k] = null;
        }
    });

    const containerIds = [
        '#primaryChartContainer',
        '#convictionChartContainer',
        '#stochChartContainer',
        '#rsiChartContainer',
        '#macdChartContainer',
        '#cmfChartContainer'
    ];
    containerIds.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = '';
    });

    setText('currentConvictionChartLabel', 'Conviction: --%');
    setText('convictionStabilityLabel', 'Stability: --');
    const badge = document.getElementById('convictionRegimeBadge');
    if (badge) {
        badge.className = 'badge-pill badge-neutral';
        badge.textContent = 'Regime: --';
    }
    setText('currentStochLabel', 'Stoch: --');
    setText('currentRsiLabel', 'RSI: --');
    setText('currentCmfLabel', 'CMF: --');

    if (state) {
        state._renderedChartsTicker = null;
        state._renderedChartsKey = null;
    }
}

async function renderAllDeepDiveCharts(ticker, timeseries, period) {
    const terminalView = document.getElementById('topView-terminal');
    const chartsPane = document.getElementById('tabPane-charts');
    const isVisible = Boolean(
        terminalView && terminalView.classList.contains('active') &&
        chartsPane && chartsPane.classList.contains('active') &&
        chartsPane.offsetParent !== null
    );
    if (!isVisible) {
        if (state) {
            state._renderedChartsTicker = null;
            state._renderedChartsKey = null;
        }
        return false;
    }

    if (!Array.isArray(timeseries) || timeseries.length === 0) {
        clearDeepDiveCharts();
        return false;
    }

    const gen = ++_chartRenderGeneration;
    _primaryRenderSeq++;
    const renderKey = buildChartRenderKey(ticker, timeseries, period);

    try {
        await ensureApexChartsLoaded();
    } catch (loadErr) {
        console.warn('[renderAllDeepDiveCharts] ApexCharts failed to load:', loadErr);
        if (gen !== _chartRenderGeneration) return false;
        const primaryContainer = document.querySelector('#primaryChartContainer');
        if (primaryContainer) {
            primaryContainer.innerHTML = '<div style="padding: 32px 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Unable to load charting library. Please check your network connection and retry.</div>';
        }
        if (state) {
            state._renderedChartsTicker = null;
            state._renderedChartsKey = null;
        }
        if (typeof hideChartLoading === 'function') hideChartLoading();
        return false;
    }

    if (gen !== _chartRenderGeneration) return false;

    const primaryEl = document.querySelector('#primaryChartContainer');
    if (primaryEl && primaryEl.clientWidth === 0) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (gen !== _chartRenderGeneration) return false;
    }

    await Promise.allSettled([
        renderPrimaryChart(timeseries, gen),
        renderConvictionChart(timeseries, gen),
        renderStochChart(timeseries, gen),
        renderRSIChart(timeseries, gen),
        renderMACDChart(timeseries, gen),
        renderCMFChart(timeseries, gen)
    ]);

    if (gen !== _chartRenderGeneration) return false;

    if (state) {
        if (state.charts.primary || timeseries.length > 0) {
            state._renderedChartsTicker = ticker;
            state._renderedChartsKey = renderKey;
        } else {
            state._renderedChartsTicker = null;
            state._renderedChartsKey = null;
        }
    }

    if (typeof hideChartLoading === 'function') hideChartLoading();

    requestAnimationFrame(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    });

    return true;
}

async function renderPrimaryChart(timeseries, renderGen = null) {
    if (!timeseries || timeseries.length === 0) return;

    const startGen = _chartRenderGeneration;
    const mySeq = (renderGen === null) ? ++_primaryRenderSeq : _primaryRenderSeq;

    await ensureApexChartsLoaded();

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;
    if (renderGen === null && (mySeq !== _primaryRenderSeq || startGen !== _chartRenderGeneration)) return;

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
            height: window.innerWidth < 768 ? 330 : 440,
            background: 'transparent',
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true
            },
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
                autoSelected: window.innerWidth < 768 ? 'pan' : 'zoom'
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

async function renderConvictionChart(timeseries, renderGen = null) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;

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
        const limited = timeseries.length < 5;
        if (limited) {
            setText('currentConvictionChartLabel', 'N/A (Limited history)');
            setText('convictionStabilityLabel', 'Limited sessions');
        }
        container.innerHTML = limited
            ? `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Limited trading history (${timeseries.length} session(s)) — requires at least 5 sessions for historical AI conviction trends.</div>`
            : '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Historical AI conviction data is being computed...</div>';
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

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;
    try {
        state.charts.conviction = new ApexCharts(container, options);
        await state.charts.conviction.render();
    } catch (chartErr) {
        console.warn('[renderConvictionChart] ApexCharts render error:', chartErr);
    }
}

async function renderStochChart(timeseries, renderGen = null) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;

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

    if (stochK.length === 0) {
        const limited = timeseries.length < 5;
        setText('currentStochLabel', limited ? 'N/A (Limited history)' : 'Stoch: --');
        container.innerHTML = limited
            ? `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Limited trading history (${timeseries.length} session(s)) — requires at least 5 sessions to compute Stochastic oscillator.</div>`
            : '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Stochastic oscillator data is being computed...</div>';
        return;
    }

    const latestK = stochK[stochK.length - 1].y;
    const latestD = stochD.length > 0 ? stochD[stochD.length - 1].y : latestK;
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

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;
    try {
        state.charts.stoch = new ApexCharts(container, options);
        await state.charts.stoch.render();
    } catch (chartErr) {
        console.warn('[renderStochChart] ApexCharts render error:', chartErr);
    }
}

async function renderRSIChart(timeseries, renderGen = null) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;

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

    if (rsiData.length === 0) {
        const limited = timeseries.length < 5;
        setText('currentRsiLabel', limited ? 'N/A (Limited history)' : 'RSI: --');
        container.innerHTML = limited
            ? `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Limited trading history (${timeseries.length} session(s)) — requires at least 5 sessions to compute RSI momentum.</div>`
            : '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">RSI momentum data is being computed...</div>';
        return;
    }

    const latestRsi = rsiData[rsiData.length - 1].y;
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

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;
    try {
        state.charts.rsi = new ApexCharts(container, options);
        await state.charts.rsi.render();
    } catch (chartErr) {
        console.warn('[renderRSIChart] ApexCharts render error:', chartErr);
    }
}

async function renderMACDChart(timeseries, renderGen = null) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;

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
        const limited = timeseries.length < 5;
        container.innerHTML = limited
            ? `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Limited trading history (${timeseries.length} session(s)) — requires at least 5 sessions to compute MACD momentum.</div>`
            : '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">MACD trend data is being computed...</div>';
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

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;
    try {
        state.charts.macd = new ApexCharts(container, options);
        await state.charts.macd.render();
    } catch (chartErr) {
        console.warn('[renderMACDChart] ApexCharts render error:', chartErr);
    }
}

async function renderCMFChart(timeseries, renderGen = null) {
    if (!timeseries || timeseries.length === 0) return;

    await ensureApexChartsLoaded();

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;

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

    if (cmfData.length === 0) {
        const limited = timeseries.length < 5;
        setText('currentCmfLabel', limited ? 'N/A (Limited history)' : 'CMF: --');
        container.innerHTML = limited
            ? `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Limited trading history (${timeseries.length} session(s)) — insufficient money flow bars.</div>`
            : '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Money flow data is being computed...</div>';
        return;
    }

    const latestCmf = cmfData[cmfData.length - 1].y;
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

    if (renderGen !== null && renderGen !== _chartRenderGeneration) return;
    try {
        state.charts.cmf = new ApexCharts(container, options);
        await state.charts.cmf.render();
    } catch (chartErr) {
        console.warn('[renderCMFChart] ApexCharts render error:', chartErr);
    }
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

function toggleChartControlsDrawer(forceState = null) {
    const drawer = document.getElementById('chartControlsDrawer');
    if (!drawer) return;
    const nextOpen = (forceState !== null) ? Boolean(forceState) : !drawer.classList.contains('open');
    drawer.classList.toggle('open', nextOpen);
    const btn = document.getElementById('btnMobileChartControls');
    if (btn) btn.setAttribute('aria-expanded', String(nextOpen));
}
if (typeof window !== 'undefined') {
    window.toggleChartControlsDrawer = toggleChartControlsDrawer;
    window.buildChartRenderKey = buildChartRenderKey;
    window.clearDeepDiveCharts = clearDeepDiveCharts;
    window.renderAllDeepDiveCharts = renderAllDeepDiveCharts;
}
