'use client';
import Link from 'next/link';
import { useCart } from './cart-context';
export function CartNavLink() { const { totalQuantity } = useCart(); return <Link href="/user/cart" className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-950">Cart{totalQuantity ? ` (${totalQuantity})` : ''}</Link>; }
