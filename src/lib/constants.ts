import type { Category, Condition } from "./types";

export const CATEGORIES: { value: Category; label: string; plural: string }[] = [
  { value: "sofa", label: "Sofa", plural: "Sofas" },
  { value: "bed", label: "Bed", plural: "Beds and cots" },
  { value: "dining", label: "Dining set", plural: "Dining sets" },
  { value: "table", label: "Table", plural: "Tables" },
  { value: "chair", label: "Chair", plural: "Chairs" },
  { value: "wardrobe", label: "Wardrobe", plural: "Wardrobes" },
  { value: "shelf", label: "Shelf", plural: "Shelves" },
  { value: "desk", label: "Desk", plural: "Desks" },
  { value: "cabinet", label: "Cabinet", plural: "Cabinets" },
  { value: "other", label: "Other", plural: "Everything else" },
];

export const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: "like-new", label: "Like new", hint: "No visible wear" },
  { value: "good", label: "Good", hint: "Light marks from normal use" },
  { value: "fair", label: "Fair", hint: "Visible wear, fully usable" },
  { value: "needs-repair", label: "Needs repair", hint: "Broken part or worn finish" },
];

/** Kerala's fourteen districts with a central coordinate for the map. */
export const DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
  { name: "Kollam", lat: 8.8932, lng: 76.6141 },
  { name: "Pathanamthitta", lat: 9.2648, lng: 76.787 },
  { name: "Alappuzha", lat: 9.4981, lng: 76.3388 },
  { name: "Kottayam", lat: 9.5916, lng: 76.5222 },
  { name: "Idukki", lat: 9.8494, lng: 76.971 },
  { name: "Ernakulam", lat: 9.9816, lng: 76.2999 },
  { name: "Thrissur", lat: 10.5276, lng: 76.2144 },
  { name: "Palakkad", lat: 10.7867, lng: 76.6548 },
  { name: "Malappuram", lat: 11.051, lng: 76.0711 },
  { name: "Kozhikode", lat: 11.2588, lng: 75.7804 },
  { name: "Wayanad", lat: 11.6854, lng: 76.132 },
  { name: "Kannur", lat: 11.8745, lng: 75.3704 },
  { name: "Kasaragod", lat: 12.4996, lng: 74.9869 },
];

export const MAX_IMAGES = 6;

export const categoryLabel = (c: string) =>
  CATEGORIES.find((x) => x.value === c)?.label ?? "Other";

export const conditionLabel = (c: string) =>
  CONDITIONS.find((x) => x.value === c)?.label ?? c;

export const districtCoords = (name: string) =>
  DISTRICTS.find((d) => d.name === name) ?? DISTRICTS[6];
