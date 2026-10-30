import { AppError } from '../app/errors.js';
import {
  normalizeProjectName,
  validateProjectDescription,
  validateProjectName,
} from '../utils/project-name.js';
import {
  ProjectRepository,
  type ProjectRecord,
} from '../repositories/project-repository.js';

export interface ProjectInput {
  name: unknown;
  description?: unknown;
}

export class ProjectService {
  public constructor(private readonly repository: ProjectRepository) {}

  public list(): ProjectRecord[] {
    return this.repository.findAll();
  }

  public get(id: number): ProjectRecord {
    const project = this.repository.findById(id);
    if (!project) {
      throw new AppError(404, 'Proyecto no encontrado');
    }
    return project;
  }

  public create(input: ProjectInput): ProjectRecord {
    const name = validateProjectName(input.name);
    const normalizedName = normalizeProjectName(name);
    if (this.repository.findByNormalizedName(normalizedName)) {
      throw new AppError(400, 'Ya existe un proyecto con ese nombre');
    }

    try {
      return this.repository.create({
        name,
        normalizedName,
        description: validateProjectDescription(input.description),
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new AppError(400, 'Ya existe un proyecto con ese nombre');
      }
      throw error;
    }
  }

  public update(id: number, input: ProjectInput): ProjectRecord {
    this.get(id);
    const name = validateProjectName(input.name);
    const normalizedName = normalizeProjectName(name);
    if (this.repository.findByNormalizedName(normalizedName, id)) {
      throw new AppError(400, 'Ya existe un proyecto con ese nombre');
    }

    try {
      const project = this.repository.update(id, {
        name,
        normalizedName,
        description: validateProjectDescription(input.description),
      });
      if (!project) {
        throw new AppError(404, 'Proyecto no encontrado');
      }
      return project;
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new AppError(400, 'Ya existe un proyecto con ese nombre');
      }
      throw error;
    }
  }

  public remove(id: number, confirmationName: unknown): void {
    const project = this.get(id);
    if (confirmationName !== project.name) {
      throw new AppError(
        400,
        'Debes escribir el nombre exacto del proyecto para eliminarlo',
      );
    }
    if (!this.repository.delete(id)) {
      throw new AppError(404, 'Proyecto no encontrado');
    }
  }

  private isUniqueConstraint(error: unknown): boolean {
    return error instanceof Error && error.message.includes('UNIQUE constraint');
  }
}
