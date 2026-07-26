import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  columns = 6,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
        className,
      )}
    >
      <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
            >
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={c} className={cn("h-4", c === 0 ? "w-24" : "w-full max-w-[80%]")} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCalendar({ days = 7, slots = 8 }: { days?: number; slots?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `120px repeat(${days}, minmax(0,1fr))` }}
        >
          <Skeleton className="h-3 w-16" />
          {Array.from({ length: days }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: slots }).map((_, r) => (
          <div key={r} className="px-4 py-3">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `120px repeat(${days}, minmax(0,1fr))` }}
            >
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: days }).map((_, c) => (
                <Skeleton key={c} className="h-9 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <SkeletonStatGrid />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 h-56 w-full" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}

export function SkeletonGallery({ count = 6 }: { count?: number }) {
  const heights = ["h-56", "h-72", "h-48", "h-64", "h-60", "h-52"];
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full rounded-2xl", heights[i % heights.length])} />
      ))}
    </div>
  );
}
