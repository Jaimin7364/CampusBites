import Link from 'next/link';
import type { PublicHotel } from '@/types/hotel';
import { OutletImage } from './outlet-image';

export function VendorCard({ hotel }: { hotel: PublicHotel }) {
  return <Link href={`/hotels/${hotel.id}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
    <OutletImage path={hotel.hotelImageUrl} alt={hotel.hotelName} className="h-48 w-full object-cover" fallbackClassName="h-48 text-3xl" />
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-bold text-stone-950 group-hover:text-brand-orange-600">{hotel.hotelName}</h3><p className="mt-1 text-sm text-stone-500">{hotel.address}</p></div>{hotel.featured ? <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">Featured</span> : null}</div><div className="mt-5 flex items-center justify-between text-sm"><span>{hotel.openTime}–{hotel.closeTime}</span><span className={`font-bold ${hotel.isOpen ? 'text-green-700' : 'text-stone-500'}`}>{hotel.isOpen ? 'Open now' : 'Closed'}</span></div></div>
  </Link>;
}
