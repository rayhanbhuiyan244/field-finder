import { describe, it, expect } from "vitest";
import { slotLockId } from "@/services/bookingService";

describe("slotLockId", () => {
  it("is deterministic for the same (date, timeSlot)", () => {
    const a = slotLockId("2026-07-15", "18:00 - 19:00");
    const b = slotLockId("2026-07-15", "18:00 - 19:00");
    expect(a).toBe(b);
  });

  it("differs for different dates", () => {
    const a = slotLockId("2026-07-15", "18:00 - 19:00");
    const b = slotLockId("2026-07-16", "18:00 - 19:00");
    expect(a).not.toBe(b);
  });

  it("differs for different time slots on the same date", () => {
    const a = slotLockId("2026-07-15", "18:00 - 19:00");
    const b = slotLockId("2026-07-15", "19:00 - 20:00");
    expect(a).not.toBe(b);
  });

  it("produces a Firestore-doc-id-safe string (no slashes, no leading/trailing dashes)", () => {
    const id = slotLockId("2026-07-15", "18:00 - 19:00");
    expect(id).not.toMatch(/\//);
    expect(id).not.toMatch(/^-|-$/);
  });

  it("two customers racing for the same slot land on the same lock id", () => {
    // This is the actual property the whole conflict-prevention scheme
    // depends on: two independent createBooking() calls for the same real
    // slot MUST resolve to the same document, so Firestore's create()
    // atomicity guarantee is what decides the winner (see bookingService.ts).
    const customerA = slotLockId("2026-08-01", "07:00 - 08:00");
    const customerB = slotLockId("2026-08-01", "07:00 - 08:00");
    expect(customerA).toBe(customerB);
  });
});
