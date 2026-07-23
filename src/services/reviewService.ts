import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface Review {
  id: string;
  userId?: string;
  /** The completed booking this review is for. Required for new reviews;
   * optional only because a handful of seeded testimonials predate this
   * field and don't map to a real booking. */
  bookingId?: string;
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

/** A booking can only be reviewed once — used to hide/disable the "Leave a review" action. */
export async function hasReviewForBooking(bookingId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "reviews", bookingId));
  return snap.exists();
}

/**
 * Reviews are keyed by bookingId (not an auto-id) so "one review per
 * booking" is an actual data-layer guarantee — the same pattern slotLocks
 * uses for slot uniqueness (§8 of the architecture doc). A second attempt
 * to review the same booking simply can't create a second document.
 */
export async function createReview(
  bookingId: string,
  input: Omit<Review, "id" | "createdAt" | "bookingId">,
) {
  await setDoc(doc(db, "reviews", bookingId), {
    ...input,
    bookingId,
    createdAt: serverTimestamp(),
  });
  return bookingId;
}

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
