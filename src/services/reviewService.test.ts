import { describe, it, expect } from "vitest";
import { averageRating, type Review } from "@/services/reviewService";

function review(rating: number): Review {
  return { id: Math.random().toString(), name: "x", initials: "X", rating, comment: "" };
}

describe("averageRating", () => {
  it("returns 0 for an empty list", () => {
    expect(averageRating([])).toBe(0);
  });

  it("returns the rating itself for a single review", () => {
    expect(averageRating([review(4)])).toBe(4);
  });

  it("averages multiple reviews, rounded to one decimal place", () => {
    expect(averageRating([review(5), review(4), review(4)])).toBe(4.3);
  });

  it("handles a mix that divides evenly", () => {
    expect(averageRating([review(5), review(3)])).toBe(4);
  });
});
