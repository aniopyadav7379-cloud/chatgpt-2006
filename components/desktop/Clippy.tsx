"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDesktop } from "./DesktopProvider";

const TIPS = [
  "Need help? I can open the AI Assistant for you.",
  "Tip: double-click any desktop icon to open it.",
  "Try AI Notepad — it can rewrite or summarize your text.",
  "Drag any window by its title bar to move it around.",
];

export default function Clippy() {
  const { openApp } = useDesktop();
  const [visible, setVisible] = useState(false);
  const [tip, setTip] = useState(TIPS[0]);

  useEffect(() => {
    const t = setTimeout(() => {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
      setVisible(true);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-16 right-5 z-[850] flex flex-col items-end gap-2 animate-pop-in">
      <div className="relative max-w-[220px] glass-panel bg-white/95 text-slate-800 rounded-xl rounded-br-sm px-3.5 py-2.5 shadow-xpwindow">
        <button
          onClick={() => setVisible(false)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-900"
          aria-label="Dismiss"
        >
          <X size={11} />
        </button>
        <p className="text-[12px] leading-snug font-medium">{tip}</p>
        <button
          onClick={() => {
            openApp("assistant");
            setVisible(false);
          }}
          className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline"
        >
          Open AI Chat →
        </button>
      </div>
      <button
        onClick={() => {
          setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
          setVisible(true);
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-xpbutton border border-yellow-100 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        aria-label="Clippy — Need help?"
        title="Need help?"
      >
        📎
      </button>
    </div>
  );
}