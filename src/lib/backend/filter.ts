import type { Listing, ListingFilters } from "../types";

/** Client-side version of the query the Supabase backend runs in SQL. */
export function applyFilters(all: Listing[], f: ListingFilters = {}): Listing[] {
  const q = f.q?.trim().toLowerCase();
  let out = all.filter((l) => {
    if (!f.includeSold && l.status !== "available") return false;
    if (f.userId && l.user_id !== f.userId) return false;
    if (f.ids && !f.ids.includes(l.id)) return false;
    if (f.category && l.category !== f.category) return false;
    if (f.district && l.district !== f.district) return false;
    if (f.condition && l.condition !== f.condition) return false;
    if (f.free && !l.is_free) return false;
    if (f.minPrice != null && (l.is_free ? 0 : l.price) < f.minPrice) return false;
    if (f.maxPrice != null && (l.is_free ? 0 : l.price) > f.maxPrice) return false;
    if (q && !`${l.title} ${l.description} ${l.town}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const price = (l: Listing) => (l.is_free ? 0 : l.price);
  const newest = (a: Listing, b: Listing) => b.created_at.localeCompare(a.created_at);
  if (f.sort === "price-asc") out.sort((a, b) => price(a) - price(b) || newest(a, b));
  else if (f.sort === "price-desc") out.sort((a, b) => price(b) - price(a) || newest(a, b));
  else out.sort((a, b) => Number(b.featured) - Number(a.featured) || newest(a, b));

  if (f.limit) out = out.slice(0, f.limit);
  return out;
}
