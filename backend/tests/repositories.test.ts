import { createDatabase } from '../src/database/database.js';
import { ProjectRepository } from '../src/repositories/project-repository.js';
import { TaskRepository } from '../src/repositories/task-repository.js';
import { HistoryRepository } from '../src/repositories/history-repository.js';

describe('repositories', () => {
  it('persists and retrieves projects through the project repository', () => {
    const database = createDatabase(':memory:');
    const repository = new ProjectRepository(database);

    const project = repository.create({
      name: 'TaskFlow',
      normalizedName: 'taskflow',
      description: 'Proyecto principal',
      createdAt: '2026-10-22T14:00:00.000Z',
    });

    expect(project).toMatchObject({
      id: 1,
      name: 'TaskFlow',
      normalized_name: 'taskflow',
    });
    expect(repository.findAll()).toHaveLength(1);
    expect(repository.findById(project.id)?.description).toBe(
      'Proyecto principal',
    );
    database.close();
  });

  it('keeps task and history reads isolated by project', () => {
    const database = createDatabase(':memory:');
    const projectRepository = new ProjectRepository(database);
    const taskRepository = new TaskRepository(database);
    const historyRepository = new HistoryRepository(database);
    const project = projectRepository.create({
      name: 'TaskFlow',
      normalizedName: 'taskflow',
      description: null,
      createdAt: '2026-10-22T14:00:00.000Z',
    });

    database
      .prepare(
        `INSERT INTO tasks
          (project_id, title, priority, status, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(project.id, 'Implementar base', 'alta', 'pendiente', project.created_at);
    database
      .prepare(
        `INSERT INTO history
          (project_id, entity_type, entity_id, changed_at, change_type,
           previous_value, new_value)
         VALUES (?, 'project', ?, ?, 'creation', NULL, ?)`,
      )
      .run(project.id, project.id, project.created_at, '{"name":"TaskFlow"}');

    expect(taskRepository.findByProjectId(project.id)).toHaveLength(1);
    expect(historyRepository.findByProjectId(project.id)).toHaveLength(2);
    expect(taskRepository.findByProjectId(999)).toEqual([]);
    expect(historyRepository.findByProjectId(999)).toEqual([]);
    database.close();
  });
});
