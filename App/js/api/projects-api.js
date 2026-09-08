/**
 * CLIENTE HTTP DE PROYECTOS
 * ------------------------
 * Capa exclusiva de comunicación: no genera HTML ni conoce la selección visual.
 * buildProjectFilterQuery() acepta solo filtros incluidos en allowedFilters y
 * limita texto/paginación antes de construir URLSearchParams.
 *
 * listProjects(): GET del listado filtrado; exige { projects: [] }.
 * getProjectAnalytics(): GET de analítica; exige value, summary y clients.
 * Ambos usan credentials: same-origin, Accept JSON y AbortSignal opcional.
 * Si endpoint está vacío retornan null para conservar el fallback local.
 */
(function () {
    'use strict';

    var namespace = window.TechNovaProjectsApi = window.TechNovaProjectsApi || {};
    var allowedFilters = {
        status: ['pinned', 'in-progress', 'completed', 'paused', 'cancelled'],
        priority: ['high', 'medium', 'low'],
        due: ['overdue', 'soon', 'upcoming'],
        progress: ['0-25', '26-50', '51-75', '76-100'],
        budget: ['defined', 'undefined', 'within', 'over'],
        sort: ['due-asc', 'priority', 'progress-desc', 'name-asc']
    };

    function normalizeValue(value) {
        return String(value === undefined || value === null ? '' : value).trim();
    }

    function buildProjectFilterQuery(filters) {
        var source = filters && typeof filters === 'object' ? filters : {};
        var params = new URLSearchParams();
        Object.keys(allowedFilters).forEach(function (key) {
            var value = normalizeValue(source[key]);
            if (allowedFilters[key].indexOf(value) !== -1) params.set(key, value);
        });
        var tag = normalizeValue(source.tag);
        var person = normalizeValue(source.person);
        var search = normalizeValue(source.search || source.q);
        if (tag && tag !== 'all') params.set('tag', tag);
        if (search) params.set('q', search.slice(0, 120));
        if (person) params.set('person', person.slice(0, 120));
        if (Number.isFinite(Number(source.page)) && Number(source.page) > 0) params.set('page', String(Math.floor(Number(source.page))));
        if (Number.isFinite(Number(source.limit)) && Number(source.limit) > 0) params.set('limit', String(Math.min(100, Math.floor(Number(source.limit)))));
        return params;
    }

    async function listProjects(endpoint, filters, options) {
        var requestUrl = normalizeValue(endpoint);
        if (!requestUrl) return null;
        var url = new URL(requestUrl, window.location.href);
        var params = buildProjectFilterQuery(filters);
        params.forEach(function (value, key) { url.searchParams.set(key, value); });
        var response = await fetch(url.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
            signal: options && options.signal
        });
        if (!response.ok) throw new Error('No fue posible filtrar los proyectos. HTTP ' + response.status);
        var data = await response.json();
        if (!data || typeof data !== 'object' || !Array.isArray(data.projects)) {
            throw new TypeError('La respuesta de proyectos debe contener un arreglo projects.');
        }
        return data;
    }

    async function getProjectAnalytics(endpoint, options) {
        var requestUrl = normalizeValue(endpoint);
        if (!requestUrl) return null;
        var response = await fetch(new URL(requestUrl, window.location.href).toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
            signal: options && options.signal
        });
        if (!response.ok) throw new Error('No fue posible cargar la analítica de proyectos. HTTP ' + response.status);
        var data = await response.json();
        if (!data || typeof data !== 'object' || !data.value || !Array.isArray(data.summary) || !data.clients) {
            throw new TypeError('La analítica debe contener value, summary y clients.');
        }
        return data;
    }

    namespace.buildProjectFilterQuery = buildProjectFilterQuery;
    namespace.listProjects = listProjects;
    namespace.getProjectAnalytics = getProjectAnalytics;
})();
