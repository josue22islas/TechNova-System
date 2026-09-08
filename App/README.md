# Dashboard TechNova

Versión organizada del dashboard. El punto de entrada es `index.html`.

## JavaScript

- `js/navbar.js`: apertura y cierre responsive del menú.
- `js/intro.js`: video inicial, sonido, fallback y secuencia de entrada.
- `js/dashboard-ui.js`: reflejos reactivos y contadores KPI.
- `js/dashboard-data.js`: contrato y conexión opcional de los KPI con la API.
- `js/periods.js`: selector financiero y selector general del reporte.
- `js/expenses.js`: gastos recurrentes y botón Ver todo/Ver menos.
- `js/notifications.js`: panel, lectura, agrupación y eliminación de notificaciones.
- `js/investments.js`: tarjetas, lista y modal de fondos de inversión.
- `js/charts.js`: gráfica financiera y distribución de costos.
- `js/app.js`: punto de entrada común para futuras inicializaciones.

## CSS

- `css/layout/`: lienzo y contenedores generales.
- `css/navbar/`: estructura, botón responsive, estados y efectos del navbar.
- `css/header/`: encabezado y selectores.
- `css/cards/`: tarjetas KPI y carrusel móvil.
- `css/charts/`: gráfica financiera y distribución de costos.
- `css/notifications/`: campana y panel de notificaciones.
- `css/investments/`: tarjeta, lista y modal de inversiones.
- `css/expenses/`: panel de gastos recurrentes.
- `css/intro.css`: intro, video, sonido y fallback visual.
- `css/effects.css`: efectos Liquid Glass compartidos.
- `css/responsive.css`: responsive estructural general.
- `css/globals.css`: reset, fuentes y configuración global.

## Recursos

- `assets/img/`: imágenes y SVG locales.
- `assets/fonts/`: fuentes que anteriormente dependían de Anima.
- `assets/vendor/`: Chart.js, GSAP y Meyer Reset servidos localmente.
- `videos/`: videos desktop, tablet y móvil de la intro.

La intro selecciona automáticamente `technova-intro-mobile.mp4` hasta 640 px,
`technova-intro-tablet.mp4` entre 641 y 1024 px y
`technova-intro-desktop.mp4` desde 1025 px. En tablet la capa ocupa todo el
ancho y alto visible, mientras el video se centra y conserva su proporción
completa para no recortar el logotipo.

## Orden y mantenimiento

El orden de los `<link>` y `<script>` en `index.html` preserva la cascada y ejecución del proyecto original. No debe cambiarse sin probar escritorio, tablet y móvil.

Los respaldos previos a la modularización están en `_backups/` y no forman parte de la aplicación activa.

## Redirecciones del navbar

Las opciones del navbar, el logo, el perfil y Cerrar sesión son enlaces con `href="#"` mientras se crean las demás vistas. `js/navbar.js` evita el salto al inicio únicamente cuando el enlace sigue siendo `#`.

Para activar una vista solo cambia el valor del atributo, por ejemplo:

```html
<a class="div-2" href="proyectos.html">
```

No es necesario modificar `navbar.js` cuando se sustituya `#` por una ruta real.

## KPI preparados para backend

Las cinco tarjetas principales usan atributos `data-kpi-*` y pueden actualizarse
con `window.TechNovaDashboard.updateDashboardKpis(data)`.

Contrato esperado:

```json
{
  "kpis": {
    "projectsActive": 6,
    "totalRevenue": 899000,
    "profits": 156456,
    "hoursWorked": 1345,
    "activeClients": 2
  },
  "changes": {
    "projectsActive": 2,
    "totalRevenue": 18.2,
    "profits": 56.2,
    "hoursWorked": 8.7,
    "activeClients": 5
  },
  "periodLabel": "este mes"
}
```

Mientras no exista backend, `data-dashboard-api` permanece vacío y se conservan
los valores del HTML. Para activar la consulta automática, cambia el atributo de
la raíz `.dashboard` por:

```html
data-dashboard-api="../api/dashboard/summary.php"
```
