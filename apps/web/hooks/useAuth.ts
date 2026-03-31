"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMe } from "@/lib/api";

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, loadFromStorage, setUser, setLoading, token } =
    useAuthStore();
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    loadFromStorage();

    const storedToken = localStorage.getItem("smartpath_token");
    if (!storedToken) {
      setLoading(false);
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

  const role = user?.role ?? null;

  return { user, role, isAuthenticated, isLoading, logout, token };
}
