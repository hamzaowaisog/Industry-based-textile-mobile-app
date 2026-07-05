export const sanitizeDecimalInput = (value: string): string => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
};

export const sanitizeSignedDecimalInput = (value: string): string => {
  const negative = value.trimStart().startsWith('-');
  const sanitized = sanitizeDecimalInput(value);
  return negative ? `-${sanitized}` : sanitized;
};
