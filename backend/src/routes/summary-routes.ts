import { Router } from 'express';

import { SummaryController } from '../controllers/summary-controller.js';

export function createSummaryRoutes(controller: SummaryController): Router {
  const router = Router();
  router.get('/projects/:id/summary', controller.get);
  return router;
}
