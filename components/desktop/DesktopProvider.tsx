"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import type { AppId, ThemeId, WindowInstance } from "@/types/desktop";
import { APP_REGISTRY } from "./apps/registry";

interface OpenOptions {
  title?: string;
  data?: Record<string, unknown>;
  forceNew?: boolean;
}

interface DesktopContextValue {
  windows: WindowInstance[];
  openApp: (appId: AppId, opts?: OpenOptions) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindowRect: (
    id: string,
    rect: Partial<{ x: number; y: number; w: number; h: number }>
  ) => void;

  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  crtEnabled: boolean;
  setCrtEnabled: (b: boolean) => void;
  cursorTrailEnabled: boolean;
  setCursorTrailEnabled: (b: boolean) => void;

  startMenuOpen: boolean;
  setStartMenuOpen: (b: boolean) => void;

  notify: (title: string, body?: string) => void;
  shuttingDown: boolean;
  requestShutdown: () => void;
}

const DesktopContext = createContext<DesktopContextValue | null>(null);

export function useDesktop() {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error("useDesktop must be used inside <DesktopProvider>");
  return ctx;
}

const SESSION_KEY = "xp2006:session";
const THEME_KEY = "xp2006:theme";
const FONT_KEY = "xp2006:fontScale";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `win-${Date.now()}-${idCounter}`;
}

export default function DesktopProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const zRef = useRef(10);
  const [theme, setThemeState] = useState<ThemeId>("xp-blue");
  const [fontScale, setFontScaleState] = useState(1);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [cursorTrailEnabled, setCursorTrailEnabled] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  const restored = useRef(false);

  // Restore theme/font + last session's open apps ("Save Session")
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const t = localStorage.getItem(THEME_KEY) as ThemeId | null;
      if (t) setThemeState(t);
      const f = localStorage.getItem(FONT_KEY);
      if (f) setFontScaleState(parseFloat(f));
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const appIds = JSON.parse(raw) as AppId[];
        appIds.forEach((id, i) => {
          if (APP_REGISTRY[id]) openAppInternal(id, undefined, i);
        });
      }
    } catch {
      // ignore corrupt storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist open app list whenever it changes (lightweight session save)
  useEffect(() => {
    try {
      const ids = windows.filter((w) => !w.minimized).map((w) => w.appId);
      localStorage.setItem(SESSION_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [windows]);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // ignore
    }
  }, []);

  const setFontScale = useCallback((n: number) => {
    setFontScaleState(n);
    try {
      localStorage.setItem(FONT_KEY, String(n));
    } catch {
      // ignore
    }
  }, []);

  function openAppInternal(appId: AppId, opts?: OpenOptions, offsetIndex = 0) {
    const def = APP_REGISTRY[appId];
    if (!def) return "";
    zRef.current += 1;
    const id = nextId();
    const cascade = (offsetIndex % 6) * 26;
    setWindows((prev) => {
      if (def.singleton && !opts?.forceNew) {
        const existing = prev.find((w) => w.appId === appId);
        if (existing) {
          zRef.current += 1;
          return prev.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, z: zRef.current, data: opts?.data ?? w.data }
              : w
          );
        }
      }
      const win: WindowInstance = {
        id,
        appId,
        title: opts?.title || def.title,
        x: 90 + cascade,
        y: 70 + cascade,
        w: def.defaultSize.w,
        h: def.defaultSize.h,
        z: zRef.current,
        minimized: false,
        maximized: false,
        data: opts?.data,
      };
      return [...prev, win];
    });
    return id;
  }

  const openApp = useCallback((appId: AppId, opts?: OpenOptions) => {
    return openAppInternal(appId, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    zRef.current += 1;
    const z = zRef.current;
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          const prevRect = w.prevRect ?? { x: 90, y: 70, w: 640, h: 460 };
          return { ...w, maximized: false, ...prevRect, prevRect: undefined };
        }
        return {
          ...w,
          maximized: true,
          prevRect: { x: w.x, y: w.y, w: w.w, h: w.h },
        };
      })
    );
  }, []);

  const updateWindowRect = useCallback(
    (id: string, rect: Partial<{ x: number; y: number; w: number; h: number }>) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...rect } : w)));
    },
    []
  );

  const notify = useCallback((title: string, body?: string) => {
    toast.custom(
      () => (
        <div className="xp-window w-72 shadow-glow">
          <div className="xp-titlebar !py-1">
            <span className="text-[11px] font-semibold">Windows AI says</span>
          </div>
          <div className="px-3 py-2.5 bg-white/[0.04]">
            <p className="text-[12.5px] font-semibold text-white">{title}</p>
            {body && <p className="text-[11.5px] text-slate-300 mt-0.5">{body}</p>}
          </div>
        </div>
      ),
      { duration: 3200 }
    );
  }, []);

  const requestShutdown = useCallback(() => {
    setShuttingDown(true);
  }, []);

  const value = useMemo<DesktopContextValue>(
    () => ({
      windows,
      openApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      toggleMaximize,
      updateWindowRect,
      theme,
      setTheme,
      fontScale,
      setFontScale,
      crtEnabled,
      setCrtEnabled,
      cursorTrailEnabled,
      setCursorTrailEnabled,
      startMenuOpen,
      setStartMenuOpen,
      notify,
      shuttingDown,
      requestShutdown,
    }),
    [
      windows,
      openApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      toggleMaximize,
      updateWindowRect,
      theme,
      setTheme,
      fontScale,
      setFontScale,
      crtEnabled,
      cursorTrailEnabled,
      startMenuOpen,
      notify,
      shuttingDown,
      requestShutdown,
    ]
  );

  return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>;
}