/**
 * COORDINADOR DE LA VISTA PROYECTOS
 * ---------------------------------
 * Este archivo conecta el HTML de proyectos.html con datos, filtros, tarjetas,
 * panel de detalles y animaciones. No contiene acceso directo a base de datos.
 *
 * GUÍA DE NAVEGACIÓN
 *  1. Referencias/estado y glow reactivo.
 *  2. Actualización dinámica de métricas, equipo, progreso y etiquetas.
 *  3. Carrusel central de métricas (botones, teclado, clic y swipe).
 *  4. Búsqueda, filtros rápidos/avanzados, conteos y ordenamiento.
 *  5. Acciones de tarjeta, toast y menú de acciones rápidas.
 *  6. Sincronización tarjeta seleccionada -> panel Detalles del proyecto.
 *  7. Timeline GSAP de presentación, responsive y listeners globales.
 *
 * FUENTES DE DATOS
 *  - HTML estático: fallback visible sin backend.
 *  - data-projects-summary-api: métricas y tarjetas.
 *  - TechNovaProjectsApi: búsqueda y filtros remotos.
 *
 * EVENTOS PÚBLICOS
 *  projects:search-change, projects:filter-change, projects:view-change,
 *  projects:selection-change, projects:card-action y projects:quick-action.
 * Las integraciones futuras deben escuchar esos eventos, no duplicar listeners.
 */
