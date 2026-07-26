"use client";

import Image from "next/image";
import {
  ShoppingCart,
  Snowflake,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useCart } from "./CartContext";

type ProductCardProps = {
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
};

export default function ProductCard({
  name,
  price,
  image,
  rating,
  reviews,
  badge,
}: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#050908] transition duration-300 hover:-translate-y-2 hover:border-green-400/40 hover:shadow-[0_0_45px_rgba(34,197,94,0.14)]">
      {badge && (
        <span className="absolute right-3 top-3 z-20 rounded-full border border-green-400/40 bg-black/80 px-3 py-1 text-xs font-black text-green-400 backdrop-blur-md">
          🔥 {badge}
        </span>
      )}

      <div className="relative h-[340px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.13),transparent_65%)]">
        <div className="absolute inset-x-10 bottom-8 h-12 rounded-full bg-green-400/15 blur-2xl transition group-hover:bg-green-400/25" />

        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-2 transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-black text-white">
          {name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <div className="text-sm text-lime-400">
            {"★".repeat(rating)}

            <span className="text-zinc-700">
              {"★".repeat(5 - rating)}
            </span>
          </div>

          <span className="text-xs text-zinc-500">
            ({reviews})
          </span>
        </div>

        <p className="mt-3 text-2xl font-black text-green-400">
          {price} DH
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/5 py-4 text-center text-[11px] text-zinc-400">
          <div>
            <Snowflake
              className="mx-auto mb-1 text-white"
              size={17}
            />
            تبريد فائق
          </div>

          <div>
            <Sparkles
              className="mx-auto mb-1 text-green-400"
              size={17}
            />
            إضاءة RGB
          </div>

          <div>
            <Wrench
              className="mx-auto mb-1 text-green-400"
              size={17}
            />
            تركيب سهل
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            addToCart({
              name,
              price,
              image,
            })
          }
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-400 px-5 py-3 font-black text-black transition hover:scale-[1.02] hover:bg-green-300"
        >
          <ShoppingCart size={19} />
          أضف للسلة
        </button>
      </div>
    </article>
  );
}