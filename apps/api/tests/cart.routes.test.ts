import { UserRole } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({ previewCart: vi.fn() }));
const orderService = vi.hoisted(() => ({ createOrder: vi.fn(), getUserOrder: vi.fn() }));
vi.mock('../src/services/cart.service.js', () => service);
vi.mock('../src/services/order.service.js', () => orderService);
vi.mock('../src/middleware/authenticate.js', () => ({ authenticate: (request: { header(name: string): string | undefined; auth?: unknown }, _response: unknown, next: () => void) => { const role = request.header('x-test-role'); request.auth = { userId: `${role ?? 'user'}-1`, role: role === 'seller' ? UserRole.SELLER : role === 'admin' ? UserRole.ADMIN : UserRole.USER }; next(); } }));
import { createApp } from '../src/app.js';

const id = 'cm1menu00000000000000000001';
describe('cart preview route', () => {
  beforeEach(() => vi.clearAllMocks());
  it('allows a student to preview a valid cart', async () => { service.previewCart.mockResolvedValue({ items: [], totals: {}, orderable: true }); const response = await request(createApp()).post('/api/orders/preview').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 2 }] }); expect(response.status).toBe(200); expect(service.previewCart).toHaveBeenCalledWith({ items: [{ menuItemId: id, quantity: 2 }] }); });
  it('forbids sellers and administrators', async () => { for (const role of ['seller', 'admin']) { const response = await request(createApp()).post('/api/orders/preview').set('x-test-role', role).send({ items: [{ menuItemId: id, quantity: 1 }] }); expect(response.status).toBe(403); } });
  it('rejects invalid quantities before the service', async () => { const response = await request(createApp()).post('/api/orders/preview').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 0 }] }); expect(response.status).toBe(422); expect(service.previewCart).not.toHaveBeenCalled(); });
  it('ignores tampered browser prices and names', async () => { service.previewCart.mockResolvedValue({}); await request(createApp()).post('/api/orders/preview').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 1, pricePaise: 1, itemName: 'Fake' }] }); expect(service.previewCart).toHaveBeenCalledWith({ items: [{ menuItemId: id, quantity: 1 }] }); });
  it('creates an order with an idempotency key', async () => { orderService.createOrder.mockResolvedValue({ id: 'order-1' }); const response = await request(createApp()).post('/api/orders').set('x-test-role', 'user').set('idempotency-key', 'checkout_key_123456').send({ items: [{ menuItemId: id, quantity: 1 }], orderType: 'INSTANT', deliveryType: 'PICKUP' }); expect(response.status).toBe(201); expect(orderService.createOrder).toHaveBeenCalledWith('user-1', 'checkout_key_123456', expect.objectContaining({ orderType: 'INSTANT' })); });
  it('rejects creation without an idempotency key', async () => { const response = await request(createApp()).post('/api/orders').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 1 }], orderType: 'INSTANT', deliveryType: 'PICKUP' }); expect(response.status).toBe(422); });
});
