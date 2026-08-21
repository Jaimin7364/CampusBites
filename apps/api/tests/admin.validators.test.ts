import { describe, expect, it } from 'vitest';
import { adminAccountListQuerySchema, adminOrderListQuerySchema } from '../src/validators/admin.validators.js';

describe('admin validators', () => {
  it('defaults and bounds account pagination', () => {
    expect(adminAccountListQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(adminAccountListQuerySchema.parse({ active: 'false', limit: '100' })).toMatchObject({ active: false, limit: 100 });
    expect(adminAccountListQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
  });

  it('parses order filters and rejects reversed date ranges', () => {
    const parsed = adminOrderListQuerySchema.parse({ status: 'COMPLETED', paymentStatus: 'PAID', page: '2' });
    expect(parsed).toMatchObject({ status: 'COMPLETED', paymentStatus: 'PAID', page: 2, limit: 20 });
    expect(adminOrderListQuerySchema.safeParse({ dateFrom: '2026-08-22T00:00:00.000Z', dateTo: '2026-08-21T00:00:00.000Z' }).success).toBe(false);
  });
});
