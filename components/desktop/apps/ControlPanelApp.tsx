"use client";

import { Palette, Type, Volume2, Monitor, MousePointer2 } from "lucide-react";
import { useDesktop } from "../DesktopProvider";
import type { ThemeId } from "@/types/desktop";

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "xp-blue", label: "Windows XP Blue", swatch: "linear-gradient(135deg,#3b82f6,#1544ad)" },
  { id: "xp-olive", label: "Windows XP Olive", swatch: "linear-gradient(135deg,#9acb5a,#4f7a29)" },
  { id: "xp-silver", label: "Windows XP Silver", swatch: "linear-gradient(135deg,#a9b4c0,#5f6d80)" },
  { id: "classic", label: "Windows Classic", swatch: "linear-gradient(135deg,#10287a,#0a1e63)" },
  { id: "win98", label: "Windows 98", swatch: "linear-gradient(135deg,#01098a,#1084d0)" },
];

export default function ControlPanelApp() {
  const {
    theme,
    setTheme,
    fontScale,
    setFontScale,
    crtEnabled,
    setCrtEnabled,
    cursorTrailEnabled,
    setCursorTrailEnabled,
  } = useDesktop();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5 bg-white/[0.03]">
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Palette size={14} className="text-sky-300" />
          <h3 className="text-[12.5px] font-semibold text-white">Theme</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                theme === t.id ? "border-sky-400 bg-sky-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="w-5 h-5 rounded-full shrink-0" style={{ backgroundImage: t.swatch }} />
              <span className="text-[11.5px] text-slate-200">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <Type size={14} className="text-sky-300" />
          <h3 className="text-[12.5px] font-semibold text-white">Font size</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.85}
            max={1.25}
            step={0.05}
            value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-[11px] text-slate-300 w-10 text-right">{Math.round(fontScale * 100)}%</span>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <Monitor size={14} className="text-sky-300" />
          <h3 className="text-[12.5px] font-semibold text-white">CRT monitor effect</h3>
        </div>
        <Toggle checked={crtEnabled} onChange={setCrtEnabled} label="Subtle scanline overlay" />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <MousePointer2 size={14} className="text-sky-300" />
          <h3 className="text-[12.5px] font-semibold text-white">Cursor trail</h3>
        </div>
        <Toggle checked={cursorTrailEnabled} onChange={setCursorTrailEnabled} label="Glowing XP-style trail" />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <Volume2 size={14} className="text-sky-300" />
          <h3 className="text-[12.5px] font-semibold text-white">Sound effects</h3>
        </div>
        <Toggle checked={false} onChange={() => {}} label="Coming soon — no sound files bundled yet" disabled />
      </section>

      <section>
        <h3 className="text-[12.5px] font-semibold text-white mb-1">AI model</h3>
        <p className="text-[11.5px] text-slate-400">
          Powered by Groq · configured via <code className="text-slate-300">GROQ_MODEL</code> in .env.local
        </p>
      </section>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2.5 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
          checked ? "bg-sky-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-[11.5px] text-slate-300">{label}</span>
    </label>
  );
}