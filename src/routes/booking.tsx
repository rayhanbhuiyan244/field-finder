import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, Clock, MapPin, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { business } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { listTimeSlots } from "@/services/timeslotService";
import { listPricingRules, computePrice, type PricingRule } from "@/services/pricingService";
import { createBooking, listBookingsForDate } from "@/services/bookingService";
import { createNotification } from "@/services/notificationService";
import { toISODate } from "@/utils/format";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book a Slot — Kickoff Arena" },
      { name: "description", content: "Pick your date and time. Live slot availability updated in real time." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const dateStr = useMemo(() => (date ? toISODate(date) : ""), [date]);

  useEffect(() => {
    listTimeSlots()
      .then((s) => setSlots(s.map((x) => x.label)))
      .catch(() => setSlots([]));
    listPricingRules().then(setRules).catch(() => setRules([]));
  }, []);

  useEffect(() => {
    if (!dateStr) return;
    listBookingsForDate(dateStr)
      .then((rows) => {
        setBookedSlots(new Set(rows.filter((r) => r.bookingStatus !== "cancelled").map((r) => r.timeSlot)));
      })
      .catch(() => setBookedSlots(new Set()));
  }, [dateStr]);

  const price = selected && date ? computePrice(rules, selected, date) : 0;
  const tax = Math.round(price * 0.18);
  const total = price + tax;

  async function confirmBooking() {
    if (!user || !profile) {
      toast.info("Please sign in to book a slot");
      navigate({ to: "/login" });
      return;
    }
    if (!selected || !date) return;
    setSubmitting(true);
    try {
      const id = await createBooking({
        userId: user.uid,
        customerName: profile.fullName,
        phone: profile.phone,
        bookingDate: dateStr,
        timeSlot: selected,
        price: total,
      });
      await createNotification({
        userId: user.uid,
        title: "Booking confirmed",
        body: `${selected} on ${date.toDateString()} · Total ₹${total}`,
      });
      toast.success("Booking confirmed!", {
        description: `${selected} on ${date.toDateString()} · Total ₹${total} · Ref ${id.slice(0, 6)}`,
      });
      setBookedSlots((prev) => new Set(prev).add(selected));
      setSelected(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
              Book a slot
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Pick your date & time</h1>
            <p className="mt-2 text-muted-foreground">Slots update in real time. Cancel up to 6 hours before start.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <MapPin className="h-4 w-4 text-secondary" /> {business.name}, Indiranagar
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[420px_1fr]">
          {/* Calendar column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarIcon className="h-4 w-4 text-primary" /> Select a date
              </div>
              <div className="mt-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d ?? undefined);
                    setSelected(null);
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className={cn("p-0 pointer-events-auto")}
                />
              </div>
            </div>

            <Legend />
          </div>

          {/* Slots column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-primary" /> Available time slots
                </div>
                <span className="text-xs text-muted-foreground">{date?.toDateString()}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground">Loading slots…</p>
                )}
                {slots.map((t) => {
                  const booked = bookedSlots.has(t);
                  const status = selected === t ? "selected" : booked ? "booked" : "available";
                  const isBooked = booked;
                  return (
                    <button
                      key={t}
                      disabled={isBooked}
                      onClick={() => setSelected(t === selected ? null : t)}
                      className={cn(
                        "group relative rounded-xl border p-3 text-left transition-all",
                        "disabled:cursor-not-allowed",
                        status === "available" && "border-border bg-background hover:border-secondary hover:bg-secondary/5",
                        status === "booked" && "border-destructive/20 bg-destructive/5 text-muted-foreground",
                        status === "selected" && "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]",
                      )}
                    >
                      <p className="text-sm font-semibold">{t}</p>
                      <p className={cn("mt-1 text-xs capitalize",
                        status === "selected" ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}>
                        {status === "booked" ? "Booked" : status === "selected" ? "Selected" : `₹${computePrice(rules, t, date ?? new Date())}`}
                      </p>
                      {status === "selected" && (
                        <CheckCircle2 className="absolute right-2 top-2 h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
              <h3 className="text-lg font-semibold">Booking summary</h3>
              <dl className="mt-4 divide-y divide-border/60 text-sm">
                <Row label="Date" value={date ? date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : "—"} />
                <Row label="Time" value={selected ?? "Select a slot"} />
                <Row label="Duration" value="1 hour" />
                <Row label="Price" value={selected ? `₹${price}` : "—"} />
                <Row label="Tax (18%)" value={selected ? `₹${tax}` : "—"} />
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-2xl font-bold tracking-tight">
                    {selected ? `₹${total}` : "—"}
                  </span>
                </div>
              </dl>
              <Button
                disabled={!selected || submitting || authLoading}
                onClick={confirmBooking}
                className="mt-2 h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold shadow-sm"
              >
                {submitting ? "Confirming…" : user ? "Confirm Booking" : "Sign in to Book"}
              </Button>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" /> Free cancellation up to 6 hours before start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Legend() {
  const items = [
    { c: "bg-background border-border", l: "Available" },
    { c: "bg-primary border-primary", l: "Selected" },
    { c: "bg-destructive/10 border-destructive/20", l: "Booked" },
    { c: "bg-muted border-border", l: "Maintenance" },
  ];
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-semibold">Legend</p>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {items.map((i) => (
          <li key={i.l} className="flex items-center gap-2">
            <span className={cn("h-4 w-4 rounded-md border", i.c)} />
            <span className="text-muted-foreground">{i.l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}