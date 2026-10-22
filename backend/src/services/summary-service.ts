import { AppError } from '../app/errors.js';
import { ProjectRepository } from '../repositories/project-repository.js';
import {
  SummaryRepository,
  type ProjectSummaryRecord,
} from '../repositories/summary-repository.js';

export interface ProjectSummary extends ProjectSummaryRecord {
  completedPercentage: number;
}

export class SummaryService {
  public constructor(
    private readonly repository: SummaryRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly todayProvider: () => string = () =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Guayaquil',
      }).format(new Date()),
  ) {}

  public getForProject(projectId: number): ProjectSummary {
    if (!this.projectRepository.findById(projectId)) {
      throw new AppError(404, 'Proyecto no encontrado');
    }

    const summary = this.repository.getForProject(
      projectId,
      this.todayProvider(),
    );
    return {
      ...summary,
      completedPercentage:
        summary.total === 0
          ? 0
          : Math.round((summary.completada / summary.total) * 100),
    };
  }
}
