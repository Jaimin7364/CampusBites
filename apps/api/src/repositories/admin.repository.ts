import { OrderStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type AdminAccountFilters = { page: number; limit: number; search?: string; active?: boolean };
export type AdminOrderFilters = AdminAccountFilters & {
  universityId?: string; hotelId?: string; status?: OrderStatus; paymentStatus?: PaymentStatus;
  dateFrom?: string; dateTo?: string;
};

const accountSelect = {
  id: true, role: true, fullName: true, sellerName: true, businessOwnerName: true,
  email: true, phone: true, profilePhotoUrl: true, active: true, createdAt: true, updatedAt: true,
} satisfies Prisma.UserSelect;

function accountWhere(role: UserRole, filters: AdminAccountFilters): Prisma.UserWhereInput {
  return {
    role,
    ...(filters.active === undefined ? {} : { active: filters.active }),
    ...(filters.search ? { OR: [
      { fullName: { contains: filters.search } }, { sellerName: { contains: filters.search } },
      { businessOwnerName: { contains: filters.search } }, { email: { contains: filters.search } },
      { phone: { contains: filters.search } },
    ] } : {}),
  };
}

export async function listAccounts(role: UserRole, filters: AdminAccountFilters) {
  const where = accountWhere(role, filters);
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: accountSelect, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

export function findAccount(role: UserRole, id: string) {
  return prisma.user.findFirst({
    where: { id, role }, select: {
      ...accountSelect,
      ...(role === UserRole.USER
        ? { _count: { select: { orders: true } } }
        : { ownedHotels: { select: { id: true, hotelName: true, status: true, active: true, university: { select: { id: true, name: true, city: true } } } }, _count: { select: { sellerOrders: true } } }),
    },
  });
}

const orderSummarySelect = {
  id: true, orderNumber: true, userId: true, userName: true, sellerId: true, sellerName: true,
  hotelId: true, hotelName: true, universityId: true, totalAmountPaise: true, orderType: true,
  deliveryType: true, paymentMethod: true, paymentStatus: true, status: true, scheduledAt: true,
  createdAt: true, updatedAt: true,
} satisfies Prisma.OrderSelect;

function orderWhere(filters: AdminOrderFilters): Prisma.OrderWhereInput {
  return {
    ...(filters.universityId ? { universityId: filters.universityId } : {}),
    ...(filters.hotelId ? { hotelId: filters.hotelId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    ...(filters.dateFrom || filters.dateTo ? { createdAt: { ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}), ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}) } } : {}),
    ...(filters.search ? { OR: [
      { orderNumber: { contains: filters.search } }, { userName: { contains: filters.search } },
      { userPhone: { contains: filters.search } }, { sellerName: { contains: filters.search } },
      { hotelName: { contains: filters.search } },
    ] } : {}),
  };
}

export async function listOrders(filters: AdminOrderFilters) {
  const where = orderWhere(filters);
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({ where, select: orderSummarySelect, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
    prisma.order.count({ where }),
  ]);
  return { items, total };
}

export function findOrder(id: string) {
  return prisma.order.findUnique({ where: { id }, include: {
    items: true,
    statusHistory: { orderBy: { createdAt: 'asc' }, select: { id: true, fromStatus: true, toStatus: true, changedById: true, createdAt: true } },
    user: { select: accountSelect }, seller: { select: accountSelect },
    hotel: { select: { id: true, hotelName: true, phone: true, address: true, status: true, active: true, university: { select: { id: true, name: true, city: true, state: true, active: true } } } },
  } });
}

export async function dashboard() {
  const [universities, users, sellers, hotels, pendingHotels, approvedHotels, featuredHotels, orders, pendingOrders, completedOrders, orderValue] = await prisma.$transaction([
    prisma.university.count(), prisma.user.count({ where: { role: UserRole.USER } }), prisma.user.count({ where: { role: UserRole.SELLER } }),
    prisma.hotel.count(), prisma.hotel.count({ where: { status: 'PENDING' } }), prisma.hotel.count({ where: { status: 'APPROVED' } }),
    prisma.hotel.count({ where: { status: 'APPROVED', active: true, featured: true } }), prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }), prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
    prisma.order.aggregate({ where: { status: OrderStatus.COMPLETED, paymentStatus: PaymentStatus.PAID }, _sum: { totalAmountPaise: true } }),
  ]);
  return { universities, users, sellers, hotels, pendingHotels, approvedHotels, featuredHotels, orders, pendingOrders, completedOrders, totalOrderValuePaise: orderValue._sum.totalAmountPaise ?? 0 };
}
