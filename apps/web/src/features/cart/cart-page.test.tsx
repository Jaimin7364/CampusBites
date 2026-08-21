import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartPage } from './cart-page';
import { CART_STORAGE_KEY, CartProvider } from './cart-context';

const mocks = vi.hoisted(() => ({ previewCart: vi.fn() }));
vi.mock('@/services/cart-service', () => mocks);
const stored = { menuItemId: 'item-1', hotelId: 'hotel-1', hotelName: 'Old Cafe', itemName: 'Old Dosa', pricePaise: 1, quantity: 2, veg: true, bestseller: false };
const preview = { hotel: { id: 'hotel-1', hotelName: 'Campus Cafe' }, items: [{ menuItemId: 'item-1', hotelId: 'hotel-1', itemName: 'Dosa', pricePaise: 8500, quantity: 2, veg: true, bestseller: false, available: true, subtotalPaise: 17000 }], orderable: true, issues: [], totals: { totalQuantity: 2, itemsTotalPaise: 17000, deliveryChargePaise: 0, platformFeePaise: 0, grandTotalPaise: 17000 } };
describe('CartPage', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([stored])); mocks.previewCart.mockResolvedValue(preview); });
  it('reconciles saved snapshots and renders server-authoritative totals', async () => { render(<CartProvider><CartPage /></CartProvider>); expect(await screen.findByText('Campus Cafe')).toBeInTheDocument(); expect(screen.getAllByText('₹170.00')).not.toHaveLength(0); await waitFor(() => expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]')[0]).toMatchObject({ itemName: 'Dosa', pricePaise: 8500 })); });
  it('blocks checkout when the server marks an item unavailable', async () => { mocks.previewCart.mockResolvedValue({ ...preview, orderable: false, items: [{ ...preview.items[0], available: false }], issues: [{ code: 'ITEMS_UNAVAILABLE', message: 'Remove unavailable items before checkout', menuItemIds: ['item-1'] }] }); render(<CartProvider><CartPage /></CartProvider>); expect(await screen.findByText('Remove unavailable items before checkout')).toBeInTheDocument(); expect(screen.getByRole('button', { name: /Proceed to checkout/ })).toBeDisabled(); });
});
