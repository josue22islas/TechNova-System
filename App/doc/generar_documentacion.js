const fs = require('fs');
const path = require('path');
const {
  AlignmentType, Document, Footer, Header, HeadingLevel, PageBreak, PageNumber,
  Packer, Paragraph, ShadingType, Table, TableCell, TableOfContents, TableRow,
  TextRun, WidthType
} = require('docx');

const OUT = __dirname;
const VERSION = '1.3.0';
const TASKS_VERSION = '2.0.0';
const TASKS_BOARD_VERSION = '1.0.0';
const DATE = '30 de agosto de 2026';
const C = { blue: '4C7DFF', navy: '0B1230', ink: '17213C', muted: '5D6988', pale: 'EAF0FF', white: 'FFFFFF' };

function run(value, o = {}) {
  return new TextRun({ text: String(value), font: o.font || 'Arial', color: o.color || C.ink, size: o.size || 20, bold: o.bold, italics: o.italics });
}
function p(value = '', o = {}) {
  return new Paragraph({ alignment: o.alignment, spacing: { before: o.before || 0, after: o.after === undefined ? 120 : o.after, line: o.line || 276 }, children: Array.isArray(value) ? value : [run(value, o)] });
}
function h(value, level = 1) {
  const levels = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3];
  return new Paragraph({ heading: levels[level - 1], children: [run(value, { bold: true, color: level === 1 ? C.navy : C.blue, size: level === 1 ? 30 : level === 2 ? 25 : 22 })] });
}
function bullet(value) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 70, line: 260 }, children: [run(value)] });
}
function code(value) {
  return new Paragraph({ shading: { type: ShadingType.CLEAR, fill: 'F3F6FC', color: 'auto' }, indent: { left: 180, right: 180 }, spacing: { before: 40, after: 100 }, children: [run(value, { font: 'Consolas', size: 18, color: '24345A' })] });
}
function cell(value, width, header = false) {
  return new TableCell({ width: { size: width, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: header ? C.navy : C.white, color: 'auto' }, margins: { top: 90, bottom: 90, left: 100, right: 100 }, children: [p(value, { after: 0, line: 240, color: header ? C.white : C.ink, bold: header, size: 18 })] });
}
function grid(headers, rows, widths) {
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows: [new TableRow({ tableHeader: true, children: headers.map((v, i) => cell(v, widths[i], true)) }), ...rows.map(row => new TableRow({ children: row.map((v, i) => cell(v, widths[i])) }))] });
}
function note(title, body) {
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows: [new TableRow({ children: [new TableCell({ width: { size: 9360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: C.pale, color: 'auto' }, margins: { top: 150, bottom: 150, left: 180, right: 180 }, children: [p(title, { bold: true, color: C.blue, after: 60 }), p(body, { after: 0 })] })] })] });
}
const br = () => new Paragraph({ children: [new PageBreak()] });

function cover(view, subtitle, version = VERSION) {
  return [
    p('TECHNOVA SOLUTIONS', { alignment: AlignmentType.CENTER, color: C.blue, bold: true, size: 22, before: 700, after: 700 }),
    p('DOCUMENTACIÓN TÉCNICA', { alignment: AlignmentType.CENTER, color: C.navy, bold: true, size: 42, after: 140 }),
    p(view.toUpperCase(), { alignment: AlignmentType.CENTER, color: C.blue, bold: true, size: 48, after: 320 }),
    p(subtitle, { alignment: AlignmentType.CENTER, color: C.muted, size: 24, after: 850 }),
    note('Estado del documento', `Versión ${version} · ${DATE} · Documento vivo de mantenimiento`),
    p('C:\\xampp\\htdocs\\xampp\\TechNova Sistema\\App', { alignment: AlignmentType.CENTER, color: C.muted, size: 18, before: 650 }),
    p('Frontend implementado · Backend preparado para integración posterior', { alignment: AlignmentType.CENTER, color: C.muted, italics: true, before: 280 })
  ];
}

function frontArchitecture(entry, css, scripts) {
  return [
    h('Arquitectura de la vista'),
    p('La aplicación utiliza HTML semántico, CSS modular y JavaScript de navegador sin framework. Chart.js resuelve las gráficas y GSAP controla animaciones que requieren línea de tiempo. Los valores estáticos son fallback mientras los endpoints estén vacíos.'),
    grid(['Capa', 'Responsabilidad', 'Elemento principal'], [
      ['Estructura', 'Markup, accesibilidad y puntos data-*', entry],
      ['Presentación', 'Layout, Liquid Glass, responsive y estados', css],
      ['Comportamiento', 'Interacción, DOM, eventos y animaciones', scripts],
      ['Datos', 'Fetch JSON, validación y fallback', 'Atributos data-*-api y clientes JS'],
      ['Backend futuro', 'Sesión, permisos, negocio y persistencia', 'API PHP/JSON fuera de App']
    ], [1500, 3900, 3960]),
    h('Reglas de arquitectura', 2),
    bullet('No introducir PHP dentro del HTML; consumir JSON mediante Fetch.'),
    bullet('Mantener el orden de carga CSS y JavaScript.'),
    bullet('Conservar los valores estáticos como fallback.'),
    bullet('Usar atributos data-* como contrato estable.'),
    bullet('Respetar prefers-reduced-motion y los breakpoints.'),
    bullet('Actualizar el Word y su historial con cada cambio de la vista.')
  ];
}

function commentConventions(sectionNumber) {
  return [
    h(`${sectionNumber}. Convenciones de comentarios en código`),
    p('Los comentarios inline funcionan como guía de mantenimiento y no sustituyen nombres claros, validaciones ni documentación técnica. Deben explicar intención, flujo, dependencias y restricciones que no son evidentes al leer una instrucción aislada.'),
    grid(['Ubicación', 'Contenido esperado'], [
      ['Cabecera JavaScript', 'Responsabilidad, entradas, salidas, eventos, API pública y dependencia con backend/GSAP/Chart.js.'],
      ['Funciones críticas', 'Motivo de la transformación, efectos sobre DOM/estado y condiciones de fallback.'],
      ['Cabecera CSS', 'Componente consumidor, relación con JavaScript, cascada y breakpoints sensibles.'],
      ['HTML', 'Mapa de secciones, atributos data-* y orden obligatorio de dependencias.'],
      ['No permitido', 'Comentarios que repitan literalmente una propiedad, código obsoleto comentado o instrucciones que ya no coincidan con el comportamiento.']
    ], [2700, 6660]),
    bullet('Actualizar el comentario cuando cambie el contrato o flujo que describe.'),
    bullet('No comentar librerías de assets/vendor ni archivos generados de terceros.'),
    bullet('Conservar comentarios breves cerca de la decisión que explican; el detalle completo permanece en este Word.'),
    bullet('Ejecutar validación de sintaxis después de comentar JavaScript y balance de estructura en CSS/HTML.')
  ];
}

