import type { Backend } from "../types";
import { localBackend } from "./local";
import { supabaseBackend } from "./supabase";

/** Supabase when its keys are set, otherwise the in-browser demo backend. */
export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const backend: Backend = hasSupabase ? supabaseBackend : localBackend;
