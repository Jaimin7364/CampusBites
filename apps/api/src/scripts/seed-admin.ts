import { hash } from 'bcrypt';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/prisma.js';

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PHONE || !env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD are required');
  }

  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL.toLowerCase() },
    update: {
      fullName: env.ADMIN_NAME,
      phone: env.ADMIN_PHONE,
      passwordHash: await hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS),
      role: 'ADMIN',
      active: true,
      passwordChangedAt: new Date(),
    },
    create: {
      fullName: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      phone: env.ADMIN_PHONE,
      passwordHash: await hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS),
      role: 'ADMIN',
    },
    select: { id: true, email: true, role: true },
  });

  logger.info({ admin }, 'Admin account is ready');
}

seedAdmin()
  .catch((error: unknown) => {
    logger.error({ err: error }, 'Admin seed failed');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
