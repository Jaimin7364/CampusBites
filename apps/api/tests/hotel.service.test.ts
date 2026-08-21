import { HotelStatus, Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({ findBySellerId: vi.fn(), findById: vi.fn(), findPublicById: vi.fn(), listPublicCandidates: vi.fn(), create: vi.fn(), update: vi.fn(), transition: vi.fn(), remove: vi.fn(), list: vi.fn() }));
const prisma = vi.hoisted(() => ({ university: { findUnique: vi.fn() } }));
vi.mock('../src/repositories/hotel.repository.js', () => repository);
vi.mock('../src/config/prisma.js', () => ({ prisma }));

import { approveHotel, createSellerHotel, deleteHotel, getPublicHotel, isHotelOpenAt, listPublicHotels, resubmitSellerHotel, setFeatured, updateSellerHotel } from '../src/services/hotel.service.js';

const hotel = { id: 'cm1hotel0000000000000000001', sellerId: 'seller-1', universityId: 'cm1university000000000000001', status: HotelStatus.PENDING, featured: false, active: true };
const input = { universityId: hotel.universityId, hotelName: 'Campus Cafe', address: 'Near main library', phone: '9876543210', whatsappNumber: '9876543210', description: 'Fresh meals for students.', hotelImageUrl: '/uploads/outlets/123e4567-e89b-12d3-a456-426614174000.webp', openTime: '08:00', closeTime: '21:00' };

describe('hotel service', () => {
  beforeEach(() => { vi.clearAllMocks(); prisma.university.findUnique.mockResolvedValue({ active: true }); });
  it('prevents a seller from creating a second outlet', async () => { repository.findBySellerId.mockResolvedValue(hotel); await expect(createSellerHotel('seller-1', input)).rejects.toMatchObject({ code: 'SELLER_ALREADY_HAS_HOTEL' }); });
  it('creates a normalized pending outlet', async () => { repository.findBySellerId.mockResolvedValue(null); repository.create.mockImplementation((data: unknown) => Promise.resolve(data)); await createSellerHotel('seller-1', { ...input, hotelName: ' Campus   Cafe ' }); expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ sellerId: 'seller-1', hotelName: 'Campus Cafe', phone: '+919876543210', status: HotelStatus.PENDING, featured: false })); });
  it('blocks a seller from editing another outlet', async () => { repository.findById.mockResolvedValue(hotel); await expect(updateSellerHotel('seller-2', hotel.id, input)).rejects.toMatchObject({ code: 'HOTEL_OWNERSHIP_REQUIRED' }); });
  it('returns an approved seller edit to pending', async () => { repository.findById.mockResolvedValue({ ...hotel, status: HotelStatus.APPROVED }); repository.update.mockResolvedValue(hotel); await updateSellerHotel('seller-1', hotel.id, input); expect(repository.update).toHaveBeenCalledWith(hotel.id, expect.objectContaining({ status: HotelStatus.PENDING, featured: false, approvedById: null })); });
  it('allows only rejected outlets to be resubmitted', async () => { repository.findById.mockResolvedValue(hotel); await expect(resubmitSellerHotel('seller-1', hotel.id)).rejects.toMatchObject({ code: 'INVALID_HOTEL_TRANSITION' }); });
  it('allows only pending outlets to be approved', async () => { repository.findById.mockResolvedValue({ ...hotel, status: HotelStatus.REJECTED }); await expect(approveHotel('admin-1', hotel.id)).rejects.toMatchObject({ code: 'INVALID_HOTEL_TRANSITION' }); });
  it('approves pending outlets with an atomic status condition', async () => { repository.findById.mockResolvedValue(hotel); repository.transition.mockResolvedValue({ ...hotel, status: HotelStatus.APPROVED }); await approveHotel('admin-1', hotel.id); expect(repository.transition).toHaveBeenCalledWith(hotel.id, HotelStatus.PENDING, expect.objectContaining({ status: HotelStatus.APPROVED, approvedById: 'admin-1' })); });
  it('allows only active approved outlets to be featured', async () => { repository.findById.mockResolvedValue(hotel); await expect(setFeatured(hotel.id, true)).rejects.toMatchObject({ code: 'HOTEL_NOT_FEATUREABLE' }); });
  it('maps referenced deletion to a safe conflict', async () => { repository.findById.mockResolvedValue(hotel); repository.remove.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('foreign key', { code: 'P2003', clientVersion: '6.12.0' })); await expect(deleteHotel(hotel.id)).rejects.toMatchObject({ code: 'HOTEL_IN_USE' }); });
  it('uses inclusive opening and exclusive closing boundaries', () => { expect(isHotelOpenAt('08:00', '21:00', new Date('2026-08-21T02:30:00Z'), 'Asia/Kolkata')).toBe(true); expect(isHotelOpenAt('08:00', '21:00', new Date('2026-08-21T15:30:00Z'), 'Asia/Kolkata')).toBe(false); });
  it('supports overnight business hours', () => { expect(isHotelOpenAt('20:00', '02:00', new Date('2026-08-21T18:30:00Z'), 'Asia/Kolkata')).toBe(true); expect(isHotelOpenAt('20:00', '02:00', new Date('2026-08-21T08:30:00Z'), 'Asia/Kolkata')).toBe(false); });
  it('filters open-now before paginating public outlets', async () => { repository.listPublicCandidates.mockResolvedValue([{ id: 'closed', openTime: '08:00', closeTime: '10:00' }, { id: 'open', openTime: '08:00', closeTime: '21:00' }]); const result = await listPublicHotels({ universityId: input.universityId, page: 1, limit: 1, openNow: true }, new Date('2026-08-21T06:30:00Z')); expect(result.hotels).toEqual([expect.objectContaining({ id: 'open', isOpen: true })]); expect(result.pagination.total).toBe(1); });
  it('hides non-public outlet details behind a not-found response', async () => { repository.findPublicById.mockResolvedValue({ ...hotel, university: { active: true } }); await expect(getPublicHotel(hotel.id)).rejects.toMatchObject({ code: 'HOTEL_NOT_FOUND', statusCode: 404 }); });
});
