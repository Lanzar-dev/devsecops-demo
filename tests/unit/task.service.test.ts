import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundError } from '../../src/lib/errors';
import { InMemoryTaskRepository } from '../../src/modules/tasks/task.repository';
import { TaskService } from '../../src/modules/tasks/task.service';

const OWNER = 'user-a';
const OTHER = 'user-b';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService(new InMemoryTaskRepository());
  });

  it('creates a task owned by the caller', async () => {
    const task = await service.create(OWNER, { title: 'Write tests' });
    expect(task.ownerId).toBe(OWNER);
    expect(task.status).toBe('TODO');
  });

  it('lists only the callers own tasks', async () => {
    await service.create(OWNER, { title: 'A1' });
    await service.create(OWNER, { title: 'A2' });
    await service.create(OTHER, { title: 'B1' });

    const tasks = await service.list(OWNER);
    expect(tasks).toHaveLength(2);
    expect(tasks.every((t) => t.ownerId === OWNER)).toBe(true);
  });

  it('prevents reading another users task (IDOR -> 404)', async () => {
    const task = await service.create(OWNER, { title: 'private' });
    await expect(service.get(OTHER, task.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('prevents updating another users task', async () => {
    const task = await service.create(OWNER, { title: 'private' });
    await expect(
      service.update(OTHER, task.id, { title: 'hijacked' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('prevents deleting another users task', async () => {
    const task = await service.create(OWNER, { title: 'private' });
    await expect(service.remove(OTHER, task.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates an owned task', async () => {
    const task = await service.create(OWNER, { title: 'draft' });
    const updated = await service.update(OWNER, task.id, { status: 'DONE' });
    expect(updated.status).toBe('DONE');
  });
});
