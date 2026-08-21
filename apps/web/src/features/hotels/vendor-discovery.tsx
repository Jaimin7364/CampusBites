'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { listPublicHotels, type PublicHotelFilters } from '@/services/hotel-service';
import type { PublicHotel } from '@/types/hotel';
import type { University } from '@/types/university';
import { CampusSelector } from '@/features/universities/campus-selector';
import { VendorCard } from './vendor-card';

export function VendorDiscovery() {
  const [campus, setCampus] = useState<University | null>(null);
  const [items, setItems] = useState<PublicHotel[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<Omit<PublicHotelFilters, 'universityId'>>({ page: 1 });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const selected = useCallback((value: University | null) => { setCampus(value); setFilters({ page: 1 }); setItems([]); }, []);
  const load = useCallback(async () => { if (!campus) return; setStatus('loading'); try { const result = await listPublicHotels({ universityId: campus.id, ...filters }); setItems(result.hotels); setPagination(result.pagination); setStatus('ready'); } catch { setStatus('error'); } }, [campus, filters]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), filters.search ? 250 : 0); return () => clearTimeout(timer); }, [load, filters.search]);
  function change(patch: Partial<typeof filters>) { setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 })); }

  return <div className="space-y-8"><CampusSelector onSelected={selected} />{campus ? <section aria-labelledby="vendor-heading"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-500">Food near you</p><h2 id="vendor-heading" className="mt-2 text-3xl font-bold text-stone-950">Explore {campus.name}</h2></div><div className="grid gap-3 sm:grid-cols-3"><input aria-label="Search outlets" className="min-h-11 rounded-xl border border-stone-300 bg-white px-4" placeholder="Search outlet name" value={filters.search ?? ''} onChange={(e) => change({ search: e.target.value })} /><label className="flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold"><input type="checkbox" checked={filters.featured === true} onChange={(e) => change({ featured: e.target.checked ? true : undefined })} />Featured</label><label className="flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold"><input type="checkbox" checked={filters.openNow === true} onChange={(e) => change({ openNow: e.target.checked ? true : undefined })} />Open now</label></div></div>
      {status === 'loading' ? <p role="status" className="mt-6 text-stone-500">Finding campus food…</p> : null}{status === 'error' ? <div className="mt-6"><Alert>Outlets could not be loaded.</Alert><Button variant="ghost" className="mt-3" onClick={() => void load()}>Try again</Button></div> : null}{status === 'ready' && items.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center"><h3 className="text-xl font-bold">No outlets found</h3><p className="mt-2 text-stone-500">Try clearing the search or filters.</p></div> : null}<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((hotel) => <VendorCard key={hotel.id} hotel={hotel} />)}</div>{pagination.totalPages > 1 ? <div className="mt-8 flex items-center justify-center gap-3"><Button variant="ghost" disabled={pagination.page <= 1 || status === 'loading'} onClick={() => change({ page: pagination.page - 1 })}>Previous</Button><span className="text-sm text-stone-600">Page {pagination.page} of {pagination.totalPages}</span><Button variant="ghost" disabled={pagination.page >= pagination.totalPages || status === 'loading'} onClick={() => change({ page: pagination.page + 1 })}>Next</Button></div> : null}
    </section> : null}</div>;
}
