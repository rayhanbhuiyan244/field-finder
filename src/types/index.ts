// Central re-exports for shared domain types.
// Prefer importing from "@/types" instead of individual service modules
// when only the type shape is needed.

export type { UserProfile, UserRole } from "@/services/userService";
export type { Booking } from "@/services/bookingService";
export type { PricingRule } from "@/services/pricingService";
export type { Review } from "@/services/reviewService";
export type { GalleryImage, BusinessSettings } from "@/services/gallerySettingsService";
export type { AppNotification } from "@/services/notificationService";
export type {
  BookingStatus,
  PaymentStatus,
  SlotStatus,
  Role,
} from "@/constants";