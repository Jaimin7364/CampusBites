import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  user: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
  order: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), aggregate: vi.fn() },
  hotel: { count: vi.fn() }, university: { count: vi.fn() },
  $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
}));
vi.mock('../src/config/prisma.js', () => ({ prisma: db }));
import * as repository from '../src/repositories/admin.repository.js';

describe('admin repository', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('selects safe account fields with bounded database pagination', async () => {
    db.user.findMany.mockResolvedValue([]); db.user.count.mockResolvedValue(0);
    await repository.listAccounts('USER', { page: 3, limit: 25, search: 'student', active: true });
    const query = db.user.findMany.mock.calls[0]?.[0] as unknown as { skip: number; take: number; select: Record<string, boolean>; where: { role: string; active: boolean; OR: unknown[] } };
    expect(query).toMatchObject({ skip: 50, take: 25, where: { role: 'USER', active: true } });
    expect(query.select.passwordHash).toBeUndefined();
    expect(query.select.email).toBe(true);
    expect(query.where.OR).toHaveLength(5);
  });

  it('applies order scope, search, date boundaries, and pagination in the database', async () => {
    db.order.findMany.mockResolvedValue([]); db.order.count.mockResolvedValue(0);
    await repository.listOrders({ page: 2, limit: 10, hotelId: 'hotel-1', status: 'COMPLETED', search: 'CB', dateFrom: '2026-08-01T00:00:00.000Z', dateTo: '2026-08-31T23:59:59.999Z' });
    const query = db.order.findMany.mock.calls[0]?.[0] as unknown as { skip: number; take: number; where: { hotelId: string; status: string; createdAt: { gte: Date; lte: Date }; OR: unknown[] } };
    expect(query).toMatchObject({ skip: 10, take: 10, where: { hotelId: 'hotel-1', status: 'COMPLETED' } });
    expect(query.where.createdAt.gte).toEqual(new Date('2026-08-01T00:00:00.000Z'));
    expect(query.where.createdAt.lte).toEqual(new Date('2026-08-31T23:59:59.999Z'));
    expect(query.where.OR).toHaveLength(5);
  });

  it('counts the controlled dashboard data and values completed paid orders only', async () => {
    db.university.count.mockResolvedValue(2);
    db.user.count.mockResolvedValueOnce(4).mockResolvedValueOnce(3);
    db.hotel.count.mockResolvedValueOnce(5).mockResolvedValueOnce(1).mockResolvedValueOnce(4).mockResolvedValueOnce(2);
    db.order.count.mockResolvedValueOnce(9).mockResolvedValueOnce(2).mockResolvedValueOnce(5);
    db.order.aggregate.mockResolvedValue({ _sum: { totalAmountPaise: 42_500 } });
    const result = await repository.dashboard();
    expect(result).toEqual({ universities: 2, users: 4, sellers: 3, hotels: 5, pendingHotels: 1, approvedHotels: 4, featuredHotels: 2, orders: 9, pendingOrders: 2, completedOrders: 5, totalOrderValuePaise: 42_500 });
    expect(db.order.aggregate).toHaveBeenCalledWith({ where: { status: 'COMPLETED', paymentStatus: 'PAID' }, _sum: { totalAmountPaise: true } });
  });
});
