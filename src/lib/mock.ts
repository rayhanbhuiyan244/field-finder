// Mock data for the Football Turf Booking prototype.
// Everything here is synchronous, deterministic, and swappable with a Firebase
// client later without changing the UI.
import { toISODate } from "@/utils/format";

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type PaymentStatus = "paid" | "unpaid" | "refunded";
export type SlotStatus = "available" | "booked" | "selected" | "maintenance";

export interface Booking {
  id: string;
  customer: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // "18:00 - 19:00"
  duration: number; // hours
  price: number;
  payment: PaymentStatus;
  status: BookingStatus;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  joined: string;
  totalBookings: number;
  totalSpent: number;
  favoriteSlot: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  initials: string;
}

export interface PricingRule {
  id: string;
  label: string;
  window: string;
  price: number;
  note: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const NAMES = [
  "Rakib Hasan",
  "Tanvir Ahmed",
  "Sakib Rahman",
  "Mehedi Hasan",
  "Arif Hossain",
  "Nayeem Islam",
  "Shakib Al Amin",
  "Rifat Chowdhury",
  "Fahim Kabir",
  "Tousif Mahmud",
  "Sadman Sakib",
  "Rayhan Uddin",
  "Sajid Karim",
  "Nafis Iqbal",
  "Ashik Reza",
  "Mahin Alam",
  "Rifat Khan",
  "Tahmid Bhuiyan",
  "Sabbir Ahmed",
  "Naimul Haque",
  "Nusrat Jahan",
  "Tasnim Akter",
  "Farhana Rahman",
  "Sadia Islam",
  "Marium Khatun",
  "Rumana Parveen",
  "Sumaiya Akter",
  "Jarin Tasnim",
  "Tahmina Begum",
  "Nabila Haque",
  "Imran Hossain",
  "Faisal Ahmed",
  "Kamrul Islam",
  "Shahriar Kabir",
  "Tarek Aziz",
  "Anisur Rahman",
  "Zahidul Islam",
  "Mizanur Rahman",
  "Nazmul Huda",
  "Ashraful Alam",
  "Golam Mostofa",
  "Mahbub Alam",
  "Parvez Rana",
  "Rashedul Hasan",
  "Saiful Islam",
  "Wasim Akram",
  "Abdullah Al Mamun",
  "Ayan Chowdhury",
  "Rakibul Hasan",
  "Sohel Rana",
];

function seededRandom(seed: number) {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

const rand = seededRandom(42);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

function fmtDate(d: Date) {
  return toISODate(d);
}

function addDays(d: Date, days: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

export const TIME_SLOTS = [
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

export const customers: Customer[] = NAMES.map((name, i) => ({
  id: `CUS-${1000 + i}`,
  name,
  phone: `+880 1${Math.floor(100000000 + rand() * 899999999)}`,
  email: name.toLowerCase().replace(/\s+/g, ".") + "@mail.com",
  joined: fmtDate(addDays(new Date(), -Math.floor(rand() * 400))),
  totalBookings: 3 + Math.floor(rand() * 25),
  totalSpent: 1500 + Math.floor(rand() * 30000),
  favoriteSlot: pick(TIME_SLOTS),
}));

const STATUSES: BookingStatus[] = ["confirmed", "pending", "completed", "cancelled"];
const PAYMENTS: PaymentStatus[] = ["paid", "paid", "paid", "unpaid"];

export const bookings: Booking[] = Array.from({ length: 30 }).map((_, i) => {
  const c = pick(customers);
  const daysOffset = Math.floor(rand() * 14) - 7;
  const date = addDays(new Date(), daysOffset);
  const time = pick(TIME_SLOTS);
  const price = pick([1200, 1500, 1800, 2000, 2500]);
  const status: BookingStatus =
    daysOffset < 0 ? (rand() > 0.15 ? "completed" : "cancelled") : pick(STATUSES.slice(0, 2));
  return {
    id: `BK-${2401 + i}`,
    customer: c.name,
    phone: c.phone,
    date: fmtDate(date),
    time,
    duration: 1,
    price,
    payment: status === "cancelled" ? "refunded" : pick(PAYMENTS),
    status,
  };
});

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Rakib Hasan",
    initials: "RH",
    rating: 5,
    date: "2 days ago",
    comment:
      "Top quality turf, floodlights are excellent for night matches. Booking took 20 seconds.",
  },
  {
    id: "r2",
    name: "Nusrat Jahan",
    initials: "NJ",
    rating: 5,
    date: "1 week ago",
    comment: "Clean changing rooms and friendly staff. The pitch drains really well after rain.",
  },
  {
    id: "r3",
    name: "Tanvir Ahmed",
    initials: "TA",
    rating: 4,
    date: "2 weeks ago",
    comment: "Great value for money on weekday slots. Parking gets tight on Fridays.",
  },
  {
    id: "r4",
    name: "Sadia Islam",
    initials: "SI",
    rating: 5,
    date: "3 weeks ago",
    comment: "Cafeteria is a nice touch. We come here every Friday now.",
  },
  {
    id: "r5",
    name: "Shakib Al Amin",
    initials: "SA",
    rating: 5,
    date: "1 month ago",
    comment: "Best 5-a-side turf in the area. Surface feels premium under the studs.",
  },
  {
    id: "r6",
    name: "Tasnim Akter",
    initials: "TA",
    rating: 4,
    date: "1 month ago",
    comment: "Booking system is smooth. Would love an app version too!",
  },
];

export const pricingRules: PricingRule[] = [
  { id: "p1", label: "Weekday", window: "Mon - Fri, 6 AM - 4 PM", price: 1200, note: "Best value" },
  { id: "p2", label: "Weekend", window: "Sat - Sun, all day", price: 1800, note: "Most popular" },
  {
    id: "p3",
    label: "Peak Hours",
    window: "Daily, 7 PM - 10 PM",
    price: 2000,
    note: "Premium slot",
  },
  {
    id: "p4",
    label: "Night Slot",
    window: "Daily, 10 PM - 12 AM",
    price: 1500,
    note: "Floodlights included",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Booking confirmed",
    body: "Your slot on Fri 7-8 PM is confirmed.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Payment received",
    body: "৳1,800 received for BK-2418.",
    time: "1d ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Reminder",
    body: "Match tomorrow at 8 PM. Bring your kit.",
    time: "1d ago",
    unread: false,
  },
  {
    id: "n4",
    title: "New offer",
    body: "20% off weekday morning slots this month.",
    time: "3d ago",
    unread: false,
  },
];

// Revenue for last 12 weeks (mock)
export const revenueSeries = Array.from({ length: 12 }).map((_, i) => ({
  week: `W${i + 1}`,
  revenue: 24000 + Math.floor(rand() * 22000),
  bookings: 18 + Math.floor(rand() * 22),
}));

export const peakHourSeries = TIME_SLOTS.map((t) => ({
  slot: t.split(" ")[0],
  bookings: Math.floor(rand() * 30) + (t.startsWith("19") || t.startsWith("20") ? 25 : 5),
}));

export function slotStatusFor(date: string, time: string): SlotStatus {
  // Deterministic pseudo-random status per (date,time) so re-renders don't jitter.
  let h = 0;
  const s = date + time;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const v = h % 10;
  if (v < 4) return "booked";
  if (v === 4) return "maintenance";
  return "available";
}

export const stats = {
  availableToday: 8,
  matchesPlayed: 12480,
  happyPlayers: 4200,
  averageRating: 4.8,
};

export const business = {
  name: "Kickoff Arena",
  tagline: "Premium 5-a-side football turf",
  address: "Station Road, Kandirpar, Cumilla 3500",
  phone: "+880 1712 345678",
  email: "hello@kickoffarena.com",
  hours: "6:00 AM - 12:00 AM, all days",
};
