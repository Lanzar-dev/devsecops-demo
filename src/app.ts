import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env';
import { logger } from './config/logger';
import { buildContainer, type Container } from './container';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiLimiter } from './middleware/rateLimit';
import { createAuthRouter } from './modules/auth/auth.routes';
import { createTaskRouter } from './modules/tasks/task.routes';

export function buildApp(container: Container = buildContainer()): Express {
  const app = express();

  // Trust the first proxy hop (needed for correct client IPs behind ingress).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser clients (no Origin header) and allowlisted origins.
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(pinoHttp({ logger }));

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', apiLimiter);
  app.use('/api/auth', createAuthRouter(container.authController));
  app.use('/api/tasks', createTaskRouter(container.taskController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
