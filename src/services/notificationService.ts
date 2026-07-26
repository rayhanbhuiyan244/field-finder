import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  unread: boolean;
  createdAt?: Timestamp;
}

export async function listUserNotifications(userId: string): Promise<AppNotification[]> {
  const snap = await getDocs(query(collection(db, "notifications"), where("userId", "==", userId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, "id">) }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function createNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "unread"> & { unread?: boolean },
) {
  const ref = await addDoc(collection(db, "notifications"), {
    ...input,
    unread: input.unread ?? true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function markRead(id: string) {
  await updateDoc(doc(db, "notifications", id), { unread: false });
}
