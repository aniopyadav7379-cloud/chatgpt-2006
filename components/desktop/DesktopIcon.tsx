"use client";

import { useRef, useState } from "react";
import type { AppId } from "@/types/desktop";
import { APP_ICONS } from "./apps/registry";
import { useDesktop } from "./DesktopProvider";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";

export default function DesktopIcon({
  appId,
  label,
  gridPos,
}: {
  appId: AppId;
  label: string;
  gridPos: { row: number; col: number };
}) {
  const { openApp } = useDesktop();
  const [pos, setPos] = useState({ x: 24 + gridPos.col * 96, y: 24 + gridPos.row * 100 });
  const [selected, setSelected] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const dragOrigin = useRef<{ mx: number; my: number; ix: number; iy: number } | null>(null);
  const movedRef = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    setSelected(true);
    movedRef.current = false;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ix: pos.x, iy: pos.y };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  function onMove(e: PointerEvent) {
    const o = dragOrigin.current;
    if (!o) return;
    const dx = e.clientX - o.mx;
    const dy = e.clientY - o.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
    setPos({ x: Math.max(4, o.ix + dx), y: Math.max(4, o.iy + dy) });
  }
  function onUp() {
    dragOrigin.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }

  function open() {
    openApp(appId);
  }

  const items: ContextMenuItem[] = [
    { label: "Open", onSelect: open },
    { label: "Rename", onSelect: () => {}, disabled: true },
    { label: "Properties", onSelect: () => {}, disabled: true },
  ];

  return (
    <>
      <button
        style={{ left: pos.x, top: pos.y }}
        className="absolute w-20 flex flex-col items-center gap-1 group select-none outline-none"
        onPointerDown={onPointerDown}
        onDoubleClick={open}
        onClick={() => {
          if (!movedRef.current) setSelected(true);
        }}
        onBlur={() => setSelected(false)}
        onContextMenu={(e) => {
          e.preventDefault();
          setSelected(true);
          setMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <div
          className={`w-11 h-11 rounded-md flex items-center justify-center text-white shadow-xpbutton
            bg-gradient-to-b from-white/25 to-white/5 border border-white/25
            ${selected ? "ring-2 ring-sky-300/80 bg-sky-400/20" : "group-hover:bg-white/15"}`}
        >
          {APP_ICONS[appId]}
        </div>
        <span
          className={`text-[11px] text-white text-center leading-tight px-1 rounded drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]
            ${selected ? "bg-sky-500/70" : ""}`}
        >
          {label}
        </span>
      </button>
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} />
      )}
    </>
  );
}