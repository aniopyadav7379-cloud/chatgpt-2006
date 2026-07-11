"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, History, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/history", label: "History", icon: History },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav className="mx-auto max-w-5xl glass-panel rounded-xl px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-md bg-titlebar-gradient flex items-center justify-center shadow-xpbutton">
            <Sparkles size={14} className="text-white" />
          </span>
          <span className="font-bold text-[13px] tracking-wide text-slate-100 group-hover:text-sky-300 transition-colors">
            AI Knowledge Engine <span className="text-sky-300">2006</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors",
                  active
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
