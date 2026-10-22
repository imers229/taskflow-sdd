import type { SqliteDatabase } from '../database/database.js';

export interface TaskRecord {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  priority: 'baja' | 'media' | 'alta';
  status: 'pendiente' | 'en_progreso' | 'completada';
  assignee: string | null;
  due_date: string | null;
  created_at: string;
}

export interface CreateTaskRecord {
  projectId: number;
  title: string;
  description: string | null;
  priority: TaskRecord['priority'];
  status: TaskRecord['status'];
  assignee: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface UpdateTaskRecord {
  title: string;
  description: string | null;
  priority: TaskRecord['priority'];
  assignee: string | null;
  dueDate: string | null;
}

export class TaskRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public findByProjectId(projectId: number): TaskRecord[] {
    return this.database
      .prepare(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
      )
      .all(projectId) as TaskRecord[];
  }

  public findById(id: number): TaskRecord | undefined {
    return this.database
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(id) as TaskRecord | undefined;
  }

  public create(task: CreateTaskRecord): TaskRecord {
    const transaction = this.database.transaction(() => {
      const result = this.database
        .prepare(
          `INSERT INTO tasks
            (project_id, title, description, priority, status, assignee,
             due_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          task.projectId,
          task.title,
          task.description,
          task.priority,
          task.status,
          task.assignee,
          task.dueDate,
          task.createdAt,
        );
      const id = Number(result.lastInsertRowid);
      this.addHistory(task.projectId, id, 'creation', null, JSON.stringify(task));
      return this.findById(id) as TaskRecord;
    });
    return transaction();
  }

  public update(id: number, task: UpdateTaskRecord): TaskRecord | undefined {
    const transaction = this.database.transaction(() => {
      const previous = this.findById(id);
      if (!previous) {
        return undefined;
      }
      this.database
        .prepare(
          `UPDATE tasks
           SET title = ?, description = ?, priority = ?, assignee = ?,
               due_date = ?
           WHERE id = ?`,
        )
        .run(
          task.title,
          task.description,
          task.priority,
          task.assignee,
          task.dueDate,
          id,
        );
      this.addHistory(
        previous.project_id,
        id,
        'update',
        JSON.stringify(previous),
        JSON.stringify(task),
      );
      return this.findById(id);
    });
    return transaction();
  }

  public updateStatus(
    id: number,
    status: TaskRecord['status'],
  ): TaskRecord | undefined {
    const transaction = this.database.transaction(() => {
      const previous = this.findById(id);
      if (!previous) {
        return undefined;
      }
      this.database
        .prepare('UPDATE tasks SET status = ? WHERE id = ?')
        .run(status, id);
      this.addHistory(
        previous.project_id,
        id,
        'status_change',
        JSON.stringify({ status: previous.status }),
        JSON.stringify({ status }),
      );
      return this.findById(id);
    });
    return transaction();
  }

  public delete(id: number): boolean {
    const transaction = this.database.transaction(() => {
      const previous = this.findById(id);
      if (!previous) {
        return false;
      }
      this.addHistory(
        previous.project_id,
        id,
        'deletion',
        JSON.stringify(previous),
        null,
      );
      this.database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      return true;
    });
    return transaction();
  }

  private addHistory(
    projectId: number,
    entityId: number,
    changeType: 'creation' | 'update' | 'status_change' | 'deletion',
    previousValue: string | null,
    newValue: string | null,
  ): void {
    this.database
      .prepare(
        `INSERT INTO history
          (project_id, entity_type, entity_id, changed_at, change_type,
           previous_value, new_value)
         VALUES (?, 'task', ?, ?, ?, ?, ?)`,
      )
      .run(
        projectId,
        entityId,
        new Date().toISOString(),
        changeType,
        previousValue,
        newValue,
      );
  }
}
