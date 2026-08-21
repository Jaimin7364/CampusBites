import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({
  findUniversities: vi.fn(),
  findUniversityById: vi.fn(),
  createUniversity: vi.fn(),
  updateUniversity: vi.fn(),
  deleteUniversity: vi.fn(),
}));

vi.mock('../src/repositories/university.repository.js', () => repository);

import {
  createUniversity,
  deleteUniversity,
  listPublicUniversities,
  updateUniversity,
} from '../src/services/university.service.js';

describe('university service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forces public university queries to active records', async () => {
    repository.findUniversities.mockResolvedValue({ items: [], total: 0 });
    const result = await listPublicUniversities({ page: 1, limit: 50 });
    expect(repository.findUniversities).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      active: true,
    });
    expect(result.pagination.totalPages).toBe(0);
  });

  it('normalizes whitespace when creating a university', async () => {
    repository.createUniversity.mockImplementation((input: unknown) =>
      Promise.resolve(input),
    );
    await createUniversity({
      name: 'Gujarat   Technological University',
      city: ' Ahmedabad ',
      state: '',
    });
    expect(repository.createUniversity).toHaveBeenCalledWith({
      name: 'Gujarat Technological University',
      city: 'Ahmedabad',
      state: null,
      active: true,
    });
  });

  it('maps duplicate university constraints to a conflict', async () => {
    repository.createUniversity.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.12.0',
      }),
    );
    await expect(
      createUniversity({ name: 'Same University', city: 'Same City' }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'UNIVERSITY_ALREADY_EXISTS' });
  });

  it('maps referenced deletes to a safe deactivation conflict', async () => {
    repository.deleteUniversity.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('foreign key', {
        code: 'P2003',
        clientVersion: '6.12.0',
      }),
    );
    await expect(deleteUniversity('university-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'UNIVERSITY_IN_USE',
    });
  });

  it('updates active status without requiring name and city', async () => {
    repository.updateUniversity.mockResolvedValue({ id: 'university-1', active: false });
    await updateUniversity('university-1', { active: false });
    expect(repository.updateUniversity).toHaveBeenCalledWith('university-1', {
      active: false,
    });
  });
});
