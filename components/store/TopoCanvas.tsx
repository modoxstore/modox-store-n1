"use client";

import { useEffect, useRef } from "react";

// Topographic contour lines drawn behind the hero, like a night map.
export default function TopoCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      const peaks: [number, number, number][] = [
        [w * 0.82, h * 0.28, 1.1],
        [w * 0.3, h * 0.78, 0.95],
        [w * 0.08, h * 0.15, 0.7],
      ];

      peaks.forEach(([px, py, s], k) => {
        for (let i = 1; i < 18; i++) {
          const r = i * 24 * s;
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
            const n =
              Math.sin(a * 3 + k + i * 0.3) * 8 * s +
              Math.sin(a * 5 - i * 0.2 + k * 2) * 5 * s +
              Math.cos(a * 2 + i * 0.15) * i * 1.6;
            const x = px + Math.cos(a) * (r + n);
            const y = py + Math.sin(a) * (r + n) * 0.8;
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle =
            i % 5 === 0 ? "rgba(143,168,161,0.22)" : "rgba(143,168,161,0.08)";
          ctx.stroke();
        }
      });

      ctx.strokeStyle = "rgba(143,168,161,0.05)";
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
