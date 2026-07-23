import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentStatus } from "@/services/bookingService";

const styles: Record<BookingStatus | PaymentStatus, string> = {
  confirmed: "bg-secondary/15 text-secondary border-secondary/30",
  completed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/20 text-warning-foreground border-warning/40",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  paid: "bg-secondary/15 text-secondary border-secondary/30",
  refunded: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: BookingStatus | PaymentStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", styles[status])}>
      {status}
    </Badge>
  );
}
