"use client";

import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";

const STEPS = [
  "Dialing Windows XP AI...",
  "Negotiating handshake...",
  "Authenticating session...",
  "Establishing secure link...",
  "Connected.",
];

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), 480);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="w-[min(90vw,420px)] xp-window">
        <div className="xp-titlebar">
          <span className="text-[13px] font-semibold">Network Connection</span>
        </div>
        <div className="p-6 flex flex-col items-center gap-4 bg-white/[0.04]">
          <div className="relative">
            <Wifi size={40} className="text-sky-300 animate-pulse" />
          </div>
          <p className="text-[13px] text-slate-200 text-center min-h-[20px]">
            {STEPS[stepIndex]}
          </p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 animate-dial-progress"
              style={{ animationDuration: "2.4s" }}
            />
          </div>
          <p className="text-[10.5px] text-slate-400 tracking-wide">
            56K connection simulated for nostalgia — modern speeds ahead.
          </p>
        </div>
      </div>
    </div>
  );
}