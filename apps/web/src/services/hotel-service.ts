import { API_ORIGIN, apiClient, authenticatedApiClient } from './api-client';
import type { Hotel, HotelInput, HotelList, HotelStatus, PublicHotel, PublicHotelList } from '@/types/hotel';

export const outletImageUrl = (path: string) => path.startsWith('http') ? path : `${API_ORIGIN}${path}`;

export function uploadOutletImage(file: File) {
  const body = new FormData();
  body.append('image', file);
  return authenticatedApiClient<{ url: string }>('/uploads/outlet-image', { method: 'POST', body });
}

export function getSellerHotel() {
  return authenticatedApiClient<{ hotel: Hotel | null }>('/seller/hotel');
}
export function createSellerHotel(input: HotelInput) {
  return authenticatedApiClient<{ hotel: Hotel }>('/seller/hotel', { method: 'POST', body: JSON.stringify(input) });
}
export function updateSellerHotel(id: string, input: HotelInput) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/seller/hotel/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}
export function resubmitSellerHotel(id: string) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/seller/hotel/${id}/resubmit`, { method: 'POST' });
}
export function listAdminHotels(filters: { page: number; search?: string; status?: '' | HotelStatus }) {
  const query = new URLSearchParams({ page: String(filters.page), limit: '10' });
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.status) query.set('status', filters.status);
  return authenticatedApiClient<HotelList>(`/admin/hotels?${query.toString()}`);
}
export function updateAdminHotel(id: string, input: HotelInput) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/admin/hotels/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}
export function approveHotel(id: string) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/admin/hotels/${id}/approve`, { method: 'PATCH' });
}
export function rejectHotel(id: string, reason: string) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/admin/hotels/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) });
}
export function setHotelFeatured(id: string, featured: boolean) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/admin/hotels/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) });
}
export function setHotelActive(id: string, active: boolean) {
  return authenticatedApiClient<{ hotel: Hotel }>(`/admin/hotels/${id}/active`, { method: 'PATCH', body: JSON.stringify({ active }) });
}
export function deleteHotel(id: string) {
  return authenticatedApiClient<void>(`/admin/hotels/${id}`, { method: 'DELETE' });
}

export type PublicHotelFilters = { universityId: string; page: number; search?: string; featured?: boolean; openNow?: boolean };
export function listPublicHotels(filters: PublicHotelFilters) {
  const query = new URLSearchParams({ universityId: filters.universityId, page: String(filters.page), limit: '12' });
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.featured !== undefined) query.set('featured', String(filters.featured));
  if (filters.openNow !== undefined) query.set('openNow', String(filters.openNow));
  return apiClient<PublicHotelList>(`/hotels?${query.toString()}`);
}
export function getPublicHotel(id: string) { return apiClient<{ hotel: PublicHotel }>(`/hotels/${id}`); }
