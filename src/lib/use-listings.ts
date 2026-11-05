"use client";

import { useCallback, useEffect, useState } from "react";
import { backend } from "./backend";
import type { Listing, ListingFilters } from "./types";

export function useListings(filters: ListingFilters, enabled = true) {
  const key = JSON.stringify(filters);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    backend
      .listListings(JSON.parse(key))
      .then((l) => active && (setListings(l), setError(null)))
      .catch((e: Error) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [key, enabled, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { listings, error, loading: listings === null && !error, reload };
}
