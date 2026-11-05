"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/explore?free=1", label: "Free" },
  { href: "/sell", label: "Sell" },
];

export function SiteHeader() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const account = loading ? null : user ? { href: "/dashboard", label: "My account" } : { href: "/login", label: "Sign in" };
  const pill = cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 font-semibold");

  return (
    <header className="relative z-20">
      <div className="page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="text-lead font-extrabold tracking-tight text-brand">
          FurniCycle
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="link-quiet font-medium">
              {l.label}
            </Link>
          ))}
          {account && (
            <Link href={account.href} className={pill}>
              {account.label}
            </Link>
          )}
        </nav>
        <button
          type="button"
          className={cn(pill, "md:hidden")}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="page pb-4 md:hidden" onClick={() => setOpen(false)}>
          <div className="paper flex flex-col p-2">
            {[...LINKS, ...(account ? [account] : [])].map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-3 text-lead font-medium hover:bg-[#fbefe0]">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
