import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error.js';
import * as repository from '../repositories/university.repository.js';

type UniversityInput = {
  name?: string;
  city?: string;
  state?: string | null;
  active?: boolean;
};

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function cleanInput(input: UniversityInput) {
  return {
    ...(input.name ? { name: clean(input.name) } : {}),
    ...(input.city ? { city: clean(input.city) } : {}),
    ...(input.state !== undefined
      ? { state: input.state === null || input.state === '' ? null : clean(input.state) }
      : {}),
    ...(input.active === undefined ? {} : { active: input.active }),
  };
}

function handleWriteError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new AppError(
        409,
        'UNIVERSITY_ALREADY_EXISTS',
        'A university with this name already exists in that city',
      );
    }
    if (error.code === 'P2025') {
      throw new AppError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found');
    }
    if (error.code === 'P2003') {
      throw new AppError(
        409,
        'UNIVERSITY_IN_USE',
        'This university is referenced by platform data and cannot be deleted. Deactivate it instead.',
      );
    }
  }
  throw error;
}

export async function listPublicUniversities(filters: {
  page: number;
  limit: number;
  search?: string;
  city?: string;
}) {
  return listUniversities({ ...filters, active: true });
}

export async function listUniversities(filters: repository.UniversityFilters) {
  const result = await repository.findUniversities(filters);
  return {
    universities: result.items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.limit),
      hasNextPage: filters.page * filters.limit < result.total,
      hasPreviousPage: filters.page > 1,
    },
  };
}

export async function getUniversity(id: string) {
  const university = await repository.findUniversityById(id);
  if (!university) {
    throw new AppError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found');
  }
  return university;
}

export async function createUniversity(input: UniversityInput) {
  try {
    return await repository.createUniversity({
      name: clean(input.name!),
      city: clean(input.city!),
      state: input.state ? clean(input.state) : null,
      active: input.active ?? true,
    });
  } catch (error) {
    handleWriteError(error);
  }
}

export async function updateUniversity(id: string, input: UniversityInput) {
  try {
    return await repository.updateUniversity(id, cleanInput(input));
  } catch (error) {
    handleWriteError(error);
  }
}

export async function setUniversityStatus(id: string, active: boolean) {
  return updateUniversity(id, { active });
}

export async function deleteUniversity(id: string) {
  try {
    await repository.deleteUniversity(id);
  } catch (error) {
    handleWriteError(error);
  }
}