const dashboard = [
  ...cover('Dashboard', 'Arquitectura, funciones, integración y mantenimiento'), br(),
  h('Control documental'),
  grid(['Versión', 'Fecha', 'Cambio', 'Responsable'], [
    ['1.0.0', '23 de agosto de 2026', 'Documento técnico inicial del Dashboard', 'Equipo TechNova'],
    ['1.1.0', '27 de agosto de 2026', 'Explicación operativa del código por módulo y flujos de ejecución', 'Equipo TechNova'],
    ['1.2.0', '27 de agosto de 2026', 'Comentarios guía incorporados en HTML, CSS y JavaScript', 'Equipo TechNova'],
    [VERSION, DATE, 'Navbar centralizado con technova-navbar.js y estado activo declarativo', 'Equipo TechNova']
  ], [1100, 1650, 4850, 1760]),
  h('Tabla de contenido'), new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-3' }), br(),
  h('1. Propósito y alcance'),
  p('Referencia técnica del Dashboard administrativo. Describe estructura, dependencias, componentes, funciones públicas, contratos de datos, responsive, animaciones, accesibilidad y criterios de mantenimiento.'),
  note('Entrada activa', 'index.html es la vista vigente. No debe confundirse con carpetas antiguas ni respaldos.'),
  ...frontArchitecture('index.html', 'css/layout, navbar, header, cards, charts, expenses, investments y responsive.css', 'technova-navbar.js, navbar.js, intro.js, dashboard-ui.js, dashboard-data.js, periods.js, expenses.js, notifications.js, investments.js, charts.js y app.js'),
  h('2. Estructura funcional'),
  grid(['Bloque', 'Responsabilidad', 'Implementación'], [
    ['Navbar lateral', 'Navegación compartida y Dashboard activo', 'technova-navbar.js + css/navbar/* + navbar.js'],
    ['Encabezado', 'Título, periodo, nuevo proyecto y notificaciones', 'css/header/* + notifications.js'],
    ['Tarjetas KPI', 'Proyectos, ingresos, ganancias, horas y clientes', 'data-kpi-* + dashboard-ui.js'],
    ['Resumen financiero', 'Ingresos, costos y ganancias por periodo', 'Chart.js + charts.js + periods.js'],
    ['Inversiones', 'Listado, gestor y estados', 'investments.js'],
    ['Gastos', 'Resumen y recurrentes', 'expenses.js'],
    ['Distribución de costos', 'Doughnut, total, leyenda y tooltip interno MXN', 'charts.js + cost-chart.css'],
    ['Notificaciones', 'Panel, lectura y acciones', 'notifications.js']
  ], [1900, 4260, 3200]),
  h('3. Inventario de archivos'),
  grid(['Ruta', 'Función'], [
    ['index.html', 'Composición, semántica y fallback.'], ['css/globals.css', 'Fuentes y reglas globales.'], ['css/layout/*', 'Estructura principal.'], ['css/navbar/*', 'Navbar compartido, toggle y estado activo.'], ['css/header/*', 'Encabezado y controles.'], ['css/cards/*', 'KPI y responsive.'], ['css/charts/*', 'Gráficas financiera y costos.'], ['css/expenses/*', 'Gastos.'], ['css/investments/*', 'Inversiones.'], ['css/notifications/*', 'Botón y panel.'], ['css/responsive.css', 'Desktop, tablet y móvil.'], ['js/dashboard-ui.js', 'Contadores y actualización KPI.'], ['js/dashboard-data.js', 'Carga opcional JSON.'], ['js/charts.js', 'Gráficas, tooltips y periodos.'], ['js/intro.js', 'Presentación GSAP.']
  ], [3200, 6160]),
  h('4. Orden de carga'),
  p('Chart.js debe cargarse antes de charts.js; GSAP antes de módulos animados; dashboard-ui.js antes de dashboard-data.js; app.js permanece al final.'),
  code('technova-navbar.js → navbar.js → chart.umd.js → gsap → intro.js → dashboard-ui.js → dashboard-data.js → periods.js → expenses.js → notifications.js → investments.js → charts.js → app.js'),
  h('5. Funciones y API frontend'),
  grid(['Interfaz', 'Responsabilidad'], [
    ['TechNovaDashboard.updateDashboardKpis(data)', 'Actualiza los cinco KPI.'],
    ['TechNovaDashboard.loadDashboardSummary(endpoint)', 'Solicita el resumen JSON y conserva fallback ante error.'],
    ['updateCostChart(values, labels)', 'Actualiza la distribución de costos.'],
    ['updateCostChartFromObject(data)', 'Adapta un objeto a la gráfica circular.'],
    ['updateFinancialChart(data)', 'Actualiza etiquetas y series financieras.'],
    ['replayFinancialChart()', 'Reproduce el trazado inicial.']
  ], [3900, 5460]),
  h('6. Cómo funciona el código del Dashboard'),
  p('Esta sección explica el comportamiento real por módulo. Cada flujo inicia con un evento o dato, pasa por una función coordinadora y termina actualizando el DOM, una gráfica o un estado accesible.'),
  h('6.1 Navbar compartido', 2),
  grid(['Código', 'Qué hace', 'Resultado'], [
    ['navbar.js → syncNavbarState()', 'Comprueba window.innerWidth. En escritorio limpia el estado móvil; en tablet/móvil conserva el menú colapsable.', 'El mismo navbar funciona sin duplicarse.'],
    ['menu-toggle click', 'Alterna la clase de apertura y actualiza aria-expanded.', 'Abre/cierra navegación y comunica el estado a lectores de pantalla.'],
    ['document keydown', 'Escucha Escape y restablece el estado cerrado.', 'Evita que el menú quede bloqueando la interfaz.'],
    ['active="dashboard"', 'technova-navbar.js genera aria-current="page".', 'Dashboard queda iluminado únicamente en index.html.']
  ], [2750, 4300, 2310]),
  code("toggleButton.addEventListener('click', function () { /* alterna estado y aria-expanded */ });"),
  h('6.2 Carga de KPI y contadores', 2),
  p('dashboard-data.js lee data-dashboard-api. Si está vacío termina sin hacer Fetch. Si existe una ruta, loadDashboardSummary() solicita JSON con credentials same-origin, valida el objeto y entrega la respuesta a updateDashboardKpis().'),
  grid(['Función', 'Proceso interno', 'Salida'], [
    ['updateDashboardKpis(responseData)', 'Busca nodos data-kpi-value y data-kpi-change por clave; normaliza prefijos, sufijos y periodo.', 'Actualiza cinco tarjetas sin reconstruir su HTML.'],
    ['parseCounterValue(text)', 'Separa número, prefijo y sufijo del texto actual.', 'Permite animar moneda, horas y cantidades.'],
    ['animateCounter(element, target)', 'Interpola desde el valor visible hasta el nuevo valor; respeta reduced motion.', 'Cambio numérico suave y reutilizable.'],
    ['startTechNovaCounters()', 'Inicia contadores cuando la presentación principal emite su señal.', 'Evita que la animación ocurra antes de mostrar la vista.']
  ], [2850, 4200, 2310]),
  code("data-dashboard-api → fetch(JSON) → updateDashboardKpis(data) → animateCounter() → DOM"),
  h('6.3 Periodos financieros y de reporte', 2),
  p('periods.js controla dos selectores. open/close/toggle administran clases, aria-expanded y clic exterior. Al elegir una opción, dispatchFinancialPeriod() emite financialPeriodChange; charts.js escucha ese evento y recalcula etiquetas y series. El periodo del reporte emite un evento separado para que el backend reciba fechas normalizadas.'),
  code("selector click → dispatchFinancialPeriod(period) → financialPeriodChange → applyFinancialPeriod() → chart.update()"),
  h('6.4 Gráfica financiera', 2),
  grid(['Pieza', 'Explicación'], [
    ['createFinancialGradients()', 'Crea rellenos sobre el contexto 2D para ingresos, costos y ganancias.'],
    ['externalFinancialTooltip()', 'Dibuja un tooltip HTML fuera del canvas para controlar formato MXN, posición y glow sin recortes.'],
    ['updateFinancialHover()', 'Sincroniza punto activo, leyenda y tooltip conforme se mueve el cursor.'],
    ['playFinancialReveal()', 'GSAP incrementa el estado de revelado y Chart.js redibuja las líneas progresivamente.'],
    ['updateFinancialChart()', 'Sustituye labels y datasets con datos del backend y conserva opciones visuales.']
  ], [3100, 6260]),
  h('6.5 Distribución de costos', 2),
  p('charts.js crea un doughnut con valores Nowa, API Claude y Figma. showItem() reemplaza temporalmente el total central por el segmento activo; setLegend() atenúa los demás elementos; externalCostTooltip() muestra nombre, importe y MXN dentro del círculo. updateCostChart() permite reemplazar valores y etiquetas sin recrear el canvas.'),
  code("hover segmento/leyenda → showItem(index) + setLegend(index) → tooltip interno → mouseleave → showTotal()"),
  h('6.6 Notificaciones', 2),
  p('notifications.js mantiene el panel, agrupación por fecha y contador. openNotificationPanel() prepara visibilidad, foco y animación; closeNotificationPanel() restaura el disparador. Las acciones optimistas actualizan primero el DOM y, cuando existe endpoint, realizan Fetch. Los errores deben restaurar o informar el estado.'),
  grid(['Función', 'Responsabilidad'], [
    ['renderNotificationGroups()', 'Agrupa elementos por Hoy, Ayer o fecha y vuelve a construir encabezados.'],
    ['updateNotificationCount()', 'Cuenta elementos no leídos y sincroniza badge/aria-label.'],
    ['markNotificationAsRead()', 'Cambia estado visual y solicita persistencia cuando hay endpoint.'],
    ['deleteSingleNotification()', 'Elimina una notificación y renderiza estado vacío si corresponde.']
  ], [3300, 6060]),
  h('6.7 Gastos e inversiones', 2),
  p('expenses.js alterna el resumen de gastos recurrentes y recalcula su interfaz desde el estado actual. investments.js controla modal, lista, tema por tipo de fondo y actualización dinámica mediante window.setInvestmentFunds(). Ambos módulos enlazan eventos una sola vez y mantienen la lógica separada del HTML.'),
  h('6.8 Presentación inicial', 2),
  p('intro.js coordina video por breakpoint, fallback y una timeline GSAP. Al llegar a los puntos adecuados emite technova:start-counters, technova:financial-chart-reveal y technova:cost-chart-reveal. Los módulos receptores animan su propio contenido, evitando dependencias directas entre implementaciones.'),
  code("intro.js emite eventos → dashboard-ui.js/charts.js reaccionan → cada módulo conserva su responsabilidad"),
  h('6.9 Flujo completo con backend', 2),
  code("PHP JSON → dashboard-data.js → validación → TechNovaDashboard.updateDashboardKpis() → atributos data-* → contadores y formato visual"),
  p('Las gráficas siguen el mismo patrón: el servidor entrega números y etiquetas; JavaScript valida, transforma y llama la función pública de actualización; Chart.js conserva estilos, tooltips y animaciones.'),
  h('7. Contrato del backend'),
  p('data-dashboard-api vacío evita solicitudes. Ruta prevista: ../api/dashboard/summary.php. El servidor debe responder JSON, validar sesión y permisos y no generar HTML.'),
  code('{ "kpis": { "projectsActive": 6, "totalRevenue": 126904, "profits": 71400, "hoursWorked": 1345, "activeClients": 2 }, "changes": {}, "periodLabel": "este mes" }'),
  bullet('Enviar importes como números; el frontend aplica formato es-MX y MXN.'),
  bullet('Usar consultas preparadas y autorización por usuario/rol.'),
  bullet('Aplicar CSRF a futuras operaciones mutables.'),
  h('8. Responsive, animación y accesibilidad'),
  p('Los cortes principales son 1280, 1024, 640 y 390 px. El navbar cambia a modo móvil. GSAP respeta prefers-reduced-motion. El atributo active del componente genera aria-current para Dashboard; botones y paneles mantienen etiquetas y estados aria.'),
  h('9. Mantenimiento y pruebas'),
  bullet('Probar desktop, tablet y móvil después de cambios de layout.'), bullet('Validar teclado, foco, Escape y notificaciones.'), bullet('Ejecutar node --check en JavaScript modificado.'), bullet('Comprobar que endpoints vacíos no realizan Fetch.'), bullet('Verificar tooltips, formatos MXN y actualización dinámica.'), bullet('Realizar cambios localizados; no sobrescribir módulos completos.'),
  h('10. Riesgos y evolución'),
  bullet('charts.js concentra varias responsabilidades y debe dividirse gradualmente por gráfica.'), bullet('Los selectores heredados de Figma requieren migración coordinada si se renombran.'), bullet('Los datos demo deben distinguirse de respuestas reales.'),
  ...commentConventions('11'),
  h('12. Actualización documental'),
  p('Ante cada modificación: registrar componente y archivos, ejecutar pruebas, incrementar versión cuando corresponda, añadir historial, regenerar este Word y revisar visualmente el resultado.')
];

