import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/firebase/config", () => ({ auth: {} }));

const createUserProfile = vi.fn();
const getUserProfile = vi.fn();

vi.mock("./userService", () => ({
  createUserProfile: (...args: unknown[]) => createUserProfile(...args),
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(async () => ({
    user: { uid: "new-uid", displayName: null },
  })),
  signInWithEmailAndPassword: vi.fn(async (_auth: unknown, email: string) => ({
    user: { uid: "existing-uid", displayName: null, email },
  })),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(async () => {}),
  onAuthStateChanged: vi.fn(),
}));

const { register, login } = await import("./authService");

describe("register — role escalation regression guard", () => {
  beforeEach(() => {
    createUserProfile.mockClear();
  });

  it("always creates the profile with role 'customer', regardless of what's passed in", async () => {
    await register({
      fullName: "Test User",
      email: "test@example.com",
      phone: "01700000000",
      password: "password123",
      // @ts-expect-error — role isn't (and shouldn't be) part of RegisterInput anymore;
      // this simulates someone bypassing the type system (e.g. a raw fetch/console call).
      role: "owner",
    });
    expect(createUserProfile).toHaveBeenCalledTimes(1);
    const [, profileData] = createUserProfile.mock.calls[0];
    expect(profileData.role).toBe("customer");
  });
});

describe("login — auto-provisioned profile fallback", () => {
  beforeEach(() => {
    createUserProfile.mockClear();
    getUserProfile.mockReset();
  });

  it("creates a customer profile if one doesn't exist yet, never anything else", async () => {
    getUserProfile.mockResolvedValue(null);
    await login("test@example.com", "password123");
    expect(createUserProfile).toHaveBeenCalledTimes(1);
    const [, profileData] = createUserProfile.mock.calls[0];
    expect(profileData.role).toBe("customer");
  });

  it("does not touch an existing profile's role", async () => {
    getUserProfile.mockResolvedValue({ uid: "existing-uid", role: "owner", fullName: "Owner" });
    await login("owner@example.com", "password123");
    expect(createUserProfile).not.toHaveBeenCalled();
  });
});
