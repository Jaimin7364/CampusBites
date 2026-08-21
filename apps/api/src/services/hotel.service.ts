import { HotelStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../errors/app-error.js';
import * as repository from '../repositories/hotel.repository.js';
import { normalizeIndianPhone } from '../utils/phone.js';

export type HotelInput = {
  universityId: string;
  hotelName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  description: string;
  hotelImageUrl: string;
  menuImageUrl?: string | null;
  openTime: string;
  closeTime: string;
};

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function cleanInput(input: HotelInput) {
  return {
    universityId: input.universityId,
    hotelName: clean(input.hotelName),
    address: clean(input.address),
    phone: normalizeIndianPhone(input.phone),
    whatsappNumber: normalizeIndianPhone(input.whatsappNumber),
    description: clean(input.description),
    hotelImageUrl: input.hotelImageUrl,
    ...(input.menuImageUrl === undefined ? {} : { menuImageUrl: input.menuImageUrl }),
    openTime: input.openTime,
    closeTime: input.closeTime,
  };
}

async function requireActiveUniversity(id: string) {
  const university = await prisma.university.findUnique({ where: { id }, select: { active: true } });
  if (!university) throw new AppError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found');
  if (!university.active) throw new AppError(409, 'UNIVERSITY_INACTIVE', 'Choose an active university');
}

function requireHotel<T>(hotel: T | null): T {
  if (!hotel) throw new AppError(404, 'HOTEL_NOT_FOUND', 'Food outlet was not found');
  return hotel;
}

function mapWriteError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') throw new AppError(409, 'SELLER_ALREADY_HAS_HOTEL', 'A seller can own only one food outlet');
    if (error.code === 'P2025') throw new AppError(404, 'HOTEL_NOT_FOUND', 'Food outlet was not found');
    if (error.code === 'P2003') throw new AppError(409, 'HOTEL_IN_USE', 'This outlet is referenced by platform data and must be deactivated instead');
  }
  throw error;
}

export function getSellerHotel(sellerId: string) {
  return repository.findBySellerId(sellerId);
}

export async function createSellerHotel(sellerId: string, input: HotelInput) {
  if (await repository.findBySellerId(sellerId)) throw new AppError(409, 'SELLER_ALREADY_HAS_HOTEL', 'A seller can own only one food outlet');
  await requireActiveUniversity(input.universityId);
  try {
    return await repository.create({
      ...cleanInput(input), sellerId, status: HotelStatus.PENDING, featured: false, active: true,
    });
  } catch (error) { mapWriteError(error); }
}

export async function updateSellerHotel(sellerId: string, id: string, input: HotelInput) {
  const hotel = requireHotel(await repository.findById(id));
  if (hotel.sellerId !== sellerId) throw new AppError(403, 'HOTEL_OWNERSHIP_REQUIRED', 'You can manage only your own food outlet');
  await requireActiveUniversity(input.universityId);
  const wasApproved = hotel.status === HotelStatus.APPROVED;
  try {
    return await repository.update(id, {
      ...cleanInput(input),
      ...(wasApproved ? { status: HotelStatus.PENDING, featured: false, approvedById: null, approvedAt: null } : {}),
    });
  } catch (error) { mapWriteError(error); }
}

export async function resubmitSellerHotel(sellerId: string, id: string) {
  const hotel = requireHotel(await repository.findById(id));
  if (hotel.sellerId !== sellerId) throw new AppError(403, 'HOTEL_OWNERSHIP_REQUIRED', 'You can manage only your own food outlet');
  if (hotel.status !== HotelStatus.REJECTED) throw new AppError(409, 'INVALID_HOTEL_TRANSITION', 'Only a rejected outlet can be resubmitted');
  await requireActiveUniversity(hotel.universityId);
  const updated = await repository.transition(id, HotelStatus.REJECTED, { status: HotelStatus.PENDING, rejectReason: null, approvedById: null, approvedAt: null, featured: false });
  if (!updated) throw new AppError(409, 'INVALID_HOTEL_TRANSITION', 'The outlet status changed before it could be resubmitted');
  return updated;
}

export async function listAdminHotels(filters: repository.HotelFilters) {
  const result = await repository.list(filters);
  return { hotels: result.items, pagination: { page: filters.page, limit: filters.limit, total: result.total, totalPages: Math.ceil(result.total / filters.limit), hasNextPage: filters.page * filters.limit < result.total, hasPreviousPage: filters.page > 1 } };
}

export async function getAdminHotel(id: string) {
  return requireHotel(await repository.findById(id));
}

export async function approveHotel(adminId: string, id: string) {
  const hotel = requireHotel(await repository.findById(id));
  if (hotel.status !== HotelStatus.PENDING) throw new AppError(409, 'INVALID_HOTEL_TRANSITION', 'Only a pending outlet can be approved');
  await requireActiveUniversity(hotel.universityId);
  const updated = await repository.transition(id, HotelStatus.PENDING, { status: HotelStatus.APPROVED, rejectReason: null, approvedById: adminId, approvedAt: new Date() });
  if (!updated) throw new AppError(409, 'INVALID_HOTEL_TRANSITION', 'The outlet status changed before it could be approved');
  return updated;
}

export async function rejectHotel(id: string, reason: string) {
  const hotel = requireHotel(await repository.findById(id));
  if (hotel.status !== HotelStatus.PENDING) throw new AppError(409, 'INVALID_HOTEL_TRANSITION', 'Only a pending outlet can be rejected');
  const updated = await repository.transition(id, HotelStatus.PENDING, { status: HotelStatus.REJECTED, rejectReason: clean(reason), approvedById: null, approvedAt: null, featured: false });
  if (!updated) throw new AppError(409, 'INVALID_HOTEL_TRANSITION', 'The outlet status changed before it could be rejected');
  return updated;
}

export async function setFeatured(id: string, featured: boolean) {
  const hotel = requireHotel(await repository.findById(id));
  if (featured && (hotel.status !== HotelStatus.APPROVED || !hotel.active)) throw new AppError(409, 'HOTEL_NOT_FEATUREABLE', 'Only an active approved outlet can be featured');
  return repository.update(id, { featured });
}

export async function updateAdminHotel(id: string, input: HotelInput) {
  requireHotel(await repository.findById(id));
  await requireActiveUniversity(input.universityId);
  try { return await repository.update(id, cleanInput(input)); } catch (error) { mapWriteError(error); }
}

export async function setHotelActive(id: string, active: boolean) {
  requireHotel(await repository.findById(id));
  return repository.update(id, { active, ...(!active ? { featured: false } : {}) });
}

export async function deleteHotel(id: string) {
  requireHotel(await repository.findById(id));
  try { await repository.remove(id); } catch (error) { mapWriteError(error); }
}
