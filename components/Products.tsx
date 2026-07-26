import ProductCard from "./ProductCard";

const products = [
  {
    name: "S38",
    price: 149,
    image: "/images/s38.png",
    rating: 5,
    reviews: 152,
    badge: "الأكثر مبيعاً",
  },
  {
    name: "I51",
    price: 149,
    image: "/images/i51.png",
    rating: 5,
    reviews: 98,
  },
  {
    name: "XS-06",
    price: 99,
    image: "/images/xs06.png",
    rating: 5,
    reviews: 73,
  },
  {
    name: "XS-09",
    price: 99,
    image: "/images/xs09.png",
    rating: 4,
    reviews: 64,
  },
];

export default function Products() {
  return (
    <section
      id="products"
      dir="rtl"
      className="border-t border-green-500/10 bg-[#020504] px-5 py-20"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-12 text-center">
          <p className="font-bold text-green-400">منتجاتنا</p>

          <h2 className="mt-2 text-4xl font-black text-white">
            الأكثر مبيعاً
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-500">
            اختر المبرد المناسب لهاتفك واستمتع بأداء ثابت أثناء اللعب.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}