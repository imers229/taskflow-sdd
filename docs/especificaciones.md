# Especificaciones de TaskFlow

Este documento resume la especificación funcional, el plan técnico y el estado
real de implementación en el repositorio. La especificación completa está en
[`spec.md`](../specs/001-taskflow-task-manager/spec.md), el plan en
[`plan.md`](../specs/001-taskflow-task-manager/plan.md) y el seguimiento de
tareas en [`tasks.md`](../specs/001-taskflow-task-manager/tasks.md).

## Historias de usuario

### HU1 — Gestionar proyectos

Un miembro del equipo puede crear, listar, editar y eliminar proyectos. Los
nombres se recortan, se normalizan sin distinguir mayúsculas, minúsculas ni
acentos, y son únicos. La eliminación solicita confirmación escribiendo el
nombre exacto.

**Implementado:** CRUD backend y frontend, validaciones, unicidad normalizada,
confirmación destructiva y pruebas.

### HU2 — Gestionar tareas

Las tareas pertenecen a un proyecto y tienen título, descripción, prioridad,
estado, responsable, fecha límite y fecha de creación. El título, descripción,
enumeraciones y fecha límite se validan en el backend. Los valores
predeterminados son prioridad `media` y estado `pendiente`.

**Implementado:** CRUD backend y frontend, validaciones, fechas en formato
`YYYY-MM-DD`, confirmación de eliminación y pruebas.

### HU3 — Cambiar estado rápidamente

Una tarea puede cambiar de estado desde la lista sin abrir el formulario
completo. Los estados de la API son `pendiente`, `en_progreso` y `completada`.

**Implementado:** `PATCH /api/tasks/:id/status`, actualización rápida en el
frontend, actualización del resumen después de una respuesta exitosa y
pruebas.

### HU4 — Filtrar y buscar tareas

Las tareas se pueden filtrar por estado, prioridad y responsable, combinar
esos filtros con `AND`, buscar parcialmente por título o responsable, y
ordenar por fecha, título o prioridad. La búsqueda ignora mayúsculas,
minúsculas y acentos.

**Implementado:** filtros, búsqueda, ordenamiento, respuestas `400` para
parámetros inválidos, resultado vacío `200` y pruebas backend/frontend.

### HU5 — Panel de resumen

El líder puede consultar el total de tareas, conteos por estado, tareas
vencidas y porcentaje completado. Solo una tarea `pendiente` cuya fecha límite
ya pasó cuenta como vencida.

**Implementado:** resumen backend y panel frontend con actualización tras
crear, editar, eliminar o cambiar el estado de una tarea.

## Requisitos

### Funcionales

- Persistir proyectos y tareas en SQLite.
- Mantener cada tarea asociada a un proyecto existente.
- Ordenar por fecha de creación descendente por defecto.
- Exigir confirmación en acciones destructivas.
- Exponer la funcionalidad mediante API REST.
- Validar las entradas en el backend y devolver errores JSON en español.
- Permitir filtros, búsqueda, ordenamiento y resumen por proyecto.

### No funcionales

- Usabilidad responsive en móvil, tableta y escritorio.
- Textos visibles en español.
- Formularios con etiquetas, contraste y estados de carga, error y vacío.
- TypeScript estricto y separación entre frontend y backend.
- Pruebas automatizadas para lógica y endpoints.
- CI con build y pruebas en push y Pull Request hacia `main`.

El objetivo de rendimiento definido por la especificación es un p95 menor que
un segundo con 500 tareas por proyecto. No se ha ejecutado todavía una prueba
formal de ese objetivo.

## Modelo de datos real

SQLite crea estas tablas:

- `projects`: `id`, `name`, `normalized_name`, `description`, `created_at`.
- `tasks`: `id`, `project_id`, `title`, `description`, `priority`, `status`,
  `assignee`, `due_date`, `created_at`.
- `history`: `id`, `project_id`, `entity_type`, `entity_id`, `changed_at`,
  `change_type`, `previous_value`, `new_value`.

El repositorio registra eventos de historial durante operaciones de proyectos
y tareas, pero todavía no existe un endpoint ni una pantalla para consultar
ese historial.

## API implementada

Todas las rutas están bajo `/api` y devuelven JSON.

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/api/projects` | Listar proyectos |
| POST | `/api/projects` | Crear proyecto |
| GET | `/api/projects/:id` | Consultar proyecto |
| PUT | `/api/projects/:id` | Editar proyecto |
| DELETE | `/api/projects/:id` | Eliminar proyecto con confirmación |
| GET | `/api/projects/:id/summary` | Obtener resumen |
| GET | `/api/projects/:projectId/tasks` | Listar tareas con filtros |
| POST | `/api/projects/:projectId/tasks` | Crear tarea |
| GET | `/api/tasks/:id` | Consultar tarea |
| PUT | `/api/tasks/:id` | Editar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea con confirmación |
| PATCH | `/api/tasks/:id/status` | Cambiar estado rápidamente |

`GET /api/projects/:projectId/tasks` acepta:

- `status`: `pendiente`, `en_progreso` o `completada`.
- `priority`: `baja`, `media` o `alta`.
- `assignee`: coincidencia parcial.
- `q`: búsqueda parcial en título y responsable.
- `order`: `created_desc`, `created_asc`, `title` o `priority`.

Sin parámetros, el orden es `created_desc`. Los filtros se combinan con
`AND`. Las entradas inválidas devuelven `400` con `{ "error": "mensaje" }`.
Los recursos inexistentes devuelven `404`.

## Pantallas implementadas

- `/projects`: lista, creación, edición y eliminación de proyectos.
- `/projects/:id`: panel de resumen, filtros, búsqueda, ordenamiento, lista
  de tareas y cambio rápido de estado.
- `/projects/:id/tasks/new`: creación de tarea.
- `/projects/:id/tasks/:taskId/edit`: edición de tarea.

No existe actualmente la ruta `/projects/:id/history`.

## Trabajo futuro

Quedan fuera de esta entrega:

- **T049:** endpoint backend de historial.
- **T054:** completar y exponer el registro de todos los cambios según el
  contrato de auditoría.
- **T055:** eliminación parcial de proyectos, reintentos idempotentes y
  respuesta de eliminación incompleta.
- **T056:** pruebas de historial, eliminación parcial, reintentos y
  consistencia asociada.
- **T058:** pantalla frontend de historial.
- **T060:** reintentos automáticos ante fallos de conexión.
- **T065:** prueba de rendimiento con 500 tareas y medición p95.

La autenticación, notificaciones, comentarios, adjuntos, tablero Kanban y
reportes exportables tampoco forman parte de esta versión.
