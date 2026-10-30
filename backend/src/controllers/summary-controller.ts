import type { Request, Response } from 'express';

import { AppError } from '../app/errors.js';
import { SummaryService } from '../services/summary-service.js';

export class SummaryController {
  public constructor(private readonly service: SummaryService) {}

  public get = (request: Request, response: Response): void => {
    const value = request.params.id;
    if (Array.isArray(value)) {
      throw new AppError(400, 'El identificador del proyecto no es válido');
    }
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'El identificador del proyecto no es válido');
    }
    response.status(200).json(this.service.getForProject(id));
  };
}
