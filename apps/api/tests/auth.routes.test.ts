import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
}));

vi.mock('../src/services/auth.service.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/services/auth.service.js')>()),
  register: mocks.register,
}));

import { createApp } from '../src/app.js';

describe('authentication routes', () => {
  it('rejects invalid registration before reaching the service', async () => {
    const response = await request(createApp()).post('/api/auth/register/user').send({
      fullName: 'A',
      email: 'invalid',
      phone: '123',
      password: 'weak',
      confirmPassword: 'different',
    });
    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('registers a user and places the refresh token in an HTTP-only cookie', async () => {
    mocks.register.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'user', email: 'aarav@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenTtlDays: 7,
    });
    const response = await request(createApp()).post('/api/auth/register/user').send({
      fullName: 'Aarav Shah',
      email: 'aarav@example.com',
      phone: '9876543210',
      password: 'Campus123',
      confirmPassword: 'Campus123',
    });
    expect(response.status).toBe(201);
    const body = response.body as {
      data: { accessToken: string; refreshToken?: string };
    };
    expect(body.data.accessToken).toBe('access-token');
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
    expect(body.data.refreshToken).toBeUndefined();
  });

  it('protects the current profile endpoint', async () => {
    const response = await request(createApp()).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect((response.body as { error: { code: string } }).error.code).toBe(
      'AUTHENTICATION_REQUIRED',
    );
  });
});
