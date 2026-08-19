import { prisma } from '../../infra/prisma/client';
import type {
  CreateTaskInput,
  Task,
  TaskRepository,
  UpdateTaskInput,
} from './task.repository';

export class PrismaTaskRepository implements TaskRepository {
  async create(input: CreateTaskInput): Promise<Task> {
    return prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'TODO',
        ownerId: input.ownerId,
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({ where: { id } });
  }

  async listByOwner(ownerId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    return prisma.task.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}
