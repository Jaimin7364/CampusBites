export function rupeesToPaise(value: string) {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [rupees, paise = ''] = normalized.split('.');
  const result = Number.parseInt(rupees!, 10) * 100 + Number.parseInt(paise.padEnd(2, '0') || '0', 10);
  return Number.isSafeInteger(result) ? result : null;
}

export function paiseToInput(paise: number) {
  return `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, '0')}`;
}

export function formatInr(paise: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(paise / 100);
}
