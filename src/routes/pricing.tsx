import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePricing } from "@/hooks/usePricing";
import { EmptyState, ErrorState, SkeletonStatGrid } from "@/components/feedback";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Kickoff Arena" },
      { name: "description", content: "Transparent hourly pricing for weekday, weekend, peak, and night slots." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { rules: pricingRules, loading, error, refresh } = usePricing();
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">Pricing</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Simple, honest pricing</h1>
          <p className="mt-3 text-muted-foreground">Pay only for the hour you play. Cancel up to 6 hours before start.</p>
        </div>

        {loading && <div className="mt-12"><SkeletonStatGrid count={4} /></div>}
        {!loading && error && (
          <div className="mt-12"><ErrorState variant="network" onRetry={refresh} /></div>
        )}
        {!loading && !error && pricingRules.length === 0 && (
          <div className="mt-12">
            <EmptyState title="Pricing coming soon" description="We're finalising rates. Check back shortly." />
          </div>
        )}
        {!loading && !error && pricingRules.length > 0 && (
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pricingRules.map((p, i) => (
            <div key={p.id} className={`relative rounded-2xl border p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] ${i === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60"}`}>
              {i === 2 && <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Most booked</span>}
              <p className={`text-xs font-medium uppercase tracking-wider ${i === 2 ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.label}</p>
              <p className="mt-4 text-4xl font-bold tracking-tight">₹{p.price}<span className={`text-sm font-normal ${i === 2 ? "text-primary-foreground/70" : "text-muted-foreground"}`}> /hr</span></p>
              <p className={`mt-2 text-sm ${i === 2 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.window}</p>
              <ul className={`mt-6 space-y-2 text-sm ${i === 2 ? "text-primary-foreground/90" : "text-foreground"}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${i === 2 ? "text-accent" : "text-secondary"}`} /> Floodlights included</li>
                <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${i === 2 ? "text-accent" : "text-secondary"}`} /> Changing rooms</li>
                <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${i === 2 ? "text-accent" : "text-secondary"}`} /> Free water refills</li>
              </ul>
            </div>
          ))}
        </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/booking">Book a slot</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}