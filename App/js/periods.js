/**
 * SELECTORES DE PERIODO
 * ---------------------
 * Controla el periodo de la gráfica financiera y el periodo general del reporte.
 * Mantiene apertura/cierre, foco, aria-expanded, clic exterior y Escape.
 *
 * No actualiza gráficas directamente: emite financialPeriodChange para que
 * charts.js aplique el periodo. Las fechas del reporte se normalizan para que
 * un futuro backend reciba límites de calendario consistentes.
 */

/* =========================================================
   SELECTOR DE PERIODO FINANCIERO
   ========================================================= */

const financialPeriodWrapper =
    document.querySelector(
        '.financial-period-wrapper'
    );


const financialPeriodButton =
    document.getElementById(
        'financialPeriodButton'
    );


const financialPeriodText =
    document.getElementById(
        'financialPeriodText'
    );


const financialPeriodOptions =
    document.querySelectorAll(
        '.financial-period-option'
    );


/* =========================================================
   ABRIR MENÚ
   ========================================================= */

function openFinancialPeriod() {

    if (!financialPeriodWrapper) {
        return;
    }


    financialPeriodWrapper
        .classList.add(
            'is-open'
        );


    financialPeriodButton
        ?.setAttribute(
            'aria-expanded',
            'true'
        );

}


/* =========================================================
   CERRAR MENÚ
   ========================================================= */

function closeFinancialPeriod() {

    if (!financialPeriodWrapper) {
        return;
    }


    financialPeriodWrapper
        .classList.remove(
            'is-open'
        );


    financialPeriodButton
        ?.setAttribute(
            'aria-expanded',
            'false'
        );

}


/* =========================================================
   TOGGLE
   ========================================================= */

function toggleFinancialPeriod() {

    if (!financialPeriodWrapper) {
        return;
    }


    const isOpen =
        financialPeriodWrapper
            .classList
            .contains(
                'is-open'
            );


    if (isOpen) {

        closeFinancialPeriod();

    } else {

        openFinancialPeriod();

    }

}


/* =========================================================
   CLICK EN BOTÓN "ESTE AÑO"
   ========================================================= */

financialPeriodButton
    ?.addEventListener(
        'click',
        function(event) {

            /*
               Evita que el click llegue
               inmediatamente al document
               y cierre el menú.
            */

            event.stopPropagation();


            toggleFinancialPeriod();

        }
    );


/* =========================================================
   SELECCIONAR OPCIÓN
   ========================================================= */

financialPeriodOptions.forEach(
    function(option) {

        option.addEventListener(
            'click',
            function(event) {

                event.stopPropagation();


                const period =
                    option.dataset.period;


                const label =
                    option.textContent.trim();


                /*
                   Quitar activo anterior.
                */

                financialPeriodOptions.forEach(
                    function(item) {

                        item.classList.remove(
                            'active'
                        );

                    }
                );


                /*
                   Activar nueva opción.
                */

                option.classList.add(
                    'active'
                );


                /*
                   Cambiar texto del botón.
                */

                if (financialPeriodText) {

                    financialPeriodText.textContent =
                        label;

                }


                /*
                   Cerrar menú.
                */

                closeFinancialPeriod();


                /*
                   Preparar fechas.
                */

                dispatchFinancialPeriod(
                    period,
                    label
                );

            }
        );

    }
);


/* =========================================================
   CERRAR SI SE HACE CLICK AFUERA
   ========================================================= */

document.addEventListener(
    'click',
    function(event) {

        if (
            financialPeriodWrapper &&
            !financialPeriodWrapper.contains(
                event.target
            )
        ) {

            closeFinancialPeriod();

        }

    }
);


/* =========================================================
   PREPARAR PERIODO PARA BACKEND
   ========================================================= */

