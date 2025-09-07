"use client";

import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import LeftRail from "@/components/LeftRail";
import { useEffect } from "react";
import { useConnection } from "@/store/useConnection";
import { useChatStore } from "@/store/useChat";
import { getSocket } from "@/lib/socket";
import { fetchMe } from "@/lib/api";
import { useAuth } from "@/store/useAuth";

export default function ChatPage() {
  const { mode, baseUrl, init, initializing, setUserLanUrl, reinit } = useConnection();
  const setChannels = useChatStore((s) => s.setChannels);
  const setChannelMessages = useChatStore((s) => s.setChannelMessages);
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const { displayName, avatarUrl, setProfile } = useAuth();

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

  // Load current user profile (if token exists) for avatar/nickname
  useEffect(() => {
    (async () => {
      if (mode !== "lan" || !baseUrl) return;
      try {
        const me = await fetchMe(baseUrl);
        if (me?.user) setProfile(me.user);
      } catch {}
    })();
  }, [mode, baseUrl, setProfile]);

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
    <div className="app-theme relative min-h-dvh text-white bg-black">
      {/* Grid background only; keep default strength from CSS */}
      <div className="grid-layer" />

      {/* App shell */}
      <div className="relative z-10 h-dvh grid grid-rows-[64px_1fr] min-h-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20 bg-white/10">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Me" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-white/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="9" r="3.2"/><path d="M4 20c0-3.5 4-5.5 8-5.5s8 2 8 5.5"/></svg>
                </div>
              )}
            </div>
            <div className="font-ethno-bold tracking-widest text-sm md:text-base">CHAT BOX</div>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-white/70">
            {badge}
            <button
              className="ml-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-2 py-1"
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

        {/* 3-box responsive layout */}
        <div className="grid grid-cols-12 gap-2 md:gap-4 h-full p-2 md:p-4 min-h-0">
          {/* Left rail (horizontal pill on mobile, vertical pill on desktop) */}
          <div className="col-span-12 md:col-span-1 xl:col-span-1 min-h-0">
            <div className="h-14 md:h-full rounded-full md:rounded-[28px] border border-white/15 bg-black/40 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] overflow-hidden flex items-center justify-center">
              <LeftRail />
            </div>
          </div>

          {/* Messages list card (hidden on mobile when a chat is open) */}
          <aside className={`col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 min-h-0 ${activeChannelId ? "hidden md:block" : "block"}`}>
            <div className="h-full rounded-3xl border border-white/15 bg-black/40 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] overflow-hidden flex flex-col min-h-0">
              <ChatSidebar />
            </div>
          </aside>

          {/* Chat window card (shown on mobile only when a chat is open) */}
          <main className={`${activeChannelId ? "col-span-12" : "hidden"} md:block md:col-span-7 lg:col-span-8 xl:col-span-8 min-h-0`}>
            <div className="h-full rounded-[28px] border border-white/15 bg-black/40 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] overflow-hidden flex flex-col min-h-0">
              <ChatWindow />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
