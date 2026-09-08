# TechNova System

Proyecto web TechNova con dashboard, proyectos y gestión de tareas.

## Estructura

- `App/`: interfaz web, estilos, JavaScript, recursos y documentación técnica.
- `api/`: estructura prevista para el backend PHP; implementación pendiente.
- `Promts/`: notas y especificaciones del proyecto.
- `respaldo/`: respaldo existente de la interfaz.

## Uso local con XAMPP

1. Colocar el proyecto dentro del directorio servido por Apache.
2. Iniciar Apache en XAMPP.
3. Abrir `http://localhost/xampp/TechNova%20System/App/` si se conserva la ubicación actual.

Consultar `App/README.md` y `api/README.md` para más detalles.

## Configuración privada

Las credenciales, archivos `.env` y bases de datos locales están excluidos mediante `.gitignore`. La configuración privada del backend deberá crearse localmente cuando se implemente.

Los archivos `.gitkeep` conservan las carpetas vacías previstas para la API.

## Actualizar GitHub con doble clic

Ejecuta `SUBIR_A_GITHUB.bat`. Registra y sube a `main` los archivos nuevos, las modificaciones y las eliminaciones, respetando `.gitignore`. El mensaje del commit incluye fecha y hora.

Necesita Internet, Git y acceso a tu cuenta de GitHub. La ventana muestra el resultado y permanece abierta hasta pulsar una tecla. Si GitHub contiene cambios que faltan en esta copia, se detiene para que puedan integrarse. Si falla la conexión, vuelve a ejecutarlo para subir los commits pendientes.

