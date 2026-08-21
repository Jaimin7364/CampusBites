import { describe, expect, it } from 'vitest';
import {
  adminUniversityQuerySchema,
  createUniversitySchema,
  publicUniversityQuerySchema,
  updateUniversitySchema,
} from '../src/validators/university.validators.js';

describe('university validators', () => {
  it('trims valid university input and supplies active default', () => {
    expect(
      createUniversitySchema.parse({
        name: '  Gujarat Technological University  ',
        city: ' Ahmedabad ',
        state: ' Gujarat ',
      }),
    ).toEqual({
      name: 'Gujarat Technological University',
      city: 'Ahmedabad',
      state: 'Gujarat',
      active: true,
    });
  });

  it('rejects empty updates and unsupported characters', () => {
    expect(updateUniversitySchema.safeParse({}).success).toBe(false);
    expect(
      createUniversitySchema.safeParse({ name: '<script>', city: 'Ahmedabad' }).success,
    ).toBe(false);
  });

  it('applies bounded public pagination defaults', () => {
    expect(publicUniversityQuerySchema.parse({})).toEqual({ page: 1, limit: 50 });
    expect(publicUniversityQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('parses the admin active filter as a boolean', () => {
    expect(adminUniversityQuerySchema.parse({ active: 'false' }).active).toBe(false);
  });
});
