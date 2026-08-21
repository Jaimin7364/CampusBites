'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSellerOrderSummary } from '@/services/order-service';
import type { SellerOrderSummary } from '@/types/order';
import { formatInr } from '@/utils/money';
export function SellerOrderOverview() {
  const [summary, setSummary] = useState<SellerOrderSummary | null>(null);
  useEffect(() => { let active = true; getSellerOrderSummary().then((result) => { if (active) setSummary(result); }).catch(() => undefined); return () => { active = false; }; }, []);
  return <section className="mt-8 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-50 to-green-50 p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-brand-orange-600">Today&apos;s orders</p>{summary ? <div className="mt-3 flex flex-wrap gap-6"><div><strong className="text-2xl">{summary.statusCounts.PENDING}</strong><span className="ml-2 text-sm text-stone-600">new</span></div><div><strong className="text-2xl">{summary.statusCounts.READY}</strong><span className="ml-2 text-sm text-stone-600">ready</span></div><div><strong className="text-2xl">{formatInr(summary.todaySalesPaise)}</strong><span className="ml-2 text-sm text-stone-600">paid sales</span></div></div> : <p role="status" className="mt-2 text-sm text-stone-500">Loading order summary…</p>}</div><Link href="/seller/orders" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-orange-500 px-5 py-2.5 text-sm font-semibold text-white">Manage orders</Link></div></section>;
}
