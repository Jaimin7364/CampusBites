import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { attachOrderSocket, clearOrderSocket } from './socket/order-socket.js';
import { cleanupExpiredAuthRecords } from './services/token-cleanup.service.js';

const server = createServer(createApp());
const io = attachOrderSocket(server);

server.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT }, 'CampusBites API is listening');
});

const cleanup = () => cleanupExpiredAuthRecords(new Date(), env.TOKEN_RETENTION_DAYS).then((result) => logger.info(result, 'Scheduled authentication record cleanup complete')).catch((error: unknown) => logger.error({ err: error }, 'Scheduled authentication record cleanup failed'));
void cleanup();
const cleanupTimer = setInterval(() => void cleanup(), env.TOKEN_CLEANUP_INTERVAL_MINUTES * 60_000);
cleanupTimer.unref();

let shuttingDown = false;
function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');
  clearInterval(cleanupTimer);
  const forcedExit = setTimeout(() => { logger.fatal({ signal }, 'Graceful shutdown timed out'); process.exit(1); }, env.SHUTDOWN_TIMEOUT_SECONDS * 1000);
  forcedExit.unref();
  clearOrderSocket(io);
  io.disconnectSockets(true);
  server.close(() => {
    void io.close().finally(() => prisma.$disconnect()).finally(() => {
      clearTimeout(forcedExit);
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => { logger.fatal({ err: error }, 'Uncaught exception'); shutdown('uncaughtException'); });
process.on('unhandledRejection', (error) => { logger.fatal({ err: error }, 'Unhandled rejection'); shutdown('unhandledRejection'); });
