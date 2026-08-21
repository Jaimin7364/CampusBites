'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ApiClientError } from '@/services/api-client';
import { outletImageUrl, uploadOutletImage } from '@/services/hotel-service';
import { listActiveUniversities } from '@/services/university-service';
import type { Hotel, HotelInput } from '@/types/hotel';
import type { University } from '@/types/university';

const initialForm = (hotel?: Hotel): HotelInput => ({
  universityId: hotel?.universityId ?? '', hotelName: hotel?.hotelName ?? '', address: hotel?.address ?? '',
  phone: hotel?.phone ?? '', whatsappNumber: hotel?.whatsappNumber ?? '', description: hotel?.description ?? '',
  hotelImageUrl: hotel?.hotelImageUrl ?? '', menuImageUrl: hotel?.menuImageUrl ?? null,
  openTime: hotel?.openTime ?? '08:00', closeTime: hotel?.closeTime ?? '21:00',
});

export function OutletForm({ hotel, onSubmit, onCancel, submitLabel = 'Submit for approval' }: {
  hotel?: Hotel;
  onSubmit: (input: HotelInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<HotelInput>(() => initialForm(hotel));
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listActiveUniversities()
      .then((result) => { if (active) setUniversities(result.universities); })
      .catch(() => { if (active) setError('Active campuses could not be loaded.'); })
      .finally(() => { if (active) setLoadingCampuses(false); });
    return () => { active = false; };
  }, []);

  async function upload(file?: File) {
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Use a JPEG, PNG, or WebP image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be 5 MB or smaller.'); return; }
    setUploading(true);
    try {
      const result = await uploadOutletImage(file);
      setForm((current) => ({ ...current, hotelImageUrl: result.url }));
    } catch (uploadError) {
      setError(uploadError instanceof ApiClientError ? uploadError.message : 'Image upload failed.');
    } finally { setUploading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.hotelImageUrl) { setError('Upload a main outlet image before submitting.'); return; }
    setSaving(true); setError('');
    try { await onSubmit(form); }
    catch (submitError) { setError(submitError instanceof ApiClientError ? submitError.message : 'The outlet could not be saved.'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      {error ? <div className="md:col-span-2"><Alert>{error}</Alert></div> : null}
      <label className="text-sm font-semibold text-stone-800">University
        <select required disabled={loadingCampuses} value={form.universityId} onChange={(event) => setForm((current) => ({ ...current, universityId: event.target.value }))} className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base font-normal">
          <option value="">{loadingCampuses ? 'Loading campuses…' : 'Select a university'}</option>
          {universities.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.city}</option>)}
        </select>
      </label>
      <FormField required label="Outlet name" name="hotelName" minLength={2} maxLength={191} value={form.hotelName} onChange={(event) => setForm((current) => ({ ...current, hotelName: event.target.value }))} />
      <div className="md:col-span-2"><FormField required label="Address" name="address" minLength={5} maxLength={500} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} /></div>
      <FormField required label="Phone number" name="phone" type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} hint="Indian mobile number, with or without +91" />
      <FormField required label="WhatsApp number" name="whatsappNumber" type="tel" value={form.whatsappNumber} onChange={(event) => setForm((current) => ({ ...current, whatsappNumber: event.target.value }))} />
      <label className="text-sm font-semibold text-stone-800 md:col-span-2">Description
        <textarea required minLength={10} maxLength={2000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-normal shadow-sm focus:border-brand-orange-500 focus:ring-4 focus:ring-orange-100" />
      </label>
      <FormField required label="Opening time" name="openTime" type="time" value={form.openTime} onChange={(event) => setForm((current) => ({ ...current, openTime: event.target.value }))} />
      <FormField required label="Closing time" name="closeTime" type="time" value={form.closeTime} onChange={(event) => setForm((current) => ({ ...current, closeTime: event.target.value }))} />
      <div className="md:col-span-2">
        <label htmlFor="hotel-image" className="mb-2 block text-sm font-semibold text-stone-800">Main outlet image</label>
        <input id="hotel-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0])} className="block w-full rounded-xl border border-stone-300 bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-brand-orange-600" />
        <p className="mt-1.5 text-xs text-stone-500">JPEG, PNG or WebP, maximum 5 MB.</p>
        {uploading ? <p role="status" className="mt-3 text-sm font-semibold text-brand-orange-600">Uploading image…</p> : null}
        {form.hotelImageUrl ? <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100"><Image unoptimized width={1200} height={600} src={outletImageUrl(form.hotelImageUrl)} alt="Outlet preview" className="h-52 w-full object-cover" /></div> : null}
      </div>
      <div className="flex flex-wrap gap-3 md:col-span-2"><Button type="submit" disabled={saving || uploading || loadingCampuses}>{saving ? 'Saving…' : submitLabel}</Button>{onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}</div>
    </form>
  );
}
