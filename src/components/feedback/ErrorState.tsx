import * as React from "react";
import { AlertTriangle, WifiOff, ShieldOff, SearchX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorVariant = "generic" | "network" | "unauthorized" | "not-found";

const VARIANTS: Record<
  ErrorVariant,
  { icon: React.ComponentType<{ className?: string }>; title: string; description: string }
> = {
  generic: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "We couldn't complete that action. Please try again in a moment.",
  },
  network: {
    icon: WifiOff,
    title: "Network error",
    description: "Check your connection and try again.",
  },
  unauthorized: {
    icon: ShieldOff,
    title: "You don't have access",
    description: "Sign in with the right account to view this page.",
  },
  "not-found": {
    icon: SearchX,
    title: "Not found",
    description: "The item you're looking for doesn't exist or was removed.",
  },
};

export interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  variant = "generic",
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon className="h-6 w-6" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold">{title ?? v.title}</h3>
        <p className="text-sm text-muted-foreground">{description ?? v.description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> {retryLabel}
        </Button>
      )}
    </div>
  );
}
