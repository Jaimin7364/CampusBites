'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/services/api-client';
import { createSellerHotel, getSellerHotel, outletImageUrl, resubmitSellerHotel, updateSellerHotel } from '@/services/hotel-service';
import type { Hotel, HotelInput } from '@/types/hotel';
import { OutletForm } from './outlet-form';

const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border-green-200 bg-green-50 text-green-800',
  REJECTED: 'border-red-200 bg-red-50 text-red-800',
};

export function SellerOutletWorkspace() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try { const result = await getSellerHotel(); setHotel(result.hotel); setStatus('ready'); }
    catch { setStatus('error'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function create(input: HotelInput) {
    const result = await createSellerHotel(input);
    setHotel(result.hotel); setEditing(false);
    setFeedback({ tone: 'success', message: 'Your outlet was submitted for admin review.' });
  }
  async function update(input: HotelInput) {
    if (!hotel) return;
    const result = await updateSellerHotel(hotel.id, input);
    setHotel(result.hotel); setEditing(false);
    setFeedback({ tone: 'success', message: result.hotel.status === 'PENDING' ? 'Outlet updated and sent for admin review.' : 'Outlet details updated. Resubmit when ready.' });
  }
  async function resubmit() {
    if (!hotel) return;
    setBusy(true); setFeedback(null);
    try { const result = await resubmitSellerHotel(hotel.id); setHotel(result.hotel); setFeedback({ tone: 'success', message: 'Your outlet was resubmitted for review.' }); }
    catch (error) { setFeedback({ tone: 'error', message: error instanceof ApiClientError ? error.message : 'The outlet could not be resubmitted.' }); }
    finally { setBusy(false); }
  }

  if (status === 'loading') return <div role="status" className="mt-8 rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-500">Loading your outlet…</div>;
  if (status === 'error') return <div className="mt-8 rounded-3xl border border-red-200 bg-white p-6"><Alert>Your outlet could not be loaded.</Alert><Button variant="ghost" className="mt-4" onClick={() => void load()}>Try again</Button></div>;

  if (!hotel) return (
    <section className="mt-8 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-orange-600">Outlet onboarding</p>
      <h2 className="mt-2 text-2xl font-bold text-stone-950">Add your food outlet</h2>
      <p className="mb-7 mt-2 text-sm leading-6 text-stone-600">Submit complete business information. An administrator will review it before it appears to students.</p>
      <OutletForm onSubmit={create} />
    </section>
  );

  if (editing) return (
    <section className="mt-8 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-stone-950">Edit outlet</h2>
      {hotel.status === 'APPROVED' ? <div className="my-5"><Alert>An approved outlet returns to pending review after seller edits.</Alert></div> : <div className="mb-6" />}
      <OutletForm hotel={hotel} onSubmit={update} onCancel={() => setEditing(false)} submitLabel="Save outlet changes" />
    </section>
  );

  return (
    <div className="mt-8 space-y-5">
      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <Image unoptimized width={1200} height={600} src={outletImageUrl(hotel.hotelImageUrl)} alt={hotel.hotelName} className="h-56 w-full object-cover sm:h-72" />
        <div className="p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold text-stone-950">{hotel.hotelName}</h2>{hotel.featured ? <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-brand-orange-600">Featured</span> : null}</div><p className="mt-2 text-sm text-stone-600">{hotel.university.name} · {hotel.university.city}</p></div>
            <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[hotel.status]}`}>{hotel.status === 'PENDING' ? 'Waiting for approval' : hotel.status === 'APPROVED' ? 'Approved' : 'Changes requested'}</span>
          </div>
          {hotel.status === 'PENDING' ? <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Your outlet is waiting for admin approval. You can still correct its details while it is being reviewed.</p> : null}
          {hotel.status === 'REJECTED' ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-sm font-bold text-red-800">Admin feedback</p><p className="mt-1 text-sm leading-6 text-red-700">{hotel.rejectReason}</p></div> : null}
          {!hotel.active ? <div className="mt-5"><Alert>This outlet has been deactivated by an administrator.</Alert></div> : null}
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-semibold text-stone-500">Address</dt><dd className="mt-1 text-stone-900">{hotel.address}</dd></div><div><dt className="font-semibold text-stone-500">Hours</dt><dd className="mt-1 text-stone-900">{hotel.openTime}–{hotel.closeTime}</dd></div><div><dt className="font-semibold text-stone-500">Phone</dt><dd className="mt-1 text-stone-900">{hotel.phone}</dd></div><div><dt className="font-semibold text-stone-500">WhatsApp</dt><dd className="mt-1 text-stone-900">{hotel.whatsappNumber}</dd></div></dl>
          <p className="mt-6 text-sm leading-7 text-stone-600">{hotel.description}</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => setEditing(true)}>Edit outlet</Button>{hotel.status === 'REJECTED' ? <Button variant="secondary" disabled={busy} onClick={() => void resubmit()}>{busy ? 'Resubmitting…' : 'Resubmit for approval'}</Button> : null}</div>
        </div>
      </section>
    </div>
  );
}
