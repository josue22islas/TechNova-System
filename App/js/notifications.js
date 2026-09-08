/**
 * CENTRO DE NOTIFICACIONES
 * -----------------------
 * Mantiene el panel, contador de no leídas, agrupación por fecha y acciones.
 * Las operaciones actualizan primero la interfaz y utilizan fetch únicamente
 * cuando el HTML proporciona un endpoint; sin backend los datos demo funcionan.
 *
 * Accesibilidad: aria-expanded, foco restaurado, Escape y estado vacío.
 * Mantenimiento: no mezclar aquí notificaciones del navegador o correo externo.
 */

/* =========================================================
   INICIALIZAR
   ========================================================= */

updateRecurringExpensesUI();




/* =========================================================
   PANEL DE NOTIFICACIONES
   AGRUPACIÓN + LEÍDAS + ELIMINACIÓN
   LISTO PARA BACKEND
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const notificationWrapper =
    document.querySelector(
        '.notification-wrapper'
    );


const notificationButton =
    document.getElementById(
        'notificationButton'
    );


const notificationPanel =
    document.getElementById(
        'notificationPanel'
    );


const notificationBadge =
    document.getElementById(
        'notificationBadge'
    );


const notificationCount =
    document.getElementById(
        'notificationCount'
    );


const notificationList =
    document.getElementById(
        'notificationList'
    );


const notificationMarkAll =
    document.getElementById(
        'notificationMarkAll'
    );


const notificationDeleteAll =
    document.getElementById(
        'notificationDeleteAll'
    );


/* =========================================================
   CONTADOR
   ========================================================= */

function updateNotificationCount() {

    const unreadNotifications =
        notificationList
            ?.querySelectorAll(
                '.notification-item.unread'
            )
        ?? [];


    const allNotifications =
        notificationList
            ?.querySelectorAll(
                '.notification-item'
            )
        ?? [];


    const unread =
        unreadNotifications.length;


    const total =
        allNotifications.length;


    /* =============================================
       BADGE ROJO
       ============================================= */

    if (
        notificationCount
    ) {

        notificationCount.textContent =
            unread;

    }


    /* =============================================
       TOTAL DEL PANEL
       ============================================= */

    const notificationTotal =
        document.getElementById(
            'notificationTotal'
        );


    if (
        notificationTotal
    ) {

        notificationTotal.textContent =
            `(${total})`;

    }


    /* =============================================
       BADGE
       ============================================= */

    if (
        notificationBadge
    ) {

        if (
            unread > 0
        ) {

            notificationBadge.style.display =
                'inline-flex';


            notificationBadge
                .classList
                .add(
                    'has-notification'
                );

        }


        else {

            notificationBadge.style.display =
                'none';


            notificationBadge
                .classList
                .remove(
                    'has-notification'
                );

        }

    }


    /* =============================================
       BOTONES HEADER
       ============================================= */

    if (
        notificationMarkAll
    ) {

        notificationMarkAll.disabled =
            unread === 0;


        notificationMarkAll.style.opacity =
            unread === 0
                ? '.4'
                : '1';

    }


    if (
        notificationDeleteAll
    ) {

        notificationDeleteAll.disabled =
            total === 0;


        notificationDeleteAll.style.opacity =
            total === 0
                ? '.4'
                : '1';

    }

}


/* =========================================================
   UTILIDADES DE FECHA
   ========================================================= */

function startOfNotificationDay(
    date
) {

    return new Date(

        date.getFullYear(),

        date.getMonth(),

        date.getDate()

    );

}


/* =========================================================
   OBTENER GRUPO SEGÚN FECHA
   ========================================================= */

function getNotificationDateGroup(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    /*
       Si backend devuelve fecha inválida,
       la mandamos a anteriores.
    */

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 'older';

    }


    const now =
        new Date();


    const today =
        startOfNotificationDay(
            now
        );


    const notificationDay =
        startOfNotificationDay(
            date
        );


    const difference =
        Math.floor(

            (
                today -
                notificationDay
            )

            /

            86400000

        );


    /* HOY */

    if (
        difference === 0
    ) {

        return 'today';

    }


    /* AYER */

    if (
        difference === 1
    ) {

        return 'yesterday';

    }


    /* ESTA SEMANA */

    if (
        difference >= 2
        &&
        difference <= 7
    ) {

        return 'week';

    }


    /* ANTERIORES */

    return 'older';

}


/* =========================================================
   NOMBRE DE GRUPO
   ========================================================= */

function getNotificationGroupLabel(
    group
) {

    const labels = {

        today:
            'Hoy',

        yesterday:
            'Ayer',

        week:
            'Esta semana',

        older:
            'Anteriores'

    };


    return (
        labels[group]
        ||
        'Anteriores'
    );

}


/* =========================================================
   CREAR HEADER DE GRUPO
   ========================================================= */

