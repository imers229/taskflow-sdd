# Especificación: TaskFlow, gestor de tareas para equipos de desarrollo

**Estado**: Borrador  
**Fecha**: 2026-10-22  
**Prioridad**: P1 para HU1 y HU2; P2 para HU3 y HU4; P3 para HU5

## 1. Contexto y objetivo

Equipos pequeños de desarrollo de software en empresas ecuatorianas trabajan
sin una herramienta central para organizar su trabajo. Esto provoca tareas
olvidadas, responsabilidades poco claras, falta de seguimiento del avance y
ausencia de historial.

TaskFlow proporcionará una aplicación web interna para organizar el trabajo por
proyectos, gestionar sus tareas y mostrar el estado real del equipo. En esta
versión no habrá autenticación ni múltiples equipos: se asume el uso interno
por un único equipo.

## 2. Usuarios y roles

### Miembro del equipo

- Crea, consulta, modifica y elimina proyectos.
- Crea, consulta, modifica y elimina tareas dentro de un proyecto.
- Cambia rápidamente el estado de una tarea.
- Filtra y busca tareas.

### Líder de equipo

- Consulta el avance general de los proyectos mediante el panel de resumen.

No se implementarán permisos diferenciados porque no hay autenticación en esta
versión.

## 3. Historias de usuario y criterios de aceptación

### HU1 (P1): Gestionar proyectos

**Como** miembro del equipo, **quiero** crear, listar, editar y eliminar
proyectos, **para** agrupar las tareas relacionadas.

#### Criterios de aceptación

- **Dado** que estoy en la lista de proyectos, **cuando** creo un proyecto con
  nombre válido, **entonces** aparece en la lista.
- **Dado** que intento crear un proyecto sin nombre, **entonces** el sistema
  muestra un mensaje de error en español y no lo guarda.
- **Dado** que elimino un proyecto, **entonces** se eliminan también sus tareas
  después de una confirmación explícita del usuario.
- No pueden existir dos proyectos con el mismo nombre.
- Editar un proyecto debe reflejar sus cambios en la lista y en las vistas
  relacionadas.
- Un proyecto sin tareas debe mostrar un estado de lista vacía comprensible.

### HU2 (P1): Gestionar tareas

**Como** miembro del equipo, **quiero** crear, ver, editar y eliminar tareas
dentro de un proyecto, **para** llevar el control del trabajo.

Cada tarea contiene:

| Campo | Reglas |
|---|---|
| Título | Obligatorio; entre 3 y 100 caracteres; no puede estar compuesto solo por espacios |
| Descripción | Opcional; máximo 500 caracteres |
| Prioridad | `baja`, `media` o `alta`; por defecto `media` |
| Estado | `pendiente`, `en progreso` o `completada`; por defecto `pendiente` |
| Responsable | Texto libre opcional |
| Fecha límite | Opcional; no puede ser anterior a hoy al crear la tarea |
| Fecha de creación | Obligatoria y generada automáticamente |
| Proyecto | Obligatorio; cada tarea pertenece exactamente a un proyecto |

#### Criterios de aceptación

- **Dado** que creo una tarea con título válido, **entonces** queda en estado
  `pendiente` y registra automáticamente la fecha de creación.
- **Dado** que el título está vacío o fuera del rango, **entonces** se rechaza
  con un mensaje claro en español.
- **Dado** que la fecha límite es anterior a hoy al crear la tarea, **entonces**
  se rechaza.
- **Dado** que edito una tarea, **entonces** los cambios se reflejan de
  inmediato.
- **Dado** que elimino una tarea, **entonces** el sistema solicita confirmación
  antes de eliminarla.
- Las tareas deben poder consultarse dentro de su proyecto y ordenarse por
  fecha de creación descendente inicialmente.

### HU3 (P2): Cambiar estado rápidamente

**Como** miembro del equipo, **quiero** cambiar el estado de una tarea sin
abrir el formulario completo, **para** actualizar mi avance con rapidez.

#### Criterios de aceptación

- **Dado** que veo una tarea en la lista, **cuando** selecciono un nuevo estado,
  **entonces** el estado se actualiza sin abrir el formulario completo.
- Después de la actualización, el panel de resumen refleja el nuevo conteo.
- Si falla la actualización, se muestra un error en español y no se presenta
  como exitosa una modificación que no se guardó.

### HU4 (P2): Filtrar y buscar tareas

**Como** miembro del equipo, **quiero** filtrar tareas por estado, prioridad y
responsable, y buscar por texto en el título, **para** encontrar lo que
necesito.

#### Criterios de aceptación

- Los filtros de estado, prioridad y responsable pueden combinarse.
- Al aplicar varios filtros, solo se muestran tareas que cumplen todos.
- La búsqueda por texto consulta el título.
- La búsqueda y los filtros pueden usarse conjuntamente.
- Si ninguna tarea coincide, se muestra un mensaje de **“Sin resultados”**.
- Si no hay tareas porque el proyecto está vacío, se muestra el estado de lista
  vacía del proyecto, diferenciado de **“Sin resultados”**.

