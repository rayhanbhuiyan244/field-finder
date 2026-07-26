import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, CalendarDays, Users, Tags, BarChart3, Settings, LogOut,
  Home, ChevronRight, IndianRupee, TrendingUp, Clock, AlertCircle,
  Plus, Search, Eye, Pencil, X, CheckCircle2, CalendarClock, FileBarChart,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toISODate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import {
  listAllBookings, listBookingsForDate, updateBookingStatus, cancelBooking,
  type Booking,
} from "@/services/bookingService";
import { listCustomers, type UserProfile } from "@/services/userService";
import { listPricingRules, type PricingRule } from "@/services/pricingService";
import { listTimeSlots } from "@/services/timeslotService";
import { getBusinessSettings, saveBusinessSettings, type BusinessSettings } from "@/services/gallerySettingsService";
import { logout } from "@/services/authService";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { EmptyState, ErrorState, SkeletonDashboard, SkeletonTable, ConfirmDialog } from "@/components/feedback";
import { notify } from "@/lib/toast";
import { CalendarX, UsersRound } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Owner Dashboard — Kickoff Arena" }] }),
  component: AdminGuarded,
});

function AdminGuarded() {
  return (
    <ProtectedRoute role="owner">
      <Admin />
    </ProtectedRoute>
  );
}

type Section =
  | "dashboard" | "bookings" | "calendar" | "customers"
  | "pricing" | "reports" | "settings";

const menu: { key: Section; label: string; icon: typeof Home }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "Bookings", icon: CalendarDays },
  { key: "calendar", label: "Calendar", icon: CalendarClock },
  { key: "customers", label: "Customers", icon: Users },
  { key: "pricing", label: "Pricing", icon: Tags },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

