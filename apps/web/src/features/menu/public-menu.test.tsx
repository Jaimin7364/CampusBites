import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicMenu } from './public-menu';

const mocks = vi.hoisted(() => ({ listPublicMenu: vi.fn() }));
vi.mock('@/services/menu-service', () => ({ listPublicMenu: mocks.listPublicMenu }));

const item = { id: 'item-1', hotelId: 'hotel-1', name: 'Cold Coffee', description: 'Chilled', pricePaise: 9000, category: 'Beverages' as const, veg: true, bestseller: true, preparationTimeMinutes: 5, available: false, displayOrder: 0, createdAt: '', updatedAt: '' };
const response = { hotel: { id: 'hotel-1', universityId: 'university-1', hotelName: 'Campus Cafe', address: 'Library road', phone: '1', whatsappNumber: '1', description: 'Student favourites', hotelImageUrl: null, menuImageUrl: null, openTime: '08:00', closeTime: '21:00', featured: false, active: true, status: 'APPROVED' as const, university: { id: 'university-1', name: 'GTU', city: 'Ahmedabad', state: 'Gujarat', active: true } }, menuItems: [item], pagination: { page: 1, limit: 50, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } };

describe('PublicMenu', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listPublicMenu.mockResolvedValue(response); });

  it('shows public outlet data and prevents ordering unavailable dishes', async () => {
    render(<PublicMenu hotelId="hotel-1" />);
    expect(await screen.findByRole('heading', { name: 'Campus Cafe' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cold Coffee' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });

  it('sends live menu filters to the public endpoint', async () => {
    render(<PublicMenu hotelId="hotel-1" />);
    await screen.findByRole('heading', { name: 'Campus Cafe' });
    fireEvent.change(screen.getByLabelText('Diet'), { target: { value: 'true' } });
    await waitFor(() => expect(mocks.listPublicMenu).toHaveBeenLastCalledWith('hotel-1', expect.objectContaining({ veg: 'true', page: 1 })));
  });
});
