import Link from "next/link";
import Countdown from "./Countdown";
import Cooler3D from "./Cooler3D";
import AddToCartButton from "./AddToCartButton";
import type { StoreProduct } from "@/lib/storeProducts";
import { BLACK_FRIDAY_END, discountPercent } from "@/lib/blackFriday";

export default function BlackFridayHero({ hero }: { hero: StoreProduct | null }) {
  const pct = hero ? discountPercent(hero.price, hero.oldPrice) : 0;

  return (
    <section className="bf-hero relative overflow-hidden border-b border-line bg-black">
      <div aria-hidden="true" className="bf-grid pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="bf-glow pointer-events-none absolute inset-0" />

      {/* Giant outlined word behind everything */}
      <p
        aria-hidden="true"
        dir="ltr"
        className="bf-ghost pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display text-[22vw] leading-none sm:top-2"
      >
        BLACK
      </p>

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-6 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:pb-14 lg:pt-12">
        <div className="order-2 lg:order-1">
          <p dir="ltr" className="inline-flex items-center gap-2 bg-flare px-3 py-1 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-black">
            <span className="bf-blink h-2 w-2 bg-black" /> Live drop · 27 → 30 Nov
          </p>

          <h1 dir="ltr" className="mt-4 text-right font-display leading-[0.85] text-ink">
            <span className="block text-[64px] sm:text-[96px] lg:text-[112px]">BLACK</span>
            <span className="bf-stroke block text-[64px] sm:text-[96px] lg:text-[112px]">FRIDAY</span>
          </h1>

          <p className="mt-4 font-arabic text-[26px] leading-snug text-ink sm:text-[32px]">
            <span className="text-flare">-20%</span> على كلشي فالمتجر،
            <br />
            و <span className="text-flare">-{pct || 35}%</span> على المبرد اللي كيخرج الثلج.
          </p>

          <div className="mt-6">
            <p className="mb-2 text-sm text-dim">العرض كيسالي من بعد:</p>
            <Countdown end={BLACK_FRIDAY_END} />
          </div>

          {hero && (
            <div className="mt-7 border border-line bg-map/80 p-4 backdrop-blur">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p dir="ltr" className="text-right font-head text-xl font-semibold text-ink">{hero.name}</p>
                  <p className="text-[13px] text-dim">
                    {hero.stock > 0 ? `باقي ${hero.stock} فالستوك` : "نفذت الكمية"}
                  </p>
                </div>
                <div dir="ltr" className="flex items-baseline gap-3">
                  {hero.oldPrice && (
                    <span className="font-mono text-lg text-dim line-through">{hero.oldPrice} DH</span>
                  )}
                  <span className="font-head text-5xl font-bold text-flare">{hero.price}</span>
                  <span className="text-dim">DH</span>
                </div>
              </div>
              <div className="mt-4">
                <AddToCartButton
                  name={hero.name}
                  price={hero.price}
                  image={hero.image}
                  stock={hero.stock}
                  variant="page"
                />
                <Link
                  href={`/product/${hero.slug}`}
                  className="mt-3 inline-block text-sm text-dim underline transition hover:text-flare"
                >
                  شوف التفاصيل ديال المبرد
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative order-1 lg:order-2">
          {pct > 0 && (
            <div className="bf-burst absolute left-2 top-2 z-10 flex h-24 w-24 rotate-[-12deg] items-center justify-center bg-flare text-black sm:h-32 sm:w-32">
              <span dir="ltr" className="font-display text-3xl sm:text-5xl">-{pct}%</span>
            </div>
          )}
          <Cooler3D className="aspect-square w-full sm:aspect-[5/4]" />
          <div dir="ltr" className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-2 font-mono text-[10px] uppercase tracking-[0.18em] sm:text-[11px]">
            <span className="text-flare">◀ Hot air in</span>
            <span className="text-dim">Drag to rotate</span>
            <span className="text-ink">Ice out ▶</span>
          </div>
        </div>
      </div>
    </section>
  );
}
