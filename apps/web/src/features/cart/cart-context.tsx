'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem } from '@/types/cart';

export const CART_STORAGE_KEY = 'campusbites.cart.v1';
export const CART_MAX_QUANTITY = 20;
type CartContextValue = { items: CartItem[]; hydrated: boolean; totalQuantity: number; itemsTotalPaise: number; addItem: (item: Omit<CartItem, 'quantity'>, replace?: boolean) => 'added' | 'replacement-required'; increase: (id: string) => void; decrease: (id: string) => void; remove: (id: string) => void; clear: () => void; reconcile: (items: CartItem[]) => void };
const CartContext = createContext<CartContextValue | null>(null);

function validItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;
  return typeof item.menuItemId === 'string' && typeof item.hotelId === 'string' && typeof item.hotelName === 'string' && typeof item.itemName === 'string' && Number.isSafeInteger(item.pricePaise) && item.pricePaise! >= 0 && Number.isInteger(item.quantity) && item.quantity! >= 1 && item.quantity! <= CART_MAX_QUANTITY && typeof item.veg === 'boolean' && typeof item.bestseller === 'boolean';
}
export function parseStoredCart(raw: string | null) { try { const parsed: unknown = JSON.parse(raw ?? '[]'); if (!Array.isArray(parsed) || !parsed.every(validItem)) return []; const hotelId = parsed[0]?.hotelId; return parsed.every((item) => item.hotelId === hotelId) ? parsed : []; } catch { return []; } }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]); const [hydrated, setHydrated] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);
  const commit = useCallback((next: CartItem[]) => { itemsRef.current = next; setItems(next); }, []);
  useEffect(() => { const restored = parseStoredCart(localStorage.getItem(CART_STORAGE_KEY)); itemsRef.current = restored; setItems(restored); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); }, [hydrated, items]);
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, replace = false) => { const current = itemsRef.current; if (current.length && current[0]!.hotelId !== item.hotelId && !replace) return 'replacement-required'; if (current.length && current[0]!.hotelId !== item.hotelId) commit([{ ...item, quantity: 1 }]); else { const existing = current.find((value) => value.menuItemId === item.menuItemId); commit(existing ? current.map((value) => value.menuItemId === item.menuItemId ? { ...value, quantity: Math.min(CART_MAX_QUANTITY, value.quantity + 1) } : value) : [...current, { ...item, quantity: 1 }]); } return 'added'; }, [commit]);
  const increase = useCallback((id: string) => commit(itemsRef.current.map((item) => item.menuItemId === id ? { ...item, quantity: Math.min(CART_MAX_QUANTITY, item.quantity + 1) } : item)), [commit]);
  const decrease = useCallback((id: string) => commit(itemsRef.current.flatMap((item) => item.menuItemId !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [])), [commit]);
  const remove = useCallback((id: string) => commit(itemsRef.current.filter((item) => item.menuItemId !== id)), [commit]);
  const clear = useCallback(() => commit([]), [commit]); const reconcile = useCallback((next: CartItem[]) => commit(next), [commit]);
  const value = useMemo(() => ({ items, hydrated, totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0), itemsTotalPaise: items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0), addItem, increase, decrease, remove, clear, reconcile }), [items, hydrated, addItem, increase, decrease, remove, clear, reconcile]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used inside CartProvider'); return value; }
