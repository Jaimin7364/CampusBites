import { randomUUID } from 'node:crypto';
import type { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

type BaseClaims = {
  sub: string;
  role: UserRole;
  tokenType: 'access' | 'refresh';
};

export type AccessClaims = BaseClaims & { tokenType: 'access' };
export type RefreshClaims = BaseClaims & {
  tokenType: 'refresh';
  jti: string;
  familyId: string;
};

const jwtOptions = { issuer: 'campusbites-api', audience: 'campusbites-web' } as const;

export function signAccessToken(userId: string, role: UserRole) {
  return jwt.sign(
    { role, tokenType: 'access' },
    env.JWT_ACCESS_SECRET,
    {
      ...jwtOptions,
      subject: userId,
      expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
    },
  );
}

export function signRefreshToken(
  userId: string,
  role: UserRole,
  familyId: string,
  ttlDays: number,
) {
  const jti = randomUUID();
  const token = jwt.sign(
    { role, tokenType: 'refresh', familyId },
    env.JWT_REFRESH_SECRET,
    {
      ...jwtOptions,
      subject: userId,
      jwtid: jti,
      expiresIn: ttlDays * 24 * 60 * 60,
    },
  );
  return { token, jti };
}

function verify<T>(token: string, secret: string, expectedType: string): T {
  try {
    const claims = jwt.verify(token, secret, jwtOptions);
    if (
      typeof claims === 'string' ||
      claims.tokenType !== expectedType ||
      typeof claims.sub !== 'string'
    ) {
      throw new Error('Unexpected token claims');
    }
    return claims as T;
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Authentication token is invalid or expired');
  }
}

export function verifyAccessToken(token: string) {
  return verify<AccessClaims>(token, env.JWT_ACCESS_SECRET, 'access');
}

export function verifyRefreshToken(token: string) {
  return verify<RefreshClaims>(token, env.JWT_REFRESH_SECRET, 'refresh');
}
