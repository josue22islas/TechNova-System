document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById('costChart');

    if (!canvas || typeof Chart === 'undefined') return;

    const totalValue = document.querySelector('.chart-total-value');
    const totalLabel = document.querySelector('.chart-total-label');

    const legendItems = [
        ...document.querySelectorAll('.chart-legend-item')
    ];

    let labels = [
        'Nowa',
        'Api Claude',
        'Figma'
    ];

    let values = [
        523.10,
        398.99,
        346.95
    ];

    function money(value) {

        return '$' + Number(value).toLocaleString(
            'es-MX',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }

    function total() {

        return values.reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );

    }

    function showTotal() {

        totalValue.textContent = money(total());
        totalLabel.textContent = 'Total';

    }

    function showItem(index) {

        totalValue.textContent = money(values[index]);
        totalLabel.textContent = labels[index];

    }

    function setLegend(active = null) {

        legendItems.forEach((item, index) => {

            item.classList.toggle(
                'is-active',
                active === index
            );

            item.classList.toggle(
                'is-muted',
                active !== null && active !== index
            );

        });

    }

    /*=========================================
        GRADIENTES
    =========================================*/

    const gradientPlugin = {

        id: 'technovaGradient',

        beforeDatasetsDraw(chart) {

            if (!chart.chartArea) return;

            const {
                ctx,
                chartArea
            } = chart;

            function gradient(color1, color2) {

                const g = ctx.createLinearGradient(

                    chartArea.left,
                    chartArea.top,

                    chartArea.right,
                    chartArea.bottom

                );

                g.addColorStop(0, color1);
                g.addColorStop(1, color2);

                return g;

            }

            chart.data.datasets[0].backgroundColor = [

                gradient(
                    '#f2cb8d',
                    '#d09f53'
                ),

                gradient(
                    '#e49b84',
                    '#c4745d'
                ),

                gradient(
                    '#6ac9f6',
                    '#3a9ecf'
                )

            ];

        }

    };

    /*=========================================
        GLOW
    =========================================*/

    const glowPlugin = {

        id: 'technovaGlow',

        beforeDatasetDraw(chart) {

            const ctx = chart.ctx;

            ctx.save();

            ctx.shadowColor =
                'rgba(80,130,255,.28)';

            ctx.shadowBlur = 14;

            ctx.shadowOffsetX = 0;

            ctx.shadowOffsetY = 4;

        },

        afterDatasetDraw(chart) {

            chart.ctx.restore();

        }

    };

    /*=========================================
        CHART
    =========================================*/

    const chart = new Chart(

        canvas,

        {

            type: 'doughnut',

            data: {

                labels,

                datasets: [

                    {

                        data: values,

                        borderColor:
                            'rgba(255,255,255,.12)',

                        borderWidth: 1,

                        hoverBorderColor:
                            'rgba(255,255,255,.55)',

                        hoverBorderWidth: 1,

                        hoverOffset: 5, 

                        spacing: 2,

                        borderRadius: 5

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true,

                cutout: '68%',

                rotation: -90,

                layout: {
        padding: 14 //Ese padding: 12 le da espacio interno extra al canvas para que los segmentos puedan crecer sin recortarse.//
    },

                animation: {

                    duration: 1100,

                    easing: 'easeOutQuart'

                },

                onHover(event, active) {

                    if (event.native?.target) {

                        event.native.target.style.cursor =
                            active.length
                                ? 'pointer'
                                : 'default';

                    }

                    if (active.length) {

                        const index =
                            active[0].index;

                        showItem(index);

                        setLegend(index);

                    } else {

                        showTotal();

                        setLegend();

                    }

                },

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        backgroundColor:
                            'rgba(2,1,32,.96)',

                        titleColor: '#ffffff',

                        bodyColor: '#ffffff',

                        borderColor:
                            'rgba(255,255,255,.14)',

                        borderWidth: 1,

                        padding: 10,

                        displayColors: true,

                        callbacks: {

                            label(context) {

                                return `${context.label}: ${money(context.raw)}`;

                            }

                        }

                    }

                }

            },

            plugins: [

                gradientPlugin,

                glowPlugin

            ]

        }

    );

    /*=========================================
        LEYENDA
    =========================================*/

    legendItems.forEach((item, index) => {

        item.addEventListener(

            'mouseenter',

            function () {

                chart.setActiveElements([

                    {

                        datasetIndex: 0,

                        index

                    }

                ]);

                chart.tooltip.setActiveElements([

                    {

                        datasetIndex: 0,

                        index

                    }

                ]);

                showItem(index);

                setLegend(index);

                chart.update('none');

            }

        );

        item.addEventListener(

            'mouseleave',

            function () {

                chart.setActiveElements([]);

                chart.tooltip.setActiveElements([]);

                showTotal();

                setLegend();

                chart.update('none');

            }

        );

        item.addEventListener(

            'click',

            function () {

                chart.setActiveElements([

                    {

                        datasetIndex: 0,

                        index

                    }

                ]);

                showItem(index);

                setLegend(index);

                chart.update('none');

            }

        );

    });

    /*=========================================
        TOTAL
    =========================================*/

    showTotal();

    /*=========================================
        BACKEND
    =========================================*/

    window.updateCostChart = function (

        newValues,

        newLabels = labels

    ) {

        if (

            !Array.isArray(newValues)

            ||

            newValues.length !== 3

        ) {

            return;

        }

        values = newValues.map(Number);

        labels = newLabels;

        chart.data.labels = labels;

        chart.data.datasets[0].data = values;

        showTotal();

        setLegend();

        chart.update();

    };

    window.updateCostChartFromObject = function (

        data

    ) {

        if (!data) return;

        window.updateCostChart([

            Number(data.nowa ?? 0),

            Number(data.claude ?? 0),

            Number(data.figma ?? 0)

        ]);

    };

});


