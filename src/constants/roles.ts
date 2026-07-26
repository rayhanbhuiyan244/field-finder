export const ROLES = {
  CUSTOMER: "customer",
  OWNER: "owner",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
