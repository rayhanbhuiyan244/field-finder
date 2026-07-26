import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/userService";

interface Props {
  children: ReactNode;
  role?: UserRole; // optional role gate
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (role && profile?.role !== role) {
      navigate({ to: "/dashboard" });
    }
  }, [user, profile, loading, role, navigate]);

  if (loading || !user || (role && profile?.role !== role)) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
