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

export type TaskOrder =
  | 'created_desc'
  | 'created_asc'
  | 'title'
  | 'priority';

export interface TaskListFilters {
  status?: TaskRecord['status'];
  priority?: TaskRecord['priority'];
  assignee?: string;
  q?: string;
  order: TaskOrder;
}

export class TaskRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public findByProjectId(
    projectId: number,
    filters: TaskListFilters = { order: 'created_desc' },
  ): TaskRecord[] {
    const conditions = ['project_id = ?'];
    const values: Array<number | string> = [projectId];
    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }
    if (filters.priority) {
      conditions.push('priority = ?');
      values.push(filters.priority);
    }
    const tasks = this.database
      .prepare(`SELECT * FROM tasks WHERE ${conditions.join(' AND ')}`)
      .all(...values) as TaskRecord[];

    const normalizedAssignee = normalizeSearchText(filters.assignee ?? '');
    const normalizedQuery = normalizeSearchText(filters.q ?? '');
    const filteredTasks = tasks.filter((task) => {
      const assignee = normalizeSearchText(task.assignee ?? '');
      const title = normalizeSearchText(task.title);
      return (
        (!normalizedAssignee || assignee.includes(normalizedAssignee)) &&
        (!normalizedQuery ||
          title.includes(normalizedQuery) ||
          assignee.includes(normalizedQuery))
      );
    });

    return filteredTasks.sort((left, right) => compareTasks(left, right, filters.order));
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

const priorityRank: Record<TaskRecord['priority'], number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}

function compareTasks(
  left: TaskRecord,
  right: TaskRecord,
  order: TaskOrder,
): number {
  if (order === 'created_asc') {
    return left.created_at.localeCompare(right.created_at);
  }
  if (order === 'title') {
    return (
      normalizeSearchText(left.title).localeCompare(normalizeSearchText(right.title)) ||
      right.created_at.localeCompare(left.created_at)
    );
  }
  if (order === 'priority') {
    return (
      priorityRank[left.priority] - priorityRank[right.priority] ||
      right.created_at.localeCompare(left.created_at)
    );
  }
  return right.created_at.localeCompare(left.created_at);
}
