"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Upload, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#000000", "#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#FFFFFF"];
const VISION_ACTIONS = [
  { task: "describe", label: "Describe image" },
  { task: "ocr", label: "OCR (read text)" },
  { task: "graph", label: "Explain graph" },
  { task: "caption", label: "Caption image" },
] as const;

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#000000");
  const [brush, setBrush] = useState(4);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const prev = document.createElement("canvas");
      prev.width = canvas.width;
      prev.height = canvas.height;
      prev.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(prev, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    last.current = pos(e);
  }
  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }
  function onUp() {
    drawing.current = false;
    last.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResult(null);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "painting.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function runVision(task: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(task);
    setResult(null);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch("/api/ai-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Vision request failed.");
        return;
      }
      setResult(data.result);
    } catch {
      toast.error("Connection lost. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-200">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-400/50 bg-slate-100">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full border ${color === c ? "ring-2 ring-sky-500 border-white" : "border-slate-400"}`}
            style={{ backgroundColor: c }}
            aria-label={c}
          />
        ))}
        <input
          type="range"
          min={1}
          max={20}
          value={brush}
          onChange={(e) => setBrush(Number(e.target.value))}
          className="w-20 mx-1"
        />
        <button onClick={clearCanvas} className="flex items-center gap-1 text-[11.5px] px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700">
          <Eraser size={12} /> Clear
        </button>
        <label className="flex items-center gap-1 text-[11.5px] px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer">
          <Upload size={12} /> Upload
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>
        <button onClick={downloadPng} className="flex items-center gap-1 text-[11.5px] px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700">
          <Download size={12} /> Save PNG
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="flex-1 min-h-0 w-full touch-none cursor-crosshair bg-white"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      />

      <div className="border-t border-slate-400/50 bg-slate-100 p-2 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {VISION_ACTIONS.map((a) => (
            <button
              key={a.task}
              onClick={() => runVision(a.task)}
              disabled={!!busy}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded bg-white border border-slate-300 hover:bg-sky-50 text-slate-700 disabled:opacity-50"
            >
              {busy === a.task ? <Loader2 size={11} className="animate-spin" /> : null}
              {a.label}
            </button>
          ))}
        </div>
        {result && (
          <div className="max-h-24 overflow-y-auto text-[11.5px] text-slate-700 bg-white border border-slate-300 rounded p-2 whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}