import { z } from 'zod';

export const menuCategories = ['Breakfast', 'Snacks', 'Lunch', 'Dinner', 'Beverages', 'Fast Food', 'Chinese', 'South Indian', 'Desserts', 'Others'] as const;
const name = z.string().trim().min(2).max(191);
const description = z.string().trim().max(1000).nullable().optional();

export const menuItemIdParamsSchema = z.object({ id: z.string().cuid() });
export const hotelMenuParamsSchema = z.object({ hotelId: z.string().cuid() });

export const createMenuItemSchema = z.object({
  name,
  description,
  pricePaise: z.number().int().min(100, 'Price must be at least ₹1').max(10_000_000),
  category: z.enum(menuCategories),
  veg: z.boolean(),
  bestseller: z.boolean().optional().default(false),
  preparationTimeMinutes: z.number().int().min(1).max(240),
  available: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).max(100_000).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one menu item field' });
export const menuAvailabilitySchema = z.object({ available: z.boolean() });
export const menuBestsellerSchema = z.object({ bestseller: z.boolean() });
export const reorderMenuSchema = z.object({
  items: z.array(z.object({ id: z.string().cuid(), displayOrder: z.number().int().min(0).max(100_000) })).min(1).max(200),
}).refine((value) => new Set(value.items.map((item) => item.id)).size === value.items.length, { message: 'Each menu item can appear only once' });

const commonQuery = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(120).optional(),
  category: z.enum(menuCategories).optional(),
  veg: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  available: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
};
export const publicMenuQuerySchema = z.object({
  ...commonQuery,
  bestseller: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  sort: z.enum(['displayOrder', 'name', 'priceAsc', 'priceDesc']).default('displayOrder'),
});
export const sellerMenuQuerySchema = z.object({ ...commonQuery, limit: z.coerce.number().int().min(1).max(100).default(100) });
