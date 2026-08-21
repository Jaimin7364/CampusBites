import { authenticatedApiClient } from './api-client';
import type { CreateOrderInput, Order } from '@/types/order';

export function createOrder(input: CreateOrderInput, idempotencyKey: string) {
  return authenticatedApiClient<{ order: Order }>('/orders', {
    method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input),
  });
}

export function getOrder(id: string) {
  return authenticatedApiClient<{ order: Order }>(`/orders/${id}`);
}
