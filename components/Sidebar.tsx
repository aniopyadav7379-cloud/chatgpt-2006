"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, MessageSquareText, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatTimestamp } from "@/lib/utils";
import type { ConversationSummary } from "@/types";

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  refreshKey: number;
}

export default function Sidebar({
  activeId,
  onSelect,
  onNewChat,
  refreshKey,
}: SidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      toast.error("Couldn't load conversation history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const prev = conversations;
    setConversations((c) => c.filter((conv) => conv.id !== id));
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setConversations(prev);
      toast.error("Couldn't delete that conversation.");
    } else if (activeId === id) {
      onNewChat();
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 glass-panel rounded-xpwin overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNewChat}
          className="xp-button w-full justify-center"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <p className="text-[12px] text-slate-400 text-center px-3 py-6">
            No conversations yet. Start one to see it here.
          </p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "group w-full text-left rounded-lg px-3 py-2.5 transition-colors flex items-start gap-2",
              activeId === c.id
                ? "bg-white/20 shadow-inner"
                : "hover:bg-white/10"
            )}
          >
            <MessageSquareText
              size={14}
              className="mt-0.5 shrink-0 text-sky-300"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-slate-100 truncate">
                {c.title}
              </span>
              <span className="block text-[10.5px] text-slate-400 truncate">
                {formatTimestamp(c.updatedAt)}
              </span>
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => handleDelete(e, c.id)}
              className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-red-500/30 transition-opacity"
              aria-label="Delete conversation"
            >
              <Trash2 size={12} className="text-red-300" />
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
