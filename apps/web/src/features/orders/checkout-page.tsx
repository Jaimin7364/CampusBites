'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import { useCart } from '@/features/cart/cart-context';
import { ApiClientError } from '@/services/api-client';
import { previewCart } from '@/services/cart-service';
import { createOrder } from '@/services/order-service';
import type { CartPreview } from '@/types/cart';
import type { DeliveryType, Order, OrderType } from '@/types/order';
import { formatInr } from '@/utils/money';
import { OrderPriceSummary } from './order-summary';

function checkoutKey() { return `web-checkout-${crypto.randomUUID().replaceAll('-', '')}`; }

export function CheckoutPage() {
  const cart = useCart(); const { user } = useAuth();
  const [preview, setPreview] = useState<CartPreview | null>(null); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [orderType, setOrderType] = useState<OrderType>('INSTANT');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('PICKUP'); const [scheduledAt, setScheduledAt] = useState('');
  const [address, setAddress] = useState(''); const [submitting, setSubmitting] = useState(false); const [created, setCreated] = useState<Order | null>(null);
  const key = useRef(''); if (!key.current && typeof crypto !== 'undefined') key.current = checkoutKey();
  const loadPreview = useCallback(async () => { if (!cart.hydrated || !cart.items.length) { setLoading(false); return; } setLoading(true); setError(''); try { setPreview(await previewCart(cart.items)); } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Checkout could not be loaded.'); } finally { setLoading(false); } }, [cart.hydrated, cart.items]);
  useEffect(() => { void loadPreview(); }, [loadPreview]);

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!preview?.orderable || submitting) return;
    if (orderType === 'PREORDER' && (!scheduledAt || new Date(scheduledAt) <= new Date())) { setError('Choose a future date and time for your pre-order.'); return; }
    if (deliveryType === 'DELIVERY' && address.trim().length < 5) { setError('Enter a complete delivery address.'); return; }
    setSubmitting(true); setError('');
    try {
      const finalPreview = await previewCart(cart.items); setPreview(finalPreview);
      if (!finalPreview.orderable) { setError('Your cart changed. Review unavailable items before ordering.'); return; }
      const result = await createOrder({ items: cart.items.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })), orderType, deliveryType, ...(orderType === 'PREORDER' ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}), ...(deliveryType === 'DELIVERY' ? { deliveryAddress: address.trim() } : {}) }, key.current);
      setCreated(result.order); cart.clear();
    } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Your order could not be placed. Please try again.'); }
    finally { setSubmitting(false); }
  }

  if (created) return <section className="mt-8 rounded-3xl border border-green-200 bg-white p-6 text-center shadow-sm sm:p-10"><span className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-2xl text-green-700">✓</span><p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-green-700">Order confirmed</p><h2 className="mt-2 text-3xl font-bold">{created.orderNumber}</h2><p className="mt-3 text-stone-600">{created.hotelName} received your cash {created.deliveryType === 'PICKUP' ? 'pickup' : 'delivery'} order.</p><p className="mt-2 text-xl font-bold">{formatInr(created.totalAmountPaise)}</p><Link href={`/user/orders/${created.id}`} className="mt-6 inline-flex rounded-xl bg-brand-orange-500 px-5 py-3 font-semibold text-white">View order details</Link></section>;
  if (!cart.hydrated || loading) return <div role="status" className="mt-8 rounded-3xl border bg-white p-10 text-center text-stone-500">Preparing secure checkout…</div>;
  if (!cart.items.length) return <section className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center"><h2 className="text-2xl font-bold">Your cart is empty</h2><Link href="/user" className="mt-5 inline-flex rounded-xl bg-brand-orange-500 px-5 py-3 font-semibold text-white">Explore outlets</Link></section>;
  const totals = preview?.totals ?? { itemsTotalPaise: cart.itemsTotalPaise, deliveryChargePaise: 0, platformFeePaise: 0, grandTotalPaise: cart.itemsTotalPaise };
  return <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]" noValidate><div className="space-y-6">
    {error ? <Alert>{error}</Alert> : null}{preview && !preview.orderable ? <Alert>Your cart contains unavailable items. Return to the cart to update it.</Alert> : null}
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">When do you want it?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{(['INSTANT', 'PREORDER'] as const).map((value) => <label key={value} className={`cursor-pointer rounded-2xl border p-4 ${orderType === value ? 'border-orange-400 bg-orange-50' : 'border-stone-200'}`}><input type="radio" name="orderType" value={value} checked={orderType === value} onChange={() => setOrderType(value)} className="mr-3 accent-orange-500"/><strong>{value === 'INSTANT' ? 'Order now' : 'Pre-order'}</strong><span className="mt-1 block pl-7 text-sm text-stone-500">{value === 'INSTANT' ? 'Prepare as soon as possible' : 'Choose a future time'}</span></label>)}</div>{orderType === 'PREORDER' ? <label className="mt-5 block text-sm font-semibold">Pickup/delivery date and time<input aria-label="Pickup/delivery date and time" type="datetime-local" required value={scheduledAt} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} onChange={(event) => setScheduledAt(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base font-normal" /></label> : null}</section>
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">How will you receive it?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{(['PICKUP', 'DELIVERY'] as const).map((value) => <label key={value} className={`cursor-pointer rounded-2xl border p-4 ${deliveryType === value ? 'border-orange-400 bg-orange-50' : 'border-stone-200'}`}><input type="radio" name="deliveryType" value={value} checked={deliveryType === value} onChange={() => setDeliveryType(value)} className="mr-3 accent-orange-500"/><strong>{value === 'PICKUP' ? 'Pick up at outlet' : 'Campus delivery'}</strong></label>)}</div>{deliveryType === 'DELIVERY' ? <label className="mt-5 block text-sm font-semibold">Delivery address<textarea aria-label="Delivery address" required minLength={5} maxLength={500} rows={4} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Hostel, building, room and nearby landmark" className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-normal" /></label> : null}</section>
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Contact and payment</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-stone-500">Student</p><p className="mt-1 font-semibold">{user?.fullName}</p><p className="text-sm text-stone-600">{user?.phone}</p></div><div><p className="text-xs uppercase tracking-wide text-stone-500">Payment</p><p className="mt-1 font-semibold">Cash</p><p className="text-sm text-stone-600">Pay when you receive your order</p></div></div></section>
  </div><aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-wide text-brand-green-500">{preview?.hotel.hotelName ?? cart.items[0]!.hotelName}</p><h2 className="mt-2 text-xl font-bold">Final price summary</h2><OrderPriceSummary totals={totals} /><Button type="submit" className="mt-6 w-full" disabled={submitting || !preview?.orderable}>{submitting ? 'Placing order…' : `Place cash order · ${formatInr(totals.grandTotalPaise)}`}</Button><Link href="/user/cart" className="mt-3 block text-center text-sm font-semibold text-stone-600">Back to cart</Link><p className="mt-4 text-xs leading-5 text-stone-500">Prices and availability are checked again immediately before submission.</p></aside></form>;
}
