import { describe, expect, it } from 'vitest'; import { createOrderSchema, userOrderListQuerySchema } from '../src/validators/order.validators.js';
const base = { items: [{ menuItemId: 'cm1menu00000000000000000001', quantity: 1 }], orderType: 'INSTANT', deliveryType: 'PICKUP' };
describe('order validators', () => {
  it('accepts instant pickup', () => expect(createOrderSchema.safeParse(base).success).toBe(true));
  it('requires a future-shaped timestamp field for preorders', () => expect(createOrderSchema.safeParse({ ...base, orderType: 'PREORDER', scheduledAt: '2026-08-22T10:00:00.000Z' }).success).toBe(true));
  it('requires an address for delivery', () => expect(createOrderSchema.safeParse({ ...base, deliveryType: 'DELIVERY' }).success).toBe(false));
  it('rejects schedule data on instant orders', () => expect(createOrderSchema.safeParse({ ...base, scheduledAt: '2026-08-22T10:00:00.000Z' }).success).toBe(false));
  it('parses user history groups and bounded pagination', () => expect(userOrderListQuerySchema.parse({ group: 'cancelled', page: '2' })).toMatchObject({ group: 'cancelled', page: 2, limit: 20 }));
  it('rejects unknown history groups', () => expect(userOrderListQuerySchema.safeParse({ group: 'all-active-ish' }).success).toBe(false));
});
