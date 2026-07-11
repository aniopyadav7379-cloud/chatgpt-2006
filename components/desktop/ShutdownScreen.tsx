"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShutdownScreen() {
  const router = useRouter();
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 450);
    const done = setTimeout(() => router.push("/"), 2600);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
        <p className="text-white/90 text-[15px] font-medium tracking-wide">
          Windows is shutting down{".".repeat(dots)}
        </p>
      </div>
    </div>
  );
}