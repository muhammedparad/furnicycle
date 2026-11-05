"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useRequireAuth } from "@/components/auth-provider";
import { ListingForm } from "@/components/listing-form";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import type { Category, Condition } from "@/lib/types";

function SellForm() {
  const params = useSearchParams();
  const c = params.get("category");
  const k = params.get("condition");
  return (
    <ListingForm
      defaults={{
        category: CATEGORIES.some((x) => x.value === c) ? (c as Category) : undefined,
        condition: CONDITIONS.some((x) => x.value === k) ? (k as Condition) : undefined,
      }}
    />
  );
}

export default function SellPage() {
  const { user, loading } = useRequireAuth();
  return (
    <main className="page pb-28 pt-10 md:pt-14">
      <h1 className="text-head">Sell or give away</h1>
      <p className="mt-4 max-w-[52ch] text-muted-foreground">
        One listing per piece. Buyers contact you directly; FurniCycle never handles money or delivery.
      </p>
      <div className="mt-12">
        {loading || !user ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <Suspense>
            <SellForm />
          </Suspense>
        )}
      </div>
    </main>
  );
}
