"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

export default function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1450px] items-center justify-between px-5 md:px-8">
        
        {/* Cart فاليسار */}
        <button
          onClick={openCart}
          aria-label="فتح السلة"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 transition hover:bg-green-500 hover:text-black"
        >
          <ShoppingCart size={21} />

          {totalItems > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-xs font-black text-black">
              {totalItems}
            </span>
          )}
        </button>

        {/* Menu فالوسط */}
        <nav className="hidden items-center gap-8 md:flex" dir="rtl">
          <a
            href="#"
            className="text-sm font-bold text-green-400 transition hover:text-green-300"
          >
            الرئيسية
          </a>

          <a
            href="#products"
            className="text-sm font-bold text-zinc-300 transition hover:text-white"
          >
            المنتجات
          </a>

          <a
            href="#why-modox"
            className="text-sm font-bold text-zinc-300 transition hover:text-white"
          >
            من نحن
          </a>

          <a
            href="#contact"
            className="text-sm font-bold text-zinc-300 transition hover:text-white"
          >
            تواصل معنا
          </a>
        </nav>

        {/* Logo + الاسم فاليمين */}
        <Link href="/" className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-black tracking-wide text-white">
              MODOX STORE
            </p>
            <p className="text-xs text-zinc-500">
              Gaming Accessories
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-green-500/30 bg-black">
            <Image
              src="/images/logo.png"
              alt="MODOX STORE"
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}