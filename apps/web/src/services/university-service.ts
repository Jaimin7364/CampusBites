import { apiClient, authenticatedApiClient } from './api-client';
import type { University, UniversityInput, UniversityList } from '@/types/university';

export function listActiveUniversities(search = '') {
  const query = new URLSearchParams({ limit: '100' });
  if (search.trim()) query.set('search', search.trim());
  return apiClient<UniversityList>(`/universities?${query.toString()}`);
}

export function listAdminUniversities(filters: {
  page: number;
  search?: string;
  active?: '' | 'true' | 'false';
}) {
  const query = new URLSearchParams({ page: String(filters.page), limit: '10' });
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.active) query.set('active', filters.active);
  return authenticatedApiClient<UniversityList>(`/admin/universities?${query.toString()}`);
}

export function createUniversity(input: UniversityInput) {
  return authenticatedApiClient<{ university: University }>('/admin/universities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateUniversity(id: string, input: Omit<UniversityInput, 'active'>) {
  return authenticatedApiClient<{ university: University }>(`/admin/universities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function setUniversityStatus(id: string, active: boolean) {
  return authenticatedApiClient<{ university: University }>(
    `/admin/universities/${id}/status`,
    { method: 'PATCH', body: JSON.stringify({ active }) },
  );
}

export function deleteUniversity(id: string) {
  return authenticatedApiClient<void>(`/admin/universities/${id}`, { method: 'DELETE' });
}
