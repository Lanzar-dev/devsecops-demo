import type { Request, Response } from 'express';

import { UnauthorizedError } from '../../lib/errors';
import type { TaskService } from './task.service';
import type { CreateTaskBody, UpdateTaskBody } from './task.schema';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.create(this.userId(req), req.body as CreateTaskBody);
    res.status(201).json(task);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const tasks = await this.service.list(this.userId(req));
    res.status(200).json({ tasks });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.get(this.userId(req), req.params.id as string);
    res.status(200).json(task);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const task = await this.service.update(
      this.userId(req),
      req.params.id as string,
      req.body as UpdateTaskBody,
    );
    res.status(200).json(task);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(this.userId(req), req.params.id as string);
    res.status(204).send();
  };

  private userId(req: Request): string {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    return req.user.id;
  }
}
