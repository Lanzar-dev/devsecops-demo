import { prisma } from '../../infra/prisma/client';
import type { CreateUserInput, User, UserRepository } from './user.repository';

export class PrismaUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({ data: input });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
