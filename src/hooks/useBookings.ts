import { useCallback, useEffect, useState } from "react";
import {
  listAllBookings,
  listUserBookings,
  listBookingsForDate,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  type Booking,
} from "@/services/bookingService";
import { useAuth } from "@/context/AuthContext";

type Scope = "mine" | "all" | { date: string };

// Reusable hook to load bookings for a scope and expose mutations.
export function useBookings(scope: Scope = "mine") {
  const { user } = useAuth();
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scopeKey = typeof scope === "string" ? scope : `date:${scope.date}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let rows: Booking[] = [];
      if (scope === "all") rows = await listAllBookings();
      else if (scope === "mine") rows = user ? await listUserBookings(user.uid) : [];
      else rows = await listBookingsForDate(scope.date);
      setData(rows);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load bookings"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey, user?.uid]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: load,
    createBooking,
    updateBookingStatus: async (...args: Parameters<typeof updateBookingStatus>) => {
      await updateBookingStatus(...args);
      await load();
    },
    cancelBooking: async (id: string) => {
      await cancelBooking(id);
      await load();
    },
  };
}

// Single-booking helper: exposes creation for the current user's flow.
export function useBooking() {
  const { user, profile } = useAuth();
  return {
    user,
    profile,
    createBooking,
    cancelBooking,
  };
}
