import request from 'supertest';

import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database/database.js';

describe('project endpoints', () => {
  function createTestApp() {
    return createApp('http://localhost:4200', createDatabase(':memory:'));
  }

  it('creates and lists a project', async () => {
    const application = createTestApp();

    const createResponse = await request(application)
      .post('/api/projects')
      .send({ name: '  Equipo Ágil  ', description: 'Planificación' });
    const listResponse = await request(application).get('/api/projects');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      name: 'Equipo Ágil',
      description: 'Planificación',
      normalized_name: 'equipo agil',
    });
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
  });

  it('rejects invalid and duplicate normalized names', async () => {
    const application = createTestApp();
    await request(application).post('/api/projects').send({ name: 'Ágil' });

    const invalidResponse = await request(application)
      .post('/api/projects')
      .send({ name: '  ' });
    const duplicateResponse = await request(application)
      .post('/api/projects')
      .send({ name: ' agil ' });

    expect(invalidResponse.status).toBe(400);
    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body).toEqual({
      error: 'Ya existe un proyecto con ese nombre',
    });
  });

  it('gets, updates, and rejects missing projects', async () => {
    const application = createTestApp();
    const createResponse = await request(application)
      .post('/api/projects')
      .send({ name: 'Backend' });
    const id = createResponse.body.id;

    const getResponse = await request(application).get(`/api/projects/${id}`);
    const updateResponse = await request(application)
      .put(`/api/projects/${id}`)
      .send({ name: 'Backend API', description: 'Actualizado' });
    const missingResponse = await request(application).get('/api/projects/999');

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Backend API');
    expect(missingResponse.status).toBe(404);
  });

  it('requires exact confirmation before deleting a project and its tasks', async () => {
    const database = createDatabase(':memory:');
    const application = createApp('http://localhost:4200', database);
    const createResponse = await request(application)
      .post('/api/projects')
      .send({ name: 'Eliminar' });
    const id = createResponse.body.id as number;
    database
      .prepare(
        `INSERT INTO tasks
          (project_id, title, priority, status, created_at)
         VALUES (?, 'Tarea', 'media', 'pendiente', ?)`,
      )
      .run(id, new Date().toISOString());

    const rejectedResponse = await request(application)
      .delete(`/api/projects/${id}`)
      .send({ confirmationName: 'otro' });
    const deletedResponse = await request(application)
      .delete(`/api/projects/${id}`)
      .send({ confirmationName: 'Eliminar' });

    expect(rejectedResponse.status).toBe(400);
    expect(deletedResponse.status).toBe(200);
    expect(
      database.prepare('SELECT * FROM projects WHERE id = ?').get(id),
    ).toBeUndefined();
    expect(
      database.prepare('SELECT * FROM tasks WHERE project_id = ?').all(id),
    ).toEqual([]);
    expect(
      database.prepare('SELECT * FROM history WHERE project_id = ?').all(id),
    ).toHaveLength(3);
  });
});
