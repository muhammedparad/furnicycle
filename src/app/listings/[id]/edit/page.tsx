"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/components/auth-provider";
import { ListingForm } from "@/components/listing-form";
import { backend } from "@/lib/backend";
import type { Listing } from "@/lib/types";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useRequireAuth();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    backend.getListing(id).then(setListing).catch(() => setListing(null));
  }, [id]);

  const ready = !loading && user && listing !== undefined;
  const allowed = ready && listing && listing.user_id === user.id;

  return (
    <main className="page pb-28 pt-10 md:pt-14">
      <h1 className="text-head">Edit listing</h1>
      <div className="mt-12">
        {!ready ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !allowed ? (
          <p>
            You can only edit your own listings.{" "}
            <Link href="/dashboard" className="link-quiet text-accent">Go to your listings</Link>
          </p>
        ) : (
          <ListingForm existing={listing!} />
        )}
      </div>
    </main>
  );
}
