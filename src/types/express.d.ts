import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Populated by the auth middleware after a valid JWT is verified. */
      user?: { id: string; email: string };
    }
  }
}

export {};
