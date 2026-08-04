import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      REPOSITORY_DRIVER: 'memory',
      JWT_SECRET: 'test-jwt-secret-value-that-is-long-enough-01',
      JWT_EXPIRES_IN: '15m',
      CORS_ORIGINS: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/server.ts',
        'src/**/*.d.ts',
        'src/infra/prisma/**',
        'src/**/*.prisma.repository.ts',
      ],
    },
  },
});
