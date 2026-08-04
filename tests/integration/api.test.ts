import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app';

const app = buildApp();

async function registerAndLogin(email: string) {
  const password = 'sup3rsecret!';
  await request(app).post('/api/auth/register').send({ email, password });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token as string;
}

describe('API integration', () => {
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    tokenA = await registerAndLogin('a@example.com');
    tokenB = await registerAndLogin('b@example.com');
  });

  it('exposes a health check', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('rejects unauthenticated task access', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('rejects invalid registration payloads', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('creates and lists tasks for the owner', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Buy milk' });
    expect(create.status).toBe(201);
    expect(create.body.title).toBe('Buy milk');

    const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenA}`);
    expect(list.status).toBe(200);
    expect(list.body.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('prevents one user from reading another users task (IDOR)', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'secret plan' });
    const taskId = create.body.id as string;

    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });

  it('rejects malformed task ids', async () => {
    const res = await request(app)
      .get('/api/tasks/not-a-uuid')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(400);
  });
});