const projects = [
  ...cover('Proyectos', 'Componentes, contratos, integración y mantenimiento'), br(),
  h('Control documental'),
  grid(['Versión', 'Fecha', 'Cambio', 'Responsable'], [
    ['1.0.0', '23 de agosto de 2026', 'Documento técnico inicial de Proyectos', 'Equipo TechNova'],
    ['1.1.0', '27 de agosto de 2026', 'Explicación operativa del código por módulo y flujos de ejecución', 'Equipo TechNova'],
    ['1.2.0', '27 de agosto de 2026', 'Comentarios guía incorporados en HTML, CSS y JavaScript', 'Equipo TechNova'],
    [VERSION, DATE, 'Navbar centralizado con technova-navbar.js y estado activo declarativo', 'Equipo TechNova']
  ], [1100, 1650, 4850, 1760]),
  h('Tabla de contenido'), new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-3' }), br(),
  h('1. Propósito y alcance'),
  p('Referencia técnica de la vista Proyectos: navegación, encabezado, búsqueda, métricas, filtros, modos de vista, tarjetas, detalles, acciones rápidas y analítica.'),
  note('Entrada activa', 'proyectos.html declara <technova-navbar active="projects">; el componente genera un único aria-current="page" para Proyectos.'),
  ...frontArchitecture('proyectos.html', 'css/pages/proyectos.css, projects-charts.css y estilos compartidos', 'js/api/projects-api.js, js/pages/projects.js y projects-charts.js'),
  h('2. Estructura funcional'),
  grid(['Bloque', 'Responsabilidad', 'Preparación dinámica'], [
    ['Navbar', 'Componente compartido; Proyectos activo', 'technova-navbar.js, aria-current y nav-indicator'],
    ['Encabezado', 'Buscador, filtros, creación y notificaciones', 'Debounce y eventos'],
    ['Métricas', 'Totales, completados, progreso, pendientes y valor', 'Carrusel y data-*'],
    ['Filtros rápidos', 'Todos, fijados, progreso, completados, pausados y cancelados', 'Conteos por estado'],
    ['Filtros avanzados', 'Estado, prioridad, vencimiento, avance, presupuesto y orden', 'Query validada'],
    ['Vista', 'Lista o tarjeta', 'projects:view-change'],
    ['Tarjetas', 'Identidad, fechas, prioridad, equipo, tareas y avance', 'Datos reales preparados'],
    ['Detalles', 'Resumen sincronizado de selección', 'Equipo, etiquetas, avance y presupuesto'],
    ['Acciones rápidas', 'Tareas y menú contextual', 'action + projectId'],
    ['Analítica', 'Valor, resumen y estado por cliente', 'Endpoint y Chart.js']
  ], [1850, 4250, 3260]),
  h('3. Inventario de archivos'),
  grid(['Ruta', 'Función'], [
    ['proyectos.html', 'Estructura, fallback y data-* de integración.'], ['css/pages/proyectos.css', 'Layout, tarjetas, detalles, filtros y responsive.'], ['css/pages/projects-charts.css', 'Tres gráficas de analítica.'], ['js/pages/projects.js', 'Coordinación integral de la vista.'], ['js/pages/projects-charts.js', 'Datos, periodos, tooltips y animación de gráficas.'], ['js/api/projects-api.js', 'Cliente HTTP, filtros y validación.'], ['assets/img/projects/*', 'Iconos, miniaturas y avatares.'], ['js/components/technova-navbar.js + css/navbar/* + js/navbar.js', 'Navbar compartido, estado activo y comportamiento responsive.'], ['css/notifications/* + notifications.js', 'Notificaciones compartidas.']
  ], [3500, 5860]),
  h('4. Contratos DOM'),
  grid(['Atributo', 'Uso'], [
    ['data-projects-summary-api', 'Métricas y datos base.'], ['data-projects-list-api', 'Búsqueda y filtros.'], ['data-projects-analytics-api', 'Tres gráficas.'], ['data-project-id', 'Identificador estable.'], ['data-project-search', 'Búsqueda con debounce de 350 ms.'], ['data-project-filter', 'Estado rápido.'], ['data-project-progress', 'Barra y porcentaje.'], ['data-project-team', 'Avatares dinámicos.'], ['data-project-tags', 'Etiquetas sincronizadas.']
  ], [3400, 5960]),
  h('5. Funciones principales'),
  grid(['Área', 'Funciones'], [
    ['Datos', 'updateProjectMetrics, updateProjectTeams, updateProjectCardData, loadProjectsSummary'], ['Carrusel', 'updateMetricCarousel, animateMetricValue, animateMetricActivation'], ['Filtros', 'applyProjectFilter, readAdvancedFilterForm, loadFilteredProjects'], ['Búsqueda', 'setProjectSearch, scheduleProjectSearchRequest'], ['Tarjetas', 'renderProjectTeam, renderProjectProgress, renderProjectTags, runProjectCardAction'], ['Detalles', 'selectProject, syncProjectTeam, syncProjectProgress, syncProjectBudget, syncProjectTags'], ['Acciones', 'setQuickActionsOpen, runProjectQuickAction'], ['Animación', 'animateProjectsEntrance, animateProjectDetails, createNavbarEntryShine']
  ], [2700, 6660]),
  h('6. Cómo funciona el código de Proyectos'),
  p('projects.js funciona como coordinador de página. Lee referencias del DOM una vez, mantiene el estado de filtros, búsqueda, selección y carrusel, y delega la comunicación HTTP a projects-api.js y las gráficas a projects-charts.js.'),
  h('6.1 Inicialización y estado', 2),
  grid(['Estado', 'Uso'], [
    ['projectsPage y referencias data-*', 'Conectan controles, tarjetas, detalles, filtros y endpoints sin depender de IDs visuales.'],
    ['advancedFilterState', 'Conserva combinación de estado, prioridad, vencimiento, progreso, presupuesto y orden.'],
    ['projectSearchQuery', 'Mantiene la consulta normalizada y sincroniza input, filtrado local y petición remota.'],
    ['activeMetricIndex', 'Determina qué métrica ocupa el centro del carrusel.'],
    ['selectedProjectCard', 'Fuente de verdad para el panel Detalles del proyecto.'],
    ['reducedMotion', 'Desactiva o simplifica animaciones cuando el sistema lo solicita.']
  ], [3000, 6360]),
  h('6.2 Carga del resumen y renderizado', 2),
  p('loadProjectsSummary() solo realiza Fetch cuando data-projects-summary-api contiene una ruta. Después distribuye la respuesta entre funciones pequeñas: métricas, equipos y tarjetas. Si la ruta está vacía, se conserva el contenido HTML de demostración.'),
  grid(['Función', 'Cómo transforma los datos'], [
    ['updateProjectMetrics(payload)', 'Localiza cada data-project-metric, cambia valor/variación y conserva formato monetario o porcentual.'],
    ['renderProjectTeam(card, team)', 'Crea únicamente los avatares visibles, calcula el indicador +N y actualiza aria-label con el total real.'],
    ['renderProjectProgress(card, data)', 'Limita el porcentaje entre 0 y 100, actualiza texto, aria-valuenow y ancho CSS.'],
    ['renderProjectTags(card, tags)', 'Reconstruye etiquetas con clases controladas y texto escapado por DOM.'],
    ['updateProjectCardData(payload)', 'Busca por projectId y coordina nombre, estado, fechas, tareas, presupuesto, equipo y etiquetas.']
  ], [3250, 6110]),
  code("summary-api → loadProjectsSummary() → updateProjectMetrics()/updateProjectCardData() → tarjetas → panel de detalles"),
  h('6.3 Carrusel de métricas', 2),
  p('updateMetricCarousel(nextIndex, animate) normaliza el índice de forma circular. Calcula la distancia de cada tarjeta respecto a la activa, asigna clases carousel-slot, is-near/is-far y aria-current. Botones, puntos, clic, flechas y gesto horizontal terminan llamando la misma función.'),
  code("botón / flecha / swipe → updateMetricCarousel(index) → clases de posición → GSAP → tarjeta activa centrada"),
  p('animateMetricValue() interpola el número de la tarjeta activa. animateMetricActivation() anima icono, variación e indicador. metricCarouselLocked evita interacciones superpuestas durante la transición.'),
  h('6.4 Búsqueda', 2),
  p('El evento input llama setProjectSearch(). La consulta se normaliza para comparar sin diferencias de mayúsculas o acentos y se aplica inmediatamente sobre las tarjetas disponibles. scheduleProjectSearchRequest() reinicia un temporizador de 350 ms; al dejar de escribir solicita al backend los resultados definitivos.'),
  code("input → setProjectSearch(query) → filtro local inmediato → debounce 350 ms → list-api?q=query"),
  h('6.5 Filtros rápidos y avanzados', 2),
  grid(['Función', 'Explicación'], [
    ['applyProjectFilter(filter, animate)', 'Combina estado rápido, búsqueda y filtros avanzados; oculta/no oculta tarjetas, actualiza estado vacío y anima resultados.'],
    ['updateProjectFilterCounts()', 'Cuenta tarjetas por estado y actualiza texto y aria-label de cada botón.'],
    ['readAdvancedFilterForm()', 'Convierte los campos del formulario en un objeto normalizado.'],
    ['cardMatchesAdvancedFilters(card)', 'Evalúa atributos data-* de una tarjeta cuando se usa fallback local.'],
    ['loadFilteredProjects(filters)', 'Usa TechNovaProjectsApi.listProjects(), AbortController y eventos loading/loaded/error.'],
    ['sortProjectCards()', 'Reordena el DOM según vencimiento, prioridad, progreso o nombre.']
  ], [3300, 6060]),
  h('6.6 Cliente HTTP', 2),
  p('projects-api.js no modifica la interfaz. buildProjectFilterQuery() admite únicamente valores incluidos en allowedFilters, limita q/person a 120 caracteres y limit a 100. listProjects() y getProjectAnalytics() usan GET, Accept JSON, credentials same-origin y validan la forma mínima de la respuesta.'),
  code("UI → objeto filters → buildProjectFilterQuery() → URLSearchParams → fetch → validación JSON → projects.js"),
  h('6.7 Selección y panel de detalles', 2),
  p('selectProject(card, openOnMobile) marca una sola tarjeta, extrae su información y llama las funciones sync*. El panel no mantiene una copia independiente: siempre deriva nombre, estado, fechas, equipo, avance, presupuesto y etiquetas desde la tarjeta seleccionada. En móvil añade details-open para mostrarlo como drawer.'),
  grid(['Función', 'Actualización'], [
    ['syncProjectTeam()', 'Replica integrantes y contador adicional en Equipo.'],
    ['syncProjectProgress()', 'Actualiza porcentaje, texto y barra; luego permite animación de entrada.'],
    ['syncProjectHeadingMeta()', 'Sincroniza icono, nombre, estado, vencimiento y prioridad.'],
    ['syncProjectBudget()', 'Convierte textos monetarios, calcula porcentaje usado y ancho de barra.'],
    ['syncProjectTags()', 'Copia etiquetas desde la tarjeta activa.'],
    ['animateProjectDetails()', 'Presenta secciones y anima barras desde cero hasta su valor.']
  ], [3300, 6060]),
  h('6.8 Acciones de tarjetas y acciones rápidas', 2),
  p('runProjectCardAction() y runProjectQuickAction() no contienen lógica de backend. Emiten eventos con action y projectId; un módulo futuro podrá escuchar esos eventos, llamar un endpoint y devolver éxito/error. El toast actual comunica el resultado simulado.'),
  code("clic acción → { action, projectId } → CustomEvent → futuro controlador backend"),
  h('6.9 Selector Lista/Tarjeta', 2),
  p('Los botones cambian aria-pressed y la clase de modo sobre projectsPage. El listado conserva las mismas tarjetas y datos, por lo que filtros, selección y acciones siguen funcionando. projects:view-change informa el modo elegido a integraciones externas.'),
  h('6.10 Analítica de proyectos', 2),
  p('projects-charts.js normaliza una respuesta común y administra tres instancias Chart.js: valor de proyectos, resumen circular y estado por cliente. renderAnalytics() destruye instancias anteriores antes de crear nuevas, lo que evita listeners o canvas duplicados.'),
  grid(['Función', 'Responsabilidad'], [
    ['normalizeAnalytics(source)', 'Convierte y valida value, summary y clients; aplica fallback cuando faltan datos.'],
    ['buildValuePeriod(period)', 'Calcula meses relativos al mes actual para 1, 3, 6 o 12 meses.'],
    ['externalProjectValueTooltip()', 'Muestra valor MXN junto al punto activo sin depender del canvas.'],
    ['renderAnalytics(data)', 'Crea línea, doughnut y barras horizontales con opciones compartidas.'],
    ['loadAnalytics()', 'Solicita data-projects-analytics-api mediante getProjectAnalytics().'],
    ['playInitialAnalyticsReveal()', 'Coordina trazado, arcos, barras y reflejo Liquid Glass.']
  ], [3300, 6060]),
  code("analytics-api → getProjectAnalytics() → normalizeAnalytics() → renderAnalytics() → tres gráficas"),
  h('6.11 Presentación y glow reactivo', 2),
  p('animateProjectsEntrance() construye una timeline única para navbar, encabezado, métricas, controles, tarjetas, detalles y analítica. initializeProjectsCursorLight() usa delegación de pointermove y requestAnimationFrame para actualizar variables CSS; las tarjetas agregadas posteriormente también reciben el efecto sin listeners individuales.'),
  h('7. Eventos públicos'),
  grid(['Evento', 'Detalle'], [
    ['technova:projects-data-loaded / error', 'Carga del resumen.'], ['projects:search-change', 'Consulta y cantidad visible.'], ['projects:filter-change', 'Filtro rápido.'], ['projects:advanced-filter-change', 'Objeto de filtros.'], ['projects:view-change', 'Modo list o card.'], ['projects:selection-change', 'projectId seleccionado.'], ['projects:card-action', 'Acción contextual.'], ['projects:quick-action', 'Acción rápida.'], ['projects:analytics-entry-start', 'Inicio coordinado de gráficas.']
  ], [3700, 5660]),
  h('8. Backend previsto'),
  p('Los tres endpoints son opcionales. El cliente usa GET, Accept application/json, credentials same-origin y AbortSignal cuando aplica. El servidor debe filtrar según permisos y devolver números sin formato visual.'),
  h('Listado y filtros', 2),
  code('GET list-api?status=in-progress&priority=high&due=soon&progress=51-75&budget=within&tag=frontend&person=id&q=texto&page=1&limit=20'),
  p('Respuesta mínima: { "projects": [] }. Filtros autorizados: status, priority, due, progress, budget, sort, tag, person, q, page y limit.'),
  h('Analítica', 2),
  code('{ "value": { "labels": [], "values": [] }, "summary": [], "clients": { "labels": [], "values": [] } }'),
  h('Resumen sugerido', 2),
  code('{ "metrics": {}, "projects": [{ "id": "p-001", "name": "...", "status": "in-progress", "progress": 50, "team": [], "tags": [] }] }'),
  h('9. Responsive, accesibilidad y animaciones'),
  p('El panel de detalles es sticky en escritorio y drawer cerrable hasta 1024 px. Los ajustes móviles principales ocurren en 640 y 480 px. El carrusel acepta botones, teclado y gestos. Filtros y menús administran aria-expanded, foco, Escape y backdrop. prefers-reduced-motion reduce la presentación.'),
  bullet('Las barras de progreso y presupuesto animan desde cero.'), bullet('Las gráficas trazan sus series y aplican reflejo Liquid Glass.'), bullet('El carrusel mantiene la tarjeta activa centrada y atenúa las laterales.'),
  h('10. Mantenimiento y pruebas'),
  bullet('Probar búsqueda con espacios, acentos y endpoint.'), bullet('Probar filtros simples, combinados, contador y estado vacío.'), bullet('Probar modos lista/tarjeta y acciones en ambos.'), bullet('Probar selección, avatares, progreso, presupuesto y etiquetas.'), bullet('Probar scroll largo y panel de detalles.'), bullet('Probar tres gráficas, periodos y responsive.'), bullet('Ejecutar node --check en los tres módulos JS.'),
  h('11. Riesgos y evolución'),
  bullet('projects.js debe dividirse gradualmente sin romper eventos ni data-*.'), bullet('Centralizar esquemas JSON cuando exista backend.'), bullet('Calcular avatares adicionales desde team.length.'), bullet('Mantener projectId estable durante refrescos.'),
  ...commentConventions('12'),
  h('13. Actualización documental'),
  p('Ante cada cambio: registrar archivos y comportamiento, actualizar contratos, añadir historial, incrementar versión, regenerar el Word y validar estructura, renderizado y pruebas relacionadas.')
];

