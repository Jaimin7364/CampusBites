import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/app-error.js';

export function validateBody(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(
        new AppError(422, 'VALIDATION_ERROR', 'Request validation failed', {
          fields: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        }),
      );
      return;
    }
    request.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      next(
        new AppError(422, 'VALIDATION_ERROR', 'Query validation failed', {
          fields: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        }),
      );
      return;
    }
    request.validatedQuery = result.data;
    next();
  };
}

export function validateParams(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      next(
        new AppError(422, 'VALIDATION_ERROR', 'Route parameter validation failed', {
          fields: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        }),
      );
      return;
    }
    request.validatedParams = result.data;
    next();
  };
}
