import { createDatabase } from '../src/database/database.js';
import { ProjectRepository } from '../src/repositories/project-repository.js';
import { TaskRepository } from '../src/repositories/task-repository.js';
import { TaskService } from '../src/services/task-service.js';

describe('TaskService', () => {
  it('preserves a past due date when editing an existing task', () => {
    const database = createDatabase(':memory:');
    const projectRepository = new ProjectRepository(database);
    const taskRepository = new TaskRepository(database);
    const project = projectRepository.create({
      name: 'Proyecto',
      normalizedName: 'proyecto',
      description: null,
      createdAt: new Date().toISOString(),
    });
    const task = database
      .prepare(
        `INSERT INTO tasks
          (project_id, title, priority, status, due_date, created_at)
         VALUES (?, ?, 'media', 'pendiente', '2020-01-01', ?)`,
      )
      .run(project.id, 'Tarea vencida', new Date().toISOString());
    const service = new TaskService(taskRepository, projectRepository);

    const updated = service.update(Number(task.lastInsertRowid), {
      title: 'Tarea vencida editada',
    });

    expect(updated.due_date).toBe('2020-01-01');
    database.close();
  });
});
