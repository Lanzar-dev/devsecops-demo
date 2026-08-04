import { describe, expect, it } from 'vitest';

import { AuthService } from '../../src/modules/auth/auth.service';
import { ConflictError, UnauthorizedError } from '../../src/lib/errors';
import { InMemoryUserRepository } from '../../src/modules/users/user.repository';

function makeService() {
  return new AuthService(new InMemoryUserRepository());
}

const credentials = { email: 'alice@example.com', password: 'sup3rsecret!' };

describe('AuthService', () => {
  it('registers a new user and returns a token', async () => {
    const service = makeService();
    const result = await service.register(credentials);

    expect(result.user.email).toBe(credentials.email);
    expect(result.user.id).toBeTruthy();
    expect(result.token).toEqual(expect.any(String));
  });

  it('rejects duplicate email registration', async () => {
    const service = makeService();
    await service.register(credentials);

    await expect(service.register(credentials)).rejects.toBeInstanceOf(ConflictError);
  });

  it('logs in with correct credentials', async () => {
    const service = makeService();
    await service.register(credentials);

    const result = await service.login(credentials);
    expect(result.user.email).toBe(credentials.email);
    expect(result.token).toEqual(expect.any(String));
  });

  it('rejects login with wrong password', async () => {
    const service = makeService();
    await service.register(credentials);

    await expect(
      service.login({ email: credentials.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects login for unknown email', async () => {
    const service = makeService();

    await expect(service.login(credentials)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
