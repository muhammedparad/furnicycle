"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { FieldHint } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backend, hasSupabase } from "@/lib/backend";
import { isValidPhone } from "@/lib/format";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/dashboard";
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "register") {
      if (name.trim().length < 2) return setError("Enter your name.");
      if (!isValidPhone(phone)) return setError("Enter a 10-digit mobile number.");
      if (password.length < 8) return setError("Use at least 8 characters for the password.");
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await backend.signIn(email, password);
        router.replace(next);
      } else {
        const res = await backend.signUp({ email, password, name: name.trim(), phone: phone.trim() });
        if (res.needsConfirmation) setNotice(`We sent a confirmation link to ${email}. Open it, then log in.`);
        else router.replace(next);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const other = mode === "login" ? "/register" : "/login";
  const otherHref = params.get("next") ? `${other}?next=${encodeURIComponent(next)}` : other;

  if (notice) {
    return (
      <div className="paper p-6">
        <p className="text-lead">Check your email</p>
        <p className="mt-2">{notice}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      {mode === "register" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98470 12345"
              aria-describedby="phone-hint"
              required
            />
            <FieldHint id="phone-hint">Used as the contact number on your listings. You can change it per listing.</FieldHint>
          </div>
        </>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={mode === "register" ? "password-hint" : undefined}
          required
        />
        {mode === "register" && <FieldHint id="password-hint">At least 8 characters.</FieldHint>}
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
      </Button>
      <p className="text-muted-foreground">
        {mode === "login" ? "New to FurniCycle? " : "Already have an account? "}
        <Link href={otherHref} className="link-quiet text-accent">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
      {!hasSupabase && (
        <p className="text-small text-muted-foreground">
          Demo mode: accounts and listings are stored only in this browser until Supabase is connected.
        </p>
      )}
    </form>
  );
}
