# Constitución de TaskFlow

## Preámbulo

TaskFlow es un sistema web de gestión de tareas para equipos de desarrollo de
software. Esta constitución establece las reglas técnicas y de colaboración que
protegen la calidad del producto, la seguridad de sus usuarios y la capacidad
del equipo para evolucionarlo. Sus principios son **no negociables** y aplican
a todo código, configuración, documentación y cambio de infraestructura del
proyecto.

## Principios

### I. Calidad de código

- Todo el código debe estar escrito en TypeScript con modo estricto habilitado.
- Los nombres de código deben ser descriptivos y estar en inglés; los textos
  visibles de la interfaz deben estar en español.
- Las funciones deben ser pequeñas y tener una sola responsabilidad.
- No se permite código duplicado ni código muerto. La refactorización necesaria
  para evitar ambos debe formar parte del cambio que los introduce.

### II. Pruebas primero (Test-First)

- Toda lógica de negocio y todo endpoint debe contar con pruebas automatizadas.
- Las pruebas deben escribirse antes o junto con la implementación, siguiendo un
  enfoque TDD.
- Ningún cambio puede integrarse si alguna prueba falla.
- Las pruebas deben cubrir el comportamiento observable y los casos de error
  relevantes, no únicamente la implementación interna.

### III. Arquitectura por capas

- Frontend y backend deben mantenerse estrictamente separados y comunicarse
  únicamente mediante una API REST documentada.
- El backend debe validar todas las entradas y nunca confiar en validaciones
  realizadas únicamente por el frontend.
- Los códigos HTTP deben representar correctamente el resultado de la
  operación: `200` para respuestas exitosas, `201` para recursos creados,
  `400` para entradas inválidas, `404` para recursos inexistentes y `500` para
  errores internos no previstos.
- El acceso a datos debe estar aislado en una capa de repositorio propia. La
  lógica de negocio no debe acceder directamente a la base de datos.

### IV. Experiencia de usuario

- La interfaz debe ser responsive, consistente y accesible.
- Los formularios deben incluir etiquetas asociadas a sus controles y la
  interfaz debe mantener un contraste adecuado.
- Los mensajes de error deben ser claros, accionables y estar en español.
- Los estados de carga y de lista vacía deben ser siempre visibles y
  comprensibles para el usuario.

### V. Flujo de trabajo

- Todo cambio debe entrar mediante Pull Request y contar con al menos una
  revisión aprobatoria antes de integrarse.
- Los commits deben seguir Conventional Commits, usando al menos las
  categorías `feat`, `fix`, `docs`, `test` y `ci` cuando correspondan.
- La rama `main` debe permanecer siempre estable y apta para desplegarse.
- Cada cambio debe estar asociado a un Issue que describa su objetivo y
  alcance.

### VI. Automatización

- Un pipeline de Integración Continua (CI) debe ejecutar el build y las pruebas
  automatizadas en cada push y en cada Pull Request.
- La integración queda bloqueada cuando el build o cualquier prueba falla.

### VII. Documentación como fuente de verdad

- La especificación del producto es la fuente de verdad. Cuando exista una
  discrepancia, el cambio debe resolverla explícitamente y mantener el código
  alineado con la especificación aprobada.
- El `README` debe explicar como mínimo la instalación, la ejecución local y la
  ejecución de las pruebas.
- Los cambios de comportamiento, API, arquitectura o flujo de trabajo deben
  actualizar la documentación relacionada en el mismo Pull Request.

## Gobernanza

1. Esta constitución es obligatoria para todo cambio en TaskFlow. Los autores
   del cambio son responsables de demostrar su cumplimiento en el Pull
   Request, incluyendo pruebas y documentación cuando correspondan.
2. Cualquier excepción debe ser temporal, explícita y justificada en el Issue
   y en el Pull Request. Debe incluir el riesgo aceptado, el alcance y un plan
   de eliminación; no puede convertirse en una regla implícita.
3. Una modificación permanente de esta constitución requiere:
   - un Issue que explique la motivación y el impacto;
   - un Pull Request que actualice esta constitución y toda documentación o
     configuración afectada; y
   - la aprobación de al menos dos mantenedores del proyecto, incluyendo al
     responsable técnico, antes de fusionarse.
4. Las modificaciones se aplican desde su fusión y no invalidan
   retroactivamente cambios ya integrados, salvo que el Pull Request de
   modificación lo establezca de forma explícita.
5. El responsable técnico debe revisar periódicamente que el README, la
   especificación, el pipeline de CI y el código reflejen esta constitución.
   Si una herramienta automatizada detecta una infracción, el equipo debe
   corregirla antes de integrar nuevos cambios que dependan de ella.

**Versión**: 1.0.0 | **Ratificada**: 2026-10-22 | **Última modificación**: 2026-10-22
