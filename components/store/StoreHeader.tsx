"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../CartContext";

const links = [
  { href: "/shop", label: "المتجر" },
  { href: "/#how", label: "كيفاش كتطلب" },
  { href: "/#crates", label: "الأكثر طلباً" },
];

export default function StoreHeader() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-map/85 backdrop-blur-md">
      <div className="bg-flare/95 px-4 py-1.5 text-center text-xs font-semibold text-[#140a02]">
        توصيل لجميع مدن المغرب مع Ozon Express · الدفع عند الاستلام
      </div>

      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2" dir="ltr">
          <span className="font-display text-[26px] leading-none tracking-wide text-ink">
            MODOX
          </span>
          <span className="font-display text-[26px] leading-none tracking-wide text-flare">
            STORE
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.2em] text-dim sm:inline">
            {"// MA"}
          </span>
        </Link>

        <nav aria-label="القائمة" className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-arabic text-[17px] text-dim transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          aria-label={`السلة، ${totalItems} منتجات`}
          className="relative flex h-11 w-11 items-center justify-center border border-line bg-map-2 text-ink transition hover:border-flare"
        >
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-flare px-1 font-mono text-[11px] font-semibold text-[#140a02]">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <nav
        aria-label="القائمة"
        className="flex justify-center gap-6 border-t border-line px-4 py-2 md:hidden"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-arabic text-[15px] text-dim"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
