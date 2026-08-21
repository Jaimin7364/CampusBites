import { HotelStatus } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import * as menuRepository from '../repositories/menu.repository.js';

export type CartPreviewInput = { items: { menuItemId: string; quantity: number }[] };

export async function previewCart(input: CartPreviewInput) {
  const menuItems = await menuRepository.findForCart(input.items.map((item) => item.menuItemId));
  if (menuItems.length !== input.items.length) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'One or more menu items no longer exist');
  const hotelIds = new Set(menuItems.map((item) => item.hotelId));
  if (hotelIds.size !== 1) throw new AppError(422, 'MULTIPLE_HOTELS_NOT_ALLOWED', 'You can order from only one food outlet at a time');
  const hotel = menuItems[0]!.hotel;
  if (hotel.status !== HotelStatus.APPROVED || !hotel.active || !hotel.university.active) throw new AppError(409, 'HOTEL_NOT_ORDERABLE', 'This food outlet is not currently accepting orders');
  const byId = new Map(menuItems.map((item) => [item.id, item]));
  const items = input.items.map(({ menuItemId, quantity }) => {
    const item = byId.get(menuItemId)!;
    return { menuItemId: item.id, hotelId: item.hotelId, itemName: item.name, pricePaise: item.pricePaise, quantity, veg: item.veg, bestseller: item.bestseller, available: item.available, subtotalPaise: item.pricePaise * quantity };
  });
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsTotalPaise = items.reduce((sum, item) => sum + item.subtotalPaise, 0);
  const unavailableItemIds = items.filter((item) => !item.available).map((item) => item.menuItemId);
  return { hotel: { id: hotel.id, hotelName: hotel.hotelName }, items, orderable: unavailableItemIds.length === 0, issues: unavailableItemIds.length ? [{ code: 'ITEMS_UNAVAILABLE', message: 'Remove unavailable items before checkout', menuItemIds: unavailableItemIds }] : [], totals: { totalQuantity, itemsTotalPaise, deliveryChargePaise: env.DELIVERY_CHARGE_PAISE, platformFeePaise: env.PLATFORM_FEE_PAISE, grandTotalPaise: itemsTotalPaise + env.DELIVERY_CHARGE_PAISE + env.PLATFORM_FEE_PAISE } };
}
