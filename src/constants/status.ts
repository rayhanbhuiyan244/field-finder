export const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  PAID: "paid",
  PENDING: "pending",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const SLOT_STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  SELECTED: "selected",
  MAINTENANCE: "maintenance",
} as const;

export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];
