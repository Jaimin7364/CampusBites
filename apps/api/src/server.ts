import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { attachOrderSocket, clearOrderSocket } from './socket/order-socket.js';

const server = createServer(createApp());
const io = attachOrderSocket(server);

server.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT }, 'CampusBites API is listening');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Graceful shutdown started');
  clearOrderSocket(io);
  io.disconnectSockets(true);
  server.close(() => {
    void io.close().finally(() => prisma.$disconnect()).finally(() => {
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
