"use client";

import { useRef, useState } from "react";
import { FileSearch2, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const TASKS = [
  { task: "summarize", label: "Summarize" },
  { task: "explain", label: "Explain" },
  { task: "extract", label: "Extract points" },
  { task: "qa", label: "Q&A" },
] as const;

export default function FileAnalyzerApp() {
  const [file, setFile] = useState<File | null>(null);
  const [task, setTask] = useState<(typeof TASKS)[number]["task"]>("summarize");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function run() {
    if (!file) {
      toast.error("Choose a PDF, DOCX, or TXT file first.");
      return;
    }
    if (task === "qa" && !question.trim()) {
      toast.error("Type a question to ask about the document.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("task", task);
      if (task === "qa") form.append("question", question);
      const res = await fetch("/api/file-analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't analyze that file.");
        return;
      }
      setResult(data.result);
    } catch {
      toast.error("Connection lost. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/[0.03] p-4 gap-3 overflow-y-auto">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-white/20 hover:border-sky-400/50 cursor-pointer transition-colors"
      >
        <Upload size={24} className="text-sky-300" />
        <p className="text-[12.5px] text-slate-200">
          {file ? file.name : "Click to choose a PDF, DOCX, or TXT file"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TASKS.map((t) => (
          <button
            key={t.task}
            onClick={() => setTask(t.task)}
            className={`text-[11.5px] px-2.5 py-1 rounded border transition-colors ${
              task === t.task
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {task === "qa" && (
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document..."
          className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-[12.5px] text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400/60"
        />
      )}

      <button onClick={run} disabled={busy} className="xp-button self-start !text-[12px] disabled:opacity-60">
        {busy ? <Loader2 size={13} className="animate-spin" /> : <FileSearch2 size={13} />}
        Analyze
      </button>

      {result && (
        <div className="rounded-lg bg-white/5 border border-white/10 p-3.5 text-[12.5px] text-slate-100 whitespace-pre-wrap leading-relaxed">
          {result}
        </div>
      )}
    </div>
  );
}