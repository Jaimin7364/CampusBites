import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const pagination = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
};

export const adminIdParamsSchema = z.object({ id: z.string().cuid() });

export const adminAccountListQuerySchema = z.object({
  ...pagination,
  active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const adminOrderListQuerySchema = z.object({
  ...pagination,
  universityId: z.string().cuid().optional(),
  hotelId: z.string().cuid().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
}).refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
  path: ['dateTo'],
  message: 'dateTo must be after dateFrom',
});