function dispatchFinancialPeriod(
    period,
    label
) {

    const now =
        new Date();


    let startDate = null;

    let endDate = null;



    /* =====================================================
       ESTE AÑO
       ===================================================== */

    if (period === 'year') {

        const year =
            now.getFullYear();


        startDate =
            `${year}-01-01`;


        endDate =
            `${year}-12-31`;

    }



    /* =====================================================
       ESTE MES
       ===================================================== */

    else if (period === 'month') {

        const year =
            now.getFullYear();


        const month =
            now.getMonth();


        const lastDay =
            new Date(
                year,
                month + 1,
                0
            )
            .getDate();


        startDate =
            `${year}-${String(month + 1)
                .padStart(2, '0')}-01`;


        endDate =
            `${year}-${String(month + 1)
                .padStart(2, '0')}-${String(lastDay)
                .padStart(2, '0')}`;

    }



    /* =====================================================
       ÚLTIMOS 3 MESES
       ===================================================== */

    else if (period === '3months') {

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 2,
                1
            );


        const year =
            start.getFullYear();


        const month =
            start.getMonth() + 1;


        startDate =
            `${year}-${String(month)
                .padStart(2, '0')}-01`;


        endDate =
            formatDateForBackend(now);

    }



    /* =====================================================
       ÚLTIMOS 6 MESES
       ===================================================== */

    else if (period === '6months') {

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 5,
                1
            );


        const year =
            start.getFullYear();


        const month =
            start.getMonth() + 1;


        startDate =
            `${year}-${String(month)
                .padStart(2, '0')}-01`;


        endDate =
            formatDateForBackend(now);

    }



    /* =====================================================
       AÑO ESPECÍFICO
       2026 / 2025 / 2024...
       ===================================================== */

    else if (
        /^\d{4}$/.test(period)
    ) {

        startDate =
            `${period}-01-01`;


        endDate =
            `${period}-12-31`;

    }



    /* =====================================================
       DISPARAR EVENTO
       ===================================================== */

    document.dispatchEvent(

        new CustomEvent(
            'financialPeriodChange',

            {

                detail: {

                    period:
                        period,

                    label:
                        label,

                    startDate:
                        startDate,

                    endDate:
                        endDate

                }

            }

        )

    );

}


/* =========================================================
   FORMATO YYYY-MM-DD
   ========================================================= */

function formatDateForBackend(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            '0'
        );


    return (
        `${year}-${month}-${day}`
    );

}

/* =========================================================
   SELECTOR DE PERIODO MENSUAL
   ========================================================= */

const reportWrapper =
    document.querySelector(
        '.report-period-wrapper'
    );


const reportButton =
    document.getElementById(
        'reportPeriodButton'
    );


const reportText =
    document.getElementById(
        'reportPeriodText'
    );


const reportCurrentMonth =
    document.getElementById(
        'reportCurrentMonth'
    );


const monthList =
    document.getElementById(
        'reportMonthList'
    );


const previousMonthButton =
    document.getElementById(
        'previousMonth'
    );


const nextMonthButton =
    document.getElementById(
        'nextMonth'
    );



/* =========================================================
   MESES
   ========================================================= */

const reportMonthNames = [

    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'

];



/* =========================================================
   FECHA ACTUAL DEL SISTEMA
   ========================================================= */

const currentReportDate =
    new Date();


/*
   Creamos la fecha usando:

   - año actual
   - mes actual
   - día 1

   Ejemplo:
   agosto 2026 → 2026 / 7 / 1

   Recuerda que JavaScript cuenta:
   enero = 0
   agosto = 7
*/

let selectedReportDate =
    new Date(

        currentReportDate.getFullYear(),

        currentReportDate.getMonth(),

        1

    );



/* =========================================================
   ÚLTIMO DÍA DEL MES
   ========================================================= */

function getReportLastDayOfMonth(
    year,
    month
) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}



/* =========================================================
   FORMATEAR PERIODO
   ========================================================= */

function formatReportPeriod(
    date
) {

    const year =
        date.getFullYear();


    const month =
        date.getMonth();


    const monthName =
        reportMonthNames[month];


    const lastDay =
        getReportLastDayOfMonth(
            year,
            month
        );


    return (
        '01 ' +
        monthName +
        ' ' +
        year +
        ' - ' +
        lastDay +
        ' ' +
        monthName +
        ' ' +
        year
    );

}



/* =========================================================
   ABRIR MENÚ
   ========================================================= */

function openReportPeriod() {

    if (!reportWrapper) {

        return;

    }


    reportWrapper.classList.add(
        'is-open'
    );


    reportButton
        ?.setAttribute(
            'aria-expanded',
            'true'
        );

}



/* =========================================================
   CERRAR MENÚ
   ========================================================= */

function closeReportPeriod() {

    if (!reportWrapper) {

        return;

    }


    reportWrapper.classList.remove(
        'is-open'
    );


    reportButton
        ?.setAttribute(
            'aria-expanded',
            'false'
        );

}



/* =========================================================
   ABRIR / CERRAR
   ========================================================= */

function toggleReportPeriod() {

    if (!reportWrapper) {

        return;

    }


    const isOpen =
        reportWrapper.classList.contains(
            'is-open'
        );


    if (isOpen) {

        closeReportPeriod();

    } else {

        openReportPeriod();

    }

}



