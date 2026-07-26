import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  Trophy,
  Users,
  Star,
  Lightbulb,
  Car,
  DoorOpen,
  ShowerHead,
  Coffee,
  Droplet,
  ShoppingBag,
  HeartPulse,
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { listReviews, averageRating, type Review } from "@/services/reviewService";
import { listPricingRules, type PricingRule } from "@/services/pricingService";
import { getBusinessSettings, type BusinessSettings } from "@/services/gallerySettingsService";

import hero from "@/assets/hero-turf.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const facilities = [
  { icon: Lightbulb, title: "Floodlights", body: "Match-grade LED lighting for late night play." },
  { icon: Car, title: "Parking", body: "Dedicated parking for 40+ vehicles." },
  { icon: DoorOpen, title: "Changing Room", body: "Spacious rooms with lockers and benches." },
  { icon: ShowerHead, title: "Washroom", body: "Clean, maintained washrooms and showers." },
  { icon: Coffee, title: "Cafeteria", body: "Snacks, energy drinks and post-match meals." },
  { icon: Droplet, title: "Drinking Water", body: "Chilled RO water on the sidelines." },
  {
    icon: ShoppingBag,
    title: "Equipment Rental",
    body: "Bibs, balls, cones and goalkeeper gloves.",
  },
  { icon: HeartPulse, title: "First Aid", body: "Trained staff and first-aid kit on site." },
];

function Landing() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [business, setBusiness] = useState<BusinessSettings>({
    name: "Kickoff Arena",
    tagline: "Premium 5-a-side football turf",
    address: "Station Road, Kandirpar, Cumilla 3500",
    phone: "+880 1712 345678",
    email: "hello@kickoffarena.com",
    hours: "6:00 AM - 12:00 AM, all days",
  });

  useEffect(() => {
    listReviews()
      .then(setReviews)
      .catch(() => setReviews([]));
    listPricingRules()
      .then(setPricingRules)
      .catch(() => setPricingRules([]));
    getBusinessSettings()
      .then((b) => {
        if (b) setBusiness(b);
      })
      .catch(() => {});
  }, []);

  const stats = {
    availableToday: 8,
    matchesPlayed: 12480,
    happyPlayers: 4200,
    averageRating: averageRating(reviews) || 4.8,
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={hero}
          alt="Football turf under floodlights at dusk"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/40" />
        <div className="relative mx-auto flex min-h-[86vh] w-full max-w-7xl flex-col justify-center px-6 py-24 text-primary-foreground">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            {stats.availableToday} slots open today
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Book Your Match.
            <br />
            <span className="text-accent">Anytime.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
            Premium 5-a-side turf, floodlights on till midnight, and instant online booking. Pick
            your slot, invite the squad, and hit the pitch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg h-12 px-6 text-base"
            >
              <Link to="/booking">
                Book Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/availability">View Availability</Link>
            </Button>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: "Open", v: "6 AM - 12 AM" },
              { l: "Format", v: "5-a-side" },
              { l: "Surface", v: "FIFA-grade" },
              { l: "Rating", v: `${stats.averageRating} ★` },
            ].map((x) => (
              <div
                key={x.l}
                className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur"
              >
                <p className="text-xs text-white/60">{x.l}</p>
                <p className="mt-1 text-sm font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-16 w-full max-w-7xl px-6 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Available Slots Today"
            value={stats.availableToday}
            icon={Calendar}
            tone="accent"
            trend="Updated live"
          />
          <StatCard
            label="Matches Played"
            value={stats.matchesPlayed.toLocaleString()}
            icon={Trophy}
            tone="primary"
          />
          <StatCard
            label="Happy Players"
            value={`${(stats.happyPlayers / 1000).toFixed(1)}K+`}
            icon={Users}
            tone="secondary"
          />
          <StatCard
            label="Average Rating"
            value={`${stats.averageRating} / 5`}
            icon={Star}
            tone="warning"
            trend="Based on 620 reviews"
          />
        </div>
      </section>

      {/* Facilities */}
      <section className="mx-auto w-full max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Facilities"
          title="Everything you need on match day"
          subtitle="A modern arena built for players — not just fields with fences."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgba(15,23,42,0.2)] transition-all"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/15 text-secondary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mx-auto w-full max-w-7xl px-6 pb-24">
        <SectionHeader eyebrow="Gallery" title="A look inside the arena" />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          <img
            src={g1}
            alt="Match under floodlights"
            loading="lazy"
            className="col-span-2 row-span-2 h-full w-full rounded-2xl object-cover aspect-square"
          />
          <img
            src={g2}
            alt="Football on turf"
            loading="lazy"
            className="h-full w-full rounded-2xl object-cover aspect-square"
          />
          <img
            src={g3}
            alt="Aerial view"
            loading="lazy"
            className="h-full w-full rounded-2xl object-cover aspect-square"
          />
          <img
            src={g4}
            alt="Players celebrating"
            loading="lazy"
            className="h-full w-full rounded-2xl object-cover aspect-square"
          />
          <img
            src={g5}
            alt="Changing room"
            loading="lazy"
            className="h-full w-full rounded-2xl object-cover aspect-square"
          />
          <img
            src={g6}
            alt="Goal net"
            loading="lazy"
            className="col-span-2 h-full w-full rounded-2xl object-cover aspect-square md:aspect-auto"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/40 border-y border-border/60 py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <SectionHeader
            eyebrow="Pricing"
            title="Transparent hourly pricing"
            subtitle="No hidden fees. Pay only for the time you play."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pricingRules.map((p, i) => (
              <div
                key={p.id}
                className={`relative rounded-2xl border p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] ${i === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60"}`}
              >
                {i === 2 && (
                  <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Most booked
                  </span>
                )}
                <p
                  className={`text-xs font-medium uppercase tracking-wider ${i === 2 ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {p.label}
                </p>
                <p className="mt-4 text-4xl font-bold tracking-tight">
                  ৳{p.price}
                  <span
                    className={`text-sm font-normal ${i === 2 ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {" "}
                    /hr
                  </span>
                </p>
                <p
                  className={`mt-2 text-sm ${i === 2 ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {p.window}
                </p>
                <div
                  className={`mt-6 flex items-center gap-2 text-sm ${i === 2 ? "text-accent" : "text-secondary"}`}
                >
                  <CheckCircle2 className="h-4 w-4" /> {p.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto w-full max-w-7xl px-6 py-24">
        <SectionHeader eyebrow="Reviews" title="Loved by local players" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary font-semibold">
                  {r.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.dateLabel ?? ""}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5 text-warning-foreground">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section id="contact" className="mx-auto w-full max-w-7xl px-6 pb-24">
        <SectionHeader eyebrow="Location" title="Come play at the arena" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-secondary/30 via-primary/10 to-accent/20">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, oklch(0.4 0.1 258 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.4 0.1 258 / 0.15) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-full bg-accent p-4 shadow-lg animate-pulse">
                  <MapPin className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 rounded-xl bg-card px-4 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">Kickoff Arena</p>
                <p className="text-sm font-semibold">Kandirpar, Cumilla</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Get in touch</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{business.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{business.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{business.hours}</span>
              </li>
            </ul>
            <Button
              asChild
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/booking">Book a slot</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
