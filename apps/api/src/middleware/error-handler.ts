import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { mapPrismaError } from '../errors/prisma-error.js';
import { logger } from '../config/logger.js';
import type { ApiErrorBody } from '../types/api.js';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const localRequestId: unknown = response.locals.requestId;
  const requestId = typeof localRequestId === 'string' ? localRequestId : undefined;
  const handledError = error instanceof AppError ? error : mapPrismaError(error);
  const statusCode = handledError?.statusCode ?? 500;
  const message = handledError?.message ?? 'An unexpected error occurred';
  const code = handledError?.code ?? 'INTERNAL_SERVER_ERROR';

  if (statusCode >= 500) {
    logger.error({ err: error, requestId }, message);
  }

  const body: ApiErrorBody = {
    success: false,
    error: {
      code,
      message,
      ...(handledError?.details !== undefined
        ? { details: handledError.details }
        : {}),
    },
    ...(requestId ? { requestId } : {}),
  };

  response.status(statusCode).json(body);
};
