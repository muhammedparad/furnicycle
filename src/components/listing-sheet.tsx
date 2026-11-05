import Link from "next/link";
import { Pin } from "@/components/icons";
import { ListingFrame } from "@/components/listing-frame";
import { conditionLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

/** Listings as cream paper cards. */
export function ListingSheet({ listings }: { listings: Listing[] }) {
  return (
    <ul className={GRID}>
      {listings.map((l) => (
        <li key={l.id} className="rise">
          <Link
            href={`/listings/${l.id}`}
            className="paper group block h-full p-2.5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <ListingFrame listing={l} className="transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
              {l.is_free && l.status !== "sold" && (
                <span className="absolute top-2 left-2 rounded-full bg-marigold px-2.5 py-0.5 text-small font-bold text-[#3b1f12]">
                  Free
                </span>
              )}
              {l.status === "sold" && (
                <span className="absolute inset-0 flex items-center justify-center bg-[#1f1a17]/55 text-lead font-bold text-paper">
                  Sold
                </span>
              )}
            </div>
            <div className="px-1 pb-1">
              <p className="mt-2.5 text-[1.375rem] font-extrabold leading-none tracking-tight tabular-nums">{formatPrice(l)}</p>
              <p className="mt-1.5 truncate text-body group-hover:text-brand">{l.title}</p>
              <p className="mt-1.5 flex items-center gap-1.5 truncate text-small text-ink-soft">
                <Pin />
                {l.town || l.district} · {conditionLabel(l.condition)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SheetSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={GRID} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="paper p-2.5 opacity-60">
          <div className="aspect-[4/3] rounded-lg bg-[#f4ece2]" />
          <div className="mt-3 h-6 w-1/3 rounded bg-[#f4ece2]" />
          <div className="mt-2 h-4 w-3/4 rounded bg-[#f4ece2]" />
        </li>
      ))}
    </ul>
  );
}
