import { create } from "zustand";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem("smartpath_token", token);
    localStorage.setItem("smartpath_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("smartpath_token");
    localStorage.removeItem("smartpath_user");
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
        // corrupted storage — clear it
        localStorage.removeItem("smartpath_token");
        localStorage.removeItem("smartpath_user");
      }
    }
  },

  setUser: (user) => set({ user }),

  setLoading: (val) => set({ isLoading: val }),
}));
