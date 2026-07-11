"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, MessageSquareText, FileText, Star } from "lucide-react";
import { listNotes, type SavedNote } from "@/lib/desktop/notes";
import { getAllMeta } from "@/lib/desktop/pins";
import { useDesktop } from "../DesktopProvider";
import type { ConversationSummary } from "@/types";

export default function SearchApp() {
  const { openApp } = useDesktop();
  const [q, setQ] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => {});
    setNotes(listNotes());
  }, []);

  const meta = getAllMeta();
  const lower = q.trim().toLowerCase();

  const matchedConvos = lower
    ? conversations.filter(
        (c) => c.title.toLowerCase().includes(lower) || c.preview.toLowerCase().includes(lower)
      )
    : conversations.filter((c) => meta[c.id]?.favorite || meta[c.id]?.pinned);

  const matchedNotes = lower
    ? notes.filter((n) => n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower))
    : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/[0.03]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
        <SearchIcon size={14} className="text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find chats, notes, files..."
          className="flex-1 bg-transparent text-[13px] text-slate-100 placeholder:text-slate-500 outline-none"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
        {!lower && (
          <p className="text-[11px] uppercase tracking-wide text-slate-500 px-1">
            ⭐ Favorites & Pins
          </p>
        )}
        <div className="space-y-1">
          {matchedConvos.length === 0 && lower && (
            <p className="text-[12px] text-slate-500 px-1">No conversations match.</p>
          )}
          {matchedConvos.map((c) => (
            <button
              key={c.id}
              onClick={() => openApp("assistant", { data: { conversationId: c.id }, forceNew: true })}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
            >
              <MessageSquareText size={14} className="text-sky-300 shrink-0" />
              <span className="text-[12.5px] text-white truncate flex-1">{c.title}</span>
              {meta[c.id]?.favorite && <Star size={11} className="text-amber-300 shrink-0" />}
            </button>
          ))}
        </div>

        {lower && (
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 px-1">Notes</p>
            {matchedNotes.length === 0 && <p className="text-[12px] text-slate-500 px-1">No notes match.</p>}
            {matchedNotes.map((n) => (
              <button
                key={n.id}
                onClick={() => openApp("notepad", { data: { noteId: n.id }, forceNew: true })}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <FileText size={14} className="text-sky-300 shrink-0" />
                <span className="text-[12.5px] text-white truncate">{n.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}