import { authenticatedApiClient } from './api-client';
import type { AdminAccount, AdminAccountFilters, AdminDashboard, AdminOrder, AdminOrderFilters, AdminOrderSummary, Pagination } from '@/types/admin';

function query(input: Record<string, string | number | undefined>) { const params = new URLSearchParams(); for (const [key, value] of Object.entries(input)) if (value !== undefined && value !== '') params.set(key, String(value)); const result = params.toString(); return result ? `?${result}` : ''; }
export const getAdminDashboard = () => authenticatedApiClient<AdminDashboard>('/admin/dashboard');
export const listAdminUsers = (filters: AdminAccountFilters) => authenticatedApiClient<{ users: AdminAccount[]; pagination: Pagination }>(`/admin/users${query(filters)}`);
export const getAdminUser = (id: string) => authenticatedApiClient<{ user: AdminAccount }>(`/admin/users/${id}`);
export const listAdminSellers = (filters: AdminAccountFilters) => authenticatedApiClient<{ sellers: AdminAccount[]; pagination: Pagination }>(`/admin/sellers${query(filters)}`);
export const getAdminSeller = (id: string) => authenticatedApiClient<{ seller: AdminAccount }>(`/admin/sellers/${id}`);
export const listAdminOrders = (filters: AdminOrderFilters) => authenticatedApiClient<{ orders: AdminOrderSummary[]; pagination: Pagination }>(`/admin/orders${query(filters)}`);
export const getAdminOrder = (id: string) => authenticatedApiClient<{ order: AdminOrder }>(`/admin/orders/${id}`);
