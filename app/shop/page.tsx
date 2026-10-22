import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getStoreProducts } from "@/lib/storeProducts";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getStoreProducts();

  return (
    <>
      <Navbar />

      <main
        dir="rtl"
        className="min-h-screen bg-[#020504] px-5 pt-36 pb-20"
      >
        <div className="mx-auto max-w-[1500px]">
          <h1 className="mb-10 text-4xl font-black text-white">
            جميع المنتجات
          </h1>

          {products.length === 0 ? (
            <p className="text-zinc-400">
              لا توجد منتجات متاحة حالياً.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