const tasks = [
  ...cover('Tareas', 'Gestión operativa, integración preparada y mantenimiento', TASKS_VERSION), br(),
  h('Control documental'),
  grid(['Versión', 'Fecha', 'Módulo', 'Archivos', 'Cambio', 'Motivo'], [
    ['1.0.0', '27 de agosto de 2026', 'Tareas', 'tareas.html; tareas.css; mapa; generador', 'Estructura general, navbar y encabezado responsive', 'Validar la base visual antes de añadir módulos funcionales'],
    [TASKS_VERSION, DATE, 'Tareas', 'tareas.html; tareas.css; tasks.js; tasks-api.js; tasks-entry.js; technova-navbar.js', 'Vista completa, detalle, edición, filtros, paginación, panel contextual y preparación backend', 'Consolidar el gestor de tareas y documentar su contrato operativo']
  ], [720, 1120, 700, 2100, 2700, 2020]),
  h('Tabla de contenido'), new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-3' }), br(),
  h('1. Propósito y alcance'),
  p('Referencia técnica de la vista Tareas implementada sobre el frame Admin-Technova / Tecnova-Sistema / Tareas / nodo 2280:47. Incluye encabezado, métricas, filtros, listado paginado, calendario, progreso, próximas tareas, menús contextuales, drawer de detalle, formularios de creación y edición, estados visuales y una frontera HTTP preparada para backend.'),
  note('Estado de integración', 'El frontend es funcional con datos estáticos. Los atributos data-tasks-*-api permanecen vacíos para impedir solicitudes accidentales; al configurarlos, tasks-api.js consume JSON same-origin y conserva fallback ante fallos.'),
  h('2. Inventario y responsabilidades'),
  grid(['Ruta', 'Estado', 'Responsabilidad'], [
    ['tareas.html', 'Modificado', 'Estructura semántica, contratos data-*, fallback de tareas, paneles, formularios y orden de scripts.'],
    ['css/pages/tareas.css', 'Modificado', 'Liquid Glass, métricas, filtros, tabla, calendario, progreso, drawer, modales, estados y responsive.'],
    ['js/pages/tasks.js', 'Creado y ampliado', 'Estado de la vista, render dinámico, filtros, URL, paginación, calendario, selección, acciones, detalle y formularios.'],
    ['js/pages/tasks-api.js', 'Creado', 'Cliente Fetch, normalización JSON, errores HTTP, CSRF y operaciones CRUD preparadas.'],
    ['js/pages/tasks-entry.js', 'Creado', 'Timeline GSAP de entrada, reflejo final del navbar y fallback reduced-motion.'],
    ['js/components/technova-navbar.js', 'Creado', 'Genera el navbar común, rutas, usuario, nav-indicator y aria-current desde active.'],
    ['js/navbar.js', 'Modificado solo comentario', 'Apertura/cierre responsive del DOM generado por el componente.'],
    ['assets/img/tasks/*', 'Creado', 'Métricas, filtros, proyectos, responsables, calendario, prioridades y paginación.'],
    ['css/navbar/*; effects.css; responsive.css', 'Reutilizado', 'Geometría, Liquid Glass, estados activos y breakpoints compartidos.'],
    ['notifications.js + css/notifications/*', 'Reutilizado', 'Campana, panel, agrupación y fallback local de notificaciones.']
  ], [3000, 1600, 4760]),
  h('3. Estructura HTML'),
  grid(['Bloque', 'Selector principal', 'Responsabilidad'], [
    ['Página', '.dashboard.tasks-page', 'Raíz y atributos de endpoints/CSRF.'],
    ['Navbar', '<technova-navbar active="tasks">', 'Genera #dashboard-navbar y conserva nav-indicator.'],
    ['Encabezado', '.tasks-header', 'Título, búsqueda, filtros, Nueva tarea y notificaciones.'],
    ['Filtros avanzados', '[data-tasks-advanced-filter-panel]', 'Diálogo modal con formulario y cierre accesible.'],
    ['Métricas', '[data-task-metrics]', 'Carrusel circular de seis indicadores y paginación.'],
    ['Filtros y vistas', '[data-task-filters]', 'Scopes, búsqueda, selects, chips, orden y vista.'],
    ['Listado', '[data-task-table-body]', 'Filas seleccionables y preparadas para render desde items.'],
    ['Paginación', '[data-task-pagination]', 'Resumen, tamaño, páginas compactas y navegación.'],
    ['Panel contextual', '.tasks-context-panel', 'Calendario, progreso y próximas tareas sincronizadas.'],
    ['Menú de fila', '[data-task-context-menu]', 'Acciones, permisos y submenús por tarea.'],
    ['Drawer', '[data-task-detail]', 'Detalle, subtareas, dependencias, comentarios y actividad.'],
    ['Editor', '[data-task-editor]', 'Creación y edición con validación y mensajes de persistencia.']
  ], [1780, 3400, 4180]),
  h('4. CSS, Liquid Glass y responsive'),
  p('tareas.css se carga después de los estilos compartidos y limita sus reglas a .tasks-page y .tasks-board-page. Mantiene degradados azules, transparencias, blur, saturación, bordes luminosos, glow por prioridad/estado y sombras internas. Las prioridades alta, media y baja usan rojo, amarillo y verde; completada y bloqueada poseen indicadores diferenciados.'),
  grid(['Rango', 'Comportamiento'], [
    ['Escritorio amplio', 'Listado y panel contextual forman dos columnas; navbar fijo y encabezado alineado.'],
    ['Hasta 1280 px', 'Encabezado y controles redistribuyen altura y separación sin pegarse a los bordes.'],
    ['Tablet', 'Panel contextual usa calendario a un lado y Progreso/Próximas apilados; contenedores crecen en altura.'],
    ['Hasta 1024 px', 'Navbar se pliega, contenido ocupa el ancho disponible y filtros conservan desplazamiento horizontal.'],
    ['Móvil', 'Paneles, tabla y controles se apilan; drawer ocupa el viewport y la paginación se compacta.'],
    ['prefers-reduced-motion', 'Finaliza estados visibles sin timelines ni transiciones decorativas.']
  ], [2100, 7260]),
  h('5. JavaScript y flujo de ejecución'),
  grid(['Archivo o función', 'Responsabilidad'], [
    ['technova-navbar.js', 'Sustituye el marcador por el DOM histórico antes de navbar.js y emite technova:navbar-ready.'],
    ['tasks-api.js / request()', 'Añade headers JSON/CSRF, credentials same-origin, valida respuestas y genera TasksApiError.'],
    ['loadMetrics()/updateMetrics()', 'Carga o conserva métricas y sincroniza tarjetas del carrusel.'],
    ['loadTaskList()/renderTaskRows()', 'Solicita items paginados, normaliza filas y controla loading/error/retry.'],
    ['applyTaskFilters()/emitFiltersChange()', 'Filtra fallback, actualiza chips/conteos y persiste criterios en URL.'],
    ['updatePagination()/requestTaskPage()', 'Calcula páginas compactas, tamaño y navegación futura sin límite fijo.'],
    ['renderCalendar()/syncSelectedTaskContext()', 'Sincroniza fecha seleccionada, vencimientos, progreso y próximas tareas.'],
    ['openTaskContextMenu()', 'Aplica permisos, posiciona el menú y ejecuta acciones con reversión.'],
    ['openTaskDetail()', 'Rellena el drawer con proyecto, responsable, prioridad, subtareas, comentarios y actividad.'],
    ['openTaskEditor()', 'Comparte formulario para crear/editar y delega persistencia a TechNovaTasksApi.'],
    ['tasks-entry.js', 'Ejecuta entrada premium y reflejo del navbar con GSAP.']
  ], [3300, 6060]),
  h('5.1 Eventos y flujo', 2),
  code('HTML → technova-navbar.js → navbar.js → notifications.js → tasks-api.js → tasks.js → tasks-entry.js'),
  bullet('Input/change: búsqueda, scopes, estado, proyecto, prioridad, orden y tamaño de página actualizan la vista.'),
  bullet('Clic o teclado: selección de filas, métricas, calendario, paginación, menús, drawer y paneles.'),
  bullet('Doble clic o Ver detalles abre el drawer; Escape y backdrop cierran paneles en orden seguro.'),
  bullet('Los eventos tasks:* desacoplan filtros, métricas, paginación, calendario, detalle, subtareas, comentarios y acciones.'),
  bullet('Las escrituras aplican actualización optimista; ante error se restaura el snapshot de la fila.'),
  h('6. Atributos data-* principales'),
  grid(['Grupo', 'Atributos representativos', 'Contrato'], [
    ['Backend', 'data-tasks-summary-api; data-tasks-list-api; data-tasks-action-api; data-tasks-csrf', 'URLs y token; vacío desactiva red.'],
    ['Métricas', 'data-task-metric; data-task-metric-value; data-task-metrics-direction', 'Identidad, valores y navegación del carrusel.'],
    ['Filtros', 'data-task-scope; data-task-filter-*; data-task-active-filters; data-task-sort', 'Estado serializable a consulta.'],
    ['Listado', 'data-task-row; data-task-id; data-task-status; data-task-priority; data-task-project', 'Modelo DOM y fallback.'],
    ['Paginación', 'data-task-page; data-task-page-size; data-task-pagination-*', 'Página, límite, resumen y páginas visibles.'],
    ['Contexto', 'data-calendar-*; data-task-progress-*; data-task-upcoming-*', 'Sincronización con la tarea activa.'],
    ['Detalle/editor', 'data-task-detail-*; data-task-editor-*; data-task-action-*', 'Lectura, edición y operaciones.']
  ], [1700, 4080, 3580]),
  h('7. Contratos JSON y endpoints previstos'),
  code('GET ../api/tasks/summary.php → { metrics, calendar, progress, upcoming }'),
  code('GET ../api/tasks/list.php?q=&scope=&status=&project=&priority=&sort=&page=&limit= → { items: Task[], pagination: { page, pageSize, totalItems, totalPages } }'),
  code('POST ../api/tasks/list.php → Task | { item: Task }; PATCH/DELETE ../api/tasks/{id}.php → Task | { item, message }'),
  p('Task normalizada contempla id, title, description, project, projectIcon, assignee, assigneeAvatar, priority, status, progress, dueDate, dueLabel, subtasks, dependencies, comments y activity. El backend debe calcular vencimiento y días restantes, validar sesión/permisos, sanitizar contenido, utilizar consultas preparadas y devolver JSON con Content-Type correcto.'),
  bullet('401: sesión ausente; 403: permiso insuficiente; 404: tarea inexistente; 409: conflicto de versión/estado; 500: error interno recuperable.'),
  bullet('Las escrituras envían X-CSRF-Token cuando existe data-tasks-csrf o meta csrf-token.'),
  bullet('Eliminar exige confirmación en UI; backend debe volver a validar autorización.'),
  h('8. Fallback estático y resiliencia'),
  p('Si los endpoints están vacíos, tasks-api.js no realiza solicitudes y tasks.js conserva las filas, métricas, calendario y próximas tareas incluidas en HTML. La búsqueda, filtros, paginación, drawer, subtareas, comentarios y formularios continúan operando de forma local. Los estados loading, error y retry quedan disponibles cuando se active la red.'),
  h('9. Animaciones y gráficas'),
  p('GSAP controla la presentación escalonada del navbar, encabezado, métricas, filtros, tabla y panel contextual, además del reflejo final del navbar y las entradas del drawer. CSS resuelve respiración, glow, hover, desplazamientos y estados de prioridad. Chart.js no se carga en Tareas porque calendario y progreso se representan con HTML/CSS.'),
  h('10. Pruebas realizadas'),
  bullet('node --check aprobado para technova-navbar.js, navbar.js, tasks-api.js, tasks.js, tasks-board.js y tasks-entry.js.'),
  bullet('Orden CSS/JS verificado: el componente se ejecuta antes de navbar.js y GSAP antes de tasks-entry.js.'),
  bullet('Llaves de tareas.css y tareas-tablero.css balanceadas; marcadores HTML principales balanceados.'),
  bullet('Responsive revisado en escritorio, tablet y móvil, incluidos panel contextual, tabla, encabezado, filtros y drawer.'),
  bullet('Filtros, conteos, selección, calendario, porcentajes, fechas, paginación y próximas tareas sincronizados con fallback.'),
  bullet('Nav-indicator conservado, un solo aria-current por vista y recursos locales existentes.'),
  h('11. Riesgos y mantenimiento'),
  bullet('No duplicar el markup del navbar: toda vista nueva debe usar technova-navbar.js antes de navbar.js.'),
  bullet('Mantener tareas.css al final de la cascada específica y probar 1280/1024/640/390 px después de cambios estructurales.'),
  bullet('El fallback local no sustituye permisos, transacciones, auditoría ni validación de concurrencia del backend.'),
  bullet('Los comentarios/subtareas locales se perderán al recargar hasta activar persistencia.'),
  bullet('Evitar listeners individuales en datos masivos; conservar delegación y render paginado.'),
  ...commentConventions('12'),
  h('13. Actualización documental'),
  p('Actualizar este documento, el mapa y el historial cuando cambien contratos, eventos, endpoints, breakpoints o responsabilidades del módulo.')
];

