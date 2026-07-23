// One-time Firestore seeder. Runs on first load when collections are empty.
// Populates timeslots, pricing, gallery, reviews, and default business settings.
import { collection, getDocs, limit, query, writeBatch, doc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";

const TIME_SLOTS = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
  "22:00 - 23:00",
];

const PRICING = [
  { label: "Weekday", window: "Mon - Fri, 6 AM - 4 PM", price: 1200, note: "Best value", order: 1 },
  { label: "Weekend", window: "Sat - Sun, all day", price: 1800, note: "Most popular", order: 2 },
  {
    label: "Peak Hour",
    window: "Daily, 7 PM - 10 PM",
    price: 2000,
    note: "Premium slot",
    order: 3,
  },
  { label: "Holiday", window: "Public holidays", price: 2200, note: "Holiday premium", order: 4 },
  {
    label: "Early Bird",
    window: "Daily, 6 AM - 8 AM",
    price: 1000,
    note: "Cheapest slot",
    order: 5,
  },
  { label: "Tournament", window: "Full-day rentals", price: 15000, note: "Team package", order: 6 },
];

const REVIEWS = [
  {
    name: "Rakib Hasan",
    initials: "RH",
    rating: 5,
    comment:
      "Top quality turf, floodlights are excellent for night matches. Booking took 20 seconds.",
    dateLabel: "2 days ago",
  },
  {
    name: "Nusrat Jahan",
    initials: "NJ",
    rating: 5,
    comment: "Clean changing rooms and friendly staff. The pitch drains really well after rain.",
    dateLabel: "1 week ago",
  },
  {
    name: "Tanvir Ahmed",
    initials: "TA",
    rating: 4,
    comment: "Great value for money on weekday slots. Parking gets tight on Fridays.",
    dateLabel: "2 weeks ago",
  },
  {
    name: "Sadia Islam",
    initials: "SI",
    rating: 5,
    comment: "Cafeteria is a nice touch. We come here every Friday now.",
    dateLabel: "3 weeks ago",
  },
  {
    name: "Shakib Al Amin",
    initials: "SA",
    rating: 5,
    comment: "Best 5-a-side turf in the area. Surface feels premium under the studs.",
    dateLabel: "1 month ago",
  },
  {
    name: "Tasnim Akter",
    initials: "TA",
    rating: 4,
    comment: "Booking system is smooth. Would love an app version too!",
    dateLabel: "1 month ago",
  },
  {
    name: "Imran Hossain",
    initials: "IH",
    rating: 5,
    comment:
      "We host our office 7-a-side league here every Wednesday. Never had a scheduling issue.",
    dateLabel: "1 month ago",
  },
  {
    name: "Farhana Rahman",
    initials: "FR",
    rating: 4,
    comment: "Kids academy on Saturdays is well organised. Coaches are patient and skilled.",
    dateLabel: "2 months ago",
  },
  {
    name: "Mahin Alam",
    initials: "MA",
    rating: 5,
    comment:
      "Booked a birthday tournament — packages are transparent and the staff handled it end-to-end.",
    dateLabel: "2 months ago",
  },
];

const BUSINESS = {
  name: "Kickoff Arena",
  tagline: "Premium 5-a-side football turf",
  address: "42, MG Road, Indiranagar, Bengaluru 560038",
  phone: "+91 98450 12345",
  email: "hello@kickoffarena.com",
  hours: "6:00 AM - 12:00 AM, all days",
};

async function isEmpty(name: string) {
  const snap = await getDocs(query(collection(db, name), limit(1)));
  return snap.empty;
}

let seedPromise: Promise<void> | null = null;

export function seedFirestoreOnce(): Promise<void> {
  if (!isFirebaseConfigured) return Promise.resolve();
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      if (await isEmpty("timeslots")) {
        const batch = writeBatch(db);
        TIME_SLOTS.forEach((label, i) => {
          batch.set(doc(collection(db, "timeslots")), { label, order: i });
        });
        await batch.commit();
      }
      if (await isEmpty("pricing")) {
        const batch = writeBatch(db);
        PRICING.forEach((p) => batch.set(doc(collection(db, "pricing")), p));
        await batch.commit();
      }
      if (await isEmpty("reviews")) {
        const batch = writeBatch(db);
        REVIEWS.forEach((r) => batch.set(doc(collection(db, "reviews")), r));
        await batch.commit();
      }
      if (await isEmpty("gallery")) {
        // Seed with public sample photos; owner can replace via Storage later.
        const urls = [
          "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200",
          "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1200",
          "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200",
          "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200",
          "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200",
        ];
        const batch = writeBatch(db);
        urls.forEach((url, i) =>
          batch.set(doc(collection(db, "gallery")), { url, alt: `Arena photo ${i + 1}`, order: i }),
        );
        await batch.commit();
      }
      // settings/business: set unconditionally with merge so it exists.
      const batch = writeBatch(db);
      batch.set(doc(db, "settings", "business"), BUSINESS, { merge: true });
      await batch.commit();
    } catch (err) {
      // Swallow — auth/rules may not permit anonymous seeding. Owner can seed via console.
      console.warn("[seed] skipped:", err);
    }
  })();
  return seedPromise;
}
