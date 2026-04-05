import { create } from "zustand";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  setUser: (user: User) => void;
  setLoading: (val: boolean) => void;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // Store raw — middleware reads it directly without decoding
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem("smartpath_token", token);
    localStorage.setItem("smartpath_user", JSON.stringify(user));
    // Also set cookie so Next.js middleware can read it for route protection
    setCookie("smartpath_token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("smartpath_token");
    localStorage.removeItem("smartpath_user");
    deleteCookie("smartpath_token");
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = "/login";
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("smartpath_token");
    const raw = localStorage.getItem("smartpath_user");
    if (token && raw) {
      try {
        const user: User = JSON.parse(raw);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("smartpath_token");
        localStorage.removeItem("smartpath_user");
        deleteCookie("smartpath_token");
      }
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (val) => set({ isLoading: val }),
}));
