import { OrderStatus, type Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
export function findByIdempotency(userId: string, idempotencyKey: string) { return prisma.order.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } }, include: { items: true } }); }
export function findById(id: string) { return prisma.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } } }); }
export function create(data: Prisma.OrderCreateInput) { return prisma.$transaction(async (tx) => tx.order.create({ data, include: { items: true } })); }
export type UserOrderFilters = { page: number; limit: number; group?: 'active' | 'completed' | 'cancelled'; search?: string };
export async function listForUser(userId: string, filters: UserOrderFilters) {
  const grouped: Record<NonNullable<UserOrderFilters['group']>, OrderStatus[]> = { active: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY], completed: [OrderStatus.COMPLETED], cancelled: [OrderStatus.CANCELLED, OrderStatus.REJECTED] };
  const where: Prisma.OrderWhereInput = { userId, ...(filters.group ? { status: { in: grouped[filters.group] } } : {}), ...(filters.search ? { OR: [{ orderNumber: { contains: filters.search } }, { hotelName: { contains: filters.search } }] } : {}) };
  const [items, total] = await prisma.$transaction([prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit, include: { items: true } }), prisma.order.count({ where })]); return { items, total };
}
export async function cancelPending(userId: string, id: string, timestamp: Date) {
  return prisma.$transaction(async (tx) => { const updated = await tx.order.updateMany({ where: { id, userId, status: OrderStatus.PENDING }, data: { status: OrderStatus.CANCELLED, cancelledAt: timestamp } }); if (updated.count !== 1) return null; await tx.orderStatusHistory.create({ data: { orderId: id, fromStatus: OrderStatus.PENDING, toStatus: OrderStatus.CANCELLED, changedById: userId, createdAt: timestamp } }); return tx.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } } }); });
}
