"use client";

import { HardDrive, Bot, FolderClosed, Trash2 } from "lucide-react";
import { useDesktop } from "../DesktopProvider";
import type { AppId } from "@/types/desktop";

const DRIVES: { id: AppId | null; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "assistant", label: "AI Engine (C:)", sub: "Local AI runtime", icon: <HardDrive size={26} /> },
  { id: "my-documents", label: "My Documents (D:)", sub: "Notes & saved files", icon: <FolderClosed size={26} /> },
  { id: "recycle-bin", label: "Recycle Bin (E:)", sub: "Deleted items", icon: <Trash2 size={26} /> },
];

export default function MyComputerApp() {
  const { openApp } = useDesktop();
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-white/[0.03]">
      <div className="flex items-center gap-2 mb-4 text-slate-200">
        <Bot size={16} className="text-sky-300" />
        <p className="text-[12.5px]">System status: Windows XP AI — online</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DRIVES.map((d) => (
          <button
            key={d.label}
            onClick={() => d.id && openApp(d.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <span className="text-sky-300">{d.icon}</span>
            <span className="text-[12px] font-semibold text-white">{d.label}</span>
            <span className="text-[10.5px] text-slate-400">{d.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}