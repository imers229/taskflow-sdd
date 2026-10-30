import type { SqliteDatabase } from '../database/database.js';

export interface HistoryRecord {
  id: number;
  project_id: number;
  entity_type: 'project' | 'task';
  entity_id: number;
  changed_at: string;
  change_type: 'creation' | 'update' | 'status_change' | 'deletion';
  previous_value: string | null;
  new_value: string | null;
}

export class HistoryRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public findByProjectId(projectId: number): HistoryRecord[] {
    return this.database
      .prepare(
        'SELECT * FROM history WHERE project_id = ? ORDER BY changed_at DESC',
      )
      .all(projectId) as HistoryRecord[];
  }
}
