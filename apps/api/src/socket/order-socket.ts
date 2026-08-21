import type { Server as HttpServer } from 'node:http';
import { UserRole } from '@prisma/client';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { tokenPredatesPasswordChange, verifyAccessToken } from '../utils/jwt.js';

type SocketAuth = { userId: string; role: UserRole };
type TrackedOrder = { id: string; userId: string; sellerId: string };
let orderIo: Server | null = null;
const userRoom = (id: string) => `user:${id}`; const sellerRoom = (id: string) => `seller:${id}`; const orderRoom = (id: string) => `order:${id}`;

export function canSubscribeToOrder(auth: SocketAuth, order: TrackedOrder) { return auth.role === UserRole.USER ? order.userId === auth.userId : auth.role === UserRole.SELLER ? order.sellerId === auth.userId : false; }

export function attachOrderSocket(server: HttpServer) {
  const io = new Server(server, { cors: { origin: env.WEB_ORIGIN, credentials: true, methods: ['GET', 'POST'] } }); orderIo = io;
  io.use(async (socket, next) => {
    try { const handshakeAuth = socket.handshake.auth as { token?: unknown }; const supplied = handshakeAuth.token; const authorization = socket.handshake.headers.authorization; const token = typeof supplied === 'string' ? supplied : authorization?.startsWith('Bearer ') ? authorization.slice(7) : null; if (!token) throw new Error('missing token'); const claims = verifyAccessToken(token); const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { id: true, role: true, active: true, passwordChangedAt: true } }); if (!user?.active || user.role !== claims.role || tokenPredatesPasswordChange(claims, user.passwordChangedAt)) throw new Error('invalid session'); (socket.data as { auth?: SocketAuth }).auth = { userId: user.id, role: user.role }; next(); } catch { const error = new Error('Authentication token is invalid or expired') as Error & { data?: unknown }; error.data = { code: 'INVALID_TOKEN' }; next(error); }
  });
  io.on('connection', (socket) => {
    const auth = (socket.data as { auth: SocketAuth }).auth; if (auth.role === UserRole.USER) void socket.join(userRoom(auth.userId)); if (auth.role === UserRole.SELLER) void socket.join(sellerRoom(auth.userId));
    socket.on('order:subscribe', async (id: unknown, acknowledge?: (result: { success: boolean; code?: string }) => void) => { if (typeof id !== 'string') { acknowledge?.({ success: false, code: 'INVALID_ORDER_ID' }); return; } const order = await prisma.order.findUnique({ where: { id }, select: { id: true, userId: true, sellerId: true } }); if (!order || !canSubscribeToOrder(auth, order)) { acknowledge?.({ success: false, code: 'ORDER_NOT_FOUND' }); return; } await socket.join(orderRoom(id)); acknowledge?.({ success: true }); });
    socket.on('order:unsubscribe', async (id: unknown) => { if (typeof id === 'string') await socket.leave(orderRoom(id)); });
  });
  return io;
}

export function emitOrderCreated<T extends TrackedOrder>(order: T) { orderIo?.to([userRoom(order.userId), sellerRoom(order.sellerId), orderRoom(order.id)]).emit('order:created', { order }); }
export function emitOrderStatusChanged<T extends TrackedOrder>(order: T) { orderIo?.to([userRoom(order.userId), sellerRoom(order.sellerId), orderRoom(order.id)]).emit('order:status-changed', { order }); }
export function emitOrderPaymentChanged<T extends TrackedOrder>(order: T) { orderIo?.to([userRoom(order.userId), sellerRoom(order.sellerId), orderRoom(order.id)]).emit('order:payment-changed', { order }); }
export function emitOrderCancelled<T extends TrackedOrder>(order: T) { orderIo?.to([userRoom(order.userId), sellerRoom(order.sellerId), orderRoom(order.id)]).emit('order:cancelled', { order }); }
export function clearOrderSocket(io?: Server) { if (!io || orderIo === io) orderIo = null; }
