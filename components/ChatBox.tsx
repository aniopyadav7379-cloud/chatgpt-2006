"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Bot, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import TypingAnimation, { TypingIndicatorDots } from "./TypingAnimation";
import Window from "./Window";
import type { ChatMessage } from "@/types";

interface ChatBoxProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
  onCleared: () => void;
}

export default function ChatBox({
  conversationId,
  onConversationCreated,
  onCleared,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!conversationId) {
        setMessages([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/history/${conversationId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setMessages(data.conversation.messages);
          setAnimatingId(null);
        }
      } catch {
        if (!cancelled) toast.error("Couldn't load that conversation.");
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const optimisticUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "The AI engine didn't respond.");
        if (data.conversationId && !conversationId) {
          onConversationCreated(data.conversationId);
        }
        return;
      }

      if (!conversationId) {
        onConversationCreated(data.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setAnimatingId(assistantMsg.id);
    } catch {
      toast.error("Connection lost. Check your network and try again.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleClear() {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const res = await fetch(`/api/history/${conversationId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessages([]);
      onCleared();
      toast.success("Conversation cleared.");
    } else {
      toast.error("Couldn't clear this conversation.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Window
      title="AI Knowledge Engine — Conversation"
      icon={<Bot size={14} />}
      className="flex-1 flex flex-col min-h-0"
      bodyClassName="flex-1 flex flex-col min-h-0"
      headerRight={
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/15 transition-colors"
        >
          <Trash2 size={12} />
          Clear
        </button>
      }
    >
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-3.5"
      >
        {loadingHistory && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-16">
            <Bot size={32} className="text-sky-300" />
            <p className="text-[13px] text-slate-300 max-w-xs">
              Ask anything. Your AI Knowledge Engine is online and ready to
              help — just like it&apos;s 2006, but faster.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex items-end gap-2">
            {m.role === "assistant" && (
              <span className="w-6 h-6 rounded-full bg-titlebar-gradient flex items-center justify-center shrink-0 shadow-xpbutton">
                <Bot size={12} className="text-white" />
              </span>
            )}
            <div
              className={
                m.role === "user" ? "msn-bubble-user" : "msn-bubble-ai"
              }
            >
              {m.role === "assistant" && animatingId === m.id ? (
                <TypingAnimation
                  text={m.content}
                  onDone={() => setAnimatingId(null)}
                />
              ) : (
                <span className="whitespace-pre-wrap break-words">
                  {m.content}
                </span>
              )}
            </div>
            {m.role === "user" && (
              <span className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center shrink-0 shadow-xpbutton">
                <User size={12} className="text-white" />
              </span>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-end gap-2">
            <span className="w-6 h-6 rounded-full bg-titlebar-gradient flex items-center justify-center shrink-0 shadow-xpbutton">
              <Bot size={12} className="text-white" />
            </span>
            <div className="msn-bubble-ai">
              <TypingIndicatorDots />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3 bg-white/[0.03]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 resize-none rounded-lg bg-white/10 border border-white/15 px-3 py-2.5 text-[13px]
              text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60
              max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="xp-button h-[42px] px-3.5"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 px-1">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </Window>
  );
}
