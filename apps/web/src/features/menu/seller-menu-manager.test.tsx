import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SellerMenuManager } from './seller-menu-manager';

const mocks = vi.hoisted(() => ({ listSellerMenu: vi.fn(), createMenuItem: vi.fn(), updateMenuItem: vi.fn(), setMenuAvailability: vi.fn(), setMenuBestseller: vi.fn(), reorderMenuItems: vi.fn(), deleteMenuItem: vi.fn() }));
vi.mock('@/services/menu-service', () => mocks);

const item = { id: 'item-1', hotelId: 'hotel-1', name: 'Masala Dosa', description: 'Crisp dosa', pricePaise: 8505, category: 'South Indian' as const, veg: true, bestseller: false, preparationTimeMinutes: 15, available: true, displayOrder: 0, createdAt: '2026-08-21T00:00:00Z', updatedAt: '2026-08-21T00:00:00Z' };
const response = { hotel: { id: 'hotel-1', status: 'APPROVED', active: true }, menuItems: [item], pagination: { page: 1, limit: 100, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } };

describe('SellerMenuManager', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listSellerMenu.mockResolvedValue(response); });

  it('submits the entered rupee price as exact integer paise', async () => {
    const created = { ...item, id: 'item-2', name: 'Tea', pricePaise: 1250 };
    mocks.createMenuItem.mockResolvedValue({ menuItem: created });
    render(<SellerMenuManager />);
    await screen.findByText('Masala Dosa');
    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Tea' } });
    fireEvent.change(screen.getByLabelText('Price (₹)'), { target: { value: '12.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await waitFor(() => expect(mocks.createMenuItem).toHaveBeenCalledWith(expect.objectContaining({ name: 'Tea', pricePaise: 1250 })));
    expect(await screen.findByText('Menu item added.')).toBeInTheDocument();
  });

  it('connects the availability control to the item endpoint', async () => {
    mocks.setMenuAvailability.mockResolvedValue({ menuItem: { ...item, available: false } });
    render(<SellerMenuManager />);
    fireEvent.click(await screen.findByRole('button', { name: 'Mark unavailable' }));
    await waitFor(() => expect(mocks.setMenuAvailability).toHaveBeenCalledWith(item.id, false));
    expect(await screen.findAllByText('Unavailable')).not.toHaveLength(0);
  });

  it('locks mutation controls for an outlet awaiting approval', async () => {
    mocks.listSellerMenu.mockResolvedValue({ ...response, hotel: { ...response.hotel, status: 'PENDING' } });
    render(<SellerMenuManager />);
    expect(await screen.findByText(/unlocked when your outlet is approved/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark unavailable' })).toBeDisabled();
  });
});
