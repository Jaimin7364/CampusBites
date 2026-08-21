import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderDetail } from './order-detail';

const mocks = vi.hoisted(() => ({ getOrder: vi.fn(), cancelOrder: vi.fn() }));
vi.mock('@/services/order-service', () => ({ getOrder: mocks.getOrder, cancelOrder: mocks.cancelOrder }));
vi.mock('@/services/order-socket', () => ({ createOrderSocket: () => ({ on: vi.fn(), emit: vi.fn(), disconnect: vi.fn() }) }));
const order = { id: 'order-1', orderNumber: 'CB-2026-ABC123', userId: 'user-1', userName: 'Student One', userPhone: '+919999999999', sellerId: 'seller-1', sellerName: 'Campus Foods', hotelId: 'hotel-1', hotelName: 'Campus Cafe', hotelPhone: '+918888888888', universityId: 'university-1', subtotalPaise: 17000, deliveryChargePaise: 0, platformFeePaise: 0, totalAmountPaise: 17000, orderType: 'INSTANT', deliveryType: 'PICKUP', deliveryAddress: null, scheduledAt: null, paymentMethod: 'CASH', paymentStatus: 'PENDING', status: 'PENDING', createdAt: '2026-08-21T06:30:00.000Z', updatedAt: '2026-08-21T06:30:00.000Z', items: [{ id: 'order-item-1', menuItemId: 'item-1', itemName: 'Dosa', pricePaise: 8500, quantity: 2, veg: true, bestseller: false, itemTotalPaise: 17000 }] };
describe('OrderDetail', () => {
  beforeEach(() => vi.clearAllMocks());
  it('renders immutable order snapshots and totals', async () => { mocks.getOrder.mockResolvedValue({ order }); render(<OrderDetail id="order-1" />); expect(await screen.findByText('CB-2026-ABC123')).toBeInTheDocument(); expect(screen.getByText('2 × Dosa')).toBeInTheDocument(); expect(screen.getAllByText('₹170.00')).not.toHaveLength(0); expect(screen.getByText('Cash · PENDING')).toBeInTheDocument(); });
  it('shows a recoverable API error', async () => { mocks.getOrder.mockRejectedValue(new Error('network')); render(<OrderDetail id="missing" />); expect(await screen.findByText('Order details could not be loaded.')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument(); });
  it('confirms and cancels only a pending order', async () => { mocks.getOrder.mockResolvedValue({ order }); mocks.cancelOrder.mockResolvedValue({ order: { ...order, status: 'CANCELLED', cancelledAt: '2026-08-21T06:31:00Z' } }); vi.stubGlobal('confirm', vi.fn(() => true)); render(<OrderDetail id="order-1" />); fireEvent.click(await screen.findByRole('button', { name: 'Cancel order' })); await waitFor(() => expect(mocks.cancelOrder).toHaveBeenCalledWith('order-1')); expect(await screen.findByText('This order was cancelled.')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument(); });
});
