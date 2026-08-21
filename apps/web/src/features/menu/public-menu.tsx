'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/services/api-client';
import { listPublicMenu, type PublicMenuFilters } from '@/services/menu-service';
import { menuCategories, type MenuCategory, type MenuItem, type PublicMenuHotel } from '@/types/menu';
import { formatInr } from '@/utils/money';
import { CART_MAX_QUANTITY, useCart } from '@/features/cart/cart-context';

const selectClass = 'min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 shadow-sm focus:border-brand-orange-500 focus:ring-4 focus:ring-orange-100';

export function PublicMenu({ hotelId, embedded = false }: { hotelId: string; embedded?: boolean }) {
  const [hotel, setHotel] = useState<PublicMenuHotel | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('This menu could not be loaded.');
  const [filters, setFilters] = useState<PublicMenuFilters>({ page: 1, sort: 'displayOrder' });
  const [cartNotice, setCartNotice] = useState('');
  const cart = useCart();

  const load = useCallback(async () => {
    setStatus('loading');
    try { const result = await listPublicMenu(hotelId, filters); setHotel(result.hotel); setItems(result.menuItems); setStatus('ready'); }
    catch (error) { setMessage(error instanceof ApiClientError ? error.message : 'This menu could not be loaded.'); setStatus('error'); }
  }, [hotelId, filters]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), filters.search ? 250 : 0); return () => window.clearTimeout(timer); }, [load, filters.search]);
  function change(patch: Partial<PublicMenuFilters>) { setFilters((current) => ({ ...current, ...patch, page: 1 })); }
  function add(item: MenuItem) {
    if (!hotel) return;
    const candidate = { menuItemId: item.id, hotelId: item.hotelId, hotelName: hotel.hotelName, itemName: item.name, pricePaise: item.pricePaise, veg: item.veg, bestseller: item.bestseller };
    if (cart.addItem(candidate) === 'replacement-required') {
      if (!window.confirm('You can order from only one food outlet at a time. Replace your current cart with this outlet?')) return;
      cart.addItem(candidate, true);
    }
    setCartNotice(`${item.name} added to your cart.`);
  }

  if (status === 'loading' && !hotel) return <div className={`grid place-items-center px-4 ${embedded ? 'min-h-48' : 'min-h-screen bg-orange-50'}`}><div role="status" className="rounded-3xl border border-orange-100 bg-white p-10 text-stone-500 shadow-sm">Loading the menu…</div></div>;
  if (status === 'error' && !hotel) return <main className="mx-auto max-w-3xl px-4 py-20"><Alert>{message}</Alert><div className="mt-5 flex gap-3"><Button onClick={() => void load()}>Try again</Button><Link href="/" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold">Back home</Link></div></main>;

  return <div className={embedded ? '' : 'min-h-screen bg-stone-50'}>
    {!embedded ? <header className="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/" className="text-sm font-semibold text-brand-orange-600">← CampusBites home</Link><div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-500">{hotel?.university.name}</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-950">{hotel?.hotelName}</h1><p className="mt-3 max-w-2xl text-stone-600">{hotel?.description}</p><p className="mt-3 text-sm text-stone-500">Open {hotel?.openTime}–{hotel?.closeTime} · {hotel?.address}</p></div>{hotel?.featured ? <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">Featured outlet</span> : null}</div></div>
    </header> : null}
    <div className={embedded ? 'py-8' : 'mx-auto max-w-6xl px-4 py-8 sm:px-6'}>
      {embedded ? <h2 className="mb-5 text-3xl font-bold text-stone-950">Menu</h2> : null}
      {cartNotice ? <div className="mb-5 flex items-center justify-between gap-3"><Alert tone="success">{cartNotice}</Alert><Link href="/user/cart" className="whitespace-nowrap rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold">View cart ({cart.totalQuantity})</Link></div> : null}
      <section aria-label="Menu filters" className="grid gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <input aria-label="Search menu" className={`${selectClass} lg:col-span-2`} placeholder="Search dishes" value={filters.search ?? ''} onChange={(e) => change({ search: e.target.value })} />
        <select aria-label="Category" className={selectClass} value={filters.category ?? ''} onChange={(e) => change({ category: e.target.value as '' | MenuCategory })}><option value="">All categories</option>{menuCategories.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Diet" className={selectClass} value={filters.veg ?? ''} onChange={(e) => change({ veg: e.target.value as '' | 'true' | 'false' })}><option value="">Veg & non-veg</option><option value="true">Vegetarian</option><option value="false">Non-vegetarian</option></select>
        <select aria-label="Availability" className={selectClass} value={filters.available ?? ''} onChange={(e) => change({ available: e.target.value as '' | 'true' | 'false' })}><option value="">All availability</option><option value="true">Available now</option><option value="false">Unavailable</option></select>
        <select aria-label="Sort menu" className={selectClass} value={filters.sort} onChange={(e) => change({ sort: e.target.value as PublicMenuFilters['sort'] })}><option value="displayOrder">Recommended</option><option value="name">Name</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option></select>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-stone-700 sm:col-span-2 lg:col-span-6"><input type="checkbox" checked={filters.bestseller === 'true'} onChange={(e) => change({ bestseller: e.target.checked ? 'true' : '' })} />Bestsellers only</label>
      </section>
      {status === 'loading' ? <p role="status" className="mt-5 text-sm text-stone-500">Refreshing menu…</p> : null}
      {status === 'error' ? <div className="mt-5"><Alert>{message}</Alert></div> : null}
      {status !== 'error' && items.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center"><h2 className="text-xl font-bold">No dishes found</h2><p className="mt-2 text-stone-500">Try clearing one or more filters.</p></div> : null}
      <section aria-label="Menu items" className="mt-8 grid gap-5 md:grid-cols-2">{items.map((item) => { const cartItem = cart.items.find((value) => value.menuItemId === item.id); return <article key={item.id} className={`rounded-3xl border bg-white p-5 shadow-sm ${item.available ? 'border-stone-200' : 'border-stone-200 opacity-70'}`}><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'} className={`size-4 rounded-sm border-2 p-0.5 ${item.veg ? 'border-green-600' : 'border-red-600'}`}><span className={`block size-full rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`} /></span><h2 className="text-lg font-bold text-stone-950">{item.name}</h2>{item.bestseller ? <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">Bestseller</span> : null}</div><p className="mt-2 text-sm text-stone-500">{item.category} · {item.preparationTimeMinutes} min</p></div><strong className="whitespace-nowrap text-lg text-stone-950">{formatInr(item.pricePaise)}</strong></div>{item.description ? <p className="mt-4 text-sm leading-6 text-stone-600">{item.description}</p> : null}<div className="mt-5 flex items-center justify-between gap-3">{item.available ? <span className="text-xs font-bold uppercase tracking-wide text-green-700">Available</span> : <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Unavailable</span>}{!item.available ? <Button disabled className="min-h-10 px-4">Unavailable</Button> : cartItem ? <div aria-label={`${item.name} quantity`} className="flex items-center gap-2"><Button variant="ghost" aria-label={`Decrease ${item.name}`} className="min-h-10 px-4" onClick={() => cart.decrease(item.id)}>−</Button><span className="min-w-6 text-center font-bold">{cartItem.quantity}</span><Button variant="ghost" aria-label={`Increase ${item.name}`} className="min-h-10 px-4" disabled={cartItem.quantity >= CART_MAX_QUANTITY} onClick={() => cart.increase(item.id)}>+</Button></div> : <Button className="min-h-10 px-4" onClick={() => add(item)}>Add to cart</Button>}</div></article>; })}</section>
    </div>
  </div>;
}
