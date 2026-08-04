import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { TaskController } from './task.controller';
import { createTaskSchema, taskIdParamsSchema, updateTaskSchema } from './task.schema';

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  // Every task route requires authentication.
  router.use(requireAuth);

  router.post('/', validate(createTaskSchema), asyncHandler(controller.create));
  router.get('/', asyncHandler(controller.list));
  router.get('/:id', validate(taskIdParamsSchema, 'params'), asyncHandler(controller.get));
  router.patch(
    '/:id',
    validate(taskIdParamsSchema, 'params'),
    validate(updateTaskSchema),
    asyncHandler(controller.update),
  );
  router.delete('/:id', validate(taskIdParamsSchema, 'params'), asyncHandler(controller.remove));

  return router;
}
