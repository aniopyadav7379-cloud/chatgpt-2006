"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { listNotes, deleteNote, type SavedNote } from "@/lib/desktop/notes";
import { formatTimestamp } from "@/lib/utils";
import { useDesktop } from "../DesktopProvider";

export default function MyDocumentsApp() {
  const { openApp } = useDesktop();
  const [notes, setNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    setNotes(listNotes());
  }, []);

  function refresh() {
    setNotes(listNotes());
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-white/[0.03]">
      {notes.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-16">
          <FileText size={28} className="text-slate-400" />
          <p className="text-[12.5px] text-slate-300 max-w-xs">
            No saved notes yet. Save something from AI Notepad and it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notes.map((n) => (
            <div
              key={n.id}
              className="group flex items-center gap-2.5 rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => openApp("notepad", { data: { noteId: n.id }, forceNew: true })}
            >
              <FileText size={15} className="text-sky-300 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-white truncate">{n.title || "Untitled"}</p>
                <p className="text-[10.5px] text-slate-400">{formatTimestamp(n.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(n.id);
                  refresh();
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}