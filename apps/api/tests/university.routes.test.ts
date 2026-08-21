import { UserRole } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({
  listPublicUniversities: vi.fn(),
  listUniversities: vi.fn(),
  getUniversity: vi.fn(),
  createUniversity: vi.fn(),
  updateUniversity: vi.fn(),
  setUniversityStatus: vi.fn(),
  deleteUniversity: vi.fn(),
}));

vi.mock('../src/services/university.service.js', () => service);
vi.mock('../src/middleware/authenticate.js', () => ({
  authenticate: (request: { header(name: string): string | undefined; auth?: unknown }, _response: unknown, next: (error?: unknown) => void) => {
    const role = request.header('x-test-role');
    request.auth = {
      userId: 'test-account',
      role:
        role === 'admin'
          ? UserRole.ADMIN
          : role === 'seller'
            ? UserRole.SELLER
            : UserRole.USER,
    };
    next();
  },
}));

import { createApp } from '../src/app.js';

const university = {
  id: 'cm1university000000000000001',
  name: 'Gujarat Technological University',
  city: 'Ahmedabad',
  state: 'Gujarat',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('university routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.listPublicUniversities.mockResolvedValue({
      universities: [university],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });
  });

  it('lists active universities publicly with parsed pagination', async () => {
    const response = await request(createApp()).get('/api/universities?search=Gujarat');
    expect(response.status).toBe(200);
    const body = response.body as { data: { universities: unknown[] } };
    expect(body.data.universities).toHaveLength(1);
    expect(service.listPublicUniversities).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      search: 'Gujarat',
    });
  });

  it('rejects invalid public pagination', async () => {
    const response = await request(createApp()).get('/api/universities?limit=1000');
    expect(response.status).toBe(422);
    const body = response.body as { error: { code: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('forbids non-admin university creation', async () => {
    const response = await request(createApp())
      .post('/api/admin/universities')
      .set('x-test-role', 'seller')
      .send({ name: 'New University', city: 'Ahmedabad' });
    expect(response.status).toBe(403);
    expect(service.createUniversity).not.toHaveBeenCalled();
  });

  it('allows an admin to create a university', async () => {
    service.createUniversity.mockResolvedValue(university);
    const response = await request(createApp())
      .post('/api/admin/universities')
      .set('x-test-role', 'admin')
      .send({ name: university.name, city: university.city, state: university.state });
    expect(response.status).toBe(201);
    const body = response.body as { data: { university: { name: string } } };
    expect(body.data.university.name).toBe(university.name);
  });

  it('allows an admin to deactivate a university', async () => {
    service.setUniversityStatus.mockResolvedValue({ ...university, active: false });
    const response = await request(createApp())
      .patch(`/api/admin/universities/${university.id}/status`)
      .set('x-test-role', 'admin')
      .send({ active: false });
    expect(response.status).toBe(200);
    const body = response.body as { data: { university: { active: boolean } } };
    expect(body.data.university.active).toBe(false);
  });

  it('returns no body after successful deletion', async () => {
    service.deleteUniversity.mockResolvedValue(undefined);
    const response = await request(createApp())
      .delete(`/api/admin/universities/${university.id}`)
      .set('x-test-role', 'admin');
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
  });
});
