"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useChatStore } from "@/store/useChat";
import { useConnection } from "@/store/useConnection";
import { getSocket } from "@/lib/socket";

export default function ChatWindow() {
  const channels = useChatStore((s) => s.channels);
  const messagesMap = useChatStore((s) => s.messages);
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const messages = useMemo(() => messagesMap[activeChannelId ?? ""] ?? [], [messagesMap, activeChannelId]);
  const send = useChatStore((s) => s.sendMessage);

  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { mode, baseUrl } = useConnection();
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const { displayName, avatarUrl, userId } = useAuth();
  const normalizeAvatar = (u?: string | null) => {
    if (!u) return null;
    try {
      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      return u
        .replace("http://localhost:4000", `http://${host}:4000`)
        .replace("http://127.0.0.1:4000", `http://${host}:4000`);
    } catch { return u; }
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, activeChannelId]);

  // Track my socket id for alignment
  useEffect(() => {
    if (!baseUrl) return;
    try {
      const s = getSocket(baseUrl);
      const handler = () => setMySocketId(s.id || null);
      handler();
      s.on("connect", handler);
      return () => {
        s.off("connect", handler);
      };
    } catch {}
  }, [baseUrl]);

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      }),
    []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const Icon = {
    paperclip: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
      </svg>
    ),
    send: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
    )
  };

  const active = channels.find(c => c.id === activeChannelId);

  return (
    <div className="h-full flex flex-col">
      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full border border-white/20 bg-black/40 grid place-items-center text-white/80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="9" r="3.2"/><path d="M4 20c0-3.5 4-5.5 8-5.5s8 2 8 5.5"/></svg>
          </div>
          <div className="min-w-0">
            <div className="truncate tracking-wider font-medium">{active?.name ?? "Chat"}</div>
            <div className="text-xs text-white/50 truncate">{active?.kind === 'dm' ? 'Online' : (active?.topic ?? '')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <button className="h-8 w-8 rounded-md border border-white/20 bg-black/40 grid place-items-center hover:bg-white/10" title="Video">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>
          </button>
          <button className="h-8 w-8 rounded-md border border-white/20 bg-black/40 grid place-items-center hover:bg-white/10" title="Call">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.94.69 2.86a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.92.33 1.88.56 2.86.69A2 2 0 0 1 22 16.92z"/></svg>
          </button>
          <button className="h-8 w-8 rounded-md border border-white/20 bg-black/40 grid place-items-center hover:bg-white/10" title="More">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {(() => {
          const lastOther = [...messages].reverse().find((mm) => {
            const mineTest = (userId && mm.senderId === userId) || (mySocketId && mm.senderSocketId === mySocketId);
            return !mineTest;
          });
          const lastOtherAvatar = lastOther?.senderAvatarUrl || null;
          return messages.map((m) => {
            const mine = (userId && m.senderId === userId) || (mySocketId && m.senderSocketId === mySocketId) ? true : false;
            return (
              <div key={m.id} className="space-y-1">
                {/* Name label above bubble */}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="text-[11px] opacity-70 px-12 pt-2">
                    {mine ? "You" : m.senderName}
                  </div>
                </div>
                <div className={`flex items-end ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && (
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/25 mr-2 overflow-hidden">
                      {normalizeAvatar(m.senderAvatarUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={normalizeAvatar(m.senderAvatarUrl)!} alt={m.senderName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-white/50">?</div>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-full px-4 py-2 border ${mine ? "border-emerald-200/60" : "border-white/30"} text-white`}> 
                    <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                  </div>
                  {mine && (
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/25 ml-2 overflow-hidden">
                      {normalizeAvatar(avatarUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={normalizeAvatar(avatarUrl)!} alt="Me" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-white/50">?</div>
                      )}
                    </div>
                  )}
                </div>
                {/* Meta row: time and tiny avatar-as-seen for own messages */}
                <div className={`flex items-center ${mine ? "justify-end" : "justify-start"} gap-2 px-10 md:px-16`}>
                  <div className="text-[10px] opacity-70">{timeFmt.format(new Date(m.createdAt))}</div>
                  {mine && normalizeAvatar(lastOtherAvatar) && (
                    <div className="h-4 w-4 rounded-full overflow-hidden border border-white/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={normalizeAvatar(lastOtherAvatar)!} alt="Seen by" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}
        {messages.length === 0 && (
          <div className="text-sm text-gray-500">No messages. Say hello!</div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || !activeChannelId) return;
          const body = text.trim();
          if (mode !== "lan") {
            // offline/cloud mode: add locally
            send(activeChannelId, body);
          }
          if (mode === "lan" && baseUrl) {
            try {
              const socket = getSocket(baseUrl);
              socket.emit("message:send", { channelId: activeChannelId, text: body, senderName: displayName || "You", senderAvatarUrl: avatarUrl || null, senderId: userId || undefined });
            } catch {}
          }
          setText("");
        }}
        className="p-3 md:p-4 border-t border-white/10"
      >
        <div className="rounded-full border border-white/20 bg-black/30 px-3 py-2 flex items-center gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
              }
            }}
            rows={1}
            placeholder={activeChannelId ? "Your message…" : "Select a channel to start"}
            className="flex-1 bg-transparent outline-none resize-none text-base md:text-sm text-white placeholder-white/40 px-2 py-1"
          />
          <input ref={fileInputRef} type="file" hidden onChange={() => { /* TODO: upload */ }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="h-9 w-9 rounded-md border border-white/20 bg-black/40 grid place-items-center text-white hover:bg-white/10" title="Attach file">
            {Icon.paperclip}
          </button>
          <button type="submit" disabled={!activeChannelId} className="h-9 w-9 rounded-full border border-white/20 bg-black/40 grid place-items-center text-white hover:bg-white/10 disabled:opacity-50" title="Send">
            {Icon.send}
          </button>
        </div>
      </form>
    </div>
  );
}
