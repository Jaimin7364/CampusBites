import { UserRole } from '@prisma/client';
import { AppError } from '../errors/app-error.js';
import * as repository from '../repositories/admin.repository.js';

function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } };
}

export async function listUsers(filters: repository.AdminAccountFilters) { const result = await repository.listAccounts(UserRole.USER, filters); const page = paginated(result.items, result.total, filters.page, filters.limit); return { users: page.items, pagination: page.pagination }; }
export async function listSellers(filters: repository.AdminAccountFilters) { const result = await repository.listAccounts(UserRole.SELLER, filters); const page = paginated(result.items, result.total, filters.page, filters.limit); return { sellers: page.items, pagination: page.pagination }; }
export async function getUser(id: string) { const user = await repository.findAccount(UserRole.USER, id); if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found'); return user; }
export async function getSeller(id: string) { const seller = await repository.findAccount(UserRole.SELLER, id); if (!seller) throw new AppError(404, 'SELLER_NOT_FOUND', 'Seller was not found'); return seller; }
export async function listOrders(filters: repository.AdminOrderFilters) { const result = await repository.listOrders(filters); const page = paginated(result.items, result.total, filters.page, filters.limit); return { orders: page.items, pagination: page.pagination }; }
export async function getOrder(id: string) { const order = await repository.findOrder(id); if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found'); return order; }
export async function getDashboard() { return { ...(await repository.dashboard()), totalOrderValueDefinition: 'Sum of totalAmountPaise for orders with status COMPLETED and paymentStatus PAID.' }; }
