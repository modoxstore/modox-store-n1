"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    ["يوم", Math.floor(s / 86400)],
    ["ساعة", Math.floor((s % 86400) / 3600)],
    ["دقيقة", Math.floor((s % 3600) / 60)],
    ["ثانية", s % 60],
  ] as const;
}

export default function Countdown({ end }: { end: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(end).getTime();
    const update = () => setLeft(target - Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [end]);

  return (
    <div dir="rtl" className="flex gap-2" aria-live="off">
      {parts(left ?? 0).map(([label, value]) => (
        <div key={label} className="min-w-[64px] border border-flare/40 bg-black/60 px-2 py-2 text-center">
          <p dir="ltr" className="font-head text-3xl font-bold tabular-nums text-ink sm:text-4xl">
            {left === null ? "--" : String(value).padStart(2, "0")}
          </p>
          <p className="text-[11px] text-dim">{label}</p>
        </div>
      ))}
    </div>
  );
}
