import { createDatabase } from '../src/database/database.js';

describe('database initialization', () => {
  it('creates the schema and enables foreign keys', () => {
    const database = createDatabase(':memory:');

    const tables = database
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name IN ('projects', 'tasks', 'history')
         ORDER BY name`,
      )
      .all() as Array<{ name: string }>;

    expect(tables.map((table) => table.name)).toEqual([
      'history',
      'projects',
      'tasks',
    ]);
    expect(database.pragma('foreign_keys', { simple: true })).toBe(1);
    database.close();
  });

  it('rejects a task that references a missing project', () => {
    const database = createDatabase(':memory:');

    expect(() =>
      database
        .prepare(
          `INSERT INTO tasks
            (project_id, title, priority, status, created_at)
           VALUES (999, 'Tarea válida', 'media', 'pendiente', ?)`,
        )
        .run(new Date().toISOString()),
    ).toThrow();
    database.close();
  });
});
