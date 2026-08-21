import { authenticatedApiClient } from './api-client';
import type { CartItem, CartPreview } from '@/types/cart';

export function previewCart(items: CartItem[]) {
  return authenticatedApiClient<CartPreview>('/orders/preview', { method: 'POST', body: JSON.stringify({ items: items.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })) }) });
}