const tasksBoard = [
  ...cover('Tablero de tareas', 'Vista Kanban, interacción y preparación backend', TASKS_BOARD_VERSION), br(),
  h('Control documental'),
  grid(['Versión', 'Fecha', 'Módulo', 'Archivos', 'Cambio', 'Motivo'], [
    [TASKS_BOARD_VERSION, DATE, 'Tablero de tareas', 'tareas-tablero.html; tareas-tablero.css; tasks-board.js; tasks-api.js; tasks-entry.js', 'Vista Kanban con cuatro estados, detalle, alta y drag and drop', 'Extender Tareas con una experiencia visual tipo Asana']
  ], [760, 1180, 1000, 2360, 2380, 1680]),
  h('Tabla de contenido'), new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-3' }), br(),
  h('1. Propósito y alcance'),
  p('Documenta la vista tareas-tablero.html, complemento del listado principal. Presenta las tareas en columnas Pendientes, En progreso, En revisión y Completadas, comparte el navbar, notificaciones, cliente API, editor, detalle y animación de entrada.'),
  h('2. Inventario de archivos'),
  grid(['Ruta', 'Responsabilidad'], [
    ['tareas-tablero.html', 'Estructura Kanban, filtros, columnas, detalle, editor y atributos de backend.'],
    ['css/pages/tareas-tablero.css', 'Layout de columnas, degradados por estado, respiración, tarjetas, drag and drop y responsive.'],
    ['js/pages/tasks-board.js', 'Render, filtros, apertura de detalle, editor, creación y movimiento entre estados.'],
    ['js/pages/tasks-api.js', 'Cliente compartido para lista, creación, actualización y acciones.'],
    ['js/pages/tasks-entry.js', 'Timeline premium compartida con la vista Lista.'],
    ['js/components/technova-navbar.js + js/navbar.js', 'Navbar único con Tareas activo y menú responsive.'],
    ['css/pages/tareas.css + estilos compartidos', 'Tokens visuales, encabezado, notificaciones, drawer y formularios reutilizados.']
  ], [3500, 5860]),
  h('3. Estructura HTML y visual'),
  grid(['Bloque', 'Selector', 'Función'], [
    ['Encabezado', '.tasks-board-header', 'Título, búsqueda, Lista, notificaciones y Nueva tarea.'],
    ['Resumen', '[data-board-summary]', 'Contadores totales por estado.'],
    ['Tablero', '[data-tasks-board]', 'Contenedor de las cuatro columnas.'],
    ['Columnas', '[data-board-status]', 'Dropzones con color/glow según estado.'],
    ['Tarjetas', '.kanban-card', 'Proyecto, responsable, prioridad, progreso y vencimiento.'],
    ['Detalle', '[data-board-detail]', 'Drawer sincronizado con la tarjeta seleccionada.'],
    ['Editor', '[data-board-editor]', 'Alta sin abandonar la vista.']
  ], [1900, 3100, 4360]),
  h('4. JavaScript, eventos y flujo'),
  grid(['Función o evento', 'Responsabilidad'], [
    ['renderBoard()', 'Filtra y distribuye el arreglo de tareas en cuatro columnas; actualiza conteos.'],
    ['createCard(task)', 'Genera una tarjeta accesible y arrastrable desde el modelo normalizado.'],
    ['openDetail(task)', 'Sincroniza drawer, progreso, subtareas y acción completar.'],
    ['openEditor(status)', 'Abre Nueva tarea con el estado de la columna de origen.'],
    ['moveTask(taskId, status)', 'Actualiza estado, vuelve a renderizar y emite tasks:board-move.'],
    ['tasks:board-create-request / tasks:board-create', 'Notifican apertura y alta con origen API o fallback.'],
    ['dragstart/dragover/drop/dragend', 'Controlan movimiento visual entre dropzones.'],
    ['input/change/keydown', 'Búsqueda, prioridad, acceso por teclado y cierre Escape.']
  ], [3650, 5710]),
  code('HTML → technova-navbar.js → navbar.js → notifications.js → tasks-api.js → tasks-board.js → tasks-entry.js'),
  h('5. Backend y contratos'),
  p('La raíz expone data-tasks-board-api, data-tasks-action-api y data-tasks-csrf. Con URLs vacías se utiliza el arreglo local. El endpoint de tablero podrá devolver { items: Task[] }; creación y movimiento reutilizan los contratos de tasks-api.js. El servidor debe validar transiciones de estado, permisos y concurrencia antes de confirmar.'),
  h('6. Responsive y animaciones'),
  bullet('Escritorio: cuatro columnas con scroll horizontal controlado cuando el ancho no permite legibilidad.'),
  bullet('Tablet: columnas conservan ancho mínimo y navegación táctil; encabezado redistribuye acciones.'),
  bullet('Móvil: tarjetas y drawers ocupan el ancho disponible; los formularios se apilan.'),
  bullet('Cada columna mantiene su color semántico y respiración de degradado; las tarjetas conservan Liquid Glass.'),
  bullet('GSAP presenta navbar, encabezado, resumen y columnas; reduced-motion entrega el estado final sin animación.'),
  h('7. Pruebas y mantenimiento'),
  bullet('Creación local abre el modal sin redirigir a la vista Lista.'),
  bullet('Búsqueda y prioridad vuelven a renderizar conteos y columnas.'),
  bullet('Drag and drop mueve la tarea y actualiza su estado en fallback.'),
  bullet('Detalle, completar, Escape y enlaces Lista/Tareas conservan navegación y accesibilidad.'),
  bullet('JavaScript válido, CSS balanceado y orden de dependencias comprobado.'),
  bullet('No duplicar lógica de API, navbar, drawer ni estilos compartidos entre Lista y Kanban.'),
  ...commentConventions('8'),
  h('9. Riesgos y evolución'),
  p('El drag and drop HTML5 requiere una alternativa táctil más explícita para producción. La persistencia real debe resolver conflictos 409, autorización por proyecto, auditoría y reversión visual cuando una transición falle.')
];