function createNotificationGroupHeader(
    label
) {

    const header =
        document.createElement(
            'div'
        );


    header.className =
        'notification-group-header';


    const title =
        document.createElement(
            'div'
        );


    title.className =
        'notification-group-title';


    title.textContent =
        label;


    const line =
        document.createElement(
            'div'
        );


    line.className =
        'notification-group-line';


    header.appendChild(
        title
    );


    header.appendChild(
        line
    );


    return header;

}


/* =========================================================
   AGRUPAR NOTIFICACIONES
   ========================================================= */

function renderNotificationGroups() {

    if (
        !notificationList
    ) {

        return;

    }


    /*
       Conseguimos todas las notificaciones,
       incluso si ya estaban dentro de grupos.
    */

    const items =
        Array.from(

            notificationList
                .querySelectorAll(
                    '.notification-item'
                )

        );


    /*
       Si ya no existen registros.
    */

    if (
        items.length === 0
    ) {

        renderEmptyNotifications();

        updateNotificationCount();

        return;

    }


    /*
       Ordenamos del más nuevo al más antiguo.
    */

    items.sort(

        function(a, b) {

            const dateA =
                new Date(
                    a.dataset.createdAt
                );


            const dateB =
                new Date(
                    b.dataset.createdAt
                );


            return (
                dateB -
                dateA
            );

        }

    );


    /*
       Limpiamos el contenedor.
    */

    notificationList.innerHTML =
        '';


    const groups = {

        today: [],

        yesterday: [],

        week: [],

        older: []

    };


    /* =============================================
       CLASIFICAR
       ============================================= */

    items.forEach(

        function(item) {

            const group =
                getNotificationDateGroup(
                    item.dataset.createdAt
                );


            groups[group]
                .push(
                    item
                );

        }

    );


    /* =============================================
       ORDEN VISUAL
       ============================================= */

    const groupOrder = [

        'today',

        'yesterday',

        'week',

        'older'

    ];


    groupOrder.forEach(

        function(groupName) {

            const groupItems =
                groups[groupName];


            if (
                !groupItems.length
            ) {

                return;

            }


            const groupContainer =
                document.createElement(
                    'section'
                );


            groupContainer.className =
                'notification-group';


            groupContainer.dataset.group =
                groupName;


            groupContainer.appendChild(

                createNotificationGroupHeader(

                    getNotificationGroupLabel(
                        groupName
                    )

                )

            );


            groupItems.forEach(

                function(item) {

                    groupContainer
                        .appendChild(
                            item
                        );

                }

            );


            notificationList
                .appendChild(
                    groupContainer
                );

        }

    );


    updateNotificationCount();

}


/* =========================================================
   ESTADO VACÍO
   ========================================================= */

function renderEmptyNotifications() {

    if (
        !notificationList
    ) {

        return;

    }


    notificationList.innerHTML = `

        <div class="notification-empty">

            <div class="notification-empty-icon">
                ✓
            </div>

            <div class="notification-empty-title">
                Sin notificaciones
            </div>

            <div class="notification-empty-text">
                No tienes notificaciones pendientes.
            </div>

        </div>

    `;

}


/* =========================================================
   ABRIR PANEL
   ========================================================= */

function openNotificationPanel() {

    if (
        !notificationWrapper
    ) {

        return;

    }


    notificationWrapper
        .classList
        .add(
            'is-open'
        );


    notificationButton
        ?.setAttribute(
            'aria-expanded',
            'true'
        );


    /*
       Cerrar dropdown financiero.
    */

    if (
        typeof closeFinancialPeriod
        === 'function'
    ) {

        closeFinancialPeriod();

    }


    /*
       Cerrar selector mensual.
    */

    if (
        typeof closeReportPeriod
        === 'function'
    ) {

        closeReportPeriod();

    }

}


/* =========================================================
   CERRAR PANEL
   ========================================================= */

function closeNotificationPanel() {

    if (
        !notificationWrapper
    ) {

        return;

    }


    notificationWrapper
        .classList
        .remove(
            'is-open'
        );


    notificationButton
        ?.setAttribute(
            'aria-expanded',
            'false'
        );

}


/* =========================================================
   TOGGLE
   ========================================================= */

function toggleNotificationPanel() {

    if (
        !notificationWrapper
    ) {

        return;

    }


    const isOpen =
        notificationWrapper
            .classList
            .contains(
                'is-open'
            );


    if (
        isOpen
    ) {

        closeNotificationPanel();

    }


    else {

        openNotificationPanel();

    }

}


/* =========================================================
   CLICK CAMPANA
   ========================================================= */

notificationButton
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            toggleNotificationPanel();

        }

    );


/* =========================================================
   TECLADO CAMPANA
   ========================================================= */

notificationButton
    ?.addEventListener(

        'keydown',

        function(event) {

            if (
                event.key === 'Enter'
                ||
                event.key === ' '
            ) {

                event.preventDefault();

                event.stopPropagation();


                toggleNotificationPanel();

            }

        }

    );


