import { env } from './config/env';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { TaskController } from './modules/tasks/task.controller';
import { TaskService } from './modules/tasks/task.service';
import { InMemoryTaskRepository, type TaskRepository } from './modules/tasks/task.repository';
import { InMemoryUserRepository, type UserRepository } from './modules/users/user.repository';

export interface Container {
  authController: AuthController;
  taskController: TaskController;
}

interface Repositories {
  users: UserRepository;
  tasks: TaskRepository;
}

function buildRepositories(): Repositories {
  if (env.REPOSITORY_DRIVER === 'prisma') {
    // Loaded lazily so the memory driver (and tests) never pull in Prisma.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaUserRepository } = require('./modules/users/user.prisma.repository') as typeof import('./modules/users/user.prisma.repository');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaTaskRepository } = require('./modules/tasks/task.prisma.repository') as typeof import('./modules/tasks/task.prisma.repository');
    return { users: new PrismaUserRepository(), tasks: new PrismaTaskRepository() };
  }

  return { users: new InMemoryUserRepository(), tasks: new InMemoryTaskRepository() };
}

export function buildContainer(): Container {
  const repos = buildRepositories();

  const authService = new AuthService(repos.users);
  const taskService = new TaskService(repos.tasks);

  return {
    authController: new AuthController(authService),
    taskController: new TaskController(taskService),
  };
}