/* =========================================
   RESPIRACIÓN SUAVE DE LA GRÁFICA
   ========================================= */

const chartContainer =
    document.querySelector(
        '.switch-container-5'
    );


let breathingAnimation = null;



function startChartBreathing() {

    if (!chartContainer) return;


    breathingAnimation = gsap.to(
        chartContainer,
        {

            filter:
                'drop-shadow(0 0 18px rgba(58,158,207,0.28))',

            duration: 2,

            ease: 'sine.inOut',

            repeat: -1,

            yoyo: true

        }
    );

}


startChartBreathing();


/* =========================================
   LEYENDA CONECTADA
   ========================================= */

function setLegend(activeIndex = null) {

    legendItems.forEach(
        function(item, index) {

            if (activeIndex === null) {

                item.classList.remove(
                    'is-active'
                );

                item.classList.remove(
                    'is-muted'
                );

                return;

            }


            if (index === activeIndex) {

                item.classList.add(
                    'is-active'
                );

                item.classList.remove(
                    'is-muted'
                );

            } else {

                item.classList.remove(
                    'is-active'
                );

                item.classList.add(
                    'is-muted'
                );

            }

        }
    );

}



   /* =========================================================
   LEYENDA FINANCIERA CONECTADA
   ========================================================= */

const financialLegendGlowPlugin = {

    id:
        'financialLegendGlow',


    beforeDatasetDraw(
        chart,
        args
    ) {

        const activeIndex =
            chart.$activeLegendIndex;


        /*
           Nada activo
        */

        if (
            activeIndex === undefined ||
            activeIndex === null
        ) {

            return;

        }


        /*
           Dataset seleccionado
        */

        if (
            args.index === activeIndex
        ) {

            chart.ctx.save();


            chart.ctx.shadowBlur =
                18;


            chart.ctx.shadowColor =
                chart.data
                    .datasets[
                        args.index
                    ]
                    .borderColor;

        }


        /*
           Dataset no seleccionado
        */

        else {

            chart.ctx.save();


            chart.ctx.globalAlpha =
                0.38;

        }

    },


    afterDatasetDraw(
        chart,
        args
    ) {

        const activeIndex =
            chart.$activeLegendIndex;


        if (
            activeIndex === undefined ||
            activeIndex === null
        ) {

            return;

        }


        chart.ctx.restore();

    }

};
/* =========================================================
   GRÁFICA FINANCIERA PREMIUM
   REVEAL GSAP REAL
   LÍNEAS + ÁREAS ANIMADAS JUNTAS
   + SELECTOR DE PERIODOS DINÁMICO
   ========================================================= */

const financialCanvas =
    document.getElementById(
        'financialChart'
    );


