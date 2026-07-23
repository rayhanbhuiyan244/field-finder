import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getBusinessSettings, type BusinessSettings } from "@/services/gallerySettingsService";
import { notify } from "@/lib/toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, TextField, TextAreaField, PhoneField } from "@/components/forms";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});
type ContactValues = z.infer<typeof contactSchema>;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Kickoff Arena" },
      {
        name: "description",
        content: "Get in touch with Kickoff Arena for group bookings and events.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [business, setBusiness] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getBusinessSettings()
      .then(setBusiness)
      .catch(() => setBusiness(null));
  }, []);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  const onSubmit = form.handleSubmit(async () => {
    // Simulated submit — wire to Firebase / email service later.
    await new Promise((r) => setTimeout(r, 400));
    notify.success("Message sent", "We'll get back to you within an hour.");
    form.reset();
  });

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
            Contact
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Get in touch</h1>
          <p className="mt-3 text-muted-foreground">
            Have a question about group bookings, tournaments or memberships? We usually reply
            within an hour.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_420px]">
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-2xl border border-border/60 bg-card p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField<ContactValues>
                  name="name"
                  label="Name"
                  required
                  placeholder="Your name"
                  autoComplete="name"
                />
                <PhoneField<ContactValues> name="phone" label="Phone" required />
              </div>
              <div className="mt-4">
                <TextField<ContactValues>
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="you@mail.com"
                  autoComplete="email"
                />
              </div>
              <div className="mt-4">
                <TextAreaField<ContactValues>
                  name="message"
                  label="Message"
                  rows={5}
                  required
                  placeholder="Tell us about your booking or event…"
                />
              </div>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {form.formState.isSubmitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </Form>

          <div className="space-y-4">
            {[
              { icon: MapPin, title: "Visit us", body: business?.address ?? "—" },
              { icon: Phone, title: "Call", body: business?.phone ?? "—" },
              { icon: Mail, title: "Email", body: business?.email ?? "—" },
              { icon: Clock, title: "Opening hours", body: business?.hours ?? "—" },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/15 text-secondary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
