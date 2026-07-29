import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/components/data/products";

export default function ShopPage() {
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

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.name}
                {...product}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}