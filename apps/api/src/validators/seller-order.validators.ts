import { DeliveryType, OrderStatus, OrderType, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

export const sellerOrderIdParamsSchema = z.object({ id: z.string().cuid() });
export const sellerOrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  orderType: z.nativeEnum(OrderType).optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().trim().max(120).optional(),
  scheduledFrom: z.iso.datetime().optional(),
  scheduledTo: z.iso.datetime().optional(),
}).refine((value) => !value.scheduledFrom || !value.scheduledTo || value.scheduledFrom <= value.scheduledTo, { path: ['scheduledTo'], message: 'scheduledTo must be after scheduledFrom' });
export const sellerOrderStatusSchema = z.object({ status: z.enum([OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.REJECTED]) });
export const sellerPaymentStatusSchema = z.object({ paymentStatus: z.literal(PaymentStatus.PAID) });
