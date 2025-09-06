"use client";

import { useChatStore } from "@/store/useChat";

export default function ChatSidebar() {
  const channels = useChatStore((s) => s.channels);
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const setActive = useChatStore((s) => s.setActiveChannel);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <input
          placeholder="Search channels"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`w-full text-left px-3 py-2 border-b hover:bg-gray-50 ${
              activeChannelId === c.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="font-medium text-sm">{c.name}</div>
            <div className="text-xs text-gray-500">{c.topic}</div>
          </button>
        ))}
        {channels.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No channels yet.</div>
        )}
      </div>
    </div>
  );
}
