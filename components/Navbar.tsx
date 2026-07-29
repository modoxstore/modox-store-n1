"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  PackageSearch,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "./CartContext";

const navigation = [
  { href: "/", label: "الرئيسية" },

  { href: "#categories", label: "التصنيفات" },
  { href: "#products", label: "الأكثر مبيعاً" },
  { href: "#why-modox", label: "لماذا MODOX؟" },
];

export default function Navbar() {
  const { totalItems, openCart } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    window.location.href = `/shop?search=${encodeURIComponent(query)}`;
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header
      dir="rtl"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-[#020504]/90 shadow-[0_15px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          : "border-b border-white/5 bg-gradient-to-b from-black/75 via-black/30 to-transparent"
      }`}
    >
      {/* Top announcement */}
      <div
        className={`overflow-hidden border-b border-green-400/10 bg-black/30 transition-all duration-500 ${
          scrolled
            ? "h-0 border-transparent opacity-0"
            : "h-8 opacity-100"
        }`}
      >
        <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-center px-5">
          <p className="truncate text-[11px] font-bold text-zinc-300 sm:text-xs">
            🚚 توصيل سريع لجميع مدن المغرب — الدفع عند الاستلام متاح
          </p>
        </div>
      </div>

      {/* Main navbar */}
      <div
        className={`mx-auto flex max-w-[1500px] items-center gap-4 px-4 transition-all duration-500 sm:px-6 lg:px-10 ${
          scrolled ? "h-[68px]" : "h-[78px]"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="MODOX الصفحة الرئيسية"
          className="group flex shrink-0 items-center gap-3"
        >
          <div
            className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-green-400/25 bg-black/60 transition-all duration-500 group-hover:border-green-400/60 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.15)] ${
              scrolled ? "h-11 w-11" : "h-12 w-12"
            }`}
          >
            <Image
              src="/images/logo.png"
              alt="MODOX"
              width={52}
              height={52}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xl font-black leading-none tracking-[0.14em] text-white">
              MODOX
            </p>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.3em] text-green-400">
              Gaming Store
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-bold transition duration-300 ${
                index === 0
                  ? "bg-green-400/10 text-green-400"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <form
          onSubmit={handleSearch}
          className="mx-auto hidden w-full max-w-[380px] flex-1 lg:block"
        >
          <div className="group flex w-full items-center overflow-hidden rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md transition focus-within:border-green-400/50 focus-within:bg-black/45 focus-within:shadow-[0_0_25px_rgba(74,222,128,0.08)]">
            <Search
              size={18}
              className="mr-4 shrink-0 text-zinc-500 transition group-focus-within:text-green-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن منتج..."
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />

            <button
              type="submit"
              className="ml-1.5 rounded-xl bg-green-400 px-4 py-2 text-xs font-black text-black transition hover:bg-green-300"
            >
              بحث
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="mr-auto flex shrink-0 items-center gap-2">
      
          <button
            type="button"
            onClick={openCart}
            aria-label="فتح السلة"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-green-400/35 bg-green-400/10 text-green-400 transition duration-300 hover:scale-105 hover:bg-green-400 hover:text-black active:scale-95"
          >
            <ShoppingCart size={21} />

            {totalItems > 0 && (
              <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#020504] bg-green-400 px-1 text-[10px] font-black text-black">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={
              mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"
            }
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white backdrop-blur-sm transition hover:border-green-400/40 hover:text-green-400 xl:hidden"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 top-[68px] z-[-1] bg-black/70 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile menu */}
      <div
        className={`absolute inset-x-0 top-full border-t border-white/10 bg-[#030706]/98 shadow-2xl backdrop-blur-2xl transition-all duration-300 xl:hidden ${
          mobileMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[700px] px-4 py-5">
          {/* Mobile search */}
          <form onSubmit={handleSearch}>
            <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] focus-within:border-green-400/40">
              <Search
                size={18}
                className="mr-4 self-center text-zinc-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث عن منتج..."
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
              />

              <button
                type="submit"
                className="m-1.5 rounded-xl bg-green-400 px-5 text-sm font-black text-black"
              >
                بحث
              </button>
            </div>
          </form>

          <nav className="mt-5 grid gap-2">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-bold transition ${
                  index === 0
                    ? "border-green-400/25 bg-green-400/10 text-green-400"
                    : "border-white/5 text-zinc-300 hover:border-green-400/25 hover:bg-green-400/10 hover:text-green-400"
                }`}
              >
                {item.label}
                <span className="text-zinc-600">←</span>
              </Link>
            ))}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/track-order"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm font-bold text-zinc-300"
            >
              <PackageSearch size={18} />
              تتبع الطلب
            </Link>

            <Link
              href="/account"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm font-bold text-zinc-300"
            >
              <UserRound size={18} />
              الحساب
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}