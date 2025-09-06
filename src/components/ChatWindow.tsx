"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChat";
import { useConnection } from "@/store/useConnection";
import { getSocket } from "@/lib/socket";

export default function ChatWindow() {
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const messages = useChatStore((s) => s.messages[activeChannelId ?? ""] ?? []);
  const send = useChatStore((s) => s.sendMessage);

  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { mode, baseUrl } = useConnection();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, activeChannelId]);

  return (
    <div className="h-full flex flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="flex gap-2 items-start">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div>
              <div className="text-sm font-medium">{m.senderName}</div>
              <div className="text-sm">{m.text}</div>
              <div className="text-[10px] text-gray-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-gray-500">No messages. Say hello!</div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || !activeChannelId) return;
          const body = text.trim();
          // Optimistic local append
          send(activeChannelId, body);
          // Emit over LAN if available
          if (mode === "lan" && baseUrl) {
            try {
              const socket = getSocket(baseUrl);
              socket.emit("message:send", { channelId: activeChannelId, text: body });
            } catch {}
          }
          setText("");
        }}
        className="p-3 border-t flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={activeChannelId ? "Write a message" : "Select a channel to start"}
          className="flex-1 rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          disabled={!activeChannelId}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
