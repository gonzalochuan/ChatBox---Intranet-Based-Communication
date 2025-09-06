import { create } from "zustand";

export interface Person {
  id: string;
  name: string;
  handle?: string;
}

interface PeopleState {
  people: Person[];
}

export const usePeople = create<PeopleState>(() => ({
  people: [
    { id: "u-me", name: "You" },
    { id: "u-andrew", name: "Andrew Vial", handle: "andrew" },
    { id: "u-jhon", name: "Jhon Castro", handle: "jhon" },
    { id: "u-guest", name: "Guest", handle: "guest" },
  ],
}));
