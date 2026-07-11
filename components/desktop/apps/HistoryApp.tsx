"use client";

import { useCallback, useEffect, useState } from "react";
import { Pin, Star, Trash2, Loader2, MessageSquareText } from "lucide-react";
import toast from "react-hot-toast";
import { formatTimestamp } from "@/lib/utils";
import { getAllMeta, togglePin, toggleFavorite, type ConversationMeta } from "@/lib/desktop/pins";
import { useDesktop } from "../DesktopProvider";
import type { ConversationSummary } from "@/types";

export default function HistoryApp() {
  const { openApp } = useDesktop();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [meta, setMeta] = useState<Record<string, ConversationMeta>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pinned" | "favorite">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setMeta(getAllMeta());
    } catch {
      toast.error("Couldn't load conversation history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    const prev = conversations;
    setConversations((c) => c.filter((x) => x.id !== id));
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setConversations(prev);
      toast.error("Couldn't delete that conversation.");
    }
  }

  const visible = conversations.filter((c) => {
    if (filter === "pinned") return meta[c.id]?.pinned;
    if (filter === "favorite") return meta[c.id]?.favorite;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/[0.03]">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
        {(["all", "pinned", "favorite"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors capitalize ${
              filter === f
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        {!loading && visible.length === 0 && (
          <p className="text-[12px] text-slate-400 text-center px-3 py-8">Nothing here yet.</p>
        )}
        {visible.map((c) => (
          <div
            key={c.id}
            className="group flex items-center gap-2 rounded-lg px-2.5 py-2 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => openApp("assistant", { data: { conversationId: c.id }, forceNew: true })}
          >
            <MessageSquareText size={14} className="text-sky-300 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-white truncate">{c.title}</p>
              <p className="text-[10.5px] text-slate-400">{formatTimestamp(c.updatedAt)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMeta({ ...meta, [c.id]: togglePin(c.id) });
              }}
              className={`shrink-0 ${meta[c.id]?.pinned ? "text-sky-300" : "text-slate-500 opacity-0 group-hover:opacity-100"}`}
            >
              <Pin size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMeta({ ...meta, [c.id]: toggleFavorite(c.id) });
              }}
              className={`shrink-0 ${meta[c.id]?.favorite ? "text-amber-300" : "text-slate-500 opacity-0 group-hover:opacity-100"}`}
            >
              <Star size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(c.id);
              }}
              className="shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}