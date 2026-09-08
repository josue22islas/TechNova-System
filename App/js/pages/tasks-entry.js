/**
 * Entrada coordinada para las vistas Lista y Tablero de Tareas.
 * Solo anima presentación; la lógica, los datos y los estados pertenecen a
 * tasks.js y tasks-board.js. Los estilos temporales se limpian al terminar.
 */
(function () {
    'use strict';

    var tasksPage = document.querySelector('.tasks-page');
    var boardPage = document.querySelector('.tasks-board-page');
    var page = tasksPage || boardPage;
    if (!page) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsapInstance = window.gsap;
    var navbar = document.getElementById('dashboard-navbar');
    var navbarToggle = navbar && navbar.querySelector('.menu-toggle');
    var navbarLogo = navbar && navbar.querySelector('.logo');
    var navbarItems = navbar ? Array.prototype.slice.call(navbar.querySelectorAll('.div > .div-2')) : [];
    var navbarProfile = navbar ? Array.prototype.slice.call(navbar.querySelectorAll('.column-2 > *')) : [];
    var desktopNavbar = window.innerWidth > 1024;

    function existing(selector, root) {
        return (root || document).querySelector(selector);
    }

    function existingAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function completeEntry() {
        page.dataset.tasksEntry = 'complete';
        document.dispatchEvent(new CustomEvent('technova:tasks-entry-complete', {
            detail: { view: boardPage ? 'board' : 'list' }
        }));
    }

    function createNavbarEntryShine() {
        if (!navbarItems.length || !gsapInstance) return;
        navbarItems.forEach(function (item) {
            var previous = item.querySelector('.technova-entry-shine');
            if (previous) previous.remove();
            var shine = document.createElement('span');
            shine.className = 'technova-entry-shine';
            shine.setAttribute('aria-hidden', 'true');
            item.appendChild(shine);
        });
        var shines = navbarItems.map(function (item) {
            return item.querySelector('.technova-entry-shine');
        }).filter(Boolean);
        gsapInstance.fromTo(shines,
            { xPercent: -220, opacity: 0 },
            {
                xPercent: 520,
                opacity: .95,
                duration: 1.15,
                stagger: .025,
                ease: 'power2.inOut',
                onComplete: function () {
                    shines.forEach(function (shine) { shine.remove(); });
                }
            });
    }

    if (!gsapInstance || reducedMotion) {
        completeEntry();
        return;
    }

    var header = existing(boardPage ? '.tasks-board-header' : '.tasks-header');
    var headerTitle = header && existing(boardPage ? ':scope > div:first-child' : '.tasks-heading', header);
    var headerActions = header ? existingAll(boardPage ? '.tasks-board-header-actions > *' : '.tasks-header-actions > *', header) : [];
    var primaryReveal = boardPage
        ? [existing('.tasks-board-toolbar')].filter(Boolean)
        : [existing('.task-metrics-viewport'), existing('.task-metrics-controls')].filter(Boolean);
    var contentParents = boardPage
        ? existingAll('.kanban-column')
        : [existing('.task-filters'), existing('.tasks-side-panel')].filter(Boolean);
    var contentChildren = boardPage
        ? existingAll('.kanban-column > header, .kanban-column > button')
        : existingAll('.task-scope-carousel, .task-filter-toolbar, .task-table-header, .task-table-row, .task-calendar-surface, .task-progress-panel, .task-upcoming-panel');
    var metricCards = tasksPage ? existingAll('.task-metric-card') : [];
    var allTargets = [navbar, navbarToggle, navbarLogo].concat(navbarItems, navbarProfile, [header, headerTitle], headerActions, primaryReveal, contentParents, contentChildren, metricCards).filter(Boolean);

    gsapInstance.killTweensOf(allTargets);
    page.dataset.tasksEntry = 'running';

    var timeline = gsapInstance.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: function () {
            if (metricCards.length) gsapInstance.set(metricCards, { clearProps: 'opacity,visibility,transform,filter' });
            completeEntry();
        }
    });

    if (desktopNavbar && navbar) {
        timeline.fromTo(navbar,
            { autoAlpha: 0, y: -18, scale: .985 },
            { autoAlpha: 1, y: 0, scale: 1, duration: .65, clearProps: 'opacity,visibility,transform' }, 0);
        if (navbarLogo) timeline.fromTo(navbarLogo,
            { autoAlpha: 0, y: -8, scale: .94 },
            { autoAlpha: 1, y: 0, scale: 1, duration: .48, clearProps: 'opacity,visibility,transform' }, .16);
        if (navbarItems.length) timeline.fromTo(navbarItems,
            { autoAlpha: 0, x: -16 },
            { autoAlpha: 1, x: 0, duration: .42, stagger: .055, clearProps: 'opacity,visibility,transform' }, .25);
        if (navbarProfile.length) timeline.fromTo(navbarProfile,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: .45, stagger: .08, clearProps: 'opacity,visibility,transform' }, .60);
        timeline.call(createNavbarEntryShine, null, .84);
    } else if (navbarToggle) {
        timeline.fromTo(navbarToggle,
            { autoAlpha: 0, y: -12, scale: .9 },
            { autoAlpha: 1, y: 0, scale: 1, duration: .5, clearProps: 'opacity,visibility,transform' }, .06);
    }

    if (header) timeline.fromTo(header,
        { autoAlpha: 0, y: 16, scale: .992, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .58, clearProps: 'opacity,visibility,transform,filter' }, .44);
    if (headerTitle) timeline.fromTo(headerTitle,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: .42, clearProps: 'opacity,visibility,transform' }, .60);
    if (headerActions.length) timeline.fromTo(headerActions,
        { autoAlpha: 0, y: 10, scale: .97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: .4, stagger: .07, clearProps: 'opacity,visibility,transform' }, .71);
    if (primaryReveal.length) timeline.fromTo(primaryReveal,
        { autoAlpha: 0, y: 14, filter: 'blur(5px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .45, stagger: .08, clearProps: 'opacity,visibility,transform,filter' }, .78);
    if (metricCards.length) timeline.fromTo(metricCards,
        { autoAlpha: 0, y: 16, scale: .94, filter: 'blur(5px)' },
        { opacity: function (index, card) { return Number.parseFloat(getComputedStyle(card).opacity) || 1; }, visibility: 'visible', y: 0, scale: 1, filter: 'blur(0px)', duration: .46, stagger: .055, clearProps: 'visibility,transform,filter' }, .88);
    if (contentParents.length) timeline.fromTo(contentParents,
        { autoAlpha: 0, y: 20, scale: .988, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .5, stagger: .08, clearProps: 'opacity,visibility,transform,filter' }, .92);
    if (contentChildren.length) timeline.fromTo(contentChildren,
        { autoAlpha: 0, y: 9, filter: 'blur(4px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .34, stagger: .035, clearProps: 'opacity,visibility,transform,filter' }, 1.08);
}());
