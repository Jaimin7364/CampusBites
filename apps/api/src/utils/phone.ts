export function normalizeIndianPhone(phone: string) {
  const digits = phone.replace(/[\s()-]/g, '').replace(/^\+91/, '').replace(/^0/, '');
  return `+91${digits}`;
}
