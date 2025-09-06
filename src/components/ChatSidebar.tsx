"use client";

import { useChatStore } from "@/store/useChat";
import { useUI } from "@/store/useUI";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePeople } from "@/store/usePeople";

export default function ChatSidebar() {
  const channels = useChatStore((s) => s.channels);
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const setActive = useChatStore((s) => s.setActiveChannel);
  const filter = useUI((s) => s.channelFilter);
  const messagesMap = useChatStore((s) => s.messages);
  const createDm = useChatStore((s) => s.createDm);
  const setFilter = useUI((s) => s.setChannelFilter);
  const people = usePeople((s) => s.people);
  const [showNewChat, setShowNewChat] = useState(false);
  const [query, setQuery] = useState("");
  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = people.filter((p) => p.id !== "u-me" && p.name !== "You");
    if (!q) return base;
    return base.filter((p) => p.name.toLowerCase().includes(q) || (p.handle ?? "").toLowerCase().includes(q));
  }, [people, query]);

  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = channels.filter((c) => {
    if (filter === "all") return true;
    if (filter === "public") return c.kind !== "dm"; // all non-DM channels
    if (filter === "dm") return c.kind === "dm"; // one-to-one messages
    if (filter === "subject") return c.kind === "subject" && c.id !== "gen" && c.name.toLowerCase() !== "general"; // groups by study load
    return true;
  });

  // When the filter changes, auto-select the first channel in that filter.
  useEffect(() => {
    const first = filtered[0]?.id ?? null;
    if (first !== activeChannelId) {
      setActive(first as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, channels.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm md:text-base tracking-wide text-white/80">Messages</h2>
        <div className="flex items-center gap-2">
          <button
            title="New chat"
            className="h-8 w-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 grid place-items-center"
            onClick={() => { console.log("New chat"); setShowNewChat(true); }}
          >
            ＋
          </button>
          <button title="New group" className="h-8 w-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 grid place-items-center">☰</button>
        </div>
      </div>

      {/* Tools */}
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🔎</span>
          <input
            placeholder="Search"
            className="w-full rounded-full border border-white/20 bg-black/30 text-white/90 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scroll px-3 py-3 space-y-2">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`w-full text-left rounded-full border border-white/15 px-3 py-2.5 bg-black/30 hover:bg-white/10 transition-colors flex items-center gap-3 ${
              activeChannelId === c.id ? "ring-1 ring-white/30" : ""
            }`}
          >
            <div className="h-9 w-9 rounded-full border border-white/20 bg-black/40 grid place-items-center text-white/80 shrink-0">
              {/* simple avatar glyph */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="9" r="3.2"/><path d="M4 20c0-3.5 4-5.5 8-5.5s8 2 8 5.5"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-medium tracking-wide">{c.name}</div>
                <div className="shrink-0 text-[10px] text-white/50">
                  {mounted && messagesMap[c.id]?.length ? timeFmt.format(new Date(messagesMap[c.id][messagesMap[c.id].length-1].createdAt)) : ""}
                </div>
              </div>
              <div className="truncate text-xs text-white/50">
                {c.kind === "dm" ? "Typing…" : (c.topic || "")}
              </div>
            </div>
          </button>
        ))}
        {channels.length === 0 && (
          <div className="p-4 text-sm text-white/50">No channels yet.</div>
        )}
      </div>
    </div>
  );
}
