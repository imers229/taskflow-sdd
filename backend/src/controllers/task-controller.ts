import type { Request, Response } from 'express';

import { AppError } from '../app/errors.js';
import { TaskService } from '../services/task-service.js';

export class TaskController {
  public constructor(private readonly service: TaskService) {}

  public list = (request: Request, response: Response): void => {
    response.status(200).json(
      this.service.list(this.parseId(request.params.projectId), request.query),
    );
  };

  public create = (request: Request, response: Response): void => {
    response.status(201).json(
      this.service.create(this.parseId(request.params.projectId), request.body),
    );
  };

  public get = (request: Request, response: Response): void => {
    response.status(200).json(this.service.get(this.parseId(request.params.id)));
  };

  public update = (request: Request, response: Response): void => {
    response.status(200).json(
      this.service.update(this.parseId(request.params.id), request.body),
    );
  };

  public remove = (request: Request, response: Response): void => {
    this.service.remove(
      this.parseId(request.params.id),
      request.body?.confirmationName,
    );
    response.status(200).json({ message: 'Tarea eliminada correctamente' });
  };

  public updateStatus = (request: Request, response: Response): void => {
    response.status(200).json(
      this.service.updateStatus(
        this.parseId(request.params.id),
        request.body?.status,
      ),
    );
  };

  private parseId(value: string | string[]): number {
    if (Array.isArray(value)) {
      throw new AppError(400, 'El identificador no es válido');
    }
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'El identificador no es válido');
    }
    return id;
  }
}
