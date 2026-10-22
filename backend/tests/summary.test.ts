import request from 'supertest';

import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database/database.js';

describe('project summary endpoint', () => {
  it('returns counts, pending overdue tasks, and rounded completion percentage', async () => {
    const database = createDatabase(':memory:');
    const application = createApp('http://localhost:4200', database);
    const projectResponse = await request(application)
      .post('/api/projects')
      .send({ name: 'Resumen' });
    const projectId = projectResponse.body.id as number;

    const insertTask = database.prepare(
      `INSERT INTO tasks
        (project_id, title, priority, status, due_date, created_at)
       VALUES (?, ?, 'media', ?, ?, ?)`,
    );
    const createdAt = new Date().toISOString();
    insertTask.run(projectId, 'Pendiente vencida', 'pendiente', '2020-01-01', createdAt);
    insertTask.run(projectId, 'En progreso vencida', 'en_progreso', '2020-01-01', createdAt);
    insertTask.run(projectId, 'Completada', 'completada', '2020-01-01', createdAt);
    insertTask.run(projectId, 'Pendiente actual', 'pendiente', '2099-01-01', createdAt);

    const response = await request(application).get(
      `/api/projects/${projectId}/summary`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 4,
      pendiente: 2,
      en_progreso: 1,
      completada: 1,
      vencidas: 1,
      completedPercentage: 25,
    });
  });

  it('returns zero percentage for an empty project and 404 for a missing project', async () => {
    const application = createApp('http://localhost:4200', createDatabase(':memory:'));
    const projectResponse = await request(application)
      .post('/api/projects')
      .send({ name: 'Vacío' });
    const emptyResponse = await request(application).get(
      `/api/projects/${projectResponse.body.id}/summary`,
    );
    const missingResponse = await request(application).get('/api/projects/999/summary');

    expect(emptyResponse.status).toBe(200);
    expect(emptyResponse.body).toMatchObject({
      total: 0,
      pendiente: 0,
      en_progreso: 0,
      completada: 0,
      vencidas: 0,
      completedPercentage: 0,
    });
    expect(missingResponse.status).toBe(404);
  });
});
