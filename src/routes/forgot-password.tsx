import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { toast } from "sonner";
import { resetPassword } from "@/services/authService";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Kickoff Arena" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(email);
      toast.success("Password reset email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto grid min-h-[70vh] w-full max-w-md place-items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-border/60 bg-card p-8 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.15)]">
          <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll send a reset link to your email.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mail.com"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
          <div className="mt-6 text-sm text-center">
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
