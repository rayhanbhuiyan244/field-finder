import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export type UserRole = "customer" | "owner";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">,
) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "fullName" | "phone" | "photoURL">>,
) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function listCustomers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), where("role", "==", "customer")));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }));
}

/** Single-owner v1: looks up the one account with role "owner", used to route owner-facing notifications. */
export async function getOwnerUserId(): Promise<string | null> {
  const snap = await getDocs(query(collection(db, "users"), where("role", "==", "owner")));
  return snap.empty ? null : snap.docs[0].id;
}
