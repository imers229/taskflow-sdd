import { Router } from 'express';

import { TaskController } from '../controllers/task-controller.js';

export function createTaskRoutes(controller: TaskController): Router {
  const router = Router();
  router.get('/projects/:projectId/tasks', controller.list);
  router.post('/projects/:projectId/tasks', controller.create);
  router.get('/tasks/:id', controller.get);
  router.put('/tasks/:id', controller.update);
  router.delete('/tasks/:id', controller.remove);
  router.patch('/tasks/:id/status', controller.updateStatus);
  return router;
}
