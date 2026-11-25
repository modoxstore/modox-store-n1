import Image from "next/image";
import Link from "next/link";
import { isRemoteImage, tierLabel } from "@/lib/catalog";
import type { StoreProduct } from "@/lib/storeProducts";
import AddToCartButton from "./AddToCartButton";
import { discountPercent, isCooler } from "@/lib/blackFriday";

// Ice flakes for cooler cards: [x offset, y offset, size, delay].
const SNOW: [number, number, number, number][] = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r = 70 + (i % 3) * 25;
  return [
    Math.round(Math.cos(a) * r),
    Math.round(Math.sin(a) * r),
    6 + (i % 4) * 2,
    Math.round((i % 5) * 0.28 * 100) / 100,
  ];
});

export default function LootCard({
  product,
  index,
}: {
  product: StoreProduct;
  index: number;
}) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const soldOut = product.stock <= 0;
  const cooler = isCooler(product.name) && !soldOut;
  const pct = discountPercent(product.price, product.oldPrice);

  return (
    <article
      className={`${cooler ? "cooler-card " : ""}loot-card crate-frame tier-${product.tier} anim-rise group flex flex-col border border-line bg-map-2 transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--tc)_55%,var(--color-line))]`}
      style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized={isRemoteImage(product.image)}
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={`object-cover transition duration-500 group-hover:scale-105 ${
            soldOut ? "opacity-50 grayscale" : ""
          }`}
        />
        <span
          aria-hidden="true"
          className="loot-scan pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-l from-transparent via-white/10 to-transparent"
        />

        <span
          dir="ltr"
          className="absolute right-3 top-3 bg-map/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--tc)] backdrop-blur"
        >
          {tierLabel[product.tier]}
        </span>

        {cooler && (
          <>
            <span aria-hidden="true" className="cooler-ring" />
            <span aria-hidden="true" className="cooler-snow">
              {SNOW.map(([x, y, s, d], i) => (
                <i
                  key={i}
                  style={{ "--x": `${x}px`, "--y": `${y}px`, "--s": `${s}px`, "--d": `${d}s` } as React.CSSProperties}
                />
              ))}
            </span>
          </>
        )}

        {product.promoActive && (
          <span
            dir="ltr"
            className={`absolute left-3 top-3 px-2 py-1 font-mono text-[11px] font-bold tracking-[0.1em] ${
              pct > 0 ? "bf-badge" : "bg-flare text-[#140a02]"
            }`}
          >
            {pct > 0 ? `-${pct}% BF` : "PROMO"}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.slug}`}>
          <h3
            dir="auto"
            className="font-head text-[17px] font-semibold leading-snug text-ink transition group-hover:text-[var(--tc)]"
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
          <p className="font-head text-2xl font-bold tabular-nums text-ink" dir="ltr">
            {product.price}
            <span className="mr-1 text-sm font-medium text-dim"> DH</span>
          </p>

          {product.oldPrice && (
            <p className="font-mono text-sm text-dim line-through" dir="ltr">
              {product.oldPrice} DH
            </p>
          )}
        </div>

        <p
          className={`text-[13px] ${
            soldOut ? "text-dim" : lowStock ? "text-hazard" : "text-dim"
          }`}
        >
          {soldOut
            ? "نفذت الكمية"
            : lowStock
              ? `باقي غير ${product.stock} فالستوك`
              : `متوفر: ${product.stock} فالستوك`}
        </p>

        <AddToCartButton
          name={product.name}
          price={product.price}
          image={product.image}
          stock={product.stock}
        />
      </div>
    </article>
  );
}
