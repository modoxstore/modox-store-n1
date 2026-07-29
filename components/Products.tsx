import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "./ProductCard";
import { products } from "@/components/data/products";

export default function Products() {
  return (
    <section id="products">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.name}
            {...product}
          />
        ))}
      </div>
    </section>
  );
}