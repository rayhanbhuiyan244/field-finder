import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Home,
  ChevronRight,
  IndianRupee,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Pencil,
  X,
  CheckCircle2,
  CalendarClock,
  FileBarChart,
  Image,
  Trash2,
  Upload,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toISODate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import {
  listAllBookings,
  listBookingsForDate,
  confirmBooking,
  completeBooking,
  cancelBooking,
  type Booking,
} from "@/services/bookingService";
import { listCustomers, type UserProfile } from "@/services/userService";
import {
  listPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  type PricingRule,
} from "@/services/pricingService";
import {
  listTimeSlots,
  createTimeSlot,
  deleteTimeSlot,
  type TimeSlot,
} from "@/services/timeslotService";
import {
  listMaintenanceBlocksForDate,
  createMaintenanceBlock,
  deleteMaintenanceBlock,
  type MaintenanceBlock,
} from "@/services/maintenanceService";
import { uploadGalleryImage, deleteGalleryImage } from "@/services/storageService";
import { createNotification } from "@/services/notificationService";
import {
  listGallery,
  addGalleryImage,
  deleteGalleryImageDoc,
  getBusinessSettings,
  saveBusinessSettings,
  type GalleryImage,
  type BusinessSettings,
} from "@/services/gallerySettingsService";
import { logout } from "@/services/authService";
import {
  EmptyState,
  ErrorState,
  SkeletonDashboard,
  SkeletonTable,
  ConfirmDialog,
} from "@/components/feedback";
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
  | "dashboard"
  | "bookings"
  | "calendar"
  | "customers"
  | "pricing"
  | "gallery"
  | "reports"
  | "settings";

const menu: { key: Section; label: string; icon: typeof Home }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "Bookings", icon: CalendarDays },
  { key: "calendar", label: "Calendar", icon: CalendarClock },
  { key: "customers", label: "Customers", icon: Users },
  { key: "pricing", label: "Pricing", icon: Tags },
  { key: "gallery", label: "Gallery", icon: Image },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

