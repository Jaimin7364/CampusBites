import { describe, expect, it } from 'vitest';
import { adminHotelQuerySchema, hotelInputSchema, rejectHotelSchema } from '../src/validators/hotel.validators.js';

const valid = {
  universityId: 'cm1university000000000000001',
  hotelName: 'Campus Cafe', address: 'Near the main library', phone: '9876543210',
  whatsappNumber: '+919876543210', description: 'Fresh meals for students every day.',
  openTime: '08:00', closeTime: '21:30', hotelImageUrl: '/uploads/outlets/123e4567-e89b-12d3-a456-426614174000.webp',
};

describe('hotel validators', () => {
  it('accepts a complete outlet', () => expect(hotelInputSchema.safeParse(valid).success).toBe(true));
  it('rejects invalid phone numbers', () => expect(hotelInputSchema.safeParse({ ...valid, phone: '1234' }).success).toBe(false));
  it('rejects invalid operating time', () => expect(hotelInputSchema.safeParse({ ...valid, closeTime: '25:00' }).success).toBe(false));
  it('requires a useful rejection reason', () => expect(rejectHotelSchema.safeParse({ reason: 'no' }).success).toBe(false));
  it('parses admin filters and pagination', () => expect(adminHotelQuerySchema.parse({ page: '2', status: 'PENDING', featured: 'true' })).toMatchObject({ page: 2, limit: 20, status: 'PENDING', featured: true }));
});
