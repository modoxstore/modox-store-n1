"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "../CartContext";

type Props = {
  name: string;
  price: number;
  image: string;
  stock: number;
  variant?: "card" | "page";
};

export default function AddToCartButton({
  name,
  price,
  image,
  stock,
  variant = "card",
}: Props) {
  const { addToCart, closeCart } = useCart();
  const router = useRouter();
  const soldOut = stock <= 0;

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed border border-line bg-map-3 px-4 py-3 font-arabic text-[17px] text-dim"
      >
        نفذت الكمية
      </button>
    );
  }

  if (variant === "page") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            addToCart({ name, price, image });
            closeCart();
            router.push("/checkout");
          }}
          className="cut-corners flex items-center justify-center gap-2 bg-flare px-5 py-4 font-arabic text-[19px] text-[#140a02] transition hover:-translate-y-0.5"
        >
          <Zap size={20} />
          اطلب دابا
        </button>
        <button
          type="button"
          onClick={() => addToCart({ name, price, image })}
          className="flex items-center justify-center gap-2 border border-line bg-map-2 px-5 py-4 font-arabic text-[19px] text-ink transition hover:border-flare"
        >
          <ShoppingCart size={20} />
          زيد للسلة
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart({ name, price, image })}
      className="cut-corners flex w-full items-center justify-center gap-2 bg-flare px-4 py-3 font-arabic text-[17px] text-[#140a02] transition hover:-translate-y-0.5"
    >
      <ShoppingCart size={18} />
      زيد للسلة
    </button>
  );
}
