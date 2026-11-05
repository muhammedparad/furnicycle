import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AppUser, Backend, Listing, Profile } from "../types";

const BUCKET = "listing-images";

let client: SupabaseClient | null = null;
const sb = () =>
  (client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

const toUser = (u: User | null | undefined): AppUser | null => (u ? { id: u.id, email: u.email ?? "" } : null);

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** PostgREST `or` filters break on commas and parentheses, so strip them from free text. */
const safeTerm = (q: string) => q.replace(/[,()%*\\]/g, " ").trim();

export const supabaseBackend: Backend = {
  mode: "supabase",

  async getUser() {
    const { data } = await sb().auth.getSession();
    return toUser(data.session?.user);
  },

  onAuthChange(cb) {
    const { data } = sb().auth.onAuthStateChange((_e, session) => cb(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  },

  async signUp({ email, password, name, phone }) {
    const data = check(
      await sb().auth.signUp({
        email,
        password,
        options: { data: { name, phone }, emailRedirectTo: `${location.origin}/dashboard` },
      }),
    );
    return { user: toUser(data.user), needsConfirmation: !data.session };
  },

  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? "Could not log in.");
    return toUser(data.user)!;
  },

  async signOut() {
    await sb().auth.signOut();
  },

  async getProfile(id) {
    return check(await sb().from("profiles").select("*").eq("id", id).maybeSingle()) as Profile | null;
  },

  async updateProfile(id, patch) {
    return check(await sb().from("profiles").update(patch).eq("id", id).select().single()) as Profile;
  },

  async listListings(f = {}) {
    let q = sb().from("listings").select("*");
    if (!f.includeSold) q = q.eq("status", "available");
    if (f.userId) q = q.eq("user_id", f.userId);
    if (f.ids) q = q.in("id", f.ids.length ? f.ids : ["00000000-0000-0000-0000-000000000000"]);
    if (f.category) q = q.eq("category", f.category);
    if (f.district) q = q.eq("district", f.district);
    if (f.condition) q = q.eq("condition", f.condition);
    if (f.free) q = q.eq("is_free", true);
    if (f.minPrice != null) q = q.gte("price", f.minPrice);
    if (f.maxPrice != null) q = q.lte("price", f.maxPrice);
    const term = f.q ? safeTerm(f.q) : "";
    if (term) q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%,town.ilike.%${term}%`);

    if (f.sort === "price-asc") q = q.order("price", { ascending: true });
    else if (f.sort === "price-desc") q = q.order("price", { ascending: false });
    else q = q.order("featured", { ascending: false });
    q = q.order("created_at", { ascending: false });
    if (f.limit) q = q.limit(f.limit);
    return check(await q) as Listing[];
  },

  async getListing(id) {
    return check(await sb().from("listings").select("*").eq("id", id).maybeSingle()) as Listing | null;
  },

  async createListing(input) {
    return check(await sb().from("listings").insert(input).select().single()) as Listing;
  },

  async updateListing(id, patch) {
    return check(await sb().from("listings").update(patch).eq("id", id).select().single()) as Listing;
  },

  async deleteListing(id) {
    check(await sb().from("listings").delete().eq("id", id));
  },

  async uploadImage(file, userId) {
    const path = `${userId}/${crypto.randomUUID()}.jpg`;
    check(await sb().storage.from(BUCKET).upload(path, file, { contentType: "image/jpeg", upsert: false }));
    return sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },

  async getFavorites(userId) {
    const rows = check(await sb().from("favorites").select("listing_id").eq("user_id", userId)) as { listing_id: string }[];
    return rows.map((r) => r.listing_id);
  },

  async toggleFavorite(userId, listingId) {
    const existing = check(
      await sb().from("favorites").select("listing_id").eq("user_id", userId).eq("listing_id", listingId).maybeSingle(),
    );
    if (existing) {
      check(await sb().from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId));
      return false;
    }
    check(await sb().from("favorites").insert({ user_id: userId, listing_id: listingId }));
    return true;
  },
};
