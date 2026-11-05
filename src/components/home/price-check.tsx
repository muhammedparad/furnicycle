"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NativeSelect } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import { formatRupees } from "@/lib/format";
import { estimatePrice } from "@/lib/pricing";
import type { Category, Condition } from "@/lib/types";
import { useListings } from "@/lib/use-listings";
import { cn } from "@/lib/utils";

/** The page's one live thing: what would my piece fetch? */
export function PriceCheck() {
  const [category, setCategory] = useState<Category>("sofa");
  const [condition, setCondition] = useState<Condition>("good");
  const [age, setAge] = useState(4);
  const { listings } = useListings({ category });

  const comparables = useMemo(() => (listings ?? []).filter((l) => !l.is_free).map((l) => l.price), [listings]);
  const est = estimatePrice({ category, condition, ageYears: age, comparables });

  return (
    <section aria-labelledby="price-heading" className="page py-14 md:py-20">
      <h2 id="price-heading" className="text-head">
        What would yours fetch?
      </h2>
      <div data-reveal className="paper mt-6 grid gap-8 p-6 md:grid-cols-2 md:p-8">
        <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          <p className="text-body text-ink-soft">
            Pick what you have and how worn it is. The sell form starts from this estimate before the AI looks at your
            photo.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-small font-semibold">
              Furniture
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </NativeSelect>
            </label>
            <label className="grid gap-1.5 text-small font-semibold">
              Condition
              <NativeSelect value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </NativeSelect>
            </label>
          </div>
          <label className="grid gap-1.5 text-small font-semibold">
            <span className="flex justify-between">
              Years used <span className="font-normal text-ink-soft">{age === 1 ? "1 year" : `${age} years`}</span>
            </span>
            <input
              type="range"
              min={0}
              max={15}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="h-8 w-full accent-[var(--stamp)]"
              aria-valuetext={`${age} years`}
            />
          </label>
        </form>
        <div className="flex flex-col justify-end rounded-xl border-2 border-ink/80 p-5" aria-live="polite">
          <p className="text-small text-ink-soft">Fair price</p>
          <p className="text-[clamp(3rem,2rem+4vw,4.5rem)] font-extrabold leading-none tracking-tight tabular-nums">
            {formatRupees(est.suggested)}
          </p>
          <p className="mt-3 text-body">
            Usually {formatRupees(est.low)} to {formatRupees(est.high)}
          </p>
          <p className="mt-1 text-small text-ink-soft">{est.basis}</p>
          <Link
            href={`/sell?category=${category}&condition=${condition}`}
            className={cn(buttonVariants({ variant: "secondary" }), "mt-5 self-start")}
          >
            List it at this price
          </Link>
        </div>
      </div>
    </section>
  );
}
