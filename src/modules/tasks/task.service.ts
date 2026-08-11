import { NotFoundError } from '../../lib/errors';
import type { Task, TaskRepository, UpdateTaskInput } from './task.repository';
import type { CreateTaskBody, UpdateTaskBody } from './task.schema';

export class TaskService {
  constructor(private readonly tasks: TaskRepository) {}

  async create(ownerId: string, input: CreateTaskBody): Promise<Task> {
    return this.tasks.create({
      title: input.title,
      description: input.description ?? null,
      ...(input.status ? { status: input.status } : {}),
      ownerId,
    });
  }

  async list(ownerId: string): Promise<Task[]> {
    return this.tasks.listByOwner(ownerId);
  }

  async get(ownerId: string, taskId: string): Promise<Task> {
    return this.requireOwned(ownerId, taskId);
  }

  async update(ownerId: string, taskId: string, input: UpdateTaskBody): Promise<Task> {
    await this.requireOwned(ownerId, taskId);
    const data: UpdateTaskInput = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    };
    return this.tasks.update(taskId, data);
  }

  async remove(ownerId: string, taskId: string): Promise<void> {
    await this.requireOwned(ownerId, taskId);
    await this.tasks.delete(taskId);
  }

  // Central authorization check: a task the caller does not own is reported
  // as "not found" so we never confirm existence of another user's resource.
  private async requireOwned(ownerId: string, taskId: string): Promise<Task> {
    const task = await this.tasks.findById(taskId);
    if (!task?.ownerId || task.ownerId !== ownerId) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }
}
