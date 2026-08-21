import { describe, expect, it } from 'vitest';
import {
  registerSellerSchema,
  registerUserSchema,
  resetPasswordSchema,
} from '../src/validators/auth.validators.js';

describe('authentication validators', () => {
  it('accepts a valid user registration', () => {
    const result = registerUserSchema.safeParse({
      fullName: 'Aarav Shah',
      email: 'AARAV@example.com',
      phone: '9876543210',
      password: 'Campus123',
      confirmPassword: 'Campus123',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('aarav@example.com');
  });

  it('rejects invalid Indian numbers and mismatched passwords', () => {
    const result = registerUserSchema.safeParse({
      fullName: 'Aarav Shah',
      email: 'aarav@example.com',
      phone: '12345',
      password: 'Campus123',
      confirmPassword: 'Different123',
    });
    expect(result.success).toBe(false);
  });

  it('requires both seller identity fields', () => {
    const result = registerSellerSchema.safeParse({
      sellerName: 'Campus Cafe',
      email: 'seller@example.com',
      phone: '+919876543211',
      password: 'Campus123',
      confirmPassword: 'Campus123',
    });
    expect(result.success).toBe(false);
  });

  it('enforces strong passwords during reset', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'a'.repeat(64),
      password: 'weakpass',
      confirmPassword: 'weakpass',
    });
    expect(result.success).toBe(false);
  });
});
