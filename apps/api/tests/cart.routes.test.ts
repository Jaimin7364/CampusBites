import { UserRole } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({ previewCart: vi.fn() }));
vi.mock('../src/services/cart.service.js', () => service);
vi.mock('../src/middleware/authenticate.js', () => ({ authenticate: (request: { header(name: string): string | undefined; auth?: unknown }, _response: unknown, next: () => void) => { const role = request.header('x-test-role'); request.auth = { userId: `${role ?? 'user'}-1`, role: role === 'seller' ? UserRole.SELLER : role === 'admin' ? UserRole.ADMIN : UserRole.USER }; next(); } }));
import { createApp } from '../src/app.js';

const id = 'cm1menu00000000000000000001';
describe('cart preview route', () => {
  beforeEach(() => vi.clearAllMocks());
  it('allows a student to preview a valid cart', async () => { service.previewCart.mockResolvedValue({ items: [], totals: {}, orderable: true }); const response = await request(createApp()).post('/api/orders/preview').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 2 }] }); expect(response.status).toBe(200); expect(service.previewCart).toHaveBeenCalledWith({ items: [{ menuItemId: id, quantity: 2 }] }); });
  it('forbids sellers and administrators', async () => { for (const role of ['seller', 'admin']) { const response = await request(createApp()).post('/api/orders/preview').set('x-test-role', role).send({ items: [{ menuItemId: id, quantity: 1 }] }); expect(response.status).toBe(403); } });
  it('rejects invalid quantities before the service', async () => { const response = await request(createApp()).post('/api/orders/preview').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 0 }] }); expect(response.status).toBe(422); expect(service.previewCart).not.toHaveBeenCalled(); });
  it('ignores tampered browser prices and names', async () => { service.previewCart.mockResolvedValue({}); await request(createApp()).post('/api/orders/preview').set('x-test-role', 'user').send({ items: [{ menuItemId: id, quantity: 1, pricePaise: 1, itemName: 'Fake' }] }); expect(service.previewCart).toHaveBeenCalledWith({ items: [{ menuItemId: id, quantity: 1 }] }); });
});
