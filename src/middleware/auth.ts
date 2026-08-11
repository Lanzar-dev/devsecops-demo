import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../lib/errors';
import { verifyAccessToken } from '../lib/token';

/**
 * Requires a valid Bearer token. Populates req.user on success.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing bearer token'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  const claims = verifyAccessToken(token);
  req.user = { id: claims.id, email: claims.email };
  next();
}
