import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { toast } from "sonner";
import { register } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/userService";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Kickoff Arena" }] }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const { refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({ fullName, email, phone, password, role });
      // The auth listener may have fired with a null profile because
      // createUserProfile races Firestore's setDoc — refresh once here so
      // ProtectedRoute sees the correct role before we navigate.
      await refreshProfile();
      toast.success("Account created");
      nav({ to: role === "owner" ? "/admin" : "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto grid min-h-[70vh] w-full max-w-md place-items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-border/60 bg-card p-8 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.15)]">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Book slots, review, and manage your matches.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Rakib Hasan" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1..." />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["customer", "owner"] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      role === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-sm text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary">Sign in</Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}