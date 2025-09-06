"use client";

import { create } from "zustand";

export type ConnectionMode = "lan" | "cloud" | "offline";

interface ConnectionState {
  mode: ConnectionMode;
  baseUrl: string | null;
  initializing: boolean;
  setMode: (m: ConnectionMode, baseUrl: string | null) => void;
  init: () => Promise<void>;
  setUserLanUrl: (url: string | null) => void;
  reinit: () => Promise<void>;
}

async function tryHealth(url: string, timeoutMs = 800): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/health`, {
      signal: ctrl.signal,
    });
    if (!r.ok) return false;
    const data = await r.json().catch(() => ({}));
    return Boolean(data?.ok);
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

function getStoredLan(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("chatbox.lanBaseUrl");
  } catch {
    return null;
  }
}

function setStoredLan(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) localStorage.setItem("chatbox.lanBaseUrl", url);
    else localStorage.removeItem("chatbox.lanBaseUrl");
  } catch {}
}

export const useConnection = create<ConnectionState>((set, get) => ({
  mode: "offline",
  baseUrl: null,
  initializing: false,
  setMode: (m, baseUrl) => set({ mode: m, baseUrl }),
  init: async () => {
    set({ initializing: true });
    const userLan = getStoredLan();
    const lan = userLan || process.env.NEXT_PUBLIC_LAN_BASE_URL || "http://localhost:4000";
    const cloud = process.env.NEXT_PUBLIC_CLOUD_BASE_URL || "";

    if (await tryHealth(lan)) {
      set({ mode: "lan", baseUrl: lan, initializing: false });
      return;
    }
    if (cloud && (await tryHealth(cloud))) {
      set({ mode: "cloud", baseUrl: cloud, initializing: false });
      return;
    }
    set({ mode: "offline", baseUrl: null, initializing: false });
  },
  setUserLanUrl: (url) => {
    setStoredLan(url);
  },
  reinit: async () => {
    await get().init();
  },
}));
