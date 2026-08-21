import { UserRole } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({ listUsers: vi.fn(), getUser: vi.fn(), listSellers: vi.fn(), getSeller: vi.fn(), listOrders: vi.fn(), getOrder: vi.fn(), getDashboard: vi.fn() }));
vi.mock('../src/services/admin.service.js', () => service);
vi.mock('../src/middleware/authenticate.js', () => ({ authenticate: (request: { header(name: string): string | undefined; auth?: unknown }, _response: unknown, next: () => void) => { const role = request.header('x-test-role'); request.auth = { userId: `${role ?? 'user'}-1`, role: role === 'admin' ? UserRole.ADMIN : role === 'seller' ? UserRole.SELLER : UserRole.USER }; next(); } }));
import { createApp } from '../src/app.js';

const id = 'cm1adminresource00000000001';
describe('admin routes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forbids users and sellers from every admin resource', async () => {
    for (const role of ['user', 'seller']) {
      for (const path of ['/api/admin/dashboard', '/api/admin/users', '/api/admin/sellers', '/api/admin/orders']) {
        expect((await request(createApp()).get(path).set('x-test-role', role)).status).toBe(403);
      }
    }
  });

  it('returns dashboard metrics to admins', async () => {
    service.getDashboard.mockResolvedValue({ users: 4, totalOrderValuePaise: 5000 });
    const response = await request(createApp()).get('/api/admin/dashboard').set('x-test-role', 'admin');
    expect(response.status).toBe(200);
    expect((response.body as { data: { totalOrderValuePaise: number } }).data.totalOrderValuePaise).toBe(5000);
  });

  it('parses user and seller list filters', async () => {
    service.listUsers.mockResolvedValue({ users: [], pagination: {} });
    service.listSellers.mockResolvedValue({ sellers: [], pagination: {} });
    expect((await request(createApp()).get('/api/admin/users?search=riya&active=true&page=2&limit=10').set('x-test-role', 'admin')).status).toBe(200);
    expect(service.listUsers).toHaveBeenCalledWith({ search: 'riya', active: true, page: 2, limit: 10 });
    expect((await request(createApp()).get('/api/admin/sellers?active=false').set('x-test-role', 'admin')).status).toBe(200);
    expect(service.listSellers).toHaveBeenCalledWith({ active: false, page: 1, limit: 20 });
  });

  it('loads user and seller details', async () => {
    service.getUser.mockResolvedValue({ id }); service.getSeller.mockResolvedValue({ id });
    expect((await request(createApp()).get(`/api/admin/users/${id}`).set('x-test-role', 'admin')).status).toBe(200);
    expect((await request(createApp()).get(`/api/admin/sellers/${id}`).set('x-test-role', 'admin')).status).toBe(200);
  });

  it('parses all order list filters and bounds list size', async () => {
    service.listOrders.mockResolvedValue({ orders: [], pagination: {} });
    const universityId = 'cm1university000000000000001'; const hotelId = 'cm1hotel0000000000000000001';
    const response = await request(createApp()).get(`/api/admin/orders?universityId=${universityId}&hotelId=${hotelId}&status=COMPLETED&paymentStatus=PAID&search=CB&dateFrom=2026-08-01T00:00:00.000Z&dateTo=2026-08-31T23:59:59.999Z&limit=100`).set('x-test-role', 'admin');
    expect(response.status).toBe(200);
    expect(service.listOrders).toHaveBeenCalledWith(expect.objectContaining({ universityId, hotelId, status: 'COMPLETED', paymentStatus: 'PAID', limit: 100 }));
    expect((await request(createApp()).get('/api/admin/orders?limit=101').set('x-test-role', 'admin')).status).toBe(422);
  });

  it('loads complete admin order details', async () => {
    service.getOrder.mockResolvedValue({ id, items: [], statusHistory: [] });
    const response = await request(createApp()).get(`/api/admin/orders/${id}`).set('x-test-role', 'admin');
    expect(response.status).toBe(200);
    expect(service.getOrder).toHaveBeenCalledWith(id);
  });
});
