import { create } from "zustand";

// Minimal local profile store (optional). Not required by DM feature.
interface AuthState {
  userId: string;
  name: string;
  setProfile: (name: string) => void;
}

const getLocal = (k: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  try { return localStorage.getItem(k) || fallback; } catch { return fallback; }
};

export const useAuth = create<AuthState>((set) => ({
  userId: getLocal("authId", "u-me"),
  name: getLocal("authName", "You"),
  setProfile: (name: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("authName", name);
        localStorage.setItem("authId", "u-me");
      }
    } catch {}
    set({ name, userId: "u-me" });
  },
}));
