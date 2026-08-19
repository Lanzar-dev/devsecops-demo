import { hash, verify } from '@node-rs/argon2';

import { ConflictError, UnauthorizedError } from '../../lib/errors';
import { signAccessToken } from '../../lib/token';
import type { UserRepository } from '../users/user.repository';
import type { Credentials } from './auth.schema';

export interface AuthResult {
  token: string;
  user: { id: string; email: string };
}

// OWASP-recommended Argon2id parameters (memory-hard).
const HASH_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

// A real Argon2 hash computed once, used to equalize login timing when the
// account does not exist (mitigates user-enumeration via timing).
let dummyHashPromise: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hash('timing-equalization-placeholder', HASH_OPTIONS);
  return dummyHashPromise;
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(credentials: Credentials): Promise<AuthResult> {
    const existing = await this.users.findByEmail(credentials.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hash(credentials.password, HASH_OPTIONS);
    const user = await this.users.create({ email: credentials.email, passwordHash });

    return this.toResult(user.id, user.email);
  }

  async login(credentials: Credentials): Promise<AuthResult> {
    const user = await this.users.findByEmail(credentials.email);
    if (!user) {
      // Perform a real verify against a dummy hash to reduce timing signal.
      await verify(await getDummyHash(), credentials.password).catch(() => false);
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await verify(user.passwordHash, credentials.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.toResult(user.id, user.email);
  }

  private toResult(id: string, email: string): AuthResult {
    const token = signAccessToken({ id, email });
    return { token, user: { id, email } };
  }
}
