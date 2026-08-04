import { randomUUID } from 'node:crypto';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  ownerId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
}

export interface TaskRepository {
  create(input: CreateTaskInput): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  listByOwner(ownerId: string): Promise<Task[]>;
  update(id: string, input: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly byId = new Map<string, Task>();

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'TODO',
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(task.id, task);
    return task;
  }

  async findById(id: string): Promise<Task | null> {
    return this.byId.get(id) ?? null;
  }

  async listByOwner(ownerId: string): Promise<Task[]> {
    return [...this.byId.values()]
      .filter((task) => task.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const existing = this.byId.get(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }
    const updated: Task = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date(),
    };
    this.byId.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