/* =========================================================
   CLICK DENTRO DE LISTA
   EVENT DELEGATION

   Importante para backend:
   aunque PHP agregue nuevas notificaciones,
   seguirá funcionando.
   ========================================================= */

notificationList
    ?.addEventListener(

        'click',

        function(event) {


            /* =========================================
               ELIMINAR
               ========================================= */

            const deleteButton =
                event.target.closest(
                    '.notification-delete'
                );


            if (
                deleteButton
            ) {

                event.stopPropagation();


                const item =
                    deleteButton.closest(
                        '.notification-item'
                    );


                if (
                    item
                ) {

                    deleteSingleNotification(
                        item
                    );

                }


                return;

            }


            /* =========================================
               MARCAR COMO LEÍDA
               ========================================= */

            const item =
                event.target.closest(
                    '.notification-item'
                );


            if (
                !item
            ) {

                return;

            }


            if (
                !item.classList.contains(
                    'unread'
                )
            ) {

                return;

            }


            markNotificationAsRead(
                item
            );

        }

    );


/* =========================================================
   MARCAR NOTIFICACIÓN COMO LEÍDA
   ========================================================= */

function markNotificationAsRead(
    item
) {

    const notificationId =
        item.dataset.notificationId;


    item.classList.remove(
        'unread'
    );


    item
        .querySelector(
            '.notification-status'
        )
        ?.remove();


    updateNotificationCount();


    console.log(

        'Notificación leída:',

        notificationId

    );


    /*
    =====================================================
    FUTURO BACKEND
    =====================================================

    fetch(
        'api/notifications/read.php',
        {

            method: 'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify({

                    id:
                        notificationId

                })

        }
    );

    */

}


/* =========================================================
   MARCAR TODAS COMO LEÍDAS
   ========================================================= */

notificationMarkAll
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            const unreadItems =
                notificationList
                    ?.querySelectorAll(
                        '.notification-item.unread'
                    )
                ?? [];


            unreadItems.forEach(

                function(item) {

                    item.classList.remove(
                        'unread'
                    );


                    item
                        .querySelector(
                            '.notification-status'
                        )
                        ?.remove();

                }

            );


            updateNotificationCount();


            /*
            =================================================
            FUTURO BACKEND
            =================================================

            fetch(
                'api/notifications/read-all.php',
                {
                    method:
                        'POST'
                }
            );

            */

        }

    );


/* =========================================================
   ELIMINAR UNA NOTIFICACIÓN
   ========================================================= */

function deleteSingleNotification(
    item
) {

    if (
        !item
    ) {

        return;

    }


    const notificationId =
        item.dataset.notificationId;


    /*
       Animación.
    */

    item.classList.add(
        'is-removing'
    );


    /*
       Esperamos que termine la transición.
    */

    setTimeout(

        function() {

            item.remove();


            /*
               Reconstruir grupos,
               porque podría desaparecer
               por ejemplo el grupo "Ayer".
            */

            renderNotificationGroups();


            updateNotificationCount();

        },

        300

    );


    console.log(

        'Eliminar notificación:',

        notificationId

    );


    /*
    =====================================================
    FUTURO BACKEND
    =====================================================

    fetch(
        'api/notifications/delete.php',
        {

            method:
                'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify({

                    id:
                        notificationId

                })

        }
    )

    .then(
        response =>
            response.json()
    )

    .then(
        result => {

            if (
                !result.success
            ) {

                console.error(
                    'No fue posible eliminar la notificación.'
                );

            }

        }
    );

    */

}


/* =========================================================
   ELIMINAR TODAS
   ========================================================= */

notificationDeleteAll
    ?.addEventListener(

        'click',

        function(event) {

            event.stopPropagation();


            const items =
                notificationList
                    ?.querySelectorAll(
                        '.notification-item'
                    )
                ?? [];


            if (
                items.length === 0
            ) {

                return;

            }


            /*
               Pequeña animación escalonada.
            */

            items.forEach(

                function(item, index) {

                    setTimeout(

                        function() {

                            item.classList.add(
                                'is-removing'
                            );

                        },

                        index * 35

                    );

                }

            );


            /*
               Después eliminamos todos.
            */

            const totalDelay =

                320
                +
                (
                    items.length *
                    35
                );


            setTimeout(

                function() {

                    items.forEach(

                        function(item) {

                            item.remove();

                        }

                    );


                    renderEmptyNotifications();


                    updateNotificationCount();

                },

                totalDelay

            );


            /*
            =================================================
            FUTURO BACKEND
            =================================================

            fetch(
                'api/notifications/delete-all.php',
                {

                    method:
                        'POST'

                }
            );

            */

        }

    );


/* =========================================================
   CLICK FUERA
   ========================================================= */

document.addEventListener(

    'click',

    function(event) {

        if (
            notificationWrapper
            &&
            !notificationWrapper.contains(
                event.target
            )
        ) {

            closeNotificationPanel();

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
            event.key ===
            'Escape'
        ) {

            closeNotificationPanel();

        }

    }

);





