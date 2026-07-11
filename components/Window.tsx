"use client";

import { ReactNode } from "react";
import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WindowProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  onClose?: () => void;
  headerRight?: ReactNode;
}

export default function Window({
  title,
  icon,
  children,
  className,
  bodyClassName,
  onClose,
  headerRight,
}: WindowProps) {
  return (
    <div className={cn("xp-window animate-pop-in", className)}>
      <div className="xp-titlebar">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-[13px] font-semibold tracking-wide truncate drop-shadow-sm">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {headerRight}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              aria-label="Minimize"
              className="w-5 h-5 rounded-[3px] bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              tabIndex={-1}
            >
              <Minus size={11} />
            </button>
            <button
              aria-label="Maximize"
              className="w-5 h-5 rounded-[3px] bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              tabIndex={-1}
            >
              <Square size={9} />
            </button>
            <button
              aria-label="Close window"
              onClick={onClose}
              className="w-5 h-5 rounded-[3px] bg-red-500/70 hover:bg-red-500 flex items-center justify-center transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      </div>
      <div className={cn("bg-transparent", bodyClassName)}>{children}</div>
    </div>
  );
}
