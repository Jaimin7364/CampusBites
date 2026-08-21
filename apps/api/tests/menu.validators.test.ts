import { describe, expect, it } from 'vitest';
import { createMenuItemSchema, publicMenuQuerySchema, reorderMenuSchema } from '../src/validators/menu.validators.js';

const item = { name: 'Masala Dosa', description: 'Crispy dosa with chutney', pricePaise: 8500, category: 'South Indian', veg: true, preparationTimeMinutes: 15 };
describe('menu validators', () => {
  it('accepts integer-paise menu data', () => expect(createMenuItemSchema.parse(item)).toMatchObject({ pricePaise: 8500, available: true, bestseller: false }));
  it('rejects floating-point prices', () => expect(createMenuItemSchema.safeParse({ ...item, pricePaise: 85.5 }).success).toBe(false));
  it('rejects unknown categories', () => expect(createMenuItemSchema.safeParse({ ...item, category: 'Random' }).success).toBe(false));
  it('validates preparation time limits', () => expect(createMenuItemSchema.safeParse({ ...item, preparationTimeMinutes: 0 }).success).toBe(false));
  it('parses public dietary, availability, and price sorting filters', () => expect(publicMenuQuerySchema.parse({ veg: 'true', available: 'false', sort: 'priceAsc' })).toMatchObject({ veg: true, available: false, sort: 'priceAsc' }));
  it('rejects duplicate IDs in a reorder request', () => expect(reorderMenuSchema.safeParse({ items: [{ id: 'cm1menu00000000000000000001', displayOrder: 1 }, { id: 'cm1menu00000000000000000001', displayOrder: 2 }] }).success).toBe(false));
});
