import { UserRole } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { AppError } from '../src/errors/app-error.js';
import {
  signAccessToken,
  signRefreshToken,
  tokenPredatesPasswordChange,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/utils/jwt.js';

describe('JWT utilities', () => {
  it('signs and verifies typed access claims', () => {
    const token = signAccessToken('user-1', UserRole.USER);
    expect(verifyAccessToken(token)).toMatchObject({
      sub: 'user-1',
      role: UserRole.USER,
      tokenType: 'access',
    });
  });

  it('signs refresh claims with session identifiers', () => {
    const result = signRefreshToken('seller-1', UserRole.SELLER, 'family-1', 7);
    expect(verifyRefreshToken(result.token)).toMatchObject({
      sub: 'seller-1',
      role: UserRole.SELLER,
      tokenType: 'refresh',
      familyId: 'family-1',
      jti: result.jti,
    });
  });

  it('does not accept a refresh token as an access token', () => {
    const token = signRefreshToken('user-1', UserRole.USER, 'family-1', 7).token;
    expect(() => verifyAccessToken(token)).toThrow(AppError);
  });

  it('invalidates access tokens issued before a password change', () => {
    expect(tokenPredatesPasswordChange({ iat: 1_000 }, new Date(1_002_000))).toBe(true);
    expect(tokenPredatesPasswordChange({ iat: 1_000 }, new Date(1_000_500))).toBe(false);
    expect(tokenPredatesPasswordChange({}, new Date())).toBe(true);
    expect(tokenPredatesPasswordChange({ iat: 1_000 }, null)).toBe(false);
  });
});
