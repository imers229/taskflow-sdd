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
});
