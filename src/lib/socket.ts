"use client";

import { io, Socket } from "socket.io-client";
import type { Message } from "@/types";
import { useChatStore } from "@/store/useChat";

let socket: Socket | null = null;
let currentBase = "";
let listenersBound = false;
let currentSocketId: string | null = null;

export function getSocket(baseUrl: string): Socket {
  const url = baseUrl.replace(/\/$/, "");
  if (!socket || currentBase !== url) {
    if (socket) socket.disconnect();
    socket = io(url, {
      // Allow both websocket and polling for broader device compatibility
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    currentBase = url;
    // Ensure we rebind listeners for the new socket instance
    listenersBound = false;
  }

  if (socket && !listenersBound) {
    socket.on("connect", () => {
      // eslint-disable-next-line no-console
      console.log("Socket connected", socket?.id);
      currentSocketId = socket?.id ?? null;
    });
    socket.on("connect_error", (err) => {
      // eslint-disable-next-line no-console
      console.warn("Socket connect_error", err.message);
    });
    socket.on("disconnect", (reason) => {
      // eslint-disable-next-line no-console
      console.log("Socket disconnected", reason);
      currentSocketId = null;
    });
    socket.on("message:new", (msg: Message) => {
      // ignore own echo
      if (currentSocketId && msg.senderId === currentSocketId) return;
      useChatStore.getState().addIncoming(msg);
    });
    listenersBound = true;
  }
  return socket!;
}
