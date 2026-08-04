import { PrismaClient } from '@prisma/client';

import { env } from '../../config/env';

// Single shared client; Prisma manages its own connection pool.
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
