import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * A minimal in-memory stand-in for Firestore, just enough to exercise the
 * real transaction logic in bookingService.ts without touching a real
 * project (the sandbox this was written in can't reach Firebase's
 * emulator download servers, so this is the reliable alternative to an
 * emulator-backed test for the one piece of logic that matters most:
 * two concurrent bookers for the same slot must not both win).
 */
let docs: Map<string, Record<string, unknown>>;

vi.mock("@/firebase/config", () => ({ db: {} }));

vi.mock("firebase/firestore", () => {
  function key(colName: string, id: string) {
    return `${colName}/${id}`;
  }

  const collection = vi.fn((_db: unknown, name: string) => ({ __col: name }));

  const doc = vi.fn((...args: unknown[]) => {
    if (args.length === 1) {
      // doc(collectionRef) — auto-generated id, as used for new bookings
      const col = args[0] as { __col: string };
      return { id: `auto-${Math.random().toString(36).slice(2, 10)}`, __col: col.__col };
    }
    // doc(db, collectionName, id) — explicit id, as used for slotLocks/{lockId}
    const [, colName, id] = args as [unknown, string, string];
    return { id, __col: colName };
  });

  const runTransaction = vi.fn(async (_db: unknown, updateFn: (tx: unknown) => unknown) => {
    const tx = {
      get: vi.fn(async (ref: { id: string; __col: string }) => {
        const k = key(ref.__col, ref.id);
        const data = docs.get(k);
        return { exists: () => docs.has(k), data: () => data };
      }),
      set: vi.fn((ref: { id: string; __col: string }, data: Record<string, unknown>) => {
        docs.set(key(ref.__col, ref.id), data);
      }),
      update: vi.fn((ref: { id: string; __col: string }, data: Record<string, unknown>) => {
        const k = key(ref.__col, ref.id);
        docs.set(k, { ...(docs.get(k) ?? {}), ...data });
      }),
      delete: vi.fn((ref: { id: string; __col: string }) => {
        docs.delete(key(ref.__col, ref.id));
      }),
    };
    return updateFn(tx);
  });

  return {
    collection,
    doc,
    getDocs: vi.fn(async () => ({ docs: [] })),
    getDoc: vi.fn(async (ref: { id: string; __col: string }) => {
      const k = key(ref.__col, ref.id);
      return { exists: () => docs.has(k), id: ref.id, data: () => docs.get(k) };
    }),
    query: vi.fn((...args: unknown[]) => args),
    where: vi.fn(),
    orderBy: vi.fn(),
    updateDoc: vi.fn(async (ref: { id: string; __col: string }, data: Record<string, unknown>) => {
      const k = key(ref.__col, ref.id);
      docs.set(k, { ...(docs.get(k) ?? {}), ...data });
    }),
    runTransaction,
    serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  };
});

const { createBooking, cancelBooking, confirmBooking, SlotUnavailableError } =
  await import("@/services/bookingService");

const baseInput = {
  userId: "u1",
  customerName: "Rakib",
  phone: "01700000000",
  bookingDate: "2026-07-15",
  timeSlot: "18:00 - 19:00",
  price: 1500,
};

describe("createBooking — conflict prevention (Phase 5)", () => {
  beforeEach(() => {
    docs = new Map();
  });

  it("succeeds and starts as pending/pending when the slot is free", async () => {
    const id = await createBooking(baseInput);
    expect(id).toBeTruthy();
    const saved = docs.get(`bookings/${id}`);
    expect(saved?.bookingStatus).toBe("pending");
    expect(saved?.paymentStatus).toBe("pending");
  });

  it("rejects a second booking for the same (date, timeSlot) with SlotUnavailableError", async () => {
    await createBooking(baseInput);
    await expect(
      createBooking({ ...baseInput, userId: "u2", customerName: "Fahim" }),
    ).rejects.toBeInstanceOf(SlotUnavailableError);
  });

  it("does NOT create a second booking document when the slot is already taken", async () => {
    await createBooking(baseInput);
    await createBooking({ ...baseInput, userId: "u2" }).catch(() => {});
    const bookingDocs = [...docs.keys()].filter((k) => k.startsWith("bookings/"));
    expect(bookingDocs).toHaveLength(1);
  });

  it("allows a different time slot on the same date", async () => {
    await createBooking(baseInput);
    await expect(
      createBooking({ ...baseInput, userId: "u2", timeSlot: "19:00 - 20:00" }),
    ).resolves.toBeTruthy();
  });

  it("allows the same time slot on a different date", async () => {
    await createBooking(baseInput);
    await expect(
      createBooking({ ...baseInput, userId: "u2", bookingDate: "2026-07-16" }),
    ).resolves.toBeTruthy();
  });
});

describe("cancelBooking — releases the slot lock", () => {
  beforeEach(() => {
    docs = new Map();
  });

  it("frees the slot so a new booking can be made for it", async () => {
    const id = await createBooking(baseInput);
    await cancelBooking(id);
    await expect(createBooking({ ...baseInput, userId: "u2" })).resolves.toBeTruthy();
  });

  it("only marks payment refunded if it had actually been paid", async () => {
    const id = await createBooking(baseInput);
    // never paid — still "pending"
    await cancelBooking(id);
    expect(docs.get(`bookings/${id}`)?.paymentStatus).toBe("pending");
  });

  it("marks payment refunded when it had been paid", async () => {
    const id = await createBooking(baseInput);
    docs.set(`bookings/${id}`, { ...docs.get(`bookings/${id}`), paymentStatus: "paid" });
    await cancelBooking(id);
    expect(docs.get(`bookings/${id}`)?.paymentStatus).toBe("refunded");
  });

  it("is a no-op on an already-completed booking (terminal state)", async () => {
    const id = await createBooking(baseInput);
    docs.set(`bookings/${id}`, { ...docs.get(`bookings/${id}`), bookingStatus: "completed" });
    await cancelBooking(id);
    expect(docs.get(`bookings/${id}`)?.bookingStatus).toBe("completed");
  });
});

describe("confirmBooking", () => {
  beforeEach(() => {
    docs = new Map();
  });

  it("moves a pending booking to confirmed", async () => {
    const id = await createBooking(baseInput);
    await confirmBooking(id);
    expect(docs.get(`bookings/${id}`)?.bookingStatus).toBe("confirmed");
  });
});
