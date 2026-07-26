import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { business } from "@/lib/mock";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground font-black">
              K
            </span>
            <span className="text-lg font-bold">Kickoff Arena</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">
            {business.tagline}. Book your match. Anytime.
          </p>
          <div className="mt-4 flex gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="social"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/booking", label: "Book a slot" },
              { to: "/availability", label: "Availability" },
              { to: "/pricing", label: "Pricing" },
              { to: "/gallery", label: "Gallery" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-primary-foreground/80 hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {business.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {business.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {business.email}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
            Opening Hours
          </h4>
          <p className="mt-4 text-sm text-primary-foreground/80">{business.hours}</p>
          <div className="mt-4 rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-primary-foreground/60">
              Owner Portal
            </p>
            <Link to="/admin" className="mt-1 inline-block text-sm font-semibold text-accent">
              Manage bookings →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Kickoff Arena. All rights reserved.</p>
          <p>Prototype UI · No real bookings will be processed.</p>
        </div>
      </div>
    </footer>
  );
}
