/**
 * Vista Tareas — etapa 7.
 * Mantiene las métricas del HTML como fallback y solo consulta el endpoint
 * cuando data-tasks-summary-api contiene una URL explícita. Los controles de
 * filtrado emiten estado estable para el listado que se integrará después.
 */
(function () {
    'use strict';

    var tasksPage = document.querySelector('.tasks-page');
    var metricsSection = document.querySelector('[data-task-metrics]');
    var metricCards = metricsSection
        ? Array.prototype.slice.call(metricsSection.querySelectorAll('[data-task-metric]'))
        : [];
    var metricsViewport = metricsSection && metricsSection.querySelector('[data-task-metrics-viewport]');
    var metricsTrack = metricsSection && metricsSection.querySelector('.task-metrics-track');
    var metricsControls = metricsSection
        ? Array.prototype.slice.call(metricsSection.querySelectorAll('[data-task-metrics-direction]'))
        : [];
    var metricsPagination = metricsSection && metricsSection.querySelector('[data-task-metrics-pagination]');
    var metricsStatus = metricsSection && metricsSection.querySelector('[data-task-metrics-status]');
    var metricsDots = [];
    var filtersSection = document.querySelector('[data-task-filters]');
    var scopeButtons = filtersSection
        ? Array.prototype.slice.call(filtersSection.querySelectorAll('[data-task-scope]'))
        : [];
    var listSearchInput = filtersSection && filtersSection.querySelector('[data-task-list-search]');
    var projectSelect = filtersSection && filtersSection.querySelector('[data-task-filter-project]');
    var statusSelect = filtersSection && filtersSection.querySelector('[data-task-filter-status]');
    var prioritySelect = filtersSection && filtersSection.querySelector('[data-task-filter-priority]');
    var moreFiltersButton = filtersSection && filtersSection.querySelector('[data-task-more-filters]');
    var scopeIndicator = filtersSection && filtersSection.querySelector('[data-task-scope-indicator]');
    var scopeCarousel = filtersSection && filtersSection.querySelector('[data-task-scope-carousel]');
    var scopeTabs = filtersSection && filtersSection.querySelector('[data-task-scope-tabs]');
    var scopeArrows = filtersSection ? Array.prototype.slice.call(filtersSection.querySelectorAll('[data-task-scope-direction]')) : [];
    var resultsSummary = filtersSection && filtersSection.querySelector('[data-task-results-summary]');
    var activeFiltersContainer = filtersSection && filtersSection.querySelector('[data-task-active-filters]');
    var clearFiltersButton = filtersSection && filtersSection.querySelector('[data-task-clear-filters]');
    var sortSelect = filtersSection && filtersSection.querySelector('[data-task-sort]');
    var viewButtons = filtersSection ? Array.prototype.slice.call(filtersSection.querySelectorAll('[data-task-view]')) : [];
    var headerSearchInput = document.querySelector('[data-task-search]');
    var headerFiltersButton = document.querySelector('[data-tasks-filter-open]');
    var advancedFilterPanel = document.querySelector('[data-tasks-advanced-filter-panel]');
    var advancedFilterForm = document.querySelector('[data-tasks-advanced-filter-form]');
    var advancedFilterCloseButtons = document.querySelectorAll('[data-tasks-advanced-filter-close]');
    var advancedFilterBadge = document.querySelector('[data-tasks-filter-count]');
    var advancedFilterLastFocus = null;
    var taskTable = document.querySelector('[data-task-table]');
    var taskTableHeader = taskTable && taskTable.querySelector('.task-table-header');
    var taskTableBody = taskTable && taskTable.querySelector('[data-task-table-body]');
    var taskRows = taskTable
        ? Array.prototype.slice.call(taskTable.querySelectorAll('[data-task-row]'))
        : [];
    var selectAllTasks = taskTable && taskTable.querySelector('[data-task-select-all]');
    var taskEmptyState = taskTable && taskTable.querySelector('[data-task-empty]');
    var taskListLoading = taskTable && taskTable.querySelector('[data-task-list-loading]');
    var taskListError = taskTable && taskTable.querySelector('[data-task-list-error]');
    var taskListErrorMessage = taskListError && taskListError.querySelector('[data-task-list-error-message]');
    var taskListRetry = taskListError && taskListError.querySelector('[data-task-list-retry]');
    var tasksApi = window.TechNovaTasksApi || null;
    var listEndpoint = String(tasksPage && tasksPage.getAttribute('data-tasks-list-api') || '').trim();
    var taskEditor = document.querySelector('[data-task-editor]');
    var taskEditorForm = taskEditor && taskEditor.querySelector('[data-task-editor-form]');
    var taskEditorTitle = taskEditor && taskEditor.querySelector('[data-task-editor-title]');
    var taskEditorMessage = taskEditor && taskEditor.querySelector('[data-task-editor-message]');
    var taskEditorSubmit = taskEditor && taskEditor.querySelector('[data-task-editor-submit]');
    var taskEditorBackdrop = document.querySelector('.task-editor-backdrop');
    var taskEditorCloseButtons = document.querySelectorAll('[data-task-editor-close]');
    var taskDetail = document.querySelector('[data-task-detail]');
    var taskDetailBackdrop = document.querySelector('.task-detail-backdrop');
    var taskDetailCloseButtons = document.querySelectorAll('[data-task-detail-close]');
    var taskDetailTitle = taskDetail && taskDetail.querySelector('[data-task-detail-title]');
    var taskDetailProject = taskDetail && taskDetail.querySelector('[data-task-detail-project]');
    var taskDetailAssignee = taskDetail && taskDetail.querySelector('[data-task-detail-assignee]');
    var taskDetailPriority = taskDetail && taskDetail.querySelector('[data-task-detail-priority]');
    var taskDetailStatus = taskDetail && taskDetail.querySelector('[data-task-detail-status]');
    var taskDetailDue = taskDetail && taskDetail.querySelector('[data-task-detail-due]');
    var taskDetailDescription = taskDetail && taskDetail.querySelector('[data-task-detail-description]');
    var taskDetailProgress = taskDetail && taskDetail.querySelector('[data-task-detail-progress]');
    var taskDetailProgressValue = taskDetail && taskDetail.querySelector('[data-task-detail-progress-value]');
    var taskDetailSubtasks = taskDetail && taskDetail.querySelector('[data-task-detail-subtasks]');
    var taskDetailSubtaskCount = taskDetail && taskDetail.querySelector('[data-task-detail-subtask-count]');
    var taskDetailComments = taskDetail && taskDetail.querySelector('[data-task-detail-comments]');
    var taskDetailCommentCount = taskDetail && taskDetail.querySelector('[data-task-detail-comment-count]');
    var taskDetailCommentForm = taskDetail && taskDetail.querySelector('[data-task-detail-comment-form]');
    var taskDetailEdit = taskDetail && taskDetail.querySelector('[data-task-detail-edit]');
    var taskDetailComplete = taskDetail && taskDetail.querySelector('[data-task-detail-complete]');
    var taskDetailAddSubtask = taskDetail && taskDetail.querySelector('[data-task-detail-add-subtask]');
    var taskDetailDependency = taskDetail && taskDetail.querySelector('[data-task-detail-dependency]');
    var activeDetailRow = null;
    var taskDetailLastFocus = null;
    var taskDetailCommentsStore = {};
    var activeEditorRow = null;
    var taskListRequestId = 0;
    var taskContextMenu = document.querySelector('[data-task-context-menu]');
    var taskContextBackdrop = document.querySelector('.task-row-menu-backdrop');
    var taskContextCloseButtons = document.querySelectorAll('[data-task-row-menu-close]');
    var taskContextTitle = taskContextMenu && taskContextMenu.querySelector('[data-task-context-title]');
    var taskContextProject = taskContextMenu && taskContextMenu.querySelector('[data-task-context-project]');
    var taskMenuFeedback = taskContextMenu && taskContextMenu.querySelector('[data-task-menu-feedback]');
    var activeTaskMenuRow = null;
    var activeTaskMenuTrigger = null;
    var taskPagination = document.querySelector('[data-task-pagination]');
    var paginationSummary = taskPagination && taskPagination.querySelector('[data-task-pagination-summary]');
    var paginationPages = taskPagination && taskPagination.querySelector('[data-task-pagination-pages]');
    var paginationMobileStatus = taskPagination && taskPagination.querySelector('[data-task-pagination-mobile-status]');
    var pageSizeSelect = taskPagination && taskPagination.querySelector('[data-task-page-size]');
    var taskCalendar = document.querySelector('[data-task-calendar]');
    var calendarLabel = taskCalendar && taskCalendar.querySelector('[data-calendar-label]');
    var calendarGrid = taskCalendar && taskCalendar.querySelector('[data-calendar-grid]');
    var calendarTodayButton = taskCalendar && taskCalendar.querySelector('[data-calendar-today]');
    var calendarButtons = taskCalendar
        ? Array.prototype.slice.call(taskCalendar.querySelectorAll('[data-calendar-direction]'))
        : [];
    var taskProgressPanel = document.querySelector('[data-task-progress-panel]');
    var generalProgressBar = taskProgressPanel && taskProgressPanel.querySelector('[role="progressbar"]');
    var generalProgressFill = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-fill]');
    var generalProgressValue = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-value]');
    var generalProgressCompleted = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-completed]');
    var generalProgressTotal = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-total]');
    var generalProgressLabel = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-label]');
    var generalProgressCaption = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-caption]');
    var selectedProgressCaption = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-selection]');
    var progressRing = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-ring]');
    var progressRingValue = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-ring-value]');
    var progressHealth = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-health]');
    var progressExpected = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-expected]');
    var progressUpdateButton = taskProgressPanel && taskProgressPanel.querySelector('[data-task-progress-update]');
    var taskUpcomingPanel = document.querySelector('[data-task-upcoming-panel]');
    var taskUpcomingList = taskUpcomingPanel && taskUpcomingPanel.querySelector('[data-task-upcoming-list]');
    var taskUpcomingAll = taskUpcomingPanel && taskUpcomingPanel.querySelector('[data-task-upcoming-all]');
    var panelUpdated = document.querySelector('[data-task-panel-updated]');
    var panelToggles = Array.prototype.slice.call(document.querySelectorAll('[data-task-panel-toggle]'));
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var tasksNamespace = window.TechNovaTasks = window.TechNovaTasks || {};
    var filterInputTimer = null;
    var metricsOffset = 0;
    var activeMetricIndex = Math.min(2, Math.max(0, metricCards.length - 1));
    var metricsResizeTimer = null;
    var metricsSuppressClick = false;
    var metricsDrag = { active: false, pointerId: null, startX: 0, startOffset: 0, moved: false };
    var paginationState = { current: 1, pageSize: 8, total: 124, totalPages: 16, hasPrevious: false, hasNext: true };
    var summaryEndpoint = tasksPage
        ? (tasksPage.getAttribute('data-tasks-summary-api') || '').trim()
        : '';
    var calendarState = taskCalendar ? {
        year: Number.parseInt(taskCalendar.dataset.calendarYear, 10) || 2026,
        month: Number.parseInt(taskCalendar.dataset.calendarMonth, 10) || 7,
        selected: taskCalendar.dataset.calendarSelected || '2026-08-27'
    } : null;
    var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    function formatCalendarDate(year, month, day) {
        return [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
    }

    function markPanelUpdated() {
        if (!panelUpdated) return;
        var now = new Date();
        panelUpdated.dateTime = now.toISOString();
        panelUpdated.textContent = 'Actualizado ahora';
    }

    function getCalendarTaskMap() {
        return taskRows.reduce(function (map, row) {
            var time = row.querySelector('time[datetime]');
            if (!time) return map;
            var date = time.getAttribute('datetime');
            var entry = map[date] || { count: 0, completed: 0, blocked: 0, high: 0 };
            entry.count += 1;
            if (row.dataset.taskStatus === 'completed') entry.completed += 1;
            if (row.dataset.taskStatus === 'blocked') entry.blocked += 1;
            if (row.dataset.taskPriority === 'high') entry.high += 1;
            map[date] = entry;
            return map;
        }, {});
    }

    function animateCalendarGrid(direction) {
        if (!calendarGrid || !window.gsap || reducedMotion.matches) return;
        window.gsap.fromTo(calendarGrid.children,
            { autoAlpha: 0, x: direction > 0 ? 9 : direction < 0 ? -9 : 0 },
            { autoAlpha: 1, x: 0, duration: 0.24, stagger: 0.012, ease: 'power2.out', clearProps: 'opacity,visibility,transform', overwrite: true });
    }

    function renderCalendar(direction) {
        if (!calendarState || !calendarGrid || !calendarLabel) return false;

        var firstWeekday = new Date(calendarState.year, calendarState.month, 1).getDay();
        var totalDays = new Date(calendarState.year, calendarState.month + 1, 0).getDate();
        var fragment = document.createDocumentFragment();
        var taskMap = getCalendarTaskMap();
        var todayIso = formatCalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        calendarLabel.textContent = monthNames[calendarState.month] + ' ' + calendarState.year;
        calendarGrid.setAttribute('aria-label', calendarLabel.textContent);

        for (var cell = 0; cell < 42; cell += 1) {
            var day = cell - firstWeekday + 1;
            var isCurrentMonth = day >= 1 && day <= totalDays;
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'task-calendar-day' + (isCurrentMonth ? '' : ' is-outside-month');
            button.setAttribute('role', 'gridcell');
            button.tabIndex = isCurrentMonth ? 0 : -1;

            if (isCurrentMonth) {
                var isoDate = formatCalendarDate(calendarState.year, calendarState.month, day);
                button.textContent = String(day);
                button.dataset.calendarDate = isoDate;
                button.setAttribute('aria-label', day + ' de ' + monthNames[calendarState.month].toLowerCase() + ' de ' + calendarState.year);
                button.classList.toggle('is-today', isoDate === todayIso);
                if (taskMap[isoDate]) {
                    var calendarTasks = taskMap[isoDate];
                    var marker = document.createElement('span');
                    var dueTime = new Date(isoDate + 'T23:59:59').getTime();
                    var health = calendarTasks.completed === calendarTasks.count ? 'completed'
                        : dueTime < Date.now() ? 'overdue'
                        : calendarTasks.blocked ? 'blocked'
                        : calendarTasks.high ? 'urgent' : 'active';
                    marker.className = 'task-calendar-marker';
                    marker.textContent = calendarTasks.count > 1 ? String(calendarTasks.count) : '';
                    marker.setAttribute('aria-hidden', 'true');
                    button.dataset.taskHealth = health;
                    button.dataset.taskCount = String(calendarTasks.count);
                    button.title = calendarTasks.count + (calendarTasks.count === 1 ? ' tarea' : ' tareas');
                    button.setAttribute('aria-label', button.getAttribute('aria-label') + ', ' + button.title);
                    button.appendChild(marker);
                }
                button.classList.toggle('is-selected', isoDate === calendarState.selected);
                button.setAttribute('aria-selected', isoDate === calendarState.selected ? 'true' : 'false');
            } else {
                button.disabled = true;
                button.setAttribute('aria-hidden', 'true');
            }
            fragment.appendChild(button);
        }

        calendarGrid.replaceChildren(fragment);
        taskCalendar.dataset.calendarYear = String(calendarState.year);
        taskCalendar.dataset.calendarMonth = String(calendarState.month);
        animateCalendarGrid(direction || 0);
        return true;
    }

    function changeCalendarMonth(offset) {
        if (!calendarState) return;
        var nextMonth = new Date(calendarState.year, calendarState.month + offset, 1);
        calendarState.year = nextMonth.getFullYear();
        calendarState.month = nextMonth.getMonth();
        renderCalendar(offset);
        document.dispatchEvent(new CustomEvent('tasks:calendar-month-change', {
            detail: { year: calendarState.year, month: calendarState.month + 1 }
        }));
    }

    function updateProgress(payload, source) {
        if (!taskProgressPanel || !payload || typeof payload !== 'object') return false;

        var completed = Number(payload.completed);
        var total = Number(payload.total);
        var explicitValue = Number(payload.value);
        var value = Number.isFinite(explicitValue)
            ? explicitValue
            : total > 0 && Number.isFinite(completed) ? (completed / total) * 100 : NaN;

        if (!Number.isFinite(value)) return false;
        value = Math.min(100, Math.max(0, value));
        if (Number.isFinite(completed)) generalProgressCompleted.textContent = String(Math.max(0, completed));
        if (Number.isFinite(total)) generalProgressTotal.textContent = String(Math.max(0, total));
        generalProgressValue.textContent = Math.round(value) + '%';
        generalProgressBar.setAttribute('aria-valuenow', String(Math.round(value)));
        generalProgressFill.style.setProperty('--tasks-general-progress', value + '%');
        if (progressRing) progressRing.style.setProperty('--task-ring-progress', value + '%');
        if (progressRingValue) progressRingValue.textContent = Math.round(value) + '%';
        taskProgressPanel.dataset.progressValue = String(value);
        taskProgressPanel.dataset.progressSource = source || 'runtime';
        markPanelUpdated();

        document.dispatchEvent(new CustomEvent('tasks:progress-updated', {
            detail: { source: source || 'runtime', value: value, completed: completed, total: total }
        }));
        return true;
    }

    function syncSelectedTaskContext(row) {
        if (!row || !row.querySelector('[data-task-select]') || !row.querySelector('[data-task-select]').checked) {
            var fallbackRow = taskRows.find(function (item) {
                var checkbox = item.querySelector('[data-task-select]');
                return checkbox && checkbox.checked;
            });
            if (fallbackRow) return syncSelectedTaskContext(fallbackRow);

            updateProgress({ value: 60, completed: 16, total: 24 }, 'selection-reset');
            if (generalProgressLabel) generalProgressLabel.textContent = 'Progreso general';
            if (generalProgressCaption) generalProgressCaption.hidden = false;
            if (selectedProgressCaption) selectedProgressCaption.hidden = true;
            if (progressExpected) progressExpected.textContent = '68%';
            if (progressHealth) progressHealth.textContent = 'En tiempo';
            taskProgressPanel.dataset.taskHealth = 'on-track';
            delete tasksPage.dataset.tasksFocusedId;
            return false;
        }

        var progressBar = row.querySelector('.task-progress-track[role="progressbar"]');
        var dueTime = row.querySelector('time[datetime]');
        var title = row.querySelector('.task-copy h3');
        var project = row.querySelector('.task-table-cell--project span');
        var progress = progressBar ? Number(progressBar.getAttribute('aria-valuenow')) : 0;
        var dueDate = dueTime ? dueTime.getAttribute('datetime') : '';
        var dueTimestamp = dueDate ? new Date(dueDate + 'T23:59:59').getTime() : NaN;
        var daysRemaining = Number.isFinite(dueTimestamp) ? Math.ceil((dueTimestamp - Date.now()) / 86400000) : 14;
        var expected = daysRemaining <= 0 ? 100 : daysRemaining <= 3 ? 85 : daysRemaining <= 7 ? 70 : 55;
        var health = row.dataset.taskStatus === 'completed' || progress >= 100 ? 'completed'
            : daysRemaining < 0 ? 'overdue' : progress + 8 < expected ? 'risk' : 'on-track';

        updateProgress({ value: progress }, 'task-selection');
        if (generalProgressLabel) generalProgressLabel.textContent = title ? title.textContent : 'Tarea seleccionada';
        if (generalProgressCaption) generalProgressCaption.hidden = true;
        if (selectedProgressCaption) {
            selectedProgressCaption.textContent = (project ? project.textContent : 'Proyecto') + (dueTime ? ' · Vence ' + dueTime.textContent : '');
            selectedProgressCaption.hidden = false;
        }
        if (progressExpected) progressExpected.textContent = expected + '%';
        if (progressHealth) progressHealth.textContent = health === 'completed' ? 'Completada' : health === 'overdue' ? 'Vencida' : health === 'risk' ? 'Requiere atención' : 'En tiempo';
        taskProgressPanel.dataset.taskHealth = health;
        tasksPage.dataset.tasksFocusedId = row.dataset.taskId || '';

        if (calendarState && dueDate) {
            var parts = dueDate.split('-').map(Number);
            if (parts.length === 3 && parts.every(Number.isFinite)) {
                calendarState.year = parts[0];
                calendarState.month = parts[1] - 1;
                calendarState.selected = dueDate;
                taskCalendar.dataset.calendarSelected = dueDate;
                renderCalendar(0);
            }
        }

        document.dispatchEvent(new CustomEvent('tasks:focus-change', {
            detail: { taskId: row.dataset.taskId, title: title ? title.textContent : '', project: project ? project.textContent : '', progress: progress, dueDate: dueDate }
        }));
        return true;
    }

    function animateProgressEntrance() {
        if (!taskProgressPanel || !generalProgressFill || !window.gsap || reducedMotion.matches) {
            if (tasksPage) tasksPage.dataset.tasksProgressEntry = 'complete';
            return;
        }

        var targetWidth = generalProgressFill.style.getPropertyValue('--tasks-general-progress') || '60%';
        tasksPage.dataset.tasksProgressEntry = 'running';
        window.gsap.timeline({
            onComplete: function () { tasksPage.dataset.tasksProgressEntry = 'complete'; }
        }).fromTo(taskProgressPanel,
            { autoAlpha: 0, y: 12, filter: 'blur(4px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.4, delay: 0.55, ease: 'power3.out', clearProps: 'opacity,visibility,transform,filter' })
          .fromTo(generalProgressFill,
            { width: '0%' },
            { width: targetWidth, duration: 0.7, ease: 'power2.out', clearProps: 'width' },
            '-=0.18');
    }

    function updateUpcomingTasks(items, source) {
        if (!taskUpcomingList || !Array.isArray(items)) return false;

        var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
        var priorityIcons = {
            high: 'assets/img/tasks/upcoming/priority-high.svg',
            medium: 'assets/img/tasks/upcoming/priority-medium.svg',
            low: 'assets/img/tasks/upcoming/priority-low.svg'
        };
        var fragment = document.createDocumentFragment();

        items.slice(0, 4).forEach(function (item) {
            if (!item || (!item.project && !item.title)) return;
            var priority = priorityLabels[item.priority] ? item.priority : 'medium';
            var article = document.createElement('button');
            var projectImage = document.createElement('img');
            var copy = document.createElement('div');
            var taskTitle = document.createElement('h3');
            var taskMeta = document.createElement('p');
            var progressTrack = document.createElement('div');
            var progressFill = document.createElement('span');
            var badge = document.createElement('span');

            article.type = 'button';
            article.className = 'task-upcoming-item';
            article.dataset.upcomingTask = '';
            article.dataset.taskId = item.id || '';
            article.dataset.taskStatus = item.status || 'pending';
            article.setAttribute('aria-label', 'Seleccionar ' + (item.title || item.project));
            projectImage.src = item.image || 'assets/img/tasks/upcoming/app-movil.png';
            projectImage.alt = '';
            projectImage.setAttribute('aria-hidden', 'true');
            copy.className = 'task-upcoming-copy';
            taskTitle.textContent = item.title || item.project;
            taskMeta.textContent = [item.project, item.dueLabel || item.dueDate].filter(Boolean).join(' · ');
            progressTrack.className = 'task-upcoming-progress';
            progressFill.style.width = Math.min(100, Math.max(0, Number(item.progress) || 0)) + '%';
            badge.className = 'task-upcoming-priority task-upcoming-priority--' + priority;
            badge.textContent = priorityLabels[priority];
            progressTrack.appendChild(progressFill);
            copy.append(taskTitle, taskMeta, progressTrack);
            article.append(projectImage, copy, badge);
            fragment.appendChild(article);
        });

        taskUpcomingList.replaceChildren(fragment);
        taskUpcomingPanel.dataset.upcomingSource = source || 'runtime';
        document.dispatchEvent(new CustomEvent('tasks:upcoming-updated', {
            detail: { source: source || 'runtime', items: items.slice(0, 3) }
        }));
        return true;
    }

    function refreshUpcomingFromRows() {
        var upcoming = taskRows.map(function (row) {
            var time = row.querySelector('time[datetime]');
            var title = row.querySelector('.task-copy h3');
            var project = row.querySelector('.task-table-cell--project span');
            var projectImage = row.querySelector('.task-table-cell--project img');
            var progress = row.querySelector('.task-progress-track[role="progressbar"]');
            return {
                id: row.dataset.taskId,
                title: title ? title.textContent : 'Tarea',
                project: project ? project.textContent : 'Proyecto',
                image: projectImage ? projectImage.getAttribute('src') : '',
                priority: row.dataset.taskPriority || 'medium',
                status: row.dataset.taskStatus || 'pending',
                progress: progress ? Number(progress.getAttribute('aria-valuenow')) : 0,
                dueDate: time ? time.getAttribute('datetime') : '',
                dueLabel: time ? time.textContent : ''
            };
        }).filter(function (item) { return item.dueDate; }).sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); });
        updateUpcomingTasks(upcoming, 'task-list');
    }

    function animateUpcomingEntrance() {
        if (!taskUpcomingPanel || !window.gsap || reducedMotion.matches) {
            if (tasksPage) tasksPage.dataset.tasksUpcomingEntry = 'complete';
            return;
        }

        var rows = taskUpcomingPanel.querySelectorAll('[data-upcoming-task]');
        tasksPage.dataset.tasksUpcomingEntry = 'running';
        window.gsap.timeline({
            onComplete: function () { tasksPage.dataset.tasksUpcomingEntry = 'complete'; }
        }).fromTo(taskUpcomingPanel,
            { autoAlpha: 0, y: 12, filter: 'blur(4px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.4, delay: 0.72, ease: 'power3.out', clearProps: 'opacity,visibility,transform,filter' })
          .fromTo(rows,
            { autoAlpha: 0, x: 8 },
            { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.055, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
            '-=0.18');
    }

    function setMetricText(card, selector, value) {
        var target = card.querySelector(selector);
        if (!target || value === undefined || value === null) return;
        target.textContent = String(value);
    }

    function getMetricOffset(index) {
        var card = metricCards[index];
        if (!metricsViewport || !card) return 0;
        return (metricsViewport.clientWidth / 2) - card.offsetLeft - (card.offsetWidth / 2);
    }

    function moveMetricsTrack(offset, animate) {
        metricsOffset = offset;
        if (!metricsTrack) return;
        if (window.gsap) {
            window.gsap.to(metricsTrack, {
                x: offset,
                duration: animate && !reducedMotion.matches ? 0.58 : 0,
                ease: 'power3.out',
                overwrite: true
            });
        } else {
            metricsTrack.style.transform = 'translate3d(' + offset + 'px,0,0)';
        }
    }

    function keepCircularNeighborsVisible(index) {
        if (!metricsTrack || metricCards.length < 3) return;
        var activeCard = metricCards[index];
        var previousCard = metricCards[(index - 1 + metricCards.length) % metricCards.length];
        var nextCard = metricCards[(index + 1) % metricCards.length];
        var activeLeftBefore = activeCard.getBoundingClientRect().left;

        if (activeCard.previousElementSibling !== previousCard) {
            metricsTrack.insertBefore(previousCard, activeCard);
        }
        if (activeCard.nextElementSibling !== nextCard) {
            metricsTrack.insertBefore(nextCard, activeCard.nextSibling);
        }

        var activeLeftAfter = activeCard.getBoundingClientRect().left;
        if (activeLeftBefore !== activeLeftAfter) {
            moveMetricsTrack(metricsOffset + activeLeftBefore - activeLeftAfter, false);
        }
    }

    function syncMetricStates() {
        metricCards.forEach(function (card, index) {
            var linearDistance = Math.abs(index - activeMetricIndex);
            var distance = Math.min(linearDistance, metricCards.length - linearDistance);
            card.classList.toggle('is-active', distance === 0);
            card.classList.toggle('is-near', distance === 1);
            card.classList.toggle('is-outer', distance > 1);
            card.setAttribute('aria-current', distance === 0 ? 'true' : 'false');
            card.setAttribute('tabindex', distance <= 1 ? '0' : '-1');
        });

        metricsDots.forEach(function (dot, index) {
            var active = index === activeMetricIndex;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-current', active ? 'true' : 'false');
        });

        metricsControls.forEach(function (button) {
            button.disabled = metricCards.length < 2;
        });

        if (metricsStatus && metricCards[activeMetricIndex]) {
            var title = metricCards[activeMetricIndex].querySelector('h3');
            metricsStatus.textContent = 'Métrica ' + (activeMetricIndex + 1) + ' de ' + metricCards.length + ': ' + (title ? title.textContent : 'Resumen');
        }
    }

    function setActiveMetric(index, animate, source) {
        if (!metricCards.length) return;
        activeMetricIndex = ((index % metricCards.length) + metricCards.length) % metricCards.length;
        keepCircularNeighborsVisible(activeMetricIndex);
        syncMetricStates();
        moveMetricsTrack(getMetricOffset(activeMetricIndex), animate);

        document.dispatchEvent(new CustomEvent('tasks:metrics-navigate', {
            detail: { index: activeMetricIndex, metric: metricCards[activeMetricIndex].dataset.taskMetric, source: source || 'runtime', offset: metricsOffset }
        }));
    }

    function placeMetricBesideActive(targetIndex, direction) {
        var activeCard = metricCards[activeMetricIndex];
        var targetCard = metricCards[targetIndex];
        if (!metricsTrack || !activeCard || !targetCard) return;

        var alreadyAdjacent = direction > 0
            ? activeCard.nextElementSibling === targetCard
            : activeCard.previousElementSibling === targetCard;
        if (alreadyAdjacent) return;

        var activeLeftBefore = activeCard.getBoundingClientRect().left;
        if (direction > 0) metricsTrack.insertBefore(targetCard, activeCard.nextSibling);
        else metricsTrack.insertBefore(targetCard, activeCard);

        var activeLeftAfter = activeCard.getBoundingClientRect().left;
        moveMetricsTrack(metricsOffset + activeLeftBefore - activeLeftAfter, false);
    }

    function shiftMetrics(direction, source) {
        if (metricCards.length < 2) return;
        var normalizedDirection = direction > 0 ? 1 : -1;
        var targetIndex = (activeMetricIndex + normalizedDirection + metricCards.length) % metricCards.length;
        placeMetricBesideActive(targetIndex, normalizedDirection);
        setActiveMetric(targetIndex, true, source || (normalizedDirection > 0 ? 'next' : 'previous'));
    }

    function buildMetricsPagination() {
        if (!metricsPagination) return;
        var fragment = document.createDocumentFragment();
        metricCards.forEach(function (card, index) {
            var dot = document.createElement('button');
            var title = card.querySelector('h3');
            dot.type = 'button';
            dot.className = 'task-metrics-dot';
            dot.setAttribute('aria-label', 'Mostrar ' + (title ? title.textContent : 'métrica ' + (index + 1)));
            dot.addEventListener('click', function () { setActiveMetric(index, true, 'indicator'); });
            fragment.appendChild(dot);
            metricsDots.push(dot);
        });
        metricsPagination.appendChild(fragment);
    }

    function getPaginationItems(current, totalPages) {
        if (totalPages <= 7) return Array.from({ length: totalPages }, function (_, index) { return index + 1; });
        var start = current <= 3 ? 2 : current >= totalPages - 2 ? totalPages - 3 : current - 1;
        var end = current <= 3 ? 3 : current >= totalPages - 2 ? totalPages - 1 : current + 1;
        var items = [1];
        if (start > 2) items.push('gap-start');
        for (var page = start; page <= end; page += 1) items.push(page);
        if (end < totalPages - 1) items.push('gap-end');
        items.push(totalPages);
        return items;
    }

    function renderPaginationPages() {
        if (!paginationPages) return;
        var fragment = document.createDocumentFragment();
        getPaginationItems(paginationState.current, paginationState.totalPages).forEach(function (item) {
            if (typeof item === 'string') {
                var gap = document.createElement('span');
                gap.className = 'task-pagination-gap';
                gap.textContent = '…';
                gap.setAttribute('aria-hidden', 'true');
                fragment.appendChild(gap);
                return;
            }
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'task-pagination-page';
            button.dataset.taskPage = String(item);
            button.textContent = String(item);
            button.setAttribute('aria-label', 'Ir a la página ' + item);
            if (item === paginationState.current) {
                button.classList.add('is-active');
                button.setAttribute('aria-current', 'page');
            }
            fragment.appendChild(button);
        });
        paginationPages.replaceChildren(fragment);
    }

    function updatePagination(payload, source) {
        if (!taskPagination || !payload || typeof payload !== 'object') return false;
        var current = Number(payload.current !== undefined ? payload.current : payload.page);
        var pageSize = Number(payload.pageSize !== undefined ? payload.pageSize : payload.limit);
        var total = Number(payload.total);
        if (!Number.isInteger(current) || current < 1 || !Number.isInteger(pageSize) || pageSize < 1 || !Number.isInteger(total) || total < 0) return false;

        var totalPages = Math.max(1, Number(payload.totalPages) || Math.ceil(total / pageSize));
        current = Math.min(current, totalPages);
        paginationState = { current: current, pageSize: pageSize, total: total, totalPages: totalPages, hasPrevious: current > 1, hasNext: current < totalPages };
        var start = total === 0 ? 0 : ((current - 1) * pageSize) + 1;
        var end = Math.min(current * pageSize, total);
        paginationSummary.textContent = 'Mostrando ' + start + ' a ' + end + ' de ' + total + ' tareas';
        if (paginationMobileStatus) paginationMobileStatus.textContent = 'Página ' + current + ' de ' + totalPages;
        if (pageSizeSelect) pageSizeSelect.value = String(pageSize);
        renderPaginationPages();
        var previous = taskPagination.querySelector('[data-task-page="previous"]');
        var next = taskPagination.querySelector('[data-task-page="next"]');
        if (previous) previous.disabled = !paginationState.hasPrevious;
        if (next) next.disabled = !paginationState.hasNext;
        taskPagination.dataset.paginationSource = source || 'runtime';
        document.dispatchEvent(new CustomEvent('tasks:pagination-updated', {
            detail: { source: source || 'runtime', pagination: paginationState }
        }));
        return true;
    }

    function requestTaskPage(action) {
        if (action === 'ellipsis') {
            document.dispatchEvent(new CustomEvent('tasks:pagination-more-request', { detail: { pagination: paginationState } }));
            return;
        }

        var lastPage = paginationState.totalPages;
        var target = action === 'previous'
            ? paginationState.current - 1
            : action === 'next' ? paginationState.current + 1 : Number(action);
        if (!Number.isInteger(target)) return;
        target = Math.max(1, Math.min(lastPage, target));
        updatePagination({ current: target, pageSize: paginationState.pageSize, total: paginationState.total }, 'interaction');
        taskPagination.classList.add('is-loading');
        window.setTimeout(function () { taskPagination.classList.remove('is-loading'); }, 260);
        if (taskTable) taskTable.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        var url = new URL(window.location.href);
        url.searchParams.set('page', String(target));
        url.searchParams.set('limit', String(paginationState.pageSize));
        window.history.replaceState(null, '', url);
        document.dispatchEvent(new CustomEvent('tasks:page-change', { detail: { page: target, limit: paginationState.pageSize, filters: getFilterState() } }));
        if (listEndpoint) loadTaskList('page');
    }

    function updateMetrics(payload, source) {
        var metrics = payload && payload.metrics ? payload.metrics : payload;
        if (!metrics || typeof metrics !== 'object') return false;

        var updated = false;
        metricCards.forEach(function (card) {
            var metric = metrics[card.dataset.taskMetric];
            if (!metric || typeof metric !== 'object') return;

            setMetricText(card, '[data-task-metric-value]', metric.value);
            setMetricText(card, '[data-task-metric-change]', metric.change);
            setMetricText(card, '[data-task-metric-context]', metric.context);
            updated = true;
        });

        if (updated) {
            tasksPage.dataset.tasksMetricsSource = source || 'runtime';
            document.dispatchEvent(new CustomEvent('tasks:metrics-updated', {
                detail: { source: source || 'runtime', metrics: metrics }
            }));
        }

        return updated;
    }

    function loadMetrics() {
        if (!summaryEndpoint || !window.fetch) return Promise.resolve(false);

        return window.fetch(summaryEndpoint, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin'
        }).then(function (response) {
            if (!response.ok) throw new Error('No se pudo cargar el resumen de tareas.');
            return response.json();
        }).then(function (payload) {
            if (!updateMetrics(payload, 'api')) throw new Error('El resumen de tareas no contiene métricas válidas.');
            return true;
        }).catch(function (error) {
            tasksPage.dataset.tasksMetricsSource = 'fallback';
            document.dispatchEvent(new CustomEvent('tasks:metrics-error', {
                detail: { error: error }
            }));
            return false;
        });
    }

    function setTaskListState(state, message) {
        if (taskListLoading) taskListLoading.hidden = state !== 'loading';
        if (taskListError) taskListError.hidden = state !== 'error';
        if (taskListErrorMessage && message) taskListErrorMessage.textContent = message;
        if (taskTable) taskTable.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
        tasksPage.dataset.tasksListState = state;
    }

    function formatTaskDueDate(value) {
        if (!value) return 'Sin fecha';
        var parts = value.split('-').map(Number);
        if (parts.length !== 3) return value;
        return monthNames[parts[1] - 1] + ' ' + parts[2];
    }

    function renderTaskRows(items) {
        if (!taskTableBody || !Array.isArray(items) || !taskRows.length) return false;
        var template = taskRows[0];
        var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
        var statusLabels = { pending: 'Pendiente', 'in-progress': 'En progreso', review: 'En revisión', blocked: 'Bloqueada', completed: 'Completada', overdue: 'Retrasada' };
        var fragment = document.createDocumentFragment();

        items.forEach(function (item) {
            var row = template.cloneNode(true);
            var checkbox = row.querySelector('[data-task-select]');
            var title = row.querySelector('.task-copy h3');
            var description = row.querySelector('.task-copy p');
            var projectImage = row.querySelector('.task-table-cell--project img');
            var projectName = row.querySelector('.task-table-cell--project span');
            var assigneeImage = row.querySelector('.task-table-cell--assignee img');
            var assigneeName = row.querySelector('.task-table-cell--assignee span');
            var priority = row.querySelector('.task-priority');
            var status = row.querySelector('.task-table-cell--status > span');
            var progressBar = row.querySelector('.task-progress-track');
            var progressFill = progressBar && progressBar.querySelector('span');
            var progressValue = row.querySelector('.task-progress strong');
            var dueTime = row.querySelector('time');
            var dueCaption = dueTime && dueTime.nextElementSibling;
            var menu = row.querySelector('[data-task-row-menu]');

            row.dataset.taskId = item.id;
            row.dataset.taskProject = item.project.id;
            row.dataset.taskStatus = item.status;
            row.dataset.taskPriority = item.priority;
            row.dataset.taskOwner = item.assignee.id;
            row.dataset.taskCreator = item.creatorId;
            row.dataset.taskPermissions = JSON.stringify(item.permissions || {});
            delete row.dataset.taskEventsBound;
            row.classList.remove('is-selected');
            row.removeAttribute('aria-selected');
            row.hidden = false;
            if (checkbox) { checkbox.checked = false; checkbox.setAttribute('aria-label', 'Seleccionar ' + item.title + ' de ' + item.project.name); }
            if (title) title.textContent = item.title;
            if (description) description.textContent = item.description;
            if (projectImage) projectImage.src = item.project.image;
            if (projectName) projectName.textContent = item.project.name;
            if (assigneeImage) assigneeImage.src = item.assignee.avatar;
            if (assigneeName) assigneeName.textContent = item.assignee.name;
            if (priority) { priority.className = 'task-priority task-priority--' + item.priority; priority.textContent = priorityLabels[item.priority]; }
            if (status) status.textContent = statusLabels[item.status];
            if (progressBar) { progressBar.setAttribute('aria-label', 'Progreso de ' + item.title); progressBar.setAttribute('aria-valuenow', String(item.progress)); }
            if (progressFill) progressFill.style.setProperty('--task-progress', item.progress + '%');
            if (progressValue) progressValue.textContent = Math.round(item.progress) + '%';
            if (dueTime) { dueTime.dateTime = item.dueDate; dueTime.textContent = formatTaskDueDate(item.dueDate); }
            if (dueCaption) dueCaption.textContent = item.daysRemaining === null ? 'Fecha por confirmar' : item.daysRemaining < 0 ? Math.abs(item.daysRemaining) + ' días de retraso' : item.daysRemaining + ' días restantes';
            if (menu) menu.setAttribute('aria-label', 'Abrir opciones de ' + item.title + ', ' + item.project.name);
            bindTaskRow(row);
            fragment.appendChild(row);
        });

        taskTableBody.replaceChildren(fragment);
        taskRows = Array.prototype.slice.call(taskTableBody.querySelectorAll('[data-task-row]'));
        if (taskTable) taskTable.setAttribute('aria-rowcount', String(taskRows.length + 1));
        updateScopeCounts();
        syncTaskSelection(false);
        renderCalendar(0);
        refreshUpcomingFromRows();
        return true;
    }

    function applyTaskListPayload(payload, source) {
        if (!payload) return false;
        renderTaskRows(payload.items);
        if (payload.metrics) updateMetrics(payload.metrics, source);
        if (payload.pagination) updatePagination(payload.pagination, source);
        if (payload.upcoming) updateUpcomingTasks(payload.upcoming, source);
        if (payload.progress) updateProgress(payload.progress, source);
        if (payload.calendar && payload.calendar.selected && calendarState) {
            var dateParts = String(payload.calendar.selected).split('-').map(Number);
            if (dateParts.length === 3) {
                calendarState.year = dateParts[0];
                calendarState.month = dateParts[1] - 1;
                calendarState.selected = payload.calendar.selected;
                renderCalendar(0);
            }
        }
        tasksPage.dataset.tasksListSource = source || 'runtime';
        return true;
    }

    function loadTaskList(reason) {
        if (!tasksApi || !listEndpoint) return Promise.resolve(false);
        var requestId = ++taskListRequestId;
        setTaskListState('loading');
        return tasksApi.list(getFilterState()).then(function (payload) {
            if (requestId !== taskListRequestId || !payload) return false;
            applyTaskListPayload(payload, 'api');
            setTaskListState('ready');
            document.dispatchEvent(new CustomEvent('tasks:list-loaded', { detail: { reason: reason || 'runtime', count: payload.items.length } }));
            return true;
        }).catch(function (error) {
            if (requestId !== taskListRequestId) return false;
            setTaskListState('error', error.message || 'No se pudo cargar el listado.');
            tasksPage.dataset.tasksListSource = 'fallback';
            document.dispatchEvent(new CustomEvent('tasks:list-error', { detail: { error: error, reason: reason || 'runtime' } }));
            return false;
        });
    }

    function animateMetricsEntrance() {
        if (!metricsSection || !metricCards.length || !window.gsap || reducedMotion.matches) {
            if (tasksPage) tasksPage.dataset.tasksMetricsEntry = 'complete';
            return;
        }

        var targetOpacity = metricCards.map(function (card) {
            return Number.parseFloat(window.getComputedStyle(card).opacity) || 1;
        });

        tasksPage.dataset.tasksMetricsEntry = 'running';
        window.gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
                metricCards.forEach(function (card) {
                    window.gsap.set(card, { clearProps: 'opacity,visibility,transform,filter' });
                });
                tasksPage.dataset.tasksMetricsEntry = 'complete';
            }
        })
            .fromTo(metricsSection,
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.46, clearProps: 'opacity,visibility,transform' },
                0)
            .fromTo(metricCards,
                { autoAlpha: 0, y: 12, filter: 'blur(5px)' },
                {
                    opacity: function (index) { return targetOpacity[index]; },
                    visibility: 'visible',
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.42,
                    stagger: 0.055
                },
                0.1);
    }

    function getFilterState() {
        var form = advancedFilterForm ? new FormData(advancedFilterForm) : null;
        return {
            scope: tasksPage.dataset.tasksScope || 'all',
            query: listSearchInput ? listSearchInput.value.trim() : '',
            project: projectSelect ? projectSelect.value : 'all',
            status: statusSelect ? statusSelect.value : 'all',
            priority: prioritySelect ? prioritySelect.value : 'all',
            assignee: tasksPage.dataset.tasksAssignee || (form ? String(form.get('assignee') || 'all') : 'all'),
            dueFrom: tasksPage.dataset.tasksDueFrom || (form ? String(form.get('dueFrom') || '') : ''),
            dueTo: tasksPage.dataset.tasksDueTo || (form ? String(form.get('dueTo') || '') : ''),
            sort: sortSelect ? sortSelect.value : 'due-date',
            direction: 'asc',
            view: tasksPage.dataset.tasksView || 'table',
            page: paginationState.current,
            limit: paginationState.pageSize
        };
    }

    function emitFiltersChange(reason) {
        if (reason !== 'initial' && paginationState.current !== 1) {
            updatePagination({ current: 1, pageSize: paginationState.pageSize, total: paginationState.total }, 'filter-reset');
        }
        var filters = getFilterState();
        tasksPage.dataset.tasksQuery = filters.query;
        tasksPage.dataset.tasksProject = filters.project;
        tasksPage.dataset.tasksStatus = filters.status;
        tasksPage.dataset.tasksPriority = filters.priority;
        tasksPage.dataset.tasksAssignee = filters.assignee;
        tasksPage.dataset.tasksDueFrom = filters.dueFrom;
        tasksPage.dataset.tasksDueTo = filters.dueTo;
        tasksPage.dataset.tasksSort = filters.sort;
        var visibleCount = applyTaskFilters(filters, reason);
        updateFilterInterface(filters, visibleCount);
        updateAdvancedFilterBadge(filters);
        document.dispatchEvent(new CustomEvent('tasks:filters-change', {
            detail: { reason: reason, filters: filters }
        }));
        var filterUrl = new URL(window.location.href);
        ['scope', 'query', 'project', 'status', 'priority', 'assignee', 'dueFrom', 'dueTo', 'sort', 'view'].forEach(function (key) {
            var value = filters[key];
            var isDefault = !value || value === 'all' || (key === 'sort' && value === 'due-date') || (key === 'view' && value === 'table');
            if (isDefault) filterUrl.searchParams.delete(key);
            else filterUrl.searchParams.set(key, value);
        });
        filterUrl.searchParams.set('page', String(paginationState.current));
        filterUrl.searchParams.set('limit', String(paginationState.pageSize));
        window.history.replaceState(null, '', filterUrl);
        if (listEndpoint) loadTaskList(reason || 'filters');
    }

    function getActiveFilterCount(filters) {
        return ['scope', 'query', 'project', 'status', 'priority', 'assignee', 'dueFrom', 'dueTo'].reduce(function (total, key) {
            var value = filters[key];
            var isDefault = ['query', 'dueFrom', 'dueTo'].indexOf(key) !== -1 ? !value : value === 'all';
            return total + (isDefault ? 0 : 1);
        }, 0);
    }

    function updateAdvancedFilterBadge(filters) {
        if (!advancedFilterBadge || !headerFiltersButton) return;
        var count = getActiveFilterCount(filters || getFilterState());
        advancedFilterBadge.textContent = String(count);
        advancedFilterBadge.hidden = count === 0;
        headerFiltersButton.classList.toggle('has-active-filters', count > 0);
        headerFiltersButton.setAttribute('aria-label', count ? 'Abrir filtros de tareas, ' + count + ' activos' : 'Abrir filtros de tareas');
    }

    function updateScopeIndicator() {
        if (!scopeIndicator || !scopeTabs) return;
        var selected = scopeButtons.find(function (button) { return button.getAttribute('aria-selected') === 'true'; });
        if (!selected) return;
        scopeTabs.style.setProperty('--task-scope-x', selected.offsetLeft + 'px');
        scopeTabs.style.setProperty('--task-scope-width', selected.offsetWidth + 'px');
    }

    function updateScopeNavigation() {
        if (!scopeTabs || !scopeCarousel) return;
        var maxScroll = Math.max(0, scopeTabs.scrollWidth - scopeTabs.clientWidth);
        var atStart = scopeTabs.scrollLeft <= 3;
        var atEnd = scopeTabs.scrollLeft >= maxScroll - 3;
        scopeCarousel.classList.toggle('is-at-start', atStart);
        scopeCarousel.classList.toggle('is-at-end', atEnd);
        scopeArrows.forEach(function (button) {
            button.hidden = button.dataset.taskScopeDirection === 'previous' ? atStart : atEnd;
        });
    }

    function centerActiveScope(selectedButton) {
        if (!scopeTabs || !selectedButton || window.innerWidth > 640) return;
        var target = selectedButton.offsetLeft - (scopeTabs.clientWidth - selectedButton.offsetWidth) / 2;
        scopeTabs.scrollTo({ left: Math.max(0, target), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        window.setTimeout(updateScopeNavigation, reducedMotion.matches ? 0 : 340);
    }

    function updateScopeCounts() {
        scopeButtons.forEach(function (button) {
            var count = taskRows.filter(function (row) { return rowMatchesScope(row, button.dataset.taskScope); }).length;
            var target = button.querySelector('[data-task-scope-count]');
            if (target) target.textContent = String(count);
        });
    }

    function getFilterLabel(key, value) {
        var labels = {
            scope: { mine: 'Mis tareas', 'assigned-by-me': 'Asignadas por mí', project: 'Por proyecto', priority: 'Por prioridad' },
            status: { 'in-progress': 'En progreso', pending: 'Pendientes', completed: 'Completadas', blocked: 'Bloqueadas', overdue: 'Retrasadas' },
            priority: { high: 'Prioridad alta', medium: 'Prioridad media', low: 'Prioridad baja' }
        };
        if (labels[key] && labels[key][value]) return labels[key][value];
        if (key === 'query') return 'Búsqueda: ' + value;
        if (key === 'dueFrom') return 'Desde: ' + value;
        if (key === 'dueTo') return 'Hasta: ' + value;
        var source = key === 'project' ? projectSelect : null;
        if (source) {
            var option = source.querySelector('option[value="' + value + '"]');
            if (option) return option.textContent.replace(/^Proyecto:\s*/, '');
        }
        if (key === 'assignee' && advancedFilterForm) {
            var assignee = advancedFilterForm.querySelector('[name="assignee"] option[value="' + value + '"]');
            if (assignee) return assignee.textContent;
        }
        return value;
    }

    function renderActiveFilters(filters) {
        if (!activeFiltersContainer) return;
        activeFiltersContainer.replaceChildren();
        ['scope', 'query', 'project', 'status', 'priority', 'assignee', 'dueFrom', 'dueTo'].forEach(function (key) {
            var value = filters[key];
            if (!value || value === 'all') return;
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'task-filter-chip';
            chip.dataset.taskRemoveFilter = key;
            chip.setAttribute('aria-label', 'Quitar filtro ' + getFilterLabel(key, value));
            chip.innerHTML = '<span>' + getFilterLabel(key, value) + '</span><span aria-hidden="true">×</span>';
            activeFiltersContainer.appendChild(chip);
        });
        if (clearFiltersButton) clearFiltersButton.hidden = activeFiltersContainer.children.length === 0;
    }

    function updateFilterInterface(filters, visibleCount) {
        renderActiveFilters(filters);
        if (resultsSummary) resultsSummary.textContent = 'Mostrando ' + visibleCount + ' de ' + taskRows.length + ' tareas';
    }

    function clearTaskFilter(key) {
        if (key === 'scope') {
            var allScope = scopeButtons.find(function (button) { return button.dataset.taskScope === 'all'; });
            if (allScope) setTaskScope(allScope, false);
        } else if (key === 'query') {
            if (listSearchInput) listSearchInput.value = '';
            if (headerSearchInput) headerSearchInput.value = '';
        } else if (key === 'project' && projectSelect) projectSelect.value = 'all';
        else if (key === 'status' && statusSelect) statusSelect.value = 'all';
        else if (key === 'priority' && prioritySelect) prioritySelect.value = 'all';
        else if (key === 'assignee') tasksPage.dataset.tasksAssignee = 'all';
        else if (key === 'dueFrom') tasksPage.dataset.tasksDueFrom = '';
        else if (key === 'dueTo') tasksPage.dataset.tasksDueTo = '';
        syncAdvancedForm(getFilterState());
        emitFiltersChange('remove-' + key);
    }

    function resetTaskFilters() {
        ['scope', 'query', 'project', 'status', 'priority', 'assignee', 'dueFrom', 'dueTo'].forEach(clearTaskFilter);
        emitFiltersChange('clear-all');
    }

    function syncAdvancedForm(filters) {
        if (!advancedFilterForm) return;
        var state = filters || getFilterState();
        ['scope', 'project', 'status', 'query', 'assignee', 'dueFrom', 'dueTo'].forEach(function (name) {
            if (advancedFilterForm.elements[name]) advancedFilterForm.elements[name].value = state[name];
        });
        var priorityField = advancedFilterForm.querySelector('[name="priority"][value="' + state.priority + '"]');
        if (priorityField) priorityField.checked = true;
    }

    function openAdvancedFilters() {
        if (!advancedFilterPanel || !headerFiltersButton) return;
        advancedFilterLastFocus = document.activeElement;
        syncAdvancedForm();
        advancedFilterPanel.hidden = false;
        var backdrop = document.querySelector('.tasks-filter-backdrop');
        if (backdrop) backdrop.hidden = false;
        headerFiltersButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('tasks-filters-open');
        var firstField = advancedFilterPanel.querySelector('select, input, button');
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.fromTo(advancedFilterPanel,
                { autoAlpha: 0, y: window.innerWidth <= 1024 ? 36 : -8, scale: 0.985 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
            if (backdrop) window.gsap.to(backdrop, { opacity: 1, duration: 0.22, overwrite: true });
        } else if (backdrop) {
            backdrop.style.opacity = '1';
        }
        if (firstField) firstField.focus({ preventScroll: true });
    }

    function closeAdvancedFilters() {
        if (!advancedFilterPanel || advancedFilterPanel.hidden) return;
        var backdrop = document.querySelector('.tasks-filter-backdrop');
        var finish = function () {
            advancedFilterPanel.hidden = true;
            if (backdrop) {
                backdrop.hidden = true;
                backdrop.style.removeProperty('opacity');
            }
            headerFiltersButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('tasks-filters-open');
            if (advancedFilterLastFocus && advancedFilterLastFocus.focus) advancedFilterLastFocus.focus({ preventScroll: true });
        };
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.to(advancedFilterPanel, { autoAlpha: 0, y: window.innerWidth <= 1024 ? 30 : -6, duration: 0.2, ease: 'power2.in', overwrite: true, onComplete: finish });
            if (backdrop) window.gsap.to(backdrop, { opacity: 0, duration: 0.18, overwrite: true });
        } else {
            finish();
        }
    }

    function applyAdvancedFilterForm() {
        if (!advancedFilterForm) return;
        var data = new FormData(advancedFilterForm);
        var scope = String(data.get('scope') || 'all');
        var selectedScope = scopeButtons.find(function (button) { return button.dataset.taskScope === scope; });
        if (selectedScope) setTaskScope(selectedScope, false);
        if (projectSelect) projectSelect.value = String(data.get('project') || 'all');
        if (statusSelect) statusSelect.value = String(data.get('status') || 'all');
        if (prioritySelect) prioritySelect.value = String(data.get('priority') || 'all');
        tasksPage.dataset.tasksAssignee = String(data.get('assignee') || 'all');
        tasksPage.dataset.tasksDueFrom = String(data.get('dueFrom') || '');
        tasksPage.dataset.tasksDueTo = String(data.get('dueTo') || '');
        if (listSearchInput) listSearchInput.value = String(data.get('query') || '').trim();
        if (headerSearchInput) headerSearchInput.value = listSearchInput ? listSearchInput.value : String(data.get('query') || '').trim();
        emitFiltersChange('advanced');
    }

    function normalizeTaskText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function rowMatchesScope(row, scope) {
        if (scope === 'mine') return row.dataset.taskOwner === 'josue-islas';
        if (scope === 'assigned-by-me') return row.dataset.taskCreator === 'josue-islas';
        return true;
    }

    function applyTaskFilters(filters, reason) {
        if (!taskRows.length) return 0;

        var query = normalizeTaskText(filters.query);
        var visibleCount = 0;
        taskRows.forEach(function (row) {
            var dueDate = row.querySelector('time[datetime]');
            var dueValue = dueDate ? dueDate.getAttribute('datetime') : '';
            var matches = rowMatchesScope(row, filters.scope)
                && (filters.project === 'all' || row.dataset.taskProject === filters.project)
                && (filters.status === 'all' || row.dataset.taskStatus === filters.status)
                && (filters.priority === 'all' || row.dataset.taskPriority === filters.priority)
                && (filters.assignee === 'all' || row.dataset.taskOwner === filters.assignee)
                && (!filters.dueFrom || dueValue >= filters.dueFrom)
                && (!filters.dueTo || dueValue <= filters.dueTo)
                && (!query || normalizeTaskText(row.textContent).indexOf(query) !== -1);

            row.hidden = !matches;
            row.setAttribute('aria-hidden', matches ? 'false' : 'true');
            if (matches) visibleCount += 1;
        });

        sortTaskRows(filters.sort);

        if (taskEmptyState) taskEmptyState.hidden = visibleCount !== 0;
        if (taskTable) taskTable.setAttribute('aria-rowcount', String(visibleCount + 1));
        tasksPage.dataset.tasksVisibleCount = String(visibleCount);
        syncTaskSelection();
        document.dispatchEvent(new CustomEvent('tasks:list-filtered', {
            detail: { reason: reason || 'runtime', count: visibleCount, filters: filters }
        }));
        return visibleCount;
    }

    function sortTaskRows(sort) {
        if (!taskTableBody) return;
        var priorityOrder = { high: 0, medium: 1, low: 2 };
        taskRows.sort(function (a, b) {
            if (sort === 'priority') return (priorityOrder[a.dataset.taskPriority] || 9) - (priorityOrder[b.dataset.taskPriority] || 9);
            if (sort === 'title') return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'es');
            if (sort === 'progress') {
                var aProgress = Number.parseFloat((a.querySelector('[role="progressbar"]') || {}).getAttribute ? a.querySelector('[role="progressbar"]').getAttribute('aria-valuenow') : 0) || 0;
                var bProgress = Number.parseFloat((b.querySelector('[role="progressbar"]') || {}).getAttribute ? b.querySelector('[role="progressbar"]').getAttribute('aria-valuenow') : 0) || 0;
                return bProgress - aProgress;
            }
            var aTime = a.querySelector('time[datetime]');
            var bTime = b.querySelector('time[datetime]');
            return String(aTime ? aTime.dateTime : '').localeCompare(String(bTime ? bTime.dateTime : ''));
        }).forEach(function (row) { taskTableBody.appendChild(row); });
    }

    function getSelectedTaskIds() {
        return taskRows.filter(function (row) {
            var checkbox = row.querySelector('[data-task-select]');
            return checkbox && checkbox.checked;
        }).map(function (row) { return row.dataset.taskId; });
    }

    function syncTaskSelection(emitEvent, contextRow) {
        var visibleRows = taskRows.filter(function (row) { return !row.hidden; });
        var selectedVisibleRows = visibleRows.filter(function (row) {
            var checkbox = row.querySelector('[data-task-select]');
            return checkbox && checkbox.checked;
        });

        taskRows.forEach(function (row) {
            var checkbox = row.querySelector('[data-task-select]');
            row.classList.toggle('is-selected', Boolean(checkbox && checkbox.checked));
            row.setAttribute('aria-selected', checkbox && checkbox.checked ? 'true' : 'false');
        });

        if (selectAllTasks) {
            selectAllTasks.checked = visibleRows.length > 0 && selectedVisibleRows.length === visibleRows.length;
            selectAllTasks.indeterminate = selectedVisibleRows.length > 0 && selectedVisibleRows.length < visibleRows.length;
        }

        var selectedIds = getSelectedTaskIds();
        tasksPage.dataset.tasksSelectedCount = String(selectedIds.length);
        syncSelectedTaskContext(contextRow || null);
        if (emitEvent) {
            document.dispatchEvent(new CustomEvent('tasks:selection-change', {
                detail: { taskIds: selectedIds }
            }));
        }
    }

    function toggleTaskRow(row) {
        var checkbox = row && row.querySelector('[data-task-select]');
        if (!checkbox) return;
        checkbox.checked = !checkbox.checked;
        syncTaskSelection(true, row);
    }

    function setTaskScope(selectedButton, emitEvent) {
        if (!selectedButton) return;

        /* "Todas" representa una vista limpia; evita que filtros residuales oculten filas. */
        if (emitEvent && selectedButton.dataset.taskScope === 'all') {
            if (listSearchInput) listSearchInput.value = '';
            if (headerSearchInput) headerSearchInput.value = '';
            if (projectSelect) projectSelect.value = 'all';
            if (statusSelect) statusSelect.value = 'all';
            if (prioritySelect) prioritySelect.value = 'all';
            tasksPage.dataset.tasksAssignee = 'all';
            tasksPage.dataset.tasksDueFrom = '';
            tasksPage.dataset.tasksDueTo = '';
        }

        scopeButtons.forEach(function (button) {
            var selected = button === selectedButton;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-selected', selected ? 'true' : 'false');
            button.tabIndex = selected ? 0 : -1;
        });

        tasksPage.dataset.tasksScope = selectedButton.dataset.taskScope;
        if (emitEvent && selectedButton.dataset.taskScope === 'all') syncAdvancedForm(getFilterState());
        updateScopeIndicator();
        centerActiveScope(selectedButton);
        if (emitEvent) {
            document.dispatchEvent(new CustomEvent('tasks:scope-change', {
                detail: { scope: selectedButton.dataset.taskScope }
            }));
            emitFiltersChange('scope');
        }
    }

    function animateFiltersEntrance() {
        if (!filtersSection || !window.gsap || reducedMotion.matches) {
            tasksPage.dataset.tasksFiltersEntry = 'complete';
            return;
        }

        var targets = filtersSection.querySelectorAll('.task-scope-tab, .task-list-search, .task-filter-select, .task-more-filters');
        tasksPage.dataset.tasksFiltersEntry = 'running';
        window.gsap.fromTo(targets,
            { autoAlpha: 0, y: 9, filter: 'blur(4px)' },
            {
                autoAlpha: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.36,
                stagger: 0.045,
                delay: 0.34,
                ease: 'power3.out',
                clearProps: 'opacity,visibility,transform,filter',
                onComplete: function () { tasksPage.dataset.tasksFiltersEntry = 'complete'; }
            });
    }

    function animateTaskTableEntrance() {
        if (!taskTable || !taskRows.length || !window.gsap || reducedMotion.matches) {
            tasksPage.dataset.tasksTableEntry = 'complete';
            return;
        }

        var visibleRows = taskRows.filter(function (row) { return !row.hidden; });
        var progressBars = taskTable.querySelectorAll('.task-progress-track > span');
        tasksPage.dataset.tasksTableEntry = 'running';
        var timeline = window.gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () { tasksPage.dataset.tasksTableEntry = 'complete'; }
        });

        if (taskTableHeader) {
            timeline.fromTo(taskTableHeader,
                { autoAlpha: 0, y: 9, filter: 'blur(4px)' },
                { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.38, clearProps: 'opacity,visibility,transform,filter' },
                0.48);
        }
        timeline.fromTo(visibleRows,
            { autoAlpha: 0, y: 12, filter: 'blur(4px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.38, stagger: 0.055, clearProps: 'opacity,visibility,transform,filter' },
            0.58);
        timeline.fromTo(progressBars,
            { width: '0%' },
            {
                width: function (index, bar) {
                    return bar.style.getPropertyValue('--task-progress') || '0%';
                },
                duration: 0.64,
                stagger: 0.045,
                ease: 'power2.out',
                clearProps: 'width'
            },
            0.72);
    }

    if (!tasksPage || !metricsSection || !metricCards.length) return;

    tasksNamespace.updateMetrics = function (payload) {
        return updateMetrics(payload, 'runtime');
    };
    tasksNamespace.reloadMetrics = loadMetrics;
    tasksNamespace.getFilterState = getFilterState;
    tasksNamespace.getSelectedTaskIds = getSelectedTaskIds;
    tasksNamespace.applyFilters = function () {
        return applyTaskFilters(getFilterState(), 'runtime');
    };
    tasksNamespace.setCalendarMonth = function (year, month) {
        if (!calendarState || !Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return false;
        calendarState.year = year;
        calendarState.month = month - 1;
        return renderCalendar(0);
    };
    tasksNamespace.updateProgress = function (payload) {
        return updateProgress(payload, 'runtime');
    };
    tasksNamespace.updateUpcomingTasks = function (items) {
        return updateUpcomingTasks(items, 'runtime');
    };
    tasksNamespace.updatePagination = function (payload) {
        return updatePagination(payload, 'runtime');
    };

    scopeButtons.forEach(function (button, index) {
        button.addEventListener('click', function () {
            setTaskScope(button, true);
        });
        button.addEventListener('keydown', function (event) {
            var targetIndex = null;
            if (event.key === 'ArrowRight') targetIndex = (index + 1) % scopeButtons.length;
            if (event.key === 'ArrowLeft') targetIndex = (index - 1 + scopeButtons.length) % scopeButtons.length;
            if (event.key === 'Home') targetIndex = 0;
            if (event.key === 'End') targetIndex = scopeButtons.length - 1;
            if (targetIndex === null) return;
            event.preventDefault();
            setTaskScope(scopeButtons[targetIndex], true);
            scopeButtons[targetIndex].focus();
        });
    });

    metricsControls.forEach(function (button) {
        button.addEventListener('click', function () {
            shiftMetrics(button.dataset.taskMetricsDirection === 'next' ? 1 : -1, 'control');
        });
    });

    metricCards.forEach(function (card, index) {
        card.addEventListener('click', function () {
            if (metricsSuppressClick || index === activeMetricIndex) return;
            setActiveMetric(index, true, 'card');
        });
        card.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setActiveMetric(index, true, 'keyboard-card');
        });
    });

    if (metricsViewport) {
        metricsViewport.addEventListener('keydown', function (event) {
            var targetIndex = null;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                shiftMetrics(event.key === 'ArrowRight' ? 1 : -1, 'keyboard');
                return;
            }
            if (event.key === 'Home') targetIndex = 0;
            if (event.key === 'End') targetIndex = metricCards.length - 1;
            if (targetIndex === null) return;
            event.preventDefault();
            setActiveMetric(targetIndex, true, 'keyboard');
        });

        metricsViewport.addEventListener('pointerdown', function (event) {
            if (event.button !== undefined && event.button !== 0) return;
            metricsDrag.active = true;
            metricsDrag.pointerId = event.pointerId;
            metricsDrag.startX = event.clientX;
            metricsDrag.startOffset = metricsOffset;
            metricsDrag.moved = false;
            metricsViewport.classList.add('is-dragging');
            metricsViewport.setPointerCapture(event.pointerId);
            if (window.gsap) window.gsap.killTweensOf(metricsTrack);
        });

        metricsViewport.addEventListener('pointermove', function (event) {
            if (!metricsDrag.active || event.pointerId !== metricsDrag.pointerId) return;
            var delta = event.clientX - metricsDrag.startX;
            metricsDrag.moved = metricsDrag.moved || Math.abs(delta) > 6;
            moveMetricsTrack(metricsDrag.startOffset + delta, false);
        });

        function finishMetricsDrag(event) {
            if (!metricsDrag.active || event.pointerId !== metricsDrag.pointerId) return;
            var delta = event.clientX - metricsDrag.startX;
            metricsDrag.active = false;
            metricsViewport.classList.remove('is-dragging');
            if (metricsViewport.hasPointerCapture(event.pointerId)) metricsViewport.releasePointerCapture(event.pointerId);

            if (metricsDrag.moved) {
                metricsSuppressClick = true;
                window.setTimeout(function () { metricsSuppressClick = false; }, 0);
            }

            if (Math.abs(delta) >= 46) shiftMetrics(delta < 0 ? 1 : -1, 'drag');
            else setActiveMetric(activeMetricIndex, true, 'drag-snap');
        }

        metricsViewport.addEventListener('pointerup', finishMetricsDrag);
        metricsViewport.addEventListener('pointercancel', finishMetricsDrag);
    }

    window.addEventListener('resize', function () {
        window.clearTimeout(metricsResizeTimer);
        metricsResizeTimer = window.setTimeout(function () {
            setActiveMetric(activeMetricIndex, false, 'resize');
            updateScopeIndicator();
            updateScopeNavigation();
            if (taskContextMenu && !taskContextMenu.hidden) positionTaskContextMenu(activeTaskMenuTrigger);
        }, 120);
    });

    if (scopeTabs) {
        scopeTabs.addEventListener('scroll', updateScopeNavigation, { passive: true });
    }
    scopeArrows.forEach(function (button) {
        button.addEventListener('click', function () {
            if (!scopeTabs) return;
            var direction = button.dataset.taskScopeDirection === 'next' ? 1 : -1;
            scopeTabs.scrollBy({ left: direction * Math.max(150, scopeTabs.clientWidth * .68), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
            window.setTimeout(updateScopeNavigation, reducedMotion.matches ? 0 : 340);
        });
    });

    if (listSearchInput) {
        listSearchInput.addEventListener('input', function () {
            if (headerSearchInput && headerSearchInput.value !== listSearchInput.value) headerSearchInput.value = listSearchInput.value;
            window.clearTimeout(filterInputTimer);
            filterInputTimer = window.setTimeout(function () {
                emitFiltersChange('search');
            }, 220);
        });
    }

    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', function () {
            if (listSearchInput) listSearchInput.value = headerSearchInput.value;
            window.clearTimeout(filterInputTimer);
            filterInputTimer = window.setTimeout(function () {
                emitFiltersChange('header-search');
            }, 220);
        });
    }

    [projectSelect, statusSelect, prioritySelect].forEach(function (select) {
        if (!select) return;
        select.addEventListener('change', function () {
            emitFiltersChange(select.dataset.taskFilterProject !== undefined
                ? 'project'
                : select.dataset.taskFilterStatus !== undefined ? 'status' : 'priority');
        });
    });

    if (moreFiltersButton) {
        moreFiltersButton.addEventListener('click', function () {
            document.dispatchEvent(new CustomEvent('tasks:more-filters-request', {
                detail: { filters: getFilterState() }
            }));
            if (window.gsap && !reducedMotion.matches) {
                window.gsap.fromTo(moreFiltersButton,
                    { scale: 0.96 },
                    { scale: 1, duration: 0.28, ease: 'back.out(1.7)', clearProps: 'transform', overwrite: true });
            }
            openAdvancedFilters();
        });
    }

    if (activeFiltersContainer) {
        activeFiltersContainer.addEventListener('click', function (event) {
            var chip = event.target.closest('[data-task-remove-filter]');
            if (chip) clearTaskFilter(chip.dataset.taskRemoveFilter);
        });
    }
    if (clearFiltersButton) clearFiltersButton.addEventListener('click', resetTaskFilters);
    if (sortSelect) sortSelect.addEventListener('change', function () { emitFiltersChange('sort'); });
    viewButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var view = button.dataset.taskView;
            tasksPage.dataset.tasksView = view;
            if (filtersSection) filtersSection.dataset.taskViewMode = view;
            viewButtons.forEach(function (item) {
                var active = item === button;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            document.dispatchEvent(new CustomEvent('tasks:view-change', { detail: { view: view, filters: getFilterState() } }));
        });
    });

    if (headerFiltersButton) headerFiltersButton.addEventListener('click', openAdvancedFilters);
    advancedFilterCloseButtons.forEach(function (button) { button.addEventListener('click', closeAdvancedFilters); });

    if (advancedFilterForm) {
        advancedFilterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyAdvancedFilterForm();
            document.dispatchEvent(new CustomEvent('tasks:advanced-filter-change', { detail: { filters: getFilterState() } }));
            closeAdvancedFilters();
        });

        advancedFilterForm.addEventListener('reset', function () {
            window.setTimeout(function () {
                var allScope = scopeButtons.find(function (button) { return button.dataset.taskScope === 'all'; });
                if (allScope) setTaskScope(allScope, false);
                if (projectSelect) projectSelect.value = 'all';
                if (statusSelect) statusSelect.value = 'all';
                if (prioritySelect) prioritySelect.value = 'all';
                tasksPage.dataset.tasksAssignee = 'all';
                tasksPage.dataset.tasksDueFrom = '';
                tasksPage.dataset.tasksDueTo = '';
                if (listSearchInput) listSearchInput.value = '';
                if (headerSearchInput) headerSearchInput.value = '';
                emitFiltersChange('advanced-reset');
                syncAdvancedForm();
            }, 0);
        });

        advancedFilterPanel.addEventListener('keydown', function (event) {
            if (event.key !== 'Tab') return;
            var focusable = Array.prototype.slice.call(advancedFilterPanel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])'));
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    function closeTaskContextMenu(restoreFocus) {
        if (!taskContextMenu || taskContextMenu.hidden) return;
        var finish = function () {
            taskContextMenu.hidden = true;
            if (taskContextBackdrop) taskContextBackdrop.hidden = true;
            taskContextMenu.querySelectorAll('[data-task-submenu]').forEach(function (submenu) { submenu.hidden = true; });
            taskContextMenu.querySelectorAll('[data-task-menu-expand]').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
            if (restoreFocus !== false && activeTaskMenuTrigger) activeTaskMenuTrigger.focus({ preventScroll: true });
            activeTaskMenuRow = null;
            activeTaskMenuTrigger = null;
        };
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.to(taskContextMenu, { autoAlpha: 0, y: window.innerWidth <= 640 ? 18 : -5, scale: .98, duration: .16, ease: 'power2.in', overwrite: true, onComplete: finish });
        } else finish();
    }

    function positionTaskContextMenu(trigger) {
        if (!taskContextMenu || !trigger || window.innerWidth <= 640) return;
        var rect = trigger.getBoundingClientRect();
        var menuWidth = taskContextMenu.offsetWidth;
        var menuHeight = taskContextMenu.offsetHeight;
        var left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, rect.right - menuWidth));
        var top = rect.bottom + menuHeight + 8 <= window.innerHeight ? rect.bottom + 6 : Math.max(12, rect.top - menuHeight - 6);
        taskContextMenu.style.setProperty('--task-menu-left', left + 'px');
        taskContextMenu.style.setProperty('--task-menu-top', top + 'px');
    }

    function openTaskContextMenu(row, trigger) {
        if (!taskContextMenu || !row || !trigger) return;
        if (taskContextBackdrop && taskContextBackdrop.parentElement !== document.body) document.body.appendChild(taskContextBackdrop);
        if (taskContextMenu.parentElement !== document.body) document.body.appendChild(taskContextMenu);
        activeTaskMenuRow = row;
        activeTaskMenuTrigger = trigger;
        applyMenuPermissions(row);
        var title = row.querySelector('.task-copy h3');
        var project = row.querySelector('.task-table-cell--project span');
        if (taskContextTitle) taskContextTitle.textContent = title ? title.textContent : 'Tarea';
        if (taskContextProject) taskContextProject.textContent = project ? project.textContent : 'Proyecto';
        taskContextMenu.hidden = false;
        if (taskContextBackdrop) taskContextBackdrop.hidden = false;
        positionTaskContextMenu(trigger);
        var firstAction = taskContextMenu.querySelector('[role="menuitem"]');
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.fromTo(taskContextMenu,
                { autoAlpha: 0, y: window.innerWidth <= 640 ? 24 : -7, scale: .975 },
                { autoAlpha: 1, y: 0, scale: 1, duration: .24, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
        }
        if (firstAction) firstAction.focus({ preventScroll: true });
        document.dispatchEvent(new CustomEvent('tasks:row-menu-request', { detail: { taskId: row.dataset.taskId } }));
    }

    function applyTaskMenuFallback(row, action, value) {
        if (!row) return;
        if (action === 'change-status') {
            var statusLabels = { pending: 'Pendiente', 'in-progress': 'En progreso', review: 'En revisión', blocked: 'Bloqueada', completed: 'Completada' };
            var statusLabel = row.querySelector('.task-table-cell--status > span');
            row.dataset.taskStatus = value;
            if (statusLabel) statusLabel.textContent = statusLabels[value] || value;
            if (value === 'completed') {
                var bar = row.querySelector('.task-progress-track');
                var fill = bar && bar.querySelector('span');
                var amount = row.querySelector('.task-progress strong');
                if (bar) bar.setAttribute('aria-valuenow', '100');
                if (fill) fill.style.setProperty('--task-progress', '100%');
                if (amount) amount.textContent = '100%';
            }
        }
        if (action === 'change-priority') {
            var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
            var badge = row.querySelector('.task-priority');
            row.dataset.taskPriority = value;
            if (badge) {
                badge.className = 'task-priority task-priority--' + value;
                badge.textContent = priorityLabels[value] || value;
            }
        }
        renderCalendar(0);
        refreshUpcomingFromRows();
        if (row.querySelector('[data-task-select]:checked')) syncSelectedTaskContext(row);
    }

    function getRowSnapshot(row) {
        var bar = row.querySelector('.task-progress-track');
        return { status: row.dataset.taskStatus, priority: row.dataset.taskPriority, progress: bar ? bar.getAttribute('aria-valuenow') : '0' };
    }

    function restoreRowSnapshot(row, snapshot) {
        if (!row || !snapshot) return;
        applyTaskMenuFallback(row, 'change-status', snapshot.status);
        applyTaskMenuFallback(row, 'change-priority', snapshot.priority);
        var bar = row.querySelector('.task-progress-track');
        var fill = bar && bar.querySelector('span');
        var amount = row.querySelector('.task-progress strong');
        if (bar) bar.setAttribute('aria-valuenow', snapshot.progress);
        if (fill) fill.style.setProperty('--task-progress', snapshot.progress + '%');
        if (amount) amount.textContent = snapshot.progress + '%';
    }

    function applyMenuPermissions(row) {
        var permissions = { view: true, edit: true, delete: true, archive: true, reassign: true };
        if (row.dataset.taskPermissions) {
            try { permissions = Object.assign(permissions, JSON.parse(row.dataset.taskPermissions)); } catch (error) { /* El fallback conserva permisos locales. */ }
        }
        taskContextMenu.querySelectorAll('[data-task-action]').forEach(function (button) {
            var action = button.dataset.taskAction;
            var key = action === 'delete' ? 'delete' : action === 'archive' ? 'archive' : action === 'reassign' ? 'reassign' : action === 'view' ? 'view' : 'edit';
            button.hidden = permissions[key] === false;
        });
    }

    function getTaskDetailData(row) {
        var title = row && row.querySelector('.task-copy h3');
        var description = row && row.querySelector('.task-copy p');
        var project = row && row.querySelector('.task-table-cell--project span');
        var assignee = row && row.querySelector('.task-table-cell--assignee span');
        var due = row && row.querySelector('time[datetime]');
        var progress = row && row.querySelector('.task-progress-track[role="progressbar"]');
        var status = row && row.querySelector('.task-table-cell--status > span');
        return {
            id: row ? row.dataset.taskId : '',
            title: title ? title.textContent : 'Tarea',
            description: description ? description.textContent : 'Sin descripción.',
            project: project ? project.textContent : 'Proyecto',
            assignee: assignee ? assignee.textContent : 'Sin asignar',
            priority: row ? row.dataset.taskPriority || 'medium' : 'medium',
            status: status ? status.textContent : 'Pendiente',
            due: due ? due.textContent : 'Sin fecha',
            progress: progress ? Number(progress.getAttribute('aria-valuenow')) || 0 : 0
        };
    }

    function renderTaskDetailSubtasks(data) {
        if (!taskDetailSubtasks) return;
        var labels = [
            'Revisar requisitos de ' + data.project,
            'Completar implementación principal',
            'Validar entrega y criterios de aceptación'
        ];
        var completed = Math.min(labels.length, Math.floor(data.progress / 34));
        var fragment = document.createDocumentFragment();
        labels.forEach(function (label, index) {
            var item = document.createElement('label');
            var checkbox = document.createElement('input');
            var text = document.createElement('span');
            item.className = 'task-detail-subtask';
            checkbox.type = 'checkbox';
            checkbox.checked = index < completed;
            checkbox.dataset.taskDetailSubtask = String(index + 1);
            text.textContent = label;
            item.append(checkbox, text);
            fragment.appendChild(item);
        });
        taskDetailSubtasks.replaceChildren(fragment);
        if (taskDetailSubtaskCount) taskDetailSubtaskCount.textContent = completed + ' de ' + labels.length;
    }

    function renderTaskDetailComments(taskId) {
        if (!taskDetailComments) return;
        var comments = taskDetailCommentsStore[taskId] || [];
        var fragment = document.createDocumentFragment();
        if (!comments.length) {
            var empty = document.createElement('p');
            empty.textContent = 'Aún no hay comentarios.';
            fragment.appendChild(empty);
        } else {
            comments.forEach(function (comment) {
                var article = document.createElement('article');
                var author = document.createElement('strong');
                var text = document.createElement('p');
                article.className = 'task-detail-comment';
                author.textContent = comment.author;
                text.textContent = comment.text;
                article.append(author, text);
                fragment.appendChild(article);
            });
        }
        taskDetailComments.replaceChildren(fragment);
        if (taskDetailCommentCount) taskDetailCommentCount.textContent = String(comments.length);
    }

    function closeTaskDetail() {
        if (!taskDetail || taskDetail.hidden) return;
        var finish = function () {
            taskDetail.hidden = true;
            if (taskDetailBackdrop) taskDetailBackdrop.hidden = true;
            document.body.classList.remove('task-detail-open');
            activeDetailRow = null;
            if (taskDetailLastFocus && taskDetailLastFocus.focus) taskDetailLastFocus.focus({ preventScroll: true });
        };
        if (window.gsap && !reducedMotion.matches) window.gsap.to(taskDetail, { x: 28, autoAlpha: 0, duration: .2, ease: 'power2.in', onComplete: finish });
        else finish();
    }

    function openTaskDetail(row) {
        if (!taskDetail || !row) return;
        var data = getTaskDetailData(row);
        taskDetailLastFocus = document.activeElement;
        activeDetailRow = row;
        taskDetail.dataset.taskId = data.id;
        taskDetail.dataset.taskStatus = row.dataset.taskStatus || 'pending';
        taskDetailTitle.textContent = data.title;
        taskDetailProject.textContent = data.project;
        taskDetailAssignee.textContent = data.assignee;
        taskDetailPriority.textContent = data.priority === 'high' ? 'Alta' : data.priority === 'low' ? 'Baja' : 'Media';
        taskDetailPriority.className = 'task-priority task-priority--' + data.priority;
        taskDetailStatus.textContent = data.status;
        taskDetailDue.textContent = data.due;
        taskDetailDescription.textContent = data.description;
        if (taskDetailDependency) {
            var dependencyTitle = taskDetailDependency.querySelector('strong');
            var dependencyCaption = taskDetailDependency.querySelector('small');
            if (dependencyTitle) dependencyTitle.textContent = row.dataset.taskStatus === 'blocked' ? 'Tarea bloqueada' : row.dataset.taskStatus === 'completed' ? 'Flujo completado' : 'Sin bloqueos activos';
            if (dependencyCaption) dependencyCaption.textContent = row.dataset.taskStatus === 'blocked' ? 'Revisa dependencias o solicita ayuda' : row.dataset.taskStatus === 'completed' ? 'No requiere acciones adicionales' : 'Lista para continuar';
        }
        taskDetailProgressValue.textContent = data.progress + '%';
        taskDetailProgress.setAttribute('aria-valuenow', String(data.progress));
        taskDetailProgress.querySelector('span').style.width = data.progress + '%';
        taskDetailComplete.disabled = row.dataset.taskStatus === 'completed';
        taskDetailComplete.textContent = row.dataset.taskStatus === 'completed' ? '✓ Completada' : '✓ Marcar completada';
        renderTaskDetailSubtasks(data);
        renderTaskDetailComments(data.id);
        taskDetail.hidden = false;
        if (taskDetailBackdrop) taskDetailBackdrop.hidden = false;
        document.body.classList.add('task-detail-open');
        if (window.gsap && !reducedMotion.matches) window.gsap.fromTo(taskDetail, { x: 34, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .34, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
        var close = taskDetail.querySelector('[data-task-detail-close]');
        if (close) close.focus({ preventScroll: true });
        document.dispatchEvent(new CustomEvent('tasks:detail-open', { detail: { taskId: data.id } }));
    }

    function closeTaskEditor() {
        if (!taskEditor || taskEditor.hidden) return;
        taskEditor.hidden = true;
        if (taskEditorBackdrop) taskEditorBackdrop.hidden = true;
        taskEditor.classList.remove('is-saving');
        activeEditorRow = null;
    }

    function openTaskEditor(mode, row) {
        if (!taskEditor || !taskEditorForm) return;
        activeEditorRow = row || null;
        taskEditor.dataset.taskEditorMode = mode;
        taskEditorForm.reset();
        var title = row && row.querySelector('.task-copy h3');
        var description = row && row.querySelector('.task-copy p');
        var due = row && row.querySelector('time[datetime]');
        taskEditorForm.elements.taskId.value = row ? row.dataset.taskId : '';
        taskEditorForm.elements.title.value = title ? title.textContent : '';
        taskEditorForm.elements.description.value = description ? description.textContent : '';
        taskEditorForm.elements.status.value = row ? row.dataset.taskStatus : 'pending';
        taskEditorForm.elements.priority.value = row ? row.dataset.taskPriority : 'medium';
        taskEditorForm.elements.assignee.value = row ? row.dataset.taskOwner : 'josue-islas';
        taskEditorForm.elements.dueDate.value = due ? due.dateTime : '';
        if (taskEditorMessage) taskEditorMessage.textContent = mode === 'delete' ? 'Esta acción requiere confirmación y no podrá deshacerse en el servidor.' : '';
        if (taskEditorTitle) taskEditorTitle.textContent = mode === 'create' ? 'Nueva tarea' : mode === 'delete' ? 'Eliminar tarea' : mode === 'view' ? 'Detalles de la tarea' : 'Editar tarea';
        if (taskEditorSubmit) { taskEditorSubmit.hidden = mode === 'view'; taskEditorSubmit.textContent = mode === 'create' ? 'Crear tarea' : mode === 'delete' ? 'Eliminar definitivamente' : 'Guardar cambios'; }
        Array.prototype.forEach.call(taskEditorForm.elements, function (field) { if (field.name && field.name !== 'taskId') field.disabled = mode === 'view'; });
        taskEditor.hidden = false;
        if (taskEditorBackdrop) taskEditorBackdrop.hidden = false;
        var first = taskEditor.querySelector('input:not([type="hidden"]), button');
        if (first) first.focus({ preventScroll: true });
    }

    function applyEditorFallback(row, payload) {
        if (!row) return;
        var title = row.querySelector('.task-copy h3');
        var description = row.querySelector('.task-copy p');
        var due = row.querySelector('time[datetime]');
        if (title) title.textContent = payload.title;
        if (description) description.textContent = payload.description;
        if (due && payload.dueDate) { due.dateTime = payload.dueDate; due.textContent = formatTaskDueDate(payload.dueDate); }
        row.dataset.taskOwner = payload.assignee;
        applyTaskMenuFallback(row, 'change-status', payload.status);
        applyTaskMenuFallback(row, 'change-priority', payload.priority);
    }

    if (taskContextMenu) {
        taskContextMenu.addEventListener('click', function (event) {
            var expander = event.target.closest('[data-task-menu-expand]');
            if (expander) {
                var name = expander.dataset.taskMenuExpand;
                var submenu = taskContextMenu.querySelector('[data-task-submenu="' + name + '"]');
                var open = expander.getAttribute('aria-expanded') !== 'true';
                expander.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (submenu) submenu.hidden = !open;
                positionTaskContextMenu(activeTaskMenuTrigger);
                return;
            }
            var actionButton = event.target.closest('[data-task-action]');
            if (!actionButton || !activeTaskMenuRow) return;
            var action = actionButton.dataset.taskAction;
            var value = actionButton.dataset.taskActionValue || null;
            var actionRow = activeTaskMenuRow;
            var editorModes = { edit: 'edit', reassign: 'edit', 'change-due-date': 'edit', delete: 'delete' };
            document.dispatchEvent(new CustomEvent('tasks:action-request', {
                detail: { taskId: actionRow.dataset.taskId, action: action, value: value }
            }));
            if (action === 'view') {
                closeTaskContextMenu(false);
                openTaskDetail(actionRow);
                return;
            }
            if (editorModes[action]) {
                closeTaskContextMenu(false);
                openTaskEditor(editorModes[action], actionRow);
                return;
            }
            var snapshot = getRowSnapshot(actionRow);
            applyTaskMenuFallback(actionRow, action, value);
            if (tasksApi) {
                tasksApi.action(actionRow.dataset.taskId, action, value).then(function (payload) {
                    if (payload && payload.item) loadTaskList('action-success');
                }).catch(function (error) {
                    restoreRowSnapshot(actionRow, snapshot);
                    setTaskListState('error', error.message || 'No se pudo guardar el cambio; restauramos el valor anterior.');
                });
            }
            if (taskMenuFeedback) taskMenuFeedback.textContent = 'Acción ' + action + ' solicitada';
            closeTaskContextMenu(false);
        });
    }
    taskContextCloseButtons.forEach(function (button) { button.addEventListener('click', function () { closeTaskContextMenu(true); }); });
    taskEditorCloseButtons.forEach(function (button) { button.addEventListener('click', closeTaskEditor); });
    taskDetailCloseButtons.forEach(function (button) { button.addEventListener('click', closeTaskDetail); });
    if (taskDetailEdit) taskDetailEdit.addEventListener('click', function () {
        var row = activeDetailRow;
        closeTaskDetail();
        if (row) openTaskEditor('edit', row);
    });
    if (taskDetailComplete) taskDetailComplete.addEventListener('click', function () {
        if (!activeDetailRow || activeDetailRow.dataset.taskStatus === 'completed') return;
        var row = activeDetailRow;
        var snapshot = getRowSnapshot(row);
        applyTaskMenuFallback(row, 'change-status', 'completed');
        openTaskDetail(row);
        if (tasksApi) tasksApi.action(row.dataset.taskId, 'change-status', 'completed').catch(function (error) {
            restoreRowSnapshot(row, snapshot);
            openTaskDetail(row);
            setTaskListState('error', error.message || 'No se pudo completar la tarea; restauramos el estado anterior.');
        });
    });
    if (taskDetailSubtasks) taskDetailSubtasks.addEventListener('change', function () {
        var checks = Array.prototype.slice.call(taskDetailSubtasks.querySelectorAll('input[type="checkbox"]'));
        var completed = checks.filter(function (checkbox) { return checkbox.checked; }).length;
        if (taskDetailSubtaskCount) taskDetailSubtaskCount.textContent = completed + ' de ' + checks.length;
        document.dispatchEvent(new CustomEvent('tasks:subtasks-change', { detail: { taskId: taskDetail.dataset.taskId, completed: completed, total: checks.length } }));
    });
    if (taskDetailAddSubtask) taskDetailAddSubtask.addEventListener('click', function () {
        var label = document.createElement('label');
        var checkbox = document.createElement('input');
        var text = document.createElement('span');
        label.className = 'task-detail-subtask';
        checkbox.type = 'checkbox';
        text.textContent = 'Nueva subtarea pendiente';
        label.append(checkbox, text);
        taskDetailSubtasks.appendChild(label);
        var checks = taskDetailSubtasks.querySelectorAll('input[type="checkbox"]');
        if (taskDetailSubtaskCount) taskDetailSubtaskCount.textContent = '0 de ' + checks.length;
    });
    if (taskDetailCommentForm) taskDetailCommentForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!activeDetailRow) return;
        var field = taskDetailCommentForm.elements.comment;
        var text = String(field.value || '').trim();
        if (!text) return;
        var taskId = activeDetailRow.dataset.taskId;
        taskDetailCommentsStore[taskId] = taskDetailCommentsStore[taskId] || [];
        taskDetailCommentsStore[taskId].push({ author: 'Josue Islas', text: text });
        field.value = '';
        renderTaskDetailComments(taskId);
        document.dispatchEvent(new CustomEvent('tasks:comment-create', { detail: { taskId: taskId, comment: text } }));
    });
    var createTaskButton = document.querySelector('[data-task-create-open]');
    if (createTaskButton) createTaskButton.addEventListener('click', function () { openTaskEditor('create', null); });
    if (taskListRetry) taskListRetry.addEventListener('click', function () { loadTaskList('retry'); });

    if (taskEditorForm) {
        taskEditorForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var mode = taskEditor.dataset.taskEditorMode;
            var data = new FormData(taskEditorForm);
            var payload = {
                title: String(data.get('title') || '').trim(),
                description: String(data.get('description') || '').trim(),
                status: String(data.get('status') || 'pending'),
                priority: String(data.get('priority') || 'medium'),
                assignee: String(data.get('assignee') || ''),
                dueDate: String(data.get('dueDate') || '')
            };
            var taskId = activeEditorRow ? activeEditorRow.dataset.taskId : '';
            taskEditor.classList.add('is-saving');
            if (taskEditorMessage) taskEditorMessage.textContent = '';

            if (mode === 'delete') {
                tasksApi.action(taskId, 'delete', null).then(function (result) {
                    if (!result) {
                        taskEditor.classList.remove('is-saving');
                        taskEditorMessage.textContent = 'Configura data-tasks-action-api para eliminar en el servidor.';
                        return;
                    }
                    closeTaskEditor();
                    loadTaskList('delete');
                }).catch(function (error) {
                    taskEditor.classList.remove('is-saving');
                    taskEditorMessage.textContent = error.message;
                });
                return;
            }

            tasksApi.save(taskId, payload).then(function (result) {
                if (!result) {
                    if (activeEditorRow) {
                        applyEditorFallback(activeEditorRow, payload);
                        closeTaskEditor();
                    } else {
                        taskEditor.classList.remove('is-saving');
                        taskEditorMessage.textContent = 'Configura data-tasks-list-api para crear tareas persistentes.';
                    }
                    return;
                }
                closeTaskEditor();
                loadTaskList(mode === 'create' ? 'create' : 'edit');
            }).catch(function (error) {
                taskEditor.classList.remove('is-saving');
                taskEditorMessage.textContent = error.message;
            });
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && advancedFilterPanel && !advancedFilterPanel.hidden) closeAdvancedFilters();
        if (event.key === 'Escape' && taskContextMenu && !taskContextMenu.hidden) closeTaskContextMenu(true);
        if (event.key === 'Escape' && taskEditor && !taskEditor.hidden) closeTaskEditor();
        if (event.key === 'Escape' && taskDetail && !taskDetail.hidden) closeTaskDetail();
    });

    function bindTaskRow(row) {
        if (!row || row.dataset.taskEventsBound === 'true') return;
        row.dataset.taskEventsBound = 'true';
        var checkbox = row.querySelector('[data-task-select]');
        var menuButton = row.querySelector('[data-task-row-menu]');
        row.tabIndex = 0;

        if (checkbox) {
            checkbox.addEventListener('change', function () {
                syncTaskSelection(true, row);
            });
        }
        row.addEventListener('click', function (event) {
            if (event.target.closest('input, button, a, select')) return;
            toggleTaskRow(row);
        });
        row.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (event.target !== row) return;
            event.preventDefault();
            toggleTaskRow(row);
        });
        row.addEventListener('dblclick', function (event) {
            if (event.target.closest('input, button, a, select')) return;
            openTaskDetail(row);
        });
        if (menuButton) {
            menuButton.addEventListener('click', function () {
                if (activeTaskMenuRow === row && taskContextMenu && !taskContextMenu.hidden) closeTaskContextMenu(true);
                else openTaskContextMenu(row, menuButton);
            });
        }
    }

    taskRows.forEach(bindTaskRow);

    if (selectAllTasks) {
        selectAllTasks.addEventListener('change', function () {
            taskRows.forEach(function (row) {
                if (row.hidden) return;
                var checkbox = row.querySelector('[data-task-select]');
                if (checkbox) checkbox.checked = selectAllTasks.checked;
            });
            syncTaskSelection(true, selectAllTasks.checked ? taskRows.find(function (row) { return !row.hidden; }) : null);
        });
    }

    calendarButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            changeCalendarMonth(button.dataset.calendarDirection === 'next' ? 1 : -1);
        });
    });

    if (calendarTodayButton) {
        calendarTodayButton.addEventListener('click', function () {
            var today = new Date();
            calendarState.year = today.getFullYear();
            calendarState.month = today.getMonth();
            calendarState.selected = formatCalendarDate(today.getFullYear(), today.getMonth(), today.getDate());
            taskCalendar.dataset.calendarSelected = calendarState.selected;
            renderCalendar(0);
        });
    }

    if (calendarGrid) {
        calendarGrid.addEventListener('click', function (event) {
            var dayButton = event.target.closest('[data-calendar-date]');
            if (!dayButton) return;
            calendarState.selected = dayButton.dataset.calendarDate;
            taskCalendar.dataset.calendarSelected = calendarState.selected;
            renderCalendar(0);
            document.dispatchEvent(new CustomEvent('tasks:calendar-date-select', {
                detail: { date: calendarState.selected }
            }));
        });
    }

    if (taskUpcomingList) {
        taskUpcomingList.addEventListener('click', function (event) {
            var item = event.target.closest('[data-upcoming-task]');
            if (!item) return;
            var row = taskRows.find(function (candidate) { return candidate.dataset.taskId === item.dataset.taskId; });
            if (!row) return;
            taskRows.forEach(function (candidate) {
                var checkbox = candidate.querySelector('[data-task-select]');
                if (checkbox) checkbox.checked = candidate === row;
            });
            taskUpcomingList.querySelectorAll('[data-upcoming-task]').forEach(function (candidate) {
                candidate.classList.toggle('is-selected', candidate === item);
            });
            syncTaskSelection(true, row);
            row.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
        });
    }

    if (progressUpdateButton) {
        progressUpdateButton.addEventListener('click', function () {
            var focusedId = tasksPage.dataset.tasksFocusedId;
            var row = taskRows.find(function (candidate) { return candidate.dataset.taskId === focusedId; });
            if (row) openTaskEditor('edit', row);
            else document.dispatchEvent(new CustomEvent('tasks:progress-update-request'));
        });
    }

    panelToggles.forEach(function (toggle) {
        toggle.classList.add('task-side-toggle');
        toggle.addEventListener('click', function () {
            var content = document.querySelector('[data-task-panel-content="' + toggle.dataset.taskPanelToggle + '"]');
            if (!content) return;
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            toggle.setAttribute('aria-label', (expanded ? 'Expandir ' : 'Contraer ') + toggle.dataset.taskPanelToggle);
            content.hidden = expanded;
        });
    });

    if (taskUpcomingAll) {
        taskUpcomingAll.addEventListener('click', function () {
            document.dispatchEvent(new CustomEvent('tasks:upcoming-all-request'));
        });
    }

    if (taskPagination) {
        taskPagination.addEventListener('click', function (event) {
            var button = event.target.closest('[data-task-page]');
            if (!button || button.disabled) return;
            requestTaskPage(button.dataset.taskPage);
        });
    }
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function () {
            var limit = Number(pageSizeSelect.value);
            if (!Number.isInteger(limit) || limit < 1) return;
            updatePagination({ current: 1, pageSize: limit, total: paginationState.total }, 'page-size');
            var url = new URL(window.location.href);
            url.searchParams.set('page', '1');
            url.searchParams.set('limit', String(limit));
            window.history.replaceState(null, '', url);
            document.dispatchEvent(new CustomEvent('tasks:page-size-change', { detail: { page: 1, limit: limit, filters: getFilterState() } }));
            if (listEndpoint) loadTaskList('page-size');
        });
    }

    tasksPage.dataset.tasksMetricsSource = summaryEndpoint ? 'loading' : 'fallback';
    var initialUrl = new URL(window.location.href);
    var initialRequestedTaskId = initialUrl.searchParams.get('task') || '';
    var initialCreateRequest = initialUrl.searchParams.get('create') === '1';
    var initialPage = Number(initialUrl.searchParams.get('page')) || 1;
    var initialLimit = Number(initialUrl.searchParams.get('limit')) || paginationState.pageSize;
    var initialScope = initialUrl.searchParams.get('scope') || 'all';
    var initialView = initialUrl.searchParams.get('view') === 'cards' ? 'cards' : 'table';
    if (listSearchInput) listSearchInput.value = initialUrl.searchParams.get('query') || '';
    if (headerSearchInput) headerSearchInput.value = listSearchInput ? listSearchInput.value : '';
    if (projectSelect && initialUrl.searchParams.get('project')) projectSelect.value = initialUrl.searchParams.get('project');
    if (statusSelect && initialUrl.searchParams.get('status')) statusSelect.value = initialUrl.searchParams.get('status');
    if (prioritySelect && initialUrl.searchParams.get('priority')) prioritySelect.value = initialUrl.searchParams.get('priority');
    if (sortSelect && initialUrl.searchParams.get('sort')) sortSelect.value = initialUrl.searchParams.get('sort');
    tasksPage.dataset.tasksAssignee = initialUrl.searchParams.get('assignee') || 'all';
    tasksPage.dataset.tasksDueFrom = initialUrl.searchParams.get('dueFrom') || '';
    tasksPage.dataset.tasksDueTo = initialUrl.searchParams.get('dueTo') || '';
    tasksPage.dataset.tasksView = initialView;
    updatePagination({ current: initialPage, pageSize: initialLimit, total: paginationState.total }, 'fallback');
    buildMetricsPagination();
    setActiveMetric(activeMetricIndex, false, 'initial');
    updateScopeCounts();
    setTaskScope(scopeButtons.find(function (button) { return button.dataset.taskScope === initialScope; }) || scopeButtons[0], false);
    window.setTimeout(function () {
        updateScopeIndicator();
        updateScopeNavigation();
    }, 0);
    if (filtersSection) filtersSection.dataset.taskViewMode = initialView;
    viewButtons.forEach(function (button) {
        var selectedView = button.dataset.taskView === initialView;
        button.classList.toggle('is-active', selectedView);
        button.setAttribute('aria-pressed', selectedView ? 'true' : 'false');
    });
    syncAdvancedForm(getFilterState());
    emitFiltersChange('initial');
    animateMetricsEntrance();
    animateFiltersEntrance();
    animateTaskTableEntrance();
    renderCalendar(0);
    refreshUpcomingFromRows();
    animateProgressEntrance();
    animateUpcomingEntrance();
    if (initialRequestedTaskId) {
        var requestedRow = taskRows.find(function (row) { return row.dataset.taskId === initialRequestedTaskId; });
        if (requestedRow) openTaskDetail(requestedRow);
    } else if (initialCreateRequest) openTaskEditor('create', null);
    document.dispatchEvent(new CustomEvent('tasks:metrics-ready', {
        detail: { source: summaryEndpoint ? 'loading' : 'fallback' }
    }));
    loadMetrics();
})();
