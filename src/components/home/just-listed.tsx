"use client";

import Link from "next/link";
import { ListingFrame } from "@/components/listing-frame";
import { formatPrice, timeAgo } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useListings } from "@/lib/use-listings";

function Rows({ title, items }: { title: string; items: Listing[] }) {
  if (!items.length) return null;
  return (
    <div className="paper p-3">
      <h3 className="px-2 pt-1 text-small text-ink-soft">{title}</h3>
      <ul className="mt-1">
        {items.map((l) => (
          <li key={l.id}>
            <Link href={`/listings/${l.id}`} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-[#fbefe0]">
              <span className="size-10 shrink-0 overflow-hidden rounded-lg">
                <ListingFrame listing={l} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold group-hover:text-brand">{l.title}</span>
                <span className="block text-small text-ink-soft">
                  {l.district} · {timeAgo(l.created_at)}
                </span>
              </span>
              <span className="shrink-0 font-bold tabular-nums">{formatPrice(l)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The newest free things, then the newest for sale. */
export function JustListed() {
  const { listings } = useListings({ limit: 40 });
  const free = (listings ?? []).filter((l) => l.is_free).slice(0, 5);
  const sale = (listings ?? []).filter((l) => !l.is_free).slice(0, 5);

  return (
    <section aria-labelledby="just-heading" className="page py-14 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="just-heading" className="text-head">
          Just listed
        </h2>
        <Link href="/explore" className="link-quiet font-semibold text-brand">
          See every listing
        </Link>
      </div>
      {listings === null ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="mt-6">Nothing listed yet. Be the first.</p>
      ) : (
        <div data-reveal className="mt-6 grid gap-4 md:grid-cols-2">
          <Rows title="For sale" items={sale} />
          <Rows title="Free to collect" items={free} />
        </div>
      )}
    </section>
  );
}
