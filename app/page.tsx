"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Zap, Shield, History } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import BootScreen from "@/components/BootScreen";
import Window from "@/components/Window";
import XPButton from "@/components/XPButton";

export default function HomePage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  function handleStart() {
    setConnecting(true);
  }

  if (connecting) {
    return <BootScreen onDone={() => router.push("/chat")} />;
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      <AnimatedBackground />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-8">
        <div className="text-center space-y-3 animate-pop-in">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-sky-300 bg-white/10 border border-white/15 rounded-full px-3 py-1">
            <Sparkles size={12} />
            Est. 2006 · Rebuilt 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
            AI Knowledge Engine <span className="text-sky-300">2006</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
            The nostalgic dial-up era, reimagined with a modern engine under
            the hood. Glossy windows, blue gradients — and a genuinely fast
            AI on the other end of the line.
          </p>
        </div>

        <Window
          title="Welcome.exe"
          icon={<Sparkles size={14} />}
          className="w-[min(92vw,420px)]"
          bodyClassName="p-6 flex flex-col gap-4"
        >
          <div>
            <p className="text-[15px] font-semibold text-white">
              Welcome Back
            </p>
            <p className="text-[12.5px] text-slate-300 mt-1">
              Ask anything. Get an answer before your modem would&apos;ve
              even connected.
            </p>
          </div>
          <XPButton
            onClick={handleStart}
            className="w-full justify-center py-2.5 text-[14px]"
            icon={<ArrowRight size={16} />}
          >
            Start Chat
          </XPButton>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Feature icon={<Zap size={14} />} label="Fast replies" />
            <Feature icon={<History size={14} />} label="Saved history" />
            <Feature icon={<Shield size={14} />} label="No login needed" />
          </div>
        </Window>

        <p className="text-[11px] text-slate-500 max-w-sm text-center">
          Built with Next.js 15, React 19, Tailwind, Prisma, and the Groq
          API.
        </p>
      </div>
    </main>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center px-1 py-2 rounded-lg bg-white/5 border border-white/10">
      <span className="text-sky-300">{icon}</span>
      <span className="text-[10px] text-slate-300 leading-tight">
        {label}
      </span>
    </div>
  );
}
