import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const PORT = parseInt(process.env.PORT || "4000", 10);
const ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");
const IS_DEV = process.env.NODE_ENV !== "production";

const app = express();
app.use(
  cors({
    origin: IS_DEV ? true : ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

// Simple in-memory stores for MVP
type Channel = { id: string; name: string; topic?: string; kind: string };
interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
  priority: "normal" | "high" | "emergency";
}

const channels: Channel[] = [
  { id: "gen", name: "General", topic: "Campus-wide", kind: "subject" },
];
const messages: Record<string, Message[]> = { gen: [] };

app.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "lan", ts: Date.now() });
});

app.get("/channels", (_req, res) => {
  res.json({ channels });
});

app.get("/channels/:id/messages", (req, res) => {
  const list = messages[req.params.id] || [];
  res.json({ messages: list });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: IS_DEV ? true : ORIGINS, credentials: true },
});

io.on("connection", (socket) => {
  // Debug: new connection
  // eslint-disable-next-line no-console
  console.log(`[socket] connected id=${socket.id} from ${socket.handshake.address}`);
  socket.on("join", (channelId: string) => {
    socket.join(channelId);
    // Debug: join room
    // eslint-disable-next-line no-console
    console.log(`[socket] ${socket.id} joined room ${channelId}`);
  });

  socket.on("message:send", (payload: { channelId: string; text: string; senderId?: string; senderName?: string; priority?: Message["priority"]; }) => {
    // Debug: inbound message
    // eslint-disable-next-line no-console
    console.log(`[socket] message:send from=${socket.id} ch=${payload.channelId} text=${JSON.stringify(payload.text)}`);
    const msg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channelId: payload.channelId,
      senderId: payload.senderId || socket.id,
      senderName: payload.senderName || "User",
      text: payload.text,
      createdAt: Date.now(),
      priority: payload.priority || "normal",
    };
    if (!messages[msg.channelId]) messages[msg.channelId] = [];
    messages[msg.channelId].push(msg);
    io.to(msg.channelId).emit("message:new", msg);
    // Debug: broadcasted
    // eslint-disable-next-line no-console
    console.log(`[socket] message:new broadcast to room ${msg.channelId}`);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`LAN server listening on http://0.0.0.0:${PORT}`);
});
