/**
 * INTERFAZ Y KPI DEL DASHBOARD
 * ---------------------------
 * Administra efectos reactivos, lectura/formato de números y animación de KPI.
 * Los nodos se conectan mediante data-kpi-value y data-kpi-change; no dependen
 * del texto visible ni de una posición fija dentro del HTML.
 *
 * API pública: window.TechNovaDashboard.updateDashboardKpis(data).
 * Dependencia opcional: GSAP. Con reduced motion se aplica el valor final.
 */

/* =========================================
   LIQUID GLASS REACTIVO AL CURSOR
   ========================================= */

const glassElements = document.querySelectorAll(

    '.card,' +
    '.card-2,' +
    '.grafica,' +
    '.card-3,' +
    '.card-4,' +
    '.switch-container-3,' +
    '.row-3'

);


glassElements.forEach(function(element) {

    element.classList.add(
        'glass-reactive'
    );


    element.addEventListener(

        'mousemove',

        function(event) {

            const rect =
                element.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            element.style.setProperty(

                '--mouse-x',

                x + 'px'

            );


            element.style.setProperty(

                '--mouse-y',

                y + 'px'

            );

        }

    );


});

/* =========================================
   CONTADORES ANIMADOS CON GSAP
   ========================================= */

const counterElements = document.querySelectorAll(
    '[data-kpi-value]'
);


/*
    Analiza el texto actual.

    Ejemplos:

    "$899,000"
    ↓
    value  = 899000
    prefix = "$"
    suffix = ""

    "1,345h"
    ↓
    value  = 1345
    prefix = ""
    suffix = "h"
*/

function parseCounterValue(text) {

    const original = text.trim();


    const prefix =
        original.startsWith('$')
            ? '$'
            : '';


    const suffix =
        original.toLowerCase().endsWith('h')
            ? 'h'
            : '';


    const cleanNumber = original
        .replace(/\$/g, '')
        .replace(/h/gi, '')
        .replace(/,/g, '')
        .trim();


    const value = Number(cleanNumber);


    return {

        value:
            Number.isFinite(value)
                ? value
                : 0,

        prefix: prefix,

        suffix: suffix

    };

}

/*
=========================================
FORMATO DEL NÚMERO
=========================================
*/

function formatCounterValue(
    value,
    prefix = '',
    suffix = ''
) {

    const formattedValue = Math.round(value)
        .toLocaleString('es-MX');


    return (
        prefix +
        formattedValue +
        suffix
    );

}

/*
=========================================
ANIMAR CONTADOR
=========================================
*/

function animateCounter(
    element,
    newValue,
    options = {}
) {

    if (!element) return;


    /*
        Valor anterior.

        Si nunca se ha animado,
        empieza desde 0.
    */

    const previousValue =
        Number(
            element.dataset.currentValue
            ?? 0
        );


    const prefix =
        options.prefix
        ?? element.dataset.prefix
        ?? '';


    const suffix =
        options.suffix
        ?? element.dataset.suffix
        ?? '';


    /*
        Objeto que GSAP animará.
    */

    const counter = {

        value: previousValue

    };


   gsap.to(counter, {

    value:Number(newValue),

    duration:2.4,

    ease:"expo.out",


        onUpdate: function () {

            element.textContent =
                formatCounterValue(

                    counter.value,

                    prefix,

                    suffix

                );

        },


        onComplete: function () {

            /*
                Guardamos el nuevo valor.

                Esto será importante
                cuando llegue el backend.
            */

            element.dataset.currentValue =
                String(newValue);


            element.textContent =
                formatCounterValue(

                    newValue,

                    prefix,

                    suffix

                );

        }

    });

}


/* =========================================
   ACTUALIZAR KPI DESDE DATOS EXTERNOS
   ========================================= */

function formatKpiChange(value, format) {

    const numericValue = Number(value);


    if (!Number.isFinite(numericValue)) {

        return String(value ?? '');

    }


    const sign =
        numericValue > 0
            ? '+'
            : numericValue < 0
                ? '-'
                : '';


    const formattedValue =
        Math.abs(numericValue)
            .toLocaleString(
                'es-MX',
                {
                    maximumFractionDigits: 2
                }
            );


    return (
        sign
        + formattedValue
        + (format === 'percentage' ? '%' : '')
    );

}


