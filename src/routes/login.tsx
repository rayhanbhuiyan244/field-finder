import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { toast } from "sonner";
import { useState } from "react";
import { login } from "@/services/authService";
import { getUserProfile } from "@/services/userService";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — Kickoff Arena" }],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const profile = await getUserProfile(user.uid);
      toast.success("Signed in");
      nav({ to: profile?.role === "owner" ? "/admin" : "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto grid min-h-[70vh] w-full max-w-md place-items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-border/60 bg-card p-8 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.15)]">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your bookings.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                placeholder="you@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
            <Link to="/register" className="font-medium text-primary">Create account</Link>
          </div>
          <p className="mt-6 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            Powered by Firebase Authentication.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}