"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopoCanvas from "./TopoCanvas";

// After checkout: the items fall into the crate, the lid closes,
// the parachute opens and the drop flies off to the customer's city.
export default function DropSequence({
  orderId,
  images,
  city,
}: {
  orderId: string;
  images: string[];
  city: string;
}) {
  const router = useRouter();
  const trackUrl = `/order/${orderId}`;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => router.push(trackUrl), reduced ? 1200 : 5200);
    return () => clearTimeout(timer);
  }, [router, trackUrl]);

  const shown = images.slice(0, 3);

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-map px-4 text-ink"
    >
      <TopoCanvas />

      <div className="relative h-[300px] w-[260px]" aria-hidden="true">
        <div className="drop-flight absolute inset-x-0 bottom-0 mx-auto h-[220px] w-[200px]">
          {/* parachute */}
          <svg viewBox="0 0 200 110" className="drop-chute absolute -top-[96px] left-0 w-full">
            <path d="M10 80 Q100 -20 190 80 Z" fill="#ff7a1a" />
            <path d="M10 80 Q55 55 100 80 Q145 55 190 80" fill="none" stroke="#140a02" strokeWidth="3" opacity="0.35" />
            <g stroke="#9ba1aa" strokeWidth="1.5">
              <line x1="14" y1="80" x2="62" y2="110" />
              <line x1="186" y1="80" x2="138" y2="110" />
              <line x1="100" y1="80" x2="100" y2="110" />
            </g>
          </svg>

          {/* items falling into the crate */}
          {shown.map((src, i) => (
            <span
              key={src + i}
              className="drop-item absolute left-1/2 top-0 h-16 w-16 overflow-hidden border border-line bg-map-2"
              style={{ marginLeft: -32 + (i - (shown.length - 1) / 2) * 44, animationDelay: `${i * 0.18}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </span>
          ))}

          {/* crate */}
          <div className="absolute bottom-0 left-1/2 h-[120px] w-[170px] -translate-x-1/2">
            <div className="drop-lid absolute -top-3 left-0 h-6 w-full origin-left border-2 border-hazard bg-[#4a3815]" />
            <div className="relative h-full w-full border-2 border-hazard bg-[#3a2c12]">
              <svg viewBox="0 0 170 120" className="absolute inset-0 h-full w-full">
                <path d="M0 0 L170 120 M170 0 L0 120" stroke="#ffd23f" strokeWidth="2" opacity="0.5" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-3xl text-hazard">
                M
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="drop-text relative mt-10 max-w-md text-center">
        <p dir="ltr" className="font-mono text-[11px] uppercase tracking-[0.18em] text-flare">
          Drop confirmed · {orderId.slice(0, 8)}
        </p>
        <h1 className="mt-2 font-arabic text-[40px] leading-tight">الدروب طار لـ {city}!</h1>
        <p className="mt-3 text-dim">
          توصلك دابا رسالة WhatsApp فيها المجموع. برك على «تأكيد الطلب» باش نصيفطوه لـ Ozon.
        </p>
        <Link
          href={trackUrl}
          className="cut-corners mt-6 inline-block bg-flare px-7 py-3.5 font-arabic text-[19px] text-[#140a02]"
        >
          تبع الطلب ديالك
        </Link>
      </div>
    </main>
  );
}
