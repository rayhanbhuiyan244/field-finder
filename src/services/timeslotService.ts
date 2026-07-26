import { collection, getDocs, orderBy, query } from "firebase/firestore";
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
