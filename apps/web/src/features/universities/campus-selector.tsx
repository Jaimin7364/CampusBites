'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { listActiveUniversities } from '@/services/university-service';
import type { University } from '@/types/university';

export const SELECTED_CAMPUS_KEY = 'campusbites.selectedUniversityId';

export function CampusSelector({ compact = false, onSelected }: { compact?: boolean; onSelected?: (campus: University | null) => void }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selected, setSelected] = useState<University | null>(null);
  const [choice, setChoice] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await listActiveUniversities();
      setUniversities(result.universities);
      const savedId = window.localStorage.getItem(SELECTED_CAMPUS_KEY);
      const savedCampus = result.universities.find((item) => item.id === savedId) ?? null;
      setSelected(savedCampus);
      onSelected?.(savedCampus);
      setChoice(savedCampus?.id ?? '');
      if (savedId && !savedCampus) {
        window.localStorage.removeItem(SELECTED_CAMPUS_KEY);
        setNotice('Your previous campus is no longer available. Please choose another campus.');
      }
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [onSelected]);

  useEffect(() => {
    void load();
  }, [load]);

  function saveCampus() {
    const campus = universities.find((item) => item.id === choice);
    if (!campus) return;
    window.localStorage.setItem(SELECTED_CAMPUS_KEY, campus.id);
    setSelected(campus);
    onSelected?.(campus);
    setNotice('');
  }

  function changeCampus() {
    window.localStorage.removeItem(SELECTED_CAMPUS_KEY);
    setSelected(null);
    setChoice('');
    setNotice('');
    onSelected?.(null);
  }

  if (status === 'loading') {
    return <div role="status" className="animate-pulse rounded-3xl border border-stone-200 bg-white p-6 text-sm text-stone-500">Loading active campuses…</div>;
  }

  if (status === 'error') {
    return <div className="rounded-3xl border border-red-200 bg-white p-6"><Alert>We could not load campuses right now.</Alert><Button variant="ghost" className="mt-4" onClick={() => void load()}>Try again</Button></div>;
  }

  if (selected) {
    return (
      <section aria-label="Selected campus" className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green-500">Your campus</p>
        <h2 className="mt-2 text-xl font-bold text-stone-950">{selected.name}</h2>
        <p className="mt-1 text-sm text-stone-600">{selected.city}{selected.state ? `, ${selected.state}` : ''}</p>
        <Button variant="ghost" className="mt-5" onClick={changeCampus}>Change campus</Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="campus-selector-title" className={`rounded-3xl border border-orange-200 bg-white shadow-sm ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-orange-600">Start here</p>
      <h2 id="campus-selector-title" className="mt-2 text-2xl font-bold text-stone-950">Choose your campus</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">We’ll use this to show nearby outlets and menus as they become available.</p>
      {notice ? <div className="mt-4"><Alert>{notice}</Alert></div> : null}
      {universities.length === 0 ? (
        <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">No active campuses are available yet. Please check again soon.</p>
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-semibold text-stone-800">Campus
            <select value={choice} onChange={(event) => setChoice(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 shadow-sm focus:border-brand-orange-500 focus:ring-4 focus:ring-orange-100">
              <option value="">Select a campus</option>
              {universities.map((campus) => <option key={campus.id} value={campus.id}>{campus.name} — {campus.city}</option>)}
            </select>
          </label>
          <Button disabled={!choice} onClick={saveCampus}>Use this campus</Button>
        </div>
      )}
    </section>
  );
}
