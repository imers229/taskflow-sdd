# Tareas de implementación: TaskFlow

**Especificación**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Convenciones

- `[P]` indica que la tarea puede ejecutarse en paralelo con otras tareas
  marcadas `[P]` del mismo bloque, una vez satisfechas sus dependencias.
- Las tareas sin `[P]` deben ejecutarse secuencialmente dentro de su flujo o
  requieren coordinación con tareas anteriores.
- Cada tarea incluye pruebas antes o junto con la implementación.
- Los nombres de código y archivos estarán en inglés; los textos visibles y
  mensajes de error estarán en español.
- Cada bloque debe integrarse mediante Pull Request asociado a un Issue.

## Bloque 0: Preparación transversal

- [x] T001 Crear el monorepo con `frontend/`, `backend/`, `specs/` y la
  configuración base de npm.
- [x] T002 Configurar TypeScript estricto, scripts de build, test y lint para
  backend y frontend.
- [x] T003 [P] Configurar `.gitignore` para dependencias, artefactos de build,
  archivos SQLite, variables de entorno y secretos.
- [x] T004 [P] Crear archivos de configuración de entorno para puerto, origen
  CORS, URL de API y ruta de base de datos.
- [x] T005 [P] Configurar Node.js 20 y comandos reproducibles de instalación
  para ambos paquetes.
- [x] T006 Implementar conexión SQLite con `better-sqlite3` y activar
  `PRAGMA foreign_keys = ON`.
- [x] T007 Implementar el script idempotente de inicialización de `projects`,
  `tasks` y `history`.
- [x] T008 Implementar interfaces y tipos de dominio backend, y repositorios
  tipados, aislando todo acceso SQL de servicios y controladores.
- [x] T009 [P] Crear `app.ts` exportable para pruebas y `server.ts` para
  iniciar el servidor.
- [x] T010 [P] Implementar middleware centralizado de errores con respuestas
  `{ "error": "mensaje" }` y códigos `400`, `404` y `500`.
- [x] T011 [P] Implementar CORS restringido al origen configurado y respuestas
  JSON consistentes.
- [x] T012 [P] Escribir pruebas de base de datos, claves foráneas, repositorios
  y manejo de errores.
- [ ] T033 Crear la aplicación Angular standalone con Router, `HttpClient`,
  Reactive Forms y TypeScript estricto.
- [ ] T034 [P] Configurar modelos TypeScript para proyectos, tareas, resumen,
  historial, errores y filtros.
- [ ] T035 [P] Implementar servicios HTTP base con URL configurable.
- [ ] T036 [P] Implementar interceptor de errores para respuestas de API y
  fallos de conexión en español.
- [ ] T037 [P] Crear componentes reutilizables de carga, error, lista vacía,
  sin resultados, confirmación y mensajes accesibles.
- [ ] T038 [P] Crear estilos responsive comunes con CSS Grid y Flexbox, sin
  librería externa de UI.

## HU1 (P1): Gestionar proyectos

### Backend

- [x] T013 Implementar una función única para recortar y normalizar nombres de
  proyecto sin distinguir mayúsculas, minúsculas ni acentos, eliminando
  diacríticos.
- [x] T014 [P] Implementar validación de nombre de 3–100 caracteres, rechazo
  de solo espacios y descripción opcional de hasta 500 caracteres.
- [x] T015 Implementar unicidad normalizada de nombres al crear y editar,
  incluyendo restricción persistente en la base de datos.
- [x] T016 Implementar `ProjectRepository` para crear, listar, consultar,
  actualizar y eliminar proyectos.
- [x] T017 Implementar `ProjectService` con reglas de negocio y registro de
  historial.
- [x] T018 Implementar controladores y rutas `GET/POST /api/projects` y
  `GET/PUT/DELETE /api/projects/:id`.
- [x] T019 [P] Escribir pruebas de endpoints de proyectos para casos exitosos,
  validación, duplicados normalizados y `404`.

### Frontend

- [x] T039 Implementar `/projects` con listado, creación, edición y
  validación accesible de proyectos.
- [x] T040 Implementar confirmación destructiva exigiendo escribir el nombre
  exacto del proyecto y mostrando que también se eliminarán sus tareas.
- [x] T050 [P] Escribir pruebas del formulario de proyecto, incluyendo
  validaciones y mensajes visibles.

## HU2 (P1): Gestionar tareas

### Backend

- [x] T020 Implementar validación de título de 3–100 caracteres, descripción
  de hasta 500, prioridad, estado, responsable, proyecto y fecha límite.
- [x] T021 Implementar fechas en `America/Guayaquil`, formato `YYYY-MM-DD` y
  conservación de fechas vencidas al editar tareas existentes.
- [x] T022 Implementar `TaskRepository` para CRUD y acceso a tareas por
  proyecto.
- [x] T023 Implementar `TaskService` con valores por defecto, validaciones y
  registro de historial.
- [x] T024 Implementar controladores y rutas
  `GET/POST /api/projects/:projectId/tasks` y
  `GET/PUT/DELETE /api/tasks/:id`.
- [x] T025 [P] Escribir pruebas de CRUD, valores por defecto, validaciones,
  fecha límite, confirmación de eliminación y `404`.

### Frontend

- [x] T041 Implementar `/projects/:id` con proyecto vacío, estados de carga y
  error, y contenedor de tareas.
