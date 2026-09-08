/**
 * FONDOS DE INVERSIÓN
 * ------------------
 * Controla selección de fondo, modal, lista ampliada, formato monetario y tema.
 * Los listeners traducen acciones del usuario a cambios de estado visual; las
 * funciones render* generan la lista desde datos normalizados.
 *
 * API pública: window.setInvestmentFunds(data) permite sustituir el fallback.
 * Los endpoints opcionales deben devolver JSON y conservar IDs estables.
 */

/* =========================================================
   INICIALIZAR
   ========================================================= */

renderNotificationGroups();


updateNotificationCount();

/* =========================================================
   FONDOS DE INVERSIÓN
   FRONTEND TEMPORAL
   LISTO PARA BACKEND
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const investmentSection =
    document.querySelector(
        '.investment-section'
    );


const investmentAddButton =
    document.getElementById(
        'investmentAddButton'
    );


const investmentModal =
    document.getElementById(
        'investmentModal'
    );


const investmentForm =
    document.getElementById(
        'investmentForm'
    );


const investmentViewAll =
    document.getElementById(
        'investmentViewAll'
    );


const investmentViewAllText =
    document.getElementById(
        'investmentViewAllText'
    );


const investmentList =
    document.getElementById(
        'investmentList'
    );


const investmentCount =
    document.getElementById(
        'investmentCount'
    );


const investmentListTotal =
    document.getElementById(
        'investmentListTotal'
    );


/* =========================================================
   CAMPOS TARJETA PRINCIPAL
   ========================================================= */

const investmentMainCard =
    document.getElementById(
        'investmentMainCard'
    );


const investmentCardAmount =
    document.getElementById(
        'investmentCardAmount'
    );


const investmentCardLastFour =
    document.getElementById(
        'investmentCardLastFour'
    );


const investmentCardTypeLabel =
    document.getElementById(
        'investmentCardTypeLabel'
    );


const investmentCardExpiry =
    document.getElementById(
        'investmentCardExpiry'
    );


const investmentCardHolder =
    document.getElementById(
        'investmentCardHolder'
    );


/* =========================================================
   CAMPOS FORMULARIO
   ========================================================= */

const investmentName =
    document.getElementById(
        'investmentName'
    );


const investmentAmount =
    document.getElementById(
        'investmentAmount'
    );


const investmentType =
    document.getElementById(
        'investmentType'
    );


const investmentLastFour =
    document.getElementById(
        'investmentLastFour'
    );


const investmentHolder =
    document.getElementById(
        'investmentHolder'
    );


const investmentExpiry =
    document.getElementById(
        'investmentExpiry'
    );


/* =========================================================
   DATOS DEMO

   Después esto desaparecerá y vendrá
   de PHP / MySQL.
   ========================================================= */

let investmentFunds = [

    {

        id: 1,

        name:
            'Fondo principal',

        amount:
            25000,

        type:
            'VISA',

        lastFour:
            '7223',

        holder:
            'Josue Islas Alvarez',

        expiry:
            '03/28',

        createdAt:
            new Date(
                '2026-08-01T10:00:00'
            )

    }

];


let activeInvestmentId =
    1;


let nextInvestmentId =
    2;


/* =========================================================
   MONEDA
   ========================================================= */

function formatInvestmentMoney(
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

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }

        );

}


/* =========================================================
   ABRIR MODAL
   ========================================================= */

function openInvestmentModal() {

    if (
        !investmentModal
    ) {

        return;

    }


    investmentModal.classList.add(
        'is-open'
    );


    investmentModal.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.style.overflow =
        'hidden';


    setTimeout(

        function() {

            investmentName?.focus();

        },

        120

    );

}


/* =========================================================
   CERRAR MODAL
   ========================================================= */

function closeInvestmentModal() {

    if (
        !investmentModal
    ) {

        return;

    }


    investmentModal.classList.remove(
        'is-open'
    );


    investmentModal.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.style.overflow =
        '';


    investmentForm?.reset();

}


/* =========================================================
   BOTÓN +
   ========================================================= */

