import { io, type Socket } from 'socket.io-client';
import { API_ORIGIN, getAccessToken } from './api-client';
import type { Order } from '@/types/order';

export type OrderEvent = { order: Order };
export function createOrderSocket(): Socket {
  return io(API_ORIGIN, { transports: ['websocket', 'polling'], reconnection: true, auth: (callback) => callback({ token: getAccessToken() }) });
}
