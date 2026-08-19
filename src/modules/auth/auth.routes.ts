import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler';
import { authLimiter } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import { AuthController } from './auth.controller';
import { credentialsSchema } from './auth.schema';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post(
    '/register',
    authLimiter,
    validate(credentialsSchema),
    asyncHandler(controller.register),
  );

  router.post('/login', authLimiter, validate(credentialsSchema), asyncHandler(controller.login));

  return router;
}
