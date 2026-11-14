import type { Metadata } from "next";
import { connection } from "next/server";
import StoreHeader from "@/components/store/StoreHeader";
import ShopGrid from "@/components/store/ShopGrid";
import Footer from "@/components/Footer";
import { getStoreProducts } from "@/lib/storeProducts";
import { tierOrder } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "جميع المنتجات",
  description:
    "مبردات الهاتف، سماعات، شواحن وكابلات Gaming فالمغرب. الدفع عند الاستلام والتوصيل لجميع المدن.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const { q } = await searchParams;
  const products = (await getStoreProducts()).sort(
    (a, b) =>
      Number(b.stock > 0) - Number(a.stock > 0) ||
      tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );

  return (
    <>
      <StoreHeader />
      <main className="mx-auto min-h-screen max-w-[1280px] px-4 py-10 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-flare" dir="ltr">
          Armory · {products.length} items
        </p>
        <h1 className="mb-8 mt-1 font-arabic text-[40px] leading-tight text-ink sm:text-[52px]">
          جميع المنتجات
        </h1>

        <ShopGrid products={products} initialQuery={q ?? ""} />
      </main>
      <Footer />
    </>
  );
}
