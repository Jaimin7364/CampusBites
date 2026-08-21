import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

const server = createServer(createApp());

server.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT }, 'CampusBites API is listening');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Graceful shutdown started');
  server.close(() => {
    void prisma.$disconnect().finally(() => {
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