function Admin() {
  const [section, setSection] = useState<Section>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();

  const loadAll = () => {
    setLoading(true);
    setLoadError(false);
    Promise.all([
      listAllBookings().catch(() => {
        setLoadError(true);
        return [] as Booking[];
      }),
      listCustomers().catch(() => [] as UserProfile[]),
      listPricingRules().catch(() => [] as PricingRule[]),
      listGallery().catch(() => [] as GalleryImage[]),
      getBusinessSettings().catch(() => null),
    ])
      .then(([b, c, p, g, biz]) => {
        setBookings(b);
        setCustomers(c);
        setPricing(p);
        setGallery(g);
        setBusinessInfo(biz);
      })
      .finally(() => setLoading(false));
  };
  useEffect(loadAll, []);

  async function refreshGallery() {
    const rows = await listGallery().catch(() => [] as GalleryImage[]);
    setGallery(rows);
  }

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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground font-black">
            K
          </span>
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
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" /> Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Owner</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="capitalize text-foreground font-medium">{section}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="text-right text-sm">
                <p className="font-medium">Owner Admin</p>
                <p className="text-xs text-muted-foreground">
                  {businessInfo?.name ?? "Kickoff Arena"}
                </p>
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              OA
            </div>
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
              {section === "bookings" && (
                <BookingsManagement rows={bookings} onRefresh={refreshBookings} />
              )}
              {section === "calendar" && <CalendarView />}
              {section === "customers" && <CustomersView customers={customers} />}
              {section === "pricing" && (
                <PricingManagement
                  rules={pricing}
                  onSaved={() => listPricingRules().then(setPricing)}
                />
              )}
              {section === "gallery" && (
                <GalleryManagement images={gallery} onChanged={refreshGallery} />
              )}
              {section === "reports" && <Reports bookings={bookings} />}
              {section === "settings" && (
                <AdminSettings info={businessInfo} onSaved={setBusinessInfo} />
              )}
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
        <StatCard
          label="Today's Bookings"
          value={todaysBookings.length}
          icon={CalendarDays}
          tone="primary"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${(revenue / 1000).toFixed(1)}k`}
          icon={IndianRupee}
          tone="secondary"
        />
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
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 258)" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.36 0.13 258)"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-4 space-y-3">
            <Button
              onClick={() => onNav("bookings")}
              className="h-11 w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Booking
            </Button>
            <Button
              onClick={() => onNav("calendar")}
              variant="outline"
              className="h-11 w-full justify-start"
            >
              <Clock className="mr-2 h-4 w-4" /> Block Time
            </Button>
            <Button
              onClick={() => onNav("reports")}
              variant="outline"
              className="h-11 w-full justify-start"
            >
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
          <button
            onClick={() => onNav("bookings")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage
          </button>
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
function BookingsManagement({
  rows: initial,
  onRefresh,
}: {
  rows: Booking[];
  onRefresh: () => Promise<void>;
}) {
  const [rows, setRows] = useState<Booking[]>(initial);
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null);

  useEffect(() => setRows(initial), [initial]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
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
          <p className="text-sm text-muted-foreground">
            Manage every reservation across the arena.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search booking, name, phone…"
              className="pl-9 w-72"
            />
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/booking">
              <Plus className="mr-2 h-4 w-4" /> New booking
            </Link>
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
          onConfirm={async (id) => {
            try {
              await confirmBooking(id);
              await onRefresh();
              notify.success("Booking confirmed");
              const b = filtered.find((r) => r.id === id);
              if (b) {
                await createNotification({
                  userId: b.userId,
                  title: "Booking confirmed",
                  body: `${b.timeSlot} on ${b.bookingDate} is confirmed. See you on the pitch!`,
                }).catch(() => {});
              }
            } catch (err) {
              notify.fromError(err, "Update failed");
            }
          }}
          onComplete={async (id) => {
            try {
              await completeBooking(id);
              await onRefresh();
              notify.success("Booking completed");
              const b = filtered.find((r) => r.id === id);
              if (b) {
                await createNotification({
                  userId: b.userId,
                  title: "Match completed",
                  body: `Thanks for playing! Your ${b.timeSlot} session on ${b.bookingDate} is marked complete.`,
                }).catch(() => {});
              }
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
            ? `${pendingCancel.customerName} · ${pendingCancel.bookingDate} · ${pendingCancel.timeSlot}. This frees the slot for other customers, and refunds the payment if it was already collected.`
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
            await createNotification({
              userId: pendingCancel.userId,
              title: "Booking cancelled",
              body: `Your ${pendingCancel.timeSlot} booking on ${pendingCancel.bookingDate} was cancelled by the venue.`,
            }).catch(() => {});
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
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{viewing.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{viewing.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{viewing.bookingDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">{viewing.timeSlot}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium">₹{viewing.price}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <StatusBadge status={viewing.paymentStatus} />
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <StatusBadge status={viewing.bookingStatus} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FullBookingTable({
  rows,
  onView,
  onCancel,
  onComplete,
  onConfirm,
  readOnly,
}: {
  rows: Booking[];
  onView?: (b: Booking) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onConfirm?: (id: string) => void;
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
                  description={
                    readOnly
                      ? "Nothing on the schedule for this view."
                      : "No reservations match this filter yet."
                  }
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
              <td className="p-4">
                <StatusBadge status={b.paymentStatus} />
              </td>
              <td className="p-4">
                <StatusBadge status={b.bookingStatus} />
              </td>
              {!readOnly && (
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn label="View" onClick={() => onView?.(b)}>
                      <Eye className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Edit" onClick={() => toast.info("Edit coming soon")}>
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    {b.bookingStatus === "pending" && (
                      <IconBtn label="Confirm" onClick={() => onConfirm?.(b.id)}>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </IconBtn>
                    )}
                    {b.bookingStatus === "confirmed" && (
                      <IconBtn label="Complete" onClick={() => onComplete?.(b.id)}>
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      </IconBtn>
                    )}
                    {(b.bookingStatus === "pending" || b.bookingStatus === "confirmed") && (
                      <IconBtn label="Cancel" onClick={() => onCancel?.(b.id)}>
                        <X className="h-4 w-4 text-destructive" />
                      </IconBtn>
                    )}
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

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
    >
      {children}
    </button>
  );
}

// ---------- Calendar view (Google-Calendar-style grid) ----------
function CalendarView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [bookedByDate, setBookedByDate] = useState<Record<string, Set<string>>>({});
  const [blocksByDate, setBlocksByDate] = useState<Record<string, MaintenanceBlock[]>>({});
  const [pendingBlock, setPendingBlock] = useState<{ date: string; timeSlot: string } | null>(null);
  const [pendingUnblock, setPendingUnblock] = useState<MaintenanceBlock | null>(null);
  const [reason, setReason] = useState("");
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    listTimeSlots()
      .then((s) => setSlots(s.map((x) => x.label)))
      .catch(() => setSlots([]));
  }, []);

  async function refresh() {
    const entries = await Promise.all(
      days.map(async (d) => {
        const key = toISODate(d);
        try {
          const rows = await listBookingsForDate(key);
          return [
            key,
            new Set(rows.filter((r) => r.bookingStatus !== "cancelled").map((r) => r.timeSlot)),
          ] as const;
        } catch {
          return [key, new Set<string>()] as const;
        }
      }),
    );
    setBookedByDate(Object.fromEntries(entries));

    const blockEntries = await Promise.all(
      days.map(async (d) => {
        const key = toISODate(d);
        const blocks = await listMaintenanceBlocksForDate(key).catch(
          () => [] as MaintenanceBlock[],
        );
        return [key, blocks] as const;
      }),
    );
    setBlocksByDate(Object.fromEntries(blockEntries));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function findBlock(dateKey: string, t: string): MaintenanceBlock | undefined {
    return blocksByDate[dateKey]?.find((b) => {
      const [slotStart, slotEnd] = t.split(" - ").map((s) => s.trim());
      return slotStart < b.endTime && b.startTime < slotEnd;
    });
  }

  async function confirmBlock() {
    if (!pendingBlock) return;
    try {
      const [startTime, endTime] = pendingBlock.timeSlot.split(" - ").map((s) => s.trim());
      await createMaintenanceBlock({
        date: pendingBlock.date,
        startTime,
        endTime,
        reason: reason.trim() || undefined,
      });
      notify.success("Slot blocked");
      setReason("");
      await refresh();
    } catch (err) {
      notify.fromError(err, "Couldn't block slot");
    }
  }

  async function confirmUnblock() {
    if (!pendingUnblock) return;
    try {
      await deleteMaintenanceBlock(pendingUnblock.id);
      notify.success("Slot reopened");
      await refresh();
    } catch (err) {
      notify.fromError(err, "Couldn't reopen slot");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Court schedule</h1>
          <p className="text-sm text-muted-foreground">
            Click an open cell to block it for maintenance, or a blocked cell to reopen it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { c: "bg-secondary/20 border-secondary/40 text-secondary", l: "Available" },
            { c: "bg-destructive/15 border-destructive/40 text-destructive", l: "Booked" },
            { c: "bg-warning/20 border-warning/40 text-warning-foreground", l: "Maintenance" },
          ].map((x) => (
            <span key={x.l} className={cn("rounded-full border px-3 py-1", x.c)}>
              {x.l}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
        <table className="w-full min-w-[900px] border-separate border-spacing-1 p-2">
          <thead>
            <tr>
              <th className="w-24 p-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
                Time
              </th>
              {days.map((d) => (
                <th
                  key={d.toISOString()}
                  className="p-2 text-left text-xs font-medium text-muted-foreground"
                >
                  <div className="text-foreground text-sm font-semibold">
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div>{d.toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((t) => (
              <tr key={t}>
                <td className="w-24 p-2 text-xs font-medium text-muted-foreground align-top">
                  {t.split(" ")[0]}
                </td>
                {days.map((d) => {
                  const dateKey = toISODate(d);
                  const block = findBlock(dateKey, t);
                  const booked = bookedByDate[dateKey]?.has(t);
                  const status: "available" | "booked" | "blocked" = block
                    ? "blocked"
                    : booked
                      ? "booked"
                      : "available";
                  return (
                    <td key={`${dateKey}|${t}`} className="p-0">
                      <button
                        disabled={status === "booked"}
                        onClick={() => {
                          if (status === "blocked" && block) setPendingUnblock(block);
                          else if (status === "available")
                            setPendingBlock({ date: dateKey, timeSlot: t });
                        }}
                        className={cn(
                          "h-14 w-full rounded-lg border text-left px-2 text-xs font-medium transition-all disabled:cursor-not-allowed",
                          status === "available" &&
                            "bg-secondary/15 border-secondary/30 text-secondary hover:bg-secondary/25",
                          status === "booked" &&
                            "bg-destructive/10 border-destructive/30 text-destructive",
                          status === "blocked" &&
                            "bg-warning/20 border-warning/40 text-warning-foreground hover:bg-warning/30",
                        )}
                      >
                        <p className="text-[10px] uppercase tracking-wider opacity-70">
                          {status === "available"
                            ? "Open"
                            : status === "booked"
                              ? "Booked"
                              : "Maintenance"}
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

      <ConfirmDialog
        open={!!pendingBlock}
        onOpenChange={(o) => !o && setPendingBlock(null)}
        title="Block this slot?"
        description={
          pendingBlock
            ? `${pendingBlock.date} · ${pendingBlock.timeSlot}. Customers won't be able to book it until you reopen it.`
            : ""
        }
        confirmLabel="Block slot"
        onConfirm={confirmBlock}
      >
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional) — e.g. resurfacing"
          className="mt-3"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={!!pendingUnblock}
        onOpenChange={(o) => !o && setPendingUnblock(null)}
        title="Reopen this slot?"
        description={
          pendingUnblock
            ? `${pendingUnblock.date} · ${pendingUnblock.startTime} - ${pendingUnblock.endTime}${pendingUnblock.reason ? ` · ${pendingUnblock.reason}` : ""}`
            : ""
        }
        confirmLabel="Reopen slot"
        onConfirm={confirmUnblock}
      />
    </>
  );
}