/* =========================================================
   LISTA DE MESES
   ========================================================= */

function renderReportMonthList() {

    if (!monthList) {

        return;

    }


    monthList.innerHTML = '';


    const selectedMonth =
        selectedReportDate.getMonth();


    const year =
        selectedReportDate.getFullYear();


    reportMonthNames.forEach(
        function(monthName, index) {

            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.className =
                'report-month-option';


            button.textContent =
                monthName.substring(
                    0,
                    3
                );


            /*
               Marcar mes seleccionado.
            */

            if (
                index === selectedMonth
            ) {

                button.classList.add(
                    'active'
                );

            }


            /*
               Seleccionar mes.
            */

            button.addEventListener(
                'click',
                function(event) {

                    event.stopPropagation();


                    selectedReportDate =
                        new Date(
                            year,
                            index,
                            1
                        );


                    updateReportPeriodUI();


                    closeReportPeriod();

                }
            );


            monthList.appendChild(
                button
            );

        }
    );

}



/* =========================================================
   ACTUALIZAR INTERFAZ
   ========================================================= */

function updateReportPeriodUI() {

    if (!reportText) {

        return;

    }


    const month =
        selectedReportDate.getMonth();


    const year =
        selectedReportDate.getFullYear();


    /*
       Texto principal:
       01 julio 2026 - 31 julio 2026
    */

    reportText.textContent =
        formatReportPeriod(
            selectedReportDate
        );


    /*
       Encabezado del menú:
       Julio 2026
    */

    if (reportCurrentMonth) {

        const monthName =
            reportMonthNames[month];


        reportCurrentMonth.textContent =
            monthName
                .charAt(0)
                .toUpperCase()

            +

            monthName.slice(1)

            +

            ' '

            +

            year;

    }


    /*
       Actualizar meses.
    */

    renderReportMonthList();


    /*
       Preparar datos para backend.
    */

    dispatchReportPeriodChange();

}



/* =========================================================
   MES ANTERIOR
   ========================================================= */

previousMonthButton
    ?.addEventListener(
        'click',
        function(event) {

            event.stopPropagation();


            selectedReportDate =
                new Date(

                    selectedReportDate
                        .getFullYear(),

                    selectedReportDate
                        .getMonth() - 1,

                    1

                );


            updateReportPeriodUI();

        }
    );



/* =========================================================
   MES SIGUIENTE
   ========================================================= */

nextMonthButton
    ?.addEventListener(
        'click',
        function(event) {

            event.stopPropagation();


            selectedReportDate =
                new Date(

                    selectedReportDate
                        .getFullYear(),

                    selectedReportDate
                        .getMonth() + 1,

                    1

                );


            updateReportPeriodUI();

        }
    );



/* =========================================================
   CLICK EN BOTÓN DE FECHA
   ========================================================= */

reportButton
    ?.addEventListener(
        'click',
        function(event) {

            /*
               Evita que el listener global
               cierre el menú inmediatamente.
            */

            event.stopPropagation();


            /*
               Si está abierto el selector
               financiero, lo cerramos.
            */

            if (
                typeof closeFinancialPeriod
                === 'function'
            ) {

                closeFinancialPeriod();

            }


            toggleReportPeriod();

        }
    );



/* =========================================================
   CERRAR AL HACER CLICK AFUERA
   ========================================================= */

document.addEventListener(
    'click',
    function(event) {

        if (
            reportWrapper &&
            !reportWrapper.contains(
                event.target
            )
        ) {

            closeReportPeriod();

        }

    }
);



/* =========================================================
   PREPARAR PERIODO PARA BACKEND
   ========================================================= */

function dispatchReportPeriodChange() {

    const year =
        selectedReportDate
            .getFullYear();


    const month =
        selectedReportDate
            .getMonth();


    const lastDay =
        getReportLastDayOfMonth(
            year,
            month
        );


    const startDate =
        year +

        '-' +

        String(
            month + 1
        ).padStart(
            2,
            '0'
        )

        +

        '-01';


    const endDate =
        year +

        '-' +

        String(
            month + 1
        ).padStart(
            2,
            '0'
        )

        +

        '-' +

        String(
            lastDay
        ).padStart(
            2,
            '0'
        );


    document.dispatchEvent(

        new CustomEvent(
            'reportPeriodChange',

            {

                detail: {

                    year:
                        year,

                    month:
                        month + 1,

                    startDate:
                        startDate,

                    endDate:
                        endDate

                }

            }

        )

    );

}



