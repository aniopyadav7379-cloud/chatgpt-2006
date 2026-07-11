"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Loader2, Globe } from "lucide-react";
import toast from "react-hot-toast";

const FAVORITES = ["What is quantum computing?", "Best productivity tips", "Explain black holes", "How does Wi-Fi work?"];

export default function InternetExplorerApp() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ q: string; a: string } | null>(null);
  const [historyStack, setHistoryStack] = useState<{ q: string; a: string }[]>([]);
  const [cursor, setCursor] = useState(-1);

  async function go(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "search-answer", input: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't reach the AI.");
        return;
      }
      const entry = { q: trimmed, a: data.result };
      setResult(entry);
      const nextStack = [...historyStack.slice(0, cursor + 1), entry];
      setHistoryStack(nextStack);
      setCursor(nextStack.length - 1);
      setQuery(trimmed);
    } catch {
      toast.error("Connection lost. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function back() {
    if (cursor <= 0) return;
    setCursor(cursor - 1);
    setResult(historyStack[cursor - 1]);
    setQuery(historyStack[cursor - 1].q);
  }
  function forward() {
    if (cursor >= historyStack.length - 1) return;
    setCursor(cursor + 1);
    setResult(historyStack[cursor + 1]);
    setQuery(historyStack[cursor + 1].q);
  }
  function home() {
    setResult(null);
    setQuery("");
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-300 bg-slate-100">
        <button onClick={back} disabled={cursor <= 0} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600">
          <ArrowLeft size={15} />
        </button>
        <button onClick={forward} disabled={cursor >= historyStack.length - 1} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600">
          <ArrowRight size={15} />
        </button>
        <button onClick={() => result && go(result.q)} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
          <RotateCw size={13} />
        </button>
        <button onClick={home} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
          <Home size={14} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-400 rounded px-2 py-1">
          <Globe size={13} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go(query)}
            placeholder="Ask AI..."
            className="flex-1 text-[12.5px] text-slate-800 outline-none"
          />
        </div>
        <button onClick={() => go(query)} className="xp-button !text-[11px] !px-3 !py-1.5">
          Go
        </button>
      </div>

      <div className="flex gap-1.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50 overflow-x-auto">
        {FAVORITES.map((f) => (
          <button
            key={f}
            onClick={() => go(f)}
            className="text-[10.5px] px-2 py-1 rounded bg-white border border-slate-300 hover:bg-sky-50 text-slate-600 whitespace-nowrap"
          >
            ★ {f}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 text-slate-800">
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}
        {!loading && !result && (
          <div className="text-center py-16 text-slate-400">
            <Globe size={32} className="mx-auto mb-3 text-sky-400" />
            <p className="text-[13px]">Type a question in the address bar to get an AI answer.</p>
          </div>
        )}
        {!loading && result && (
          <div>
            <p className="text-[11px] text-slate-400 mb-1">Results for</p>
            <h1 className="text-[17px] font-semibold text-blue-700 mb-3">{result.q}</h1>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{result.a}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}