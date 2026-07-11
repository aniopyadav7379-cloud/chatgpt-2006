"use client";

import { Info, Keyboard, MessageCircleQuestion } from "lucide-react";

const FAQS = [
  { q: "What is this desktop?", a: "A Windows XP-styled shell around Windows XP AI — every icon opens a small AI-powered app instead of a real Windows program." },
  { q: "Where did my chats go?", a: "Nowhere — open Windows Intelligence (the AI Assistant) or Conversation History to pick up any thread." },
  { q: "How do I move windows?", a: "Drag the title bar. Drag the bottom-right corner to resize. Double-click the title bar to maximize." },
  { q: "Are my notes saved?", a: "AI Notepad saves to this browser's local storage and shows up in My Documents. Export to TXT, DOC, or PDF to keep a copy elsewhere." },
  { q: "What powers the AI?", a: "Chat completions run through the Groq API via a Next.js API route on the server." },
];

export default function HelpApp() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 bg-white/[0.03]">
      <section className="flex gap-3">
        <Info size={18} className="text-sky-300 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-[13.5px] font-semibold text-white">About this desktop</h2>
          <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">
            A full Windows XP-style desktop — icons, draggable windows, a taskbar, Start menu —
            wrapped around a set of small AI apps: Notepad, Paint, Internet Explorer, Outlook
            Express, and a File Analyzer, all backed by a real LLM.
          </p>
        </div>
      </section>

      <section className="flex gap-3">
        <Keyboard size={18} className="text-sky-300 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-[13.5px] font-semibold text-white">Tips</h2>
          <ul className="text-[12px] text-slate-300 mt-1 space-y-1">
            <li>Double-click a desktop icon to open it, right-click for options.</li>
            <li>Enter sends a chat message · Shift + Enter for a new line.</li>
            <li>Switch themes and font size from Control Panel.</li>
          </ul>
        </div>
      </section>

      <section className="flex gap-3">
        <MessageCircleQuestion size={18} className="text-sky-300 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <h2 className="text-[13.5px] font-semibold text-white">FAQ</h2>
          {FAQS.map((f) => (
            <div key={f.q}>
              <p className="text-[12.5px] font-medium text-slate-100">{f.q}</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}