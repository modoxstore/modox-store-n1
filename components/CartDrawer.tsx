"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    totalPrice,
    closeCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="إغلاق السلة"
          onClick={closeCart}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
        />
      )}

      <aside
        dir="rtl"
        className={`fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col border-l border-green-500/20 bg-[#030706] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-green-400" />
            <h2 className="text-xl font-black text-white">سلة المشتريات</h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag size={55} className="text-zinc-700" />

              <p className="mt-5 text-xl font-black text-white">
                السلة فارغة
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                أضف أحد المبردات إلى السلة.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.name}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-black text-white">
                          {item.name}
                        </h3>

                        <p className="mt-1 font-black text-green-400">
                          {item.price} DH
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.name)}
                        className="text-zinc-500 transition hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white transition hover:border-green-400"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="min-w-6 text-center font-black text-white">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white transition hover:border-green-400"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-zinc-400">المجموع</span>

            <span className="text-2xl font-black text-green-400">
              {totalPrice} DH
            </span>
          </div>

          <Link
  href="/checkout"
  onClick={closeCart}
  className={`block w-full rounded-xl px-5 py-4 text-center font-black transition ${
    items.length === 0
      ? "pointer-events-none bg-zinc-800 text-zinc-500"
      : "bg-green-400 text-black hover:bg-green-300"
  }`}
>
  إتمام الطلب
</Link>
        </div>
      </aside>
    </>
  );
}