investmentAddButton
    ?.addEventListener(

        'click',

        function(event) {

            event.preventDefault();

            event.stopPropagation();


            openInvestmentModal();

        }

    );


/* =========================================================
   CERRAR MODAL
   ========================================================= */

document
    .querySelectorAll(
        '[data-investment-close]'
    )
    .forEach(

        function(button) {

            button.addEventListener(

                'click',

                closeInvestmentModal

            );

        }

    );


/* =========================================================
   SOLO 4 NÚMEROS
   ========================================================= */

investmentLastFour
    ?.addEventListener(

        'input',

        function() {

            investmentLastFour.value =

                investmentLastFour
                    .value
                    .replace(
                        /\D/g,
                        ''
                    )
                    .slice(
                        0,
                        4
                    );

        }

    );


/* =========================================================
   MOSTRAR TARJETA
   ========================================================= */

/* =========================================================
   MOSTRAR FONDO / TARJETA SELECCIONADA
   ========================================================= */

function showInvestmentFund(
    investmentId
) {

    /* =====================================================
       1. BUSCAR PRIMERO EL FONDO
       ===================================================== */

    const fund =
        investmentFunds.find(

            function(item) {

                return (
                    item.id ===
                    Number(
                        investmentId
                    )
                );

            }

        );


    /*
       Si no existe, detenemos.
    */

    if (
        !fund
    ) {

        console.warn(
            'No se encontró el fondo:',
            investmentId
        );

        return;

    }


    /* =====================================================
       2. GUARDAR COMO ACTIVO
       ===================================================== */

    activeInvestmentId =
        fund.id;


    /* =====================================================
       3. INICIAR TRANSICIÓN
       ===================================================== */

    investmentMainCard
        ?.classList
        .add(
            'is-changing'
        );


    /* =====================================================
       4. ESPERAR PEQUEÑA TRANSICIÓN
       ===================================================== */

    setTimeout(

        function() {


            /* =============================================
               APLICAR DISEÑO SEGÚN TIPO
               ============================================= */

            applyInvestmentTheme(
                fund.type
            );


            /* =============================================
               MONTO
               ============================================= */

            if (
                investmentCardAmount
            ) {

                investmentCardAmount.textContent =
                    formatInvestmentMoney(
                        fund.amount
                    );

            }


            /* =============================================
               ÚLTIMOS 4
               ============================================= */

            if (
                investmentCardLastFour
            ) {

                investmentCardLastFour.textContent =
                    fund.lastFour;

            }


            /* =============================================
               TIPO
               ============================================= */

            if (
                investmentCardTypeLabel
            ) {

                investmentCardTypeLabel.textContent =
                    fund.type;

            }


            /* =============================================
               REFERENCIA / VENCIMIENTO
               ============================================= */

            if (
                investmentCardExpiry
            ) {

                investmentCardExpiry.textContent =
                    fund.expiry ||
                    '--';

            }


            /* =============================================
               TITULAR
               ============================================= */

            if (
                investmentCardHolder
            ) {

                investmentCardHolder.textContent =
                    fund.holder;

            }


            /* =============================================
               ID ACTUAL
               ============================================= */

            investmentMainCard
                ?.setAttribute(
                    'data-investment-id',
                    fund.id
                );


            /* =============================================
               TERMINAR TRANSICIÓN
               ============================================= */

            investmentMainCard
                ?.classList
                .remove(
                    'is-changing'
                );


            /* =============================================
               ACTUALIZAR LISTA
               ============================================= */

            renderInvestmentList();


        },

        180

    );

}


/* =========================================================
   RENDER LISTA
   ========================================================= */

