import type { SqliteDatabase } from '../database/database.js';

export interface ProjectRecord {
  id: number;
  name: string;
  normalized_name: string;
  description: string | null;
  created_at: string;
}

export interface CreateProjectRecord {
  name: string;
  normalizedName: string;
  description: string | null;
  createdAt: string;
}

export interface UpdateProjectRecord {
  name: string;
  normalizedName: string;
  description: string | null;
}

export class ProjectRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public create(project: CreateProjectRecord): ProjectRecord {
    const transaction = this.database.transaction(() => {
      const result = this.database
        .prepare(
          `INSERT INTO projects
            (name, normalized_name, description, created_at)
           VALUES (?, ?, ?, ?)`,
        )
        .run(
          project.name,
          project.normalizedName,
          project.description,
          project.createdAt,
        );
      const id = Number(result.lastInsertRowid);
      this.database
        .prepare(
          `INSERT INTO history
            (project_id, entity_type, entity_id, changed_at, change_type,
             previous_value, new_value)
           VALUES (?, 'project', ?, ?, 'creation', NULL, ?)`,
        )
        .run(id, id, project.createdAt, JSON.stringify(project));
      return this.findById(id) as ProjectRecord;
    });

    return transaction();
  }

  public findAll(): ProjectRecord[] {
    return this.database
      .prepare('SELECT * FROM projects ORDER BY created_at DESC')
      .all() as ProjectRecord[];
  }

  public findById(id: number): ProjectRecord | undefined {
    return this.database
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(id) as ProjectRecord | undefined;
  }

  public findByNormalizedName(
    normalizedName: string,
    excludedId?: number,
  ): ProjectRecord | undefined {
    if (excludedId === undefined) {
      return this.database
        .prepare('SELECT * FROM projects WHERE normalized_name = ?')
        .get(normalizedName) as ProjectRecord | undefined;
    }

    return this.database
      .prepare(
        'SELECT * FROM projects WHERE normalized_name = ? AND id != ?',
      )
      .get(normalizedName, excludedId) as ProjectRecord | undefined;
  }

  public update(
    id: number,
    project: UpdateProjectRecord,
  ): ProjectRecord | undefined {
    const transaction = this.database.transaction(() => {
      const previous = this.findById(id);
      if (!previous) {
        return undefined;
      }
      const result = this.database
        .prepare(
          `UPDATE projects
           SET name = ?, normalized_name = ?, description = ?
           WHERE id = ?`,
        )
        .run(project.name, project.normalizedName, project.description, id);
      if (result.changes === 0) {
        return undefined;
      }
      this.database
        .prepare(
          `INSERT INTO history
            (project_id, entity_type, entity_id, changed_at, change_type,
             previous_value, new_value)
           VALUES (?, 'project', ?, ?, 'update', ?, ?)`,
        )
        .run(
          id,
          id,
          new Date().toISOString(),
          JSON.stringify(previous),
          JSON.stringify(project),
        );
      return this.findById(id);
    });

    return transaction();
  }

  public delete(id: number): boolean {
    const transaction = this.database.transaction(() => {
      const project = this.findById(id);
      if (!project) {
        return false;
      }
      const tasks = this.database
        .prepare('SELECT * FROM tasks WHERE project_id = ?')
        .all(id);
      const changedAt = new Date().toISOString();
      const historyStatement = this.database.prepare(
        `INSERT INTO history
          (project_id, entity_type, entity_id, changed_at, change_type,
           previous_value, new_value)
         VALUES (?, ?, ?, ?, 'deletion', ?, NULL)`,
      );
      for (const task of tasks) {
        historyStatement.run(
          id,
          'task',
          (task as { id: number }).id,
          changedAt,
          JSON.stringify(task),
        );
      }
      this.database.prepare('DELETE FROM tasks WHERE project_id = ?').run(id);
      historyStatement.run(
        id,
        'project',
        id,
        changedAt,
        JSON.stringify(project),
      );
      const result = this.database
        .prepare('DELETE FROM projects WHERE id = ?')
        .run(id);
      return result.changes > 0;
    });

    return transaction();
  }
}
