/**
 * GASTOS RECURRENTES
 * -----------------
 * Controla la expansión del bloque y sincroniza etiquetas, iconos y atributos
 * accesibles con su estado actual. No persiste información por sí mismo.
 *
 * Flujo: clic del usuario -> toggleRecurringExpenses() -> actualización de clase
 * y aria -> updateRecurringExpensesUI(). Los datos permanecen listos para ser
 * sustituidos por un controlador de backend posterior.
 */

/* =========================================================
   INICIALIZAR SELECTOR
   ========================================================= */

if (
    reportWrapper &&
    reportButton &&
    reportText
) {

    updateReportPeriodUI();

}



/* =========================================================
   GASTOS RECURRENTES
   VER TODO / VER MENOS
   ========================================================= */

const recurringExpensesToggle =
    document.getElementById(
        'recurringExpensesToggle'
    );


const recurringExpensesToggleText =
    document.getElementById(
        'recurringExpensesToggleText'
    );


const recurringExpensesList =
    document.getElementById(
        'recurringExpensesList'
    );


/* =========================================================
   ESTADO
   ========================================================= */

let recurringExpensesExpanded =
    false;


/* =========================================================
   ACTUALIZAR INTERFAZ
   ========================================================= */

function updateRecurringExpensesUI() {

    if (
        !recurringExpensesToggle ||
        !recurringExpensesList
    ) {

        return;

    }


    /*
       MODO EXPANDIDO
    */

    if (
        recurringExpensesExpanded
    ) {

        recurringExpensesList
            .classList
            .add(
                'is-expanded'
            );


        recurringExpensesToggle
            .classList
            .add(
                'is-expanded'
            );


        recurringExpensesToggle
            .setAttribute(
                'aria-expanded',
                'true'
            );


        if (
            recurringExpensesToggleText
        ) {

            recurringExpensesToggleText
                .textContent =
                'Ver menos';

        }

    }


    /*
       MODO COMPACTO
    */

    else {

        recurringExpensesList
            .classList
            .remove(
                'is-expanded'
            );


        recurringExpensesToggle
            .classList
            .remove(
                'is-expanded'
            );


        recurringExpensesToggle
            .setAttribute(
                'aria-expanded',
                'false'
            );


        if (
            recurringExpensesToggleText
        ) {

            recurringExpensesToggleText
                .textContent =
                'Ver todo';

        }


        /*
           Regresar scroll arriba
           cuando cerramos.
        */

        recurringExpensesList
            .scrollTo({

                top:
                    0,

                behavior:
                    'smooth'

            });

    }

}


/* =========================================================
   CAMBIAR ESTADO
   ========================================================= */

function toggleRecurringExpenses() {

    recurringExpensesExpanded =
        !recurringExpensesExpanded;


    updateRecurringExpensesUI();

}


/* =========================================================
   CLICK
   ========================================================= */

recurringExpensesToggle
    ?.addEventListener(

        'click',

        function(event) {

            event.preventDefault();


            toggleRecurringExpenses();

        }

    );


/* =========================================================
   TECLADO
   ========================================================= */

recurringExpensesToggle
    ?.addEventListener(

        'keydown',

        function(event) {

            if (
                event.key ===
                'Enter'

                ||

                event.key ===
                ' '
            ) {

                event.preventDefault();


                toggleRecurringExpenses();

            }

        }

    );


