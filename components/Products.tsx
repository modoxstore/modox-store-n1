import { connection } from "next/server";
import ProductCard from "./ProductCard";
import { getStoreProducts } from "@/lib/storeProducts";

export default async function Products() {
  await connection();

  const products = await getStoreProducts();

  return (
    <section id="products">
      {products.length === 0 ? (
        <p className="py-10 text-center text-zinc-400">
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
    </section>
  );
}
