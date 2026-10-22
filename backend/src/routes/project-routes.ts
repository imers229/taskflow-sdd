import { Router } from 'express';

import { ProjectController } from '../controllers/project-controller.js';

export function createProjectRoutes(controller: ProjectController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
