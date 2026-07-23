import { describe, it, expect } from "vitest";
import { computePrice, type PricingRule } from "@/services/pricingService";

const rules: PricingRule[] = [
  { id: "1", label: "Weekday", window: "Mon - Fri, 6 AM - 4 PM", price: 1200, note: "Best value" },
  { id: "2", label: "Weekend", window: "Sat - Sun, all day", price: 1800, note: "Most popular" },
  { id: "3", label: "Peak Hour", window: "Daily, 7 PM - 10 PM", price: 2000, note: "Premium slot" },
  { id: "4", label: "Night Slot", window: "Daily, 10 PM+", price: 1600, note: "Late night" },
];

// A Wednesday and a Saturday, for weekday/weekend branching.
const weekday = new Date(2026, 6, 15); // Wed 15 Jul 2026
const weekend = new Date(2026, 6, 18); // Sat 18 Jul 2026

describe("computePrice", () => {
  it("uses the Peak Hour rate for evening slots regardless of weekday/weekend", () => {
    expect(computePrice(rules, "19:00 - 20:00", weekday)).toBe(2000);
    expect(computePrice(rules, "21:00 - 22:00", weekend)).toBe(2000);
  });

  it("uses the Night Slot rate after 10pm", () => {
    expect(computePrice(rules, "22:00 - 23:00", weekday)).toBe(1600);
  });

  it("uses the Weekend rate on Saturday/Sunday outside peak/night hours", () => {
    expect(computePrice(rules, "10:00 - 11:00", weekend)).toBe(1800);
  });

  it("uses the Weekday rate on weekdays outside peak/night hours", () => {
    expect(computePrice(rules, "10:00 - 11:00", weekday)).toBe(1200);
  });

  it("falls back to the first rule's price if nothing matches", () => {
    const sparse: PricingRule[] = [{ id: "1", label: "Weekday", window: "", price: 999, note: "" }];
    expect(computePrice(sparse, "10:00 - 11:00", weekend)).toBe(999);
  });

  it("falls back to 1200 if there are no rules at all", () => {
    expect(computePrice([], "10:00 - 11:00", weekday)).toBe(1200);
  });
});
