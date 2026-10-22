import type { SqliteDatabase } from '../database/database.js';

export interface ProjectSummaryRecord {
  total: number;
  pendiente: number;
  en_progreso: number;
  completada: number;
  vencidas: number;
}

export class SummaryRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public getForProject(
    projectId: number,
    today: string,
  ): ProjectSummaryRecord {
    const row = this.database
      .prepare(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) AS pendiente,
           SUM(CASE WHEN status = 'en_progreso' THEN 1 ELSE 0 END) AS en_progreso,
           SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END) AS completada,
           SUM(CASE
             WHEN status = 'pendiente' AND due_date IS NOT NULL AND due_date < ?
             THEN 1 ELSE 0
           END) AS vencidas
         FROM tasks
         WHERE project_id = ?`,
      )
      .get(today, projectId) as {
        total: number;
        pendiente: number | null;
        en_progreso: number | null;
        completada: number | null;
        vencidas: number | null;
      };

    return {
      total: row.total,
      pendiente: row.pendiente ?? 0,
      en_progreso: row.en_progreso ?? 0,
      completada: row.completada ?? 0,
      vencidas: row.vencidas ?? 0,
    };
  }
}
