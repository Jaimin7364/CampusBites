import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type UniversityFilters = {
  page: number;
  limit: number;
  search?: string;
  city?: string;
  active?: boolean;
};

function buildWhere(filters: UniversityFilters): Prisma.UniversityWhereInput {
  return {
    ...(filters.active === undefined ? {} : { active: filters.active }),
    ...(filters.city ? { city: { equals: filters.city } } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search } },
            { city: { contains: filters.search } },
            { state: { contains: filters.search } },
          ],
        }
      : {}),
  };
}

export async function findUniversities(filters: UniversityFilters) {
  const where = buildWhere(filters);
  const [items, total] = await prisma.$transaction([
    prisma.university.findMany({
      where,
      orderBy: [{ name: 'asc' }, { city: 'asc' }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.university.count({ where }),
  ]);
  return { items, total };
}

export function findUniversityById(id: string) {
  return prisma.university.findUnique({ where: { id } });
}

export function createUniversity(data: Prisma.UniversityCreateInput) {
  return prisma.university.create({ data });
}

export function updateUniversity(id: string, data: Prisma.UniversityUpdateInput) {
  return prisma.university.update({ where: { id }, data });
}

export function deleteUniversity(id: string) {
  return prisma.university.delete({ where: { id } });
}
