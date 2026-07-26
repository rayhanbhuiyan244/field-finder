import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicLayout } from "./PublicLayout";
import { ROLES } from "@/constants";

// Wrapper for customer-only dashboard pages. Keeps auth + shell
// concerns out of individual route files.
export function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role={ROLES.CUSTOMER}>
      <PublicLayout>{children}</PublicLayout>
    </ProtectedRoute>
  );
}