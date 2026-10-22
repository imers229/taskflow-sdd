# Plan de implementación: TaskFlow

## 1. Resumen técnico

TaskFlow se implementará como un monorepo con frontend Angular y backend
Node.js/Express separados. El frontend consumirá exclusivamente la API REST
del backend. El backend persistirá los datos en SQLite mediante
`better-sqlite3`, manteniendo el archivo de base de datos fuera del control de
versiones.

La implementación debe respetar la [Constitución de TaskFlow](../../.specify/memory/constitution.md)
y la [especificación funcional](./spec.md).

## 2. Stack y decisiones técnicas

### Frontend

- Angular, usando la última versión estable disponible al iniciar la
  implementación.
- Standalone components.
- TypeScript con modo estricto.
- Angular Router.
- `HttpClient`.
- Reactive Forms.
- CSS propio con Grid y Flexbox.
- Sin librerías externas de UI.

### Backend

- Node.js 20.
- Express.
- API REST JSON.
- CORS restringido al origen configurado del frontend.
- Separación entre `app.ts` y `server.ts`:
  - `app.ts` crea y exporta la aplicación para pruebas.
  - `server.ts` configura el puerto e inicia `listen`.

### Persistencia y pruebas

- SQLite mediante `better-sqlite3`.
- Base de datos configurable y excluida del control de versiones.
- Jest y Supertest para backend.
- Pruebas unitarias Angular para servicios y componentes principales.
- GitHub Actions para build y pruebas en push y Pull Request hacia `main`.

## 3. Estructura del monorepo

```text
/
├── frontend/
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── interceptors/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── dashboard/
│   │   └── shared/
│   └── ...
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/
├── .github/
│   └── workflows/
│       └── ci.yml
└── specs/
```

Los nombres de símbolos, archivos y carpetas de código estarán en inglés. Los
textos visibles y mensajes de error estarán en español.

## 4. Arquitectura backend

El flujo de una petición será:

```text
route → validation middleware → controller → service → repository → SQLite
```

- **Routes**: declaran método, ruta y middleware.
- **Validation middleware**: valida cuerpo, parámetros y query params; rechaza
  entradas inválidas antes de llegar al servicio.
- **Controllers**: traducen la petición HTTP a una llamada de servicio y
  construyen la respuesta.
- **Services**: contienen reglas de negocio, cálculos de resumen, verificación
  de confirmaciones ya validadas por middleware y registro de historial.
- **Repositories**: son la única capa autorizada para ejecutar SQL.
- **Database**: inicializa SQLite, activa `PRAGMA foreign_keys = ON` y crea
  tablas mediante un script idempotente.

El manejo de errores debe usar un middleware centralizado que traduzca errores
conocidos a `{ "error": "mensaje" }` en español y códigos HTTP correctos:

- `200`: lectura o actualización exitosa.
- `201`: recurso creado.
- `400`: entrada inválida o confirmación destructiva incorrecta.
- `404`: proyecto o tarea inexistente.
- `500`: error interno no previsto, sin detalles técnicos.

## 5. Modelo de datos y persistencia

### Tablas principales

```sql
projects(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL
)

tasks(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK(priority IN ('baja', 'media', 'alta'))
    DEFAULT 'media',
  status TEXT NOT NULL
    CHECK(status IN ('pendiente', 'en_progreso', 'completada'))
    DEFAULT 'pendiente',
  assignee TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL
)

history(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('project', 'task')),
  entity_id INTEGER NOT NULL,
  changed_at TEXT NOT NULL,
  change_type TEXT NOT NULL
    CHECK(change_type IN ('creation', 'update', 'status_change', 'deletion')),
  previous_value TEXT,
  new_value TEXT
)
```

Decisiones de persistencia:

- `normalized_name` contiene el nombre recortado, convertido a minúsculas y sin
  diacríticos para comparar sin distinguir mayúsculas, minúsculas ni acentos.
  Una única función compartida debe aplicar esta regla al validar, crear y
  editar.
