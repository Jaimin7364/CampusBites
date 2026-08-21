export function phoneHref(value: string) {
  const normalized = value.replace(/[^+\d]/g, '');
  return /^\+\d{10,15}$/.test(normalized) ? `tel:${normalized}` : null;
}

export function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, '');
  return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}` : null;
}
