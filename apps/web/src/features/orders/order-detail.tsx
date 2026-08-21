'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/services/api-client';
import { getOrder } from '@/services/order-service';
import type { Order } from '@/types/order';
import { formatInr } from '@/utils/money';
import { OrderPriceSummary } from './order-summary';

export function OrderDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null); const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading'); const [message, setMessage] = useState('');
  const load = useCallback(async () => { setStatus('loading'); try { const result = await getOrder(id); setOrder(result.order); setStatus('ready'); } catch (error) { setMessage(error instanceof ApiClientError ? error.message : 'Order details could not be loaded.'); setStatus('error'); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (status === 'loading') return <div role="status" className="mt-8 rounded-3xl border bg-white p-10 text-center text-stone-500">Loading your order…</div>;
  if (status === 'error' || !order) return <div className="mt-8"><Alert>{message}</Alert><Button variant="ghost" className="mt-4" onClick={() => void load()}>Try again</Button></div>;
  const scheduled = order.scheduledAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.scheduledAt)) : null;
  return <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-6"><section className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Order number</p><h2 className="mt-2 text-3xl font-bold">{order.orderNumber}</h2><p className="mt-2 text-stone-600">Placed {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</p></div><span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">{order.status}</span></div></section>
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Items from {order.hotelName}</h2><div className="mt-5 divide-y divide-stone-200">{order.items.map((item) => <article key={item.id} className="flex justify-between gap-4 py-4 first:pt-0"><div><h3 className="font-semibold">{item.quantity} × {item.itemName}</h3><p className="mt-1 text-sm text-stone-500">{formatInr(item.pricePaise)} each · {item.veg ? 'Vegetarian' : 'Non-vegetarian'}</p></div><strong>{formatInr(item.itemTotalPaise)}</strong></article>)}</div></section>
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Receiving details</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-wide text-stone-500">Order timing</dt><dd className="mt-1 font-semibold">{order.orderType === 'INSTANT' ? 'As soon as possible' : scheduled}</dd></div><div><dt className="text-xs uppercase tracking-wide text-stone-500">Receiving method</dt><dd className="mt-1 font-semibold">{order.deliveryType === 'PICKUP' ? 'Pick up at outlet' : 'Campus delivery'}</dd></div>{order.deliveryAddress ? <div className="sm:col-span-2"><dt className="text-xs uppercase tracking-wide text-stone-500">Delivery address</dt><dd className="mt-1">{order.deliveryAddress}</dd></div> : null}<div><dt className="text-xs uppercase tracking-wide text-stone-500">Contact</dt><dd className="mt-1">{order.userName}<br />{order.userPhone}</dd></div><div><dt className="text-xs uppercase tracking-wide text-stone-500">Payment</dt><dd className="mt-1">Cash · {order.paymentStatus}</dd></div></dl></section></div>
    <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-24"><h2 className="text-xl font-bold">Order total</h2><OrderPriceSummary totals={{ itemsTotalPaise: order.subtotalPaise, deliveryChargePaise: order.deliveryChargePaise, platformFeePaise: order.platformFeePaise, grandTotalPaise: order.totalAmountPaise }} /><Link href="/user" className="mt-6 block rounded-xl border border-stone-200 px-5 py-3 text-center text-sm font-semibold">Continue browsing</Link></aside></div>;
}