function renderInvestmentList() {

    if (
        !investmentList
    ) {

        return;

    }


    investmentList.innerHTML =
        '';


    /*
       Orden por registro:
       primero los más antiguos.
    */

    const orderedFunds =
        [...investmentFunds]
            .sort(

                function(a, b) {

                    return (
                        a.createdAt -
                        b.createdAt
                    );

                }

            );


    orderedFunds.forEach(

        function(fund) {

            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'investment-list-item';


            if (
                fund.id ===
                activeInvestmentId
            ) {

                item.classList.add(
                    'active'
                );

            }


            item.dataset.investmentId =
                fund.id;


            item.innerHTML = `

                <div>

                    <div class="investment-item-name">
                        ${escapeInvestmentHTML(fund.name)}
                    </div>

                    <div class="investment-item-meta">
                        ${escapeInvestmentHTML(fund.type)}
                        ····
                        ${escapeInvestmentHTML(fund.lastFour)}
                    </div>

                </div>

                <div class="investment-item-amount">
                    ${formatInvestmentMoney(fund.amount)}
                </div>

            `;


            item.addEventListener(

                'click',

                function() {

                    showInvestmentFund(
                        fund.id
                    );


                    closeInvestmentList();

                }

            );


            investmentList.appendChild(
                item
            );

        }

    );


    /* CONTADORES */

    const total =
        investmentFunds.length;


    if (
        investmentCount
    ) {

        investmentCount.textContent =
            `(${total})`;

    }


    if (
        investmentListTotal
    ) {

        investmentListTotal.textContent =

            total === 1

                ? '1 fondo'

                : `${total} fondos`;

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeInvestmentHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


/* =========================================================
   GUARDAR
   ========================================================= */

investmentForm
    ?.addEventListener(

        'submit',

        function(event) {

            event.preventDefault();


            const lastFour =
                investmentLastFour
                    .value
                    .trim();


            if (
                !/^\d{4}$/.test(
                    lastFour
                )
            ) {

                investmentLastFour.focus();

                return;

            }


            const newFund = {

                id:
                    nextInvestmentId++,

                name:
                    investmentName
                        .value
                        .trim(),

                amount:
                    Number(
                        investmentAmount.value
                    ),

                type:
                    investmentType.value,

                lastFour:
                    lastFour,

                holder:
                    investmentHolder
                        .value
                        .trim(),

                expiry:
                    investmentExpiry
                        .value
                        .trim()
                    ||
                    '--',

                createdAt:
                    new Date()

            };


            investmentFunds.push(
                newFund
            );


            /*
               Cerramos formulario.
            */

            closeInvestmentModal();


            /*
               Nuevo fondo se convierte
               en tarjeta visible.
            */

            showInvestmentFund(
                newFund.id
            );


            /*
               Actualizar lista.
            */

            renderInvestmentList();


            /*
            =================================================
            FUTURO BACKEND
            =================================================

            fetch(
                'api/investments/create.php',
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            name:
                                newFund.name,

                            amount:
                                newFund.amount,

                            type:
                                newFund.type,

                            lastFour:
                                newFund.lastFour,

                            holder:
                                newFund.holder,

                            expiry:
                                newFund.expiry

                        })

                }
            )

            .then(
                response =>
                    response.json()
            )

            .then(
                data => {

                    console.log(
                        'Fondo guardado:',
                        data
                    );

                }
            );

            */

        }

    );


/* =========================================================
   VER TODO
   ========================================================= */

function openInvestmentList() {

    investmentSection
        ?.classList
        .add(
            'list-open'
        );


    investmentViewAll
        ?.setAttribute(
            'aria-expanded',
            'true'
        );


    if (
        investmentViewAllText
    ) {

        investmentViewAllText.textContent =
            'Ver menos';

    }

}


function closeInvestmentList() {

    investmentSection
        ?.classList
        .remove(
            'list-open'
        );


    investmentViewAll
        ?.setAttribute(
            'aria-expanded',
            'false'
        );


    if (
        investmentViewAllText
    ) {

        investmentViewAllText.textContent =
            'Ver todo';

    }

}


investmentViewAll
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            const isOpen =
                investmentSection
                    ?.classList
                    .contains(
                        'list-open'
                    );


            if (
                isOpen
            ) {

                closeInvestmentList();

            }

            else {

                renderInvestmentList();

                openInvestmentList();

            }

        }

    );


