"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/track";

// Tells the ad pixels which product page was opened.
export default function TrackView({ name, price }: { name: string; price: number }) {
  useEffect(() => {
    trackViewContent({ name, price });
  }, [name, price]);
  return null;
}
