import { UserRole } from '@prisma/client';
import { compare } from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signRefreshToken } from '../src/utils/jwt.js';

const database = vi.hoisted(() => ({
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  passwordResetToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../src/config/prisma.js', () => ({ prisma: database }));
vi.mock('../src/services/mail.service.js', () => ({ sendPasswordReset: vi.fn() }));

import { login, register, rotateRefreshToken } from '../src/services/auth.service.js';

const now = new Date('2026-08-20T12:00:00.000Z');
const userRecord = {
  id: 'user-1',
  role: UserRole.USER,
  fullName: 'Aarav Shah',
  sellerName: null,
  businessOwnerName: null,
  email: 'aarav@example.com',
  phone: '+919876543210',
  passwordHash: '',
  profilePhotoUrl: null,
  active: true,
  passwordChangedAt: null,
  createdAt: now,
  updatedAt: now,
};

describe('authentication service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.refreshToken.create.mockResolvedValue({});
    database.$transaction.mockImplementation((operations: unknown) => Promise.resolve(operations));
  });

  it('normalizes identity data and hashes passwords during registration', async () => {
    database.user.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...userRecord, ...data }),
    );
    const result = await register(
      {
        role: 'USER',
        fullName: 'Aarav Shah',
        email: 'AARAV@EXAMPLE.COM',
        phone: '9876543210',
        password: 'Campus123',
      },
      {},
    );

    const createCall: unknown = database.user.create.mock.calls[0]?.[0];
    const createData = (
      createCall as {
        data: { email: string; phone: string; passwordHash: string };
      }
    ).data;
    expect(createData.email).toBe('aarav@example.com');
    expect(createData.phone).toBe('+919876543210');
    expect(await compare('Campus123', createData.passwordHash)).toBe(true);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessToken).toBeTypeOf('string');
  });

  it('returns one generic error for unknown login credentials', async () => {
    database.user.findUnique.mockResolvedValue(null);
    await expect(login('unknown@example.com', 'Wrong123', false, {})).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('revokes a refresh-token family when token reuse is detected', async () => {
    const token = signRefreshToken('user-1', UserRole.USER, 'family-1', 7).token;
    database.refreshToken.findUnique.mockResolvedValue(null);

    await expect(rotateRefreshToken(token, {})).rejects.toMatchObject({
      statusCode: 401,
      code: 'REFRESH_TOKEN_REUSED',
    });
    const revokeCall: unknown = database.refreshToken.updateMany.mock.calls[0]?.[0];
    const revokeInput = revokeCall as {
      where: { familyId: string; revokedAt: null };
      data: { revokedAt: Date };
    };
    expect(revokeInput.where).toEqual({ familyId: 'family-1', revokedAt: null });
    expect(revokeInput.data.revokedAt).toBeInstanceOf(Date);
  });
});
