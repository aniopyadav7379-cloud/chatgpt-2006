"use client";

import { AnimatePresence } from "framer-motion";
import { useDesktop } from "./DesktopProvider";
import { APP_REGISTRY, DESKTOP_ICON_ORDER } from "./apps/registry";
import AuroraWallpaper from "./AuroraWallpaper";
import DesktopIcon from "./DesktopIcon";
import DesktopWindow from "./DesktopWindow";
import AppWindowContent from "./AppWindowContent";
import Taskbar from "./Taskbar";
import Clippy from "./Clippy";
import CrtOverlay from "./CrtOverlay";
import CursorTrail from "./CursorTrail";
import ShutdownScreen from "./ShutdownScreen";
import "./desktop-themes.css";

export default function Desktop() {
  const { windows, theme, fontScale, crtEnabled, cursorTrailEnabled, shuttingDown, setStartMenuOpen } =
    useDesktop();

  if (shuttingDown) return <ShutdownScreen />;

  return (
    <div
      data-desktop-theme={theme}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ fontSize: `${fontScale * 100}%` }}
      onPointerDown={() => setStartMenuOpen(false)}
    >
      <AuroraWallpaper />
      <div className="absolute inset-0 desktop-tint pointer-events-none" />

      {/* Desktop icon grid */}
      <div className="absolute inset-0 pt-2">
        {DESKTOP_ICON_ORDER.map((id, i) => (
          <DesktopIcon
            key={id}
            appId={id}
            label={APP_REGISTRY[id].title}
            gridPos={{ row: i, col: 0 }}
          />
        ))}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows.map((w) => (
          <DesktopWindow key={w.id} win={w}>
            <AppWindowContent win={w} />
          </DesktopWindow>
        ))}
      </AnimatePresence>

      {crtEnabled && <CrtOverlay />}
      {cursorTrailEnabled && <CursorTrail />}

      <Clippy />
      <Taskbar />
    </div>
  );
}