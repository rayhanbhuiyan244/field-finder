import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { subscribeToAuth } from "@/services/authService";
import { getUserProfile, type UserProfile } from "@/services/userService";
import { seedFirestoreOnce } from "@/services/seedService";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await getUserProfile(u.uid);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Seeding writes to config collections (timeslots, pricing, gallery,
    // settings) that Security Rules restrict to the owner. Firing this for
    // every anonymous visitor would require those collections to be
    // publicly writable, which we don't want — so only the owner's own
    // first login ever triggers it (no-op if data already exists).
    if (profile?.role === "owner") {
      seedFirestoreOnce();
    }
  }, [profile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getUserProfile(user.uid);
    setProfile(p);
  }, [user]);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile }),
    [user, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
