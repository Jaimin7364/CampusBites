import { HotelStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({ findForCart: vi.fn() }));
vi.mock('../src/repositories/menu.repository.js', () => repository);
import { previewCart } from '../src/services/cart.service.js';

const firstId = 'cm1menu00000000000000000001';
const secondId = 'cm1menu00000000000000000002';
const hotel = { id: 'hotel-1', hotelName: 'Campus Cafe', status: HotelStatus.APPROVED, active: true, university: { active: true } };
const item = { id: firstId, hotelId: hotel.id, name: 'Dosa', pricePaise: 8505, veg: true, bestseller: false, available: true, hotel };

describe('cart preview service', () => {
  beforeEach(() => vi.clearAllMocks());
  it('calculates authoritative integer-paise totals', async () => { repository.findForCart.mockResolvedValue([item]); const result = await previewCart({ items: [{ menuItemId: firstId, quantity: 3 }] }); expect(result.items[0]).toMatchObject({ itemName: 'Dosa', pricePaise: 8505, subtotalPaise: 25515 }); expect(result.totals).toMatchObject({ totalQuantity: 3, itemsTotalPaise: 25515, grandTotalPaise: 25515 }); expect(result.orderable).toBe(true); });
  it('rejects items from multiple hotels', async () => { repository.findForCart.mockResolvedValue([item, { ...item, id: secondId, hotelId: 'hotel-2', hotel: { ...hotel, id: 'hotel-2' } }]); await expect(previewCart({ items: [{ menuItemId: firstId, quantity: 1 }, { menuItemId: secondId, quantity: 1 }] })).rejects.toMatchObject({ code: 'MULTIPLE_HOTELS_NOT_ALLOWED' }); });
  it('rejects a cart containing a deleted item', async () => { repository.findForCart.mockResolvedValue([]); await expect(previewCart({ items: [{ menuItemId: firstId, quantity: 1 }] })).rejects.toMatchObject({ code: 'CART_ITEM_NOT_FOUND' }); });
  it('rejects an unapproved or inactive outlet', async () => { repository.findForCart.mockResolvedValue([{ ...item, hotel: { ...hotel, status: HotelStatus.PENDING } }]); await expect(previewCart({ items: [{ menuItemId: firstId, quantity: 1 }] })).rejects.toMatchObject({ code: 'HOTEL_NOT_ORDERABLE' }); });
  it('returns unavailable items for frontend reconciliation', async () => { repository.findForCart.mockResolvedValue([{ ...item, available: false }]); const result = await previewCart({ items: [{ menuItemId: firstId, quantity: 1 }] }); expect(result.orderable).toBe(false); expect(result.issues).toEqual([expect.objectContaining({ code: 'ITEMS_UNAVAILABLE', menuItemIds: [firstId] })]); });
});
