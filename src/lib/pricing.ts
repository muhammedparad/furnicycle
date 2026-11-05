import type { Category, Condition } from "./types";

/** Typical new-purchase price in Kerala, in rupees, used when the seller gives none. */
const NEW_PRICE: Record<Category, number> = {
  sofa: 28000,
  bed: 20000,
  dining: 24000,
  table: 7000,
  chair: 3500,
  wardrobe: 22000,
  shelf: 5000,
  desk: 8000,
  cabinet: 10000,
  other: 6000,
};

const CONDITION_FACTOR: Record<Condition, number> = {
  "like-new": 0.6,
  good: 0.45,
  fair: 0.3,
  "needs-repair": 0.15,
};

export interface PriceEstimate {
  low: number;
  high: number;
  suggested: number;
  basis: string;
}

const round100 = (n: number) => Math.max(0, Math.round(n / 100) * 100);

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Rule-of-thumb resale price: new price, scaled by condition and age,
 * then pulled halfway toward the median of comparable live listings.
 */
export function estimatePrice(opts: {
  category: Category;
  condition: Condition;
  ageYears?: number;
  originalPrice?: number;
  comparables?: number[];
}): PriceEstimate {
  const base = opts.originalPrice && opts.originalPrice > 0 ? opts.originalPrice : NEW_PRICE[opts.category];
  const age = Math.max(0, opts.ageYears ?? 3);
  const ageFactor = Math.max(0.4, 1 - 0.07 * age);
  let value = base * CONDITION_FACTOR[opts.condition] * ageFactor;
  const basis: string[] = [
    opts.originalPrice ? "your original price" : "a typical new price",
    "condition",
    `about ${age} year${age === 1 ? "" : "s"} of use`,
  ];

  const comps = (opts.comparables ?? []).filter((p) => p > 0);
  if (comps.length >= 3) {
    value = (value + median(comps)) / 2;
    basis.push(`${comps.length} similar listings`);
  }

  const suggested = round100(value);
  return {
    suggested,
    low: round100(value * 0.8),
    high: round100(value * 1.2),
    basis: `Based on ${basis.join(", ")}.`,
  };
}
