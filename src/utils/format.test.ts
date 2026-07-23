import { describe, it, expect } from "vitest";
import { toISODate, slotStartDate } from "@/utils/format";

describe("toISODate", () => {
  it("formats as YYYY-MM-DD using local time, not UTC", () => {
    const d = new Date(2026, 6, 5); // 5 Jul 2026 local
    expect(toISODate(d)).toBe("2026-07-05");
  });

  it("zero-pads single-digit months and days", () => {
    const d = new Date(2026, 0, 9); // 9 Jan 2026
    expect(toISODate(d)).toBe("2026-01-09");
  });
});

describe("slotStartDate", () => {
  it("parses a valid date + time slot into the correct local Date", () => {
    const d = slotStartDate("2026-07-15", "18:00 - 19:00");
    expect(d).not.toBeNull();
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(6); // 0-indexed = July
    expect(d?.getDate()).toBe(15);
    expect(d?.getHours()).toBe(18);
    expect(d?.getMinutes()).toBe(0);
  });

  it("returns null for a malformed date", () => {
    expect(slotStartDate("15-07-2026", "18:00 - 19:00")).toBeNull();
  });

  it("returns null for a malformed time slot", () => {
    expect(slotStartDate("2026-07-15", "evening")).toBeNull();
  });

  it("is usable to compute hours-until-start for the cancellation window", () => {
    const future = new Date();
    future.setHours(future.getHours() + 10);
    const dateStr = toISODate(future);
    const timeStr = `${String(future.getHours()).padStart(2, "0")}:00 - ${String(future.getHours() + 1).padStart(2, "0")}:00`;
    const start = slotStartDate(dateStr, timeStr);
    const hoursUntil = start ? (start.getTime() - Date.now()) / (1000 * 60 * 60) : -1;
    expect(hoursUntil).toBeGreaterThan(9);
    expect(hoursUntil).toBeLessThan(11);
  });
});