### HU5 (P3): Panel de resumen

**Como** líder de equipo, **quiero** ver cuántas tareas hay por estado en cada
proyecto y cuántas están vencidas, **para** evaluar el avance.

#### Criterios de aceptación

- Al abrir un proyecto se muestra el total de tareas.
- Se muestran los conteos de tareas `pendiente`, `en progreso` y `completada`.
- Se muestra el conteo de tareas vencidas.
- Se muestra el porcentaje completado.
- Una tarea está vencida cuando su fecha límite ya pasó y su estado es
  `pendiente`. Las tareas `en progreso` y `completada` no se consideran
  vencidas.
- El porcentaje completado es tareas completadas dividido para el total,
  multiplicado por 100 y redondeado al entero más cercano; un proyecto sin
  tareas muestra `0%`.
- El resumen se actualiza después de crear, editar, eliminar o cambiar el
  estado de una tarea.

## 4. Requisitos funcionales

- **RF1 — Persistencia**: proyectos y tareas se conservan de forma permanente
  entre recargas y reinicios de la aplicación.
- **RF2 — Relación**: cada tarea pertenece exactamente a un proyecto existente.
- **RF3 — Orden**: las listas se ordenan por fecha de creación, de la más
  reciente a la más antigua. El usuario puede elegir fecha ascendente, título
  alfabético o prioridad.
- **RF4 — Confirmación destructiva**: toda acción destructiva requiere
  confirmación explícita antes de ejecutarse.
- **RF5 — Proyectos**: el sistema permite crear, listar, editar y eliminar
  proyectos, rechazando nombres duplicados.
- **RF6 — Tareas**: el sistema permite crear, consultar, editar y eliminar
  tareas con las validaciones definidas en HU2.
- **RF7 — Estado rápido**: el sistema permite cambiar el estado desde la lista
  de tareas.
- **RF8 — Consulta**: el sistema permite buscar por título y filtrar por
  estado, prioridad y responsable mediante criterios combinables.
- **RF9 — Resumen**: el sistema calcula y muestra conteos, vencidas y
  porcentaje completado por proyecto.
- **RF10 — Historial**: el sistema registra todos los cambios de proyectos y
  tareas, incluidos valores anterior y nuevo, con fecha y entidad, y los
  muestra en una vista de historial por proyecto. Los registros sobreviven a la
  eliminación del proyecto para conservar la auditoría.
- **RF11 — API**: frontend y backend se comunican exclusivamente mediante una
  API REST; el backend valida todas las entradas.
- **RF12 — Errores**: las operaciones fallidas muestran mensajes comprensibles
  en español sin detalles técnicos internos.

## 5. Requisitos no funcionales

- **RNF1 — Responsive**: la aplicación es usable en pantallas de móvil,
  tableta y escritorio.
- **RNF2 — Rendimiento**: las operaciones comunes deben alcanzar un p95 menor
  que un segundo con hasta 500 tareas por proyecto, medido en un entorno local
  de referencia.
- **RNF3 — Idioma**: todos los textos visibles de la interfaz están en
  español.
- **RNF4 — Accesibilidad**: los formularios tienen etiquetas asociadas, el
  contraste es adecuado y los estados de carga, error y lista vacía son
  visibles.
- **RNF5 — Calidad**: el código usa TypeScript en modo estricto, separa
  frontend y backend, y mantiene el acceso a datos en una capa de repositorio.
- **RNF6 — Pruebas**: toda lógica de negocio y todo endpoint tiene pruebas
  automatizadas escritas antes o junto con la implementación.
- **RNF7 — Integración**: el pipeline de CI ejecuta build y pruebas en cada
  push y Pull Request.

## 6. Flujos principales

### 6.1 Crear un proyecto

1. El usuario abre la lista de proyectos.
2. Selecciona la acción para crear un proyecto.
3. Introduce el nombre y, opcionalmente, la descripción.
4. El frontend muestra validaciones útiles, sin sustituir la validación del
   backend.
5. El backend valida nombre y unicidad.
6. Si es válido, persiste el proyecto y devuelve el recurso creado.
7. La lista muestra el nuevo proyecto y un estado de carga durante la
   operación.

### 6.2 Crear una tarea

1. El usuario abre un proyecto y selecciona crear tarea.
2. Introduce los campos disponibles.
3. El backend valida título, descripción, enumeraciones, proyecto y fecha
   límite.
4. Si es válido, asigna estado `pendiente`, prioridad `media` y fecha de
   creación automática cuando no se proporcionen esos valores.
5. La tarea aparece en la lista, el resumen se actualiza y se registra el
   cambio en el historial.

### 6.3 Eliminar un proyecto

1. El usuario selecciona eliminar proyecto.
2. El sistema informa que la acción eliminará el proyecto y todas sus tareas.
3. El usuario debe escribir el nombre exacto del proyecto para confirmar.
4. Solo después de la confirmación se ejecuta la eliminación del proyecto y sus
   tareas.
5. Si la eliminación falla parcialmente, el proyecto se conserva si aún tiene
   tareas, se informa que la eliminación quedó incompleta y se permite
   reintentar.
