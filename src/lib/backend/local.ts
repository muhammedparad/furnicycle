import type {
  AppUser,
  Backend,
  Listing,
  ListingInput,
  ListingPatch,
  Profile,
} from "../types";
import { blobToDataUrl } from "../image";
import { applyFilters } from "./filter";
import { seedListings } from "./seed";

/**
 * Browser-only backend backed by IndexedDB. It mirrors the Supabase backend
 * so every page works before a project is connected. Data stays on this device.
 */

interface StoredUser {
  id: string;
  email: string;
  salt: string;
  hash: string;
}

interface State {
  users: StoredUser[];
  profiles: Profile[];
  listings: Listing[];
  favorites: { user_id: string; listing_id: string }[];
  session: string | null;
}

const DB = "furnicycle";
const STORE = "kv";
const KEY = "state-v1";

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function read(): Promise<State | undefined> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result as State | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function write(state: State) {
  const db = await idb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(state, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

let cache: Promise<State> | null = null;
const load = () =>
  (cache ??= read().then(async (s) => {
    if (s) return s;
    const fresh: State = { users: [], profiles: [], listings: seedListings(), favorites: [], session: null };
    await write(fresh);
    return fresh;
  }));

async function mutate<T>(fn: (s: State) => T): Promise<T> {
  const s = await load();
  const result = fn(s);
  await write(s);
  return result;
}

async function hash(password: string, salt: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join(""); // taste-skill-ignore: hex digest
}

const listeners = new Set<(u: AppUser | null) => void>();
const emit = (u: AppUser | null) => listeners.forEach((cb) => cb(u));
const toUser = (u: StoredUser): AppUser => ({ id: u.id, email: u.email });
const clone = <T,>(x: T): T => structuredClone(x);

export const localBackend: Backend = {
  mode: "local",

  async getUser() {
    const s = await load();
    const u = s.users.find((x) => x.id === s.session);
    return u ? toUser(u) : null;
  },

  onAuthChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  async signUp({ email, password, name, phone }) {
    const normalized = email.trim().toLowerCase();
    const salt = crypto.randomUUID();
    const h = await hash(password, salt);
    const user = await mutate((s) => {
      if (s.users.some((u) => u.email === normalized)) throw new Error("An account with this email already exists.");
      const u: StoredUser = { id: crypto.randomUUID(), email: normalized, salt, hash: h };
      s.users.push(u);
      s.profiles.push({ id: u.id, name, phone, whatsapp: true, district: "", created_at: new Date().toISOString() });
      s.session = u.id;
      return toUser(u);
    });
    emit(user);
    return { user, needsConfirmation: false };
  },

  async signIn(email, password) {
    const s = await load();
    const u = s.users.find((x) => x.email === email.trim().toLowerCase());
    if (!u || (await hash(password, u.salt)) !== u.hash) throw new Error("Email or password is incorrect.");
    await mutate((st) => (st.session = u.id));
    emit(toUser(u));
    return toUser(u);
  },

  async signOut() {
    await mutate((s) => (s.session = null));
    emit(null);
  },

  async getProfile(id) {
    const s = await load();
    const p = s.profiles.find((x) => x.id === id);
    return p ? clone(p) : null;
  },

  async updateProfile(id, patch) {
    return mutate((s) => {
      const p = s.profiles.find((x) => x.id === id);
      if (!p) throw new Error("Profile not found.");
      Object.assign(p, patch);
      return clone(p);
    });
  },

  async listListings(filters) {
    const s = await load();
    return clone(applyFilters(s.listings, filters));
  },

  async getListing(id) {
    const s = await load();
    const l = s.listings.find((x) => x.id === id);
    return l ? clone(l) : null;
  },

  async createListing(input: ListingInput) {
    return mutate((s) => {
      const now = new Date().toISOString();
      const l: Listing = { ...input, id: crypto.randomUUID(), status: "available", featured: false, created_at: now, updated_at: now };
      s.listings.push(l);
      return clone(l);
    });
  },

  async updateListing(id, patch: ListingPatch) {
    return mutate((s) => {
      const l = s.listings.find((x) => x.id === id);
      if (!l) throw new Error("Listing not found.");
      if (l.user_id !== s.session) throw new Error("You can only edit your own listings.");
      Object.assign(l, patch, { updated_at: new Date().toISOString() });
      return clone(l);
    });
  },

  async deleteListing(id) {
    await mutate((s) => {
      const l = s.listings.find((x) => x.id === id);
      if (l && l.user_id !== s.session) throw new Error("You can only delete your own listings.");
      s.listings = s.listings.filter((x) => x.id !== id);
      s.favorites = s.favorites.filter((f) => f.listing_id !== id);
    });
  },

  async uploadImage(file) {
    return blobToDataUrl(file);
  },

  async getFavorites(userId) {
    const s = await load();
    return s.favorites.filter((f) => f.user_id === userId).map((f) => f.listing_id);
  },

  async toggleFavorite(userId, listingId) {
    return mutate((s) => {
      const i = s.favorites.findIndex((f) => f.user_id === userId && f.listing_id === listingId);
      if (i >= 0) {
        s.favorites.splice(i, 1);
        return false;
      }
      s.favorites.push({ user_id: userId, listing_id: listingId });
      return true;
    });
  },
};
