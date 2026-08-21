import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../errors/app-error.js';
import { checkDatabase } from '../services/health.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const getHealth: RequestHandler = (_request, response) => {
  sendSuccess(response, {
    service: 'campusbites-api',
    status: 'up',
    timestamp: new Date().toISOString(),
  });
};

export const getDatabaseHealth: RequestHandler = async (_request, response) => {
  try {
    const database = await checkDatabase(prisma);
    sendSuccess(response, {
      service: 'campusbites-database',
      ...database,
      timestamp: new Date().toISOString(),
    });
  } catch {
    throw new AppError(
      503,
      'DATABASE_UNAVAILABLE',
      'Database health check failed',
    );
  }
};
