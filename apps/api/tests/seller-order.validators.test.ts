import { describe, expect, it } from 'vitest';
import { sellerOrderListQuerySchema, sellerOrderStatusSchema, sellerPaymentStatusSchema } from '../src/validators/seller-order.validators.js';
describe('seller order validators', () => {
  it('parses bounded list filters', () => expect(sellerOrderListQuerySchema.parse({ page: '2', status: 'READY' })).toMatchObject({ page: 2, limit: 20, status: 'READY' }));
  it('rejects reversed schedule ranges', () => expect(sellerOrderListQuerySchema.safeParse({ scheduledFrom: '2026-08-22T00:00:00Z', scheduledTo: '2026-08-21T00:00:00Z' }).success).toBe(false));
  it('does not let sellers set cancelled or pending status', () => { expect(sellerOrderStatusSchema.safeParse({ status: 'CANCELLED' }).success).toBe(false); expect(sellerOrderStatusSchema.safeParse({ status: 'PENDING' }).success).toBe(false); });
  it('accepts paid but rejects payment rollback', () => { expect(sellerPaymentStatusSchema.safeParse({ paymentStatus: 'PAID' }).success).toBe(true); expect(sellerPaymentStatusSchema.safeParse({ paymentStatus: 'PENDING' }).success).toBe(false); });
});
