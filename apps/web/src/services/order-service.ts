import { authenticatedApiClient } from './api-client';
import type { CreateOrderInput, Order, OrderStatus, SellerOrderFilters, SellerOrderSummary } from '@/types/order';

export function createOrder(input: CreateOrderInput, idempotencyKey: string) {
  return authenticatedApiClient<{ order: Order }>('/orders', {
    method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input),
  });
}

export function getOrder(id: string) {
  return authenticatedApiClient<{ order: Order }>(`/orders/${id}`);
}

export function listSellerOrders(filters: SellerOrderFilters = {}) {
  const query = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') query.set(key, String(value)); });
  return authenticatedApiClient<{ orders: Order[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }>(`/seller/orders?${query}`);
}
export function getSellerOrder(id: string) { return authenticatedApiClient<{ order: Order }>(`/seller/orders/${id}`); }
export function changeSellerOrderStatus(id: string, status: OrderStatus) { return authenticatedApiClient<{ order: Order }>(`/seller/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
export function markSellerOrderPaid(id: string) { return authenticatedApiClient<{ order: Order }>(`/seller/orders/${id}/payment-status`, { method: 'PATCH', body: JSON.stringify({ paymentStatus: 'PAID' }) }); }
export function getSellerOrderSummary() { return authenticatedApiClient<SellerOrderSummary>('/seller/orders/summary'); }
