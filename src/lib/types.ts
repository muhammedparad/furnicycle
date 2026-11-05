export type Category =
  | "sofa"
  | "bed"
  | "table"
  | "chair"
  | "wardrobe"
  | "shelf"
  | "desk"
  | "dining"
  | "cabinet"
  | "other";

export type Condition = "like-new" | "good" | "fair" | "needs-repair";

export type ListingStatus = "available" | "sold";

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  price: number;
  is_free: boolean;
  district: string;
  town: string;
  lat: number | null;
  lng: number | null;
  images: string[];
  status: ListingStatus;
  seller_name: string;
  contact_phone: string;
  whatsapp: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export type ListingInput = Omit<
  Listing,
  "id" | "created_at" | "updated_at" | "featured" | "status"
>;

export type ListingPatch = Partial<Omit<Listing, "id" | "user_id" | "created_at">>;

export interface Profile {
  id: string;
  name: string;
  phone: string;
  whatsapp: boolean;
  district: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
}

export type SortKey = "newest" | "price-asc" | "price-desc";

export interface ListingFilters {
  q?: string;
  category?: Category | "";
  district?: string;
  condition?: Condition | "";
  minPrice?: number;
  maxPrice?: number;
  free?: boolean;
  sort?: SortKey;
  userId?: string;
  ids?: string[];
  includeSold?: boolean;
  limit?: number;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface SignUpResult {
  user: AppUser | null;
  needsConfirmation: boolean;
}

export interface Backend {
  mode: "local" | "supabase";
  getUser(): Promise<AppUser | null>;
  onAuthChange(cb: (user: AppUser | null) => void): () => void;
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<AppUser>;
  signOut(): Promise<void>;
  getProfile(id: string): Promise<Profile | null>;
  updateProfile(id: string, patch: Partial<Omit<Profile, "id" | "created_at">>): Promise<Profile>;
  listListings(filters?: ListingFilters): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | null>;
  createListing(input: ListingInput): Promise<Listing>;
  updateListing(id: string, patch: ListingPatch): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  uploadImage(file: Blob, userId: string): Promise<string>;
  getFavorites(userId: string): Promise<string[]>;
  toggleFavorite(userId: string, listingId: string): Promise<boolean>;
}
