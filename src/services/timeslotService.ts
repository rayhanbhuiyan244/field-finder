import { collection, getDocs, orderBy, query, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export interface TimeSlot {
  id: string;
  label: string; // e.g. "18:00 - 19:00"
  order: number;
}

export async function listTimeSlots(): Promise<TimeSlot[]> {
  const snap = await getDocs(query(collection(db, "timeslots"), orderBy("order", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimeSlot, "id">) }));
}

/** Owner action: add a new bookable time slot (e.g. "22:00 - 23:00"). */
export async function createTimeSlot(label: string, order: number): Promise<string> {
  const ref = await addDoc(collection(db, "timeslots"), { label, order });
  return ref.id;
}

/**
 * Owner action: remove a time slot from the bookable grid going forward.
 * This only removes the slot definition — it does NOT touch existing
 * bookings already made against that label, which remain valid historical
 * records (matches how pricing changes don't retroactively touch
 * priceAtBooking-equivalent fields on past bookings either).
 */
export async function deleteTimeSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, "timeslots", id));
}
