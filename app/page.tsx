import Link from "next/link";
import { connection } from "next/server";
import StoreHeader from "@/components/store/StoreHeader";
import DropHero from "@/components/store/DropHero";
import HowItWorks from "@/components/store/HowItWorks";
import LootCard from "@/components/store/LootCard";
import TierLegend from "@/components/store/TierLegend";
import Footer from "@/components/Footer";
import { getStoreProducts } from "@/lib/storeProducts";
import { tierOrder } from "@/lib/catalog";

export default async function Home() {
  await connection();
  const products = await getStoreProducts();

  // Available crates first, highest rarity first.
  const crates = [...products]
    .sort(
      (a, b) =>
        Number(b.stock > 0) - Number(a.stock > 0) ||
        tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
    )
    .slice(0, 8);

  return (
    <>
      <StoreHeader />
      <main>
        <DropHero />
        <HowItWorks />

        <section
          id="crates"
          className="mx-auto max-w-[1280px] scroll-mt-28 px-4 py-14 sm:px-6"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-flare" dir="ltr">
                Loot crates
              </p>
              <h2 className="mt-1 font-arabic text-[36px] leading-tight text-ink sm:text-[44px]">
                الصناديق اللي طايحين دابا
              </h2>
            </div>
            <TierLegend />
          </div>

          {crates.length === 0 ? (
            <p className="border border-dashed border-line p-8 text-center text-dim">
              ما كاين حتى منتج دابا. رجع من بعد شوية.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {crates.map((product, i) => (
                <LootCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              href="/shop"
              className="border border-line bg-map-2 px-8 py-4 font-arabic text-[19px] text-ink transition hover:border-flare"
            >
              شوف جميع المنتجات ({products.length})
            </Link>
          </div>
        </section>

        <section className="hazard-stripes border-y border-line">
          <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
            {[
              ["مجربين قبل الشحن", "كل منتج كيتشاف قبل ما يخرج من الستوك."],
              ["الثمن واضح", "المجموع مع التوصيل كيبان قبل ما تأكد، بلا مفاجآت."],
              ["دعم فـ WhatsApp", "كاين شي مشكل؟ صيفط لينا وكنجاوبو بسرعة."],
            ].map(([title, body]) => (
              <div key={title} className="border-r-2 border-flare pr-4">
                <h3 className="font-arabic text-[21px] text-ink">{title}</h3>
                <p className="mt-1 text-[15px] leading-7 text-dim">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
