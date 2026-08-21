import { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { authorize } from '../src/middleware/authorize.js';

describe('role authorization middleware', () => {
  it('allows the requested role', () => {
    const request = { auth: { userId: 'seller-1', role: UserRole.SELLER } } as Request;
    const next = vi.fn();
    authorize(UserRole.SELLER)(request, {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith();
  });

  it('forbids the wrong role', () => {
    const request = { auth: { userId: 'user-1', role: UserRole.USER } } as Request;
    const next = vi.fn();
    authorize(UserRole.ADMIN)(request, {} as Response, next as NextFunction);
    expect(next.mock.calls[0]?.[0]).toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });
});
