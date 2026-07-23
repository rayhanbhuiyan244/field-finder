import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  Bell,
  Settings,
  LogOut,
  Trophy,
  Clock,
  Repeat,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { listUserBookings, cancelBooking, type Booking } from "@/services/bookingService";
import {
  listUserNotifications,
  createNotification,
  type AppNotification,
} from "@/services/notificationService";
import { updateUserProfile, getOwnerUserId, type UserProfile } from "@/services/userService";
import { uploadProfilePhoto } from "@/services/storageService";
import { createReview, hasReviewForBooking } from "@/services/reviewService";
import { logout } from "@/services/authService";
import { slotStartDate } from "@/utils/format";
import { EmptyState, SkeletonDashboard, SkeletonTable } from "@/components/feedback";
import { notify } from "@/lib/toast";
import { CalendarX, BellOff, Star } from "lucide-react";

/** Matches the "Free cancellation up to 6 hours before start" copy on the booking page. */
const CANCELLATION_WINDOW_HOURS = 6;

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kickoff Arena" }] }),
  component: DashboardGuarded,
});

function DashboardGuarded() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

type Section = "dashboard" | "bookings" | "profile" | "notifications" | "settings";

const menu: { key: Section; label: string; icon: typeof Home }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "My Bookings", icon: CalendarDays },
  { key: "profile", label: "Profile", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

function Dashboard() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  async function loadBookings(uid: string) {
    const bookings = await listUserBookings(uid).catch(() => [] as Booking[]);
    setMyBookings(bookings);
    const completed = bookings.filter((b) => b.bookingStatus === "completed");
    const flags = await Promise.all(
      completed.map((b) => hasReviewForBooking(b.id).catch(() => false)),
    );
    setReviewedIds(new Set(completed.filter((_, i) => flags[i]).map((b) => b.id)));
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      loadBookings(user.uid),
      listUserNotifications(user.uid)
        .then(setNotifs)
        .catch(() => setNotifs([])),
    ]).finally(() => setLoading(false));
  }, [user]);

  async function onLogout() {
    await logout();
    notify.success("Signed out");
    navigate({ to: "/" });
  }

  async function onCancelBooking(id: string) {
    try {
      const booking = myBookings.find((b) => b.id === id);
      await cancelBooking(id);
      if (user) await loadBookings(user.uid);
      notify.success("Booking cancelled");
      if (booking) {
        const ownerId = await getOwnerUserId().catch(() => null);
        if (ownerId) {
          await createNotification({
            userId: ownerId,
            title: "Booking cancelled by customer",
            body: `${booking.customerName} cancelled ${booking.timeSlot} on ${booking.bookingDate}.`,
          }).catch(() => {});
        }
      }
    } catch (err) {
      notify.fromError(err, "Cancel failed");
    }
  }

  async function onSubmitReview(booking: Booking, rating: number, comment: string) {
    if (!user || !profile) return;
    await createReview(booking.id, {
      userId: user.uid,
      name: profile.fullName,
      initials: profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      rating,
      comment,
    });
    setReviewedIds((prev) => new Set(prev).add(booking.id));
    notify.success("Thanks for your review!");
  }

  const initials = (profile?.fullName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const upcoming = myBookings.find(
    (b) => b.bookingStatus === "confirmed" || b.bookingStatus === "pending",
  );

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground font-black">
            K
          </span>
          <span className="font-bold">Kickoff Arena</span>
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
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" /> Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="capitalize text-foreground font-medium">{section}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/booking">+ New Booking</Link>
            </Button>
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {initials}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 space-y-6">
          {loading && section === "dashboard" && <SkeletonDashboard />}
          {loading && section === "bookings" && <SkeletonTable rows={6} columns={6} />}
          {!loading && section === "dashboard" && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {profile?.fullName?.split(" ")[0] ?? "player"} 👋
                </h1>
                <p className="text-sm text-muted-foreground">Here's what's on your schedule.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Upcoming Match"
                  value={
                    upcoming ? `${upcoming.bookingDate} · ${upcoming.timeSlot.split(" ")[0]}` : "—"
                  }
                  icon={CalendarDays}
                  tone="accent"
                  trend={upcoming ? "Confirmed" : "No upcoming"}
                />
                <StatCard
                  label="Total Matches"
                  value={myBookings.filter((b) => b.bookingStatus === "completed").length}
                  icon={Trophy}
                  tone="primary"
                />
                <StatCard
                  label="Active Bookings"
                  value={
                    myBookings.filter(
                      (b) => b.bookingStatus !== "cancelled" && b.bookingStatus !== "completed",
                    ).length
                  }
                  icon={Clock}
                  tone="secondary"
                />
                <StatCard
                  label="Booking History"
                  value={myBookings.length}
                  icon={Repeat}
                  tone="warning"
                />
              </div>

              <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 p-5">
                  <h2 className="font-semibold">Recent bookings</h2>
                  <button
                    onClick={() => setSection("bookings")}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
                <BookingTable
                  rows={myBookings.slice(0, 5)}
                  onCancel={onCancelBooking}
                  onReview={onSubmitReview}
                  reviewedIds={reviewedIds}
                />
              </div>
            </>
          )}

          {!loading && section === "bookings" && (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <div>
                  <h2 className="font-semibold">My bookings</h2>
                  <p className="text-sm text-muted-foreground">
                    All your past and upcoming matches.
                  </p>
                </div>
              </div>
              <BookingTable
                rows={myBookings}
                onCancel={onCancelBooking}
                onReview={onSubmitReview}
                reviewedIds={reviewedIds}
              />
            </div>
          )}

          {section === "profile" && profile && (
            <ProfileForm me={profile} onSaved={refreshProfile} />
          )}

          {section === "notifications" &&
            (notifs.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description="Booking updates, reminders and offers will show up here."
              />
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-sm">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 border-b border-border/60 p-4 last:border-0"
                  >
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-full",
                        n.unread ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : ""}
                    </p>
                  </div>
                ))}
              </div>
            ))}

          {section === "settings" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

function BookingTable({
  rows,
  onCancel,
  onReview,
  reviewedIds,
}: {
  rows: Booking[];
  onCancel?: (id: string) => void;
  onReview?: (booking: Booking, rating: number, comment: string) => Promise<void>;
  reviewedIds?: Set<string>;
}) {
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  if (rows.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={CalendarX}
          title="No bookings yet"
          description="Reserve a slot to see it here."
          action={{ label: "Book a slot", href: "/booking" }}
        />
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-4">Booking ID</th>
            <th className="p-4">Date</th>
            <th className="p-4">Time</th>
            <th className="p-4">Price</th>
            <th className="p-4">Payment</th>
            <th className="p-4">Status</th>
            {(onCancel || onReview) && <th className="p-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => {
            const start = slotStartDate(b.bookingDate, b.timeSlot);
            const hoursUntil = start ? (start.getTime() - Date.now()) / (1000 * 60 * 60) : Infinity;
            const canCancel =
              (b.bookingStatus === "pending" || b.bookingStatus === "confirmed") &&
              hoursUntil >= CANCELLATION_WINDOW_HOURS;
            const withinWindow =
              (b.bookingStatus === "pending" || b.bookingStatus === "confirmed") &&
              hoursUntil < CANCELLATION_WINDOW_HOURS;
            const canReview = b.bookingStatus === "completed" && !reviewedIds?.has(b.id);
            return (
              <tr key={b.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="p-4 font-medium">{b.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4">{b.bookingDate}</td>
                <td className="p-4">{b.timeSlot}</td>
                <td className="p-4 font-medium">₹{b.price}</td>
                <td className="p-4">
                  <StatusBadge status={b.paymentStatus} />
                </td>
                <td className="p-4">
                  <StatusBadge status={b.bookingStatus} />
                </td>
                {(onCancel || onReview) && (
                  <td className="p-4 text-right">
                    {onCancel && canCancel && (
                      <button
                        onClick={() => setCancelTarget(b)}
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                    {onCancel && withinWindow && (
                      <span
                        className="text-xs text-muted-foreground"
                        title={`Cancellation window is ${CANCELLATION_WINDOW_HOURS}h before start`}
                      >
                        Too close to start
                      </span>
                    )}
                    {onReview && canReview && (
                      <button
                        onClick={() => setReviewTarget(b)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Leave a review
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {onCancel && (
        <CancelBookingDialog
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={(id) => {
            onCancel(id);
            setCancelTarget(null);
          }}
        />
      )}
      {onReview && (
        <ReviewDialog
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={async (rating, comment) => {
            if (!reviewTarget) return;
            await onReview(reviewTarget, rating, comment);
            setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
}

function CancelBookingDialog({
  booking,
  onClose,
  onConfirm,
}: {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold">Cancel this booking?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {booking.bookingDate} · {booking.timeSlot}. This can't be undone — if it was already paid,
          it'll be marked refunded.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Keep booking
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(booking.id)}>
            Cancel booking
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewDialog({
  booking,
  onClose,
  onSubmit,
}: {
  booking: Booking | null;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setRating(5);
      setComment("");
    }
  }, [booking]);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold">Leave a review</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.bookingDate} · {booking.timeSlot}
        </p>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star
                className={cn(
                  "h-6 w-6",
                  n <= rating ? "fill-accent text-accent" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was the turf?"
          rows={3}
          maxLength={500}
          className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-sm"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onSubmit(rating, comment.trim());
              } finally {
                setSubmitting(false);
              }
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ me, onSaved }: { me: UserProfile; onSaved: () => Promise<void> }) {
  const [fullName, setFullName] = useState(me.fullName);
  const [phone, setPhone] = useState(me.phone);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(me.uid, file);
      await updateUserProfile(me.uid, { photoURL: url });
      await onSaved();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(me.uid, { fullName, phone });
      await onSaved();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-6 shadow-sm text-center">
        {me.photoURL ? (
          <img src={me.photoURL} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </div>
        )}
        <p className="mt-4 font-semibold">{me.fullName}</p>
        <p className="text-sm text-muted-foreground">{me.email}</p>
        <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted">
          {uploading ? "Uploading…" : "Change photo"}
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
      </div>
      <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h3 className="font-semibold">Personal details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input defaultValue={me.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input defaultValue={me.role} disabled />
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function SettingsPanel() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h3 className="font-semibold">Preferences</h3>
      <div className="mt-6 space-y-5">
        {[
          { l: "Email notifications", d: "Booking confirmations and reminders." },
          { l: "SMS reminders", d: "Get a text 1 hour before your match." },
          { l: "Marketing offers", d: "Occasional discounts and events." },
          { l: "Dark mode", d: "Follow system theme." },
        ].map((s, i) => (
          <div
            key={s.l}
            className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0"
          >
            <div>
              <p className="text-sm font-medium">{s.l}</p>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </div>
            <Switch defaultChecked={i < 2} />
          </div>
        ))}
      </div>
    </div>
  );
}
