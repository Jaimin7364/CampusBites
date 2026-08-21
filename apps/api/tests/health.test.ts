import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('health routes', () => {
  const app = createApp();

  it('returns service health with security and request headers', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: { service: 'campusbites-api', status: 'up' },
    });
    expect(response.headers['x-request-id']).toBeTypeOf('string');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('returns the standard error shape for an unknown route', async () => {
    const response = await request(app).get('/api/not-real').expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Route GET /api/not-real was not found',
      },
    });
  });

  it('allows the configured web origin', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
