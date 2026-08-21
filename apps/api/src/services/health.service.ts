import type { PrismaClient } from '@prisma/client';

export interface DatabaseHealth {
  status: 'up' | 'down';
}

export async function checkDatabase(
  database: Pick<PrismaClient, '$queryRaw'>,
): Promise<DatabaseHealth> {
  await database.$queryRaw`SELECT 1`;
  return { status: 'up' };
}
