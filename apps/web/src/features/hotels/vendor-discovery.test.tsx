import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorDiscovery } from './vendor-discovery';

const mocks = vi.hoisted(() => ({ listPublicHotels: vi.fn() }));
vi.mock('@/services/hotel-service', () => ({ listPublicHotels: mocks.listPublicHotels, outletImageUrl: (value: string) => value }));
vi.mock('@/features/universities/campus-selector', () => ({ CampusSelector: ({ onSelected }: { onSelected(value: unknown): void }) => <button onClick={() => onSelected({ id: 'campus-1', name: 'GTU', city: 'Ahmedabad', state: 'Gujarat', active: true })}>Choose GTU</button> }));

const hotel = { id: 'hotel-1', universityId: 'campus-1', hotelName: 'Campus Cafe', address: 'Library road', phone: '+919876543210', whatsappNumber: '+919876543210', description: 'Fresh food', hotelImageUrl: null, menuImageUrl: null, openTime: '08:00', closeTime: '21:00', featured: true, active: true, status: 'APPROVED', isOpen: true, university: { id: 'campus-1', name: 'GTU', city: 'Ahmedabad', state: 'Gujarat', active: true } };

describe('VendorDiscovery', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listPublicHotels.mockResolvedValue({ hotels: [hotel], pagination: { page: 1, limit: 12, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }); });
  it('loads approved vendors after campus selection', async () => {
    render(<VendorDiscovery />); fireEvent.click(screen.getByRole('button', { name: 'Choose GTU' }));
    expect(await screen.findByText('Campus Cafe')).toBeInTheDocument();
    expect(mocks.listPublicHotels).toHaveBeenCalledWith(expect.objectContaining({ universityId: 'campus-1', page: 1 }));
  });
  it('sends featured and open-now filters to the API', async () => {
    render(<VendorDiscovery />); fireEvent.click(screen.getByRole('button', { name: 'Choose GTU' })); await screen.findByText('Campus Cafe');
    fireEvent.click(screen.getByLabelText('Featured')); fireEvent.click(screen.getByLabelText('Open now'));
    await waitFor(() => expect(mocks.listPublicHotels).toHaveBeenLastCalledWith(expect.objectContaining({ featured: true, openNow: true })));
  });
});
