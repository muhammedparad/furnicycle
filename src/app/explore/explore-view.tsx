"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NativeSelect } from "@/components/field";
import { ListingSheet, SheetSkeleton } from "@/components/listing-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, CONDITIONS, DISTRICTS, categoryLabel } from "@/lib/constants";
import type { Category, Condition, ListingFilters, SortKey } from "@/lib/types";
import { useListings } from "@/lib/use-listings";
import { cn } from "@/lib/utils";

const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export function ExploreView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);

  const filters: ListingFilters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      category: (params.get("category") as Category) ?? "",
      district: params.get("district") ?? "",
      condition: (params.get("condition") as Condition) ?? "",
      minPrice: num(params.get("min")),
      maxPrice: num(params.get("max")),
      free: params.get("free") === "1",
      sort: (params.get("sort") as SortKey) ?? "newest",
    }),
    [params],
  );

  // Keep the box in step when the URL changes from outside (back button, a link).
  const [q, setQ] = useState(filters.q ?? "");
  const [urlQ, setUrlQ] = useState(filters.q ?? "");
  if ((filters.q ?? "") !== urlQ) {
    setUrlQ(filters.q ?? "");
    setQ(filters.q ?? "");
  }

  const set = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  // Debounce typing into the search box.
  useEffect(() => {
    if (q === (filters.q ?? "")) return;
    const t = setTimeout(() => set({ q: q.trim() || undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const { listings, error } = useListings(filters);
  const active = [filters.category, filters.district, filters.condition, filters.minPrice, filters.maxPrice, filters.free].filter(
    (v) => v !== undefined && v !== "" && v !== false,
  ).length;

  const title = filters.free
    ? "Free to collect"
    : filters.category
      ? CATEGORIES.find((c) => c.value === filters.category)?.plural ?? categoryLabel(filters.category)
      : "Explore furniture";

  return (
    <main className="page pb-28 pt-10 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-head">
          {title}
          {filters.district ? ` in ${filters.district}` : ""}
        </h1>
        <p className="text-muted-foreground" aria-live="polite">
          {listings ? `${listings.length} ${listings.length === 1 ? "listing" : "listings"}` : "Searching…"}
        </p>
      </div>

      <form role="search" className="mt-8 flex gap-2" onSubmit={(e) => (e.preventDefault(), set({ q: q.trim() || undefined }))}>
        <Label htmlFor="q" className="sr-only">
          Search listings
        </Label>
        <Input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sofa, teak, Kakkanad…"
          className="h-12 rounded-full px-5 text-lead shadow-card"
        />
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-full md:hidden"
          aria-expanded={showFilters}
          aria-controls="filters"
          onClick={() => setShowFilters((s) => !s)}
        >
          Filters{active ? ` (${active})` : ""}
        </Button>
      </form>

      <div
        id="filters"
        className={cn("mt-4 grid-cols-2 gap-3 md:grid md:grid-cols-4 lg:grid-cols-7", showFilters ? "grid" : "hidden")}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="f-category" className="text-small text-muted-foreground">Category</Label>
          <NativeSelect id="f-category" value={filters.category} onChange={(e) => set({ category: e.target.value || undefined })}>
            <option value="">All furniture</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.plural}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="f-district" className="text-small text-muted-foreground">District</Label>
          <NativeSelect id="f-district" value={filters.district} onChange={(e) => set({ district: e.target.value || undefined })}>
            <option value="">All of Kerala</option>
            {DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="f-condition" className="text-small text-muted-foreground">Condition</Label>
          <NativeSelect id="f-condition" value={filters.condition} onChange={(e) => set({ condition: e.target.value || undefined })}>
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="f-min" className="text-small text-muted-foreground">Min price (₹)</Label>
          <Input
            id="f-min"
            inputMode="numeric"
            defaultValue={filters.minPrice ?? ""}
            key={`min-${filters.minPrice}`}
            onBlur={(e) => set({ min: e.target.value.replace(/\D/g, "") || undefined })}
            placeholder="0"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="f-max" className="text-small text-muted-foreground">Max price (₹)</Label>
          <Input
            id="f-max"
            inputMode="numeric"
            defaultValue={filters.maxPrice ?? ""}
            key={`max-${filters.maxPrice}`}
            onBlur={(e) => set({ max: e.target.value.replace(/\D/g, "") || undefined })}
            placeholder="Any"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="f-sort" className="text-small text-muted-foreground">Sort</Label>
          <NativeSelect id="f-sort" value={filters.sort} onChange={(e) => set({ sort: e.target.value === "newest" ? undefined : e.target.value })}>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </NativeSelect>
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-2.5 self-end">
          <input
            type="checkbox"
            className="size-5 accent-[var(--accent)]"
            checked={!!filters.free}
            onChange={(e) => set({ free: e.target.checked ? "1" : undefined })}
          />
          Free only
        </label>
      </div>

      {active > 0 && (
        <button
          type="button"
          className="link-quiet mt-4 text-accent"
          onClick={() => router.replace(filters.q ? `${pathname}?q=${encodeURIComponent(filters.q)}` : pathname, { scroll: false })}
        >
          Clear filters
        </button>
      )}

      <div className="mt-10">
        {error ? (
          <p className="text-destructive">Could not load listings: {error}</p>
        ) : !listings ? (
          <SheetSkeleton />
        ) : listings.length === 0 ? (
          <div className="paper px-6 py-14">
            <h2 className="text-lead">Nothing matches that yet.</h2>
            <p className="mt-2 text-muted-foreground">Try another district or widen the price range. New things are listed every day.</p>
            <Link href="/sell" className="link-quiet mt-5 inline-block text-accent">
              Or list something yourself
            </Link>
          </div>
        ) : (
          <ListingSheet listings={listings} />
        )}
      </div>
    </main>
  );
}
