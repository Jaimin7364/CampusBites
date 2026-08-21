import { HotelStatus, Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const menu = vi.hoisted(() => ({ list: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), nextDisplayOrder: vi.fn(), findOwnedIds: vi.fn(), reorder: vi.fn() }));
const hotels = vi.hoisted(() => ({ findBySellerId: vi.fn(), findById: vi.fn(), findPublicById: vi.fn() }));
vi.mock('../src/repositories/menu.repository.js', () => menu);
vi.mock('../src/repositories/hotel.repository.js', () => hotels);
import { createMenuItem, deleteMenuItem, listPublicMenu, reorderMenu, setAvailability } from '../src/services/menu.service.js';

const hotel = { id: 'cm1hotel0000000000000000001', sellerId: 'seller-1', status: HotelStatus.APPROVED, active: true, university: { active: true } };
const item = { id: 'cm1menu00000000000000000001', hotelId: hotel.id, name: 'Masala Dosa', pricePaise: 8500, hotel: { sellerId: 'seller-1', status: HotelStatus.APPROVED, active: true } };
const input = { name: 'Masala Dosa', description: 'Crispy dosa', pricePaise: 8500, category: 'South Indian', veg: true, bestseller: false, preparationTimeMinutes: 15, available: true };

describe('menu service', () => {
  beforeEach(() => vi.clearAllMocks());
  it('hides menus belonging to non-approved outlets', async () => { hotels.findPublicById.mockResolvedValue({ ...hotel, status: HotelStatus.PENDING }); await expect(listPublicMenu(hotel.id, { page: 1, limit: 50 })).rejects.toMatchObject({ code: 'HOTEL_NOT_FOUND' }); });
  it('keeps unavailable items visible unless explicitly filtered', async () => { hotels.findPublicById.mockResolvedValue(hotel); menu.list.mockResolvedValue({ items: [{ ...item, available: false }], total: 1 }); const result = await listPublicMenu(hotel.id, { page: 1, limit: 50 }); expect(menu.list).toHaveBeenCalledWith(hotel.id, { page: 1, limit: 50 }); expect(result.menuItems[0]).toMatchObject({ available: false }); });
  it('blocks menu creation for an unapproved seller outlet', async () => { hotels.findBySellerId.mockResolvedValue({ ...hotel, status: HotelStatus.REJECTED }); await expect(createMenuItem('seller-1', input)).rejects.toMatchObject({ code: 'APPROVED_HOTEL_REQUIRED' }); });
  it('creates an item with the next display order', async () => { hotels.findBySellerId.mockResolvedValue(hotel); menu.nextDisplayOrder.mockResolvedValue(4); menu.create.mockImplementation((value: unknown) => Promise.resolve(value)); await createMenuItem('seller-1', input); expect(menu.create).toHaveBeenCalledWith(expect.objectContaining({ hotelId: hotel.id, pricePaise: 8500, displayOrder: 4 })); });
  it('blocks cross-seller item mutation', async () => { menu.findById.mockResolvedValue(item); await expect(setAvailability('seller-2', item.id, false)).rejects.toMatchObject({ code: 'MENU_ITEM_OWNERSHIP_REQUIRED' }); });
  it('maps referenced deletion to a safe conflict', async () => { menu.findById.mockResolvedValue(item); menu.remove.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('foreign key', { code: 'P2003', clientVersion: '6.12.0' })); await expect(deleteMenuItem('seller-1', item.id)).rejects.toMatchObject({ code: 'MENU_ITEM_IN_USE' }); });
  it('rejects reorder requests containing another outlet item', async () => { hotels.findBySellerId.mockResolvedValue(hotel); menu.findOwnedIds.mockResolvedValue([]); await expect(reorderMenu('seller-1', [{ id: item.id, displayOrder: 1 }])).rejects.toMatchObject({ code: 'MENU_ITEM_OWNERSHIP_REQUIRED' }); });
});
