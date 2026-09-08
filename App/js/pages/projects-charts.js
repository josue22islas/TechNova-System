/**
 * ANALÍTICA DE PROYECTOS
 * ---------------------
 * Administra tres instancias Chart.js: valor de proyectos (línea), resumen por
 * estado (doughnut) y estado por cliente (barras horizontales).
 *
 * Flujo: data-projects-analytics-api -> TechNovaProjectsApi.getProjectAnalytics()
 * -> normalizeAnalytics() -> renderAnalytics() -> canvas/leyendas/tooltips.
 * Si no hay endpoint, utiliza datos demo. Antes de renderizar nuevamente destruye
 * las instancias anteriores para evitar canvas, eventos o memoria duplicados.
 * GSAP coordina trazado, arcos, barras y reflejo; reduced motion aplica el final.
 */
(function () {
    'use strict';

    var page = document.querySelector('.projects-page');
    var section = document.querySelector('[data-projects-analytics]');
    if (!page || !section) return;

    var endpoint = String(page.dataset.projectsAnalyticsApi || '').trim();
    var api = window.TechNovaProjectsApi || null;
    var charts = {};
    var valueTooltip = section.querySelector('[data-project-value-tooltip]');
    var valueTooltipMonth = section.querySelector('[data-project-value-tooltip-month]');
    var valueTooltipAmount = section.querySelector('[data-project-value-tooltip-amount]');
    var valueHoverLine = section.querySelector('[data-project-value-hover-line]');
    var palette = {
        progress: '#6f9fff',
        completed: '#38d7bd',
        paused: '#f4b65f',
        cancelled: '#ff7484'
    };
    var financialMonthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var financialFullYearData = {
        labels: financialMonthLabels.slice(),
        projectValue: [320000, 380000, 360000, 540000, 730000, 410000, 830000, 520000, 690000, 600000, 980000, 780000]
    };
    var valueReveal = { progress: 1 };
    var valueRevealTimeline = null;
    var valueEntranceRequested = false;
    var valueEntrancePlayed = false;
    var analyticsEntranceRequested = false;
    var summaryEntrancePlayed = false;
    var clientsEntrancePlayed = false;
    var summaryRevealAnimating = false;
    var clientsRevealAnimating = false;
    var summaryEntranceCall = null;
    var clientsEntranceCall = null;
    var latestAnalyticsData = null;
    var fallbackData = {
        value: {
            labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
            projectValue: [360000, 540000, 730000, 410000, 830000, 520000],
            total: 3390000,
            currency: 'MXN'
        },
        summary: [
            { key: 'in-progress', label: 'En progreso', value: 4, color: palette.progress },
            { key: 'paused', label: 'Pausados', value: 2, color: palette.paused },
            { key: 'completed', label: 'Completados', value: 0, color: palette.completed },
            { key: 'cancelled', label: 'Cancelados', value: 0, color: palette.cancelled }
        ],
        clients: {
            labels: ['TechNova', 'Hoteles Nova', 'Grupo Altura', 'Por definir'],
            datasets: [
                { key: 'in-progress', label: 'En progreso', data: [1, 1, 0, 2], color: palette.progress },
                { key: 'paused', label: 'Pausados', data: [0, 0, 1, 1], color: palette.paused },
                { key: 'completed', label: 'Completados', data: [0, 0, 0, 0], color: palette.completed },
                { key: 'cancelled', label: 'Cancelados', data: [0, 0, 0, 0], color: palette.cancelled }
            ]
        }
    };

    function finiteArray(values) {
        return Array.isArray(values) ? values.map(function (value) {
            var number = Number(value);
            return Number.isFinite(number) ? Math.max(0, number) : 0;
        }) : [];
    }

    function normalizeAnalytics(source) {
        var data = source && typeof source === 'object' ? source : fallbackData;
        var value = data.value && typeof data.value === 'object' ? data.value : fallbackData.value;
        var summary = Array.isArray(data.summary) ? data.summary : fallbackData.summary;
        var clients = data.clients && typeof data.clients === 'object' ? data.clients : fallbackData.clients;
        return {
            value: {
                labels: Array.isArray(value.labels) ? value.labels.map(String) : fallbackData.value.labels,
                projectValue: finiteArray(value.projectValue),
                total: Number.isFinite(Number(value.total)) ? Number(value.total) : fallbackData.value.total,
                currency: String(value.currency || 'MXN')
            },
            summary: summary.map(function (item, index) {
                var fallback = fallbackData.summary[index] || fallbackData.summary[0];
                return {
                    key: String(item.key || fallback.key),
                    label: String(item.label || fallback.label),
                    value: Math.max(0, Number(item.value) || 0),
                    color: String(item.color || palette[item.key] || fallback.color)
                };
            }),
            clients: {
                labels: Array.isArray(clients.labels) ? clients.labels.map(String) : fallbackData.clients.labels,
                datasets: Array.isArray(clients.datasets) ? clients.datasets.map(function (item, index) {
                    var fallback = fallbackData.clients.datasets[index] || fallbackData.clients.datasets[0];
                    return {
                        key: String(item.key || fallback.key),
                        label: String(item.label || fallback.label),
                        data: finiteArray(item.data),
                        color: String(item.color || palette[item.key] || fallback.color)
                    };
                }) : fallbackData.clients.datasets
            }
        };
    }

    function money(value, currency) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0
        }).format(Number(value) || 0) + (String(currency || 'MXN').toUpperCase() === 'MXN' ? ' MXN' : '');
    }

    function hideValueTooltip() {
        if (valueTooltip) valueTooltip.classList.remove('visible');
        if (valueHoverLine) valueHoverLine.style.opacity = '0';
    }

    function externalProjectValueTooltip(context) {
        var tooltip = context.tooltip;
        if (!valueTooltip || !tooltip || tooltip.opacity === 0) {
            hideValueTooltip();
            return;
        }
        var dataPoint = tooltip.dataPoints && tooltip.dataPoints[0];
        if (!dataPoint) {
            hideValueTooltip();
            return;
        }
        var index = dataPoint.dataIndex;
        var chart = context.chart;
        var wrapper = chart.canvas.parentElement;
        if (valueTooltipMonth) valueTooltipMonth.textContent = String(chart.data.labels[index] || 'Mes');
        if (valueTooltipAmount) valueTooltipAmount.textContent = money(chart.data.datasets[0].data[index], 'MXN');

        var tooltipWidth = valueTooltip.offsetWidth || 175;
        var left = tooltip.caretX + 18;
        var top = tooltip.caretY - 42;
        if (left + tooltipWidth > wrapper.clientWidth - 8) left = tooltip.caretX - tooltipWidth - 18;
        if (left < 8) left = 8;
        if (top < 8) top = 8;
        valueTooltip.style.left = left + 'px';
        valueTooltip.style.top = top + 'px';
        valueTooltip.classList.add('visible');

        if (valueHoverLine) {
            valueHoverLine.style.left = tooltip.caretX + 'px';
            valueHoverLine.style.opacity = '1';
        }
    }

    function baseScaleOptions() {
        return {
            grid: { color: 'rgba(160, 190, 235, .075)', drawBorder: false },
            border: { display: false },
            ticks: { color: 'rgba(203, 218, 242, .58)', font: { family: 'Arial', size: 10 }, padding: 8 }
        };
    }

    function buildValuePeriod(period) {
        var currentMonth = new Date().getMonth();
        var indexes = [];
        if (period === 'month') indexes = [currentMonth];
        else if (period === '3months' || period === '6months') {
            var amount = period === '3months' ? 3 : 6;
            for (var offset = amount - 1; offset >= 0; offset -= 1) {
                indexes.push(((currentMonth - offset) % 12 + 12) % 12);
            }
        } else {
            indexes = financialMonthLabels.map(function (_, index) { return index; });
        }
        var result = { labels: [], projectValue: [], currency: 'MXN' };
        indexes.forEach(function (index) {
            result.labels.push(financialFullYearData.labels[index]);
            result.projectValue.push(financialFullYearData.projectValue[index]);
        });
        result.total = result.projectValue.reduce(function (sum, value) { return sum + value; }, 0);
        return result;
    }

    var valueRevealPlugin = {
        id: 'projectsValueReveal',
        beforeDatasetsDraw: function (chart) {
            if (!chart.chartArea || valueReveal.progress >= 1) return;
            var area = chart.chartArea;
            chart.ctx.save();
            chart.ctx.beginPath();
            chart.ctx.rect(area.left, area.top, (area.right - area.left) * valueReveal.progress, area.bottom - area.top);
            chart.ctx.clip();
        },
        afterDatasetsDraw: function (chart) {
            if (!chart.chartArea || valueReveal.progress >= 1) return;
            chart.ctx.restore();
        }
    };

    var tooltipGlowPlugin = {
        id: 'projectsTooltipGlow',
        beforeTooltipDraw: function (chart, args) {
            var tooltip = args && args.tooltip;
            if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) return;
            var point = tooltip.dataPoints[0];
            var dataset = chart.data.datasets[point.datasetIndex] || {};
            var background = dataset.backgroundColor;
            var glowColor = Array.isArray(background)
                ? background[point.dataIndex]
                : typeof background === 'string' ? background
                    : typeof dataset.borderColor === 'string' ? dataset.borderColor : palette.progress;
            chart.ctx.save();
            chart.ctx.shadowColor = glowColor;
            chart.ctx.shadowBlur = 18;
            chart.ctx.shadowOffsetX = 0;
            chart.ctx.shadowOffsetY = 5;
            chart.$projectsTooltipGlowActive = true;
        },
        afterTooltipDraw: function (chart) {
            if (!chart.$projectsTooltipGlowActive) return;
            chart.ctx.restore();
            chart.$projectsTooltipGlowActive = false;
        }
    };

    function runChartShine(selector) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var shine = section.querySelector(selector);
        if (!shine) return;
        shine.classList.remove('animate');
        void shine.offsetWidth;
        shine.classList.add('animate');
    }

    function runValueShine() {
        runChartShine('[data-project-value-shine]');
    }

    function playValueReveal() {
        if (!charts.value) return;
        hideValueTooltip();
        if (valueRevealTimeline) valueRevealTimeline.kill();
        valueReveal.progress = 0;
        charts.value.draw();
        if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            valueReveal.progress = 1;
            charts.value.draw();
            return;
        }
        valueRevealTimeline = window.gsap.to(valueReveal, {
            progress: 1,
            duration: 2.8,
            ease: 'power2.inOut',
            onUpdate: function () { charts.value.draw(); },
            onComplete: function () {
                valueReveal.progress = 1;
                charts.value.draw();
                runValueShine();
                valueRevealTimeline = null;
            }
        });
    }

    function playInitialValueReveal() {
        valueEntranceRequested = true;
        if (valueEntrancePlayed || !charts.value) return;
        valueEntrancePlayed = true;
        playValueReveal();
    }

    function playInitialSummaryReveal() {
        if (summaryEntrancePlayed || !charts.summary || !latestAnalyticsData) return;
        summaryEntrancePlayed = true;
        summaryRevealAnimating = true;
        charts.summary.data.datasets[0].data = latestAnalyticsData.summary.map(function (item) {
            return item.value;
        });
        charts.summary.update();
    }

    function playInitialClientsReveal() {
        if (clientsEntrancePlayed || !charts.clients || !latestAnalyticsData) return;
        clientsEntrancePlayed = true;
        clientsRevealAnimating = true;
        charts.clients.data.datasets.forEach(function (dataset, index) {
            var source = latestAnalyticsData.clients.datasets[index];
            dataset.data = source ? source.data.slice() : [];
        });
        charts.clients.update();
    }

    function playInitialAnalyticsReveal() {
        analyticsEntranceRequested = true;
        playInitialValueReveal();

        if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            playInitialSummaryReveal();
            playInitialClientsReveal();
            return;
        }

        if (summaryEntranceCall) summaryEntranceCall.kill();
        if (clientsEntranceCall) clientsEntranceCall.kill();
        summaryEntranceCall = window.gsap.delayedCall(.14, function () {
            summaryEntranceCall = null;
            playInitialSummaryReveal();
        });
        clientsEntranceCall = window.gsap.delayedCall(.24, function () {
            clientsEntranceCall = null;
            playInitialClientsReveal();
        });
    }

    function applyValuePeriod(period, detail) {
        if (!charts.value) return;
        var value = buildValuePeriod(period);
        charts.value.data.labels = value.labels;
        charts.value.data.datasets[0].data = value.projectValue;
        charts.value.update('none');
        var total = section.querySelector('[data-project-value-total]');
        if (total) total.textContent = money(value.total, value.currency);
        window.requestAnimationFrame(playValueReveal);
        document.dispatchEvent(new CustomEvent('projects:value-period-change', {
            detail: Object.assign({ period: period, value: value }, detail || {})
        }));
    }

    function destroyCharts() {
        Object.keys(charts).forEach(function (key) {
            if (charts[key]) charts[key].destroy();
        });
        charts = {};
    }

    function renderSummaryLegend(items) {
        var legend = section.querySelector('[data-project-summary-legend]');
        if (!legend) return;
        legend.replaceChildren();
        items.forEach(function (item) {
            var row = document.createElement('span');
            var marker = document.createElement('i');
            var label = document.createElement('span');
            var value = document.createElement('strong');
            marker.style.color = item.color;
            marker.style.background = item.color;
            label.textContent = item.label;
            value.textContent = String(item.value);
            row.append(marker, label, value);
            legend.appendChild(row);
        });
    }

    function renderAnalytics(rawData, options) {
        if (!window.Chart) return;
        var data = normalizeAnalytics(rawData);
        latestAnalyticsData = data;
        destroyCharts();

        var valueCanvas = document.getElementById('projectsValueChart');
        var summaryCanvas = document.getElementById('projectsSummaryChart');
        var clientCanvas = document.getElementById('projectsClientChart');
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var animationDuration = reducedMotion || (options && options.animate === false) ? 0 : 900;
        var deferEntrance = Boolean(window.gsap) && !reducedMotion;
        var total = section.querySelector('[data-project-value-total]');
        var summaryTotal = section.querySelector('[data-project-summary-total]');
        if (total) total.textContent = money(data.value.total, data.value.currency);
        if (summaryTotal) summaryTotal.textContent = String(data.summary.reduce(function (sum, item) { return sum + item.value; }, 0));
        renderSummaryLegend(data.summary);

        if (valueCanvas) {
            var canAnimateEntrance = Boolean(window.gsap) && !reducedMotion;
            valueReveal.progress = canAnimateEntrance && !valueEntrancePlayed ? 0 : 1;
            var context = valueCanvas.getContext('2d');
            var incomeGradient = context.createLinearGradient(0, 0, 0, 250);
            incomeGradient.addColorStop(0, 'rgba(49, 196, 119, .22)');
            incomeGradient.addColorStop(1, 'rgba(49, 196, 119, 0)');
            charts.value = new window.Chart(context, {
                type: 'line',
                data: {
                    labels: data.value.labels,
                    datasets: [
                        { label: 'Valor del proyecto', data: data.value.projectValue, borderColor: '#31c477', backgroundColor: incomeGradient, fill: true, tension: .36, cubicInterpolationMode: 'monotone', borderWidth: 2.7, pointRadius: function (contextValue) { return contextValue.chart.data.labels.length === 1 ? 5 : 0; }, pointHoverRadius: 6, pointHitRadius: 24, pointBackgroundColor: '#31c477', pointHoverBackgroundColor: '#31c477', pointBorderColor: 'rgba(235, 255, 245, .96)', pointHoverBorderColor: '#ffffff', pointBorderWidth: 1.5, pointHoverBorderWidth: 2 }
                    ]
                },
                plugins: [valueRevealPlugin],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    animation: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false, external: externalProjectValueTooltip }
                    },
                    scales: {
                        x: Object.assign(baseScaleOptions(), { grid: { display: false } }),
                        y: Object.assign(baseScaleOptions(), {
                            beginAtZero: true,
                            min: 0,
                            max: 1000000,
                            ticks: Object.assign({}, baseScaleOptions().ticks, {
                                stepSize: 200000,
                                callback: function (value) { return '$' + Number(value).toLocaleString('es-MX'); }
                            })
                        })
                    }
                }
            });
            if (valueEntranceRequested && !valueEntrancePlayed) {
                window.requestAnimationFrame(playInitialValueReveal);
            }
        }

        if (summaryCanvas) {
            charts.summary = new window.Chart(summaryCanvas, {
                type: 'doughnut',
                data: { labels: data.summary.map(function (item) { return item.label; }), datasets: [{ data: data.summary.map(function (item) { return deferEntrance && !summaryEntrancePlayed ? 0 : item.value; }), backgroundColor: data.summary.map(function (item) { return item.color; }), borderColor: 'rgba(255, 255, 255, .12)', borderWidth: 1, hoverBorderColor: 'rgba(255, 255, 255, .55)', hoverBorderWidth: 1, hoverOffset: 5, spacing: 2, borderRadius: 5 }] },
                plugins: [tooltipGlowPlugin],
                options: { responsive: true, maintainAspectRatio: false, cutout: '72%', layout: { padding: 14 }, animation: { duration: animationDuration, animateRotate: true, easing: 'easeOutQuart', onComplete: function () { if (!summaryRevealAnimating) return; summaryRevealAnimating = false; runChartShine('[data-project-summary-shine]'); } }, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(5, 8, 31, .95)', borderColor: 'rgba(142, 181, 255, .55)', borderWidth: 1, titleColor: '#ffffff', bodyColor: 'rgba(229, 238, 255, .92)', padding: 11, cornerRadius: 10, caretSize: 6, caretPadding: 8, displayColors: true, boxPadding: 5, callbacks: { label: function (contextValue) { var amount = Number(contextValue.parsed) || 0; return ' ' + contextValue.label + ': ' + amount + (amount === 1 ? ' proyecto' : ' proyectos'); } } } } }
            });
            if (analyticsEntranceRequested && !summaryEntrancePlayed) {
                window.requestAnimationFrame(playInitialSummaryReveal);
            }
        }

        if (clientCanvas) {
            charts.clients = new window.Chart(clientCanvas, {
                type: 'bar',
                data: { labels: data.clients.labels, datasets: data.clients.datasets.map(function (item) { return { label: item.label, data: deferEntrance && !clientsEntrancePlayed ? item.data.map(function () { return 0; }) : item.data, backgroundColor: item.color, borderColor: item.color, borderWidth: 1, borderRadius: 5, borderSkipped: false, barThickness: 12 }; }) },
                plugins: [tooltipGlowPlugin],
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    animation: { duration: animationDuration, easing: 'easeOutQuart', onComplete: function () { if (!clientsRevealAnimating) return; clientsRevealAnimating = false; runChartShine('[data-project-clients-shine]'); } },
                    plugins: { legend: { position: 'bottom', labels: { color: 'rgba(211, 225, 246, .68)', usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 13, font: { family: 'Arial', size: 9 } } }, tooltip: { backgroundColor: 'rgba(5, 8, 31, .95)', borderColor: 'rgba(142, 181, 255, .55)', borderWidth: 1, titleColor: '#ffffff', bodyColor: 'rgba(229, 238, 255, .92)', titleFont: { family: 'Arial', size: 12, weight: '600' }, bodyFont: { family: 'Arial', size: 11 }, padding: 11, cornerRadius: 10, caretSize: 6, caretPadding: 8, displayColors: true, boxPadding: 5, callbacks: { label: function (contextValue) { var amount = Number(contextValue.parsed.x) || 0; return ' ' + contextValue.dataset.label + ': ' + amount + (amount === 1 ? ' proyecto' : ' proyectos'); } } } },
                    scales: { x: Object.assign(baseScaleOptions(), { stacked: true, beginAtZero: true, ticks: Object.assign({}, baseScaleOptions().ticks, { stepSize: 1, precision: 0 }) }), y: Object.assign(baseScaleOptions(), { stacked: true, grid: { display: false } }) }
                }
            });
            if (analyticsEntranceRequested && !clientsEntrancePlayed) {
                window.requestAnimationFrame(playInitialClientsReveal);
            }
        }

        document.dispatchEvent(new CustomEvent('projects:analytics-rendered', { detail: data }));
    }

    async function loadAnalytics() {
        var status = section.querySelector('[data-projects-analytics-status]');
        if (!endpoint || !api || typeof api.getProjectAnalytics !== 'function') {
            renderAnalytics(fallbackData);
            return;
        }
        page.dataset.projectsAnalyticsLoading = 'true';
        if (status) status.textContent = 'Actualizando analítica…';
        try {
            renderAnalytics(await api.getProjectAnalytics(endpoint));
            if (status) status.textContent = '';
        } catch (error) {
            renderAnalytics(fallbackData);
            if (status) status.textContent = 'Se muestran datos locales mientras se restablece la conexión.';
            console.warn(error);
        } finally {
            delete page.dataset.projectsAnalyticsLoading;
        }
    }

    document.addEventListener('financialPeriodChange', function (event) {
        var detail = event.detail || {};
        applyValuePeriod(String(detail.period || '6months'), detail);
    });

    document.addEventListener('projects:analytics-entry-start', playInitialAnalyticsReveal);

    var valueCanvasNode = document.getElementById('projectsValueChart');
    if (valueCanvasNode) valueCanvasNode.addEventListener('mouseleave', hideValueTooltip);

    fallbackData.value = buildValuePeriod('6months');

    window.TechNovaProjectsCharts = {
        update: renderAnalytics,
        reload: loadAnalytics,
        setValuePeriod: applyValuePeriod,
        fallback: fallbackData
    };
    loadAnalytics();
})();
