import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type SellerOrderFilters = {
  page: number; limit: number; status?: OrderStatus; orderType?: 'INSTANT' | 'PREORDER'; deliveryType?: 'PICKUP' | 'DELIVERY';
  paymentStatus?: PaymentStatus; search?: string; scheduledFrom?: string; scheduledTo?: string;
};
const detailInclude = { items: true, statusHistory: { orderBy: { createdAt: 'asc' as const }, select: { id: true, fromStatus: true, toStatus: true, changedById: true, createdAt: true } } };
function where(sellerId: string, filters: SellerOrderFilters): Prisma.OrderWhereInput {
  return { sellerId, ...(filters.status ? { status: filters.status } : {}), ...(filters.orderType ? { orderType: filters.orderType } : {}), ...(filters.deliveryType ? { deliveryType: filters.deliveryType } : {}), ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}), ...(filters.search ? { OR: [{ orderNumber: { contains: filters.search } }, { userName: { contains: filters.search } }, { userPhone: { contains: filters.search } }] } : {}), ...(filters.scheduledFrom || filters.scheduledTo ? { scheduledAt: { ...(filters.scheduledFrom ? { gte: new Date(filters.scheduledFrom) } : {}), ...(filters.scheduledTo ? { lte: new Date(filters.scheduledTo) } : {}) } } : {}) };
}
export async function list(sellerId: string, filters: SellerOrderFilters) {
  const criteria = where(sellerId, filters);
  const [items, total] = await prisma.$transaction([prisma.order.findMany({ where: criteria, orderBy: [{ createdAt: 'desc' }], skip: (filters.page - 1) * filters.limit, take: filters.limit, include: { items: true } }), prisma.order.count({ where: criteria })]);
  return { items, total };
}
export function findOwned(sellerId: string, id: string) { return prisma.order.findFirst({ where: { id, sellerId }, include: detailInclude }); }
export async function transitionAtomic(sellerId: string, id: string, fromStatus: OrderStatus, toStatus: OrderStatus, changedById: string, timestamp: Date) {
  return prisma.$transaction(async (tx) => {
    const timestampData: Prisma.OrderUpdateManyMutationInput = toStatus === OrderStatus.ACCEPTED ? { acceptedAt: timestamp } : toStatus === OrderStatus.PREPARING ? { preparingAt: timestamp } : toStatus === OrderStatus.READY ? { readyAt: timestamp } : toStatus === OrderStatus.COMPLETED ? { completedAt: timestamp } : { rejectedAt: timestamp };
    const updated = await tx.order.updateMany({ where: { id, sellerId, status: fromStatus }, data: { status: toStatus, ...timestampData } });
    if (updated.count !== 1) return null;
    await tx.orderStatusHistory.create({ data: { orderId: id, fromStatus, toStatus, changedById, createdAt: timestamp } });
    return tx.order.findUnique({ where: { id }, include: detailInclude });
  });
}
export async function markPaidAtomic(sellerId: string, id: string, timestamp: Date) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({ where: { id, sellerId, status: OrderStatus.READY, paymentStatus: PaymentStatus.PENDING }, data: { paymentStatus: PaymentStatus.PAID, paymentPaidAt: timestamp } });
    if (updated.count !== 1) return null;
    return tx.order.findUnique({ where: { id }, include: detailInclude });
  });
}
export async function summary(sellerId: string, dayStart: Date, dayEnd: Date) {
  const [statusCounts, todayOrders, todaySales] = await prisma.$transaction([
    prisma.order.groupBy({ by: ['status'], where: { sellerId }, orderBy: { status: 'asc' }, _count: { _all: true } }),
    prisma.order.count({ where: { sellerId, createdAt: { gte: dayStart, lt: dayEnd } } }),
    prisma.order.aggregate({ where: { sellerId, status: OrderStatus.COMPLETED, paymentStatus: PaymentStatus.PAID, completedAt: { gte: dayStart, lt: dayEnd } }, _sum: { totalAmountPaise: true }, _count: { _all: true } }),
  ]);
  return { statusCounts: statusCounts.map((row) => ({ status: row.status, count: typeof row._count === 'object' ? row._count._all ?? 0 : 0 })), todayOrders, todaySalesPaise: todaySales._sum.totalAmountPaise ?? 0, todayCompletedOrders: todaySales._count._all };
}
