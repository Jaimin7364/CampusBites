import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type MenuFilters = {
  page: number; limit: number; search?: string; category?: string; veg?: boolean; available?: boolean;
  bestseller?: boolean; sort?: 'displayOrder' | 'name' | 'priceAsc' | 'priceDesc';
};

function whereFor(hotelId: string, filters: MenuFilters): Prisma.MenuItemWhereInput {
  return { hotelId, ...(filters.search ? { OR: [{ name: { contains: filters.search } }, { description: { contains: filters.search } }] } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.veg === undefined ? {} : { veg: filters.veg }), ...(filters.available === undefined ? {} : { available: filters.available }), ...(filters.bestseller === undefined ? {} : { bestseller: filters.bestseller }) };
}
function orderBy(sort: MenuFilters['sort']): Prisma.MenuItemOrderByWithRelationInput[] {
  if (sort === 'priceAsc') return [{ pricePaise: 'asc' }, { name: 'asc' }];
  if (sort === 'priceDesc') return [{ pricePaise: 'desc' }, { name: 'asc' }];
  if (sort === 'name') return [{ name: 'asc' }];
  return [{ displayOrder: 'asc' }, { name: 'asc' }];
}
export async function list(hotelId: string, filters: MenuFilters) {
  const where = whereFor(hotelId, filters);
  const [items, total] = await prisma.$transaction([
    prisma.menuItem.findMany({ where, orderBy: orderBy(filters.sort), skip: (filters.page - 1) * filters.limit, take: filters.limit }),
    prisma.menuItem.count({ where }),
  ]);
  return { items, total };
}
export function findById(id: string) { return prisma.menuItem.findUnique({ where: { id }, include: { hotel: { select: { sellerId: true, status: true, active: true } } } }); }
export function create(data: Prisma.MenuItemUncheckedCreateInput) { return prisma.menuItem.create({ data }); }
export function update(id: string, data: Prisma.MenuItemUncheckedUpdateInput) { return prisma.menuItem.update({ where: { id }, data }); }
export function remove(id: string) { return prisma.menuItem.delete({ where: { id } }); }
export async function nextDisplayOrder(hotelId: string) { const result = await prisma.menuItem.aggregate({ where: { hotelId }, _max: { displayOrder: true } }); return (result._max.displayOrder ?? -1) + 1; }
export function findOwnedIds(hotelId: string, ids: string[]) { return prisma.menuItem.findMany({ where: { hotelId, id: { in: ids } }, select: { id: true } }); }
export function reorder(items: { id: string; displayOrder: number }[]) { return prisma.$transaction(items.map((item) => prisma.menuItem.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } }))); }
export function findForCart(ids: string[]) {
  return prisma.menuItem.findMany({
    where: { id: { in: ids } },
    select: {
      id: true, hotelId: true, name: true, pricePaise: true, veg: true, bestseller: true, available: true,
      hotel: { select: { id: true, hotelName: true, phone: true, sellerId: true, universityId: true, openTime: true, closeTime: true, status: true, active: true, seller: { select: { sellerName: true, businessOwnerName: true } }, university: { select: { active: true } } } },
    },
  });
}
