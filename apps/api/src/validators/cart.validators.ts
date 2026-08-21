import { z } from 'zod';
import { env } from '../config/env.js';

export const cartPreviewSchema = z.object({
  items: z.array(z.object({ menuItemId: z.string().cuid(), quantity: z.number().int().min(1).max(env.CART_MAX_ITEM_QUANTITY) })).min(1, 'Cart must contain at least one item').max(50).superRefine((items, context) => {
    const seen = new Set<string>();
    items.forEach((item, index) => { if (seen.has(item.menuItemId)) context.addIssue({ code: 'custom', path: [index, 'menuItemId'], message: 'Each menu item may appear only once' }); seen.add(item.menuItemId); });
  }),
});
