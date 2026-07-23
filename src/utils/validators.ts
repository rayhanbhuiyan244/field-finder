// Small, dependency-free validators.

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value: string): boolean {
  // Accept 10-15 digits, allow spaces / +, - separators.
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function minLength(value: string, n: number): boolean {
  return value.trim().length >= n;
}
