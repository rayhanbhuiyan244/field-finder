import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  order?: number;
  createdAt?: Timestamp;
}

export async function listGallery(): Promise<GalleryImage[]> {
  const snap = await getDocs(query(collection(db, "gallery"), orderBy("order", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryImage, "id">) }));
}

export async function addGalleryImage(url: string, alt = "", order = 0) {
  const ref = await addDoc(collection(db, "gallery"), {
    url,
    alt,
    order,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const snap = await getDoc(doc(db, "settings", "business"));
  return snap.exists() ? (snap.data() as BusinessSettings) : null;
}

export async function saveBusinessSettings(data: BusinessSettings) {
  await setDoc(doc(db, "settings", "business"), data, { merge: true });
}