'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { PublicMenu } from '@/features/menu/public-menu';
import { getPublicHotel } from '@/services/hotel-service';
import type { PublicHotel } from '@/types/hotel';
import { phoneHref, whatsappHref } from '@/utils/contact';
import { OutletImage } from './outlet-image';

export function VendorDetail({ hotelId }: { hotelId: string }) {
  const [hotel, setHotel] = useState<PublicHotel | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const load = useCallback(async () => { setStatus('loading'); try { const result = await getPublicHotel(hotelId); setHotel(result.hotel); setStatus('ready'); } catch { setStatus('error'); } }, [hotelId]);
  useEffect(() => { void load(); }, [load]);
  if (status === 'loading') return <main className="grid min-h-screen place-items-center"><p role="status">Loading outlet…</p></main>;
  if (status === 'error' || !hotel) return <main className="mx-auto max-w-3xl px-4 py-20"><Alert>This approved outlet could not be found.</Alert><Link href="/" className="mt-5 inline-flex rounded-xl border border-stone-200 px-5 py-3 font-semibold">Back to outlets</Link></main>;
  const call = phoneHref(hotel.phone); const whatsapp = whatsappHref(hotel.whatsappNumber);
  return <main className="min-h-screen bg-stone-50"><header className="bg-white"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><Link href="/" className="text-sm font-semibold text-brand-orange-600">← All campus outlets</Link></div><OutletImage path={hotel.hotelImageUrl} alt={hotel.hotelName} className="max-h-96 w-full object-cover" fallbackClassName="h-72 text-6xl" /><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-500">{hotel.university.name}</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-4xl font-bold text-stone-950">{hotel.hotelName}</h1>{hotel.featured ? <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">Featured</span> : null}</div><p className="mt-3 max-w-3xl leading-7 text-stone-600">{hotel.description}</p></div><span className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${hotel.isOpen ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'}`}>{hotel.isOpen ? 'Open now' : 'Closed'}</span></div><div className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><p className="font-semibold text-stone-500">Address</p><p className="mt-1 text-stone-900">{hotel.address}</p></div><div><p className="font-semibold text-stone-500">Hours</p><p className="mt-1 text-stone-900">{hotel.openTime}–{hotel.closeTime}</p></div></div><div className="mt-6 flex flex-wrap gap-3">{call ? <a href={call} className="rounded-xl bg-brand-orange-500 px-5 py-3 text-sm font-semibold text-white">Call outlet</a> : null}{whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-brand-green-500 px-5 py-3 text-sm font-semibold text-white">WhatsApp</a> : null}<Link href={`/hotels/${hotel.id}/menu`} className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold">Open menu only</Link></div></div></header><div className="mx-auto max-w-6xl px-4 sm:px-6"><PublicMenu hotelId={hotel.id} embedded /></div></main>;
}
