import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyOrders } from './my-orders';
const mocks = vi.hoisted(() => ({ listMyOrders: vi.fn() }));
const handlers = vi.hoisted(() => new Map<string, () => void>());
const socket = vi.hoisted(() => ({ on: vi.fn((event: string, callback: () => void) => { handlers.set(event, callback); }), disconnect: vi.fn() }));
vi.mock('@/services/order-service', () => mocks);
vi.mock('@/services/order-socket', () => ({ createOrderSocket: () => socket }));
const order = { id: 'order-1', orderNumber: 'CB-2026-ABC123', hotelName: 'Campus Cafe', status: 'PENDING', deliveryType: 'PICKUP', orderType: 'INSTANT', totalAmountPaise: 17000, createdAt: '2026-08-21T06:30:00Z', items: [{ quantity: 2 }] };
describe('MyOrders', () => {
  beforeEach(() => { vi.clearAllMocks(); handlers.clear(); mocks.listMyOrders.mockResolvedValue({ orders: [order], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }); });
  it('shows grouped private orders and switches history sections', async () => { render(<MyOrders />); expect(await screen.findByText('CB-2026-ABC123')).toBeInTheDocument(); expect(mocks.listMyOrders).toHaveBeenCalledWith(expect.objectContaining({ group: 'active' })); fireEvent.click(screen.getByRole('tab', { name: 'Completed' })); await waitFor(() => expect(mocks.listMyOrders).toHaveBeenCalledWith(expect.objectContaining({ group: 'completed' }))); });
  it('resynchronizes over REST after socket connect and events', async () => { render(<MyOrders />); await screen.findByText('CB-2026-ABC123'); handlers.get('connect')?.(); await waitFor(() => expect(screen.getByText('Live updates connected')).toBeInTheDocument()); handlers.get('order:status-changed')?.(); await waitFor(() => expect(mocks.listMyOrders.mock.calls.length).toBeGreaterThanOrEqual(3)); });
  it('shows empty and recoverable error states', async () => { mocks.listMyOrders.mockResolvedValueOnce({ orders: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }); const view = render(<MyOrders />); expect(await screen.findByText('No active orders')).toBeInTheDocument(); view.unmount(); mocks.listMyOrders.mockRejectedValue(new Error('network')); render(<MyOrders />); expect(await screen.findByText('Your orders could not be loaded.')).toBeInTheDocument(); });
});
