"use client";

import { useEffect, useState } from "react";
import { Wifi, Volume2 } from "lucide-react";
import { useDesktop } from "./DesktopProvider";
import { APP_ICONS } from "./apps/registry";
import StartMenu from "./StartMenu";

export default function Taskbar() {
  const { windows, focusWindow, minimizeWindow, startMenuOpen, setStartMenuOpen, requestShutdown } =
    useDesktop();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);

  const activeZ = windows.length ? Math.max(...windows.map((w) => w.z)) : -1;

  return (
    <>
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} onShutdown={requestShutdown} />}
      <div
        className="absolute left-0 right-0 bottom-0 h-12 flex items-stretch border-t border-white/20 shadow-[0_-4px_16px_rgba(0,0,0,0.35)] select-none z-[900] desktop-taskbar"
        style={{
          background: "linear-gradient(180deg, #1c3a6e 0%, #0b1739 55%, #081029 100%)",
        }}
      >
        <button
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          className={`flex items-center gap-1.5 px-4 mx-1 my-1.5 rounded-md font-bold text-[13px] text-white italic
            bg-gradient-to-b from-green-400 to-green-600 shadow-xpbutton border border-green-300/60
            hover:brightness-110 active:brightness-95 transition ${startMenuOpen ? "brightness-90" : ""}`}
        >
          <span className="w-4 h-4 rounded-sm bg-white/25 grid grid-cols-2 grid-rows-2 gap-[1px] p-[1.5px]">
            <span className="bg-white/90 rounded-[1px]" />
            <span className="bg-white/70 rounded-[1px]" />
            <span className="bg-white/70 rounded-[1px]" />
            <span className="bg-white/90 rounded-[1px]" />
          </span>
          start
        </button>

        <div className="flex-1 flex items-center gap-1 px-1 overflow-x-auto">
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                if (!w.minimized && w.z === activeZ) minimizeWindow(w.id);
                else focusWindow(w.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 h-8 my-1 rounded-md text-[12px] text-white/95 max-w-[170px]
                border border-white/10 transition-colors shrink-0
                ${!w.minimized && w.z === activeZ ? "bg-white/25 shadow-inner" : "bg-white/10 hover:bg-white/18"}`}
            >
              <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 shrink-0">{APP_ICONS[w.appId]}</span>
              <span className="truncate">{w.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-3 border-l border-white/15 text-white/90">
          <Volume2 size={14} className="opacity-80" />
          <Wifi size={14} className="opacity-80" />
          <span className="text-[12px] font-medium tabular-nums min-w-[52px] text-center">
            {now
              ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
              : "--:--"}
          </span>
        </div>
      </div>
    </>
  );
}