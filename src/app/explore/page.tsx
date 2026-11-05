import type { Metadata } from "next";
import { Suspense } from "react";
import { SheetSkeleton } from "@/components/listing-sheet";
import { ExploreView } from "./explore-view";

export const metadata: Metadata = { title: "Explore furniture" };

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <main className="page py-10">
          <SheetSkeleton />
        </main>
      }
    >
      <ExploreView />
    </Suspense>
  );
}
