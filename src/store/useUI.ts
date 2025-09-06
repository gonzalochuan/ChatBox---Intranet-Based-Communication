import { create } from "zustand";

export type ChannelFilter = "all" | "public" | "dm" | "subject";

interface UIState {
  channelFilter: ChannelFilter;
  setChannelFilter: (f: ChannelFilter) => void;
}

export const useUI = create<UIState>((set) => ({
  channelFilter: "all",
  setChannelFilter: (f) => set({ channelFilter: f }),
}));
