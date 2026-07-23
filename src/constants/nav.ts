import { ROUTES } from "./routes";

export interface NavItem {
  to: string;
  label: string;
}

export const PUBLIC_NAV: NavItem[] = [
  { to: ROUTES.HOME, label: "Home" },
  { to: ROUTES.AVAILABILITY, label: "Availability" },
  { to: ROUTES.GALLERY, label: "Gallery" },
  { to: ROUTES.PRICING, label: "Pricing" },
  { to: ROUTES.CONTACT, label: "Contact" },
];
