import { describe, expect, it } from 'vitest';
import { phoneHref, whatsappHref } from './contact';

describe('contact links', () => {
  it('creates safe phone and WhatsApp links from normalized Indian numbers', () => {
    expect(phoneHref('+919876543210')).toBe('tel:+919876543210');
    expect(whatsappHref('+919876543210')).toBe('https://wa.me/919876543210');
  });
  it('rejects unsafe or incomplete values', () => {
    expect(phoneHref('javascript:alert(1)')).toBeNull();
    expect(whatsappHref('123')).toBeNull();
  });
});
