import { create } from "zustand";

export type UserRole = "student" | "teacher" | "admin";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
