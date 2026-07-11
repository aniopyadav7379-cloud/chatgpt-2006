"use client";

import { useEffect, useRef } from "react";

/**
 * Signature background: a slow-drifting aurora mesh layered with soft glowing
 * orbs and a faint network-line canvas — the "2006 wallpaper rebuilt with a
 * modern render pipeline" idea. Canvas handles the network lines because
 * they need per-frame trig; everything else is cheap CSS/SVG.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const NODE_COUNT = 34;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
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

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (a.x - b.x) * width;
          const dy = (a.y - b.y) * height;
          const dist = Math.hypot(dx, dy);
          const maxDist = 160;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.12 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = "rgba(148, 197, 253, 0.5)";
        ctx.beginPath();
        ctx.arc(n.x * width, n.y * height, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-xp-gradient">
      {/* Aurora mesh */}
      <div
        className="absolute inset-0 opacity-70 animate-aurora"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 20%, rgba(56,189,248,0.35), transparent 60%), radial-gradient(50% 40% at 80% 30%, rgba(96,165,250,0.3), transparent 60%), radial-gradient(60% 50% at 50% 90%, rgba(37,99,235,0.35), transparent 60%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Floating glowing orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-sky-400/20 blur-3xl top-[10%] left-[8%] animate-float-slow" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl bottom-[5%] right-[10%] animate-float" />
      <div className="absolute w-56 h-56 rounded-full bg-cyan-300/15 blur-3xl top-[45%] right-[25%] animate-float-slow" />

      {/* Network line canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Subtle vignette for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30" />
    </div>
  );
}
