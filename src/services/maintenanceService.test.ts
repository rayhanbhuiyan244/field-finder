import { describe, it, expect } from "vitest";
import {
  slotOverlapsBlock,
  isSlotBlocked,
  type MaintenanceBlock,
} from "@/services/maintenanceService";

function block(startTime: string, endTime: string): MaintenanceBlock {
  return { id: "b1", date: "2026-07-15", startTime, endTime };
}

describe("slotOverlapsBlock", () => {
  it("detects a slot fully inside a block", () => {
    expect(slotOverlapsBlock("18:00 - 19:00", block("17:00", "20:00"))).toBe(true);
  });

  it("detects a block fully inside a slot", () => {
    expect(slotOverlapsBlock("17:00 - 20:00", block("18:00", "19:00"))).toBe(true);
  });

  it("detects a partial overlap at the start of the slot", () => {
    expect(slotOverlapsBlock("18:00 - 19:00", block("17:30", "18:30"))).toBe(true);
  });

  it("detects a partial overlap at the end of the slot", () => {
    expect(slotOverlapsBlock("18:00 - 19:00", block("18:30", "19:30"))).toBe(true);
  });

  it("does NOT flag a block that ends exactly when the slot starts (back-to-back)", () => {
    expect(slotOverlapsBlock("18:00 - 19:00", block("17:00", "18:00"))).toBe(false);
  });

  it("does NOT flag a block that starts exactly when the slot ends (back-to-back)", () => {
    expect(slotOverlapsBlock("18:00 - 19:00", block("19:00", "20:00"))).toBe(false);
  });

  it("does NOT flag a block on an entirely different part of the day", () => {
    expect(slotOverlapsBlock("18:00 - 19:00", block("06:00", "08:00"))).toBe(false);
  });

  it("returns false for a malformed slot label instead of throwing", () => {
    expect(slotOverlapsBlock("not a real slot", block("06:00", "08:00"))).toBe(false);
  });
});

describe("isSlotBlocked", () => {
  it("is true if ANY block in the list overlaps", () => {
    const blocks = [block("06:00", "07:00"), block("18:30", "19:30")];
    expect(isSlotBlocked("18:00 - 19:00", blocks)).toBe(true);
  });

  it("is false if no blocks overlap", () => {
    const blocks = [block("06:00", "07:00"), block("22:00", "23:00")];
    expect(isSlotBlocked("18:00 - 19:00", blocks)).toBe(false);
  });

  it("is false for an empty block list", () => {
    expect(isSlotBlocked("18:00 - 19:00", [])).toBe(false);
  });
});
