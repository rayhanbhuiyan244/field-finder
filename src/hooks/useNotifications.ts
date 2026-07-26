import { useCallback, useEffect, useState } from "react";
import {
  listUserNotifications,
  createNotification,
  markRead,
  type AppNotification,
} from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [data, setData] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await listUserNotifications(user.uid));
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    unreadCount: data.filter((n) => n.unread).length,
    refresh: load,
    createNotification,
    markAsRead: async (id: string) => {
      await markRead(id);
      await load();
    },
  };
}