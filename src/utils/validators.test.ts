import { describe, it, expect } from "vitest";
import { isEmail, isPhone, isNonEmpty, minLength } from "@/utils/validators";

describe("isEmail", () => {
  it("accepts a normal address", () => expect(isEmail("a@b.com")).toBe(true));
  it("trims surrounding whitespace before checking", () =>
    expect(isEmail("  a@b.com  ")).toBe(true));
  it("rejects missing @", () => expect(isEmail("ab.com")).toBe(false));
  it("rejects missing domain", () => expect(isEmail("a@b")).toBe(false));
  it("rejects spaces inside the address", () => expect(isEmail("a b@c.com")).toBe(false));
});

describe("isPhone", () => {
  it("accepts a plain 11-digit BD mobile number", () => expect(isPhone("01712345678")).toBe(true));
  it("accepts a number with +/-/space separators", () =>
    expect(isPhone("+880 171-234-5678")).toBe(true));
  it("rejects too few digits", () => expect(isPhone("12345")).toBe(false));
  it("rejects too many digits", () => expect(isPhone("1".repeat(16))).toBe(false));
});

describe("isNonEmpty", () => {
  it("rejects an empty string", () => expect(isNonEmpty("")).toBe(false));
  it("rejects a whitespace-only string", () => expect(isNonEmpty("   ")).toBe(false));
  it("accepts real content", () => expect(isNonEmpty("hi")).toBe(true));
});

describe("minLength", () => {
  it("rejects strings shorter than n after trimming", () =>
    expect(minLength("  ab  ", 3)).toBe(false));
  it("accepts strings at exactly n", () => expect(minLength("abc", 3)).toBe(true));
});
