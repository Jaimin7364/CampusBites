import { describe, expect, it } from 'vitest';
import { cartPreviewSchema } from '../src/validators/cart.validators.js';

const id = 'cm1menu00000000000000000001';
describe('cart validators', () => {
  it('accepts item IDs and positive integer quantities', () => expect(cartPreviewSchema.safeParse({ items: [{ menuItemId: id, quantity: 2 }] }).success).toBe(true));
  it('rejects an empty cart', () => expect(cartPreviewSchema.safeParse({ items: [] }).success).toBe(false));
  it('rejects zero, negative, fractional, and excessive quantities', () => { for (const quantity of [0, -1, 1.5, 21]) expect(cartPreviewSchema.safeParse({ items: [{ menuItemId: id, quantity }] }).success).toBe(false); });
  it('rejects duplicate item IDs', () => expect(cartPreviewSchema.safeParse({ items: [{ menuItemId: id, quantity: 1 }, { menuItemId: id, quantity: 2 }] }).success).toBe(false));
  it('strips browser-supplied price and name fields', () => expect(cartPreviewSchema.parse({ items: [{ menuItemId: id, quantity: 1, pricePaise: 1, itemName: 'Tampered' }] })).toEqual({ items: [{ menuItemId: id, quantity: 1 }] }));
});
