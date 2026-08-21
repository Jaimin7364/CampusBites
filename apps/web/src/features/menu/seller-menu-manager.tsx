'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ApiClientError } from '@/services/api-client';
import { createMenuItem, deleteMenuItem, listSellerMenu, reorderMenuItems, setMenuAvailability, setMenuBestseller, updateMenuItem } from '@/services/menu-service';
import { menuCategories, type MenuCategory, type MenuItem, type MenuItemInput } from '@/types/menu';
import { formatInr, paiseToInput, rupeesToPaise } from '@/utils/money';

type FormState = { name: string; description: string; price: string; category: MenuCategory; veg: boolean; bestseller: boolean; preparationTimeMinutes: string; available: boolean };
const emptyForm: FormState = { name: '', description: '', price: '', category: 'Snacks', veg: true, bestseller: false, preparationTimeMinutes: '15', available: true };
const selectClass = 'min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-stone-900 shadow-sm focus:border-brand-orange-500 focus:ring-4 focus:ring-orange-100';

function toInput(form: FormState): MenuItemInput {
  const pricePaise = rupeesToPaise(form.price);
  if (pricePaise === null || pricePaise < 100) throw new Error('Enter a valid price of at least ₹1 with no more than two decimal places.');
  const preparationTimeMinutes = Number(form.preparationTimeMinutes);
  if (!Number.isInteger(preparationTimeMinutes) || preparationTimeMinutes < 1 || preparationTimeMinutes > 180) throw new Error('Preparation time must be between 1 and 180 minutes.');
  return { name: form.name.trim(), description: form.description.trim() || null, pricePaise, category: form.category, veg: form.veg, bestseller: form.bestseller, preparationTimeMinutes, available: form.available };
}

