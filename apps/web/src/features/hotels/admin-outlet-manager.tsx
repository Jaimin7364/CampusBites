'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ApiClientError } from '@/services/api-client';
import { approveHotel, deleteHotel, listAdminHotels, outletImageUrl, rejectHotel, setHotelActive, setHotelFeatured, updateAdminHotel } from '@/services/hotel-service';
import type { Hotel, HotelInput, HotelStatus } from '@/types/hotel';
import { OutletForm } from './outlet-form';

const styles = { PENDING: 'bg-amber-100 text-amber-800', APPROVED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800' };
const message = (error: unknown) => error instanceof ApiClientError ? error.message : 'The action could not be completed.';

export function AdminOutletManager() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | HotelStatus>('PENDING');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [rejecting, setRejecting] = useState<Hotel | null>(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try { const result = await listAdminHotels({ page, search, status: statusFilter }); setHotels(result.hotels); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages); setState('ready'); }
    catch (error) { setFeedback({ tone: 'error', message: message(error) }); setState('error'); }
  }, [page, search, statusFilter]);
  useEffect(() => { void load(); }, [load]);

  async function action(id: string, task: () => Promise<unknown>, success: string) {
    setBusyId(id); setFeedback(null);
    try { await task(); setFeedback({ tone: 'success', message: success }); await load(); }
    catch (error) { setFeedback({ tone: 'error', message: message(error) }); }
    finally { setBusyId(null); }
  }
  async function saveEdit(input: HotelInput) {
    if (!editing) return;
    await updateAdminHotel(editing.id, input);
    setEditing(null); setFeedback({ tone: 'success', message: 'Outlet details updated.' }); await load();
  }
  async function submitRejection(event: FormEvent) {
    event.preventDefault();
    if (!rejecting) return;
    const target = rejecting;
    await action(target.id, () => rejectHotel(target.id, reason), `${target.hotelName} was rejected with feedback.`);
    setRejecting(null); setReason('');
  }
  async function remove(hotel: Hotel) {
    if (!window.confirm(`Delete ${hotel.hotelName}? This cannot be undone.`)) return;
    await action(hotel.id, () => deleteHotel(hotel.id), 'Outlet deleted.');
  }
  function applySearch(event: FormEvent) { event.preventDefault(); setPage(1); setSearch(searchInput); }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={applySearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField label="Search outlets" name="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Outlet, address or seller" className="sm:min-w-80" />
          <label className="text-sm font-semibold text-stone-800">Review status<select aria-label="Review status" value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value as '' | HotelStatus); }} className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base font-normal sm:w-48"><option value="">All statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label>
          <Button type="submit" variant="ghost">Search</Button>
        </form>
      </section>
      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}
      {editing ? <section className="rounded-3xl border border-orange-200 bg-white p-5 sm:p-8"><h2 className="text-2xl font-bold">Edit {editing.hotelName}</h2><p className="mb-6 mt-2 text-sm text-stone-600">Admin edits preserve the current approval status.</p><OutletForm hotel={editing} onSubmit={saveEdit} onCancel={() => setEditing(null)} submitLabel="Save admin changes" /></section> : null}
      {rejecting ? <section aria-labelledby="reject-title" className="rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-6"><h2 id="reject-title" className="text-xl font-bold text-red-900">Reject {rejecting.hotelName}</h2><p className="mt-1 text-sm text-red-700">Give the seller clear instructions for correcting the application.</p><form onSubmit={submitRejection} className="mt-5"><label className="text-sm font-semibold text-red-900">Rejection reason<textarea required minLength={5} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-red-300 bg-white px-4 py-3 font-normal" /></label><div className="mt-4 flex gap-3"><Button type="submit" disabled={busyId === rejecting.id}>Send rejection</Button><Button type="button" variant="ghost" onClick={() => { setRejecting(null); setReason(''); }}>Cancel</Button></div></form></section> : null}
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4 sm:px-6"><h2 className="font-bold">Outlet review queue</h2><p className="mt-1 text-sm text-stone-500">{total} matching outlets</p></div>
        {state === 'loading' ? <div role="status" className="p-10 text-center text-sm text-stone-500">Loading outlet applications…</div> : null}
        {state === 'error' ? <div className="p-10 text-center"><p className="text-stone-600">The review queue could not be loaded.</p><Button className="mt-4" variant="ghost" onClick={() => void load()}>Try again</Button></div> : null}
        {state === 'ready' && hotels.length === 0 ? <div className="p-12 text-center"><p className="font-semibold">No outlet applications found</p><p className="mt-2 text-sm text-stone-500">Try another status or search.</p></div> : null}
        {state === 'ready' ? <div className="divide-y divide-stone-200">{hotels.map((hotel) => <article key={hotel.id} className="grid gap-5 p-5 lg:grid-cols-[10rem_1fr] lg:p-6"><Image unoptimized width={500} height={400} src={outletImageUrl(hotel.hotelImageUrl)} alt={hotel.hotelName} className="h-36 w-full rounded-2xl object-cover lg:h-full" /><div><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-stone-950">{hotel.hotelName}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[hotel.status]}`}>{hotel.status}</span>{!hotel.active ? <span className="rounded-full bg-stone-200 px-2.5 py-1 text-xs font-bold">Inactive</span> : null}{hotel.featured ? <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-brand-orange-600">Featured</span> : null}</div><p className="mt-1 text-sm text-stone-600">{hotel.university.name} · {hotel.address}</p><p className="mt-1 text-xs text-stone-500">Seller: {hotel.seller.sellerName ?? hotel.seller.businessOwnerName} · {hotel.seller.email}</p></div></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600">{hotel.description}</p>{hotel.rejectReason ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"><strong>Feedback:</strong> {hotel.rejectReason}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{hotel.status === 'PENDING' ? <><Button disabled={busyId === hotel.id} onClick={() => void action(hotel.id, () => approveHotel(hotel.id), `${hotel.hotelName} approved.`)}>Approve</Button><Button variant="ghost" disabled={busyId === hotel.id} onClick={() => setRejecting(hotel)} className="text-red-700 ring-red-200">Reject</Button></> : null}{hotel.status === 'APPROVED' ? <Button variant="ghost" disabled={busyId === hotel.id} onClick={() => void action(hotel.id, () => setHotelFeatured(hotel.id, !hotel.featured), hotel.featured ? 'Outlet unfeatured.' : 'Outlet featured.')}>{hotel.featured ? 'Unfeature' : 'Feature'}</Button> : null}<Button variant="ghost" disabled={busyId === hotel.id} onClick={() => setEditing(hotel)}>Edit</Button><Button variant="ghost" disabled={busyId === hotel.id} onClick={() => void action(hotel.id, () => setHotelActive(hotel.id, !hotel.active), hotel.active ? 'Outlet deactivated.' : 'Outlet activated.')}>{hotel.active ? 'Deactivate' : 'Activate'}</Button><Button variant="ghost" disabled={busyId === hotel.id} onClick={() => void remove(hotel)} className="text-red-700 ring-red-200">Delete</Button></div></div></article>)}</div> : null}
        {state === 'ready' && totalPages > 1 ? <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4"><Button variant="ghost" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-stone-600">Page {page} of {totalPages}</span><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div> : null}
      </section>
    </div>
  );
}