if (
    financialCanvas &&
    typeof Chart !== 'undefined'
) {

    const financialCtx =
        financialCanvas.getContext('2d');


    /* =====================================================
       ELEMENTOS HTML
       ===================================================== */

    const hoverLine =
        document.getElementById(
            'financialHoverLine'
        );


    const financialTooltip =
        document.getElementById(
            'financialTooltip'
        );


    const tooltipMonth =
        document.getElementById(
            'financialTooltipMonth'
        );


    const tooltipIncome =
        document.getElementById(
            'tooltipIncome'
        );


    const tooltipCosts =
        document.getElementById(
            'tooltipCosts'
        );


    const tooltipProfits =
        document.getElementById(
            'tooltipProfits'
        );


    const chartShine =
        document.getElementById(
            'financialChartShine'
        );


    /* =====================================================
       ESTADO GENERAL
       ===================================================== */

    let initialRevealFinished =
        false;


    let allowFinancialShine =
        false;


    let revealTimeline =
        null;


    /*
       0 = gráfica oculta
       1 = gráfica completa
    */

    const financialReveal = {

        progress: 0

    };


    /* =====================================================
       MESES
       ===================================================== */

    const financialMonthLabels = [

        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'

    ];


    /* =====================================================
       DATOS BASE TEMPORALES

       Estos representan por ahora un año completo.

       Cuando conectemos PHP / MySQL, estos valores
       serán sustituidos por datos reales del backend.
       ===================================================== */

    const financialFullYearData = {

        labels:
            [...financialMonthLabels],


        income: [

            320000,
            380000,
            360000,
            540000,
            730000,
            410000,
            830000,
            520000,
            690000,
            600000,
            980000,
            780000

        ],


        costs: [

            210000,
            250000,
            230000,
            340000,
            450000,
            260000,
            510000,
            330000,
            430000,
            370000,
            450000,
            370000

        ],


        profits: [

            95000,
            115000,
            105000,
            165000,
            220000,
            120000,
            250000,
            150000,
            210000,
            175000,
            285000,
            180000

        ]

    };


    /*
       Datos actualmente mostrados.
    */

    let financialData = {

        labels:
            [...financialFullYearData.labels],

        income:
            [...financialFullYearData.income],

        costs:
            [...financialFullYearData.costs],

        profits:
            [...financialFullYearData.profits]

    };


    /* =====================================================
       FORMATO MONEDA
       ===================================================== */

    function financialMoney(
        value
    ) {

        return Number(value)
            .toLocaleString(

                'es-MX',

                {

                    style:
                        'currency',

                    currency:
                        'MXN',

                    maximumFractionDigits:
                        0

                }

            );

    }


    /* =====================================================
       GRADIENTES
       ===================================================== */

    function createFinancialGradients() {

        const height =
            financialCanvas.clientHeight ||
            330;


        /* =============================================
           INGRESOS - VERDE
           ============================================= */

        const incomeGradient =
            financialCtx.createLinearGradient(

                0,
                0,
                0,
                height

            );


        incomeGradient.addColorStop(
            0,
            'rgba(49,196,119,.38)'
        );


        incomeGradient.addColorStop(
            .42,
            'rgba(49,196,119,.19)'
        );


        incomeGradient.addColorStop(
            .75,
            'rgba(49,196,119,.07)'
        );


        incomeGradient.addColorStop(
            1,
            'rgba(49,196,119,.012)'
        );


        /* =============================================
           COSTOS - ROJO
           ============================================= */

        const costsGradient =
            financialCtx.createLinearGradient(

                0,
                0,
                0,
                height

            );


        costsGradient.addColorStop(
            0,
            'rgba(223,96,77,.34)'
        );


        costsGradient.addColorStop(
            .42,
            'rgba(223,96,77,.17)'
        );


        costsGradient.addColorStop(
            .75,
            'rgba(223,96,77,.06)'
        );


        costsGradient.addColorStop(
            1,
            'rgba(223,96,77,.01)'
        );


        /* =============================================
           GANANCIAS - AZUL
           ============================================= */

        const profitsGradient =
            financialCtx.createLinearGradient(

                0,
                0,
                0,
                height

            );


        profitsGradient.addColorStop(
            0,
            'rgba(64,143,222,.34)'
        );


        profitsGradient.addColorStop(
            .42,
            'rgba(64,143,222,.17)'
        );


        profitsGradient.addColorStop(
            .75,
            'rgba(64,143,222,.06)'
        );


        profitsGradient.addColorStop(
            1,
            'rgba(64,143,222,.01)'
        );


        return {

            incomeGradient,

            costsGradient,

            profitsGradient

        };

    }


    const gradients =
        createFinancialGradients();


    /* =========================================================
       REVEAL GLOBAL

       Línea + sombreado avanzan juntos.
       ========================================================= */

    const financialRevealPlugin = {

        id:
            'financialGlobalReveal',


        beforeDatasetsDraw(
            chart
        ) {

            if (
                initialRevealFinished
            ) {

                chart.$financialClipActive =
                    false;

                return;

            }


            const {
                ctx,
                chartArea
            } = chart;


            if (!chartArea) {

                chart.$financialClipActive =
                    false;

                return;

            }


            const {

                left,
                right,
                top,
                bottom

            } = chartArea;


            const totalWidth =
                right -
                left;


            const visibleWidth =
                totalWidth *
                financialReveal.progress;


            ctx.save();


            chart.$financialClipActive =
                true;


            ctx.beginPath();


            ctx.rect(

                left - 4,

                top - 30,

                Math.max(
                    0,
                    visibleWidth + 4
                ),

                (
                    bottom -
                    top
                )
                +
                60

            );


            ctx.clip();

        },


        afterDatasetsDraw(
            chart
        ) {

            if (
                chart.$financialClipActive
            ) {

                chart.ctx.restore();


                chart.$financialClipActive =
                    false;

            }

        }

    };


    /* =====================================================
       GLOW DEL ÚLTIMO PUNTO
       ===================================================== */

    const lastPointGlowPlugin = {

        id:
            'financialLastPointGlow',


        afterDatasetsDraw(
            chart
        ) {

            if (
                !initialRevealFinished
            ) {

                return;

            }


            const ctx =
                chart.ctx;


            chart.data.datasets.forEach(

                function(
                    dataset,
                    datasetIndex
                ) {

                    const meta =
                        chart.getDatasetMeta(
                            datasetIndex
                        );


                    if (
                        !meta ||
                        !meta.data ||
                        !meta.data.length
                    ) {

                        return;

                    }


                    const point =
                        meta.data[
                            meta.data.length - 1
                        ];


                    if (!point) {

                        return;

                    }


                    ctx.save();


                    /* HALO */

                    ctx.beginPath();


                    ctx.arc(

                        point.x,

                        point.y,

                        7,

                        0,

                        Math.PI * 2

                    );


                    ctx.fillStyle =
                        'rgba(255,255,255,.025)';


                    ctx.shadowBlur =
                        16;


                    ctx.shadowColor =
                        dataset.borderColor;


                    ctx.fill();


                    /* CENTRO */

                    ctx.beginPath();


                    ctx.arc(

                        point.x,

                        point.y,

                        2.4,

                        0,

                        Math.PI * 2

                    );


                    ctx.fillStyle =
                        dataset.borderColor;


                    ctx.shadowBlur =
                        8;


                    ctx.fill();


                    ctx.restore();

                }

            );

        }

    };


    /* =====================================================
       REFLEJO LIQUID GLASS
       ===================================================== */

    function runFinancialShine() {

        if (
            !chartShine ||
            !allowFinancialShine
        ) {

            return;

        }


        allowFinancialShine =
            false;


        chartShine.classList.remove(
            'animate'
        );


        void chartShine.offsetWidth;


        chartShine.classList.add(
            'animate'
        );

    }


    /* =====================================================
       TOOLTIP LIQUID GLASS
       ===================================================== */

    function externalFinancialTooltip(
        context
    ) {

        const tooltip =
            context.tooltip;


        if (!financialTooltip) {

            return;

        }


        if (
            !initialRevealFinished
        ) {

            financialTooltip
                .classList
                .remove(
                    'visible'
                );


            return;

        }


        if (
            !tooltip ||
            tooltip.opacity === 0
        ) {

            financialTooltip
                .classList
                .remove(
                    'visible'
                );


            return;

        }


        const dataPoint =
            tooltip.dataPoints?.[0];


        if (!dataPoint) {

            return;

        }


        const index =
            dataPoint.dataIndex;


        /* MES */

        if (
            tooltipMonth
        ) {

            tooltipMonth.textContent =

                financialChart
                    .data
                    .labels[index];

        }


        /* INGRESOS */

        if (
            tooltipIncome
        ) {

            tooltipIncome.textContent =

                financialMoney(

                    financialChart
                        .data
                        .datasets[0]
                        .data[index]

                );

        }


        /* COSTOS */

        if (
            tooltipCosts
        ) {

            tooltipCosts.textContent =

                financialMoney(

                    financialChart
                        .data
                        .datasets[1]
                        .data[index]

                );

        }


        /* GANANCIAS */

        if (
            tooltipProfits
        ) {

            tooltipProfits.textContent =

                financialMoney(

                    financialChart
                        .data
                        .datasets[2]
                        .data[index]

                );

        }


        /* =============================================
           POSICIÓN
           ============================================= */

        const position =
            financialCanvas
                .getBoundingClientRect();


        let left =
            tooltip.caretX +
            18;


        let top =
            tooltip.caretY -
            50;


        if (
            left + 190 >
            position.width
        ) {

            left =
                tooltip.caretX -
                190;

        }


        if (
            top < 10
        ) {

            top =
                10;

        }


        financialTooltip.style.left =
            left +
            'px';


        financialTooltip.style.top =
            top +
            'px';


        financialTooltip
            .classList
            .add(
                'visible'
            );

    }


    /* =====================================================
       HOVER VERTICAL
       ===================================================== */

    function updateFinancialHover(

        event,

        activeElements,

        chart

    ) {

        if (!hoverLine) {

            return;

        }


        if (
            !initialRevealFinished
        ) {

            hoverLine.style.opacity =
                '0';


            return;

        }


        if (
            !activeElements ||
            !activeElements.length
        ) {

            hoverLine.style.opacity =
                '0';


            return;

        }


        const index =
            activeElements[0].index;


        const meta =
            chart.getDatasetMeta(
                0
            );


        if (
            !meta ||
            !meta.data[index]
        ) {

            return;

        }


        const point =
            meta.data[index];


        hoverLine.style.left =
            point.x +
            'px';


        hoverLine.style.opacity =
            '1';

    }


    /* =========================================================
       CREAR GRÁFICA
       ========================================================= */

    const financialChart =
        new Chart(

            financialCtx,

            {

                type:
                    'line',


                data: {

                    labels:
                        financialData.labels,


                    datasets: [


                        /* =================================
                           INGRESOS
                           ================================= */

                        {

                            label:
                                'Ingresos',


                            data:
                                financialData.income,


                            borderColor:
                                '#31c477',


                            backgroundColor:
                                gradients
                                    .incomeGradient,


                            fill:
                                'origin',


                            tension:
                                .36,


                            cubicInterpolationMode:
                                'monotone',


                            borderWidth:
                                2.7,


                            borderCapStyle:
                                'round',


                            borderJoinStyle:
                                'round',


                            pointRadius:
                                0,


                            pointHoverRadius:
                                5,


                            pointHitRadius:
                                20,


                            pointBackgroundColor:
                                '#31c477',


                            pointBorderColor:
                                'rgba(255,255,255,.85)',


                            pointBorderWidth:
                                1.5,


                            order:
                                1

                        },


                        /* =================================
                           COSTOS
                           ================================= */

                        {

                            label:
                                'Costos',


                            data:
                                financialData.costs,


                            borderColor:
                                '#df604d',


                            backgroundColor:
                                gradients
                                    .costsGradient,


                            fill:
                                'origin',


                            tension:
                                .36,


                            cubicInterpolationMode:
                                'monotone',


                            borderWidth:
                                2.6,


                            borderCapStyle:
                                'round',


                            borderJoinStyle:
                                'round',


                            pointRadius:
                                0,


                            pointHoverRadius:
                                5,


                            pointHitRadius:
                                20,


                            pointBackgroundColor:
                                '#df604d',


                            pointBorderColor:
                                'rgba(255,255,255,.85)',


                            pointBorderWidth:
                                1.5,


                            order:
                                2

                        },


                        /* =================================
                           GANANCIAS
                           ================================= */

                        {

                            label:
                                'Ganancias',


                            data:
                                financialData.profits,


                            borderColor:
                                '#408fde',


                            backgroundColor:
                                gradients
                                    .profitsGradient,


                            fill:
                                'origin',


                            tension:
                                .36,


                            cubicInterpolationMode:
                                'monotone',


                            borderWidth:
                                2.6,


                            borderCapStyle:
                                'round',


                            borderJoinStyle:
                                'round',


                            pointRadius:
                                0,


                            pointHoverRadius:
                                5,


                            pointHitRadius:
                                20,


                            pointBackgroundColor:
                                '#408fde',


                            pointBorderColor:
                                'rgba(255,255,255,.85)',


                            pointBorderWidth:
                                1.5,


                            order:
                                3

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    /*
                       El reveal inicial
                       lo controla GSAP.
                    */

                    animation:
                        false,


                    interaction: {

                        mode:
                            'index',

                        intersect:
                            false

                    },


                    plugins: {


                        /* LEYENDA */

                      legend: {

    position:
        'bottom',

    align:
        'center',


    /* =========================================
       LABELS PERSONALIZADOS
       ========================================= */

    labels: {

        color:
            '#ffffff',

        usePointStyle:
            true,

        pointStyle:
            'line',

        boxWidth:
            28,

        boxHeight:
            3,

        padding:
            28,

        font: {

            size:
                12

        },


        /* =====================================
           FORZAR COLOR DE CADA INDICADOR
           ===================================== */

        generateLabels(chart) {

            const datasets =
                chart.data.datasets;


            return datasets.map(

                function(
                    dataset,
                    index
                ) {

                    return {

                        text:
                            dataset.label,

                        fillStyle:
                            dataset.borderColor,

                        strokeStyle:
                            dataset.borderColor,

                        fontColor:
                            '#ffffff',

                        lineWidth:
                            3,

                        pointStyle:
                            'line',

                        hidden:
                            !chart.isDatasetVisible(
                                index
                            ),

                        datasetIndex:
                            index

                    };

                }

            );

        }

    },


    /* =========================================
       HOVER PREMIUM
       ========================================= */

    onHover(
        event,
        legendItem,
        legend
    ) {

        const chart =
            legend.chart;


        const activeIndex =
            legendItem.datasetIndex;


        /*
           Cambiar cursor
        */

        if (
            event.native?.target
        ) {

            event.native
                .target
                .style
                .cursor =
                'pointer';

        }


        /*
           Guardamos dataset activo
        */

        chart.$activeLegendIndex =
            activeIndex;


        /*
           Redibujar
        */

        chart.draw();

    },


    /* =========================================
       CUANDO SALE EL CURSOR
       ========================================= */

    onLeave(
        event,
        legendItem,
        legend
    ) {

        const chart =
            legend.chart;


        if (
            event.native?.target
        ) {

            event.native
                .target
                .style
                .cursor =
                'default';

        }


        chart.$activeLegendIndex =
            null;


        chart.draw();

    }

},


                        filler: {

                            propagate:
                                true

                        },


                        tooltip: {

                            enabled:
                                false,


                            external:
                                externalFinancialTooltip

                        }

                    },


                    scales: {


                        /* =============================
                           EJE X
                           ============================= */

                        x: {

                            stacked:
                                false,


                            border: {

                                display:
                                    false

                            },


                            grid: {

                                display:
                                    false

                            },


                            ticks: {

                                color:
                                    'rgba(255,255,255,.82)',


                                padding:
                                    14,


                                /*
                                   Importante porque cuando
                                   tenemos 3 o 6 meses queremos
                                   verlos todos.
                                */

                                autoSkip:
                                    false,


                                maxRotation:
                                    0,


                                minRotation:
                                    0,


                                font: {

                                    size:
                                        12

                                }

                            }

                        },


                        /* =============================
                           EJE Y
                           ============================= */

                        y: {

                            stacked:
                                false,


                            beginAtZero:
                                true,


                            min:
                                0,


                            max:
                                1000000,


                            border: {

                                display:
                                    false

                            },


                            grid: {

                                color:
                                    'rgba(255,255,255,.085)',


                                lineWidth:
                                    1,


                                drawTicks:
                                    false

                            },


                            ticks: {

                                stepSize:
                                    200000,


                                color:
                                    'rgba(255,255,255,.88)',


                                padding:
                                    14,


                                font: {

                                    size:
                                        12

                                },


                                callback(
                                    value
                                ) {

                                    return (

                                        '$'
                                        +

                                        Number(value)
                                            .toLocaleString(
                                                'es-MX'
                                            )

                                    );

                                }

                            }

                        }

                    },


                    onHover(

                        event,

                        activeElements,

                        chart

                    ) {

                        if (
                            !initialRevealFinished
                        ) {

                            if (
                                event.native?.target
                            ) {

                                event.native
                                    .target
                                    .style
                                    .cursor =
                                    'default';

                            }


                            return;

                        }


                        if (
                            event.native?.target
                        ) {

                            event.native
                                .target
                                .style
                                .cursor =

                                activeElements.length

                                    ? 'pointer'

                                    : 'default';

                        }


                        updateFinancialHover(

                            event,

                            activeElements,

                            chart

                        );

                    }

                },


               plugins: [

    financialRevealPlugin,

    financialLegendGlowPlugin,

    lastPointGlowPlugin

]

            }

        );


    /* =========================================================
       REVEAL GSAP
       ========================================================= */

    function playFinancialReveal() {


        if (
            typeof gsap ===
            'undefined'
        ) {

            financialReveal.progress =
                1;


            initialRevealFinished =
                true;


            financialChart.draw();


            return;

        }


        if (
            revealTimeline
        ) {

            revealTimeline.kill();


            revealTimeline =
                null;

        }


        gsap.killTweensOf(
            financialReveal
        );


        initialRevealFinished =
            false;


        allowFinancialShine =
            false;


        financialReveal.progress =
            0;


        financialChart.draw();


        revealTimeline =
            gsap.timeline({

                onComplete:
                    function() {


                        financialReveal.progress =
                            1;


                        initialRevealFinished =
                            true;


                        financialChart.draw();


                        allowFinancialShine =
                            true;


                        runFinancialShine();


                        revealTimeline =
                            null;

                    }

            });


        revealTimeline.to(

            financialReveal,

            {

                progress:
                    1,


                duration:
                    2.8,


                ease:
                    'power2.inOut',


                onUpdate:
                    function() {

                        financialChart.draw();

                    }

            }

        );

    }


    /* =========================================================
       ACTUALIZAR GRÁFICA
       ========================================================= */

    window.updateFinancialChart =
    function(data) {


        if (!data) {

            return;

        }


        if (

            !Array.isArray(
                data.labels
            )

            ||

            !Array.isArray(
                data.income
            )

            ||

            !Array.isArray(
                data.costs
            )

            ||

            !Array.isArray(
                data.profits
            )

        ) {

            console.warn(

                'Los datos financieros no tienen el formato correcto.'

            );


            return;

        }


        const amount =
            data.labels.length;


        if (

            data.income.length !== amount

            ||

            data.costs.length !== amount

            ||

            data.profits.length !== amount

        ) {

            console.warn(

                'Las series financieras tienen diferente cantidad de valores.'

            );


            return;

        }


        financialChart.data.labels =
            data.labels;


        financialChart
            .data
            .datasets[0]
            .data =

            data.income.map(
                Number
            );


        financialChart
            .data
            .datasets[1]
            .data =

            data.costs.map(
                Number
            );


        financialChart
            .data
            .datasets[2]
            .data =

            data.profits.map(
                Number
            );


        /*
           Actualizar inmediatamente
           antes del reveal.
        */

        financialChart.update(
            'none'
        );

    };


    /* =========================================================
       OBTENER UN MES DEL DEMO
       ========================================================= */

    function getFinancialDemoMonth(
        monthIndex
    ) {

        return {

            label:
                financialMonthLabels[
                    monthIndex
                ],


            income:
                financialFullYearData
                    .income[
                        monthIndex
                    ],


            costs:
                financialFullYearData
                    .costs[
                        monthIndex
                    ],


            profits:
                financialFullYearData
                    .profits[
                        monthIndex
                    ]

        };

    }


    /* =========================================================
       CREAR PERIODO DE X MESES

       Ejemplo en agosto:

       3 meses
       Jun Jul Ago

       6 meses
       Mar Abr May Jun Jul Ago
       ========================================================= */

    function buildFinancialMonthRange(
        numberOfMonths
    ) {

        const now =
            new Date();


        const currentMonth =
            now.getMonth();


        const startMonth =
            currentMonth
            -
            (
                numberOfMonths -
                1
            );


        const result = {

            labels: [],

            income: [],

            costs: [],

            profits: []

        };


        for (
            let offset = 0;
            offset < numberOfMonths;
            offset++
        ) {

            /*
               Puede dar negativo si estamos,
               por ejemplo, en enero y pedimos
               los últimos 6 meses.
            */

            const rawMonth =
                startMonth +
                offset;


            /*
               Normalizamos a 0-11.
            */

            const normalizedMonth =
                (
                    rawMonth % 12 +
                    12
                )
                %
                12;


            const month =
                getFinancialDemoMonth(
                    normalizedMonth
                );


            result.labels.push(
                month.label
            );


            result.income.push(
                month.income
            );


            result.costs.push(
                month.costs
            );


            result.profits.push(
                month.profits
            );

        }


        return result;

    }


    /* =========================================================
       PERIODO DE UN SOLO MES
       ========================================================= */

    function buildCurrentFinancialMonth() {

        const currentMonth =
            new Date()
                .getMonth();


        const month =
            getFinancialDemoMonth(
                currentMonth
            );


        return {

            labels: [
                month.label
            ],

            income: [
                month.income
            ],

            costs: [
                month.costs
            ],

            profits: [
                month.profits
            ]

        };

    }


    /* =========================================================
       AÑO COMPLETO
       ========================================================= */

    function buildFullFinancialYear() {

        return {

            labels:
                [
                    ...financialFullYearData.labels
                ],


            income:
                [
                    ...financialFullYearData.income
                ],


            costs:
                [
                    ...financialFullYearData.costs
                ],


            profits:
                [
                    ...financialFullYearData.profits
                ]

        };

    }


    /* =========================================================
       CAMBIAR PERIODO VISUALMENTE
       ========================================================= */

    function applyFinancialPeriod(
        period
    ) {

        let filteredData =
            null;


        /* =============================================
           ESTE AÑO
           ============================================= */

        if (
            period === 'year'
        ) {

            filteredData =
                buildFullFinancialYear();

        }


        /* =============================================
           ESTE MES
           ============================================= */

        else if (
            period === 'month'
        ) {

            filteredData =
                buildCurrentFinancialMonth();

        }


        /* =============================================
           ÚLTIMOS 3 MESES
           ============================================= */

        else if (
            period === '3months'
        ) {

            filteredData =
                buildFinancialMonthRange(
                    3
                );

        }


        /* =============================================
           ÚLTIMOS 6 MESES
           ============================================= */

        else if (
            period === '6months'
        ) {

            filteredData =
                buildFinancialMonthRange(
                    6
                );

        }


        /* =============================================
           AÑO ESPECÍFICO
           2026 / 2025 / 2024...
           ============================================= */

        else if (
            /^\d{4}$/.test(
                String(period)
            )
        ) {

            /*
               Por ahora usamos los datos demo
               de 12 meses.

               Cuando conectemos backend,
               aquí vendrán los datos reales
               correspondientes al año elegido.
            */

            filteredData =
                buildFullFinancialYear();

        }


        if (
            !filteredData
        ) {

            return;

        }


        /*
           Actualizamos datos.
        */

        updateFinancialChart(
            filteredData
        );


        /*
           Volvemos a ejecutar el reveal.

           Así al pasar:
           12 meses → 6 meses → 3 meses

           la gráfica vuelve a dibujarse
           elegantemente.
        */

        requestAnimationFrame(

            function() {

                playFinancialReveal();

            }

        );

    }


    /* =========================================================
       SELECTOR FINANCIERO
       ========================================================= */

    document.addEventListener(

        'financialPeriodChange',

        function(event) {


            const detail =
                event.detail ||
                {};


            const period =
                String(
                    detail.period ||
                    'year'
                );


            console.log(

                'Periodo financiero solicitado:',

                detail

            );


            /* =============================================
               DEMO FRONTEND

               Cambiar inmediatamente la gráfica
               para que ya sea interactiva.
               ============================================= */

            applyFinancialPeriod(
                period
            );


            /* =============================================
               FUTURO BACKEND

               IMPORTANTE:
               Esta estructura ya queda lista.

               Cuando habilitemos PHP,
               puedes quitar/comentar:

                   applyFinancialPeriod(period);

               y activar este fetch.
               ============================================= */


            /*
            const params =
                new URLSearchParams({

                    period:
                        period,

                    start:
                        detail.startDate,

                    end:
                        detail.endDate

                });


            fetch(

                'api/financial-summary.php?'
                +
                params.toString()

            )


            .then(

                response => {

                    if (
                        !response.ok
                    ) {

                        throw new Error(

                            'No fue posible consultar los datos financieros.'

                        );

                    }


                    return response.json();

                }

            )


            .then(

                data => {


                    updateFinancialChart(
                        data
                    );


                    requestAnimationFrame(

                        function() {

                            playFinancialReveal();

                        }

                    );

                }

            )


            .catch(

                error => {

                    console.error(

                        'Error financiero:',

                        error

                    );

                }

            );
            */

        }

    );


    /* =========================================================
       REPETIR REVEAL MANUALMENTE
       ========================================================= */

    window.replayFinancialChart =
    function() {

        playFinancialReveal();

    };


    /* =========================================================
       MOUSE LEAVE
       ========================================================= */

    financialCanvas.addEventListener(

        'mouseleave',

        function() {


            if (
                hoverLine
            ) {

                hoverLine.style.opacity =
                    '0';

            }


            financialTooltip
                ?.classList
                .remove(
                    'visible'
                );

        }

    );


/* =========================================================
   INICIAR GRÁFICA
   SINCRONIZADA CON TECHNOVA ENTRANCE
   ========================================================= */

let financialEntranceStarted =
    false;


/* =========================================
   EJECUTAR
   ========================================= */

function startFinancialEntranceReveal() {

    financialEntranceStarted =
        true;


    requestAnimationFrame(

        function() {

            requestAnimationFrame(

                function() {

                    playFinancialReveal();

                }

            );

        }

    );

}


/* =========================================
   ESPERAR AL DASHBOARD
   ========================================= */

document.addEventListener(

    'technova:financial-reveal',

    startFinancialEntranceReveal

);


/* =========================================
   FALLBACK

   Si animations.js fallara,
   la gráfica igualmente aparece.
   ========================================= */

setTimeout(

    function() {

        if (
            !financialEntranceStarted
        ) {

            startFinancialEntranceReveal();

        }

    },

    4500

);


} // FIN financialCanvas