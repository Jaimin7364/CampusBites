import { OrderStatus, PaymentStatus } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import * as repository from '../repositories/seller-order.repository.js';

const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = { PENDING: [OrderStatus.ACCEPTED, OrderStatus.REJECTED], ACCEPTED: [OrderStatus.PREPARING], PREPARING: [OrderStatus.READY], READY: [OrderStatus.COMPLETED] };
export async function listSellerOrders(sellerId: string, filters: repository.SellerOrderFilters) { const result = await repository.list(sellerId, filters); return { orders: result.items, pagination: { page: filters.page, limit: filters.limit, total: result.total, totalPages: Math.ceil(result.total / filters.limit), hasNextPage: filters.page * filters.limit < result.total, hasPreviousPage: filters.page > 1 } }; }
export async function getSellerOrder(sellerId: string, id: string) { const order = await repository.findOwned(sellerId, id); if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found'); return order; }
export async function changeStatus(sellerId: string, id: string, target: OrderStatus, now = new Date()) {
  const order = await getSellerOrder(sellerId, id);
  if (!transitions[order.status]?.includes(target)) throw new AppError(409, 'INVALID_ORDER_TRANSITION', `Order cannot move from ${order.status} to ${target}`);
  if (target === OrderStatus.COMPLETED && order.paymentStatus !== PaymentStatus.PAID) throw new AppError(409, 'PAYMENT_REQUIRED', 'Mark the cash payment as paid before completing the order');
  const updated = await repository.transitionAtomic(sellerId, id, order.status, target, sellerId, now);
  if (!updated) throw new AppError(409, 'ORDER_STATUS_CHANGED', 'The order status changed before this action completed');
  return updated;
}
export async function markPaymentPaid(sellerId: string, id: string, now = new Date()) {
  const order = await getSellerOrder(sellerId, id);
  if (order.paymentStatus === PaymentStatus.PAID) return order;
  if (order.status !== OrderStatus.READY) throw new AppError(409, 'PAYMENT_NOT_COLLECTABLE', 'Cash payment can be marked paid only when the order is ready');
  const updated = await repository.markPaidAtomic(sellerId, id, now); if (!updated) throw new AppError(409, 'ORDER_PAYMENT_CHANGED', 'The order payment or status changed before this action completed'); return updated;
}
function localDayBounds(now: Date) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: env.BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const approximate = new Date(`${values.year}-${values.month}-${values.day}T00:00:00.000Z`); const displayed = new Date(approximate.toLocaleString('en-US', { timeZone: env.BUSINESS_TIME_ZONE })); const start = new Date(approximate.getTime() - (displayed.getTime() - approximate.getTime())); return { start, end: new Date(start.getTime() + 86_400_000) };
}
export async function getSellerOrderSummary(sellerId: string, now = new Date()) { const { start, end } = localDayBounds(now); const result = await repository.summary(sellerId, start, end); const counts = Object.fromEntries(Object.values(OrderStatus).map((status) => [status, 0])) as Record<OrderStatus, number>; for (const row of result.statusCounts) counts[row.status] = row.count; return { ...result, statusCounts: counts, businessDate: new Intl.DateTimeFormat('en-CA', { timeZone: env.BUSINESS_TIME_ZONE }).format(now) }; }
