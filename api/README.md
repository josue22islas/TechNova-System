# Estructura del backend TechNova

Esta carpeta contendrá exclusivamente PHP del servidor. Los archivos PHP no
deben generar HTML: recibirán solicitudes, validarán sesión y permisos,
consultarán la base de datos y responderán JSON.

## Carpetas compartidas

- `config/`: conexión a la base de datos y configuración privada. Nunca se
  enlaza desde HTML ni se importa desde JavaScript.
- `core/`: funciones PHP compartidas para respuestas JSON, lectura de
  solicitudes, validaciones y manejo de errores.
- `middleware/`: comprobación de sesión, permisos, CSRF y otras reglas que se
  ejecutan antes de cada operación protegida.
- `health/`: comprobaciones controladas del estado de la API y de la base de
  datos.

## Carpetas por módulo

- `auth/`: iniciar sesión, cerrar sesión y consultar la sesión actual.
- `dashboard/`: resumen KPI y datos generales del dashboard.
- `projects/`: listar, consultar, crear, actualizar y eliminar proyectos.
- `tasks/`: operaciones de tareas y estados.
- `time/`: registros de horas y control de tiempo.
- `clients/`: clientes y sus relaciones con proyectos.
- `team/`: usuarios, colaboradores, roles y permisos.
- `assistant/`: operaciones del asistente IA autorizadas por el servidor.
- `finance/`: ingresos, costos, ganancias y resúmenes financieros.
- `billing/`: facturación, pagos y documentos fiscales.
- `reports/`: generación y consulta de reportes.
- `notifications/`: notificaciones del usuario.
- `investments/`: fondos y movimientos de inversión.
- `expenses/`: gastos recurrentes y categorías.
- `settings/`: configuración de cuenta y del sistema.

## Archivos PHP previstos

No se crean todavía; esta lista define dónde irán cuando comience el backend.

```text
api/
├── config/
│   ├── database.php
│   └── environment.php
├── core/
│   ├── response.php
│   ├── request.php
│   └── validation.php
├── middleware/
│   ├── auth.php
│   ├── permissions.php
│   └── csrf.php
├── auth/
│   ├── login.php
│   ├── logout.php
│   └── session.php
├── dashboard/
│   └── summary.php
└── projects/
    ├── list.php
    ├── detail.php
    ├── create.php
    ├── update.php
    └── delete.php
```

Los demás módulos seguirán el mismo patrón según necesiten operaciones de
consulta, creación, actualización o eliminación.

## Conexión con el frontend

El HTML permanece en `App/` y nunca contiene PHP. Los módulos de
`App/js/api/` utilizarán `fetch()` para consultar esta API.

Ejemplo de conexión:

```text
App/dashboard.html
    -> App/js/api/dashboard-api.js
    -> api/dashboard/summary.php
    -> MySQL
    -> respuesta JSON
    -> App/js/pages/dashboard.js
```

La integración KPI ya preparada puede activarse configurando en el elemento
`.dashboard`:

```html
data-dashboard-api="../api/dashboard/summary.php"
```

## Reglas de seguridad

1. Las credenciales de MySQL solo deben existir en configuración PHP.
2. Cada endpoint protegido debe validar sesión y permisos.
3. Las consultas SQL deben utilizar sentencias preparadas.
4. Las operaciones que modifican datos deben validar CSRF.
5. PHP debe responder con `Content-Type: application/json` y códigos HTTP
   correctos.
6. JavaScript no sustituye las validaciones del servidor.
7. Los mensajes de error públicos no deben revelar credenciales, consultas SQL
   ni rutas privadas.

