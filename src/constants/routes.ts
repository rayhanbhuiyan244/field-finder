// Central route path constants. Keep in sync with files in src/routes/.
export const ROUTES = {
  HOME: "/",
  AVAILABILITY: "/availability",
  GALLERY: "/gallery",
  PRICING: "/pricing",
  CONTACT: "/contact",
  BOOKING: "/booking",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];