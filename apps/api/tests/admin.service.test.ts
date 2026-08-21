import { beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({ listAccounts: vi.fn(), findAccount: vi.fn(), listOrders: vi.fn(), findOrder: vi.fn(), dashboard: vi.fn() }));
vi.mock('../src/repositories/admin.repository.js', () => repository);
import * as service from '../src/services/admin.service.js';

const filters = { page: 2, limit: 10 };
describe('admin service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns bounded user pagination metadata', async () => {
    repository.listAccounts.mockResolvedValue({ items: [{ id: 'user-1' }], total: 25 });
    const result = await service.listUsers(filters);
    expect(result.pagination).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3, hasNextPage: true, hasPreviousPage: true });
    expect(repository.listAccounts).toHaveBeenCalledWith('USER', filters);
  });

  it('uses the seller role and returns seller records', async () => {
    repository.listAccounts.mockResolvedValue({ items: [{ id: 'seller-1' }], total: 1 });
    expect((await service.listSellers({ page: 1, limit: 20 })).sellers).toHaveLength(1);
    expect(repository.listAccounts).toHaveBeenCalledWith('SELLER', { page: 1, limit: 20 });
  });

  it('returns role-specific not-found errors', async () => {
    repository.findAccount.mockResolvedValue(null);
    await expect(service.getUser('missing')).rejects.toMatchObject({ statusCode: 404, code: 'USER_NOT_FOUND' });
    await expect(service.getSeller('missing')).rejects.toMatchObject({ statusCode: 404, code: 'SELLER_NOT_FOUND' });
  });

  it('paginates orders and rejects missing details', async () => {
    repository.listOrders.mockResolvedValue({ items: [], total: 0 });
    expect((await service.listOrders({ page: 1, limit: 20 })).pagination.totalPages).toBe(0);
    repository.findOrder.mockResolvedValue(null);
    await expect(service.getOrder('missing')).rejects.toMatchObject({ statusCode: 404, code: 'ORDER_NOT_FOUND' });
  });

  it('documents the dashboard order-value definition', async () => {
    repository.dashboard.mockResolvedValue({ totalOrderValuePaise: 12500, completedOrders: 2 });
    const result = await service.getDashboard();
    expect(result.totalOrderValuePaise).toBe(12500);
    expect(result.totalOrderValueDefinition).toContain('COMPLETED');
    expect(result.totalOrderValueDefinition).toContain('PAID');
  });
});
