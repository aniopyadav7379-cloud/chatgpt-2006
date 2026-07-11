"use client";

import { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("pointerdown", onDocPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDocPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const clampedX = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1000) - 180);
  const clampedY = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 800) - items.length * 30 - 60);

  return (
    <div
      ref={ref}
      style={{ left: clampedX, top: clampedY }}
      className="fixed z-[999] w-44 py-1 rounded-md glass-panel bg-slate-900/95 border border-white/15 shadow-xpwindow animate-pop-in"
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.divider && <div className="my-1 h-px bg-white/10" />}
          <button
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onSelect();
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 text-[12.5px] text-slate-100 hover:bg-sky-500/30 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}