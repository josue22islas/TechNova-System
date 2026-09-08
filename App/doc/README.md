# Documentación técnica por vista

Esta carpeta conserva un documento Word independiente para cada vista del sistema.

## Archivos actuales

- `DOCUMENTACION_TECNICA_DASHBOARD.docx`
- `DOCUMENTACION_TECNICA_PROYECTOS.docx`
- `DOCUMENTACION_TECNICA_TAREAS.docx`
- `DOCUMENTACION_TECNICA_TABLERO_TAREAS.docx`
- `generar_documentacion.js`: fuente reproducible de los cuatro documentos.

## Regla obligatoria de mantenimiento

Cuando se modifique una vista también se debe:

1. Actualizar su contenido técnico y los contratos afectados en `generar_documentacion.js`.
2. Incrementar la versión cuando el cambio sea funcional o estructural.
3. Añadir una fila al control de cambios del documento correspondiente.
4. Regenerar los `.docx`.
5. Validar estructura y renderizado antes de entregar.
6. Registrar módulos nuevos en `MAPEO_Y_ESTRUCTURA_DEL_PROYECTO.txt`.
7. Actualizar comentarios guía cuando cambien responsabilidades, eventos, contratos o dependencias.

## Generación

Ejecutar con Node.js y el paquete `docx` disponible:

```powershell
node .\doc\generar_documentacion.js
```

Para regenerar una sola vista sin reescribir los demás Word:

```powershell
node .\doc\generar_documentacion.js dashboard
node .\doc\generar_documentacion.js proyectos
node .\doc\generar_documentacion.js tareas
node .\doc\generar_documentacion.js tablero-tareas
```

Los documentos se regeneran en esta misma carpeta. El TXT maestro mantiene la visión global; estos Word contienen el detalle técnico por vista.

## Espejo en Google Drive

Carpeta: `TechNova Sistema/Documentación técnica`

- URL: `https://drive.google.com/drive/folders/1LXHJMczFhMp9IY8JNYsxLlTnjgU64we3`
- `DOCUMENTACION_TECNICA_DASHBOARD.docx`: `15Q678fr9WMZEe0e-1beEUzKC7wfhw4cW`
- `DOCUMENTACION_TECNICA_PROYECTOS.docx`: `1IxjxglJfnbmI2dX7fdXWy1H-1R_HAkQU`
- `DOCUMENTACION_TECNICA_TAREAS.docx`: `1tu3b6f64L3gZpLXjfHsuJo4IfpJ5krrI`
- `DOCUMENTACION_TECNICA_TABLERO_TAREAS.docx`: `1t9sJw0QJMsMQbrc_NVL-5OoaM4Dlvh-l`
- `generar_documentacion.js`: `1z51KwpVLltDJ-kQYgRVBalRkteC8JKYK`
- `README.md`: `1jKPSOpdFmZqheVxq7uwIWiIwImz76k_b`

Después de regenerar un archivo local se debe reemplazar el contenido del archivo de Drive con su ID estable. No se debe volver a subir como archivo nuevo, porque crearía duplicados. La copia local es la fuente principal y Drive es el espejo de respaldo.

## Versiones y validación

- Dashboard: versión `1.3.0`, navbar centralizado y estado activo declarativo.
- Proyectos: versión `1.3.0`, navbar centralizado y estado activo declarativo.
- Tareas: versión `2.0.0`, gestor completo con frontend dinámico y contratos backend preparados.
- Tablero de tareas: versión `1.0.0`, vista Kanban independiente del módulo Tareas.

Los cuatro DOCX deben validarse como paquetes Open XML con sus partes obligatorias y un `word/document.xml` válido. La validación visual debe repetirse después de cambios de contenido, estilos o paginación.

## Estándar de comentarios inline

- Las cabeceras explican responsabilidad, flujo, eventos, dependencias y fallback.
- Los comentarios no deben repetir propiedades CSS ni instrucciones JavaScript obvias.
- No se modifican ni comentan archivos de `assets/vendor`.
- Cuando cambie el comportamiento descrito, el comentario y el Word correspondiente deben actualizarse juntos.
