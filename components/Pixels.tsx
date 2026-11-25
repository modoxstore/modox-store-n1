"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.replace(/\D/g, "") ?? "";
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.replace(/[^A-Z0-9]/gi, "") ?? "";

type PixelWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  ttq?: { page: () => void };
};

// Meta + TikTok pixels. Admin pages are never tracked.
export default function Pixels() {
  const pathname = usePathname();
  const first = useRef(true);

  // The base code sends the first PageView; later client-side page
  // changes send their own.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pathname.startsWith("/admin")) return;
    const w = window as PixelWindow;
    w.fbq?.("track", "PageView");
    w.ttq?.page();
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {META_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_ID}');fbq('track','PageView');`}
        </Script>
      )}
      {TIKTOK_ID && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK_ID}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}
    </>
  );
}
