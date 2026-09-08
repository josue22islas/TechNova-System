/**
 * Adaptador de datos para Tareas.
 * Los endpoints vacíos desactivan la red y conservan el fallback del HTML.
 */
(function () {
    'use strict';

    var page = document.querySelector('.tasks-page, .tasks-board-page');
    if (!page) return;

    function TasksApiError(message, status, payload) {
        this.name = 'TasksApiError';
        this.message = message;
        this.status = status || 0;
        this.payload = payload || null;
    }
    TasksApiError.prototype = Object.create(Error.prototype);
    TasksApiError.prototype.constructor = TasksApiError;

    var statusMessages = {
        401: 'Tu sesión expiró. Inicia sesión nuevamente.',
        403: 'No tienes permisos para realizar esta acción.',
        404: 'La tarea solicitada ya no existe.',
        409: 'La tarea cambió en otra sesión. Actualiza el listado.',
        422: 'Revisa los datos de la tarea.',
        500: 'El servidor no pudo procesar la solicitud.'
    };

    function endpoint(name) {
        return String(page.getAttribute(name) || '').trim();
    }

    function csrfToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        return String(page.dataset.tasksCsrf || (meta ? meta.content : '') || '').trim();
    }

    function parseResponse(response) {
        return response.text().then(function (text) {
            var payload = null;
            if (text) {
                try { payload = JSON.parse(text); }
                catch (error) { throw new TasksApiError('El servidor devolvió JSON inválido.', response.status); }
            }
            if (!response.ok) {
                var message = payload && payload.error && payload.error.message
                    ? String(payload.error.message)
                    : statusMessages[response.status] || 'No se pudo completar la solicitud.';
                throw new TasksApiError(message, response.status, payload);
            }
            return payload;
        });
    }

    function request(url, options) {
        options = options || {};
        var method = String(options.method || 'GET').toUpperCase();
        var headers = Object.assign({ Accept: 'application/json' }, options.headers || {});
        var token = csrfToken();
        if (options.body && typeof options.body !== 'string') {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }
        if (method !== 'GET' && method !== 'HEAD' && token) headers['X-CSRF-Token'] = token;
        return window.fetch(url, Object.assign({ credentials: 'same-origin' }, options, { method: method, headers: headers })).then(parseResponse);
    }

    function text(value, fallback) {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback || '';
    }

    function normalizeTask(item) {
        if (!item || (typeof item.id !== 'string' && typeof item.id !== 'number')) return null;
        var progress = Math.min(100, Math.max(0, Number(item.progress) || 0));
        var dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(item.dueDate || '')) ? String(item.dueDate) : '';
        return {
            id: String(item.id),
            title: text(item.title, 'Tarea sin título'),
            description: text(item.description, 'Sin descripción'),
            project: {
                id: text(item.project && item.project.id, 'unassigned'),
                name: text(item.project && item.project.name, 'Sin proyecto'),
                image: text(item.project && item.project.image, 'assets/img/tasks/table/app-taskflow.png')
            },
            assignee: {
                id: text(item.assignee && item.assignee.id, 'unassigned'),
                name: text(item.assignee && item.assignee.name, 'Sin asignar'),
                avatar: text(item.assignee && item.assignee.avatar, 'assets/img/tasks/table/assignee-default.png')
            },
            creatorId: text(item.creatorId, ''),
            priority: ['high', 'medium', 'low'].indexOf(item.priority) !== -1 ? item.priority : 'medium',
            status: ['pending', 'in-progress', 'review', 'blocked', 'completed', 'overdue'].indexOf(item.status) !== -1 ? item.status : 'pending',
            progress: progress,
            dueDate: dueDate,
            daysRemaining: Number.isFinite(Number(item.daysRemaining)) ? Number(item.daysRemaining) : null,
            permissions: Object.assign({ view: true, edit: false, delete: false, archive: false, reassign: false }, item.permissions || {})
        };
    }

    function normalizePagination(value, itemCount) {
        value = value || {};
        var pageNumber = Math.max(1, Number(value.page || value.current) || 1);
        var limit = Math.max(1, Number(value.limit || value.pageSize) || Math.max(1, itemCount));
        var total = Math.max(0, Number(value.total) || itemCount);
        var totalPages = Math.max(1, Number(value.totalPages) || Math.ceil(total / limit));
        return { page: Math.min(pageNumber, totalPages), limit: limit, total: total, totalPages: totalPages, hasPrevious: pageNumber > 1, hasNext: pageNumber < totalPages };
    }

    function normalizeListResponse(payload) {
        if (!payload || !Array.isArray(payload.items)) throw new TasksApiError('La respuesta no contiene un arreglo items válido.', 0, payload);
        var items = payload.items.map(normalizeTask).filter(Boolean);
        if (items.length !== payload.items.length) throw new TasksApiError('Una o más tareas tienen un contrato inválido.', 0, payload);
        return {
            items: items,
            pagination: normalizePagination(payload.pagination, items.length),
            metrics: payload.metrics && typeof payload.metrics === 'object' ? payload.metrics : null,
            upcoming: Array.isArray(payload.upcoming) ? payload.upcoming : null,
            progress: payload.progress && typeof payload.progress === 'object' ? payload.progress : null,
            calendar: payload.calendar && typeof payload.calendar === 'object' ? payload.calendar : null,
            permissions: payload.permissions && typeof payload.permissions === 'object' ? payload.permissions : {}
        };
    }

    function buildQuery(filters) {
        var params = new URLSearchParams();
        Object.keys(filters || {}).forEach(function (key) {
            var value = filters[key];
            if (value === '' || value === null || value === undefined || value === 'all') return;
            params.set(key, String(value));
        });
        return params.toString();
    }

    function list(filters) {
        var url = endpoint('data-tasks-list-api');
        if (!url) return Promise.resolve(null);
        var query = buildQuery(filters);
        return request(url + (query ? (url.indexOf('?') === -1 ? '?' : '&') + query : '')).then(normalizeListResponse);
    }

    function action(taskId, actionName, value, payload) {
        var template = endpoint('data-tasks-action-api');
        if (!template) return Promise.resolve(null);
        var url = template.replace('{id}', encodeURIComponent(taskId));
        return request(url, { method: actionName === 'delete' ? 'DELETE' : 'PATCH', body: { action: actionName, value: value, data: payload || {} } });
    }

    function save(taskId, payload) {
        var url = taskId ? endpoint('data-tasks-action-api').replace('{id}', encodeURIComponent(taskId)) : endpoint('data-tasks-list-api');
        if (!url) return Promise.resolve(null);
        return request(url, { method: taskId ? 'PATCH' : 'POST', body: payload || {} });
    }

    window.TechNovaTasksApi = {
        Error: TasksApiError,
        list: list,
        action: action,
        save: save,
        normalizeTask: normalizeTask,
        normalizeListResponse: normalizeListResponse,
        buildQuery: buildQuery,
        statusMessages: statusMessages
    };
})();
