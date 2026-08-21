import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CART_MAX_QUANTITY, CartProvider, parseStoredCart, useCart } from './cart-context';

const first = { menuItemId: 'item-1', hotelId: 'hotel-1', hotelName: 'Cafe', itemName: 'Dosa', pricePaise: 8500, veg: true, bestseller: false };
const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;
describe('CartProvider', () => {
  beforeEach(() => localStorage.clear());
  it('adds, totals, changes quantity, and removes items', async () => { const { result } = renderHook(() => useCart(), { wrapper }); await waitFor(() => expect(result.current.hydrated).toBe(true)); act(() => { result.current.addItem(first); result.current.addItem(first); }); expect(result.current.totalQuantity).toBe(2); expect(result.current.itemsTotalPaise).toBe(17000); act(() => result.current.decrease(first.menuItemId)); expect(result.current.totalQuantity).toBe(1); act(() => result.current.decrease(first.menuItemId)); expect(result.current.items).toHaveLength(0); });
  it('requires confirmation before replacing a different vendor', async () => { const { result } = renderHook(() => useCart(), { wrapper }); await waitFor(() => expect(result.current.hydrated).toBe(true)); act(() => { result.current.addItem(first); }); const second = { ...first, menuItemId: 'item-2', hotelId: 'hotel-2', hotelName: 'Other' }; let outcome = ''; act(() => { outcome = result.current.addItem(second); }); expect(outcome).toBe('replacement-required'); expect(result.current.items[0]?.hotelId).toBe('hotel-1'); act(() => { result.current.addItem(second, true); }); expect(result.current.items[0]?.hotelId).toBe('hotel-2'); });
  it('restores valid storage and clears malformed or mixed-vendor data', () => { expect(parseStoredCart(JSON.stringify([{ ...first, quantity: 1 }]))).toHaveLength(1); expect(parseStoredCart('{bad')).toEqual([]); expect(parseStoredCart(JSON.stringify([{ ...first, quantity: 1 }, { ...first, menuItemId: 'item-2', hotelId: 'hotel-2', quantity: 1 }]))).toEqual([]); expect(parseStoredCart(JSON.stringify([{ ...first, quantity: CART_MAX_QUANTITY + 1 }]))).toEqual([]); });
});
