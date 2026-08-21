import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../errors/app-error.js';
import { tokenPredatesPasswordChange, verifyAccessToken } from '../utils/jwt.js';

export const authenticate: RequestHandler = async (request, _response, next) => {
  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
    return;
  }

  try {
    const claims = verifyAccessToken(authorization.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, role: true, active: true, passwordChangedAt: true },
    });
    if (!user?.active || user.role !== claims.role || tokenPredatesPasswordChange(claims, user.passwordChangedAt)) {
      next(new AppError(401, 'INVALID_SESSION', 'The session is no longer valid'));
      return;
    }
    request.auth = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};
