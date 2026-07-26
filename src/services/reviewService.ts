import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface Review {
  id: string;
  userId?: string;
  name: string;
  initials: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
  dateLabel?: string;
}

export async function listReviews(): Promise<Review[]> {
  const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
}

export async function createReview(input: Omit<Review, "id" | "createdAt">) {
  const ref = await addDoc(collection(db, "reviews"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