function Admin() {
  const [section, setSection] = useState<Section>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();

  const loadAll = () => {
    setLoading(true);
    setLoadError(false);
    Promise.all([
      listAllBookings().catch(() => { setLoadError(true); return [] as Booking[]; }),
      listCustomers().catch(() => [] as UserProfile[]),
      listPricingRules().catch(() => [] as PricingRule[]),
      getBusinessSettings().catch(() => null),
    ])
      .then(([b, c, p, biz]) => {
        setBookings(b);
        setCustomers(c);
        setPricing(p);
        setBusinessInfo(biz);
      })
      .finally(() => setLoading(false));
  };
  useEffect(loadAll, []);

  async function refreshBookings() {
    const rows = await listAllBookings().catch(() => [] as Booking[]);
    setBookings(rows);
  }

  async function onLogout() {
    await logout();
    notify.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground font-black">K</span>
          <div>
            <p className="font-bold leading-tight">Kickoff Arena</p>
            <p className="text-xs text-sidebar-foreground/60">Owner Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {menu.map((m) => (
            <button
              key={m.key}
              onClick={() => setSection(m.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                section === m.key
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <m.icon className="h-4 w-4" /> {m.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground flex items-center gap-1"><Home className="h-4 w-4" /> Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Owner</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="capitalize text-foreground font-medium">{section}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="text-right text-sm">
                <p className="font-medium">Owner Admin</p>
                <p className="text-xs text-muted-foreground">{businessInfo?.name ?? "Kickoff Arena"}</p>
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">OA</div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 space-y-6">
          {loading ? (
            <SkeletonDashboard />
          ) : loadError ? (
            <ErrorState variant="network" onRetry={loadAll} />
          ) : (
            <>
              {section === "dashboard" && <OwnerDashboard onNav={setSection} bookings={bookings} />}
              {section === "bookings" && <BookingsManagement rows={bookings} onRefresh={refreshBookings} />}
          {section === "calendar" && <CalendarView />}
          {section === "customers" && <CustomersView customers={customers} />}
          {section === "pricing" && <PricingManagement rules={pricing} onSaved={() => listPricingRules().then(setPricing)} />}
          {section === "reports" && <Reports bookings={bookings} />}
          {section === "settings" && <AdminSettings info={businessInfo} onSaved={setBusinessInfo} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Owner dashboard ----------
function OwnerDashboard({ onNav, bookings }: { onNav: (s: Section) => void; bookings: Booking[] }) {
  const today = toISODate(new Date());
  const todaysBookings = bookings.filter((b) => b.bookingDate === today);
  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((a, b) => a + b.price, 0);
  const pending = bookings.filter((b) => b.bookingStatus === "pending").length;
  const completed = bookings.filter((b) => b.bookingStatus === "completed").length;
  const revenueSeries = buildWeeklyRevenue(bookings);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning 👋</h1>
        <p className="text-sm text-muted-foreground">Here's how your arena is doing today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Bookings" value={todaysBookings.length} icon={CalendarDays} tone="primary" />
        <StatCard label="Total Revenue" value={`₹${(revenue / 1000).toFixed(1)}k`} icon={IndianRupee} tone="secondary" />
        <StatCard label="Completed" value={completed} icon={TrendingUp} tone="accent" />
        <StatCard label="Pending Bookings" value={pending} icon={AlertCircle} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Revenue trend</h3>
            <span className="text-xs text-muted-foreground">Last 12 weeks</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.36 0.13 258)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.36 0.13 258)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 258)" }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.36 0.13 258)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-4 space-y-3">
            <Button onClick={() => onNav("bookings")} className="h-11 w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Add Booking
            </Button>
            <Button onClick={() => onNav("calendar")} variant="outline" className="h-11 w-full justify-start">
              <Clock className="mr-2 h-4 w-4" /> Block Time
            </Button>
            <Button onClick={() => onNav("reports")} variant="outline" className="h-11 w-full justify-start">
              <FileBarChart className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </div>

          <h3 className="mt-6 font-semibold">Recent activity</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {bookings.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-secondary shrink-0" />
                <span className="text-muted-foreground">
                  {b.customerName} · {b.timeSlot} · {b.bookingStatus}
                </span>
              </li>
            ))}
            {bookings.length === 0 && (
              <li className="text-muted-foreground text-xs">No activity yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <h3 className="font-semibold">Today's bookings</h3>
          <button onClick={() => onNav("bookings")} className="text-sm font-medium text-primary hover:underline">Manage</button>
        </div>
        <FullBookingTable rows={todaysBookings} readOnly />
      </div>
    </>
  );
}

function buildWeeklyRevenue(bookings: Booking[]) {
  // Group by week label (last 12 weeks including current)
  const now = new Date();
  const weeks: { week: string; start: Date; revenue: number; bookings: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7);
    weeks.push({ week: `W${12 - i}`, start, revenue: 0, bookings: 0 });
  }
  for (const b of bookings) {
    const d = new Date(b.bookingDate);
    const idx = weeks.findIndex((w, i) => {
      const next = weeks[i + 1]?.start ?? new Date(w.start.getTime() + 7 * 86400000);
      return d >= w.start && d < next;
    });
    if (idx >= 0) {
      weeks[idx].revenue += b.paymentStatus === "paid" ? b.price : 0;
      weeks[idx].bookings += 1;
    }
  }
  return weeks;
}

// ---------- Bookings management ----------
function BookingsManagement({ rows: initial, onRefresh }: { rows: Booking[]; onRefresh: () => Promise<void> }) {
  const [rows, setRows] = useState<Booking[]>(initial);
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null);

  useEffect(() => setRows(initial), [initial]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      r.id.toLowerCase().includes(s) ||
      r.customerName.toLowerCase().includes(s) ||
      r.phone.includes(s),
    );
  }, [rows, q]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage every reservation across the arena.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking, name, phone…" className="pl-9 w-72" />
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/booking"><Plus className="mr-2 h-4 w-4" /> New booking</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <FullBookingTable
          rows={filtered}
          onView={setViewing}
          onCancel={(id) => {
            const b = filtered.find((r) => r.id === id) ?? null;
            setPendingCancel(b);
          }}
          onComplete={async (id) => {
            try {
              await updateBookingStatus(id, { bookingStatus: "completed", paymentStatus: "paid" });
              await onRefresh();
              notify.success("Booking completed");
            } catch (err) {
              notify.fromError(err, "Update failed");
            }
          }}
        />
      </div>

      <ConfirmDialog
        open={!!pendingCancel}
        onOpenChange={(o) => !o && setPendingCancel(null)}
        title="Cancel this booking?"
        description={
          pendingCancel
            ? `${pendingCancel.customerName} · ${pendingCancel.bookingDate} · ${pendingCancel.timeSlot}. This will refund the payment and free the slot.`
            : undefined
        }
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        variant="destructive"
        onConfirm={async () => {
          if (!pendingCancel) return;
          try {
            await cancelBooking(pendingCancel.id);
            await onRefresh();
            notify.success("Booking cancelled");
          } catch (err) {
            notify.fromError(err, "Update failed");
          }
        }}
      />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking {viewing?.id?.slice(0, 8).toUpperCase()}</DialogTitle>
            <DialogDescription>Booking details</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{viewing.customerName}</p></div>
              <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{viewing.phone}</p></div>
              <div><p className="text-muted-foreground">Date</p><p className="font-medium">{viewing.bookingDate}</p></div>
              <div><p className="text-muted-foreground">Time</p><p className="font-medium">{viewing.timeSlot}</p></div>
              <div><p className="text-muted-foreground">Price</p><p className="font-medium">₹{viewing.price}</p></div>
              <div><p className="text-muted-foreground">Payment</p><StatusBadge status={viewing.paymentStatus} /></div>
              <div><p className="text-muted-foreground">Status</p><StatusBadge status={viewing.bookingStatus} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FullBookingTable({
  rows, onView, onCancel, onComplete, readOnly,
}: {
  rows: Booking[];
  onView?: (b: Booking) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Customer</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Date</th>
            <th className="p-4">Time</th>
            <th className="p-4">Price</th>
            <th className="p-4">Payment</th>
            <th className="p-4">Status</th>
            {!readOnly && <th className="p-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={readOnly ? 8 : 9} className="p-6">
                <EmptyState
                  icon={CalendarX}
                  title="No bookings"
                  description={readOnly ? "Nothing on the schedule for this view." : "No reservations match this filter yet."}
                />
              </td>
            </tr>
          )}
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-border/40 hover:bg-muted/20">
              <td className="p-4 font-medium">{b.id.slice(0, 8).toUpperCase()}</td>
              <td className="p-4">{b.customerName}</td>
              <td className="p-4 text-muted-foreground">{b.phone}</td>
              <td className="p-4">{b.bookingDate}</td>
              <td className="p-4">{b.timeSlot}</td>
              <td className="p-4 font-medium">₹{b.price}</td>
              <td className="p-4"><StatusBadge status={b.paymentStatus} /></td>
              <td className="p-4"><StatusBadge status={b.bookingStatus} /></td>
              {!readOnly && (
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn label="View" onClick={() => onView?.(b)}><Eye className="h-4 w-4" /></IconBtn>
                    <IconBtn label="Edit" onClick={() => toast.info("Edit coming soon")}><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn label="Complete" onClick={() => onComplete?.(b.id)}><CheckCircle2 className="h-4 w-4 text-secondary" /></IconBtn>
                    <IconBtn label="Cancel" onClick={() => onCancel?.(b.id)}><X className="h-4 w-4 text-destructive" /></IconBtn>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button aria-label={label} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted">
      {children}
    </button>
  );
}

// ---------- Calendar view (Google-Calendar-style grid) ----------
function CalendarView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [bookedByDate, setBookedByDate] = useState<Record<string, Set<string>>>({});
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    listTimeSlots().then((s) => setSlots(s.map((x) => x.label))).catch(() => setSlots([]));
  }, []);

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        days.map(async (d) => {
          const key = toISODate(d);
          try {
            const rows = await listBookingsForDate(key);
            return [key, new Set(rows.filter((r) => r.bookingStatus !== "cancelled").map((r) => r.timeSlot))] as const;
          } catch {
            return [key, new Set<string>()] as const;
          }
        }),
      );
      setBookedByDate(Object.fromEntries(entries));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Court schedule</h1>
          <p className="text-sm text-muted-foreground">Google-Calendar-style view. Click any open cell to select.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { c: "bg-secondary/20 border-secondary/40 text-secondary", l: "Available" },
            { c: "bg-destructive/15 border-destructive/40 text-destructive", l: "Booked" },
            { c: "bg-primary border-primary text-primary-foreground", l: "Selected" },
          ].map((x) => (
            <span key={x.l} className={cn("rounded-full border px-3 py-1", x.c)}>{x.l}</span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
        <table className="w-full min-w-[900px] border-separate border-spacing-1 p-2">
          <thead>
            <tr>
              <th className="w-24 p-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Time</th>
              {days.map((d) => (
                <th key={d.toISOString()} className="p-2 text-left text-xs font-medium text-muted-foreground">
                  <div className="text-foreground text-sm font-semibold">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div>{d.toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((t) => (
              <tr key={t}>
                <td className="w-24 p-2 text-xs font-medium text-muted-foreground align-top">{t.split(" ")[0]}</td>
                {days.map((d) => {
                  const key = `${toISODate(d)}|${t}`;
                  const dateKey = toISODate(d);
                  const base: "available" | "booked" = bookedByDate[dateKey]?.has(t) ? "booked" : "available";
                  const status = selected === key ? "selected" : base;
                  const disabled = base === "booked";
                  return (
                    <td key={key} className="p-0">
                      <button
                        disabled={disabled}
                        onClick={() => setSelected((s) => (s === key ? null : key))}
                        className={cn(
                          "h-14 w-full rounded-lg border text-left px-2 text-xs font-medium transition-all disabled:cursor-not-allowed",
                          status === "available" && "bg-secondary/15 border-secondary/30 text-secondary hover:bg-secondary/25",
                          status === "booked" && "bg-destructive/10 border-destructive/30 text-destructive",
                          status === "selected" && "bg-primary border-primary text-primary-foreground shadow-md",
                        )}
                      >
                        <p className="text-[10px] uppercase tracking-wider opacity-70">
                          {status === "available" ? "Open" : status === "booked" ? "Booked" : "Selected"}
                        </p>
                        <p className="font-semibold">{t.split(" ")[0]}</p>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------- Customers ----------
function CustomersView({ customers }: { customers: UserProfile[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return customers;
    const s = q.toLowerCase();
    return customers.filter((c) => c.fullName.toLowerCase().includes(s) || c.email.includes(s) || (c.phone ?? "").includes(s));
  }, [q, customers]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} registered players.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-9 w-72" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={q ? "No matching customers" : "No customers yet"}
          description={q ? "Try a different name, email or phone." : "Registered players will show up here."}
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.slice(0, 24).map((c) => (
          <div key={c.uid} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              {c.photoURL ? (
                <img src={c.photoURL} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {c.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{c.email}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Phone: {c.phone || "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Role: {c.role}</p>
          </div>
        ))}
      </div>
      )}
    </>
  );
}

// ---------- Pricing management ----------
function PricingManagement({ rules: initial, onSaved }: { rules: PricingRule[]; onSaved: () => void }) {
  const [rules, setRules] = useState<PricingRule[]>(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setRules(initial), [initial]);

  async function save() {
    setSaving(true);
    try {
      await Promise.all(
        rules.map((r) =>
          updateDoc(doc(db, "pricing", r.id), {
            price: r.price,
            note: r.note,
            updatedAt: serverTimestamp(),
          }),
        ),
      );
      toast.success("Pricing rules saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing rules</h1>
          <p className="text-sm text-muted-foreground">Edit hourly rates for each time window.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground">No pricing rules defined yet.</p>
        )}
        {rules.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.window}</p>
              </div>
              <StatusBadge status="confirmed" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label className="text-xs">Price / hour (₹)</Label>
                <Input
                  type="number"
                  value={r.price}
                  onChange={(e) => setRules((rs) => rs.map((x) => x.id === r.id ? { ...x, price: Number(e.target.value) } : x))}
                />
              </div>
              <div className="space-y-1"><Label className="text-xs">Note</Label>
                <Input
                  value={r.note}
                  onChange={(e) => setRules((rs) => rs.map((x) => x.id === r.id ? { ...x, note: e.target.value } : x))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </>
  );
}

// ---------- Reports ----------
function Reports({ bookings }: { bookings: Booking[] }) {
  const revenueSeries = buildWeeklyRevenue(bookings);
  const daily = revenueSeries.slice(-1)[0]?.revenue ?? 0;
  const weekly = revenueSeries.slice(-1)[0]?.revenue ?? 0;
  const monthly = revenueSeries.slice(-4).reduce((a, b) => a + b.revenue, 0);
  const total = bookings.length;

  const peakHourSeries = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bookings) {
      const s = b.timeSlot.split(" ")[0];
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([slot, count]) => ({ slot, bookings: count }));
  }, [bookings]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & analytics</h1>
        <p className="text-sm text-muted-foreground">Revenue, occupancy and peak-hour trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Daily Revenue" value={`₹${daily.toLocaleString()}`} icon={IndianRupee} tone="primary" />
        <StatCard label="Weekly Revenue" value={`₹${weekly.toLocaleString()}`} icon={TrendingUp} tone="secondary" />
        <StatCard label="Monthly Revenue" value={`₹${monthly.toLocaleString()}`} icon={BarChart3} tone="accent" />
        <StatCard label="Total Bookings" value={total} icon={CalendarDays} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Booking trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 258)" }} />
                <Bar dataKey="bookings" fill="oklch(0.66 0.16 148)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Peak hours</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHourSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="slot" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 258)" }} />
                <Bar dataKey="bookings" fill="oklch(0.72 0.17 55)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- Settings ----------
function AdminSettings({ info, onSaved }: { info: BusinessSettings | null; onSaved: (b: BusinessSettings) => void }) {
  const [form, setForm] = useState<BusinessSettings>(
    info ?? {
      name: "Kickoff Arena",
      tagline: "Premium 5-a-side football turf",
      address: "",
      phone: "",
      email: "",
      hours: "6:00 AM - 12:00 AM, all days",
    },
  );
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (info) setForm(info); }, [info]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveBusinessSettings(form);
      onSaved(form);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Business info, opening hours and booking policy.</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Business info</h3>
          <div className="mt-4 space-y-3">
            <div className="space-y-2"><Label>Business name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Booking policy</h3>
          <div className="mt-4 space-y-3">
            <div className="space-y-2"><Label>Opening hours</Label><Input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>Slot duration (min)</Label><Input type="number" defaultValue={60} /></div>
              <div className="space-y-2"><Label>Buffer time (min)</Label><Input type="number" defaultValue={10} /></div>
            </div>
            <div className="space-y-2"><Label>Cancellation policy</Label><Input defaultValue="Free cancellation up to 6 hours before start." /></div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </>
  );
}