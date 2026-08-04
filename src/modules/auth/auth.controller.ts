import type { Request, Response } from 'express';

import type { AuthService } from './auth.service';
import type { Credentials } from './auth.schema';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body as Credentials);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body as Credentials);
    res.status(200).json(result);
  };
}
