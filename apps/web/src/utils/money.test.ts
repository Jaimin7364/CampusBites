import { describe, expect, it } from 'vitest';
import { formatInr, paiseToInput, rupeesToPaise } from './money';

describe('money utilities', () => {
  it('converts rupee strings to integer paise without floating-point arithmetic', () => {
    expect(rupeesToPaise('85')).toBe(8500);
    expect(rupeesToPaise('85.5')).toBe(8550);
    expect(rupeesToPaise('85.05')).toBe(8505);
  });

  it('rejects malformed prices and formats stored paise for forms and display', () => {
    expect(rupeesToPaise('85.555')).toBeNull();
    expect(rupeesToPaise('-2')).toBeNull();
    expect(paiseToInput(8505)).toBe('85.05');
    expect(formatInr(8505)).toContain('85.05');
  });
});
