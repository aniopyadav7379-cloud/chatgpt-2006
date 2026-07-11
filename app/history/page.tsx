"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Trash2, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Window from "@/components/Window";
import XPButton from "@/components/XPButton";
import { formatTimestamp } from "@/lib/utils";
import type { ConversationSummary } from "@/types";

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      toast.error("Couldn't load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    const prev = conversations;
    setConversations((c) => c.filter((conv) => conv.id !== id));
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setConversations(prev);
      toast.error("Couldn't delete that conversation.");
    }
  }

  async function handleClearAll() {
    if (conversations.length === 0) return;
    const ok = window.confirm(
      "Clear all conversation history? This can't be undone."
    );
    if (!ok) return;
    const prev = conversations;
    setConversations([]);
    const res = await fetch("/api/history", { method: "DELETE" });
    if (!res.ok) {
      setConversations(prev);
      toast.error("Couldn't clear history.");
    } else {
      toast.success("History cleared.");
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Window
          title="Conversation History"
          icon={<MessageSquareText size={14} />}
          bodyClassName="p-4"
          headerRight={
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/15 transition-colors"
            >
              <Trash2 size={12} />
              Clear All
            </button>
          }
        >
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          )}

          {!loading && conversations.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MessageSquareText size={28} className="text-slate-400" />
              <p className="text-[13px] text-slate-300">
                No conversations yet.
              </p>
              <XPButton onClick={() => router.push("/chat")}>
                Start a chat
              </XPButton>
            </div>
          )}

          <div className="space-y-2">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/chat?c=${c.id}`)}
                className="group flex items-center gap-3 rounded-lg px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-titlebar-gradient flex items-center justify-center shrink-0 shadow-xpbutton">
                  <MessageSquareText size={14} className="text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-100 truncate">
                    {c.title}
                  </p>
                  <p className="text-[11.5px] text-slate-400 truncate">
                    {c.preview || "No messages yet"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {c.messageCount} messages · {formatTimestamp(c.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/30 transition-opacity shrink-0"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={14} className="text-red-300" />
                </button>
                <ArrowRight
                  size={14}
                  className="text-slate-500 shrink-0 hidden sm:block"
                />
              </div>
            ))}
          </div>
        </Window>
      </div>
    </main>
  );
}
