import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { ProjectController } from './controllers/project-controller.js';
import { AppError } from './app/errors.js';
import { createDatabase, type SqliteDatabase } from './database/database.js';
import { ProjectRepository } from './repositories/project-repository.js';
import { createProjectRoutes } from './routes/project-routes.js';
import { ProjectService } from './services/project-service.js';
import { TaskController } from './controllers/task-controller.js';
import { TaskRepository } from './repositories/task-repository.js';
import { TaskService } from './services/task-service.js';
import { createTaskRoutes } from './routes/task-routes.js';
import { SummaryController } from './controllers/summary-controller.js';
import { SummaryRepository } from './repositories/summary-repository.js';
import { SummaryService } from './services/summary-service.js';
import { createSummaryRoutes } from './routes/summary-routes.js';

export function createApp(
  frontendOrigin = 'http://localhost:4200',
  database: SqliteDatabase = createDatabase(':memory:'),
): Express {
  const app = express();
  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json());
  const projectService = new ProjectService(new ProjectRepository(database));
  const projectRepository = new ProjectRepository(database);
  const taskService = new TaskService(
    new TaskRepository(database),
    projectRepository,
  );
  const summaryService = new SummaryService(
    new SummaryRepository(database),
    projectRepository,
  );
  app.use('/api/projects', createProjectRoutes(new ProjectController(projectService)));
  app.use('/api', createTaskRoutes(new TaskController(taskService)));
  app.use('/api', createSummaryRoutes(new SummaryController(summaryService)));
  app.get('/health', (_request: Request, response: Response) => {
    response.status(200).json({ status: 'ok' });
  });
  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: (error?: unknown) => void,
    ) => {
      if (response.headersSent) {
        return;
      }
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message =
        error instanceof AppError ? error.message : 'Error interno del servidor';
      response.status(statusCode).json({ error: message });
    },
  );
  return app;
}

export const app = createApp();
