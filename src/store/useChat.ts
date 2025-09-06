import { create } from "zustand";
import type { Channel, Message } from "@/types";

interface ChatState {
  channels: Channel[];
  messages: Record<string, Message[]>; // channelId -> messages
  activeChannelId: string | null;
  setActiveChannel: (id: string | null) => void;
  sendMessage: (channelId: string, text: string) => void;
  setChannels: (chs: Channel[]) => void;
  setChannelMessages: (channelId: string, msgs: Message[]) => void;
  addIncoming: (msg: Message) => void;
  createDm: (personId: string, personName: string) => string; // returns channelId
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
    // Public/global channels
    { id: "gen", name: "General", topic: "Campus-wide", kind: "public" as any },
    // Auto-created group chats by year/block/schedule (subjects)
    { id: "bsit3-b4", name: "BSIT • 3rd yr • Block 4", topic: "Schedule: MWF 8:00–10:00", kind: "subject" },
    { id: "bsit2-b1", name: "BSIT • 2nd yr • Block 1", topic: "Schedule: TTh 1:00–3:00", kind: "subject" },
    { id: "cs1-b2", name: "BSCS • 1st yr • Block 2", topic: "Schedule: MWF 10:00–12:00", kind: "subject" },
    // Example subject
    { id: "sci101", name: "SCI 101", topic: "Section A", kind: "subject" },
    { id: "dm-guest", name: "Guest", topic: "Direct Message", kind: "dm" },
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
    "bsit3-b4": [],
    "bsit2-b1": [],
    "cs1-b2": [],
    "dm-guest": [
      {
        id: "m-dm1",
        channelId: "dm-guest",
        senderId: "guest",
        senderName: "Guest",
        text: "Hi! This is a demo DM.",
        createdAt: Date.now() - 30000,
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
  createDm: (personId, personName) => {
    // Try to find an existing DM channel by id or name
    const existing = get().channels.find(
      (c) => c.kind === "dm" && (c.id === `dm-${personId}` || c.name === personName)
    );
    if (existing) {
      set({ activeChannelId: existing.id });
      return existing.id;
    }
    const id = `dm-${personId}`;
    const ch: Channel = { id, name: personName, topic: "Direct Message", kind: "dm" as any };
    set({ channels: [...get().channels, ch] });
    if (!get().messages[id]) {
      set({ messages: { ...get().messages, [id]: [] } });
    }
    set({ activeChannelId: id });
    return id;
  },
}));
