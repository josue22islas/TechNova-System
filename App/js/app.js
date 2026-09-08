/**
 * PUNTO DE ENTRADA COMÚN
 * ----------------------
 * Confirma que los módulos base terminaron de cargarse y aloja coordinaciones
 * pequeñas que no pertenecen a un dominio específico. Debe permanecer al final
 * del orden de scripts. No colocar aquí lógica de gráficas, Proyectos o backend.
 */
window.TechNovaDashboard = window.TechNovaDashboard || {};
window.TechNovaDashboard.modulesLoaded = true;

document.addEventListener('click', function (event) {
    var placeholderLink = event.target.closest('a[href="#"]');

    if (!placeholderLink || placeholderLink.closest('.navbar')) return;

    event.preventDefault();
});
