"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";
import { getMe } from "@/lib/api";

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, loadFromStorage, setUser, setLoading, token } =
    useAuthStore();
  const { status: nextAuthStatus } = useSession();
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    loadFromStorage();

    const storedToken = localStorage.getItem("smartpath_token");
    if (!storedToken) {
      // No smartpath token — keep isLoading true until NextAuth resolves
      // so the layout doesn't flash-redirect before the session is known
      return;
    }

    getMe()
      .then((res) => {
        if (res.data?.patient) setUser(res.data.patient);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once NextAuth has resolved (authenticated or not), we can safely mark loading done
  useEffect(() => {
    if (nextAuthStatus !== "loading") {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextAuthStatus]);

  const role = user?.role ?? null;

  return { user, role, isAuthenticated, isLoading, logout, token };
}
