import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { toISODate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { listTimeSlots } from "@/services/timeslotService";
import { listBookingsForDate } from "@/services/bookingService";
import { SkeletonCalendar, ErrorState } from "@/components/feedback";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Live Availability — Kickoff Arena" },
      { name: "description", content: "See open turf slots across the next 7 days." },
    ],
  }),
  component: Availability,
});

function Availability() {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [bookedByDate, setBookedByDate] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      listTimeSlots(),
      Promise.all(
        days.map(async (d) => {
          const key = toISODate(d);
          const rows = await listBookingsForDate(key);
          return [key, new Set(rows.filter((r) => r.bookingStatus !== "cancelled").map((r) => r.timeSlot))] as const;
        }),
      ),
    ])
      .then(([ts, entries]) => {
        setSlots(ts.map((x) => x.label));
        setBookedByDate(Object.fromEntries(entries));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
          Live availability
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Next 7 days at a glance</h1>
        <p className="mt-2 text-muted-foreground">Green = open, red = taken.</p>

        <div className="mt-8">
          {loading && <SkeletonCalendar days={7} slots={8} />}
          {!loading && error && <ErrorState variant="network" onRetry={load} />}
          {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <th className="p-4 text-xs uppercase tracking-wider text-muted-foreground">Time</th>
                {days.map((d) => (
                  <th key={d.toISOString()} className="p-4 text-xs uppercase tracking-wider text-muted-foreground">
                    <div className="font-semibold text-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                    <div className="text-muted-foreground">{d.toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((t) => (
                <tr key={t} className="border-b border-border/40 last:border-0">
                  <td className="p-3 font-medium">{t}</td>
                  {days.map((d) => {
                    const key = toISODate(d);
                    const status = bookedByDate[key]?.has(t) ? "booked" : "available";
                    return (
                      <td key={d.toISOString()} className="p-2">
                        <div className={cn(
                          "h-9 rounded-lg text-xs font-medium grid place-items-center transition-colors",
                          status === "available" && "bg-secondary/15 text-secondary hover:bg-secondary/25",
                          status === "booked" && "bg-destructive/10 text-destructive",
                        )}>
                          {status === "available" ? "Open" : "Booked"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/booking">Book an open slot</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}