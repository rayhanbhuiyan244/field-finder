import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const col = () => collection(db, "bookings");

export async function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "updatedAt" | "bookingStatus" | "paymentStatus"> & {
    bookingStatus?: BookingStatus;
    paymentStatus?: PaymentStatus;
  },
) {
  const ref = await addDoc(col(), {
    ...input,
    bookingStatus: input.bookingStatus ?? "confirmed",
    paymentStatus: input.paymentStatus ?? "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
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

export async function cancelBooking(id: string) {
  await updateBookingStatus(id, { bookingStatus: "cancelled", paymentStatus: "refunded" });
}