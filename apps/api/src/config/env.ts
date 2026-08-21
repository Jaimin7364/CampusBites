import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

config({
  path: [
    fileURLToPath(new URL('../../../../.env', import.meta.url)),
    fileURLToPath(new URL('../../.env', import.meta.url)),
  ],
  quiet: true,
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('mysql://campusbites:campusbites@localhost:3306/campusbites'),
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
  BUSINESS_TIME_ZONE: z.string().min(1).default('Asia/Kolkata'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default('development-access-secret-change-me-123456789'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default('development-refresh-secret-change-me-12345678'),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .default(30),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .default(false),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PHONE: z.string().regex(/^\+91[6-9]\d{9}$/).optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  ADMIN_NAME: z.string().min(2).max(120).default('CampusBites Admin'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const problems = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
  throw new Error(`Invalid environment configuration: ${problems}`);
}

export const env = result.data;

if (
  env.NODE_ENV === 'production' &&
  (env.JWT_ACCESS_SECRET.startsWith('development-') ||
    env.JWT_REFRESH_SECRET.startsWith('development-'))
) {
  throw new Error('Production requires unique JWT access and refresh secrets');
}
