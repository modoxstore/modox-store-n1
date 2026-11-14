"use client";

import { useEffect, useState } from "react";

// Time since the drop was registered, ticking every second.
export default function ElapsedClock({ since }: { since: string }) {
  const start = new Date(since).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (now === null) {
    return <span className="tabular-nums">--:--:--</span>;
  }

  const total = Math.max(0, Math.floor((now - start) / 1000));
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="tabular-nums" dir="ltr">
      {days > 0 ? `${days}j ` : ""}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