export function SellerMenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [hotel, setHotel] = useState<{ status: string; active: boolean } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'' | MenuCategory>('');
  const [availability, setAvailability] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try { const result = await listSellerMenu(); setItems(result.menuItems); setHotel(result.hotel); setState('ready'); }
    catch (error) { setState(error instanceof ApiClientError && error.code === 'SELLER_HOTEL_REQUIRED' ? 'missing' : 'error'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const locked = !hotel || hotel.status !== 'APPROVED' || !hotel.active;
  const filtered = useMemo(() => items.filter((item) => (!search || `${item.name} ${item.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) && (!category || item.category === category) && (!availability || String(item.available) === availability)), [items, search, category, availability]);
  const filtering = Boolean(search || category || availability);

  function edit(item: MenuItem) {
    setEditingId(item.id); setFeedback(null);
    setForm({ name: item.name, description: item.description ?? '', price: paiseToInput(item.pricePaise), category: item.category, veg: item.veg, bestseller: item.bestseller, preparationTimeMinutes: String(item.preparationTimeMinutes), available: item.available });
    document.getElementById('menu-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(emptyForm); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setFeedback(null);
    try {
      const input = toInput(form);
      const result = editingId ? await updateMenuItem(editingId, input) : await createMenuItem(input);
      setItems((current) => editingId ? current.map((item) => item.id === editingId ? result.menuItem : item) : [...current, result.menuItem]);
      setFeedback({ tone: 'success', message: editingId ? 'Menu item updated.' : 'Menu item added.' }); resetForm();
    } catch (error) { setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'The menu item could not be saved.' }); }
    finally { setBusy(false); }
  }
  async function toggle(item: MenuItem, field: 'available' | 'bestseller') {
    setBusy(true); setFeedback(null);
    try { const result = field === 'available' ? await setMenuAvailability(item.id, !item.available) : await setMenuBestseller(item.id, !item.bestseller); setItems((current) => current.map((value) => value.id === item.id ? result.menuItem : value)); }
    catch (error) { setFeedback({ tone: 'error', message: error instanceof ApiClientError ? error.message : 'The menu item could not be updated.' }); }
    finally { setBusy(false); }
  }
  async function remove(item: MenuItem) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    setBusy(true); setFeedback(null);
    try { await deleteMenuItem(item.id); setItems((current) => current.filter(({ id }) => id !== item.id)); if (editingId === item.id) resetForm(); setFeedback({ tone: 'success', message: 'Menu item deleted.' }); }
    catch (error) { setFeedback({ tone: 'error', message: error instanceof ApiClientError ? error.message : 'The menu item could not be deleted.' }); }
    finally { setBusy(false); }
  }
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction; if (target < 0 || target >= items.length) return;
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next); setBusy(true);
    try { const result = await reorderMenuItems(next.map((item, displayOrder) => ({ id: item.id, displayOrder }))); setItems(result.menuItems); }
    catch { setItems(items); setFeedback({ tone: 'error', message: 'The menu order could not be saved.' }); }
    finally { setBusy(false); }
  }

  if (state === 'loading') return <div role="status" className="mt-8 rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-500">Loading your menu…</div>;
  if (state === 'missing') return <section className="mt-8 rounded-3xl border border-orange-200 bg-white p-8"><h2 className="text-2xl font-bold">Create your outlet first</h2><p className="mt-2 text-stone-600">Your menu belongs to an outlet. Complete outlet onboarding before adding dishes.</p><Link href="/seller" className="mt-5 inline-flex rounded-xl bg-brand-orange-500 px-5 py-3 text-sm font-semibold text-white">Go to outlet setup</Link></section>;
  if (state === 'error') return <div className="mt-8"><Alert>Your menu could not be loaded.</Alert><Button variant="ghost" className="mt-4" onClick={() => void load()}>Try again</Button></div>;

  return <div className="mt-8 space-y-6">
    {locked ? <Alert>Menu changes are unlocked when your outlet is approved and active. Existing items remain visible here.</Alert> : null}
    {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}
    <section id="menu-form" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-stone-950">{editingId ? 'Edit menu item' : 'Add a menu item'}</h2>
      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField name="menu-name" label="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={100} disabled={locked} />
        <FormField name="menu-price" label="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} inputMode="decimal" placeholder="85.00" required disabled={locked} />
        <label className="text-sm font-semibold text-stone-800">Category<select aria-label="Category" className={`${selectClass} mt-2`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })} disabled={locked}>{menuCategories.map((value) => <option key={value}>{value}</option>)}</select></label>
        <FormField name="menu-preparation-time" label="Preparation time (minutes)" type="number" min={1} max={180} value={form.preparationTimeMinutes} onChange={(e) => setForm({ ...form, preparationTimeMinutes: e.target.value })} required disabled={locked} />
        <label className="sm:col-span-2 text-sm font-semibold text-stone-800">Description<textarea aria-label="Description" className={`${selectClass} mt-2 min-h-28 py-3`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} disabled={locked} /></label>
        <div className="sm:col-span-2 flex flex-wrap gap-5">{(['veg', 'bestseller', 'available'] as const).map((field) => <label key={field} className="flex items-center gap-2 text-sm font-semibold capitalize text-stone-700"><input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} disabled={locked} />{field === 'veg' ? 'Vegetarian' : field}</label>)}</div>
        <div className="sm:col-span-2 flex gap-3"><Button type="submit" disabled={locked || busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Add item'}</Button>{editingId ? <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button> : null}</div>
      </form>
    </section>
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-2xl font-bold">Your menu</h2><p className="mt-1 text-sm text-stone-500">{items.length} item{items.length === 1 ? '' : 's'}</p></div><div className="grid gap-3 sm:grid-cols-3"><input aria-label="Search menu" className={selectClass} placeholder="Search dishes" value={search} onChange={(e) => setSearch(e.target.value)} /><select aria-label="Filter category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value as '' | MenuCategory)}><option value="">All categories</option>{menuCategories.map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter availability" className={selectClass} value={availability} onChange={(e) => setAvailability(e.target.value)}><option value="">Any availability</option><option value="true">Available</option><option value="false">Unavailable</option></select></div></div>
      {filtered.length === 0 ? <div className="mt-6 rounded-2xl bg-stone-50 p-8 text-center text-stone-500">{items.length ? 'No items match these filters.' : 'Your menu is empty. Add the first dish above.'}</div> : <div className="mt-6 divide-y divide-stone-200">{filtered.map((item) => { const index = items.findIndex(({ id }) => id === item.id); return <article key={item.id} className="py-5 first:pt-0 last:pb-0"><div className="flex flex-col gap-4 sm:flex-row sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-stone-950">{item.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.veg ? 'Veg' : 'Non-veg'}</span>{item.bestseller ? <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">Bestseller</span> : null}{!item.available ? <span className="rounded-full bg-stone-200 px-2.5 py-1 text-xs font-bold text-stone-700">Unavailable</span> : null}</div><p className="mt-2 text-sm text-stone-600">{item.category} · {item.preparationTimeMinutes} min · <strong>{formatInr(item.pricePaise)}</strong></p>{item.description ? <p className="mt-2 text-sm text-stone-500">{item.description}</p> : null}</div><div className="flex flex-wrap gap-2 sm:justify-end"><Button variant="ghost" className="min-h-9 px-3 py-1" disabled={locked || busy} onClick={() => void toggle(item, 'available')}>{item.available ? 'Mark unavailable' : 'Mark available'}</Button><Button variant="ghost" className="min-h-9 px-3 py-1" disabled={locked || busy} onClick={() => void toggle(item, 'bestseller')}>{item.bestseller ? 'Remove bestseller' : 'Make bestseller'}</Button><Button variant="ghost" className="min-h-9 px-3 py-1" disabled={locked || busy || filtering || index === 0} aria-label={`Move ${item.name} up`} onClick={() => void move(index, -1)}>↑</Button><Button variant="ghost" className="min-h-9 px-3 py-1" disabled={locked || busy || filtering || index === items.length - 1} aria-label={`Move ${item.name} down`} onClick={() => void move(index, 1)}>↓</Button><Button variant="ghost" className="min-h-9 px-3 py-1" disabled={locked || busy} onClick={() => edit(item)}>Edit</Button><Button variant="ghost" className="min-h-9 px-3 py-1 text-red-700" disabled={locked || busy} onClick={() => void remove(item)}>Delete</Button></div></div></article>; })}</div>}
      {filtering ? <p className="mt-4 text-xs text-stone-500">Clear filters to change display order.</p> : null}
    </section>
  </div>;
}