function document(title, children) {
  return new Document({
    creator: 'TechNova Solutions', title, subject: 'Documentación técnica de vista',
    description: 'Documento vivo para mantenimiento y evolución del sistema.',
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 220 } } } }] }] },
    styles: { default: { document: { run: { font: 'Arial', size: 20, color: C.ink }, paragraph: { spacing: { line: 276 } } } }, paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 30, bold: true, color: C.navy }, paragraph: { outlineLevel: 0, spacing: { before: 300, after: 120 } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 25, bold: true, color: C.blue }, paragraph: { outlineLevel: 1, spacing: { before: 220, after: 100 } } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 22, bold: true, color: C.blue }, paragraph: { outlineLevel: 2, spacing: { before: 180, after: 80 } } }
    ] },
    sections: [{ properties: { page: { margin: { top: 850, right: 900, bottom: 850, left: 900 } } }, headers: { default: new Header({ children: [p('TechNova Solutions  |  Documentación técnica', { alignment: AlignmentType.RIGHT, color: C.muted, size: 16, after: 0 })] }) }, footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Uso interno · ', { color: C.muted, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: C.muted, size: 16 }), run(' / ', { color: C.muted, size: 16 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: C.muted, size: 16 })] })] }) }, children }]
  });
}

async function save(name, doc) { fs.writeFileSync(path.join(OUT, name), await Packer.toBuffer(doc)); }
const documents = {
  dashboard: ['DOCUMENTACION_TECNICA_DASHBOARD.docx', document('Documentación técnica - Dashboard', dashboard)],
  proyectos: ['DOCUMENTACION_TECNICA_PROYECTOS.docx', document('Documentación técnica - Proyectos', projects)],
  tareas: ['DOCUMENTACION_TECNICA_TAREAS.docx', document('Documentación técnica - Tareas', tasks)],
  'tablero-tareas': ['DOCUMENTACION_TECNICA_TABLERO_TAREAS.docx', document('Documentación técnica - Tablero de tareas', tasksBoard)]
};
const target = process.argv[2] || 'all';
const selectedDocuments = target === 'all' ? Object.values(documents) : [documents[target]];

if (selectedDocuments.some(Boolean) && selectedDocuments.every(Boolean)) {
  Promise.all(selectedDocuments.map(([name, doc]) => save(name, doc)))
    .then(() => console.log(`Documentación técnica generada correctamente: ${target}.`));
} else {
  throw new Error(`Vista documental desconocida: ${target}. Use dashboard, proyectos, tareas, tablero-tareas o all.`);
}
