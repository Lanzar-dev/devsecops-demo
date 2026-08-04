import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { env } from '../config/env';
import { AppError, BadRequestError, NotFoundError } from '../lib/errors';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError('Route not found'));
}

// Express identifies error middleware by its four-argument signature.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = new BadRequestError('Validation failed', err.flatten().fieldErrors);
  } else {
    appError = new AppError(500, 'INTERNAL_ERROR', 'Internal server error', {
      isOperational: false,
    });
  }

  if (!appError.isOperational || appError.statusCode >= 500) {
    logger.error({ err }, 'Unhandled error');
  }

  const body: ErrorBody = {
    error: {
      code: appError.code,
      message: appError.statusCode >= 500 ? 'Internal server error' : appError.message,
    },
  };

  if (appError.details !== undefined && env.NODE_ENV !== 'production') {
    body.error.details = appError.details;
  }

  res.status(appError.statusCode).json(body);
}
