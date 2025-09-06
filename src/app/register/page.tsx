"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import SparkleGridOverlay from "@/components/SparkleGridOverlay";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subjectCodes, setSubjectCodes] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [schedules, setSchedules] = useState("");
  const [yearLevel, setYearLevel] = useState("1");
  const [section, setSection] = useState("");
  const [block, setBlock] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const yearMenuRef = useRef<HTMLDivElement | null>(null);
  const [yearOpen, setYearOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Required";
    if (!password.trim()) nextErrors.password = "Required";
    if (!studentId.trim()) nextErrors.studentId = "Required";
    if (!yearLevel.trim()) nextErrors.yearLevel = "Required";
    if (!section.trim()) nextErrors.section = "Required";
    if (!block.trim()) nextErrors.block = "Required";
    if (!schedules.trim()) nextErrors.schedules = "Required";
    if (subjectCodes.length === 0) nextErrors.subjectCodes = "Add at least 1 subject";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);
    try {
      // TODO: integrate backend user creation and group assignment
      // This payload contains all the academic grouping info
      const payload = {
        name,
        email,
        password,
        studentId,
        subjectCodes,
        schedules,
        yearLevel,
        section,
        block,
      };
      console.log("Register payload", payload);
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = "/chat"; // go to chat after mocked success
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] text-white bg-black overflow-hidden">
      {/* Background to match Intro/Login */}
      <video
        className="pointer-events-none fixed inset-0 w-full h-full object-cover opacity-[0.06]"
        src="/chat.mp4"
        muted
        loop
        autoPlay
        playsInline
      />
      <div className="grid-layer" />
      <SparkleGridOverlay />

      {/* Top chrome */}
      <div className="absolute top-6 left-6 z-30 text-xs md:text-sm tracking-widest text-white/80 font-ethno-bold">CB 2025</div>
      <Link href="/" className="absolute top-6 right-6 z-30 text-xs md:text-sm tracking-wider text-white/80 hover:text-white">Back</Link>

      {/* Card */}
      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center p-6 pt-24 sm:pt-28">
        <div className="w-full max-w-2xl sm:max-w-xl rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_10px_40px_-10px_rgba(0,0,0,0.6)] p-6 sm:p-8">
          <h1 className="text-2xl font-akira-bold tracking-wide">Create account</h1>
          <p className="text-sm text-white/70 mt-4">Join ChatBox and your assigned groups</p>

          <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-white/60">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${errors.email ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="name@school.edu"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400/90">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60">Password <span className="text-red-400">*</span></label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${errors.password ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400/90">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60">Student ID <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${errors.studentId ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="2025-12345"
              />
              {errors.studentId && <p className="mt-1 text-xs text-red-400/90">{errors.studentId}</p>}
            </div>
            {/* Subject Codes chip input */}
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-white/60">Subject Codes <span className="text-red-400">*</span></label>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5">
                {subjectCodes.map((code, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm">
                    {code}
                    <button type="button" aria-label={`Remove ${code}`} className="text-white/70 hover:text-white" onClick={() => setSubjectCodes(subjectCodes.filter((_, i) => i !== idx))}>×</button>
                  </span>
                ))}
                <input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const cleaned = subjectInput.trim().toUpperCase();
                      if (cleaned && !subjectCodes.includes(cleaned)) {
                        setSubjectCodes([...subjectCodes, cleaned]);
                      }
                      setSubjectInput("");
                    } else if (e.key === "Backspace" && !subjectInput && subjectCodes.length) {
                      setSubjectCodes(subjectCodes.slice(0, -1));
                    }
                  }}
                  placeholder="Add code e.g., IT-233, CS101 and press Enter/Return"
                  className="flex-1 min-w-[160px] bg-transparent text-white placeholder-white/40 outline-none"
                />
              </div>
              {errors.subjectCodes ? (
                <p className="mt-1 text-xs text-red-400/90">{errors.subjectCodes}</p>
              ) : (
                <p className="mt-3 text-xs text-white/50">Enter all the subjects you’re taking. We’ll auto-join the subject channels.</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-white/60">Schedules <span className="text-red-400">*</span></label>
              <textarea
                required
                value={schedules}
                onChange={(e) => setSchedules(e.target.value)}
                rows={3}
                className={`mt-2 w-full rounded-xl border ${errors.schedules ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="e.g., MWF 9:00-10:00 CS101 Room 203; TTh 1:00-2:30 MATH201 ..."
              />
              {errors.schedules ? (
                <p className="mt-1 text-xs text-red-400/90">{errors.schedules}</p>
              ) : (
                <p className="mt-1 text-xs text-white/50">You can paste your timetable; we’ll auto-detect blocks/sections.</p>
              )}
            </div>
            {/* Custom glass dropdown for Year Level */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60">Year Level <span className="text-red-400">*</span></label>
              <div className="relative mt-2" ref={yearMenuRef}>
                <button type="button" onClick={() => setYearOpen((v) => !v)} className={`w-full rounded-xl border ${errors.yearLevel ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-left text-white/90 outline-none focus:ring-2 focus:ring-white/30 flex items-center justify-between`}>
                  <span>Year {yearLevel}</span>
                  <span className="text-white/70">▾</span>
                </button>
                {yearOpen && (
                  <div className="absolute z-40 mt-2 w-full rounded-xl border border-white/20 bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                    {["1","2","3","4","5"].map((y) => (
                      <button key={y} type="button" onClick={() => { setYearLevel(y); setYearOpen(false); }} className={`w-full text-left px-3 py-2 hover:bg-white/10 ${yearLevel===y?"bg-white/10":""}`}>
                        Year {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.yearLevel && <p className="mt-1 text-xs text-red-400/90">{errors.yearLevel}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60">Section <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${errors.section ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="A"
              />
              {errors.section && <p className="mt-1 text-xs text-red-400/90">{errors.section}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60">Block <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className={`mt-2 w-full rounded-xl border ${errors.block ? "border-red-400/60" : "border-white/20"} bg-white/5 px-3 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30`}
                placeholder="B1"
              />
              {errors.block && <p className="mt-1 text-xs text-red-400/90">{errors.block}</p>}
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full border border-white/25 bg-white/10 hover:bg-white/15 active:bg-white/20 backdrop-blur-md py-3 font-medium tracking-wide transition-colors disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>

          <div className="mt-5 text-sm text-white/70">
            Already have an account? <Link href="/login" className="hover:text-white">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

