(function () {
    'use strict';
    var page = document.querySelector('.tasks-board-page');
    if (!page) return;
    var board = document.querySelector('[data-tasks-board]');
    var columns = Array.prototype.slice.call(document.querySelectorAll('[data-board-status]'));
    var search = document.querySelector('[data-board-search]');
    var priority = document.querySelector('[data-board-priority]');
    var summary = document.querySelector('[data-board-summary]');
    var detail = document.querySelector('[data-board-detail]');
    var backdrop = document.querySelector('.task-detail-backdrop');
    var editor = document.querySelector('[data-board-editor]');
    var editorBackdrop = document.querySelector('.task-editor-backdrop');
    var editorForm = editor && editor.querySelector('[data-board-editor-form]');
    var editorMessage = editor && editor.querySelector('[data-board-editor-message]');
    var tasksApi = window.TechNovaTasksApi || null;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var activeId = '';
    var draggedId = '';
    var statusLabels = { pending: 'Pendiente', 'in-progress': 'En progreso', review: 'En revisión', blocked: 'Bloqueada', completed: 'Completada' };
    var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
    var assigneeLabels = { 'josue-islas': 'Josue Islas', 'daira-alvarez': 'Daira Alvarez', 'paola-rivera': 'Paola Rivera', 'angela-guerrero': 'Angela Guerrero' };
    var tasks = [
        { id:'task-login-reservas', title:'Diseñar disponibilidad de reservas', description:'Conectar fechas, ocupación y confirmación del huésped.', project:'Portal de Reservas Nova', projectImage:'assets/img/tasks/table/sistema-hotelero.png', assignee:'Josue Islas', avatar:'assets/img/tasks/table/assignee-default.png', priority:'low', status:'pending', progress:15, due:'Septiembre 14', comments:1, attachments:0 },
        { id:'task-login-viomp3', title:'Integrar reproductor multimedia', description:'Implementar controles, cola y biblioteca de audio.', project:'App Móvil VioMp3', projectImage:'assets/img/tasks/table/app-movil-viomp3.png', assignee:'Josue Islas', avatar:'assets/img/tasks/table/assignee-default.png', priority:'high', status:'in-progress', progress:72, due:'Agosto 30', comments:4, attachments:2 },
        { id:'task-login-web-store', title:'Optimizar proceso de checkout', description:'Validar carrito, pagos y confirmación de compra.', project:'Web store', projectImage:'assets/img/tasks/table/web-store.png', assignee:'Daira Alvarez', avatar:'assets/img/tasks/table/assignee-default.png', priority:'medium', status:'in-progress', progress:45, due:'Septiembre 2', comments:2, attachments:1 },
        { id:'task-login-hotel', title:'Configurar gestión de habitaciones', description:'Definir disponibilidad, tarifas y estados de limpieza.', project:'Sistema hotelero', projectImage:'assets/img/tasks/table/sistema-hotelero.png', assignee:'Paola Rivera', avatar:'assets/img/tasks/table/assignee-default.png', priority:'low', status:'in-progress', progress:30, due:'Septiembre 5', comments:0, attachments:2 },
        { id:'task-login-worklist', title:'Implementar tablero colaborativo', description:'Organizar listas, responsables y actualización en tiempo real.', project:'App worklist', projectImage:'assets/img/tasks/table/app-worklist.png', assignee:'Angela Guerrero', avatar:'assets/img/tasks/table/assignee-default.png', priority:'high', status:'review', progress:86, due:'Septiembre 10', comments:5, attachments:3 },
        { id:'task-login-taskflow', title:'Automatizar flujo de tareas', description:'Definir reglas, dependencias y alertas de vencimiento.', project:'App TaskFlow', projectImage:'assets/img/tasks/table/app-taskflow.png', assignee:'Josue Islas', avatar:'assets/img/tasks/table/assignee-default.png', priority:'medium', status:'completed', progress:100, due:'Septiembre 20', comments:3, attachments:1 }
    ];

    function normalize(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    function filteredTasks() {
        var query = normalize(search && search.value);
        var selectedPriority = priority ? priority.value : 'all';
        return tasks.filter(function (task) {
            return (selectedPriority === 'all' || task.priority === selectedPriority) && (!query || normalize([task.title, task.project, task.assignee].join(' ')).indexOf(query) !== -1);
        });
    }
    function createCard(task) {
        var card = document.createElement('article');
        card.className = 'kanban-card';
        card.tabIndex = 0;
        card.draggable = true;
        card.dataset.taskId = task.id;
        card.dataset.priority = task.priority;
        card.dataset.taskStatus = task.status;
        card.setAttribute('aria-label', task.title + ', ' + statusLabels[task.status]);
        card.innerHTML = '<header><h3></h3><span aria-hidden="true">•••</span></header><p></p><div class="kanban-card-project"><img alt="" /><span></span></div><div class="kanban-card-meta"><div class="kanban-card-assignee"><img alt="" /><span></span></div><strong class="kanban-card-priority"></strong></div><div class="kanban-card-progress"><div><span></span></div><strong></strong></div><footer class="kanban-card-footer"><time></time><span><b></b><b></b></span></footer>';
        card.querySelector('h3').textContent = task.title;
        card.querySelector(':scope > p').textContent = task.description;
        card.querySelector('.kanban-card-project img').src = task.projectImage;
        card.querySelector('.kanban-card-project span').textContent = task.project;
        card.querySelector('.kanban-card-assignee img').src = task.avatar;
        card.querySelector('.kanban-card-assignee span').textContent = task.assignee;
        card.querySelector('.kanban-card-priority').textContent = priorityLabels[task.priority];
        card.querySelector('.kanban-card-progress span').style.width = task.progress + '%';
        card.querySelector('.kanban-card-progress strong').textContent = task.progress + '%';
        card.querySelector('time').textContent = task.due;
        var counters = card.querySelectorAll('.kanban-card-footer b');
        counters[0].textContent = '💬 ' + task.comments;
        counters[1].textContent = '▣ ' + task.attachments;
        return card;
    }
    function renderBoard() {
        var visible = filteredTasks();
        columns.forEach(function (column) {
            var status = column.dataset.boardStatus;
            var zone = column.querySelector('[data-board-dropzone]');
            var items = visible.filter(function (task) { return task.status === status; });
            zone.replaceChildren.apply(zone, items.map(createCard));
            column.querySelector('[data-board-count]').textContent = String(items.length);
        });
        if (summary) summary.textContent = visible.length + (visible.length === 1 ? ' tarea en el tablero' : ' tareas en el tablero');
    }
    function findTask(id) { return tasks.find(function (task) { return task.id === id; }); }
    function openDetail(task) {
        if (!detail || !task) return;
        activeId = task.id;
        detail.dataset.taskStatus = task.status;
        detail.querySelector('[data-board-detail-title]').textContent = task.title;
        detail.querySelector('[data-board-detail-project]').textContent = task.project;
        detail.querySelector('[data-board-detail-assignee]').textContent = task.assignee;
        var priorityBadge = detail.querySelector('[data-board-detail-priority]');
        priorityBadge.textContent = priorityLabels[task.priority];
        priorityBadge.className = 'task-priority task-priority--' + task.priority;
        detail.querySelector('[data-board-detail-status]').textContent = statusLabels[task.status];
        detail.querySelector('[data-board-detail-due]').textContent = task.due;
        detail.querySelector('[data-board-detail-description]').textContent = task.description;
        detail.querySelector('[data-board-detail-progress-value]').textContent = task.progress + '%';
        detail.querySelector('[data-board-detail-progress]').style.width = task.progress + '%';
        detail.querySelector('[data-board-open-list]').href = 'tareas.html?task=' + encodeURIComponent(task.id);
        var subtasks = detail.querySelector('[data-board-subtasks]');
        subtasks.innerHTML = '<label class="task-detail-subtask"><input type="checkbox" checked /><span>Revisar requisitos del proyecto</span></label><label class="task-detail-subtask"><input type="checkbox" ' + (task.progress >= 65 ? 'checked' : '') + ' /><span>Completar implementación principal</span></label><label class="task-detail-subtask"><input type="checkbox" ' + (task.progress === 100 ? 'checked' : '') + ' /><span>Validar criterios de aceptación</span></label>';
        detail.hidden = false;
        backdrop.hidden = false;
        document.body.classList.add('task-detail-open');
        if (window.gsap && !reducedMotion.matches) window.gsap.fromTo(detail,{x:34,autoAlpha:0},{x:0,autoAlpha:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity,visibility'});
    }
    function closeDetail() { if (!detail || detail.hidden) return; detail.hidden = true; backdrop.hidden = true; document.body.classList.remove('task-detail-open'); activeId = ''; }
    function openEditor(status) {
        if (!editor || !editorForm) return;
        closeDetail();
        editorForm.reset();
        editorForm.elements.status.value = statusLabels[status] ? status : 'pending';
        editorForm.elements.priority.value = 'medium';
        editorForm.elements.assignee.value = 'josue-islas';
        if (editorMessage) editorMessage.textContent = '';
        editor.hidden = false;
        editorBackdrop.hidden = false;
        document.body.classList.add('task-editor-open');
        var titleField = editorForm.elements.title;
        if (titleField) titleField.focus({ preventScroll: true });
        if (window.gsap && !reducedMotion.matches) window.gsap.fromTo(editor,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.28,ease:'power3.out',clearProps:'transform,opacity,visibility'});
    }
    function closeEditor() {
        if (!editor || editor.hidden) return;
        editor.hidden = true;
        editorBackdrop.hidden = true;
        editor.classList.remove('is-saving');
        document.body.classList.remove('task-editor-open');
    }
    function formatDueDate(value) {
        if (!value) return 'Sin fecha';
        var date = new Date(value + 'T12:00:00');
        if (Number.isNaN(date.getTime())) return 'Sin fecha';
        var formatted = new Intl.DateTimeFormat('es-MX',{month:'long',day:'numeric'}).format(date);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    function createFallbackTask(payload, response) {
        var saved = response && (response.item || response.task || response.data || response);
        var normalized = tasksApi && saved && typeof tasksApi.normalizeTask === 'function' ? tasksApi.normalizeTask(saved) : null;
        return {
            id: normalized ? normalized.id : 'task-board-' + Date.now(),
            title: normalized ? normalized.title : payload.title,
            description: normalized ? normalized.description : payload.description || 'Sin descripción',
            project: normalized ? normalized.project.name : 'App TaskFlow',
            projectImage: normalized ? normalized.project.image : 'assets/img/tasks/table/app-taskflow.png',
            assignee: normalized ? normalized.assignee.name : assigneeLabels[payload.assignee] || 'Sin asignar',
            avatar: normalized ? normalized.assignee.avatar : 'assets/img/tasks/table/assignee-default.png',
            priority: normalized ? normalized.priority : payload.priority,
            status: normalized ? normalized.status : payload.status,
            progress: normalized ? normalized.progress : payload.status === 'completed' ? 100 : 0,
            due: normalized ? formatDueDate(normalized.dueDate) : formatDueDate(payload.dueDate),
            comments: 0,
            attachments: 0
        };
    }
    function moveTask(taskId, status) {
        var task = findTask(taskId);
        if (!task || task.status === status) return;
        var previous = task.status;
        task.status = status;
        if (status === 'completed') task.progress = 100;
        renderBoard();
        document.dispatchEvent(new CustomEvent('tasks:board-move',{detail:{taskId:taskId,status:status,previousStatus:previous}}));
    }
    board.addEventListener('click',function(event){var card=event.target.closest('.kanban-card');if(card)openDetail(findTask(card.dataset.taskId));});
    board.addEventListener('keydown',function(event){var card=event.target.closest('.kanban-card');if(card&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openDetail(findTask(card.dataset.taskId));}});
    board.addEventListener('dragstart',function(event){var card=event.target.closest('.kanban-card');if(!card)return;draggedId=card.dataset.taskId;card.classList.add('is-dragging');event.dataTransfer.effectAllowed='move';});
    board.addEventListener('dragend',function(event){var card=event.target.closest('.kanban-card');if(card)card.classList.remove('is-dragging');columns.forEach(function(column){column.querySelector('[data-board-dropzone]').classList.remove('is-drag-over');});draggedId='';});
    columns.forEach(function(column){var zone=column.querySelector('[data-board-dropzone]');zone.addEventListener('dragover',function(event){event.preventDefault();zone.classList.add('is-drag-over');});zone.addEventListener('dragleave',function(){zone.classList.remove('is-drag-over');});zone.addEventListener('drop',function(event){event.preventDefault();zone.classList.remove('is-drag-over');moveTask(draggedId,column.dataset.boardStatus);});});
    if(search)search.addEventListener('input',renderBoard);
    if(priority)priority.addEventListener('change',renderBoard);
    document.querySelectorAll('[data-board-detail-close]').forEach(function(button){button.addEventListener('click',closeDetail);});
    document.querySelector('[data-board-complete]').addEventListener('click',function(){var task=findTask(activeId);if(!task)return;moveTask(task.id,'completed');openDetail(task);});
    document.querySelectorAll('[data-board-add],[data-board-create]').forEach(function(button){button.addEventListener('click',function(){var status=button.dataset.boardAdd||'pending';document.dispatchEvent(new CustomEvent('tasks:board-create-request',{detail:{status:status}}));openEditor(status);});});
    document.querySelectorAll('[data-board-editor-close]').forEach(function(button){button.addEventListener('click',closeEditor);});
    if(editorForm)editorForm.addEventListener('submit',function(event){
        event.preventDefault();
        if(!editorForm.reportValidity())return;
        var data=new FormData(editorForm);
        var payload={title:String(data.get('title')||'').trim(),description:String(data.get('description')||'').trim(),status:String(data.get('status')||'pending'),priority:String(data.get('priority')||'medium'),assignee:String(data.get('assignee')||'josue-islas'),dueDate:String(data.get('dueDate')||'')};
        editor.classList.add('is-saving');
        if(editorMessage)editorMessage.textContent='';
        var saveRequest=tasksApi&&typeof tasksApi.save==='function'?tasksApi.save('',payload):Promise.resolve(null);
        saveRequest.then(function(response){tasks.push(createFallbackTask(payload,response));renderBoard();closeEditor();document.dispatchEvent(new CustomEvent('tasks:board-create',{detail:{task:tasks[tasks.length-1],source:response?'api':'fallback'}}));}).catch(function(error){editor.classList.remove('is-saving');if(editorMessage)editorMessage.textContent=error&&error.message?error.message:'No se pudo crear la tarea. Intenta nuevamente.';});
    });
    document.addEventListener('keydown',function(event){if(event.key==='Escape'&&editor&&!editor.hidden)closeEditor();else if(event.key==='Escape')closeDetail();});
    renderBoard();
})();