- Las fechas se guardan en formatos ISO compatibles con la zona horaria
  `America/Guayaquil`; `due_date` usa `YYYY-MM-DD`.
- `history.project_id` se conserva incluso para cambios de tareas. La tabla
  `history` no tendrá una clave foránea hacia `projects`, por lo que los
  registros históricos sobreviven a la eliminación del proyecto. Los eventos
  de eliminación conservarán `entity_id`, `previous_value` y `project_id`.
- Las operaciones de creación, edición, cambio de estado y eliminación de una
  entidad deben usar transacciones para que el registro de historial sea
  atómico con el cambio principal.
- La eliminación de un proyecto es una operación por tareas: elimina cada
  tarea y registra su evento; si una eliminación falla, conserva el proyecto y
  las tareas restantes, devuelve un resultado incompleto y permite reintentar
  de forma idempotente. No se usará una cascada única que oculte qué tareas
  quedaron pendientes.

## 6. Contrato REST

### Proyectos

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/projects` | `200` con proyectos |
| POST | `/api/projects` | `201` con proyecto creado |
| GET | `/api/projects/:id` | `200` con proyecto |
| PUT | `/api/projects/:id` | `200` con proyecto actualizado |
| DELETE | `/api/projects/:id` | `200` con resultado de eliminación |
| GET | `/api/projects/:id/summary` | `200` con resumen |
| GET | `/api/projects/:id/history` | `200` con historial del proyecto |

El cuerpo de creación y actualización usa `name` y `description`. Para
eliminar un proyecto se requiere un cuerpo de confirmación con el nombre
exacto; una confirmación ausente o incorrecta produce `400`.

### Tareas

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/projects/:projectId/tasks` | `200` con tareas |
| POST | `/api/projects/:projectId/tasks` | `201` con tarea creada |
| GET | `/api/tasks/:id` | `200` con tarea |
| PUT | `/api/tasks/:id` | `200` con tarea actualizada |
| DELETE | `/api/tasks/:id` | `200` con resultado de eliminación |
| PATCH | `/api/tasks/:id/status` | `200` con tarea actualizada |

`GET /api/projects/:projectId/tasks` acepta `status`, `priority`, `assignee`,
`q` y un parámetro de orden. Los filtros se combinan con AND. La búsqueda y el
filtro de responsable son parciales y no distinguen mayúsculas, minúsculas ni
acentos. La prioridad se ordena `alta`, `media`, `baja` y, en caso de empate,
por fecha de creación descendente.

La API y la base de datos usan `pendiente`, `en_progreso` y `completada`; la
interfaz muestra `pendiente`, `en progreso` y `completada`. La eliminación de
una tarea requiere confirmación con su nombre exacto.

Una eliminación parcial responde `500` con `{ "error": "mensaje",
"incomplete": true, "remainingTaskIds": [1, 2] }`. Los reintentos repiten
solo las tareas pendientes y devuelven `200` cuando el proyecto y todas sus
tareas se eliminaron correctamente.

## 7. Frontend y pantallas

### Rutas

- `/projects`: lista, creación y edición de proyectos.
- `/projects/:id`: resumen, filtros, búsqueda y lista de tareas.
- `/projects/:id/tasks/new`: formulario de creación de tarea.
- `/projects/:id/tasks/:taskId/edit`: formulario de edición de tarea.
- `/projects/:id/history`: historial del proyecto.

### Organización de funcionalidades

- `core/`: modelos, servicios HTTP, configuración de API e interceptor de
  errores.
- `projects/`: lista, formulario y eliminación confirmada.
- `tasks/`: lista, filtros, cambio rápido de estado y formulario reactivo.
- `dashboard/`: tarjetas de resumen y porcentaje completado.
- `shared/`: componentes reutilizables de carga, error, lista vacía,
  confirmación y mensajes.

