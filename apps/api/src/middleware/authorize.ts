import type { UserRole } from '@prisma/client';
import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

export function authorize(...roles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
      return;
    }
    if (!roles.includes(request.auth.role)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission for this action'));
      return;
    }
    next();
  };
}