// ---------- Customers ----------
function CustomersView({ customers }: { customers: UserProfile[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return customers;
    const s = q.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(s) || c.email.includes(s) || (c.phone ?? "").includes(s),
    );
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
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers…"
            className="pl-9 w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={q ? "No matching customers" : "No customers yet"}
          description={
            q ? "Try a different name, email or phone." : "Registered players will show up here."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, 24).map((c) => (
            <div
              key={c.uid}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                {c.photoURL ? (
                  <img src={c.photoURL} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {c.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
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
function PricingManagement({
  rules: initial,
  onSaved,
}: {
  rules: PricingRule[];
  onSaved: () => void;
}) {
  const [rules, setRules] = useState<PricingRule[]>(initial);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState({ label: "", window: "", price: 1000, note: "" });
  const [deleteTarget, setDeleteTarget] = useState<PricingRule | null>(null);
  useEffect(() => setRules(initial), [initial]);

  async function save() {
    setSaving(true);
    try {
      await Promise.all(
        rules.map((r) => updatePricingRule(r.id, { price: r.price, note: r.note })),
      );
      toast.success("Pricing rules saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addRule() {
    if (!newRule.label.trim()) {
      toast.error("Give the rule a name first");
      return;
    }
    setAdding(true);
    try {
      await createPricingRule({ ...newRule, order: rules.length });
      toast.success("Pricing rule added");
      setNewRule({ label: "", window: "", price: 1000, note: "" });
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add rule");
    } finally {
      setAdding(false);
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
              <div className="flex items-center gap-2">
                <StatusBadge status="confirmed" />
                <button
                  onClick={() => setDeleteTarget(r)}
                  aria-label="Delete rule"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Price / hour (₹)</Label>
                <Input
                  type="number"
                  value={r.price}
                  onChange={(e) =>
                    setRules((rs) =>
                      rs.map((x) => (x.id === r.id ? { ...x, price: Number(e.target.value) } : x)),
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Note</Label>
                <Input
                  value={r.note}
                  onChange={(e) =>
                    setRules((rs) =>
                      rs.map((x) => (x.id === r.id ? { ...x, note: e.target.value } : x)),
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-border/60 bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Add a rule</p>
          <div className="mt-3 space-y-3">
            <Input
              placeholder="Label — e.g. Tournament Rate"
              value={newRule.label}
              onChange={(e) => setNewRule((s) => ({ ...s, label: e.target.value }))}
            />
            <Input
              placeholder="Window — e.g. Daily, 5 PM - 7 PM"
              value={newRule.window}
              onChange={(e) => setNewRule((s) => ({ ...s, window: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Price"
                value={newRule.price}
                onChange={(e) => setNewRule((s) => ({ ...s, price: Number(e.target.value) }))}
              />
              <Input
                placeholder="Note"
                value={newRule.note}
                onChange={(e) => setNewRule((s) => ({ ...s, note: e.target.value }))}
              />
            </div>
            <Button variant="outline" onClick={addRule} disabled={adding} className="w-full">
              <Plus className="mr-1 h-4 w-4" /> {adding ? "Adding…" : "Add rule"}
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this pricing rule?"
        description={
          deleteTarget
            ? `"${deleteTarget.label}" — bookings already made keep their locked-in price; this only affects future ones.`
            : ""
        }
        confirmLabel="Delete rule"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deletePricingRule(deleteTarget.id);
          toast.success("Rule deleted");
          onSaved();
        }}
      />
    </>
  );
}

// ---------- Gallery ----------
function GalleryManagement({
  images,
  onChanged,
}: {
  images: GalleryImage[];
  onChanged: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setUploading(true);
    try {
      const { url, path } = await uploadGalleryImage(file);
      await addGalleryImage(url, path, file.name, images.length);
      toast.success("Photo added");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
          <p className="text-sm text-muted-foreground">Photos shown on the public gallery page.</p>
        </div>
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelected}
            disabled={uploading}
          />
          <span
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
          </span>
        </label>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No photos yet — upload your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted"
            >
              <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
              <button
                onClick={() => setDeleteTarget(img)}
                aria-label="Delete photo"
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this photo?"
        description="This removes it from the public gallery and deletes the file permanently."
        confirmLabel="Delete photo"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteGalleryImageDoc(deleteTarget.id);
          if (deleteTarget.storagePath) {
            await deleteGalleryImage(deleteTarget.storagePath).catch(() => {});
          }
          toast.success("Photo deleted");
          onChanged();
        }}
      />
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
        <StatCard
          label="Daily Revenue"
          value={`₹${daily.toLocaleString()}`}
          icon={IndianRupee}
          tone="primary"
        />
        <StatCard
          label="Weekly Revenue"
          value={`₹${weekly.toLocaleString()}`}
          icon={TrendingUp}
          tone="secondary"
        />
        <StatCard
          label="Monthly Revenue"
          value={`₹${monthly.toLocaleString()}`}
          icon={BarChart3}
          tone="accent"
        />
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
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 258)" }}
                />
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
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 258)" }}
                />
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
function AdminSettings({
  info,
  onSaved,
}: {
  info: BusinessSettings | null;
  onSaved: (b: BusinessSettings) => void;
}) {
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
  useEffect(() => {
    if (info) setForm(info);
  }, [info]);

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
        <p className="text-sm text-muted-foreground">
          Business info, opening hours and booking policy.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Business info</h3>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Booking policy</h3>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label>Opening hours</Label>
              <Input
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Slot duration, buffer time, and cancellation window aren't wired to real enforcement
              yet — the bookable grid is driven by the time slot list below, and the cancellation
              window is currently fixed at 6 hours in code.
            </p>
          </div>
        </div>

        <TimeSlotManagement />

        <div className="lg:col-span-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </>
  );
}

// ---------- Time slots ----------
function TimeSlotManagement() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimeSlot | null>(null);

  function refresh() {
    setLoading(true);
    listTimeSlots()
      .then(setSlots)
      .finally(() => setLoading(false));
  }
  useEffect(refresh, []);

  async function addSlot() {
    const label = newLabel.trim();
    if (!/^\d{2}:\d{2} - \d{2}:\d{2}$/.test(label)) {
      toast.error('Use the format "HH:MM - HH:MM", e.g. 22:00 - 23:00');
      return;
    }
    setAdding(true);
    try {
      await createTimeSlot(label, slots.length);
      toast.success("Time slot added");
      setNewLabel("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add slot");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
      <h3 className="font-semibold">Time slots</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        The bookable grid on the public booking page is built from this list.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {slots.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium"
            >
              {s.label}
              <button
                type="button"
                onClick={() => setDeleteTarget(s)}
                aria-label={`Remove ${s.label}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {slots.length === 0 && (
            <p className="text-sm text-muted-foreground">No time slots yet.</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="22:00 - 23:00"
          className="w-48"
        />
        <Button type="button" variant="outline" onClick={addSlot} disabled={adding}>
          <Plus className="mr-1 h-4 w-4" /> {adding ? "Adding…" : "Add slot"}
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove this time slot?"
        description={
          deleteTarget
            ? `"${deleteTarget.label}" will no longer appear on the booking page. Existing bookings for it are unaffected.`
            : ""
        }
        confirmLabel="Remove slot"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteTimeSlot(deleteTarget.id);
          toast.success("Time slot removed");
          refresh();
        }}
      />
    </div>
  );
}
