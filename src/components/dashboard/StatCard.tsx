import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  tone?: "primary" | "secondary" | "accent" | "warning";
}

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  accent: "bg-accent/15 text-accent",
  warning: "bg-warning/20 text-warning-foreground",
};

export function StatCard({ label, value, icon: Icon, trend, tone = "primary" }: Props) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && <p className="mt-1 text-xs text-secondary font-medium">{trend}</p>}
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}