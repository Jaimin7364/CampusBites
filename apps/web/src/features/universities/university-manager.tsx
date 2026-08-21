'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ApiClientError } from '@/services/api-client';
import {
  createUniversity,
  deleteUniversity,
  listAdminUniversities,
  setUniversityStatus,
  updateUniversity,
} from '@/services/university-service';
import type { University } from '@/types/university';

type FormState = { name: string; city: string; state: string };
const emptyForm: FormState = { name: '', city: '', state: '' };

function errorMessage(error: unknown) {
  return error instanceof ApiClientError ? error.message : 'Something went wrong. Please try again.';
}

export function UniversityManager() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const [editing, setEditing] = useState<University | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await listAdminUniversities({ page, search, active: activeFilter });
      setUniversities(result.universities);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      setStatus('ready');
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error) });
      setStatus('error');
    }
  }, [activeFilter, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
    setFeedback(null);
  }

  function openEdit(university: University) {
    setEditing(university);
    setForm({ name: university.name, city: university.city, state: university.state ?? '' });
    setFormOpen(true);
    setFeedback(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const input = { name: form.name, city: form.city, state: form.state.trim() || null };
    try {
      if (editing) await updateUniversity(editing.id, input);
      else await createUniversity({ ...input, active: true });
      setFeedback({ tone: 'success', message: editing ? 'University updated successfully.' : 'University created successfully.' });
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(university: University) {
    setBusyId(university.id);
    setFeedback(null);
    try {
      await setUniversityStatus(university.id, !university.active);
      setFeedback({ tone: 'success', message: `${university.name} ${university.active ? 'deactivated' : 'activated'}.` });
      await load();
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(university: University) {
    if (!window.confirm(`Delete ${university.name}? This cannot be undone.`)) return;
    setBusyId(university.id);
    setFeedback(null);
    try {
      await deleteUniversity(university.id);
      setFeedback({ tone: 'success', message: 'University deleted successfully.' });
      if (universities.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (error) {
      setFeedback({ tone: 'error', message: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <form onSubmit={applySearch} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <FormField label="Search universities" name="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Name or city" className="sm:min-w-72" />
            <label className="text-sm font-semibold text-stone-800">Status
              <select aria-label="Status" value={activeFilter} onChange={(event) => { setPage(1); setActiveFilter(event.target.value as '' | 'true' | 'false'); }} className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base font-normal sm:w-44">
                <option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option>
              </select>
            </label>
            <Button type="submit" variant="ghost">Search</Button>
          </form>
          <Button onClick={openCreate}>Add university</Button>
        </div>
      </section>

      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}

      {formOpen ? (
        <section aria-labelledby="university-form-title" className="rounded-3xl border border-orange-200 bg-orange-50/60 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><h2 id="university-form-title" className="text-xl font-bold text-stone-950">{editing ? 'Edit university' : 'Add university'}</h2><p className="mt-1 text-sm text-stone-600">University name and city must form a unique combination.</p></div><Button variant="ghost" onClick={() => setFormOpen(false)}>Close</Button></div>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-3">
            <FormField required label="University name" name="name" minLength={2} maxLength={191} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <FormField required label="City" name="city" minLength={2} maxLength={120} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
            <FormField label="State (optional)" name="state" minLength={2} maxLength={120} value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
            <div className="flex gap-3 md:col-span-3"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create university'}</Button><Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button></div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-stone-950">Universities</h2><p className="mt-1 text-sm text-stone-500">{total} total</p></div></div>
        {status === 'loading' ? <div role="status" className="p-8 text-center text-sm text-stone-500">Loading universities…</div> : null}
        {status === 'error' ? <div className="p-8 text-center"><p className="text-sm text-stone-600">The university list could not be loaded.</p><Button variant="ghost" className="mt-4" onClick={() => void load()}>Try again</Button></div> : null}
        {status === 'ready' && universities.length === 0 ? <div className="p-10 text-center"><p className="font-semibold text-stone-900">No universities found</p><p className="mt-2 text-sm text-stone-500">Change the filters or add the first university.</p></div> : null}
        {status === 'ready' && universities.length > 0 ? (
          <div className="divide-y divide-stone-200">
            {universities.map((university) => (
              <article key={university.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-stone-950">{university.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${university.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{university.active ? 'Active' : 'Inactive'}</span></div><p className="mt-1 text-sm text-stone-600">{university.city}{university.state ? `, ${university.state}` : ''}</p></div>
                <div className="flex flex-wrap gap-2"><Button variant="ghost" disabled={busyId === university.id} onClick={() => openEdit(university)}>Edit</Button><Button variant="ghost" disabled={busyId === university.id} onClick={() => void toggleStatus(university)}>{university.active ? 'Deactivate' : 'Activate'}</Button><Button variant="ghost" disabled={busyId === university.id} onClick={() => void remove(university)} className="text-red-700 ring-red-200 hover:bg-red-50">Delete</Button></div>
              </article>
            ))}
          </div>
        ) : null}
        {status === 'ready' && totalPages > 1 ? <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 text-sm sm:px-6"><Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="text-stone-600">Page {page} of {totalPages}</span><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div> : null}
      </section>
    </div>
  );
}
