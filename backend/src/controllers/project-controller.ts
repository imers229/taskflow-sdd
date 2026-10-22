import type { Request, Response } from 'express';

import { ProjectService } from '../services/project-service.js';
import { AppError } from '../app/errors.js';

export class ProjectController {
  public constructor(private readonly service: ProjectService) {}

  public list = (_request: Request, response: Response): void => {
    response.status(200).json(this.service.list());
  };

  public get = (request: Request, response: Response): void => {
    response.status(200).json(this.service.get(this.parseId(request.params.id)));
  };

  public create = (request: Request, response: Response): void => {
    response.status(201).json(this.service.create(request.body));
  };

  public update = (request: Request, response: Response): void => {
    response
      .status(200)
      .json(
        this.service.update(this.parseId(request.params.id), request.body),
      );
  };

  public remove = (request: Request, response: Response): void => {
    this.service.remove(
      this.parseId(request.params.id),
      request.body?.confirmationName,
    );
    response.status(200).json({ message: 'Proyecto eliminado correctamente' });
  };

  private parseId(value: string | string[]): number {
    if (Array.isArray(value)) {
      throw new AppError(400, 'El identificador del proyecto no es válido');
    }
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'El identificador del proyecto no es válido');
    }
    return id;
  }
}
