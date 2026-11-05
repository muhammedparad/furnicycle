"use client";

import Link from "next/link";
import { Pin } from "@/components/icons";
import { ListingFrame } from "@/components/listing-frame";
import { buttonVariants } from "@/components/ui/button";
import { categoryLabel, conditionLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useListings } from "@/lib/use-listings";
import { cn } from "@/lib/utils";

/** A listing as a cream paper card, the way the hero shows it. */
function TagCard({ listing, className }: { listing: Listing; className?: string }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn("paper block w-[250px] p-4 shadow-lift sm:w-[290px]", className)}
    >
      <div className="flex items-center justify-between text-small font-semibold text-ink">
        <span>{categoryLabel(listing.category)}</span>
        <span className="text-ink-soft">{conditionLabel(listing.condition)}</span>
      </div>
      <div className="mt-3 aspect-[4/3] overflow-hidden rounded-lg">
        <ListingFrame listing={listing} eager />
      </div>
      <div className="mt-3 rounded-lg border-2 border-ink/80 px-3 py-2">
        <p className="text-small text-ink-soft">{listing.is_free ? "Free to collect" : "Asking price"}</p>
        <p className="text-[2.25rem] font-extrabold leading-none tracking-tight tabular-nums">{formatPrice(listing)}</p>
      </div>
      <p className="mt-3 line-clamp-2 text-body text-ink">{listing.title}</p>
      <p className="mt-3 flex items-center gap-1.5 text-small font-semibold">
        <Pin />
        {listing.town || listing.district}
      </p>
    </Link>
  );
}

export function HeroStrip() {
  const { listings } = useListings({ limit: 12 });
  const free = listings?.find((l) => l.is_free);
  const paid = listings?.find((l) => !l.is_free);

  return (
    <section
      aria-labelledby="hero-heading"
      className="page grid items-center gap-12 pb-16 pt-8 md:min-h-[calc(100svh-4rem)] md:grid-cols-2 md:pb-20 md:pt-4"
    >
      <div>
        <h1 id="hero-heading" className="text-display">
          Move out.
          <br />
          Pass it on.
        </h1>
        <p className="mt-6 max-w-[40ch] text-lead text-muted-foreground">
          People across Kerala list the furniture they no longer need, for a price or for free. Find a piece nearby and
          talk to the owner straight on WhatsApp. FurniCycle never takes a cut.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/explore" className={buttonVariants({ size: "lg" })}>
            <SearchIcon />
            Find furniture
          </Link>
          <Link href="/sell" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            <UploadIcon />
            Sell or give away
          </Link>
        </div>
      </div>

      <div className="relative mx-auto h-[470px] w-full max-w-[500px] sm:h-[520px]" aria-label="Newest listings">
        {free && <TagCard listing={free} className="tilt-left absolute top-8 left-0" />}
        {paid && <TagCard listing={paid} className="tilt-right absolute top-0 right-0" />}
        {!listings && <div className="paper absolute inset-x-10 top-6 h-[440px] opacity-60" />}
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="6" />
      <path d="m13 13 5 5" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M10 13V3m0 0L6 7m4-4 4 4M3 13v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