function updateDashboardKpis(responseData) {

    if (
        !responseData
        ||
        typeof responseData !== 'object'
    ) {

        return [];

    }


    const values =
        responseData.kpis
        &&
        typeof responseData.kpis === 'object'
            ? responseData.kpis
            : responseData;


    const updatedKeys = [];


    counterElements.forEach(function(element) {

        const key = element.dataset.kpiValue;


        if (
            !key
            ||
            !Object.prototype.hasOwnProperty.call(
                values,
                key
            )
        ) {

            return;

        }


        const newValue = Number(values[key]);


        if (!Number.isFinite(newValue)) {

            return;

        }


        const prefix =
            element.dataset.kpiPrefix
            ??
            element.dataset.prefix
            ??
            '';


        const suffix =
            element.dataset.kpiSuffix
            ??
            element.dataset.suffix
            ??
            '';


        element.dataset.prefix = prefix;
        element.dataset.suffix = suffix;
        element.dataset.targetValue = String(newValue);


        if (technovaCountersStarted) {

            animateCounter(
                element,
                newValue,
                {
                    prefix: prefix,
                    suffix: suffix
                }
            );

        }


        updatedKeys.push(key);

    });


    const changes =
        responseData.changes
        &&
        typeof responseData.changes === 'object'
            ? responseData.changes
            : {};


    document.querySelectorAll(
        '[data-kpi-change]'
    )
    .forEach(function(element) {

        const key = element.dataset.kpiChange;


        if (
            !Object.prototype.hasOwnProperty.call(
                changes,
                key
            )
        ) {

            return;

        }


        element.textContent =
            formatKpiChange(
                changes[key],
                element.dataset.kpiChangeFormat
            );

    });


    const periodLabel =
        responseData.periodLabel
        ??
        responseData.period?.label;


    if (periodLabel) {

        document.querySelectorAll(
            '[data-kpi-period]'
        )
        .forEach(function(element) {

            element.textContent =
                ' '
                + String(periodLabel).trim();

        });

    }


    return updatedKeys;

}

/*
=========================================
INICIALIZAR CONTADORES
SINCRONIZADOS CON LA ENTRADA
=========================================
*/

let technovaCountersStarted =
    false;


counterElements.forEach(

    function(element) {

        const data =
            parseCounterValue(
                element.textContent
            );


        element.dataset.prefix =
            data.prefix;


        element.dataset.suffix =
            data.suffix;


        element.dataset.targetValue =
            String(
                data.value
            );


        element.dataset.currentValue =
            '0';


        element.classList.add(
            'animated-counter'
        );


        element.textContent =
            formatCounterValue(

                0,

                data.prefix,

                data.suffix

            );

    }

);


/* =========================================
   ARRANCAR CUANDO LLEGUEN LAS KPI
   ========================================= */

function startTechNovaCounters() {

    if (
        technovaCountersStarted
    ) {

        return;

    }


    technovaCountersStarted =
        true;


    counterElements.forEach(

        function(
            element,
            index
        ) {

            const targetValue =
                Number(
                    element.dataset.targetValue
                    ||
                    0
                );


            gsap.delayedCall(

                index *
                .075,

                function() {

                    animateCounter(

                        element,

                        targetValue,

                        {

                            prefix:
                                element.dataset.prefix,

                            suffix:
                                element.dataset.suffix

                        }

                    );

                }

            );

        }

    );

}


document.addEventListener(

    'technova:kpi-reveal',

    startTechNovaCounters,

    {
        once:
            true
    }

);


/*
   FALLBACK:

   Si por alguna razón la animación
   principal no dispara el evento,
   los contadores no se quedan en cero.
*/

setTimeout(

    function() {

        if (
            !technovaCountersStarted
        ) {

            startTechNovaCounters();

        }

    },

    4200

);


window.TechNovaDashboard =
    window.TechNovaDashboard
    ||
    {};


window.TechNovaDashboard.updateDashboardKpis =
    updateDashboardKpis;


window.TechNovaDashboard.kpiKeys = [
    'projectsActive',
    'totalRevenue',
    'profits',
    'hoursWorked',
    'activeClients'
];


/*=========================================
    NOTIFICACIONES
=========================================*/



