import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY, CartProvider } from '@/features/cart/cart-context';
import { CheckoutPage } from './checkout-page';

const mocks = vi.hoisted(() => ({ previewCart: vi.fn(), createOrder: vi.fn() }));
vi.mock('@/services/cart-service', () => ({ previewCart: mocks.previewCart }));
vi.mock('@/services/order-service', () => ({ createOrder: mocks.createOrder }));
vi.mock('@/features/auth/auth-context', () => ({ useAuth: () => ({ user: { fullName: 'Student One', phone: '+919999999999' } }) }));

const stored = { menuItemId: 'item-1', hotelId: 'hotel-1', hotelName: 'Campus Cafe', itemName: 'Dosa', pricePaise: 8500, quantity: 2, veg: true, bestseller: false };
const preview = { hotel: { id: 'hotel-1', hotelName: 'Campus Cafe' }, items: [{ ...stored, hotelName: undefined, available: true, subtotalPaise: 17000 }], orderable: true, issues: [], totals: { totalQuantity: 2, itemsTotalPaise: 17000, deliveryChargePaise: 0, platformFeePaise: 0, grandTotalPaise: 17000 } };
const order = { id: 'order-1', orderNumber: 'CB-2026-ABC123', hotelName: 'Campus Cafe', deliveryType: 'PICKUP', totalAmountPaise: 17000 };

describe('CheckoutPage', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([stored])); mocks.previewCart.mockResolvedValue(preview); mocks.createOrder.mockResolvedValue({ order }); });
  it('shows conditional schedule and delivery address controls', async () => { render(<CartProvider><CheckoutPage /></CartProvider>); await screen.findByRole('button', { name: /Place cash order/ }); fireEvent.click(screen.getByRole('radio', { name: /Pre-order/ })); expect(screen.getByLabelText('Pickup/delivery date and time')).toBeInTheDocument(); fireEvent.click(screen.getByRole('radio', { name: /Campus delivery/ })); expect(screen.getByLabelText('Delivery address')).toBeInTheDocument(); });
  it('re-previews, submits one server-owned payload, clears the cart, and shows success', async () => { render(<CartProvider><CheckoutPage /></CartProvider>); const submit = await screen.findByRole('button', { name: /Place cash order/ }); fireEvent.click(submit); fireEvent.click(submit); expect(await screen.findByText('CB-2026-ABC123')).toBeInTheDocument(); expect(mocks.previewCart).toHaveBeenCalledTimes(2); expect(mocks.createOrder).toHaveBeenCalledTimes(1); expect(mocks.createOrder).toHaveBeenCalledWith({ items: [{ menuItemId: 'item-1', quantity: 2 }], orderType: 'INSTANT', deliveryType: 'PICKUP' }, expect.stringMatching(/^web-checkout-/)); await waitFor(() => expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]')).toEqual([])); });
  it('does not submit when the final preview becomes unavailable', async () => { mocks.previewCart.mockResolvedValueOnce(preview).mockResolvedValueOnce({ ...preview, orderable: false }); render(<CartProvider><CheckoutPage /></CartProvider>); fireEvent.click(await screen.findByRole('button', { name: /Place cash order/ })); expect(await screen.findByText('Your cart changed. Review unavailable items before ordering.')).toBeInTheDocument(); expect(mocks.createOrder).not.toHaveBeenCalled(); });
});
