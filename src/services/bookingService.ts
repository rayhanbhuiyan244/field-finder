import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string;
  price: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  /** Deterministic id of the slotLocks doc that reserves this (date, timeSlot). */
  lockId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const col = () => collection(db, "bookings");

/**
 * A slot is uniquely identified by (bookingDate, timeSlot). Turn that into a
 * Firestore-doc-id-safe string so two concurrent bookers race for the SAME
 * document -- that document's existence is what the transaction below uses
 * as the actual conflict check (a query result is not a safe thing to race
 * on; a single document's existence, checked inside a transaction, is).
 */
export function slotLockId(bookingDate: string, timeSlot: string): string {
  const slug = timeSlot.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${bookingDate}_${slug}`;
}

export class SlotUnavailableError extends Error {
  constructor() {
    super("This slot was just booked by someone else. Please pick another slot.");
    this.name = "SlotUnavailableError";
  }
}

/**
 * Creates a booking iff the slot is still free, atomically. Two customers
 * tapping "Confirm Booking" for the same (date, timeSlot) at the same time
 * will race for the same slotLocks/{lockId} document; Firestore transactions
 * guarantee only one of them can win.
 *
 * New bookings start as bookingStatus "pending" -- the owner still has to
 * confirm. This matches the Pending -> Confirmed -> Completed/Cancelled flow.
 */
export async function createBooking(
  input: Omit<
    Booking,
    "id" | "createdAt" | "updatedAt" | "bookingStatus" | "paymentStatus" | "lockId"
  >,
): Promise<string> {
  const lockId = slotLockId(input.bookingDate, input.timeSlot);
  const lockRef = doc(db, "slotLocks", lockId);
  const bookingRef = doc(col());

  await runTransaction(db, async (tx) => {
    const lockSnap = await tx.get(lockRef);
    if (lockSnap.exists()) {
      throw new SlotUnavailableError();
    }
    tx.set(lockRef, {
      bookingId: bookingRef.id,
      bookingDate: input.bookingDate,
      timeSlot: input.timeSlot,
      createdAt: serverTimestamp(),
    });
    tx.set(bookingRef, {
      ...input,
      lockId,
      bookingStatus: "pending" as BookingStatus,
      paymentStatus: "pending" as PaymentStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return bookingRef.id;
}

function mapRows(snap: Awaited<ReturnType<typeof getDocs>>): Booking[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }));
}

export async function listAllBookings(): Promise<Booking[]> {
  const snap = await getDocs(query(col(), orderBy("bookingDate", "desc")));
  return mapRows(snap);
}

export async function listUserBookings(userId: string): Promise<Booking[]> {
  // Avoid composite index requirement: filter, then sort in JS.
  const snap = await getDocs(query(col(), where("userId", "==", userId)));
  return mapRows(snap).sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
}

export async function listBookingsForDate(bookingDate: string): Promise<Booking[]> {
  const snap = await getDocs(query(col(), where("bookingDate", "==", bookingDate)));
  return mapRows(snap);
}

export async function updateBookingStatus(
  id: string,
  updates: Partial<Pick<Booking, "bookingStatus" | "paymentStatus">>,
) {
  await updateDoc(doc(db, "bookings", id), { ...updates, updatedAt: serverTimestamp() });
}

/** Owner action: Pending -> Confirmed. */
export async function confirmBooking(id: string) {
  await updateBookingStatus(id, { bookingStatus: "confirmed" });
}

/**
 * Cancel a booking and release its slot lock so the slot can be rebooked.
 * Only marks the payment "refunded" if it had actually been "paid" --
 * a booking nobody paid for yet has nothing to refund.
 */
export async function cancelBooking(id: string) {
  const bookingRef = doc(db, "bookings", id);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(bookingRef);
    if (!snap.exists()) return;
    const data = snap.data() as Omit<Booking, "id">;

    if (data.bookingStatus === "cancelled" || data.bookingStatus === "completed") {
      // Already in a terminal state -- nothing to do.
      return;
    }

    tx.update(bookingRef, {
      bookingStatus: "cancelled" as BookingStatus,
      paymentStatus:
        data.paymentStatus === "paid" ? ("refunded" as PaymentStatus) : data.paymentStatus,
      updatedAt: serverTimestamp(),
    });

    if (data.lockId) {
      tx.delete(doc(db, "slotLocks", data.lockId));
    }
  });
}

/** Owner action: mark a booking completed and paid (cash collected on arrival). */
export async function completeBooking(id: string) {
  await updateBookingStatus(id, { bookingStatus: "completed", paymentStatus: "paid" });
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, "bookings", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Booking, "id">) };
}

/**
 * Public-safe availability check for the booking calendar. Reads slotLocks
 * (bookingDate, timeSlot, bookingId — no customer name/phone) instead of the
 * bookings collection itself, so anonymous visitors browsing availability
 * never touch a document containing another customer's PII.
 */
export async function listBookedSlotsForDate(bookingDate: string): Promise<Set<string>> {
  const snap = await getDocs(
    query(collection(db, "slotLocks"), where("bookingDate", "==", bookingDate)),
  );
  return new Set(snap.docs.map((d) => (d.data() as { timeSlot: string }).timeSlot));
}
