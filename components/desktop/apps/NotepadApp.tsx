"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, FileDown, Save, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { listNotes, saveNote, newNoteId } from "@/lib/desktop/notes";
import { exportTxt, exportPdf, exportDoc } from "@/lib/desktop/export";
import PromptTemplateBar from "../PromptTemplateBar";
import type { WindowInstance } from "@/types/desktop";

const AI_ACTIONS = [
  { task: "rewrite", label: "Rewrite" },
  { task: "grammar", label: "Grammar" },
  { task: "summarize", label: "Summarize" },
  { task: "translate", label: "Translate" },
  { task: "explain", label: "Explain" },
] as const;

const MENUS = ["File", "Edit", "View", "Tools", "AI"] as const;

export default function NotepadApp({ win }: { win: WindowInstance }) {
  const noteId = (win.data?.noteId as string | undefined) ?? newNoteId();
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (win.data?.noteId) {
      const found = listNotes().find((n) => n.id === noteId);
      if (found) {
        setTitle(found.title);
        setContent(found.content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave() {
    const derivedTitle = title.trim() || content.trim().slice(0, 30) || "Untitled";
    saveNote({ id: noteId, title: derivedTitle, content });
    setTitle(derivedTitle);
    toast.success("Saved to My Documents.");
  }

  async function runAiAction(task: string) {
    const selection =
      textareaRef.current &&
      textareaRef.current.selectionStart !== textareaRef.current.selectionEnd
        ? content.slice(textareaRef.current.selectionStart, textareaRef.current.selectionEnd)
        : content;

    if (!selection.trim()) {
      toast.error("Write or select some text first.");
      return;
    }

    setBusy(task);
    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, input: selection }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "AI request failed.");
        return;
      }
      setContent((prev) =>
        selection === prev ? data.result : prev.replace(selection, data.result)
      );
      toast.success(`${task[0].toUpperCase()}${task.slice(1)} done.`);
    } catch {
      toast.error("Connection lost. Try again.");
    } finally {
      setBusy(null);
      setOpenMenu(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="flex items-center gap-3 px-3 py-1 border-b border-slate-300 bg-slate-100 text-slate-700 relative">
        {MENUS.map((m) => (
          <div key={m} className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === m ? null : m)}
              className={`text-[11.5px] px-1.5 py-0.5 rounded hover:bg-slate-200 ${openMenu === m ? "bg-slate-200" : ""}`}
            >
              {m}
            </button>
            {openMenu === m && m === "AI" && (
              <div className="absolute left-0 top-6 w-40 py-1 bg-white border border-slate-300 rounded shadow-lg z-20">
                {AI_ACTIONS.map((a) => (
                  <button
                    key={a.task}
                    onClick={() => runAiAction(a.task)}
                    disabled={!!busy}
                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50 disabled:opacity-50"
                  >
                    {busy === a.task ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} className="text-sky-500" />
                    )}
                    {a.label}
                  </button>
                ))}
              </div>
            )}
            {openMenu === m && m === "File" && (
              <div className="absolute left-0 top-6 w-40 py-1 bg-white border border-slate-300 rounded shadow-lg z-20">
                <button onClick={handleSave} className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50">
                  <Save size={12} /> Save
                </button>
                <button onClick={() => { exportTxt(content, `${title}.txt`); setOpenMenu(null); }} className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50">
                  <FileDown size={12} /> Export TXT
                </button>
                <button onClick={() => { exportPdf(content, `${title}.pdf`, title); setOpenMenu(null); }} className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50">
                  <FileDown size={12} /> Export PDF
                </button>
                <button onClick={() => { exportDoc(content, `${title}.doc`, title); setOpenMenu(null); }} className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-sky-50">
                  <FileDown size={12} /> Export DOC
                </button>
              </div>
            )}
          </div>
        ))}
        <div className="flex-1" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-[11.5px] text-right bg-transparent outline-none w-40 text-slate-500"
          placeholder="Untitled"
        />
        <button onClick={handleSave} className="text-[11px] font-medium text-sky-600 hover:underline shrink-0">
          Save
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing... select text and use the AI menu, or leave it all selected."
        className="flex-1 resize-none p-4 text-[13px] text-slate-800 outline-none font-mono leading-relaxed"
        onClick={() => setOpenMenu(null)}
      />

      <PromptTemplateBar
        onPick={(p) => {
          setContent((c) => c + (c ? "\n\n" : "") + p);
          textareaRef.current?.focus();
        }}
      />
    </div>
  );
}