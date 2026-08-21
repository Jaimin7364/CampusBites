import { Prisma } from '@prisma/client';
import { AppError } from './app-error.js';

export function mapPrismaError(error: unknown): AppError | null {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      503,
      'DATABASE_UNAVAILABLE',
      'The database is unavailable. Start MySQL and try again.',
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (['P1000', 'P1001', 'P1002', 'P1008', 'P1017'].includes(error.code)) {
      return new AppError(
        503,
        'DATABASE_UNAVAILABLE',
        'The database is unavailable. Check the database connection and try again.',
      );
    }
    if (error.code === 'P2021' || error.code === 'P2022') {
      return new AppError(
        503,
        'DATABASE_MIGRATION_REQUIRED',
        'The database schema is not ready. Apply the latest migrations and try again.',
      );
    }
  }

  return null;
}
