'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api-client';

type HealthData = { service: string; status: 'up'; timestamp: string };

export function ApiStatus() {
  const [state, setState] = useState<'checking' | 'connected' | 'unavailable'>('checking');

  useEffect(() => {
    const controller = new AbortController();
    apiClient<HealthData>('/health', { signal: controller.signal })
      .then(() => setState('connected'))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setState('unavailable');
        }
      });
    return () => controller.abort();
  }, []);

  const display = {
    checking: ['bg-amber-100 text-amber-800', 'Checking API…'],
    connected: ['bg-green-100 text-green-800', 'API connected'],
    unavailable: ['bg-red-100 text-red-800', 'API unavailable'],
  } as const;

  return (
    <span role="status" className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${display[state][0]}`}>
      {display[state][1]}
    </span>
  );
}
