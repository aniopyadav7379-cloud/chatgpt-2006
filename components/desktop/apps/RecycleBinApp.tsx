"use client";

import { Trash2 } from "lucide-react";
import { useDesktop } from "../DesktopProvider";

export default function RecycleBinApp() {
  const { notify } = useDesktop();
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 p-6 bg-white/[0.03] text-center">
      <Trash2 size={36} className="text-slate-400" />
      <p className="text-[13px] text-slate-200 font-medium">Recycle Bin is empty</p>
      <p className="text-[11.5px] text-slate-400 max-w-xs">
        Deleted conversations and notes are removed permanently — nothing to restore here.
      </p>
      <button
        onClick={() => notify("Recycle Bin", "There was nothing to empty.")}
        className="xp-button-ghost mt-1"
      >
        Empty Recycle Bin
      </button>
    </div>
  );
}