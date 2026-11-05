"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { backend } from "@/lib/backend";
import type { AppUser, Profile } from "@/lib/types";

interface AuthState {
  user: AppUser | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: AppUser | null) => {
    setProfile(u ? await backend.getProfile(u.id) : null);
  }, []);

  useEffect(() => {
    let active = true;
    backend.getUser().then(async (u) => {
      if (!active) return;
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });
    const off = backend.onAuthChange((u) => {
      setUser(u);
      loadProfile(u);
    });
    return () => {
      active = false;
      off();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/** Sends signed-out visitors to the login page, then back here afterwards. */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [auth.loading, auth.user, router, pathname]);
  return auth;
}
