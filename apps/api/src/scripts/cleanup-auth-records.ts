import { env } from '../config/env.js'; import { logger } from '../config/logger.js'; import { prisma } from '../config/prisma.js'; import { cleanupExpiredAuthRecords } from '../services/token-cleanup.service.js';
try { const result = await cleanupExpiredAuthRecords(new Date(), env.TOKEN_RETENTION_DAYS); logger.info(result, 'Expired authentication records cleaned'); }
catch (error) { logger.error({ err: error }, 'Authentication record cleanup failed'); process.exitCode = 1; }
finally { await prisma.$disconnect(); }
