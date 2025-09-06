"use client";

import { useUI } from "@/store/useUI";
import { useEffect } from "react";

const Icon = {
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18"/>
    </svg>
  ),
  dm: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H11l-4 3v-3H6a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z"/>
      <path d="M9 12h6"/>
    </svg>
  ),
  group: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="3"/>
      <circle cx="16" cy="8" r="3"/>
      <path d="M3 20c0-3 3-5 5-5m8 0c2 0 5 2 5 5"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8a6 6 0 1 1 12 0v4l2 3H4l2-3V8"/>
      <path d="M9 20a3 3 0 0 0 6 0"/>
    </svg>
  ),
  settings: (
    <img src="/settings.svg" alt="Settings" width={20} height={20} />
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
};

export default function LeftRail() {
  const setFilter = useUI((s) => s.setChannelFilter);
  const current = useUI((s) => s.channelFilter);

  // Ensure the html class matches the persisted theme on mount
  useEffect(() => {
    // no-op for now; theme toggle uses DOM class directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const Item = ({ children, onClick, active = false }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      className={`grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-full border bg-black/40 hover:bg-white/10 transition-colors text-white ${
        active ? "border-white/60 ring-1 ring-white/70" : "border-white/20"
      }`}
    >
      {children}
    </button>
  );

  return (
    <nav className="w-full h-full flex md:flex-col items-center md:items-center justify-between md:justify-start gap-2 md:gap-6 py-2 md:py-6 px-2 md:px-3 md:w-16">
      {/* Profile (bigger on desktop) */}
      <div className="shrink-0">
        <div className="h-10 w-10 md:h-14 md:w-14 rounded-full border border-white/20 bg-white/5 grid place-items-center text-white/90">
          {Icon.profile}
        </div>
      </div>

      {/* Middle icons */}
      <div className="flex-1 flex md:flex-col items-center justify-center gap-2 md:gap-6 text-white">
        <Item onClick={() => setFilter("public")} active={current === "public" || current === "all"}>{Icon.globe}</Item>
        <Item onClick={() => setFilter("dm")} active={current === "dm"}>{Icon.dm}</Item>
        <Item onClick={() => setFilter("subject")} active={current === "subject"}>{Icon.group}</Item>
      </div>

      {/* Bottom / right icons */}
      <div className="shrink-0 flex md:flex-col items-center justify-center gap-2 md:gap-6 text-white">
        <Item>{Icon.bell}</Item>
        <Item>{Icon.settings}</Item>
      </div>
    </nav>
  );
}