Todos los componentes deben mostrar explícitamente estados de carga, error,
lista vacía y “sin resultados”. Los formularios tendrán etiquetas asociadas,
validaciones accesibles y mensajes en español.

## 8. Estrategia de pruebas

### Backend

Antes o junto con cada implementación se añadirán pruebas de:

- inicialización de base de datos y claves foráneas;
- creación, listado, consulta, edición y eliminación de proyectos;
- nombre vacío, longitud inválida y nombres duplicados normalizados;
- eliminación con confirmación incorrecta;
- creación, consulta, edición, eliminación y cambio rápido de estado de tareas;
- validación de título, descripción, enumeraciones, proyecto y fecha límite;
- búsqueda, filtros combinados y órdenes alternativos;
- resumen, vencidas y redondeo del porcentaje;
- historial de creación, edición, cambio de estado y eliminación;
- respuestas `400`, `404` y `500` con el formato de error definido.

### Frontend

- Servicios HTTP con `HttpTestingController`, incluyendo éxito y errores.
- Formulario de proyecto y validaciones visibles.
- Formulario de tarea y validaciones reactivas.
- Lista de tareas, filtros combinados y cambio rápido de estado.
- Componentes de carga, error, lista vacía y sin resultados.
- Panel de resumen e historial.

## 9. CI y configuración

`.github/workflows/ci.yml` tendrá dos jobs:

1. **backend**: configurar Node.js 20, ejecutar `npm ci`, build y pruebas
   Jest/Supertest.
2. **frontend**: configurar Node.js 20, ejecutar `npm ci`, build Angular y
   pruebas unitarias.

Se ejecutará en cada push y en cada Pull Request hacia `main`. Los comandos,
puertos, origen permitido, URL de API y ruta de base de datos se configurarán
mediante variables de entorno o archivos locales ignorados por Git. No se
incluirán archivos SQLite ni secretos en el repositorio.

## 10. Secuencia de implementación

1. Crear la estructura del monorepo, manifests, configuración TypeScript
   estricta, scripts y `.gitignore`.
2. Implementar inicialización SQLite, migración idempotente, repositorios y
   pruebas de persistencia.
3. Implementar validadores, servicios, controladores y rutas de proyectos con
   sus pruebas.
4. Implementar tareas, filtros, búsqueda, ordenamiento y cambio rápido de
   estado con sus pruebas.
5. Implementar resumen e historial, incluyendo transacciones y pruebas de
   consistencia.
6. Implementar la aplicación Angular, servicios HTTP, rutas, formularios y
   componentes compartidos.
7. Integrar pantallas de proyectos, tareas, resumen e historial con pruebas de
   componentes y servicios.
8. Añadir manejo de errores, reintentos limitados, accesibilidad y responsive.
9. Configurar CI, ejecutar build y pruebas completas y verificar el objetivo
   p95 con 500 tareas por proyecto.

Cada paso debe entrar mediante un Pull Request asociado a un Issue, con pruebas
verdes y revisión aprobatoria.

## 11. Riesgos y controles

- **Diferencias de zona horaria**: centralizar la obtención de “hoy” en
  `America/Guayaquil` y probar fechas límite iguales, anteriores y posteriores.
- **Normalización inconsistente**: reutilizar una única función de normalización
  en validación, servicio, repositorio y búsqueda.
- **Eliminación parcial**: informar estados incompletos y diseñar reintentos
  idempotentes; no mostrar éxito si quedan tareas.
- **Historial huérfano o incompleto**: escribir cambios y eventos dentro de
  transacciones cuando corresponda y probar cada tipo de operación.
- **Deriva entre frontend y backend**: mantener interfaces TypeScript y
  contratos de error alineados con la API.
- **Regresión de rendimiento**: añadir una prueba de medición con 500 tareas y
  revisar p95 antes de integrar cambios que afecten consultas.
