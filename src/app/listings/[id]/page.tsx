"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { ListingFrame } from "@/components/listing-frame";
import { ListingSheet } from "@/components/listing-sheet";
import { OsmMap } from "@/components/osm-map";
import { Button, buttonVariants } from "@/components/ui/button";
import { backend } from "@/lib/backend";
import { CATEGORIES, categoryLabel, conditionLabel, districtCoords } from "@/lib/constants";
import { formatPrice, telLink, timeAgo, whatsappLink } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useListings } from "@/lib/use-listings";
import { cn } from "@/lib/utils";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [photo, setPhoto] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    backend.getListing(id).then(setListing).catch(() => setListing(null));
  }, [id]);

  useEffect(() => {
    if (user) backend.getFavorites(user.id).then((f) => setSaved(f.includes(id)));
  }, [user, id]);

  const { listings: similar } = useListings(
    { category: listing?.category, limit: 6 },
    Boolean(listing),
  );

  useEffect(() => {
    if (listing) document.title = `${listing.title} · FurniCycle`;
  }, [listing]);

  if (listing === undefined) {
    return (
      <main className="page grid gap-8 py-10 md:grid-cols-12">
        <div className="aspect-[4/3] rounded-xl bg-paper/60 md:col-span-7" />
        <div className="space-y-4 md:col-span-5">
          <div className="h-12 w-3/4 rounded-lg bg-paper/60" />
          <div className="h-10 w-1/3 rounded-lg bg-paper/60" />
        </div>
      </main>
    );
  }

  if (listing === null) {
    return (
      <main className="page py-24">
        <h1 className="text-head">This listing is gone</h1>
        <p className="mt-4 text-muted-foreground">It may have been sold or removed by the seller.</p>
        <Link href="/explore" className={cn(buttonVariants(), "mt-8")}>
          Explore other furniture
        </Link>
      </main>
    );
  }

  const isOwner = user?.id === listing.user_id;
  const coords = listing.lat != null && listing.lng != null ? { lat: listing.lat, lng: listing.lng } : districtCoords(listing.district);
  const photos = listing.images.length ? listing.images : [""];
  const place = [listing.town, listing.district].filter(Boolean).join(", ");

  const toggleSave = async () => {
    if (!user) return router.push(`/login?next=/listings/${id}`);
    const now = await backend.toggleFavorite(user.id, id);
    setSaved(now);
    toast(now ? "Saved to your list" : "Removed from saved");
  };

  const share = async () => {
    const url = location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    }
  };

  const markSold = async () => {
    const next = listing.status === "sold" ? "available" : "sold";
    setListing(await backend.updateListing(id, { status: next }));
    toast(next === "sold" ? "Marked as sold" : "Back on the market");
  };

  return (
    <main className="pb-28">
      <div className="page pt-6">
        <Link href="/explore" className="link-quiet text-small text-muted-foreground">
          Back to all listings
        </Link>
      </div>

      <div className="page mt-4 grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper shadow-card">
            <ListingFrame listing={listing} index={photo} eager />
            {listing.status === "sold" && (
              <span className="absolute top-3 left-3 rounded-full bg-[#1f1a17] px-4 py-1.5 font-bold text-paper">Sold</span>
            )}
          </div>
          {photos.length > 1 && (
            <ul className="mt-2.5 flex gap-2.5 overflow-x-auto" aria-label="Photos">
              {photos.map((_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setPhoto(i)}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === photo}
                    className={cn("block h-20 w-24 overflow-hidden rounded-lg transition-opacity", i === photo ? "opacity-100" : "opacity-50 hover:opacity-80")}
                  >
                    <ListingFrame listing={listing} index={i} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="paper self-start p-6 md:col-span-5 md:p-7">
          <h1 className="text-head">{listing.title}</h1>
          <p className="mt-4 text-[3rem] font-extrabold leading-none tracking-tight tabular-nums">{formatPrice(listing)}</p>
          <dl className="mt-8 grid grid-cols-[8rem_1fr] gap-y-2 text-body">
            <dt className="text-ink-soft">Condition</dt>
            <dd>{conditionLabel(listing.condition)}</dd>
            <dt className="text-ink-soft">Type</dt>
            <dd>{categoryLabel(listing.category)}</dd>
            <dt className="text-ink-soft">Pickup from</dt>
            <dd>{place}</dd>
            <dt className="text-ink-soft">Listed</dt>
            <dd>{timeAgo(listing.created_at)}</dd>
            <dt className="text-ink-soft">Seller</dt>
            <dd>{listing.seller_name || "FurniCycle member"}</dd>
          </dl>

          {isOwner ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/listings/${id}/edit`} className={buttonVariants({ size: "lg" })}>
                Edit listing
              </Link>
              <Button variant="outline" size="lg" onClick={markSold}>
                {listing.status === "sold" ? "Mark as available" : "Mark as sold"}
              </Button>
            </div>
          ) : listing.status === "sold" ? (
            <p className="mt-8 rounded-xl bg-[#fbefe0] p-5">This piece has been sold. Similar listings are below.</p>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              {listing.whatsapp && (
                <a href={whatsappLink(listing)} target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" })}>
                  Message on WhatsApp
                </a>
              )}
              <a href={telLink(listing.contact_phone)} className={buttonVariants({ variant: "outline", size: "lg" })}>
                Call seller
              </a>
            </div>
          )}

          <div className="mt-4 flex gap-6">
            {!isOwner && (
              <button type="button" className="link-quiet font-semibold text-brand" onClick={toggleSave} aria-pressed={saved}>
                {saved ? "Saved" : "Save for later"}
              </button>
            )}
            <button type="button" className="link-quiet font-semibold text-brand" onClick={share}>
              Share
            </button>
          </div>

          <p className="mt-8 text-small text-ink-soft">
            FurniCycle does not take part in the sale. See the piece in person before you pay, and never send money in
            advance.
          </p>
        </div>
      </div>

      <section aria-labelledby="about-heading" className="page mt-24 grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="paper p-6 md:col-span-6">
          <h2 id="about-heading" className="text-lead font-medium">
            About this piece
          </h2>
          <p className="mt-4 whitespace-pre-line text-body">{listing.description || "The seller has not added a description."}</p>
        </div>
        <div className="paper p-6 md:col-span-6">
          <h2 className="text-lead font-medium">Where to collect</h2>
          <p className="mt-1 text-small text-ink-soft">Approximate area: {place}. The seller shares the exact address.</p>
          <OsmMap lat={coords.lat} lng={coords.lng} label={place} className="mt-4" />
        </div>
      </section>

      {similar && similar.filter((l) => l.id !== id).length > 0 && (
        <section aria-labelledby="similar-heading" className="page mt-28">
          <h2 id="similar-heading" className="text-lead font-medium">
            More {(CATEGORIES.find((c) => c.value === listing.category)?.plural ?? "like this").toLowerCase()}
          </h2>
          <div className="mt-6">
            <ListingSheet listings={similar.filter((l) => l.id !== id).slice(0, 5)} />
          </div>
        </section>
      )}
    </main>
  );
}
