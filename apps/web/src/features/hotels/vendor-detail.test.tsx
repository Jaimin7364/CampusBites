import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorDetail } from './vendor-detail';

const mocks = vi.hoisted(() => ({ getPublicHotel: vi.fn() }));
vi.mock('@/services/hotel-service', () => ({ getPublicHotel: mocks.getPublicHotel, outletImageUrl: (value: string) => value }));
vi.mock('@/features/menu/public-menu', () => ({ PublicMenu: ({ hotelId }: { hotelId: string }) => <div>Live menu for {hotelId}</div> }));

const hotel = { id: 'hotel-1', universityId: 'campus-1', hotelName: 'Campus Cafe', address: 'Library road', phone: '+919876543210', whatsappNumber: '+919876543210', description: 'Fresh food', hotelImageUrl: null, menuImageUrl: null, openTime: '08:00', closeTime: '21:00', featured: true, active: true, status: 'APPROVED', isOpen: true, university: { id: 'campus-1', name: 'GTU', city: 'Ahmedabad', state: 'Gujarat', active: true } };

describe('VendorDetail', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getPublicHotel.mockResolvedValue({ hotel }); });
  it('shows outlet details, safe contact actions, fallback image, and the live menu', async () => {
    render(<VendorDetail hotelId="hotel-1" />);
    expect(await screen.findByRole('heading', { name: 'Campus Cafe' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Call outlet' })).toHaveAttribute('href', 'tel:+919876543210');
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/919876543210');
    expect(screen.getByRole('img', { name: /image unavailable/i })).toBeInTheDocument();
    expect(screen.getByText('Live menu for hotel-1')).toBeInTheDocument();
  });
});
