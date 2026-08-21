'use client';
import Link from 'next/link'; import { useCallback, useEffect, useState } from 'react'; import { Alert } from '@/components/ui/alert'; import { Button } from '@/components/ui/button'; import { getAdminDashboard } from '@/services/admin-service'; import type { AdminDashboard } from '@/types/admin'; import { formatInr } from '@/utils/money';
const metricLinks = [
  ['Universities', 'universities', '/admin/universities'], ['Students', 'users', '/admin/users'], ['Sellers', 'sellers', '/admin/sellers'], ['All outlets', 'hotels', '/admin/outlets'], ['Pending approvals', 'pendingHotels', '/admin/outlets'], ['Approved outlets', 'approvedHotels', '/admin/outlets'], ['Featured outlets', 'featuredHotels', '/admin/outlets'], ['Total orders', 'orders', '/admin/orders'], ['Pending orders', 'pendingOrders', '/admin/orders'], ['Completed orders', 'completedOrders', '/admin/orders'],
] as const;
export function AdminDashboardView() {
  const [data, setData] = useState<AdminDashboard | null>(null); const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const load = useCallback(async () => { setState('loading'); try { setData(await getAdminDashboard()); setState('ready'); } catch { setState('error'); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (state === 'loading') return <div role="status" className="mt-8 rounded-3xl border border-stone-200 bg-white p-12 text-center text-stone-500">Loading platform statistics…</div>;
  if (state === 'error' || !data) return <div className="mt-8"><Alert tone="error">Platform statistics could not be loaded.</Alert><Button variant="ghost" className="mt-4" onClick={() => void load()}>Try again</Button></div>;
  return <div className="mt-8 space-y-6"><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metricLinks.map(([label, key, href]) => <Link href={href} key={key} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-300"><p className="text-sm font-semibold text-stone-500">{label}</p><p className="mt-3 text-3xl font-bold text-stone-950">{data[key]}</p></Link>)}</section><section className="rounded-3xl bg-stone-950 p-6 text-white sm:p-8"><p className="text-sm font-semibold text-orange-300">Completed paid order value</p><p className="mt-3 text-4xl font-bold">{formatInr(data.totalOrderValuePaise)}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">{data.totalOrderValueDefinition}</p></section></div>;
}
