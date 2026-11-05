import { FurnitureArt, seedOf } from "@/components/furniture-art";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The listing's first photo, or a drawing of its category when there is none. */
export function ListingFrame({
  listing,
  index = 0,
  className,
  eager,
}: {
  listing: Pick<Listing, "id" | "title" | "category" | "images">;
  index?: number;
  className?: string;
  eager?: boolean;
}) {
  const src = listing.images[index];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user uploads come from any storage host
      <img
        src={src}
        alt={listing.title}
        loading={eager ? "eager" : "lazy"}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return <FurnitureArt category={listing.category} seed={seedOf(listing.id)} label={listing.title} className={cn("h-full w-full", className)} />;
}
