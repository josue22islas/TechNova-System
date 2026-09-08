/**
 * NAVBAR COMPARTIDO
 * -----------------
 * Responsabilidad: controlar únicamente la apertura y cierre responsive.
 * Entrada: clic en .menu-toggle, selección de enlaces, Escape y resize.
 * Estado visual: clases del navbar y atributo aria-expanded del botón.
 * Importante: technova-navbar.js asigna aria-current desde el atributo active;
 * este archivo no decide qué módulo está activo ni crea un segundo navbar.
 */
(function () {
    var navbar = document.getElementById('dashboard-navbar');
    var toggleButton = document.querySelector('.menu-toggle');

    if (!navbar || !toggleButton) return;

    function syncNavbarState() {
        if (window.innerWidth > 1024) {
            navbar.classList.remove('menu-open');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    }

    toggleButton.addEventListener('click', function () {
        var isOpen = navbar.classList.toggle('menu-open');
        toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navbar.addEventListener('click', function (event) {
        var placeholderLink = event.target.closest('a[href="#"]');

        if (!placeholderLink || !navbar.contains(placeholderLink)) return;

        event.preventDefault();

        if (window.innerWidth <= 1024 && placeholderLink.classList.contains('div-2')) {
            navbar.classList.remove('menu-open');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            navbar.classList.remove('menu-open');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });

    window.addEventListener('resize', syncNavbarState);
    syncNavbarState();
})();
