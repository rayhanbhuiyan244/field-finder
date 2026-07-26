// Formatting helpers shared across the app. Keep pure and framework-free.

export function formatCurrency(
  amount: number,
  currency: string = "BDT",
  locale: string = "en-BD",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function formatDate(
  input: string | number | Date,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
  locale: string = "en-GB",
): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export function formatTime(input: string | number | Date, locale: string = "en-GB"): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function toISODate(d: Date = new Date()): string {
  // Local YYYY-MM-DD. `toISOString()` returns UTC, which shifts the day by
  // one for timezones east of UTC after ~18:00 local (e.g. BDT/IST users
  // seeing tomorrow's date for bookings made in the evening).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
