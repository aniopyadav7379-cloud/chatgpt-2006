"use client";

export default function CrtOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[980] mix-blend-overlay opacity-[0.16]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 3px)",
      }}
    />
  );
}