6. Si la eliminación finaliza, se vuelve a la lista de proyectos y se muestra
   el resultado.

### 6.4 Consultar y actualizar tareas

1. El usuario abre un proyecto y ve sus tareas ordenadas por fecha de creación.
2. Puede buscar por título y combinar filtros.
3. Puede editar una tarea o cambiar su estado directamente desde la lista.
4. La interfaz muestra carga, éxito o error de forma explícita.
5. El resumen refleja el estado persistido.

## 7. Modelo de dominio

### Proyecto

- `id`: identificador único.
- `name`: nombre obligatorio y único.
- `description`: descripción opcional de hasta 500 caracteres.
- `createdAt`: fecha de creación automática.

### Tarea

- `id`: identificador único.
- `projectId`: referencia obligatoria a un proyecto.
- `title`: texto de 3 a 100 caracteres, no vacío por espacios.
- `description`: texto opcional de hasta 500 caracteres.
- `priority`: `baja`, `media` o `alta`.
- `status`: `pendiente`, `en progreso` o `completada`.
- `assignee`: texto libre opcional.
- `dueDate`: fecha opcional, no anterior a hoy al crear.
- `createdAt`: fecha de creación automática.

Las fechas usan la zona horaria `America/Guayaquil`. Las fechas límite se
aceptan y presentan en formato ISO 8601 `YYYY-MM-DD`. Una tarea se considera
vencida únicamente cuando su fecha límite ya pasó y su estado es `pendiente`;
las tareas `en progreso` y `completada` no se consideran vencidas. La fecha
límite vencida de una tarea existente puede conservarse al editarla.

### Registro de historial

- `id`: identificador único.
- `projectId`: proyecto al que pertenece el cambio.
- `entityType`: `project` o `task`.
- `entityId`: identificador de la entidad modificada.
- `changedAt`: fecha y hora del cambio.
- `changeType`: creación, edición, cambio de estado o eliminación.
- `previousValue`: valores anteriores, cuando existan.
- `newValue`: valores nuevos, cuando existan.

## 8. Manejo de errores y estados de interfaz

- Una entrada inválida se rechaza con un mensaje específico en español y no se
  persiste.
- Un recurso inexistente se comunica como no encontrado.
- Un fallo de conexión con el servidor muestra un mensaje comprensible,
  conserva los datos introducidos cuando sea posible y realiza hasta tres
  reintentos automáticos con espera incremental. Después permite reintentar
  manualmente.
- Las operaciones muestran un estado de carga mientras están en curso.
- Las listas muestran estados distintos para carga, vacío, sin resultados y
  error.
- Los errores internos no exponen trazas, consultas, nombres de tablas ni
  detalles técnicos al usuario.
- La eliminación parcial informa que la operación quedó incompleta y permite
  reintentar; el proyecto se conserva si aún tiene tareas.

## 9. Fuera de alcance

Esta versión no incluye:

- autenticación ni gestión de usuarios;
- notificaciones;
- comentarios;
- adjuntos;
- tablero Kanban con arrastrar y soltar;
- reportes exportables;
- permisos diferenciados por rol.

## 10. Decisiones confirmadas

- Los nombres de proyecto tienen entre 3 y 100 caracteres, no pueden estar
  compuestos solo por espacios y se comparan sin distinguir mayúsculas,
  minúsculas ni espacios exteriores, también al editar.
- La descripción de proyecto es opcional y admite hasta 500 caracteres.
- La búsqueda por título y el filtro por responsable son parciales, ignoran
  mayúsculas, minúsculas y acentos, y un responsable vacío significa “sin
  filtro”.
- Los nombres de proyecto se normalizan recortando espacios exteriores,
  convirtiendo a minúsculas y eliminando diacríticos antes de comprobar su
  unicidad.
- Las tareas pueden ordenarse además por fecha de creación ascendente, título
  alfabético o prioridad. El orden de prioridad es `alta`, `media`, `baja`;
  los empates se resuelven por fecha de creación descendente.
- La eliminación requiere escribir el nombre exacto del proyecto o tarea.
- La eliminación de proyectos puede quedar parcial; el sistema responde con
  error, identifica las tareas restantes, conserva el proyecto si aún tiene
  tareas y permite reintentar de forma idempotente.
- El historial registra todos los cambios con valores anterior y nuevo y se
  consulta por proyecto, incluso después de su eliminación.
- La API y la base de datos usan `en_progreso`; la interfaz muestra “en
  progreso”.

## 11. Criterios de preparación para implementación

La especificación estará lista para implementación cuando:

- las decisiones confirmadas sobre validaciones, fechas, búsquedas, resúmenes,
  confirmaciones, errores, rendimiento e historial estén reflejadas en los
  contratos técnicos;
- cada requisito funcional pueda verificarse mediante una prueba automatizada;
- estén definidos los contratos de la API REST y los códigos HTTP;
- estén definidos los límites de campos no especificados;
- el plan técnico mantenga la separación frontend/backend y el repositorio de
  acceso a datos exigidos por la constitución.