(function () {
    var viewport = document.querySelector('[data-metrics-viewport]');
    var controls = document.querySelectorAll('[data-metrics-direction]');
    var metricsTrack = viewport && viewport.querySelector('.project-metrics-track');
    var metricCards = viewport ? Array.prototype.slice.call(viewport.querySelectorAll('.project-metric-card')) : [];
    var metricsPagination = document.querySelector('[data-metrics-pagination]');
    var metricsCounter = document.querySelector('[data-metrics-counter]');
    var projectsPage = document.querySelector('.projects-page');
    var navbar = document.getElementById('dashboard-navbar');
    var navbarToggle = navbar ? navbar.querySelector('.menu-toggle') : null;
    var navbarLogo = navbar ? navbar.querySelector('.logo') : null;
    var navbarItems = navbar ? Array.prototype.slice.call(navbar.querySelectorAll('.div > .div-2')) : [];
    var navbarProfile = navbar ? navbar.querySelector('.column-2 .row') : null;
    var navbarLogout = navbar ? navbar.querySelector('.column-2 .row-2') : null;
    var filterButtons = document.querySelectorAll('[data-project-filter]');
    var filterStrip = document.querySelector('[data-project-filter-strip]');
    var filterScrollButtons = document.querySelectorAll('[data-filter-scroll]');
    var viewButtons = document.querySelectorAll('[data-project-view]');
    var projectCards = document.querySelectorAll('[data-project-id]');
    var projectResults = document.querySelector('[data-project-results]');
    var projectSearchInput = document.querySelector('[data-project-search]');
    var advancedFilterOpenButton = document.querySelector('[data-advanced-filter-open]');
    var advancedFilterPanel = document.querySelector('[data-advanced-filter-panel]');
    var advancedFilterForm = document.querySelector('[data-advanced-filter-form]');
    var advancedFilterCloseButtons = document.querySelectorAll('[data-advanced-filter-close]');
    var advancedFilterBadge = document.querySelector('[data-advanced-filter-count]');
    var advancedFilterLastFocus = null;
    var emptyState = document.querySelector('[data-project-empty]');
    var detailsPanel = document.querySelector('[data-project-details]');
    var detailsCloseButtons = document.querySelectorAll('[data-project-details-close]');
    var quickActionsTrigger = document.querySelector('[data-project-quick-actions-trigger]');
    var quickActionsMenu = document.querySelector('[data-project-quick-actions-menu]');
    var quickActionsCloseButtons = document.querySelectorAll('[data-project-quick-actions-close]');
    var quickActionButtons = document.querySelectorAll('[data-project-quick-action]');
    var projectActionToast = null;
    var projectActionToastTimer = null;
    var advancedFilterState = { status: 'all', priority: 'all', due: 'all', progress: 'all', budget: 'all', tag: 'all', person: '', sort: 'default' };
    var projectsListEndpoint = projectsPage ? String(projectsPage.dataset.projectsListApi || '').trim() : '';
    var projectsApi = window.TechNovaProjectsApi || null;
    var projectsFilterController = null;
    var serverFilteredProjectIds = null;
    var projectSearchQuery = '';
    var projectSearchDebounceTimer = null;
    var projectOriginalOrder = new Map();
    projectCards.forEach(function (card, index) { projectOriginalOrder.set(card, index); });
    var projectDetails = {
        'app-mobile-viomp3': { name: 'App Movil VioMp3', icon: 'assets/img/projects/cards/app-mobile.png', status: 'En progreso', statusClass: 'project-status--progress', client: 'TechNova Solutions', manager: 'Josue Admin', start: '10 mayo 2026', end: '10 junio 2027', budget: '$8,000', spent: '$1,200', progress: 70, description: 'Desarrollo de app móvil para música online y offline con herramientas avanzadas y comandos de voz inteligentes.' },
        'web-store': { name: 'Web store', icon: 'assets/img/projects/cards/web-store.png', status: 'En progreso', statusClass: 'project-status--progress', client: 'Por definir', manager: 'Josue Admin', start: 'Por definir', end: '12 enero 2026', budget: 'Por definir', spent: 'Por definir', progress: 36, description: 'Información del proyecto preparada para conectarse con los datos del backend.' },
        'hotel-system': { name: 'Sistema hotelero', icon: 'assets/img/projects/cards/hotel.png', status: 'Pausado', statusClass: 'project-status--paused', client: 'Por definir', manager: 'Josue Admin', start: 'Por definir', end: '08 marzo 2026', budget: 'Por definir', spent: 'Por definir', progress: 21, description: 'Información del proyecto preparada para conectarse con los datos del backend.' },
        'worklist-app': { name: 'App worlist', icon: 'assets/img/projects/cards/worklist.png', status: 'En progreso', statusClass: 'project-status--progress', client: 'Por definir', manager: 'Josue Admin', start: 'Por definir', end: '22 diciembre 2026', budget: 'Por definir', spent: 'Por definir', progress: 68, description: 'Información del proyecto preparada para conectarse con los datos del backend.' },
        'nova-booking-portal': { name: 'Portal de Reservas Nova', icon: 'assets/img/projects/cards/hotel.png', status: 'En progreso', statusClass: 'project-status--progress', client: 'Hoteles Nova', manager: 'Sofía Torres', start: '15 julio 2026', end: '18 febrero 2027', budget: '$24,500', spent: '$13,800', progress: 60, description: 'Portal web para administrar disponibilidad, reservaciones, pagos y comunicación con huéspedes desde una sola plataforma.' },
        'taskflow-app': { name: 'App TaskFlow', icon: 'assets/img/projects/cards/worklist.png', status: 'Pausado', statusClass: 'project-status--paused', client: 'Grupo Altura', manager: 'Mariana Ruiz', start: '03 agosto 2026', end: '30 abril 2027', budget: '$16,200', spent: '$5,950', progress: 38, description: 'Aplicación colaborativa para organizar tareas, responsables, prioridades y entregas de equipos operativos.' }
    };

    var activeMetricIndex = Math.max(0, metricCards.findIndex(function (card) {
        return card.classList.contains('project-metric-card--featured');
    }));
    var swipeStartX = null;
    var swipeCurrentX = null;
    var swipeLastX = null;
    var swipeLastTime = 0;
    var swipeVelocity = 0;
    var metricDots = [];
    var metricCarouselLocked = false;
    var metricWasDragged = false;
    var metricUnlockCall = null;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var projectsNamespace = window.TechNovaProjects = window.TechNovaProjects || {};
    var cursorReactiveSelector = '.projects-header, .project-metric-card, .projects-controls, .project-card, .project-details-panel, .projects-chart-card';
    var activeCursorGlass = null;
    var pendingCursorPoint = null;
    var cursorFrame = null;
    var projectsSummaryEndpoint = projectsPage
        ? String(projectsPage.dataset.projectsSummaryApi || '').trim()
        : '';

    function ensureCursorLight(element) {
        if (!element) return null;
        element.classList.add('projects-cursor-reactive');
        var light = element.querySelector(':scope > .projects-cursor-light');
        if (light) return light;
        light = document.createElement('span');
        light.className = 'projects-cursor-light';
        light.setAttribute('aria-hidden', 'true');
        element.appendChild(light);
        return light;
    }

    function updateCursorLight() {
        cursorFrame = null;
        if (!pendingCursorPoint) return;
        var element = pendingCursorPoint.element;
        var rect = element.getBoundingClientRect();
        ensureCursorLight(element);
        element.style.setProperty('--projects-mouse-x', pendingCursorPoint.x - rect.left + 'px');
        element.style.setProperty('--projects-mouse-y', pendingCursorPoint.y - rect.top + 'px');
        element.classList.add('is-cursor-lit');
        pendingCursorPoint = null;
    }

    function initializeProjectsCursorLight() {
        if (!projectsPage || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        projectsPage.querySelectorAll(cursorReactiveSelector).forEach(ensureCursorLight);

        projectsPage.addEventListener('pointermove', function (event) {
            if (event.pointerType === 'touch') return;
            var element = event.target.closest(cursorReactiveSelector);
            if (!element || !projectsPage.contains(element)) {
                if (activeCursorGlass) activeCursorGlass.classList.remove('is-cursor-lit');
                activeCursorGlass = null;
                pendingCursorPoint = null;
                return;
            }

            if (activeCursorGlass && activeCursorGlass !== element) {
                activeCursorGlass.classList.remove('is-cursor-lit');
            }
            activeCursorGlass = element;
            pendingCursorPoint = { element: element, x: event.clientX, y: event.clientY };
            if (!cursorFrame) cursorFrame = window.requestAnimationFrame(updateCursorLight);
        }, { passive: true });

        projectsPage.addEventListener('pointerleave', function () {
            if (activeCursorGlass) activeCursorGlass.classList.remove('is-cursor-lit');
            activeCursorGlass = null;
            pendingCursorPoint = null;
        });
    }

    function normalizeMetricText(value) {
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        return null;
    }

    function normalizeProjectSearch(value) {
        return String(value === undefined || value === null ? '' : value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }

    function updateProjectMetrics(payload) {
        var metrics = payload && payload.metrics;
        var updatedKeys = [];
        if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) return updatedKeys;

        metricCards.forEach(function (card) {
            var key = card.dataset.projectMetric;
            var metric = metrics[key];
            if (!metric || typeof metric !== 'object' || Array.isArray(metric)) return;

            var value = normalizeMetricText(metric.value);
            var change = normalizeMetricText(metric.change);
            var context = normalizeMetricText(metric.context);
            var valueElement = card.querySelector('[data-metric-value]');
            var changeElement = card.querySelector('[data-metric-change]');
            var contextElement = card.querySelector('[data-metric-context]');

            if (value !== null && valueElement) {
                valueElement.textContent = value;
                delete valueElement.dataset.metricFinalValue;
            }
            if (change !== null && changeElement) changeElement.textContent = change;
            if (context !== null && contextElement) contextElement.textContent = context;
            if (value !== null || change !== null || context !== null) updatedKeys.push(key);
        });

        return updatedKeys;
    }

    function renderProjectTeam(card, team) {
        if (!card || !team || !Array.isArray(team.members)) return false;
        var teamStack = card.querySelector('.project-avatar-stack');
        if (!teamStack) return false;
        var validMembers = team.members.filter(function (member) {
            return member && typeof member === 'object' && normalizeMetricText(member.avatar || member.image);
        });
        var total = Number(team.total);
        if (!Number.isFinite(total) || total < validMembers.length) total = validMembers.length;
        total = Math.max(0, Math.floor(total));
        var visibleMembers = validMembers.slice(0, 3);
        var nodes = visibleMembers.map(function (member, index) {
            var image = document.createElement('img');
            image.src = String(member.avatar || member.image);
            image.alt = normalizeMetricText(member.name) || 'Integrante ' + (index + 1);
            if (member.role) image.title = String(member.role);
            return image;
        });
        var remaining = Math.max(0, total - visibleMembers.length);
        if (remaining) {
            var extra = document.createElement('span');
            extra.textContent = '+' + remaining;
            extra.setAttribute('aria-label', remaining + ' integrantes adicionales');
            nodes.push(extra);
        }
        teamStack.replaceChildren.apply(teamStack, nodes);
        teamStack.setAttribute('aria-label', total + (total === 1 ? ' integrante asignado' : ' integrantes asignados'));
        if (card.classList.contains('is-selected')) syncProjectTeam(card);
        return true;
    }

    function updateProjectTeams(payload) {
        var projects = payload && payload.projects;
        var updatedProjectIds = [];
        if (!Array.isArray(projects)) return updatedProjectIds;
        projects.forEach(function (project) {
            if (!project || typeof project !== 'object' || !project.id) return;
            var card = Array.prototype.find.call(projectCards, function (candidate) {
                return candidate.dataset.projectId === String(project.id);
            });
            if (renderProjectTeam(card, project.team)) updatedProjectIds.push(String(project.id));
        });
        return updatedProjectIds;
    }

    function renderProjectProgress(card, progressData) {
        if (!card || !progressData || typeof progressData !== 'object') return false;
        var completed = Math.max(0, Math.floor(Number(progressData.completedTasks) || 0));
        var total = Math.max(completed, Math.floor(Number(progressData.totalTasks) || 0));
        var calculated = total ? (completed / total) * 100 : 0;
        var percentage = Number(progressData.percentage);
        if (!Number.isFinite(percentage)) percentage = calculated;
        percentage = Math.max(0, Math.min(100, Math.round(percentage)));
        var taskLabel = card.querySelector('.project-progress-labels > span:first-child');
        var percentageLabel = card.querySelector('.project-progress-labels > span:last-child');
        var progressbar = card.querySelector('.project-progress-track');
        var progressFill = progressbar && progressbar.querySelector('span');
        if (taskLabel) {
            Array.prototype.slice.call(taskLabel.childNodes).forEach(function (node) {
                if (node.nodeType === Node.TEXT_NODE) node.remove();
            });
            taskLabel.appendChild(document.createTextNode(completed + '/' + total));
        }
        if (percentageLabel) percentageLabel.textContent = percentage + '% completado';
        if (progressbar) progressbar.setAttribute('aria-valuenow', String(percentage));
        if (progressFill) progressFill.style.setProperty('--project-progress', percentage + '%');
        card._projectProgress = { completedTasks: completed, totalTasks: total, percentage: percentage };
        if (card.classList.contains('is-selected')) syncProjectProgress(card);
        return true;
    }

    function renderProjectTags(card, tags) {
        if (!card || !Array.isArray(tags)) return false;
        var footer = card.querySelector('.project-card-tags');
        var status = footer && footer.querySelector('.project-status');
        if (!footer || !status) return false;
        footer.querySelectorAll('.project-tag').forEach(function (tag) { tag.remove(); });
        var normalizedTags = tags.filter(function (tag) {
            return typeof tag === 'string' || (tag && typeof tag === 'object' && normalizeMetricText(tag.label || tag.name));
        }).map(function (tag) {
            return typeof tag === 'string' ? { label: tag, type: '' } : { label: String(tag.label || tag.name), type: String(tag.type || '') };
        });
        normalizedTags.slice(0, 2).forEach(function (tag) {
            var element = document.createElement('span');
            element.className = 'project-tag' + (tag.type ? ' project-tag--' + tag.type.replace(/[^a-z0-9-]/gi, '').toLowerCase() : '');
            element.textContent = tag.label;
            footer.insertBefore(element, status);
        });
        if (normalizedTags.length > 2) {
            var extra = document.createElement('span');
            extra.className = 'project-tag project-tag--more';
            extra.textContent = '+' + (normalizedTags.length - 2);
            footer.insertBefore(extra, status);
        }
        card._projectTags = normalizedTags;
        if (card.classList.contains('is-selected')) syncProjectTags(card);
        return true;
    }

    function updateProjectCardData(payload) {
        var projects = payload && payload.projects;
        var updatedProjectIds = [];
        if (!Array.isArray(projects)) return updatedProjectIds;
        projects.forEach(function (project) {
            if (!project || typeof project !== 'object' || !project.id) return;
            var card = Array.prototype.find.call(projectCards, function (candidate) {
                return candidate.dataset.projectId === String(project.id);
            });
            if (!card) return;
            var updated = renderProjectProgress(card, project.progress);
            if (Array.isArray(project.tags)) updated = renderProjectTags(card, project.tags) || updated;
            if (project.priority) {
                card.dataset.priority = String(project.priority);
                updated = true;
            }
            var storedDetail = projectDetails[String(project.id)];
            if (storedDetail) {
                ['name', 'client', 'manager', 'start', 'end', 'description'].forEach(function (field) {
                    var value = normalizeMetricText(project[field]);
                    if (value !== null) {
                        storedDetail[field] = value;
                        updated = true;
                    }
                });
                if (project.budget && typeof project.budget === 'object') {
                    var totalBudget = normalizeMetricText(project.budget.formattedTotal !== undefined ? project.budget.formattedTotal : project.budget.total);
                    var spentBudget = normalizeMetricText(project.budget.formattedSpent !== undefined ? project.budget.formattedSpent : project.budget.spent);
                    if (totalBudget !== null) storedDetail.budget = totalBudget;
                    if (spentBudget !== null) storedDetail.spent = spentBudget;
                    if (totalBudget !== null || spentBudget !== null) updated = true;
                }
            }
            if (updated && card.classList.contains('is-selected')) selectProject(card, false);
            if (updated) updatedProjectIds.push(String(project.id));
        });
        return updatedProjectIds;
    }

    async function loadProjectsSummary(endpoint) {
        var requestUrl = String(endpoint || projectsSummaryEndpoint || '').trim();
        if (!requestUrl || !projectsPage) return null;
        projectsPage.dataset.projectsLoading = 'true';

        try {
            var response = await fetch(requestUrl, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin'
            });
            if (!response.ok) throw new Error('No fue posible cargar el resumen de proyectos. HTTP ' + response.status);
            var data = await response.json();
            var updatedKeys = updateProjectMetrics(data);
            var updatedTeamProjectIds = updateProjectTeams(data);
            var updatedCardProjectIds = updateProjectCardData(data);
            document.dispatchEvent(new CustomEvent('technova:projects-data-loaded', {
                detail: { data: data, updatedKeys: updatedKeys, updatedTeamProjectIds: updatedTeamProjectIds, updatedCardProjectIds: updatedCardProjectIds }
            }));
            return data;
        } catch (error) {
            console.error('TechNova proyectos:', error);
            document.dispatchEvent(new CustomEvent('technova:projects-data-error', {
                detail: { error: error }
            }));
            throw error;
        } finally {
            delete projectsPage.dataset.projectsLoading;
        }
    }

    projectsNamespace.updateProjectMetrics = updateProjectMetrics;
    projectsNamespace.updateProjectTeams = updateProjectTeams;
    projectsNamespace.renderProjectTeam = renderProjectTeam;
    projectsNamespace.updateProjectCardData = updateProjectCardData;
    projectsNamespace.renderProjectProgress = renderProjectProgress;
    projectsNamespace.renderProjectTags = renderProjectTags;
    projectsNamespace.loadProjectsSummary = loadProjectsSummary;
    projectsNamespace.projectsSummaryEndpoint = projectsSummaryEndpoint || null;

    function setMetricDragOffset(distance) {
        if (!viewport) return;
        var resistance = Math.max(-92, Math.min(92, distance * 0.46));
        viewport.style.setProperty('--metric-drag-x', resistance + 'px');
    }

    function releaseMetricCarouselLock() {
        metricCarouselLocked = false;
    }

    function animateMetricValue(card) {
        if (!card || !window.gsap || reducedMotion.matches) return;
        var valueElement = card.querySelector('[data-metric-value]');
        if (!valueElement) return;
        if (valueElement.metricValueTween) valueElement.metricValueTween.kill();
        var finalText = valueElement.dataset.metricFinalValue || valueElement.textContent.trim();
        valueElement.dataset.metricFinalValue = finalText;
        var target = Number(finalText.replace(/[^0-9.-]/g, ''));
        if (!Number.isFinite(target)) return;
        var state = { value: valueElement.dataset.metricAnimated === 'true' ? target * .84 : 0 };
        valueElement.dataset.metricAnimated = 'true';
        valueElement.metricValueTween = window.gsap.to(state, {
            value: target,
            duration: .46,
            ease: 'power2.out',
            onUpdate: function () {
                var rounded = Math.round(state.value);
                valueElement.textContent = finalText.charAt(0) === '$'
                    ? '$' + rounded.toLocaleString('en-US')
                    : String(rounded);
            },
            onComplete: function () {
                valueElement.textContent = finalText;
                valueElement.metricValueTween = null;
            }
        });
    }

    function animateMetricActivation(card) {
        if (!card || !window.gsap || reducedMotion.matches) return;
        var icon = card.querySelector('.project-metric-icon');
        var change = card.querySelector('.project-metric-change');
        var activeDot = metricDots[activeMetricIndex];
        card.classList.remove('is-activating');
        void card.offsetWidth;
        card.classList.add('is-activating');
        window.gsap.delayedCall(.76, function () { card.classList.remove('is-activating'); });
        if (icon) window.gsap.fromTo(icon, { scale: .92 }, { scale: 1, duration: .44, ease: 'back.out(1.45)', clearProps: 'transform', overwrite: true });
        if (change) window.gsap.fromTo(change, { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: .3, delay: .08, ease: 'power2.out', clearProps: 'opacity,visibility,transform', overwrite: true });
        if (activeDot) window.gsap.fromTo(activeDot, { scaleX: .55 }, { scaleX: 1, duration: .38, ease: 'back.out(1.35)', clearProps: 'transform', overwrite: true });
        animateMetricValue(card);
    }

    function updateMetricCarousel(nextIndex, animate) {
        if (!metricCards.length || (metricCarouselLocked && animate)) return;
        var previousIndex = activeMetricIndex;
        if (animate && !reducedMotion.matches) metricCarouselLocked = true;
        activeMetricIndex = (nextIndex + metricCards.length) % metricCards.length;
        if (viewport) {
            var delta = activeMetricIndex - previousIndex;
            if (delta > metricCards.length / 2) delta -= metricCards.length;
            if (delta < -metricCards.length / 2) delta += metricCards.length;
            viewport.dataset.metricDirection = delta < 0 ? 'previous' : 'next';
        }

        metricCards.forEach(function (card, index) {
            card.style.removeProperty('opacity');
            card.style.removeProperty('--metric-scale');
            var slot = index - activeMetricIndex;
            var half = Math.floor(metricCards.length / 2);
            if (slot > half) slot -= metricCards.length;
            if (slot < -half) slot += metricCards.length;
            var distance = Math.abs(slot);
            var isActive = slot === 0;
            card.classList.remove('carousel-slot--2', 'carousel-slot--1', 'carousel-slot-0', 'carousel-slot-1', 'carousel-slot-2');
            card.classList.add('carousel-slot-' + slot);
            card.classList.toggle('project-metric-card--featured', isActive);
            card.classList.toggle('is-near', distance === 1);
            card.classList.toggle('is-far', distance > 1);
            card.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        controls.forEach(function (control) {
            control.disabled = false;
        });

        metricDots.forEach(function (dot, index) {
            var isActive = index === activeMetricIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            dot.setAttribute('aria-label', (isActive ? 'Métrica actual: ' : 'Ver métrica: ') + metricCards[index].querySelector('h3').textContent);
        });
        if (metricsCounter) metricsCounter.textContent = (activeMetricIndex + 1) + ' / ' + metricCards.length;

        if (animate && !reducedMotion.matches && window.gsap) {
            var activeCard = metricCards[activeMetricIndex];
            window.gsap.killTweensOf(activeCard);
            if (metricUnlockCall) metricUnlockCall.kill();
            metricUnlockCall = window.gsap.delayedCall(.18, releaseMetricCarouselLock);
            window.gsap.fromTo(activeCard,
                { '--metric-scale': 0.965 },
                {
                    '--metric-scale': 1,
                    duration: 0.48,
                    ease: 'back.out(1.28)',
                    overwrite: true,
                    onComplete: function () {
                        activeCard.style.removeProperty('--metric-scale');
                    }
                }
            );
            animateMetricActivation(activeCard);
        } else {
            releaseMetricCarouselLock();
        }
    }

    if (viewport && metricCards.length) {
        if (metricsPagination) {
            metricCards.forEach(function (card, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'project-metrics-dot';
                dot.addEventListener('click', function () { updateMetricCarousel(index, true); });
                metricsPagination.appendChild(dot);
                metricDots.push(dot);
            });
        }

        controls.forEach(function (control) {
            control.addEventListener('click', function () {
                var direction = control.dataset.metricsDirection === 'previous' ? -1 : 1;
                if (window.gsap && !reducedMotion.matches) {
                    window.gsap.fromTo(control, { scale: .9 }, { scale: 1, duration: .26, ease: 'back.out(1.7)', clearProps: 'transform', overwrite: true });
                }
                updateMetricCarousel(activeMetricIndex + direction, true);
            });
        });

        metricCards.forEach(function (card, index) {
            card.addEventListener('click', function () {
                if (!metricWasDragged) updateMetricCarousel(index, true);
                metricWasDragged = false;
            });
        });

        viewport.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            updateMetricCarousel(activeMetricIndex + (event.key === 'ArrowLeft' ? -1 : 1), true);
        });

        function finishMetricSwipe(clientX) {
            if (swipeStartX === null) return;
            var distance = clientX - swipeStartX;
            swipeStartX = null;
            swipeCurrentX = null;
            swipeLastX = null;
            viewport.classList.remove('is-dragging');
            setMetricDragOffset(0);
            window.setTimeout(function () { metricWasDragged = false; }, 0);
            if (Math.abs(distance) < 38 && Math.abs(swipeVelocity) < .42) return;
            var gestureDirection = Math.abs(distance) >= 38 ? distance : swipeVelocity;
            updateMetricCarousel(activeMetricIndex + (gestureDirection < 0 ? 1 : -1), true);
        }

        viewport.addEventListener('pointerdown', function (event) {
            if (metricCarouselLocked) return;
            swipeStartX = event.clientX;
            swipeCurrentX = event.clientX;
            swipeLastX = event.clientX;
            swipeLastTime = performance.now();
            swipeVelocity = 0;
            metricWasDragged = false;
            viewport.classList.add('is-dragging');
            if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
        });
        viewport.addEventListener('pointermove', function (event) {
            if (swipeStartX === null) return;
            swipeCurrentX = event.clientX;
            var distance = swipeCurrentX - swipeStartX;
            var now = performance.now();
            var elapsed = Math.max(1, now - swipeLastTime);
            swipeVelocity = (event.clientX - swipeLastX) / elapsed;
            swipeLastX = event.clientX;
            swipeLastTime = now;
            if (Math.abs(distance) > 6) metricWasDragged = true;
            setMetricDragOffset(distance);
        });
        viewport.addEventListener('pointerup', function (event) {
            finishMetricSwipe(event.clientX);
        });
        viewport.addEventListener('pointercancel', function () {
            swipeStartX = null;
            swipeCurrentX = null;
            swipeLastX = null;
            swipeVelocity = 0;
            viewport.classList.remove('is-dragging');
            setMetricDragOffset(0);
        });

        updateMetricCarousel(activeMetricIndex, false);
    }

    if (projectsSummaryEndpoint) {
        loadProjectsSummary().catch(function () {
            /* Los valores del HTML permanecen visibles como fallback. */
        });
    }

    function activateButton(buttons, selectedButton) {
        buttons.forEach(function (button) {
            var isSelected = button === selectedButton;
            button.classList.toggle('is-active', isSelected);
            button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });
    }

    function updateProjectFilterCounts() {
        var counts = { all: projectCards.length, pinned: 0 };
        projectCards.forEach(function (card) {
            if (card.dataset.pinned === 'true') counts.pinned += 1;
            counts[card.dataset.status] = (counts[card.dataset.status] || 0) + 1;
        });
        filterButtons.forEach(function (button) {
            var count = counts[button.dataset.projectFilter] || 0;
            var countElement = button.querySelector('[data-project-filter-count]');
            if (countElement) countElement.textContent = String(count);
            button.setAttribute('aria-label', button.querySelector('.project-filter-label').textContent + ': ' + count + ' proyectos');
        });
        return counts;
    }

    function getAdvancedFilterCount() {
        return Object.keys(advancedFilterState).reduce(function (total, key) {
            var value = advancedFilterState[key];
            var isDefault = key === 'sort' ? value === 'default' : key === 'person' ? !value : value === 'all';
            return total + (isDefault ? 0 : 1);
        }, 0);
    }

    function updateAdvancedFilterBadge() {
        if (!advancedFilterBadge || !advancedFilterOpenButton) return;
        var count = getAdvancedFilterCount();
        advancedFilterBadge.textContent = String(count);
        advancedFilterBadge.hidden = count === 0;
        advancedFilterOpenButton.classList.toggle('has-active-filters', count > 0);
        advancedFilterOpenButton.setAttribute('aria-label', count ? 'Abrir filtros de proyectos, ' + count + ' activos' : 'Abrir filtros de proyectos');
    }

    function cardMatchesAdvancedFilters(card) {
        if (serverFilteredProjectIds && !serverFilteredProjectIds.has(card.dataset.projectId)) return false;
        if (advancedFilterState.priority !== 'all' && card.dataset.priority !== advancedFilterState.priority) return false;
        if (advancedFilterState.due === 'overdue' && !card.classList.contains('is-overdue')) return false;
        if (advancedFilterState.due === 'soon' && !card.classList.contains('is-due-soon')) return false;
        if (advancedFilterState.due === 'upcoming' && (card.classList.contains('is-overdue') || card.classList.contains('is-due-soon'))) return false;

        var progress = readProjectProgress(card).percentage;
        var progressRanges = { '0-25': [0, 25], '26-50': [26, 50], '51-75': [51, 75], '76-100': [76, 100] };
        var range = progressRanges[advancedFilterState.progress];
        if (range && (progress < range[0] || progress > range[1])) return false;

        var detail = projectDetails[card.dataset.projectId] || {};
        var normalizedQuery = normalizeProjectSearch(projectSearchQuery);
        if (normalizedQuery) {
            var searchableText = [
                card.dataset.projectId,
                card.dataset.status,
                card.dataset.priority,
                detail.name,
                detail.client,
                detail.manager,
                detail.description,
                card.textContent
            ].concat(Array.prototype.map.call(card.querySelectorAll('.project-avatar-stack img'), function (avatar) {
                return (avatar.alt || '') + ' ' + (avatar.title || '');
            })).join(' ');
            if (normalizeProjectSearch(searchableText).indexOf(normalizedQuery) === -1) return false;
        }
        var budget = parseProjectMoney(detail.budget);
        var spent = parseProjectMoney(detail.spent);
        if (advancedFilterState.budget === 'defined' && budget === null) return false;
        if (advancedFilterState.budget === 'undefined' && budget !== null) return false;
        if (advancedFilterState.budget === 'within' && (budget === null || spent === null || spent > budget)) return false;
        if (advancedFilterState.budget === 'over' && (budget === null || spent === null || spent <= budget)) return false;

        if (advancedFilterState.tag !== 'all') {
            var tagText = Array.prototype.map.call(card.querySelectorAll('.project-card-tags .project-tag'), function (tag) { return tag.textContent.toLowerCase(); }).join(' ');
            if (tagText.indexOf(advancedFilterState.tag) === -1) return false;
        }

        if (advancedFilterState.person) {
            var peopleText = [detail.client, detail.manager].concat(Array.prototype.map.call(card.querySelectorAll('.project-avatar-stack img'), function (avatar) {
                return (avatar.alt || '') + ' ' + (avatar.title || '');
            })).join(' ').toLowerCase();
            if (peopleText.indexOf(advancedFilterState.person) === -1) return false;
        }
        return true;
    }

    function sortProjectCards() {
        if (!projectResults) return;
        var priorityRank = { high: 0, medium: 1, low: 2 };
        var cards = Array.prototype.slice.call(projectCards);
        cards.sort(function (a, b) {
            if (advancedFilterState.sort === 'name-asc') return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'es');
            if (advancedFilterState.sort === 'priority') {
                var aPriority = Object.prototype.hasOwnProperty.call(priorityRank, a.dataset.priority) ? priorityRank[a.dataset.priority] : 9;
                var bPriority = Object.prototype.hasOwnProperty.call(priorityRank, b.dataset.priority) ? priorityRank[b.dataset.priority] : 9;
                return aPriority - bPriority;
            }
            if (advancedFilterState.sort === 'progress-desc') return readProjectProgress(b).percentage - readProjectProgress(a).percentage;
            if (advancedFilterState.sort === 'due-asc') {
                var aTime = a.querySelector('.project-due-date time');
                var bTime = b.querySelector('.project-due-date time');
                return new Date(aTime ? aTime.dateTime : '9999-12-31') - new Date(bTime ? bTime.dateTime : '9999-12-31');
            }
            return projectOriginalOrder.get(a) - projectOriginalOrder.get(b);
        });
        cards.forEach(function (card) { projectResults.appendChild(card); });
    }

    function updateFilterScrollControls() {
        if (!filterStrip) return;
        var hasOverflow = filterStrip.scrollWidth > filterStrip.clientWidth + 2;
        filterScrollButtons.forEach(function (button) {
            var isPrevious = button.dataset.filterScroll === 'previous';
            var atStart = filterStrip.scrollLeft <= 2;
            var atEnd = filterStrip.scrollLeft + filterStrip.clientWidth >= filterStrip.scrollWidth - 2;
            button.classList.toggle('is-visible', hasOverflow);
            button.disabled = !hasOverflow || (isPrevious ? atStart : atEnd);
        });
    }

    function applyProjectFilter(filter, animate) {
        var visibleCount = 0;
        var visibleCards = [];

        if (window.gsap) window.gsap.killTweensOf(projectCards);
        projectCards.forEach(function (card) {
            card.style.removeProperty('opacity');
            card.style.removeProperty('visibility');
            card.style.removeProperty('transform');
            var isVisible = filter === 'all'
                || (filter === 'pinned' && card.dataset.pinned === 'true')
                || card.dataset.status === filter;
            isVisible = isVisible && cardMatchesAdvancedFilters(card);

            card.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
                visibleCards.push(card);
            }
        });

        if (emptyState) {
            var activeFilter = Array.prototype.find.call(filterButtons, function (button) {
                return button.dataset.projectFilter === filter;
            });
            var filterName = activeFilter ? activeFilter.querySelector('.project-filter-label').textContent.toLowerCase() : 'seleccionado';
            emptyState.textContent = normalizeProjectSearch(projectSearchQuery)
                ? 'No encontramos proyectos para “' + projectSearchQuery.trim() + '”.'
                : getAdvancedFilterCount() > 0
                ? 'No hay proyectos que coincidan con los filtros aplicados.'
                : filter === 'all'
                ? 'No hay proyectos disponibles.'
                : 'No hay proyectos en el filtro ' + filterName + '.';
            emptyState.hidden = visibleCount !== 0;
        }
        sortProjectCards();

        if (animate && !reducedMotion.matches && window.gsap && visibleCards.length) {
            window.gsap.killTweensOf(visibleCards);
            window.gsap.fromTo(visibleCards,
                { autoAlpha: 0, y: 10 },
                { autoAlpha: 1, y: 0, duration: .32, stagger: .045, ease: 'power2.out', clearProps: 'opacity,visibility,transform', overwrite: true }
            );
        }
        return visibleCount;
    }

    projectsNamespace.updateProjectFilterCounts = updateProjectFilterCounts;

    function readAdvancedFilterForm() {
        if (!advancedFilterForm) return;
        var data = new FormData(advancedFilterForm);
        advancedFilterState = {
            status: String(data.get('status') || 'all'),
            priority: String(data.get('priority') || 'all'),
            due: String(data.get('due') || 'all'),
            progress: String(data.get('progress') || 'all'),
            budget: String(data.get('budget') || 'all'),
            tag: String(data.get('tag') || 'all').toLowerCase(),
            person: String(data.get('person') || '').trim().toLowerCase(),
            sort: String(data.get('sort') || 'default')
        };
    }

    function syncQuickFilterWithAdvancedStatus() {
        var selectedButton = Array.prototype.find.call(filterButtons, function (button) { return button.dataset.projectFilter === advancedFilterState.status; });
        if (selectedButton) activateButton(filterButtons, selectedButton);
        if (projectsPage) projectsPage.dataset.projectFilter = advancedFilterState.status;
    }

    function openAdvancedFilters() {
        if (!advancedFilterPanel || !advancedFilterOpenButton) return;
        advancedFilterLastFocus = document.activeElement;
        advancedFilterPanel.hidden = false;
        var backdrop = document.querySelector('.projects-filter-backdrop');
        if (backdrop) backdrop.hidden = false;
        advancedFilterOpenButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('projects-filters-open');
        var firstField = advancedFilterPanel.querySelector('select, input, button');
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.fromTo(advancedFilterPanel, { autoAlpha: 0, y: window.innerWidth <= 1024 ? 36 : -8, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .28, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
            if (backdrop) window.gsap.to(backdrop, { opacity: 1, duration: .22, overwrite: true });
        } else if (backdrop) backdrop.style.opacity = '1';
        if (firstField) firstField.focus({ preventScroll: true });
    }

    function closeAdvancedFilters() {
        if (!advancedFilterPanel || advancedFilterPanel.hidden) return;
        var backdrop = document.querySelector('.projects-filter-backdrop');
        var finish = function () {
            advancedFilterPanel.hidden = true;
            if (backdrop) { backdrop.hidden = true; backdrop.style.removeProperty('opacity'); }
            advancedFilterOpenButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('projects-filters-open');
            if (advancedFilterLastFocus && advancedFilterLastFocus.focus) advancedFilterLastFocus.focus({ preventScroll: true });
        };
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.to(advancedFilterPanel, { autoAlpha: 0, y: window.innerWidth <= 1024 ? 30 : -6, duration: .2, ease: 'power2.in', overwrite: true, onComplete: finish });
            if (backdrop) window.gsap.to(backdrop, { opacity: 0, duration: .18, overwrite: true });
        } else finish();
    }

    async function loadFilteredProjects(filters) {
        if (!projectsListEndpoint || !projectsPage || !projectsApi || typeof projectsApi.listProjects !== 'function') return null;
        if (projectsFilterController) projectsFilterController.abort();
        var controller = new AbortController();
        projectsFilterController = controller;
        projectsPage.dataset.projectsFilterLoading = 'true';
        if (projectSearchInput) projectSearchInput.setAttribute('aria-busy', 'true');
        document.dispatchEvent(new CustomEvent('technova:projects-filter-loading', { detail: { filters: Object.assign({}, filters) } }));
        try {
            var data = await projectsApi.listProjects(projectsListEndpoint, filters, { signal: controller.signal });
            if (controller !== projectsFilterController) return null;
            updateProjectTeams(data);
            updateProjectCardData(data);
            serverFilteredProjectIds = new Set(data.projects
                .filter(function (project) { return project && project.id !== undefined && project.id !== null; })
                .map(function (project) { return String(project.id); }));
            applyProjectFilter(advancedFilterState.status, true);
            document.dispatchEvent(new CustomEvent('technova:projects-filter-loaded', {
                detail: { filters: Object.assign({}, filters), data: data }
            }));
            return data;
        } catch (error) {
            if (error && error.name === 'AbortError') return null;
            serverFilteredProjectIds = null;
            applyProjectFilter(advancedFilterState.status, false);
            console.error('TechNova filtros de proyectos:', error);
            document.dispatchEvent(new CustomEvent('technova:projects-filter-error', {
                detail: { filters: Object.assign({}, filters), error: error }
            }));
            throw error;
        } finally {
            if (controller === projectsFilterController) {
                projectsFilterController = null;
                delete projectsPage.dataset.projectsFilterLoading;
                if (projectSearchInput) projectSearchInput.removeAttribute('aria-busy');
            }
        }
    }

    function requestFilteredProjects() {
        serverFilteredProjectIds = null;
        if (!projectsListEndpoint) return;
        var requestFilters = Object.assign({}, advancedFilterState, { search: projectSearchQuery });
        loadFilteredProjects(requestFilters).catch(function () {
            /* El filtrado local permanece como fallback cuando la API falla. */
        });
    }

    function scheduleProjectSearchRequest() {
        window.clearTimeout(projectSearchDebounceTimer);
        if (!projectsListEndpoint) return;
        projectSearchDebounceTimer = window.setTimeout(requestFilteredProjects, 350);
    }

    function setProjectSearch(query) {
        projectSearchQuery = String(query === undefined || query === null ? '' : query).slice(0, 120);
        if (projectSearchInput && projectSearchInput.value !== projectSearchQuery) projectSearchInput.value = projectSearchQuery;
        serverFilteredProjectIds = null;
        if (projectsPage) {
            if (normalizeProjectSearch(projectSearchQuery)) projectsPage.dataset.projectSearchActive = 'true';
            else delete projectsPage.dataset.projectSearchActive;
        }
        var visibleCount = applyProjectFilter(projectsPage ? projectsPage.dataset.projectFilter || 'all' : 'all', false);
        scheduleProjectSearchRequest();
        document.dispatchEvent(new CustomEvent('projects:search-change', {
            detail: { query: projectSearchQuery, visibleCount: visibleCount }
        }));
        return visibleCount;
    }

    projectsNamespace.loadFilteredProjects = loadFilteredProjects;
    projectsNamespace.buildProjectFilterQuery = projectsApi && projectsApi.buildProjectFilterQuery;
    projectsNamespace.projectsListEndpoint = projectsListEndpoint || null;
    projectsNamespace.search = setProjectSearch;

    function showProjectActionMessage(message) {
        if (!projectActionToast) {
            projectActionToast = document.createElement('div');
            projectActionToast.className = 'project-action-toast';
            projectActionToast.setAttribute('role', 'status');
            projectActionToast.setAttribute('aria-live', 'polite');
            document.body.appendChild(projectActionToast);
        }
        projectActionToast.textContent = message;
        window.clearTimeout(projectActionToastTimer);
        if (window.gsap && !reducedMotion.matches) {
            window.gsap.to(projectActionToast, { opacity: 1, y: 0, duration: .24, overwrite: true });
        } else {
            projectActionToast.style.opacity = '1';
            projectActionToast.style.transform = 'translateY(0)';
        }
        projectActionToastTimer = window.setTimeout(function () {
            if (window.gsap && !reducedMotion.matches) {
                window.gsap.to(projectActionToast, { opacity: 0, y: 10, duration: .22, overwrite: true });
            } else {
                projectActionToast.style.opacity = '0';
            }
        }, 2600);
    }

    function setQuickActionsOpen(open, restoreFocus) {
        if (!quickActionsMenu || !quickActionsTrigger) return;
        quickActionsTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        quickActionsMenu.hidden = !open;
        quickActionsCloseButtons.forEach(function (button) { button.hidden = !open; });
        if (projectsPage) projectsPage.classList.toggle('quick-actions-open', open);

        if (open) {
            if (window.gsap && !reducedMotion.matches) {
                window.gsap.fromTo(quickActionsMenu,
                    { autoAlpha: 0, y: window.matchMedia('(max-width: 640px)').matches ? 24 : 7, scale: .98 },
                    { autoAlpha: 1, y: 0, scale: 1, duration: .24, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }
                );
            }
            window.setTimeout(function () {
                var firstAction = quickActionsMenu.querySelector('[role="menuitem"]');
                if (firstAction) firstAction.focus();
            }, 0);
        } else if (restoreFocus) {
            quickActionsTrigger.focus();
        }
    }

    function runProjectQuickAction(button) {
        var action = button.dataset.projectQuickAction;
        var labels = { tasks: 'Ver tareas', time: 'Registrar tiempo', budget: 'Ver presupuesto', documents: 'Documentos' };
        var selectedCard = document.querySelector('.project-card.is-selected');
        document.dispatchEvent(new CustomEvent('projects:quick-action', {
            detail: { action: action, projectId: selectedCard ? selectedCard.dataset.projectId : null }
        }));
        showProjectActionMessage((labels[action] || 'Acción') + ': listo para conectar con el backend.');
        setQuickActionsOpen(false, false);
    }

    function updateProjectDueStatus(card) {
        var time = card.querySelector('.project-due-date time');
        if (!time || !time.dateTime) return;
        var dueDate = new Date(time.dateTime + 'T00:00:00');
        if (Number.isNaN(dueDate.getTime())) return;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var days = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
        var status = card.querySelector('.project-due-status');
        if (!status) {
            status = document.createElement('span');
            status.className = 'project-due-status';
            time.insertAdjacentElement('afterend', status);
        }
        card.classList.toggle('is-overdue', days < 0);
        card.classList.toggle('is-due-soon', days >= 0 && days <= 7);
        var dueText = days < 0
            ? 'Vencido ' + Math.abs(days) + (Math.abs(days) === 1 ? ' día' : ' días')
            : days === 0 ? 'Vence hoy'
                : 'Vence en ' + days + (days === 1 ? ' día' : ' días');
        var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
        var dueCopy = document.createElement('span');
        var separator = document.createElement('span');
        var priority = document.createElement('span');
        dueCopy.textContent = dueText;
        separator.className = 'project-due-separator';
        separator.textContent = '/';
        priority.className = 'project-due-priority project-due-priority--' + card.dataset.priority;
        priority.textContent = priorityLabels[card.dataset.priority] || 'Media';
        status.replaceChildren(dueCopy, separator, priority);
    }

    function closeProjectCardMenus(exceptCard) {
        projectCards.forEach(function (card) {
            if (card === exceptCard) return;
            var menu = card.querySelector('.project-card-menu-panel');
            var trigger = card.querySelector('.project-card-menu');
            if (menu) menu.hidden = true;
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
    }

    function runProjectCardAction(card, action) {
        var nameElement = card.querySelector('.project-card-title h3');
        var projectName = nameElement ? nameElement.textContent : 'Proyecto';
        if (action === 'details') {
            selectProject(card, true);
            showProjectActionMessage('Mostrando detalles de ' + projectName + '.');
        } else if (action === 'cancel') {
            card.dataset.status = 'cancelled';
            if (projectDetails[card.dataset.projectId]) {
                projectDetails[card.dataset.projectId].status = 'Cancelado';
                projectDetails[card.dataset.projectId].statusClass = 'project-status--cancelled';
            }
            var status = card.querySelector('.project-status');
            if (status) {
                status.className = 'project-status project-status--cancelled';
                status.textContent = 'Cancelado';
            }
            updateProjectFilterCounts();
            applyProjectFilter(projectsPage ? projectsPage.dataset.projectFilter : 'all', true);
            showProjectActionMessage(projectName + ' se marcó como cancelado en la vista local.');
        } else {
            showProjectActionMessage('La acción “' + action + '” quedó preparada para conectarse al backend.');
        }
        document.dispatchEvent(new CustomEvent('projects:card-action', {
            detail: { projectId: card.dataset.projectId, action: action }
        }));
    }

    function initializeProjectCardEnhancements() {
        projectCards.forEach(function (card) {
            var header = card.querySelector('.project-card-header');
            var menuButton = card.querySelector('.project-card-menu');
            var footer = card.querySelector('.project-card-tags');
            if (!header || !menuButton || !footer) return;

            var actions = document.createElement('div');
            actions.className = 'project-card-actions';
            var pin = document.createElement('button');
            pin.type = 'button';
            pin.className = 'project-card-pin';
            pin.setAttribute('aria-pressed', card.dataset.pinned === 'true' ? 'true' : 'false');
            pin.setAttribute('aria-label', (card.dataset.pinned === 'true' ? 'Desfijar ' : 'Fijar ') + card.querySelector('h3').textContent);
            pin.innerHTML = '<img src="assets/img/projects/filters/pinned.svg" alt="" aria-hidden="true" />';
            header.appendChild(actions);
            actions.appendChild(pin);
            actions.appendChild(menuButton);

            var menu = document.createElement('div');
            menu.className = 'project-card-menu-panel';
            menu.hidden = true;
            menu.innerHTML = '<button type="button" data-project-card-action="details">Ver detalles</button>'
                + '<button type="button" data-project-card-action="edit">Editar</button>'
                + '<button type="button" data-project-card-action="duplicate">Duplicar</button>'
                + '<button type="button" data-project-card-action="cancel">Cancelar</button>'
                + '<button type="button" data-project-card-action="delete">Eliminar</button>';
            card.appendChild(menu);
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.setAttribute('aria-haspopup', 'menu');

            pin.addEventListener('click', function () {
                var isPinned = card.dataset.pinned !== 'true';
                card.dataset.pinned = isPinned ? 'true' : 'false';
                pin.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
                pin.setAttribute('aria-label', (isPinned ? 'Desfijar ' : 'Fijar ') + card.querySelector('h3').textContent);
                updateProjectFilterCounts();
                if (projectsPage && projectsPage.dataset.projectFilter === 'pinned') applyProjectFilter('pinned', true);
                showProjectActionMessage(card.querySelector('h3').textContent + (isPinned ? ' se fijó.' : ' se desfijó.'));
            });

            menuButton.addEventListener('click', function () {
                var willOpen = menu.hidden;
                closeProjectCardMenus(willOpen ? card : null);
                menu.hidden = !willOpen;
                menuButton.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            });

            menu.addEventListener('click', function (event) {
                var actionButton = event.target.closest('[data-project-card-action]');
                if (!actionButton) return;
                menu.hidden = true;
                menuButton.setAttribute('aria-expanded', 'false');
                runProjectCardAction(card, actionButton.dataset.projectCardAction);
            });

            updateProjectDueStatus(card);
        });
    }

    function setDetailText(selector, value) {
        var element = detailsPanel && detailsPanel.querySelector(selector);
        if (element) element.textContent = value;
    }

    function syncProjectTeam(card) {
        if (!detailsPanel || !card) return;
        var sourceTeam = card.querySelector('.project-avatar-stack');
        var detailTeam = detailsPanel.querySelector('.project-detail-avatar-stack');
        if (!sourceTeam || !detailTeam) return;

        var members = Array.prototype.map.call(sourceTeam.children, function (member) {
            return member.cloneNode(true);
        });
        detailTeam.replaceChildren.apply(detailTeam, members);

        var sourceLabel = sourceTeam.getAttribute('aria-label') || 'Equipo asignado';
        detailTeam.setAttribute('aria-label', sourceLabel.replace('asignados', 'del equipo').replace('asignado', 'del equipo'));

        if (window.gsap && !reducedMotion.matches && members.length) {
            window.gsap.fromTo(members,
                { autoAlpha: 0, scale: .82, x: -5 },
                { autoAlpha: 1, scale: 1, x: 0, duration: .28, stagger: .045, ease: 'back.out(1.5)', clearProps: 'opacity,visibility,transform' }
            );
        }
    }

    function readProjectProgress(card) {
        if (card._projectProgress) return card._projectProgress;
        var taskLabel = card.querySelector('.project-progress-labels > span:first-child');
        var progressbar = card.querySelector('.project-progress-track');
        var taskMatch = taskLabel ? taskLabel.textContent.match(/(\d+)\s*\/\s*(\d+)/) : null;
        return {
            completedTasks: taskMatch ? Number(taskMatch[1]) : 0,
            totalTasks: taskMatch ? Number(taskMatch[2]) : 0,
            percentage: progressbar ? Number(progressbar.getAttribute('aria-valuenow')) || 0 : 0
        };
    }

    function syncProjectProgress(card) {
        if (!detailsPanel || !card) return;
        var data = readProjectProgress(card);
        var progress = detailsPanel.querySelector('[data-detail-progress]');
        var progressbar = detailsPanel.querySelector('[data-detail-progressbar]');
        setDetailText('[data-detail-progress-label]', data.percentage + '%');
        setDetailText('[data-detail-task-count]', data.completedTasks + ' de ' + data.totalTasks + ' tareas completadas');
        if (progress) progress.style.setProperty('--detail-progress', data.percentage + '%');
        if (progressbar) progressbar.setAttribute('aria-valuenow', String(data.percentage));
    }

    function syncProjectHeadingMeta(card) {
        if (!detailsPanel || !card) return;
        var priority = detailsPanel.querySelector('[data-detail-priority]');
        var due = detailsPanel.querySelector('[data-detail-due]');
        var dueText = detailsPanel.querySelector('[data-detail-due-copy]');
        var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
        if (priority) {
            priority.className = 'project-detail-priority project-detail-priority--' + card.dataset.priority;
            priority.textContent = priorityLabels[card.dataset.priority] || 'Media';
        }
        if (due) {
            var sourceDue = card.querySelector('.project-due-status');
            var dueCopy = sourceDue && sourceDue.firstElementChild;
            if (dueText) dueText.textContent = dueCopy ? dueCopy.textContent : 'Sin fecha';
            due.className = 'project-detail-due'
                + (card.classList.contains('is-overdue') ? ' project-detail-due--overdue' : '')
                + (card.classList.contains('is-due-soon') ? ' project-detail-due--soon' : '');
        }
    }

    function parseProjectMoney(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value !== 'string' || /por definir/i.test(value)) return null;
        var normalized = value.replace(/[^0-9.-]/g, '');
        var number = Number(normalized);
        return Number.isFinite(number) ? number : null;
    }

    function syncProjectBudget(detail) {
        if (!detailsPanel || !detail) return;
        var budgetSection = detailsPanel.querySelector('.project-detail-budget');
        var budgetbar = detailsPanel.querySelector('[data-detail-budgetbar]');
        var budgetFill = detailsPanel.querySelector('[data-detail-budget-progress]');
        var total = parseProjectMoney(detail.budget);
        var spent = parseProjectMoney(detail.spent);
        var percentage = total && spent !== null ? Math.max(0, Math.round((spent / total) * 100)) : null;
        setDetailText('[data-detail-budget-spent]', detail.spent);
        setDetailText('[data-detail-budget-total]', detail.budget);
        setDetailText('[data-detail-budget-percent]', percentage === null ? 'Sin datos' : percentage + '%');
        if (budgetFill) budgetFill.style.setProperty('--detail-budget-progress', Math.min(percentage || 0, 100) + '%');
        if (budgetbar) budgetbar.setAttribute('aria-valuenow', String(Math.min(percentage || 0, 100)));
        if (budgetSection) {
            budgetSection.classList.toggle('is-warning', percentage !== null && percentage >= 80 && percentage <= 100);
            budgetSection.classList.toggle('is-over', percentage !== null && percentage > 100);
        }
    }

    function syncProjectTags(card) {
        if (!detailsPanel || !card) return;
        var detailTags = detailsPanel.querySelector('[data-detail-tags]');
        if (!detailTags) return;
        var tags = card._projectTags || Array.prototype.map.call(card.querySelectorAll('.project-card-tags .project-tag:not(.project-tag--more)'), function (tag) {
            return { label: tag.textContent, className: tag.className };
        });
        var nodes = tags.slice(0, 3).map(function (tag) {
            var element = document.createElement('span');
            element.className = tag.className || 'project-tag' + (tag.type ? ' project-tag--' + tag.type.replace(/[^a-z0-9-]/gi, '').toLowerCase() : '');
            element.textContent = tag.label;
            return element;
        });
        if (tags.length > 3) {
            var extra = document.createElement('span');
            extra.className = 'project-tag project-tag--more';
            extra.textContent = '+' + (tags.length - 3);
            nodes.push(extra);
        }
        detailTags.replaceChildren.apply(detailTags, nodes);
    }

    function animateProjectDetails() {
        if (!detailsPanel || !window.gsap || reducedMotion.matches) return;
        var sections = detailsPanel.querySelectorAll('.project-details-identity, .project-details-facts, .project-detail-progress, .project-detail-budget, .project-detail-section');
        var progressBar = detailsPanel.querySelector('[data-detail-progress]');
        var progressTrack = detailsPanel.querySelector('[data-detail-progressbar]');
        var budgetBar = detailsPanel.querySelector('[data-detail-budget-progress]');
        var budgetTrack = detailsPanel.querySelector('[data-detail-budgetbar]');
        window.gsap.killTweensOf(sections);
        window.gsap.fromTo(sections,
            { autoAlpha: .55, y: 7 },
            { autoAlpha: 1, y: 0, duration: .3, stagger: .025, ease: 'power2.out', clearProps: 'opacity,visibility,transform' }
        );
        if (progressBar && progressTrack) {
            window.gsap.killTweensOf(progressBar);
            window.gsap.fromTo(progressBar,
                { width: '0%' },
                { width: (Number(progressTrack.getAttribute('aria-valuenow')) || 0) + '%', duration: .72, ease: 'power2.out', clearProps: 'width' }
            );
        }
        if (budgetBar && budgetTrack) {
            window.gsap.killTweensOf(budgetBar);
            window.gsap.fromTo(budgetBar,
                { width: '0%' },
                { width: (Number(budgetTrack.getAttribute('aria-valuenow')) || 0) + '%', duration: .78, delay: .06, ease: 'power2.out', clearProps: 'width' }
            );
        }
    }

    function createNavbarEntryShine() {
        if (!navbarItems.length || !window.gsap) return;
        navbarItems.forEach(function (item) {
            var previousShine = item.querySelector('.technova-entry-shine');
            if (previousShine) previousShine.remove();
            var shine = document.createElement('span');
            shine.className = 'technova-entry-shine';
            item.appendChild(shine);
        });
        var shines = navbarItems.map(function (item) {
            return item.querySelector('.technova-entry-shine');
        }).filter(Boolean);
        window.gsap.fromTo(shines,
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
            }
        );
    }

    function animateProjectsEntrance() {
        if (!projectsPage || !window.gsap || reducedMotion.matches) {
            if (projectsPage) projectsPage.dataset.projectsEntry = 'complete';
            document.dispatchEvent(new CustomEvent('projects:analytics-entry-start'));
            return null;
        }

        var header = document.querySelector('.projects-header');
        var headerTitle = document.querySelector('.projects-heading');
        var headerActions = document.querySelectorAll('.projects-header-actions > *');
        var metricsViewport = document.querySelector('.project-metrics-viewport');
        var metricsChrome = document.querySelectorAll('.project-metrics-navigation > *');
        var activeMetricCard = metricCards[activeMetricIndex] || null;
        var sideMetricCards = metricCards.filter(function (card) { return card !== activeMetricCard; });
        sideMetricCards.sort(function (a, b) {
            var aIndex = metricCards.indexOf(a);
            var bIndex = metricCards.indexOf(b);
            var aDistance = Math.min(Math.abs(aIndex - activeMetricIndex), metricCards.length - Math.abs(aIndex - activeMetricIndex));
            var bDistance = Math.min(Math.abs(bIndex - activeMetricIndex), metricCards.length - Math.abs(bIndex - activeMetricIndex));
            return aDistance - bDistance;
        });
        var projectsControls = document.querySelector('.projects-controls');
        var controlsItems = projectsControls ? projectsControls.querySelectorAll('.projects-filter-strip-wrap, .projects-view-switcher') : [];
        var cardProgressBars = document.querySelectorAll('.project-progress-track > span');
        var detailProgressBar = detailsPanel ? detailsPanel.querySelector('[data-detail-progress]') : null;
        var detailProgressTrack = detailsPanel ? detailsPanel.querySelector('[data-detail-progressbar]') : null;
        var detailBudgetBar = detailsPanel ? detailsPanel.querySelector('[data-detail-budget-progress]') : null;
        var detailBudgetTrack = detailsPanel ? detailsPanel.querySelector('[data-detail-budgetbar]') : null;
        var detailSections = detailsPanel ? detailsPanel.querySelectorAll('.project-details-header, .project-details-identity, .project-details-facts, .project-detail-progress, .project-detail-budget, .project-detail-section') : [];
        var analyticsSection = document.querySelector('[data-projects-analytics]');
        var analyticsCards = analyticsSection ? analyticsSection.querySelectorAll('.projects-analytics-heading, .projects-chart-card') : [];
        var desktopDetails = detailsPanel && !window.matchMedia('(max-width: 1024px)').matches;
        var desktopNavbar = window.innerWidth > 1024;
        var navbarProfileItems = [navbarProfile, navbarLogout].filter(Boolean);
        var contentDelay = .44;
        var animatedTargets = [navbar, navbarToggle, navbarLogo, navbarItems, navbarProfileItems, header, headerTitle, headerActions, metricsViewport, metricsChrome, metricCards, projectsControls, controlsItems, projectCards, cardProgressBars, detailsPanel, detailSections, detailProgressBar, detailBudgetBar, analyticsSection, analyticsCards];

        animatedTargets.forEach(function (target) {
            if (target) window.gsap.killTweensOf(target);
        });

        projectsPage.dataset.projectsEntry = 'running';
        var timeline = window.gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
                projectsPage.dataset.projectsEntry = 'complete';
                document.dispatchEvent(new CustomEvent('technova:projects-entry-complete'));
            }
        });

        if (desktopNavbar && navbar) {
            timeline.fromTo(navbar,
                { autoAlpha: 0, y: -18, scale: .985, filter: 'blur(14px)' },
                { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .65, clearProps: 'opacity,visibility,transform,filter' }, 0);
            if (navbarLogo) timeline.fromTo(navbarLogo,
                { autoAlpha: 0, y: -8, scale: .94, filter: 'blur(7px)' },
                { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .48, clearProps: 'opacity,visibility,transform,filter' }, .16);
            if (navbarItems.length) timeline.fromTo(navbarItems,
                { autoAlpha: 0, x: -16, filter: 'blur(6px)' },
                { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: .42, stagger: .055, clearProps: 'opacity,visibility,transform,filter' }, .25);
            if (navbarProfileItems.length) timeline.fromTo(navbarProfileItems,
                { autoAlpha: 0, y: 10 },
                { autoAlpha: 1, y: 0, duration: .45, stagger: .08, clearProps: 'opacity,visibility,transform' }, .60);
            timeline.call(createNavbarEntryShine, null, .84);
        } else if (navbarToggle) {
            timeline.fromTo(navbarToggle,
                { autoAlpha: 0, y: -12, scale: .9, filter: 'blur(7px)' },
                { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .5, clearProps: 'opacity,visibility,transform,filter' }, .06);
        }

        if (header) timeline.fromTo(header, { autoAlpha: 0, y: 16, scale: .992, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .58, clearProps: 'opacity,visibility,transform,filter' }, contentDelay);
        if (headerTitle) timeline.fromTo(headerTitle, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .42, clearProps: 'opacity,visibility,transform' }, .16 + contentDelay);
        if (headerActions.length) timeline.fromTo(headerActions, { autoAlpha: 0, y: 10, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .4, stagger: .07, clearProps: 'opacity,visibility,transform' }, .27 + contentDelay);
        if (metricsViewport) timeline.fromTo(metricsViewport, { autoAlpha: 0, y: 14, filter: 'blur(5px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .45, clearProps: 'opacity,visibility,transform,filter' }, .34 + contentDelay);
        if (activeMetricCard) {
            timeline.fromTo(activeMetricCard,
                { autoAlpha: 0, '--metric-scale': .94, filter: 'blur(3px)' },
                {
                    autoAlpha: 1,
                    '--metric-scale': 1,
                    filter: 'blur(0px)',
                    duration: .48,
                    ease: 'back.out(1.25)',
                    clearProps: 'opacity,visibility,filter',
                    onComplete: function () { activeMetricCard.style.removeProperty('--metric-scale'); }
                },
                .46 + contentDelay
            );
            timeline.call(function () { animateMetricActivation(activeMetricCard); }, null, .88 + contentDelay);
        }
        if (sideMetricCards.length) {
            timeline.fromTo(sideMetricCards,
                {
                    autoAlpha: 0,
                    '--metric-entry-x': function (index, card) {
                        var cardIndex = metricCards.indexOf(card);
                        var slot = cardIndex - activeMetricIndex;
                        if (slot > metricCards.length / 2) slot -= metricCards.length;
                        if (slot < -metricCards.length / 2) slot += metricCards.length;
                        return (slot < 0 ? -28 : 28) + 'px';
                    },
                    '--metric-scale': .9
                },
                {
                    opacity: function (index, card) { return card.classList.contains('is-far') ? .28 : .68; },
                    visibility: 'visible',
                    '--metric-entry-x': '0px',
                    '--metric-scale': 1,
                    duration: .44,
                    stagger: .065,
                    ease: 'power3.out',
                    onComplete: function () {
                        sideMetricCards.forEach(function (card) {
                            card.style.removeProperty('opacity');
                            card.style.removeProperty('visibility');
                            card.style.removeProperty('--metric-entry-x');
                            card.style.removeProperty('--metric-scale');
                        });
                    }
                },
                .57 + contentDelay
            );
        }
        if (metricsChrome.length) timeline.fromTo(metricsChrome, { autoAlpha: 0, y: 7, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .3, stagger: .05, clearProps: 'opacity,visibility,transform' }, .98 + contentDelay);
        if (projectsControls) timeline.fromTo(projectsControls, { autoAlpha: 0, y: 12, filter: 'blur(4px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .38, clearProps: 'opacity,visibility,transform,filter' }, .5 + contentDelay);
        if (controlsItems.length) timeline.fromTo(controlsItems, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: .28, stagger: .06, clearProps: 'opacity,visibility,transform' }, .58 + contentDelay);
        if (projectCards.length) timeline.fromTo(projectCards, { autoAlpha: 0, y: 18, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .44, stagger: .055, clearProps: 'opacity,visibility,transform' }, .67 + contentDelay);
        if (cardProgressBars.length) {
            timeline.fromTo(cardProgressBars,
                { width: '0%' },
                {
                    width: function (index, bar) {
                        var track = bar.closest('.project-progress-track');
                        return ((track && Number(track.getAttribute('aria-valuenow'))) || 0) + '%';
                    },
                    duration: .78,
                    stagger: .055,
                    ease: 'power2.out',
                    clearProps: 'width'
                },
                .82 + contentDelay
            );
        }
        if (desktopDetails) {
            timeline.fromTo(detailsPanel, { autoAlpha: 0, x: 18, filter: 'blur(5px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: .46, clearProps: 'opacity,visibility,transform,filter' }, .72 + contentDelay);
            if (detailSections.length) timeline.fromTo(detailSections, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .3, stagger: .035, clearProps: 'opacity,visibility,transform' }, .84 + contentDelay);
            if (detailProgressBar && detailProgressTrack) {
                timeline.fromTo(detailProgressBar,
                    { width: '0%' },
                    { width: (Number(detailProgressTrack.getAttribute('aria-valuenow')) || 0) + '%', duration: .78, ease: 'power2.out', clearProps: 'width' },
                    .96 + contentDelay
                );
            }
            if (detailBudgetBar && detailBudgetTrack) {
                timeline.fromTo(detailBudgetBar,
                    { width: '0%' },
                    { width: (Number(detailBudgetTrack.getAttribute('aria-valuenow')) || 0) + '%', duration: .82, ease: 'power2.out', clearProps: 'width' },
                    1.03 + contentDelay
                );
            }
        }
        if (analyticsSection) {
            timeline.fromTo(analyticsSection,
                { autoAlpha: 0, y: 20, filter: 'blur(5px)' },
                { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .5, clearProps: 'opacity,visibility,transform,filter' },
                1.08 + contentDelay
            );
            if (analyticsCards.length) timeline.fromTo(analyticsCards,
                { autoAlpha: 0, y: 12, scale: .99 },
                { autoAlpha: 1, y: 0, scale: 1, duration: .38, stagger: .08, clearProps: 'opacity,visibility,transform' },
                1.18 + contentDelay
            );
            timeline.call(function () {
                document.dispatchEvent(new CustomEvent('projects:analytics-entry-start'));
            }, null, 1.18 + contentDelay);
        }

        return timeline;
    }

    function selectProject(card, openOnMobile) {
        if (!detailsPanel || !card) return;
        var detail = projectDetails[card.dataset.projectId];
        if (!detail) return;
        projectCards.forEach(function (projectCard) {
            var selected = projectCard === card;
            projectCard.classList.toggle('is-selected', selected);
            projectCard.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        var icon = detailsPanel.querySelector('[data-detail-icon]');
        var status = detailsPanel.querySelector('[data-detail-status]');
        if (icon) icon.src = detail.icon;
        if (status) { status.className = 'project-status ' + detail.statusClass; status.textContent = detail.status; }
        setDetailText('[data-detail-name]', detail.name);
        setDetailText('[data-detail-client]', detail.client);
        setDetailText('[data-detail-manager]', detail.manager);
        setDetailText('[data-detail-start]', detail.start);
        setDetailText('[data-detail-end]', detail.end);
        setDetailText('[data-detail-budget]', detail.budget);
        setDetailText('[data-detail-spent]', detail.spent);
        setDetailText('[data-detail-description]', detail.description);
        syncProjectTeam(card);
        syncProjectProgress(card);
        syncProjectHeadingMeta(card);
        syncProjectBudget(detail);
        syncProjectTags(card);
        animateProjectDetails();
        if (projectsPage) {
            projectsPage.classList.remove('details-collapsed');
            if (openOnMobile && window.matchMedia('(max-width: 1024px)').matches) projectsPage.classList.add('details-open');
        }
        document.dispatchEvent(new CustomEvent('projects:selection-change', { detail: { projectId: card.dataset.projectId } }));
    }

    if (projectSearchInput) {
        projectSearchInput.addEventListener('input', function () {
            if (projectsFilterController) projectsFilterController.abort();
            setProjectSearch(projectSearchInput.value);
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var filter = button.dataset.projectFilter;

            activateButton(filterButtons, button);

            if (projectsPage) projectsPage.dataset.projectFilter = filter;
            advancedFilterState.status = filter;
            if (advancedFilterForm && advancedFilterForm.elements.status) advancedFilterForm.elements.status.value = filter;
            updateAdvancedFilterBadge();
            serverFilteredProjectIds = null;
            applyProjectFilter(filter, true);
            requestFilteredProjects();

            document.dispatchEvent(new CustomEvent('projects:filter-change', {
                detail: { filter: filter }
            }));
        });
    });

    if (advancedFilterOpenButton) advancedFilterOpenButton.addEventListener('click', openAdvancedFilters);
    advancedFilterCloseButtons.forEach(function (button) { button.addEventListener('click', closeAdvancedFilters); });

    if (advancedFilterForm) {
        advancedFilterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            readAdvancedFilterForm();
            syncQuickFilterWithAdvancedStatus();
            updateAdvancedFilterBadge();
            serverFilteredProjectIds = null;
            applyProjectFilter(advancedFilterState.status, true);
            requestFilteredProjects();
            document.dispatchEvent(new CustomEvent('projects:advanced-filter-change', { detail: { filters: Object.assign({}, advancedFilterState) } }));
            closeAdvancedFilters();
        });

        advancedFilterForm.addEventListener('reset', function () {
            window.setTimeout(function () {
                advancedFilterState = { status: 'all', priority: 'all', due: 'all', progress: 'all', budget: 'all', tag: 'all', person: '', sort: 'default' };
                syncQuickFilterWithAdvancedStatus();
                updateAdvancedFilterBadge();
                serverFilteredProjectIds = null;
                applyProjectFilter('all', true);
                requestFilteredProjects();
                document.dispatchEvent(new CustomEvent('projects:advanced-filter-change', { detail: { filters: Object.assign({}, advancedFilterState) } }));
            }, 0);
        });

        advancedFilterPanel.addEventListener('keydown', function (event) {
            if (event.key !== 'Tab') return;
            var focusable = Array.prototype.slice.call(advancedFilterPanel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])'));
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
    }

    filterScrollButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (!filterStrip) return;
            var direction = button.dataset.filterScroll === 'previous' ? -1 : 1;
            filterStrip.scrollBy({ left: direction * Math.max(140, filterStrip.clientWidth * .7), behavior: 'smooth' });
        });
    });

    if (filterStrip) filterStrip.addEventListener('scroll', updateFilterScrollControls, { passive: true });
    window.addEventListener('resize', updateFilterScrollControls);

    viewButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var view = button.dataset.projectView;

            activateButton(viewButtons, button);

            if (projectsPage) projectsPage.dataset.projectView = view;
            applyProjectFilter(projectsPage ? projectsPage.dataset.projectFilter || 'all' : 'all', false);

            document.dispatchEvent(new CustomEvent('projects:view-change', {
                detail: { view: view }
            }));
        });
    });

    projectCards.forEach(function (card) {
        card.addEventListener('click', function (event) {
            if (event.target.closest('button')) return;
            selectProject(card, true);
        });
        card.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            selectProject(card, true);
        });
    });

    detailsCloseButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (!projectsPage) return;
            projectsPage.classList.remove('details-open');
            if (!window.matchMedia('(max-width: 1024px)').matches) projectsPage.classList.add('details-collapsed');
        });
    });

    if (quickActionsTrigger) {
        quickActionsTrigger.addEventListener('click', function () {
            setQuickActionsOpen(quickActionsTrigger.getAttribute('aria-expanded') !== 'true', false);
        });
    }

    quickActionsCloseButtons.forEach(function (button) {
        button.addEventListener('click', function () { setQuickActionsOpen(false, true); });
    });

    quickActionButtons.forEach(function (button) {
        button.addEventListener('click', function () { runProjectQuickAction(button); });
    });

    if (navbarToggle) {
        navbarToggle.addEventListener('click', function () {
            if (window.innerWidth > 1024 || !window.gsap || reducedMotion.matches) return;
            window.requestAnimationFrame(function () {
                if (!navbar || !navbar.classList.contains('menu-open')) return;
                window.gsap.fromTo(navbarItems,
                    { autoAlpha: 0, x: -12 },
                    { autoAlpha: 1, x: 0, duration: .32, stagger: .04, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }
                );
                var profileItems = [navbarProfile, navbarLogout].filter(Boolean);
                if (profileItems.length) {
                    window.gsap.fromTo(profileItems,
                        { autoAlpha: 0, y: 8 },
                        { autoAlpha: 1, y: 0, duration: .35, stagger: .06, delay: .15, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }
                    );
                }
            });
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (quickActionsTrigger && quickActionsTrigger.getAttribute('aria-expanded') === 'true') {
                setQuickActionsOpen(false, true);
                return;
            }
            closeAdvancedFilters();
            closeProjectCardMenus(null);
            if (projectsPage) projectsPage.classList.remove('details-open');
        }
    });

    document.addEventListener('click', function (event) {
        if (quickActionsTrigger && quickActionsTrigger.getAttribute('aria-expanded') === 'true' && !event.target.closest('.project-quick-actions')) {
            setQuickActionsOpen(false, false);
        }
        if (event.target.closest('.project-card-actions') || event.target.closest('.project-card-menu-panel')) return;
        closeProjectCardMenus(null);
    });

    if (projectsPage) {
        projectsPage.dataset.projectFilter = 'all';
        projectsPage.dataset.projectView = 'cards';
    }

    initializeProjectCardEnhancements();
    initializeProjectsCursorLight();
    updateProjectFilterCounts();
    updateFilterScrollControls();
    updateAdvancedFilterBadge();
    applyProjectFilter('all', false);
    var initiallySelectedProject = document.querySelector('.project-card.is-selected');
    if (initiallySelectedProject) selectProject(initiallySelectedProject, false);

    animateProjectsEntrance();
})();
