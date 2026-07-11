"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Minus, Square, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesktop } from "./DesktopProvider";
import { APP_ICONS } from "./apps/registry";
import type { WindowInstance } from "@/types/desktop";

export default function DesktopWindow({
  win,
  children,
}: {
  win: WindowInstance;
  children: React.ReactNode;
}) {
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, updateWindowRect } =
    useDesktop();
  const dragOrigin = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);

  if (win.minimized) return null;

  const rectStyle = win.maximized
    ? { left: 6, top: 6, right: 6, bottom: 54, width: "auto", height: "auto" }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  function onTitlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("[data-titlebar-btn]")) return;
    focusWindow(win.id);
    if (win.maximized) return;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
  }

  function onDragMove(e: PointerEvent) {
    const o = dragOrigin.current;
    if (!o) return;
    const x = Math.max(-40, o.wx + (e.clientX - o.mx));
    const y = Math.max(0, o.wy + (e.clientY - o.my));
    updateWindowRect(win.id, { x, y });
  }

  function onDragEnd() {
    dragOrigin.current = null;
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
  }

  function onResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    focusWindow(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.w;
    const startH = win.h;
    function onMove(ev: PointerEvent) {
      const w = Math.max(340, startW + (ev.clientX - startX));
      const h = Math.max(240, startH + (ev.clientY - startY));
      updateWindowRect(win.id, { w, h });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="absolute xp-window flex flex-col"
      style={{ ...rectStyle, zIndex: win.z }}
      onPointerDownCapture={() => focusWindow(win.id)}
    >
      <div
        className="xp-titlebar cursor-move touch-none"
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white/90 [&>svg]:w-3.5 [&>svg]:h-3.5">
            {APP_ICONS[win.appId]}
          </span>
          <span className="text-[13px] font-semibold tracking-wide truncate drop-shadow-sm">
            {win.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            data-titlebar-btn
            aria-label="Minimize"
            onClick={() => minimizeWindow(win.id)}
            className="w-5 h-5 rounded-[3px] bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <Minus size={11} />
          </button>
          <button
            data-titlebar-btn
            aria-label={win.maximized ? "Restore" : "Maximize"}
            onClick={() => toggleMaximize(win.id)}
            className="w-5 h-5 rounded-[3px] bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            {win.maximized ? <Copy size={9} /> : <Square size={9} />}
          </button>
          <button
            data-titlebar-btn
            aria-label="Close window"
            onClick={() => closeWindow(win.id)}
            className="w-5 h-5 rounded-[3px] bg-red-500/70 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      </div>
      <div className={cn("flex-1 min-h-0 overflow-hidden bg-transparent flex flex-col")}>
        {children}
      </div>
      {!win.maximized && (
        <div
          onPointerDown={onResizePointerDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-60 hover:opacity-100"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1.5px, transparent 1.5px 4px)",
          }}
        />
      )}
    </motion.div>
  );
}