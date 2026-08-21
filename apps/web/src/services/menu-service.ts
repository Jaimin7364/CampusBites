import { apiClient, authenticatedApiClient } from './api-client';
import type { Hotel } from '@/types/hotel';
import type { MenuCategory, MenuItem, MenuItemInput, MenuList, PublicMenuHotel } from '@/types/menu';

export function listSellerMenu(filters: { search?: string; category?: '' | MenuCategory; available?: '' | 'true' | 'false' } = {}) {
  const query = new URLSearchParams({ limit: '100' });
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.category) query.set('category', filters.category);
  if (filters.available) query.set('available', filters.available);
  return authenticatedApiClient<MenuList<Hotel>>(`/seller/menu?${query.toString()}`);
}
export function createMenuItem(input: MenuItemInput) { return authenticatedApiClient<{ menuItem: MenuItem }>('/seller/menu', { method: 'POST', body: JSON.stringify(input) }); }
export function updateMenuItem(id: string, input: Partial<MenuItemInput>) { return authenticatedApiClient<{ menuItem: MenuItem }>(`/seller/menu/${id}`, { method: 'PUT', body: JSON.stringify(input) }); }
export function setMenuAvailability(id: string, available: boolean) { return authenticatedApiClient<{ menuItem: MenuItem }>(`/seller/menu/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ available }) }); }
export function setMenuBestseller(id: string, bestseller: boolean) { return authenticatedApiClient<{ menuItem: MenuItem }>(`/seller/menu/${id}/bestseller`, { method: 'PATCH', body: JSON.stringify({ bestseller }) }); }
export function reorderMenuItems(items: { id: string; displayOrder: number }[]) { return authenticatedApiClient<{ menuItems: MenuItem[] }>('/seller/menu/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }); }
export function deleteMenuItem(id: string) { return authenticatedApiClient<void>(`/seller/menu/${id}`, { method: 'DELETE' }); }

export type PublicMenuFilters = { page: number; search?: string; category?: '' | MenuCategory; veg?: '' | 'true' | 'false'; available?: '' | 'true' | 'false'; bestseller?: '' | 'true'; sort?: 'displayOrder' | 'name' | 'priceAsc' | 'priceDesc' };
export function listPublicMenu(hotelId: string, filters: PublicMenuFilters) {
  const query = new URLSearchParams({ page: String(filters.page), limit: '50', sort: filters.sort ?? 'displayOrder' });
  for (const [key, value] of Object.entries(filters)) if (key !== 'page' && key !== 'sort' && value) query.set(key, String(value));
  return apiClient<MenuList<PublicMenuHotel>>(`/hotels/${hotelId}/menu?${query.toString()}`);
}