- [x] T043 Implementar formulario reactivo de creación y edición de tareas con
  validaciones y mensajes en español.
- [x] T045 [P] Implementar confirmación destructiva de tarea exigiendo escribir
  su nombre exacto.
- [x] T051 [P] Escribir pruebas del formulario de tarea para título,
  descripción, prioridad, estado y fecha límite.

## HU3 (P2): Cambiar estado rápidamente

### Backend

- [x] T026 Implementar cambio de estado en `TaskService` y
  `PATCH /api/tasks/:id/status`, con registro de historial.
- [x] T027 [P] Escribir pruebas del cambio rápido para estados válidos,
  estados inválidos y tarea inexistente.

### Frontend

- [x] T044 Implementar cambio rápido de estado desde la lista y actualizar el
  resumen solo después de una respuesta exitosa.
- [x] T052 [P] Añadir pruebas de cambio rápido, error de actualización y
  conservación del estado visible ante fallo.

## HU4 (P2): Filtrar y buscar tareas

### Backend

- [ ] T028 Implementar filtros combinables por estado, prioridad y responsable.
- [ ] T029 Implementar búsqueda parcial de título y responsable ignorando
  mayúsculas, minúsculas y acentos.
- [ ] T030 Implementar orden por fecha descendente por defecto, fecha
  ascendente, título alfabético y prioridad.
- [ ] T031 Actualizar `GET /api/projects/:projectId/tasks` con `status`,
  `priority`, `assignee`, `q` y orden; los filtros se combinan con AND.
- [ ] T032 [P] Escribir pruebas de filtros combinados, búsqueda, ordenamiento y
  resultado vacío.

### Frontend

- [x] T042 Implementar lista de tareas con filtros combinables, búsqueda,
  órdenes alternativos y estado “Sin resultados”.
- [x] T053 [P] Escribir pruebas de lista, filtros, búsqueda, orden y estado
  “Sin resultados”.

## HU5 (P3): Panel de resumen e historial

### Backend

- [x] T046 Implementar cálculo de resumen: total, conteos por estado,
  pendientes vencidas y porcentaje redondeado; un proyecto sin tareas muestra
  `0%`.
- [x] T047 Implementar la regla de vencimiento: solo una tarea `pendiente`
  con fecha límite pasada cuenta como vencida.
- [x] T048 Implementar `GET /api/projects/:id/summary` y probar el resumen
  después de crear, editar, eliminar y cambiar el estado de una tarea.
- [ ] T049 Implementar `GET /api/projects/:id/history`, ordenado por fecha
  descendente.
- [ ] T054 Registrar creación, edición, cambio de estado y eliminación con
  valores anterior y nuevo, entidad, proyecto y fecha.
- [ ] T055 Implementar eliminación de proyecto con tareas, confirmación exacta,
  manejo de eliminación incompleta con respuesta `500`, preservación si quedan
  tareas y reintento idempotente; conservar los eventos de historial.
- [ ] T056 [P] Escribir pruebas de resumen, historial, eliminación parcial,
  reintentos y consistencia de datos.

### Frontend

- [x] T057 Implementar panel de resumen con conteos, vencidas, porcentaje y
  actualización tras cambios de tareas.
- [ ] T058 Implementar `/projects/:id/history` con valores anterior y nuevo de
  cada cambio.
- [x] T059 [P] Escribir pruebas del panel de resumen, historial y estados de
  interfaz.

## Integración transversal y entrega

- [ ] T060 Implementar hasta tres reintentos automáticos con espera
  incremental ante fallos de conexión y opción de reintento manual.
- [ ] T061 [P] Verificar responsive, etiquetas de formularios, foco,
  contraste y estados de carga, error, vacío y sin resultados.
- [x] T062 Crear `.github/workflows/ci.yml` con jobs separados para backend y
  frontend en push y Pull Request hacia `main`.
- [x] T063 [P] Configurar `npm ci`, build y pruebas Jest/Supertest en el job
  de backend.
- [x] T064 [P] Configurar `npm ci`, build Angular y pruebas unitarias en el job
  de frontend.
- [ ] T065 Añadir prueba de rendimiento con 500 tareas por proyecto y verificar
  p95 menor que un segundo para operaciones comunes.
- [ ] T066 Ejecutar build y pruebas completas, corregir regresiones y comprobar
  que no se versionen bases de datos, secretos ni artefactos.
- [ ] T067 Actualizar el README con instalación, configuración, ejecución,
  pruebas, estructura y comandos de CI.
- [ ] T068 Realizar revisión final de trazabilidad entre especificación, plan,
  código, pruebas y documentación antes del Pull Request de integración.

## Dependencias principales

```text
T001 → T002 → T006 → T007 → T008
T033 → T034 → T035
T006/T007/T008 → HU1 backend y HU2 backend
HU2 backend → HU3 backend, HU4 backend y HU5 backend
T035 → funcionalidades frontend
HU1 backend → HU1 frontend
HU2 backend → HU2 frontend
HU3 backend + HU2 frontend → HU3 frontend
HU4 backend + HU2 frontend → HU4 frontend
HU5 backend + HU2/HU3 frontend → HU5 frontend
Todas las pruebas → T062/T063/T064 → T066 → T068
```

Las tareas `[P]` solo son paralelizables dentro de estos límites: no deben
iniciarse antes de sus dependencias técnicas y no deben modificar
simultáneamente los mismos archivos sin coordinación.
