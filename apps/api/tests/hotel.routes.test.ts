import { UserRole } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({
  getSellerHotel: vi.fn(), createSellerHotel: vi.fn(), updateSellerHotel: vi.fn(), resubmitSellerHotel: vi.fn(),
  listAdminHotels: vi.fn(), getAdminHotel: vi.fn(), approveHotel: vi.fn(), rejectHotel: vi.fn(),
  setFeatured: vi.fn(), updateAdminHotel: vi.fn(), setHotelActive: vi.fn(), deleteHotel: vi.fn(),
}));
const imageStorage = vi.hoisted(() => ({ saveOutletImage: vi.fn() }));
vi.mock('../src/services/hotel.service.js', () => service);
vi.mock('../src/services/image-storage.service.js', () => ({
  imageStorage,
  uploadsRoot: '/tmp/campusbites-test-uploads',
}));
vi.mock('../src/middleware/authenticate.js', () => ({
  authenticate: (request: { header(name: string): string | undefined; auth?: unknown }, _response: unknown, next: (error?: unknown) => void) => {
    const role = request.header('x-test-role');
    request.auth = { userId: `${role ?? 'user'}-1`, role: role === 'admin' ? UserRole.ADMIN : role === 'seller' ? UserRole.SELLER : UserRole.USER };
    next();
  },
}));

import { createApp } from '../src/app.js';

const id = 'cm1hotel0000000000000000001';
const input = { universityId: 'cm1university000000000000001', hotelName: 'Campus Cafe', address: 'Near the main library', phone: '9876543210', whatsappNumber: '9876543210', description: 'Fresh meals for students every day.', hotelImageUrl: '/uploads/outlets/123e4567-e89b-12d3-a456-426614174000.webp', openTime: '08:00', closeTime: '21:00' };
const hotel = { id, sellerId: 'seller-1', ...input, status: 'PENDING', active: true, featured: false };

describe('hotel routes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the current seller outlet', async () => {
    service.getSellerHotel.mockResolvedValue(hotel);
    const response = await request(createApp()).get('/api/seller/hotel').set('x-test-role', 'seller');
    expect(response.status).toBe(200);
    expect(service.getSellerHotel).toHaveBeenCalledWith('seller-1');
  });

  it('forbids users from seller outlet routes', async () => {
    const response = await request(createApp()).get('/api/seller/hotel').set('x-test-role', 'user');
    expect(response.status).toBe(403);
  });

  it('creates a seller outlet after validation', async () => {
    service.createSellerHotel.mockResolvedValue(hotel);
    const response = await request(createApp()).post('/api/seller/hotel').set('x-test-role', 'seller').send(input);
    expect(response.status).toBe(201);
    expect(service.createSellerHotel).toHaveBeenCalledWith('seller-1', expect.objectContaining({ hotelName: input.hotelName }));
  });

  it('parses admin hotel filters', async () => {
    service.listAdminHotels.mockResolvedValue({ hotels: [], pagination: {} });
    const response = await request(createApp()).get('/api/admin/hotels?status=PENDING&page=2').set('x-test-role', 'admin');
    expect(response.status).toBe(200);
    expect(service.listAdminHotels).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING', page: 2, limit: 20 }));
  });

  it('requires a rejection reason', async () => {
    const response = await request(createApp()).patch(`/api/admin/hotels/${id}/reject`).set('x-test-role', 'admin').send({ reason: 'no' });
    expect(response.status).toBe(422);
    expect(service.rejectHotel).not.toHaveBeenCalled();
  });

  it('allows an admin to approve an outlet', async () => {
    service.approveHotel.mockResolvedValue({ ...hotel, status: 'APPROVED' });
    const response = await request(createApp()).patch(`/api/admin/hotels/${id}/approve`).set('x-test-role', 'admin');
    expect(response.status).toBe(200);
    expect(service.approveHotel).toHaveBeenCalledWith('admin-1', id);
  });

  it('rejects unsupported uploaded file types', async () => {
    const response = await request(createApp()).post('/api/uploads/outlet-image').set('x-test-role', 'seller').attach('image', Buffer.from('not an image'), { filename: 'image.txt', contentType: 'text/plain' });
    expect(response.status).toBe(422);
    expect((response.body as { error: { code: string } }).error.code).toBe('INVALID_IMAGE_TYPE');
  });

  it('accepts one valid PNG in the image field', async () => {
    imageStorage.saveOutletImage.mockResolvedValue('/uploads/outlets/image.png');
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const response = await request(createApp()).post('/api/uploads/outlet-image').set('x-test-role', 'seller').attach('image', png, { filename: 'outlet.png', contentType: 'image/png' });
    expect(response.status).toBe(201);
    expect(imageStorage.saveOutletImage).toHaveBeenCalledOnce();
    expect((response.body as { data: { url: string } }).data.url).toBe('/uploads/outlets/image.png');
  });
});
