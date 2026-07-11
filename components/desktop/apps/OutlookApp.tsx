"use client";

import { useState } from "react";
import { Mail, Loader2, Copy, FileDown, Send } from "lucide-react";
import toast from "react-hot-toast";
import { exportTxt, exportDoc } from "@/lib/desktop/export";

const TYPES = [
  { task: "email", label: "Email" },
  { task: "resume", label: "Resume" },
  { task: "coverletter", label: "Cover Letter" },
  { task: "reply", label: "Reply" },
] as const;

export default function OutlookApp() {
  const [task, setTask] = useState<(typeof TYPES)[number]["task"]>("email");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!prompt.trim()) {
      toast.error("Describe what you want first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, input: prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Generation failed.");
        return;
      }
      setDraft(data.result);
    } catch {
      toast.error("Connection lost. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white text-slate-800">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-300 bg-slate-100">
        <Mail size={15} className="text-blue-700" />
        <span className="text-[12px] font-semibold">New Message</span>
      </div>

      <div className="p-3 space-y-2 border-b border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.task}
              onClick={() => setTask(t.task)}
              className={`text-[11.5px] px-2.5 py-1 rounded border transition-colors ${
                task === t.task
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            task === "email"
              ? "e.g. Ask my manager for two days of PTO next week"
              : task === "resume"
              ? "e.g. 3 years as a frontend developer, React and TypeScript, led a team of 2"
              : task === "coverletter"
              ? "e.g. Applying for a Frontend Engineer role at a fintech startup"
              : "Paste the message you're replying to, plus your intent"
          }
          rows={3}
          className="w-full resize-none rounded border border-slate-300 px-2.5 py-2 text-[12.5px] outline-none focus:ring-2 focus:ring-sky-300"
        />
        <button onClick={generate} disabled={busy} className="xp-button !text-[12px] disabled:opacity-60">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Generate
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {!draft && !busy && (
          <p className="text-[12.5px] text-slate-400 text-center py-10">
            Your generated draft will appear here, styled like a reading pane.
          </p>
        )}
        {draft && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 whitespace-pre-wrap text-[13px] leading-relaxed">
            {draft}
          </div>
        )}
      </div>

      {draft && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-200 bg-slate-100">
          <button
            onClick={() => {
              navigator.clipboard.writeText(draft);
              toast.success("Copied to clipboard.");
            }}
            className="flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50"
          >
            <Copy size={12} /> Copy
          </button>
          <button
            onClick={() => exportTxt(draft, `${task}.txt`)}
            className="flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50"
          >
            <FileDown size={12} /> TXT
          </button>
          <button
            onClick={() => exportDoc(draft, `${task}.doc`, task)}
            className="flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50"
          >
            <FileDown size={12} /> DOC
          </button>
        </div>
      )}
    </div>
  );
}