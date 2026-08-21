import { UserRole } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const service = vi.hoisted(() => ({ listSellerOrders: vi.fn(), getSellerOrder: vi.fn(), changeStatus: vi.fn(), markPaymentPaid: vi.fn(), getSellerOrderSummary: vi.fn() }));
vi.mock('../src/services/seller-order.service.js', () => service);
vi.mock('../src/middleware/authenticate.js', () => ({ authenticate: (request: { header(name: string): string | undefined; auth?: unknown }, _response: unknown, next: () => void) => { const role = request.header('x-test-role'); request.auth = { userId: `${role ?? 'user'}-1`, role: role === 'seller' ? UserRole.SELLER : role === 'admin' ? UserRole.ADMIN : UserRole.USER }; next(); } }));
import { createApp } from '../src/app.js';
const id = 'cm1order0000000000000000001';
describe('seller order routes', () => {
  beforeEach(() => vi.clearAllMocks());
  it('forbids students and admins', async () => { for (const role of ['user', 'admin']) expect((await request(createApp()).get('/api/seller/orders').set('x-test-role', role)).status).toBe(403); });
  it('parses seller queue filters and pagination', async () => { service.listSellerOrders.mockResolvedValue({ orders: [], pagination: {} }); const response = await request(createApp()).get('/api/seller/orders?status=PENDING&deliveryType=DELIVERY&page=2').set('x-test-role', 'seller'); expect(response.status).toBe(200); expect(service.listSellerOrders).toHaveBeenCalledWith('seller-1', expect.objectContaining({ status: 'PENDING', deliveryType: 'DELIVERY', page: 2, limit: 20 })); });
  it('loads a seller-owned order detail', async () => { service.getSellerOrder.mockResolvedValue({ id }); expect((await request(createApp()).get(`/api/seller/orders/${id}`).set('x-test-role', 'seller')).status).toBe(200); expect(service.getSellerOrder).toHaveBeenCalledWith('seller-1', id); });
  it('validates and applies a status transition', async () => { service.changeStatus.mockResolvedValue({ id, status: 'ACCEPTED' }); const response = await request(createApp()).patch(`/api/seller/orders/${id}/status`).set('x-test-role', 'seller').send({ status: 'ACCEPTED' }); expect(response.status).toBe(200); expect(service.changeStatus).toHaveBeenCalledWith('seller-1', id, 'ACCEPTED'); });
  it('rejects seller-forbidden status values before the service', async () => { const response = await request(createApp()).patch(`/api/seller/orders/${id}/status`).set('x-test-role', 'seller').send({ status: 'CANCELLED' }); expect(response.status).toBe(422); expect(service.changeStatus).not.toHaveBeenCalled(); });
  it('marks only the PAID payment status', async () => { service.markPaymentPaid.mockResolvedValue({ id, paymentStatus: 'PAID' }); expect((await request(createApp()).patch(`/api/seller/orders/${id}/payment-status`).set('x-test-role', 'seller').send({ paymentStatus: 'PAID' })).status).toBe(200); expect((await request(createApp()).patch(`/api/seller/orders/${id}/payment-status`).set('x-test-role', 'seller').send({ paymentStatus: 'PENDING' })).status).toBe(422); });
  it('returns seller dashboard order metrics', async () => { service.getSellerOrderSummary.mockResolvedValue({ todayOrders: 1 }); expect((await request(createApp()).get('/api/seller/orders/summary').set('x-test-role', 'seller')).status).toBe(200); expect(service.getSellerOrderSummary).toHaveBeenCalledWith('seller-1'); });
});
