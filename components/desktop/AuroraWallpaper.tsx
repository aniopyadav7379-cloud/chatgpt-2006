"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop-shell wallpaper: builds on the site's aurora-mesh idea with XP
 * particles, drifting light rays, and subtle mouse parallax. Kept as its own
 * component so the original AnimatedBackground (used on the landing/chat
 * pages) stays untouched.
 */
export default function AuroraWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layer1 = useRef<HTMLDivElement>(null);
  const layer2 = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const PARTICLES = 60;
    const particles = Array.from({ length: PARTICLES }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.6,
      vy: -(Math.random() * 0.00025 + 0.00008),
      drift: (Math.random() - 0.5) * 0.00015,
      twinkle: Math.random() * Math.PI * 2,
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.drift;
        p.twinkle += 0.03;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        const alpha = 0.25 + Math.sin(p.twinkle) * 0.2;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0, alpha)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      if (layer1.current) layer1.current.style.transform = `translate3d(${nx * -14}px, ${ny * -14}px, 0)`;
      if (layer2.current) layer2.current.style.transform = `translate3d(${nx * 22}px, ${ny * 22}px, 0)`;
      if (raysRef.current) raysRef.current.style.transform = `rotate(${nx * 6}deg)`;
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-xp-gradient">
      {/* Aurora mesh, parallax layer 1 */}
      <div
        ref={layer1}
        className="absolute -inset-8 opacity-70 animate-aurora transition-transform duration-300 ease-out"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 20%, rgba(56,189,248,0.35), transparent 60%), radial-gradient(50% 40% at 80% 30%, rgba(96,165,250,0.3), transparent 60%), radial-gradient(60% 50% at 50% 90%, rgba(37,99,235,0.35), transparent 60%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Rotating light rays */}
      <div
        ref={raysRef}
        className="absolute -inset-1/2 opacity-25 transition-transform duration-500 ease-out"
        style={{
          backgroundImage:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(186,230,253,0.5) 8deg, transparent 22deg, transparent 100deg, rgba(147,197,253,0.4) 112deg, transparent 130deg, transparent 220deg, rgba(186,230,253,0.35) 232deg, transparent 250deg, transparent 360deg)",
        }}
      />

      {/* Floating glowing orbs, parallax layer 2 */}
      <div ref={layer2} className="absolute inset-0 transition-transform duration-300 ease-out">
        <div className="absolute w-72 h-72 rounded-full bg-sky-400/20 blur-3xl top-[10%] left-[8%] animate-float-slow" />
        <div className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl bottom-[5%] right-[10%] animate-float" />
        <div className="absolute w-56 h-56 rounded-full bg-cyan-300/15 blur-3xl top-[45%] right-[25%] animate-float-slow" />
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Vignette for icon/text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/25" />
    </div>
  );
}