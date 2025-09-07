import { create } from "zustand";

interface AuthState {
  userId: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  setProfile: (u: { id: string; email: string | null; name?: string | null; nickname?: string | null; avatarUrl?: string | null; }) => void;
}

export const useAuth = create<AuthState>((set) => ({
  userId: null,
  email: null,
  displayName: null,
  avatarUrl: null,
  setProfile: (u) => {
    const display = u.nickname || u.name || u.email || "You";
    set({
      userId: u.id,
      email: u.email,
      displayName: display,
      avatarUrl: u.avatarUrl || null,
    });
  },
}));
