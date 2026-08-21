import { z } from 'zod';

const cleanText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(2, `${label} must contain at least 2 characters`)
    .max(maximum, `${label} must contain at most ${maximum} characters`)
    .regex(/^[\p{L}\p{N} .,'&()/-]+$/u, `${label} contains unsupported characters`);

export const universityIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createUniversitySchema = z.object({
  name: cleanText('University name', 191),
  city: cleanText('City', 120),
  state: cleanText('State', 120).nullable().optional(),
  active: z.boolean().optional().default(true),
});

export const updateUniversitySchema = z
  .object({
    name: cleanText('University name', 191).optional(),
    city: cleanText('City', 120).optional(),
    state: cleanText('State', 120).nullable().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'Provide at least one university field',
  });

export const universityStatusSchema = z.object({ active: z.boolean() });

const pagination = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
};

export const publicUniversityQuerySchema = z.object({
  ...pagination,
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const adminUniversityQuerySchema = z.object({
  ...pagination,
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
