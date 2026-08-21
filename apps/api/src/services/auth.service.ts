import { randomUUID } from 'node:crypto';
import type { UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { createSecureToken, hashToken } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { normalizeIndianPhone } from '../utils/phone.js';
import { toPublicUser } from '../utils/user.js';
import { sendPasswordReset } from './mail.service.js';

type RequestMetadata = { userAgent?: string; ipAddress?: string };
type RegisterInput = {
  role: 'USER' | 'SELLER';
  fullName?: string;
  sellerName?: string;
  businessOwnerName?: string;
  email: string;
  phone: string;
  password: string;
};

function conflictFromPrisma(error: unknown): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    throw new AppError(409, 'ACCOUNT_ALREADY_EXISTS', 'An account with that email or phone already exists');
  }
  throw error;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function createSession(
  user: { id: string; role: UserRole },
  rememberMe: boolean,
  metadata: RequestMetadata,
  familyId = randomUUID(),
) {
  const ttlDays = rememberMe
    ? env.REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS
    : env.REFRESH_TOKEN_TTL_DAYS;
  const accessToken = signAccessToken(user.id, user.role);
  const refresh = signRefreshToken(user.id, user.role, familyId, ttlDays);
  await prisma.refreshToken.create({
    data: {
      id: refresh.jti,
      userId: user.id,
      tokenHash: hashToken(refresh.token),
      familyId,
      expiresAt: addDays(new Date(), ttlDays),
      userAgent: metadata.userAgent?.slice(0, 500) ?? null,
      ipAddress: metadata.ipAddress?.slice(0, 45) ?? null,
    },
  });
  return { accessToken, refreshToken: refresh.token, refreshTokenTtlDays: ttlDays };
}

export async function register(input: RegisterInput, metadata: RequestMetadata) {
  try {
    const user = await prisma.user.create({
      data: {
        role: input.role,
        fullName: input.fullName ?? null,
        sellerName: input.sellerName ?? null,
        businessOwnerName: input.businessOwnerName ?? null,
        email: input.email.toLowerCase(),
        phone: normalizeIndianPhone(input.phone),
        passwordHash: await hash(input.password, env.BCRYPT_ROUNDS),
      },
    });
    const session = await createSession(user, false, metadata);
    return { user: toPublicUser(user), ...session };
  } catch (error) {
    conflictFromPrisma(error);
  }
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
  metadata: RequestMetadata,
) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await compare(password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  if (!user.active) {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'This account is disabled');
  }
  const session = await createSession(user, rememberMe, metadata);
  return { user: toPublicUser(user), ...session };
}

export async function rotateRefreshToken(rawToken: string, metadata: RequestMetadata) {
  const claims = verifyRefreshToken(rawToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { familyId: claims.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, 'REFRESH_TOKEN_REUSED', 'The refresh session is no longer valid');
  }
  if (
    storedToken.id !== claims.jti ||
    storedToken.userId !== claims.sub ||
    storedToken.expiresAt <= new Date() ||
    !storedToken.user.active
  ) {
    throw new AppError(401, 'INVALID_SESSION', 'The refresh session is no longer valid');
  }

  const remainingMs = storedToken.expiresAt.getTime() - Date.now();
  const ttlDays = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const next = signRefreshToken(
    storedToken.user.id,
    storedToken.user.role,
    storedToken.familyId,
    ttlDays,
  );

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        id: next.jti,
        userId: storedToken.user.id,
        tokenHash: hashToken(next.token),
        familyId: storedToken.familyId,
        expiresAt: storedToken.expiresAt,
        userAgent: metadata.userAgent?.slice(0, 500) ?? null,
        ipAddress: metadata.ipAddress?.slice(0, 45) ?? null,
      },
    }),
  ]);

  return {
    user: toPublicUser(storedToken.user),
    accessToken: signAccessToken(storedToken.user.id, storedToken.user.role),
    refreshToken: next.token,
    refreshTokenTtlDays: ttlDays,
  };
}

export async function logout(rawToken?: string) {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user?.active) return;

  const rawToken = createSecureToken();
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt },
    }),
  ]);
  sendPasswordReset(user.email, rawToken);
}

export async function resetPassword(rawToken: string, password: string) {
  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!token || token.usedAt || token.expiresAt <= new Date()) {
    throw new AppError(400, 'INVALID_RESET_TOKEN', 'Password reset token is invalid or expired');
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash: await hash(password, env.BCRYPT_ROUNDS), passwordChangedAt: now },
    }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: now } }),
    prisma.refreshToken.updateMany({
      where: { userId: token.userId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found');
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  role: UserRole,
  input: {
    fullName?: string;
    sellerName?: string;
    businessOwnerName?: string;
    phone?: string;
    profilePhotoUrl?: string | null;
  },
) {
  if (role === 'USER' && (input.sellerName || input.businessOwnerName)) {
    throw new AppError(422, 'INVALID_PROFILE_FIELDS', 'Seller fields cannot be changed for a user');
  }
  if (role === 'SELLER' && input.fullName) {
    throw new AppError(422, 'INVALID_PROFILE_FIELDS', 'User name cannot be changed for a seller');
  }
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        ...(input.phone ? { phone: normalizeIndianPhone(input.phone) } : {}),
      },
    });
    return toPublicUser(user);
  } catch (error) {
    conflictFromPrisma(error);
  }
}

export async function changePassword(userId: string, current: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await compare(current, user.passwordHash))) {
    throw new AppError(400, 'CURRENT_PASSWORD_INCORRECT', 'Current password is incorrect');
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hash(password, env.BCRYPT_ROUNDS), passwordChangedAt: now },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);
}