/* =========================================================
   CLICK FUERA DEL PANEL
   ========================================================= */

document.addEventListener(

    'click',

    function(event) {

        if (
            investmentSection
            &&
            !investmentSection.contains(
                event.target
            )
        ) {

            closeInvestmentList();

        }

    }

);


/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(

    'keydown',

    function(event) {

        if (
            event.key !==
            'Escape'
        ) {

            return;

        }


        closeInvestmentModal();

        closeInvestmentList();

    }

);





/* =========================================================
   API FRONTEND
   LISTA PARA BACKEND

   Después PHP podrá llamar:
   window.setInvestmentFunds(...)
   ========================================================= */

window.setInvestmentFunds =
function(data) {

    if (
        !Array.isArray(data)
    ) {

        return;

    }


    investmentFunds =
        data.map(

            function(item) {

                return {

                    id:
                        Number(
                            item.id
                        ),

                    name:
                        String(
                            item.name
                        ),

                    amount:
                        Number(
                            item.amount
                        ),

                    type:
                        String(
                            item.type
                        ),

                    lastFour:
                        String(
                            item.lastFour
                        ),

                    holder:
                        String(
                            item.holder
                        ),

                    expiry:
                        String(
                            item.expiry ||
                            '--'
                        ),

                    createdAt:
                        new Date(
                            item.createdAt
                        )

                };

            }

        );


    if (
        investmentFunds.length
    ) {

        activeInvestmentId =
            investmentFunds[0].id;


        showInvestmentFund(
            activeInvestmentId
        );

    }


    renderInvestmentList();

};



/* =========================================================
   CAMBIAR DISEÑO FÍSICO DE TARJETA
   ========================================================= */

function applyInvestmentTheme(type) {

    const normalizedType =
        String(type || 'VISA')
            .toUpperCase();


    const alternativeCards =
        document.querySelectorAll(
            '.investment-alt-card'
        );


    /* =====================================================
       OCULTAR TODAS LAS ALTERNATIVAS
       ===================================================== */

    alternativeCards.forEach(

        function(card) {

            card.classList.remove(
                'is-active'
            );

        }

    );


    /* =====================================================
       VISA
       MUESTRA LA TARJETA ORIGINAL
       ===================================================== */

    if (
        normalizedType ===
        'VISA'
    ) {

        investmentMainCard
            ?.classList
            .remove(
                'is-hidden'
            );


        return;

    }


    /* =====================================================
       OTROS TIPOS
       OCULTAMOS VISA
       ===================================================== */

    investmentMainCard
        ?.classList
        .add(
            'is-hidden'
        );


    /* =====================================================
       BUSCAR TARJETA CORRESPONDIENTE
       ===================================================== */

    const targetCard =
        document.querySelector(

            `.investment-alt-card[data-investment-card="${normalizedType}"]`

        );


    if (
        targetCard
    ) {

        targetCard.classList.add(
            'is-active'
        );

    }

}

/* =========================================================
   CARGAR DATOS EN TARJETAS ALTERNATIVAS
   ========================================================= */

function updateAlternativeInvestmentCards(
    fund
) {

    if (
        !fund
    ) {

        return;

    }


    /* =====================================================
       MONTO
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="amount"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    formatInvestmentMoney(
                        fund.amount
                    );

            }

        );


    /* =====================================================
       NOMBRE
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="name"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.name ||
                    'Sin nombre';

            }

        );


    /* =====================================================
       ÚLTIMOS 4
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="lastFour"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.lastFour ||
                    '0000';

            }

        );


    /* =====================================================
       TITULAR
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="holder"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.holder ||
                    'Sin responsable';

            }

        );


    /* =====================================================
       REFERENCIA
       ===================================================== */

    document
        .querySelectorAll(
            '[data-investment-bind="expiry"]'
        )
        .forEach(

            function(element) {

                element.textContent =
                    fund.expiry ||
                    '--';

            }

        );

}

/* =========================================================
   INICIALIZAR
   ========================================================= */

renderInvestmentList();



