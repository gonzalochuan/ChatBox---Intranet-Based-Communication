"use client";

import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useEffect } from "react";
import { useConnection } from "@/store/useConnection";
import { useChatStore } from "@/store/useChat";
import { getSocket } from "@/lib/socket";

export default function ChatPage() {
  const { mode, baseUrl, init, initializing, setUserLanUrl, reinit } = useConnection();
  const setChannels = useChatStore((s) => s.setChannels);
  const setChannelMessages = useChatStore((s) => s.setChannelMessages);
  const activeChannelId = useChatStore((s) => s.activeChannelId);

  // Initialize connection on mount
  useEffect(() => {
    init();
  }, [init]);

  // When LAN, fetch channels once
  useEffect(() => {
    (async () => {
      if (mode !== "lan" || !baseUrl) return;
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/channels`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.channels)) setChannels(data.channels);
        }
      } catch {}
    })();
  }, [mode, baseUrl, setChannels]);

  // Join room and fetch messages when channel changes in LAN mode
  useEffect(() => {
    (async () => {
      if (mode !== "lan" || !baseUrl || !activeChannelId) return;
      const socket = getSocket(baseUrl);
      socket.emit("join", activeChannelId);
      try {
        const res = await fetch(
          `${baseUrl.replace(/\/$/, "")}/channels/${activeChannelId}/messages`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages))
            setChannelMessages(activeChannelId, data.messages);
        }
      } catch {}
    })();
  }, [mode, baseUrl, activeChannelId, setChannelMessages]);

  const badge = (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${
        mode === "lan"
          ? "bg-green-50 text-green-700 border-green-200"
          : mode === "cloud"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {initializing ? "Connecting…" : mode.toUpperCase()}
    </span>
  );

  return (
    <div className="h-dvh grid grid-rows-[56px_1fr]">
      <header className="flex items-center justify-between px-4 border-b">
        <div className="font-semibold">ChatBox</div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="hidden md:inline">MVP • Intranet-first</span>
          {badge}
          <button
            className="ml-2 rounded-md border px-2 py-1 hover:bg-gray-50"
            onClick={() => {
              const v = prompt("Set LAN server URL", baseUrl || "http://192.168.0.100:4000");
              if (v) {
                setUserLanUrl(v);
                reinit();
              }
            }}
          >
            Set LAN
          </button>
        </div>
      </header>
      <div className="grid grid-cols-12 h-full">
        <aside className="col-span-3 md:col-span-3 lg:col-span-3 xl:col-span-2 border-r overflow-y-auto">
          <ChatSidebar />
        </aside>
        <main className="col-span-9 md:col-span-9 lg:col-span-9 xl:col-span-10 h-full">
          <ChatWindow />
        </main>
      </div>
    </div>
  );
}
