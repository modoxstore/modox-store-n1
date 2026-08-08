"use client";

import Image from "next/image";
import { Check, ShoppingCart, X, Clock } from "lucide-react";
import { useCart } from "./CartContext";
import { useEffect, useState } from "react";

type ProductCardProps = {
  name: string;
  price: number;
  oldPrice?: number;
  promoEnd?: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
};

export default function ProductCard({
  name,
  price,
  oldPrice,
  promoEnd,
  image,
  rating,
  reviews,
  stock,
  badge,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!promoEnd) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [promoEnd]);

  const promoEndTime = promoEnd ? new Date(promoEnd).getTime() : 0;

  const isPromoActive =
    !!oldPrice &&
    !!promoEnd &&
    promoEndTime > now;

  const remainingTime = isPromoActive
    ? promoEndTime - now
    : 0;

  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

  const hours = Math.floor(
    (remainingTime / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (remainingTime / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (remainingTime / 1000) % 60
  );

  // Ila promo mazal khdama = nouveau prix
  // Ila salat = prix original
  const currentPrice = isPromoActive
    ? price
    : oldPrice ?? price;

  const isSoldOut = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#050a07] transition duration-300 hover:border-green-500/40">

      {/* Badge */}
      {badge && (
        <span className="absolute right-4 top-4 z-20 rounded-full border border-green-500/30 bg-black/70 px-3 py-1.5 text-[11px] font-bold text-green-400 backdrop-blur-md">
          🔥 {badge}
        </span>
      )}

      {/* Availability */}
      {isSoldOut ? (
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 backdrop-blur-md">
          <X size={13} />
          نفذت الكمية
        </span>
      ) : isLowStock ? (
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-[11px] font-bold text-orange-300 backdrop-blur-md">
          باقي غير {stock} قطع
        </span>
      ) : (
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-bold text-zinc-300 backdrop-blur-md">
          <Check size={13} className="text-green-400" />
          متوفر: {stock} قطعة
        </span>
      )}

      {/* Product image */}
      <div className="relative h-[310px] overflow-hidden border-b border-white/5 sm:h-[340px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_65%)]" />

        <div className="absolute inset-x-12 bottom-8 h-14 rounded-full bg-green-400/15 blur-2xl transition duration-500 group-hover:bg-green-400/25" />

        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
          className={`object-contain p-5 transition duration-500 group-hover:scale-110 ${
            isSoldOut ? "opacity-50 grayscale" : ""
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-bold text-zinc-500">
              متجر هاتف Gaming
            </p>

            <h3 className="mt-1 text-2xl font-black text-white transition group-hover:text-green-400">
              {name}
            </h3>
          </div>

          {/* PRICE */}
          <div className="text-left">

            {isPromoActive && oldPrice && (
              <div className="mb-1 flex items-center gap-2">

                <span className="text-sm font-bold text-zinc-500 line-through decoration-red-500 decoration-2">
                  {oldPrice} DH
                </span>

                <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-black text-red-400">
                  PROMO 🔥
                </span>

              </div>
            )}

            <p
              className={`whitespace-nowrap font-black ${
                isPromoActive
                  ? "text-3xl text-green-400"
                  : "text-2xl text-green-400"
              }`}
            >
              {currentPrice}

              <span className="mr-1 text-sm">
                DH
              </span>
            </p>

          </div>
        </div>

        {/* COUNTDOWN */}
        {isPromoActive && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">

            <div className="mb-2 flex items-center justify-center gap-2 text-xs font-black text-red-400">
              <Clock size={15} />
              العرض ينتهي خلال
            </div>

            <div
              className="flex items-center justify-center gap-2"
              dir="ltr"
            >

              <TimeBox value={days} label="يوم" />

              <span className="font-black text-zinc-500">
                :
              </span>

              <TimeBox value={hours} label="ساعة" />

              <span className="font-black text-zinc-500">
                :
              </span>

              <TimeBox value={minutes} label="دقيقة" />

              <span className="font-black text-zinc-500">
                :
              </span>

              <TimeBox value={seconds} label="ثانية" />

            </div>
          </div>
        )}

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">

          <div
            className="flex text-sm text-yellow-400"
            aria-label={`${rating} من 5 نجوم`}
          >
            <span>
              {"★".repeat(rating)}
            </span>

            <span className="text-zinc-700">
              {"★".repeat(5 - rating)}
            </span>
          </div>

          <span className="text-xs text-zinc-500">
            {reviews} تقييم
          </span>

        </div>

        {/* Stock */}
        <div className="mt-4">

          {isSoldOut ? (
            <p className="font-black text-red-400">
              🔴 نفذت الكمية
            </p>
          ) : isLowStock ? (
            <p className="font-black text-orange-300">
              🟠 سارع، باقي غير {stock} قطع
            </p>
          ) : (
            <p className="font-bold text-green-400">
              🟢 المخزون: {stock} قطعة
            </p>
          )}

        </div>

        {/* Add to cart */}
        <button
          type="button"
          disabled={isSoldOut}
          onClick={() => {
            if (isSoldOut) return;

            addToCart({
              name,
              price: currentPrice,
              image,
            });
          }}
          className={`mt-auto flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 font-black transition duration-300 ${
            isSoldOut
              ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
              : "bg-green-400 text-black shadow-lg shadow-green-500/10 hover:-translate-y-0.5 hover:bg-green-300 hover:shadow-green-500/20 active:scale-[0.98]"
          }`}
        >
          <ShoppingCart size={20} />

          {isSoldOut
            ? "غير متوفر حالياً"
            : "أضف للسلة"}
        </button>

      </div>
    </article>
  );
}

/* Countdown box */
function TimeBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[45px] rounded-lg bg-black/50 px-2 py-1.5 text-center">

      <p className="text-base font-black text-white">
        {String(value).padStart(2, "0")}
      </p>

      <p className="text-[8px] font-bold text-zinc-500">
        {label}
      </p>

    </div>
  );
}