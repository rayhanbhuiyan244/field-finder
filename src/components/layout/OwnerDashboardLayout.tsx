import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicLayout } from "./PublicLayout";
import { ROLES } from "@/constants";

// Wrapper for owner-only admin pages.
export function OwnerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role={ROLES.OWNER}>
      <PublicLayout>{children}</PublicLayout>
    </ProtectedRoute>
  );
}