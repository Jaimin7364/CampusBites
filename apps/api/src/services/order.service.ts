import { randomUUID } from 'node:crypto';
import { DeliveryType, HotelStatus, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import * as menuRepository from '../repositories/menu.repository.js';
import * as orderRepository from '../repositories/order.repository.js';
import { isHotelOpenAt } from './hotel.service.js';
export type CreateOrderInput = { items: { menuItemId: string; quantity: number }[]; orderType: OrderType; deliveryType: DeliveryType; deliveryAddress?: string | null; scheduledAt?: string | null };
export async function createOrder(userId: string, key: string, input: CreateOrderInput, now = new Date()) {
  const existing = await orderRepository.findByIdempotency(userId, key); if (existing) return existing;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, phone: true, active: true } }); if (!user?.active) throw new AppError(401, 'INVALID_SESSION', 'The user account is unavailable');
  const menu = await menuRepository.findForCart(input.items.map((item) => item.menuItemId)); if (menu.length !== input.items.length) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'One or more menu items no longer exist');
  if (new Set(menu.map((item) => item.hotelId)).size !== 1) throw new AppError(422, 'MULTIPLE_HOTELS_NOT_ALLOWED', 'You can order from only one food outlet at a time');
  const hotel = menu[0]!.hotel; if (hotel.status !== HotelStatus.APPROVED || !hotel.active || !hotel.university.active) throw new AppError(409, 'HOTEL_NOT_ORDERABLE', 'This food outlet is not currently accepting orders');
  if (menu.some((item) => !item.available)) throw new AppError(409, 'ITEMS_UNAVAILABLE', 'One or more cart items are unavailable');
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null; if (input.orderType === OrderType.PREORDER && (!scheduledAt || scheduledAt <= now)) throw new AppError(422, 'INVALID_SCHEDULED_TIME', 'Pre-order time must be in the future');
  const serviceTime = scheduledAt ?? now; if (!isHotelOpenAt(hotel.openTime, hotel.closeTime, serviceTime)) throw new AppError(409, 'HOTEL_CLOSED', 'The outlet is closed at the requested order time');
  const quantities = new Map(input.items.map((item) => [item.menuItemId, item.quantity])); const subtotalPaise = menu.reduce((sum, item) => sum + item.pricePaise * quantities.get(item.id)!, 0);
  try { return await orderRepository.create({ orderNumber: `CB-${now.getUTCFullYear()}-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`, idempotencyKey: key, userName: user.fullName ?? 'CampusBites User', userPhone: user.phone, sellerName: hotel.seller.sellerName ?? hotel.seller.businessOwnerName ?? 'CampusBites Seller', hotelName: hotel.hotelName, hotelPhone: hotel.phone, universityId: hotel.universityId, subtotalPaise, deliveryChargePaise: env.DELIVERY_CHARGE_PAISE, platformFeePaise: env.PLATFORM_FEE_PAISE, totalAmountPaise: subtotalPaise + env.DELIVERY_CHARGE_PAISE + env.PLATFORM_FEE_PAISE, orderType: input.orderType, deliveryType: input.deliveryType, deliveryAddress: input.deliveryType === DeliveryType.DELIVERY ? input.deliveryAddress!.trim() : null, scheduledAt, paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PENDING, status: OrderStatus.PENDING, user: { connect: { id: userId } }, seller: { connect: { id: hotel.sellerId } }, hotel: { connect: { id: hotel.id } }, items: { create: menu.map((item) => ({ menuItem: { connect: { id: item.id } }, itemName: item.name, pricePaise: item.pricePaise, quantity: quantities.get(item.id)!, veg: item.veg, bestseller: item.bestseller, itemTotalPaise: item.pricePaise * quantities.get(item.id)! })) } }); } catch (error) { const raced = await orderRepository.findByIdempotency(userId, key); if (raced) return raced; throw error; }
}
export async function getUserOrder(userId: string, id: string) { const order = await orderRepository.findById(id); if (!order || order.userId !== userId) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found'); return order; }
