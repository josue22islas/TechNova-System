(function () {
    'use strict';

    var NAV_ITEMS = [
        { key: 'dashboard', label: 'Dashboard', href: 'index.html', icon: 'image@2x.png' },
        { key: 'projects', label: 'Proyectos', href: 'proyectos.html', icon: 'image-1@2x.png' },
        { key: 'tasks', label: 'Tareas', href: 'tareas.html', icon: 'image-2@2x.png' },
        { key: 'time', label: 'Tiempo', href: '#', icon: 'image-3@2x.png' },
        { key: 'clients', label: 'Clientes', href: '#', icon: 'image-4@2x.png' },
        { key: 'team', label: 'Equipo', href: '#', icon: 'image-5@2x.png' },
        { key: 'assistant', label: 'Asistente IA', href: '#', icon: 'image-6@2x.png' },
        { key: 'finances', label: 'Finanzas', href: '#', icon: 'image-7@2x.png', imageClass: 'img' },
        { key: 'billing', label: 'Facturación', href: '#', icon: 'image-8@2x.png' },
        { key: 'reports', label: 'reportes', href: '#', icon: 'image-9@2x.png' },
        { key: 'settings', label: 'Configuración', href: '#', icon: 'image-10@2x.png' }
    ];

    function normalizeBasePath(value) {
        var path = String(value || '').trim();

        if (!path || path === './') {
            return '';
        }

        return path.replace(/\/+$/, '') + '/';
    }

    function resolvePath(basePath, path) {
        return path === '#' ? path : basePath + path;
    }

    function normalizeActive(value) {
        var aliases = {
            dashboard: 'dashboard',
            proyectos: 'projects',
            projects: 'projects',
            tareas: 'tasks',
            tasks: 'tasks'
        };

        return aliases[String(value || '').toLowerCase()] || '';
    }

    function createNavigationItem(item, active, basePath) {
        var link = document.createElement('a');
        var icon = document.createElement('img');
        var label = document.createElement('div');

        link.className = 'div-2';
        link.href = resolvePath(basePath, item.href);

        if (item.key === active) {
            link.setAttribute('aria-current', 'page');
        }

        icon.className = item.imageClass || 'image';
        icon.src = resolvePath(basePath, 'assets/img/' + item.icon);
        icon.alt = '';

        label.className = 'text-wrapper';
        label.textContent = item.label;

        link.appendChild(icon);
        link.appendChild(label);
        return link;
    }

    class TechNovaNavbar extends HTMLElement {
        connectedCallback() {
            var active = normalizeActive(this.getAttribute('active'));
            var basePath = normalizeBasePath(this.getAttribute('base-path'));
            var userName = this.getAttribute('user-name') || 'Josue Islas';
            var userRole = this.getAttribute('user-role') || 'CEO-General';
            var userAvatar = this.getAttribute('user-avatar') || 'assets/img/vertical-container@2x.png';
            var navbar = document.createElement('div');

            navbar.className = 'navbar';
            navbar.id = 'dashboard-navbar';
            navbar.setAttribute('data-navbar-component', 'ready');
            navbar.innerHTML = [
                '<button aria-controls="dashboard-navbar" aria-expanded="false" aria-label="Abrir menú de navegación" class="menu-toggle" type="button">',
                '    <span></span><span></span><span></span>',
                '</button>',
                '<span class="nav-indicator" aria-hidden="true"></span>',
                '<div class="column">',
                '    <a class="logo" aria-label="Ir al Dashboard"></a>',
                '    <div class="div"></div>',
                '</div>',
                '<div class="column-2">',
                '    <a class="row" href="#">',
                '        <img class="vertical-container" alt="" />',
                '        <div class="column-3">',
                '            <div class="text-wrapper-2"></div>',
                '            <div class="text-wrapper-3"></div>',
                '        </div>',
                '    </a>',
                '    <a class="row-2" href="#">',
                '        <img class="image" alt="" />',
                '        <div class="text-wrapper-4">Cerrar sesión</div>',
                '    </a>',
                '</div>'
            ].join('');

            navbar.querySelector('.logo').href = resolvePath(basePath, 'index.html');

            NAV_ITEMS.forEach(function (item) {
                navbar.querySelector('.column > .div').appendChild(createNavigationItem(item, active, basePath));
            });

            navbar.querySelector('.row').setAttribute('aria-label', 'Abrir perfil de ' + userName);
            navbar.querySelector('.vertical-container').src = resolvePath(basePath, userAvatar);
            navbar.querySelector('.text-wrapper-2').textContent = userName;
            navbar.querySelector('.text-wrapper-3').textContent = userRole;
            navbar.querySelector('.row-2 .image').src = resolvePath(basePath, 'assets/img/image-11@2x.png');

            this.replaceWith(navbar);
            navbar.dispatchEvent(new CustomEvent('technova:navbar-ready', {
                bubbles: true,
                detail: { navbar: navbar, active: active }
            }));
        }
    }

    if (!customElements.get('technova-navbar')) {
        customElements.define('technova-navbar', TechNovaNavbar);
    }
}());
