import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface MaintenanceBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM, 24h
  endTime: string; // HH:MM, 24h
  reason?: string;
  createdAt?: Timestamp;
}

export async function listMaintenanceBlocksForDate(date: string): Promise<MaintenanceBlock[]> {
  const snap = await getDocs(query(collection(db, "maintenanceBlocks"), where("date", "==", date)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MaintenanceBlock, "id">) }));
}

/** Owner action: block out a date/time window (resurfacing, private event, etc). */
export async function createMaintenanceBlock(
  input: Omit<MaintenanceBlock, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "maintenanceBlocks"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMaintenanceBlock(id: string): Promise<void> {
  await deleteDoc(doc(db, "maintenanceBlocks", id));
}

/**
 * A "HH:MM - HH:MM" slot label overlaps a block if the two windows intersect
 * at all — a partial overlap disqualifies the whole slot (matches the
 * scheduling algorithm in the architecture doc: a turf can't be
 * half-booked, half-under-repair).
 */
export function slotOverlapsBlock(timeSlot: string, block: MaintenanceBlock): boolean {
  const [slotStart, slotEnd] = timeSlot.split(" - ").map((s) => s.trim());
  if (!slotStart || !slotEnd) return false;
  return slotStart < block.endTime && block.startTime < slotEnd;
}

export function isSlotBlocked(timeSlot: string, blocks: MaintenanceBlock[]): boolean {
  return blocks.some((b) => slotOverlapsBlock(timeSlot, b));
}
