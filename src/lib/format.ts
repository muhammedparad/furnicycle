import type { Listing } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (l: Pick<Listing, "price" | "is_free">) =>
  l.is_free ? "Free" : inr.format(l.price);

export const formatRupees = (n: number) => inr.format(n);

/** Indian mobile numbers → digits with the 91 country code, as wa.me wants them. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export const isValidPhone = (raw: string) => {
  const d = normalizePhone(raw);
  return d.length >= 11 && d.length <= 13;
};

export function whatsappLink(l: Pick<Listing, "contact_phone" | "title" | "price" | "is_free">) {
  const text = `Hi, I saw your "${l.title}" (${formatPrice(l)}) on FurniCycle. Is it still available?`;
  return `https://wa.me/${normalizePhone(l.contact_phone)}?text=${encodeURIComponent(text)}`;
}

export const telLink = (phone: string) => `tel:+${normalizePhone(phone)}`;

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [size, unit] of steps) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
