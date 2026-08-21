import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SellerOutletWorkspace } from './seller-outlet-workspace';

const mocks = vi.hoisted(() => ({ getSellerHotel: vi.fn(), createSellerHotel: vi.fn(), updateSellerHotel: vi.fn(), resubmitSellerHotel: vi.fn() }));
vi.mock('@/services/hotel-service', () => ({ ...mocks, outletImageUrl: (path: string) => path }));
vi.mock('./outlet-form', () => ({ OutletForm: () => <div>Outlet form</div> }));

const hotel = {
  id: 'hotel-1', sellerId: 'seller-1', universityId: 'university-1', hotelName: 'Campus Cafe',
  address: 'Near the library', phone: '+919876543210', whatsappNumber: '+919876543210',
  description: 'Fresh meals for students every day.', hotelImageUrl: '/uploads/outlets/image.webp', menuImageUrl: null,
  openTime: '08:00', closeTime: '21:00', featured: false, active: true, status: 'REJECTED' as const,
  rejectReason: 'Please provide a clearer address.', approvedById: null, approvedAt: null,
  createdAt: '2026-08-21T00:00:00Z', updatedAt: '2026-08-21T00:00:00Z',
  university: { id: 'university-1', name: 'GTU', city: 'Ahmedabad', state: 'Gujarat', active: true },
  seller: { id: 'seller-1', sellerName: 'Seller', businessOwnerName: 'Owner', email: 'seller@example.com', phone: '+919876543210' }, approvedBy: null,
};

describe('SellerOutletWorkspace', () => {
  beforeEach(() => vi.clearAllMocks());
  it('shows the add-outlet form when the seller has no outlet', async () => {
    mocks.getSellerHotel.mockResolvedValue({ hotel: null });
    render(<SellerOutletWorkspace />);
    expect(await screen.findByRole('heading', { name: 'Add your food outlet' })).toBeInTheDocument();
    expect(screen.getByText('Outlet form')).toBeInTheDocument();
  });
  it('shows rejection feedback and lets the seller resubmit', async () => {
    mocks.getSellerHotel.mockResolvedValue({ hotel });
    mocks.resubmitSellerHotel.mockResolvedValue({ hotel: { ...hotel, status: 'PENDING', rejectReason: null } });
    render(<SellerOutletWorkspace />);
    expect(await screen.findByText(hotel.rejectReason)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resubmit for approval' }));
    await waitFor(() => expect(mocks.resubmitSellerHotel).toHaveBeenCalledWith(hotel.id));
    expect(await screen.findByText('Your outlet was resubmitted for review.')).toBeInTheDocument();
  });
});
