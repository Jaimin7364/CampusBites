import type { HotelStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type HotelFilters = {
  page: number;
  limit: number;
  search?: string;
  universityId?: string;
  status?: HotelStatus;
  featured?: boolean;
  active?: boolean;
};

export const hotelInclude = {
  university: { select: { id: true, name: true, city: true, state: true, active: true } },
  seller: {
    select: { id: true, sellerName: true, businessOwnerName: true, email: true, phone: true },
  },
  approvedBy: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.HotelInclude;

export function findBySellerId(sellerId: string) {
  return prisma.hotel.findUnique({ where: { sellerId }, include: hotelInclude });
}

export function findById(id: string) {
  return prisma.hotel.findUnique({ where: { id }, include: hotelInclude });
}

export function findPublicById(id: string) {
  return prisma.hotel.findUnique({
    where: { id },
    select: {
      id: true,
      universityId: true,
      hotelName: true,
      address: true,
      phone: true,
      whatsappNumber: true,
      description: true,
      hotelImageUrl: true,
      menuImageUrl: true,
      openTime: true,
      closeTime: true,
      featured: true,
      active: true,
      status: true,
      university: { select: { id: true, name: true, city: true, state: true, active: true } },
    },
  });
}

export const publicHotelSelect = {
  id: true,
  universityId: true,
  hotelName: true,
  address: true,
  phone: true,
  whatsappNumber: true,
  description: true,
  hotelImageUrl: true,
  menuImageUrl: true,
  openTime: true,
  closeTime: true,
  featured: true,
  active: true,
  status: true,
  university: { select: { id: true, name: true, city: true, state: true, active: true } },
} satisfies Prisma.HotelSelect;

export function listPublicCandidates(filters: { universityId: string; search?: string; featured?: boolean }) {
  return prisma.hotel.findMany({
    where: {
      universityId: filters.universityId,
      status: 'APPROVED',
      active: true,
      university: { is: { active: true } },
      ...(filters.featured === undefined ? {} : { featured: filters.featured }),
      ...(filters.search ? { hotelName: { contains: filters.search } } : {}),
    },
    select: publicHotelSelect,
    orderBy: [{ featured: 'desc' }, { hotelName: 'asc' }],
  });
}

export function create(data: Prisma.HotelUncheckedCreateInput) {
  return prisma.hotel.create({ data, include: hotelInclude });
}

export function update(id: string, data: Prisma.HotelUncheckedUpdateInput) {
  return prisma.hotel.update({ where: { id }, data, include: hotelInclude });
}

export async function transition(
  id: string,
  fromStatus: HotelStatus,
  data: Prisma.HotelUncheckedUpdateManyInput,
) {
  const result = await prisma.hotel.updateMany({ where: { id, status: fromStatus }, data });
  return result.count === 1 ? findById(id) : null;
}

export function remove(id: string) {
  return prisma.hotel.delete({ where: { id } });
}

export async function list(filters: HotelFilters) {
  const where: Prisma.HotelWhereInput = {
    ...(filters.universityId ? { universityId: filters.universityId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.featured === undefined ? {} : { featured: filters.featured }),
    ...(filters.active === undefined ? {} : { active: filters.active }),
    ...(filters.search
      ? {
          OR: [
            { hotelName: { contains: filters.search } },
            { address: { contains: filters.search } },
            { seller: { is: { sellerName: { contains: filters.search } } } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.hotel.findMany({
      where,
      include: hotelInclude,
      orderBy: [{ createdAt: 'desc' }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.hotel.count({ where }),
  ]);
  return { items, total };
}
