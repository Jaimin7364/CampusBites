import { createServer, type Server as HttpServer } from 'node:http';
import { UserRole } from '@prisma/client';
import { io as createClient, type Socket } from 'socket.io-client';
import type { Server } from 'socket.io';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = vi.hoisted(() => ({ user: { findUnique: vi.fn() }, order: { findUnique: vi.fn() } }));
vi.mock('../src/config/prisma.js', () => ({ prisma }));
import { attachOrderSocket, clearOrderSocket, emitOrderStatusChanged } from '../src/socket/order-socket.js';
import { signAccessToken } from '../src/utils/jwt.js';

let httpServer: HttpServer | null = null; let ioServer: Server | null = null; const clients: Socket[] = [];
async function start() { httpServer = createServer(); ioServer = attachOrderSocket(httpServer); await new Promise<void>((resolve) => httpServer!.listen(0, '127.0.0.1', resolve)); const address = httpServer.address(); if (!address || typeof address === 'string') throw new Error('Test server did not bind'); return `http://127.0.0.1:${address.port}`; }
function client(url: string, token: string) { const socket = createClient(url, { auth: { token }, transports: ['websocket'], forceNew: true, reconnection: false }); clients.push(socket); return socket; }
function connected(socket: Socket) { return new Promise<void>((resolve, reject) => { socket.once('connect', () => resolve()); socket.once('connect_error', reject); }); }
afterEach(async () => { clients.forEach((socket) => socket.disconnect()); clearOrderSocket(ioServer ?? undefined); if (ioServer) await new Promise<void>((resolve) => ioServer!.close(() => resolve())); else if (httpServer?.listening) await new Promise<void>((resolve) => httpServer!.close(() => resolve())); ioServer = null; httpServer = null; });
describe('authenticated order socket', () => {
  beforeEach(() => { vi.clearAllMocks(); prisma.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) => Promise.resolve({ id: where.id, role: where.id.startsWith('seller') ? UserRole.SELLER : UserRole.USER, active: true })); });
  it('rejects missing and invalid access tokens', async () => { const url = await start(); const socket = client(url, 'not-a-jwt'); const error = await new Promise<Error & { data?: { code?: string } }>((resolve) => socket.once('connect_error', resolve)); expect(error.data?.code).toBe('INVALID_TOKEN'); expect(socket.connected).toBe(false); });
  it('delivers status events only to the owning user and seller rooms', async () => { const url = await start(); const owner = client(url, signAccessToken('user-1', UserRole.USER)); const stranger = client(url, signAccessToken('user-2', UserRole.USER)); const seller = client(url, signAccessToken('seller-1', UserRole.SELLER)); await Promise.all([connected(owner), connected(stranger), connected(seller)]); const ownerEvent = vi.fn(); const strangerEvent = vi.fn(); const sellerEvent = vi.fn(); owner.on('order:status-changed', ownerEvent); stranger.on('order:status-changed', strangerEvent); seller.on('order:status-changed', sellerEvent); emitOrderStatusChanged({ id: 'order-1', userId: 'user-1', sellerId: 'seller-1', status: 'READY' }); await vi.waitFor(() => { expect(ownerEvent).toHaveBeenCalledOnce(); expect(sellerEvent).toHaveBeenCalledOnce(); }); await new Promise((resolve) => setTimeout(resolve, 30)); expect(strangerEvent).not.toHaveBeenCalled(); });
  it('prevents unauthorized order-room subscriptions', async () => { const url = await start(); prisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'user-1', sellerId: 'seller-1' }); const stranger = client(url, signAccessToken('user-2', UserRole.USER)); const owner = client(url, signAccessToken('user-1', UserRole.USER)); await Promise.all([connected(stranger), connected(owner)]); const denied = await new Promise<{ success: boolean; code?: string }>((resolve) => stranger.emit('order:subscribe', 'order-1', resolve)); const allowed = await new Promise<{ success: boolean; code?: string }>((resolve) => owner.emit('order:subscribe', 'order-1', resolve)); expect(denied).toEqual({ success: false, code: 'ORDER_NOT_FOUND' }); expect(allowed).toEqual({ success: true }); });
});
