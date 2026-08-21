import { z } from 'zod';

const name = z.string().trim().min(2).max(120);
const email = z.string().trim().toLowerCase().email().max(191);
const phone = z
  .string()
  .trim()
  .regex(/^(?:\+91|0)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number');
const password = z
  .string()
  .min(8)
  .max(128)
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number');

function passwordsMatch<T extends { password: string; confirmPassword: string }>(data: T) {
  return data.password === data.confirmPassword;
}

export const registerUserSchema = z
  .object({
    fullName: name,
    email,
    phone,
    password,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerSellerSchema = z
  .object({
    sellerName: name,
    businessOwnerName: name,
    email,
    phone,
    password,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    password,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z
  .object({
    fullName: name.optional(),
    sellerName: name.optional(),
    businessOwnerName: name.optional(),
    phone: phone.optional(),
    profilePhotoUrl: z.url().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one profile field',
  });
