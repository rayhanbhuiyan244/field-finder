import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export type PricingCategory = "Weekday" | "Weekend" | "Peak Hour" | "Holiday" | "Night Slot";

export interface PricingRule {
  id: string;
  label: PricingCategory | string;
  window: string;
  price: number;
  note: string;
  order?: number;
}

export async function listPricingRules(): Promise<PricingRule[]> {
  const snap = await getDocs(query(collection(db, "pricing"), orderBy("order", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PricingRule, "id">) }));
}

/** Owner action: add a new pricing category (e.g. a "Tournament Rate"). */
export async function createPricingRule(input: Omit<PricingRule, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "pricing"), input);
  return ref.id;
}

/** Owner action: edit an existing rule's price/note/window — routed through
 * the service layer instead of components calling updateDoc() directly. */
export async function updatePricingRule(
  id: string,
  updates: Partial<Omit<PricingRule, "id">>,
): Promise<void> {
  await updateDoc(doc(db, "pricing", id), updates);
}

/** Owner action: retire a pricing category. Past bookings already have
 * `priceAtBooking`-equivalent (price) baked in, so this is safe. */
export async function deletePricingRule(id: string): Promise<void> {
  await deleteDoc(doc(db, "pricing", id));
}

// Compute the price for a given time slot + date based on pricing rules.
// Falls back to a sensible default if no rules match.
export function computePrice(rules: PricingRule[], time: string, date: Date): number {
  const findBy = (label: string) =>
    rules.find((r) => r.label.toLowerCase() === label.toLowerCase());
  const hour = Number.parseInt(time.slice(0, 2), 10);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const peak = findBy("Peak Hour");
  const night = findBy("Night Slot");
  const weekendRule = findBy("Weekend");
  const weekday = findBy("Weekday");

  if (peak && hour >= 19 && hour < 22) return peak.price;
  if (night && hour >= 22) return night.price;
  if (weekend && weekendRule) return weekendRule.price;
  if (weekday) return weekday.price;
  return rules[0]?.price ?? 1200;
}
