import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { mapPrismaError } from '../src/errors/prisma-error.js';

describe('Prisma error mapping', () => {
  it('maps database initialization failures to a useful 503', () => {
    const error = new Prisma.PrismaClientInitializationError(
      'Cannot reach database server',
      '6.12.0',
    );
    expect(mapPrismaError(error)).toMatchObject({
      statusCode: 503,
      code: 'DATABASE_UNAVAILABLE',
    });
  });

  it('leaves unrelated errors untouched', () => {
    expect(mapPrismaError(new Error('application bug'))).toBeNull();
  });
});
