"use client";

const TEMPLATES: { label: string; prompt: string }[] = [
  { label: "Summarize", prompt: "Summarize the following:\n\n" },
  { label: "Explain", prompt: "Explain this simply:\n\n" },
  { label: "Code", prompt: "Write code for:\n\n" },
  { label: "Email", prompt: "Write a professional email about:\n\n" },
  { label: "Resume", prompt: "Write resume bullet points for:\n\n" },
  { label: "Translate", prompt: "Translate this to Spanish:\n\n" },
  { label: "SQL", prompt: "Write a SQL query that:\n\n" },
  { label: "Blog", prompt: "Write a short blog post about:\n\n" },
];

export default function PromptTemplateBar({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-white/10 bg-white/[0.02]">
      {TEMPLATES.map((t) => (
        <button
          key={t.label}
          onClick={() => onPick(t.prompt)}
          className="text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-white/8 border border-white/15 text-slate-200 hover:bg-sky-500/25 hover:border-sky-400/40 transition-colors"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}