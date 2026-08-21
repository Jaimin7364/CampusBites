import { DeliveryType, HotelStatus, OrderType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({ user: { findUnique: vi.fn() } }));
const menuRepository = vi.hoisted(() => ({ findForCart: vi.fn() }));
const orderRepository = vi.hoisted(() => ({ findByIdempotency: vi.fn(), create: vi.fn(), findById: vi.fn(), listForUser: vi.fn(), cancelPending: vi.fn() }));
const socket = vi.hoisted(() => ({ emitOrderCreated: vi.fn(), emitOrderCancelled: vi.fn() }));

vi.mock('../src/config/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../src/repositories/menu.repository.js', () => menuRepository);
vi.mock('../src/repositories/order.repository.js', () => orderRepository);
vi.mock('../src/socket/order-socket.js', () => socket);

import { cancelUserOrder, createOrder, getUserOrder, listUserOrders } from '../src/services/order.service.js';

const now = new Date('2026-08-21T06:30:00.000Z'); // 12:00 in Asia/Kolkata
const userId = 'cm1user00000000000000000001';
const itemId = 'cm1menu00000000000000000001';
const key = 'checkout-attempt-0001';
const hotel = {
  id: 'hotel-1', hotelName: 'Campus Cafe', phone: '+919876543210', sellerId: 'seller-1', universityId: 'university-1',
  openTime: '08:00', closeTime: '22:00', status: HotelStatus.APPROVED, active: true,
  seller: { sellerName: 'Campus Foods', businessOwnerName: 'Owner' }, university: { active: true },
};
const menuItem = { id: itemId, hotelId: hotel.id, name: 'Dosa', pricePaise: 8505, veg: true, bestseller: true, available: true, hotel };
const input = { items: [{ menuItemId: itemId, quantity: 2 }], orderType: OrderType.INSTANT, deliveryType: DeliveryType.PICKUP };

describe('order service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderRepository.findByIdempotency.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ fullName: 'Student One', phone: '+919999999999', active: true });
    menuRepository.findForCart.mockResolvedValue([menuItem]);
  });

  it('returns the original order for a repeated idempotency key without creating another order', async () => {
    const original = { id: 'order-1', orderNumber: 'CB-2026-ORIGINAL' };
    orderRepository.findByIdempotency.mockResolvedValue(original);
    await expect(createOrder(userId, key, input, now)).resolves.toBe(original);
    expect(menuRepository.findForCart).not.toHaveBeenCalled();
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it('creates authoritative price, identity, outlet, and menu-item snapshots', async () => {
    orderRepository.create.mockImplementation((data: unknown) => Promise.resolve(data));
    const result = await createOrder(userId, key, input, now);
    expect(result).toMatchObject({
      idempotencyKey: key, userName: 'Student One', sellerName: 'Campus Foods', hotelName: 'Campus Cafe',
      subtotalPaise: 17010, orderType: OrderType.INSTANT, deliveryType: DeliveryType.PICKUP,
      deliveryAddress: null, paymentMethod: 'CASH', paymentStatus: 'PENDING', status: 'PENDING',
      items: { create: [{ itemName: 'Dosa', pricePaise: 8505, quantity: 2, itemTotalPaise: 17010, veg: true, bestseller: true }] },
    });
  });

  it('rejects a pre-order scheduled in the past', async () => {
    await expect(createOrder(userId, key, { ...input, orderType: OrderType.PREORDER, scheduledAt: '2026-08-21T06:29:59.000Z' }, now)).rejects.toMatchObject({ code: 'INVALID_SCHEDULED_TIME' });
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it('rejects an unavailable item before creating an order', async () => {
    menuRepository.findForCart.mockResolvedValue([{ ...menuItem, available: false }]);
    await expect(createOrder(userId, key, input, now)).rejects.toMatchObject({ code: 'ITEMS_UNAVAILABLE' });
  });

  it('rejects an outlet that is closed at the requested time', async () => {
    menuRepository.findForCart.mockResolvedValue([{ ...menuItem, hotel: { ...hotel, openTime: '13:00', closeTime: '14:00' } }]);
    await expect(createOrder(userId, key, input, now)).rejects.toMatchObject({ code: 'HOTEL_CLOSED' });
  });

  it('hides an order owned by another user', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'order-1', userId: 'another-user' });
    await expect(getUserOrder(userId, 'order-1')).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND', statusCode: 404 });
  });
  it('returns only the authenticated user list with pagination', async () => { orderRepository.listForUser.mockResolvedValue({ items: [], total: 21 }); const result = await listUserOrders(userId, { page: 2, limit: 20, group: 'active' }); expect(orderRepository.listForUser).toHaveBeenCalledWith(userId, { page: 2, limit: 20, group: 'active' }); expect(result.pagination).toMatchObject({ totalPages: 2, hasPreviousPage: true }); });
  it('cancels a pending owned order atomically and emits its event', async () => { const pending = { id: 'order-1', userId, sellerId: 'seller-1', status: 'PENDING' }; orderRepository.findById.mockResolvedValue(pending); orderRepository.cancelPending.mockResolvedValue({ ...pending, status: 'CANCELLED' }); const result = await cancelUserOrder(userId, 'order-1'); expect(result.status).toBe('CANCELLED'); expect(socket.emitOrderCancelled).toHaveBeenCalledWith(result); });
  it('rejects cancellation after seller acceptance', async () => { orderRepository.findById.mockResolvedValue({ id: 'order-1', userId, status: 'ACCEPTED' }); await expect(cancelUserOrder(userId, 'order-1')).rejects.toMatchObject({ code: 'ORDER_NOT_CANCELLABLE' }); });
  it('reports a deterministic cancellation race', async () => { orderRepository.findById.mockResolvedValue({ id: 'order-1', userId, status: 'PENDING' }); orderRepository.cancelPending.mockResolvedValue(null); await expect(cancelUserOrder(userId, 'order-1')).rejects.toMatchObject({ code: 'ORDER_STATUS_CHANGED' }); });
});
