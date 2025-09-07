export type ChannelKind = "subject" | "section" | "dm" | "announcement";

export interface Channel {
  id: string;
  name: string;
  topic?: string;
  kind: ChannelKind;
}

export type MessagePriority = "normal" | "high" | "emergency";

export interface Message {
  id: string;
  channelId: string;
  senderId: string; // may be empty when guest
  senderName: string;
  senderAvatarUrl?: string | null;
  senderSocketId?: string; // present on live socket events for ownership
  text: string;
  createdAt: number; // epoch ms
  priority: MessagePriority;
}
