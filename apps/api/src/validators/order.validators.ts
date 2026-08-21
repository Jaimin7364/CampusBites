import { DeliveryType, OrderType } from '@prisma/client';
import { z } from 'zod';
import { cartPreviewSchema } from './cart.validators.js';

export const createOrderSchema = cartPreviewSchema.extend({ orderType: z.nativeEnum(OrderType), deliveryType: z.nativeEnum(DeliveryType), deliveryAddress: z.string().trim().min(5).max(500).nullable().optional(), scheduledAt: z.iso.datetime().nullable().optional() }).superRefine((value, context) => {
  if (value.orderType === OrderType.PREORDER && !value.scheduledAt) context.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Scheduled date and time are required for a pre-order' });
  if (value.orderType === OrderType.INSTANT && value.scheduledAt) context.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Instant orders cannot have a scheduled time' });
  if (value.deliveryType === DeliveryType.DELIVERY && !value.deliveryAddress) context.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Delivery address is required' });
  if (value.deliveryType === DeliveryType.PICKUP && value.deliveryAddress) context.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Pickup orders cannot have a delivery address' });
});
export const orderIdParamsSchema = z.object({ id: z.string().cuid() });
export const userOrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  group: z.enum(['active', 'completed', 'cancelled']).optional(),
  search: z.string().trim().max(120).optional(),
});
