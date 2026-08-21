import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminOutletManager } from './admin-outlet-manager';

const mocks = vi.hoisted(() => ({ listAdminHotels: vi.fn(), approveHotel: vi.fn(), rejectHotel: vi.fn(), setHotelFeatured: vi.fn(), setHotelActive: vi.fn(), updateAdminHotel: vi.fn(), deleteHotel: vi.fn() }));
vi.mock('@/services/hotel-service', () => ({ ...mocks, outletImageUrl: (path: string) => path }));
vi.mock('./outlet-form', () => ({ OutletForm: () => <div>Outlet edit form</div> }));

const hotel = {
  id: 'hotel-1', sellerId: 'seller-1', universityId: 'university-1', hotelName: 'Campus Cafe', address: 'Near library', phone: '+919876543210', whatsappNumber: '+919876543210', description: 'Fresh meals for students every day.', hotelImageUrl: '/uploads/outlets/image.webp', menuImageUrl: null, openTime: '08:00', closeTime: '21:00', featured: false, active: true, status: 'PENDING' as const, rejectReason: null, approvedById: null, approvedAt: null, createdAt: '2026-08-21T00:00:00Z', updatedAt: '2026-08-21T00:00:00Z', university: { id: 'university-1', name: 'GTU', city: 'Ahmedabad', state: 'Gujarat', active: true }, seller: { id: 'seller-1', sellerName: 'Seller', businessOwnerName: 'Owner', email: 'seller@example.com', phone: '+919876543210' }, approvedBy: null,
};
const list = { hotels: [hotel], pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } };

describe('AdminOutletManager', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listAdminHotels.mockResolvedValue(list); });
  it('approves a pending outlet', async () => {
    mocks.approveHotel.mockResolvedValue({ hotel: { ...hotel, status: 'APPROVED' } });
    render(<AdminOutletManager />);
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(mocks.approveHotel).toHaveBeenCalledWith(hotel.id));
    expect(await screen.findByText(`${hotel.hotelName} approved.`)).toBeInTheDocument();
  });
  it('requires and submits clear rejection feedback', async () => {
    mocks.rejectHotel.mockResolvedValue({ hotel: { ...hotel, status: 'REJECTED' } });
    render(<AdminOutletManager />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    fireEvent.change(screen.getByLabelText('Rejection reason'), { target: { value: 'Please upload a clearer storefront image.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send rejection' }));
    await waitFor(() => expect(mocks.rejectHotel).toHaveBeenCalledWith(hotel.id, 'Please upload a clearer storefront image.'));
  });
});
