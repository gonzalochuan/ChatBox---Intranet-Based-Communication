import { create } from "zustand";
import type { Channel, Message } from "@/types";

interface ChatState {
  channels: Channel[];
  messages: Record<string, Message[]>; // channelId -> messages
  activeChannelId: string | null;
  setActiveChannel: (id: string) => void;
  sendMessage: (channelId: string, text: string) => void;
  setChannels: (chs: Channel[]) => void;
  setChannelMessages: (channelId: string, msgs: Message[]) => void;
  addIncoming: (msg: Message) => void;
}

function genId(): string {
  try {
    // @ts-ignore - not all environments have randomUUID
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      // @ts-ignore
      return (crypto as any).randomUUID();
    }
  } catch {}
  // Fallback UUID-like string
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${Date.now().toString(36)}-${s4()}${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  channels: [
    { id: "gen", name: "General", topic: "Campus-wide", kind: "subject" },
    { id: "sci101", name: "SCI 101", topic: "Section A", kind: "subject" },
  ],
  messages: {
    gen: [
      {
        id: "m1",
        channelId: "gen",
        senderId: "u1",
        senderName: "System",
        text: "Welcome to ChatBox!",
        createdAt: Date.now() - 1000 * 60,
        priority: "normal",
      },
    ],
  },
  activeChannelId: "gen",
  setActiveChannel: (id) => set({ activeChannelId: id }),
  sendMessage: (channelId, text) => {
    const msg: Message = {
      id: genId(),
      channelId,
      senderId: "me",
      senderName: "You",
      text,
      createdAt: Date.now(),
      priority: "normal",
    };
    const current = get().messages[channelId] ?? [];
    set({ messages: { ...get().messages, [channelId]: [...current, msg] } });
  },
  setChannels: (chs) => set({ channels: chs }),
  setChannelMessages: (channelId, msgs) =>
    set({ messages: { ...get().messages, [channelId]: msgs } }),
  addIncoming: (msg) => {
    const current = get().messages[msg.channelId] ?? [];
    set({ messages: { ...get().messages, [msg.channelId]: [...current, msg] } });
  },
}));
