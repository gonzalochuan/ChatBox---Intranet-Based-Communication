"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Intro() {
  const [leaving, setLeaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  // Lock page scroll while intro is shown so the overlay feels truly full-screen
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    if (isPlaying) {
      const p = v.play();
      if (p) p.catch(() => {
        // Autoplay might be blocked until user gesture; keep state in sync
        setIsPlaying(false);
      });
    } else {
      v.pause();
    }
  }, [isPlaying]);

  function handleStart() {
    setLeaving(true);
    setTimeout(() => {
      router.push("/login");
    }, 900);
  }

  function togglePlay() {
    const v = bgVideoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      const p = v.play();
      if (p) p.catch(() => {});
      setIsPlaying(true);
    }
  }

  return (
    <div
      className={`relative fixed inset-0 z-50 overflow-hidden bg-black text-white ${leaving ? "intro-leave" : ""}`}
      style={{ minHeight: "100dvh" }}
    >
      {/* Full-bleed background video shown when playing */}
      <video
        ref={bgVideoRef}
        className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-0"}`}
        src="/chat.mp4"
        muted
        loop
        playsInline
      />

      {/* Subtle dark veil for readability when playing (below grid) */}
      <div className={`fixed inset-0 bg-black/50 transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-0"}`} />

      {/* Grid overlay fixed to viewport */}
      <div className="grid-layer" />

      {/* Top chrome */}
      <div className="absolute top-6 left-6 z-20 text-xs md:text-sm tracking-widest text-white/80">CB 2025</div>
      <a className="absolute top-6 right-6 z-20 text-xs md:text-sm tracking-wider text-white/80 hover:text-white/95" href="#">How to use?</a>

      {/* Centered title */}
      <div className="fixed inset-0 z-10 grid place-items-center px-6 select-none">
        <h1 className="text-white/80 font-light text-3xl sm:text-5xl md:text-6xl tracking-[0.2em] sm:tracking-[0.4em] md:tracking-[0.6em] text-center whitespace-nowrap animate-rise">
          C h a t  B o x
        </h1>
      </div>

      {/* Lower section: subtitle and button near bottom */}
      <div className="fixed left-0 right-0 z-10 px-6 select-none flex flex-col items-center gap-6 bottom-24 sm:bottom-28 md:bottom-32">
        <p className="text-center max-w-xl text-white/80 tracking-wide leading-relaxed animate-fade-in [animation-delay:200ms]">
          Step into ChatBox — outside is text, inside is motion.
        </p>
        <button
          onClick={handleStart}
          className="inline-flex items-center justify-center rounded-full border border-white/50 px-8 py-3 text-white/90 hover:bg-white/5 active:bg-white/10 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset]"
        >
          Get Started
        </button>
      </div>

      {/* Bottom-left Play/Pause toggle */}
      <button
        aria-label={isPlaying ? "Pause background" : "Play background"}
        onClick={togglePlay}
        className="absolute left-6 bottom-6 z-20 h-6 w-6 md:h-7 md:w-7 grid place-items-center text-white/80 hover:text-white/95"
      >
        {/* Icon */}
        {isPlaying ? (
          <span className="relative block w-4 h-4">
            <span className="absolute inset-y-0 left-0 w-1 bg-white rounded-sm"></span>
            <span className="absolute inset-y-0 right-0 w-1 bg-white rounded-sm"></span>
          </span>
        ) : (
          <span className="block w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-white translate-x-[2px]" />
        )}
      </button>
    </div>
  );
}
