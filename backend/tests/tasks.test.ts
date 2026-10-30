import request from 'supertest';

import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database/database.js';

describe('task endpoints', () => {
  async function createProject(application: ReturnType<typeof createApp>) {
    const response = await request(application)
      .post('/api/projects')
      .send({ name: 'Proyecto de tareas' });
    return response.body.id as number;
  }

  it('creates and lists a task with defaults', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);

    const createResponse = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Implementar tareas' });
    const listResponse = await request(application)
      .get(`/api/projects/${projectId}/tasks`);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      project_id: projectId,
      title: 'Implementar tareas',
      priority: 'media',
      status: 'pendiente',
      due_date: null,
    });
    expect(createResponse.body.created_at).toEqual(expect.any(String));
    expect(listResponse.body).toHaveLength(1);
  });

  it('rejects invalid fields, an invalid due date, and a missing project', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);

    const invalidTitle = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: '  ' });
    const invalidDescription = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Tarea válida', description: 'x'.repeat(501) });
    const pastDate = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Tarea válida', dueDate: '2020-01-01' });
    const missingProject = await request(application)
      .post('/api/projects/999/tasks')
      .send({ title: 'Tarea válida' });

    expect(invalidTitle.status).toBe(400);
    expect(invalidDescription.status).toBe(400);
    expect(pastDate.status).toBe(400);
    expect(missingProject.status).toBe(404);
  });

  it('gets and updates a task while preserving an existing past due date', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    const createResponse = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Tarea original', dueDate: '2099-12-31' });
    const taskId = createResponse.body.id as number;

    const getResponse = await request(application).get(`/api/tasks/${taskId}`);
    const updateResponse = await request(application)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Tarea actualizada' });
    const missingResponse = await request(application).get('/api/tasks/999');

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe('Tarea actualizada');
    expect(updateResponse.body.due_date).toBe('2099-12-31');
    expect(missingResponse.status).toBe(404);
  });

  it('changes status quickly and rejects invalid status', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    const createResponse = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Tarea de estado' });
    const taskId = createResponse.body.id as number;

    const updateResponse = await request(application)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'en_progreso' });
    const invalidResponse = await request(application)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'invalido' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe('en_progreso');
    expect(invalidResponse.status).toBe(400);
  });

  it('requires exact confirmation before deleting a task', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    const createResponse = await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Eliminar esta tarea' });
    const taskId = createResponse.body.id as number;

    const rejectedResponse = await request(application)
      .delete(`/api/tasks/${taskId}`)
      .send({ confirmationName: 'otra tarea' });
    const deletedResponse = await request(application)
      .delete(`/api/tasks/${taskId}`)
      .send({ confirmationName: 'Eliminar esta tarea' });

    expect(rejectedResponse.status).toBe(400);
    expect(deletedResponse.status).toBe(200);
    expect((await request(application).get(`/api/tasks/${taskId}`)).status).toBe(404);
  });

  it('filters tasks by status, priority, assignee, and combined criteria', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Tarea de Ana',
      status: 'pendiente',
      priority: 'alta',
      assignee: 'Ana García',
    });
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Tarea de Luis',
      status: 'en_progreso',
      priority: 'media',
      assignee: 'Luis',
    });
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Tarea sin asignar',
      status: 'pendiente',
      priority: 'baja',
    });

    const status = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ status: 'pendiente' });
    const priority = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ priority: 'media' });
    const assignee = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ assignee: 'garcia' });
    const combined = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ status: 'pendiente', priority: 'alta', assignee: 'ANA' });

    expect(status.body).toHaveLength(2);
    expect(priority.body).toHaveLength(1);
    expect(assignee.body).toHaveLength(1);
    expect(assignee.body[0].title).toBe('Tarea de Ana');
    expect(combined.body).toHaveLength(1);
  });

  it('searches title and assignee without case or accent sensitivity', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Revisión de integración',
      assignee: 'José Núñez',
    });
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Documentar API',
      assignee: 'Marta',
    });

    const titleResult = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ q: 'INTEGRACION' });
    const assigneeResult = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ q: 'jose nunez' });

    expect(titleResult.body).toHaveLength(1);
    expect(assigneeResult.body).toHaveLength(1);
    expect(assigneeResult.body[0].title).toBe('Revisión de integración');
  });

  it('orders tasks by creation, title, and priority', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Zeta',
      priority: 'baja',
    });
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Alfa',
      priority: 'alta',
    });
    await request(application).post(`/api/projects/${projectId}/tasks`).send({
      title: 'Media',
      priority: 'media',
    });

    const newest = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ order: 'created_desc' });
    const oldest = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ order: 'created_asc' });
    const alphabetical = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ order: 'title' });
    const byPriority = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ order: 'priority' });

    expect(newest.body.map((task: { title: string }) => task.title)).toEqual([
      'Media',
      'Alfa',
      'Zeta',
    ]);
    expect(oldest.body.map((task: { title: string }) => task.title)).toEqual([
      'Zeta',
      'Alfa',
      'Media',
    ]);
    expect(alphabetical.body.map((task: { title: string }) => task.title)).toEqual([
      'Alfa',
      'Media',
      'Zeta',
    ]);
    expect(byPriority.body.map((task: { title: string }) => task.title)).toEqual([
      'Alfa',
      'Media',
      'Zeta',
    ]);
  });

  it('returns an empty list for unmatched filters and rejects invalid parameters', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectId = await createProject(application);
    await request(application)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Tarea existente' });

    const empty = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ q: 'no existe' });
    const invalidStatus = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ status: 'invalido' });
    const invalidOrder = await request(application)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ order: 'invalido' });

    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);
    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body).toEqual({ error: 'El filtro de estado no es válido' });
    expect(invalidOrder.status).toBe(400);
    expect(invalidOrder.body).toEqual({ error: 'El orden de las tareas no es válido' });
  });
});
