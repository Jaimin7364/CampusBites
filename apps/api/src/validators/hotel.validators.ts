import { HotelStatus } from '@prisma/client';
import { z } from 'zod';

const text = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `${label} must contain at least ${min} characters`).max(max);
const indianPhone = z
  .string()
  .trim()
  .regex(/^(?:\+91|0)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number');
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm format');
const imageUrl = z.string().regex(/^\/uploads\/outlets\/[a-f0-9-]+\.(?:jpg|png|webp)$/);

export const hotelIdParamsSchema = z.object({ id: z.string().cuid() });

export const publicHotelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  universityId: z.string().cuid(),
  search: z.string().trim().max(120).optional(),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  openNow: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const hotelInputSchema = z
  .object({
    universityId: z.string().cuid(),
    hotelName: text('Outlet name', 2, 191),
    address: text('Address', 5, 500),
    phone: indianPhone,
    whatsappNumber: indianPhone,
    description: text('Description', 10, 2000),
    hotelImageUrl: imageUrl,
    menuImageUrl: imageUrl.nullable().optional(),
    openTime: time,
    closeTime: time,
  })
  .refine((input) => input.openTime !== input.closeTime, {
    path: ['closeTime'],
    message: 'Opening and closing times must be different',
  });

export const rejectHotelSchema = z.object({ reason: text('Rejection reason', 5, 500) });
export const featureHotelSchema = z.object({ featured: z.boolean() });
export const hotelActiveSchema = z.object({ active: z.boolean() });

export const adminHotelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  universityId: z.string().cuid().optional(),
  status: z.nativeEnum(HotelStatus).optional(),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});
