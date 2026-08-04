import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { BadRequestError } from '../lib/errors';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validates and replaces a request part with the parsed, typed result.
 * Rejects unknown/invalid input at the system boundary.
 */
export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any)[part] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError('Validation failed', error.flatten().fieldErrors));
        return;
      }
      next(error);
    }
  };
}
