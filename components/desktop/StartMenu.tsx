"use client";

import { useEffect, useRef } from "react";
import { Power, Sparkles } from "lucide-react";
import { useDesktop } from "./DesktopProvider";
import { APP_ICONS, APP_REGISTRY, START_MENU_ORDER } from "./apps/registry";
import type { AppId } from "@/types/desktop";

export default function StartMenu({
  onClose,
  onShutdown,
}: {
  onClose: () => void;
  onShutdown: () => void;
}) {
  const { openApp } = useDesktop();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    window.addEventListener("pointerdown", onDocPointerDown);
    return () => window.removeEventListener("pointerdown", onDocPointerDown);
  }, [onClose]);

  function launch(id: AppId) {
    openApp(id);
    onClose();
  }

  return (
    <div
      ref={ref}
      className="absolute left-1 bottom-14 w-72 glass-panel bg-slate-900/95 border border-white/15 rounded-lg shadow-xpwindow overflow-hidden z-[950] animate-pop-in"
    >
      <div className="px-4 py-3 bg-titlebar-gradient flex items-center gap-2">
        <Sparkles size={16} className="text-white" />
        <span className="text-[13px] font-bold text-white">Windows XP AI</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto py-1.5">
        {START_MENU_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => launch(id)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-slate-100 hover:bg-sky-500/25 transition-colors"
          >
            <span className="text-sky-300 [&>svg]:w-4 [&>svg]:h-4">{APP_ICONS[id]}</span>
            {APP_REGISTRY[id].title}
          </button>
        ))}
      </div>
      <div className="border-t border-white/10 px-2 py-1.5">
        <button
          onClick={onShutdown}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-[12.5px] text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
        >
          <Power size={15} />
          Shut Down...
        </button>
      </div>
    </div>
  );
}