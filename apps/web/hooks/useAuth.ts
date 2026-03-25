"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMe } from "@/lib/api";

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, loadFromStorage, setUser, setLoading, token } =
    useAuthStore();

  useEffect(() => {
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

  return { user, isAuthenticated, isLoading, logout, token };
}
