# JavaScript de acceso a la API

Aquí irán exclusivamente las funciones `fetch()` y el manejo común de
respuestas HTTP.

Archivos previstos:

- `http.js`: cliente común, cabeceras, JSON, errores 401/403 y CSRF.
- `auth-api.js`: conexión con `api/auth/`.
- `dashboard-api.js`: conexión con `api/dashboard/`.
- `projects-api.js`: conexión con `api/projects/`.

Estos archivos no deben manipular directamente el diseño. Entregan los datos a
los módulos de `js/pages/` o `js/components/`.

