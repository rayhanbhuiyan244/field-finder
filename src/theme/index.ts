// Centralized theme tokens.
// This mirrors the CSS variables defined in src/styles/global.css so that
// non-CSS code (charts, JS-driven styles, docs) can reference the same
// palette without hardcoding oklch/hex values.
//
// Rule: do NOT change appearance here — only mirror what CSS defines.
// If you need a new value, add it to global.css first, then mirror it here.

export const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  success: "var(--success)",
  successForeground: "var(--success-foreground)",
  warning: "var(--warning)",
  warningForeground: "var(--warning-foreground)",
  border: "var(--border)",
  ring: "var(--ring)",
} as const;

// Raw oklch values, ONLY for libraries (e.g. recharts) that can't consume
// CSS variables. Keep in sync with global.css.
export const chartColors = {
  primary: "oklch(0.36 0.13 258)",
  secondary: "oklch(0.66 0.16 148)",
  accent: "oklch(0.66 0.16 148)",
  warning: "oklch(0.78 0.16 75)",
  destructive: "oklch(0.6 0.22 27)",
  muted: "oklch(0.5 0.03 258)",
  border: "oklch(0.92 0.008 258)",
} as const;

export const typography = {
  fontSans:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
} as const;

export const radius = {
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
  "2xl": "calc(var(--radius) + 8px)",
  full: "9999px",
} as const;

export const shadows = {
  soft: "0 4px 14px -6px oklch(0.36 0.13 258 / 0.15), 0 2px 6px -2px oklch(0.36 0.13 258 / 0.08)",
  sm: "0 2px 8px -4px rgba(15,23,42,0.06)",
  md: "0 4px 20px -8px rgba(15,23,42,0.15)",
  lg: "0 20px 40px -20px rgba(15,23,42,0.25)",
} as const;

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const theme = {
  colors,
  chartColors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
} as const;

export type Theme = typeof theme;