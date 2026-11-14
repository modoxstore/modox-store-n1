import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Banknote, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import AddToCartButton from "@/components/store/AddToCartButton";
import LootCard from "@/components/store/LootCard";
import Footer from "@/components/Footer";
import { getStoreProductBySlug } from "@/lib/storeProducts";
import { isRemoteImage, tierLabel } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getStoreProductBySlug(slug);
  if (!product) return { title: "منتج غير موجود" };

  const description =
    product.description?.slice(0, 160) ||
    `${product.name} بـ ${product.price} درهم فـ MODOX STORE. الدفع عند الاستلام والتوصيل لجميع مدن المغرب.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | MODOX STORE`,
      description,
      images: [{ url: product.image, width: 900, height: 900, alt: product.name }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const { product, products } = await getStoreProductBySlug(slug);
  if (!product) notFound();

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const related = products
    .filter((p) => p.id !== product.id && p.stock > 0)
    .sort((a, b) => Number(b.tier === product.tier) - Number(a.tier === product.tier))
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `https://modox.ma${product.image}`,
    description: product.description ?? undefined,
    brand: { "@type": "Brand", name: "MODOX STORE" },
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: product.price,
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `https://modox.ma/product/${product.slug}`,
    },
  };

  return (
    <>
      <StoreHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <nav aria-label="المسار" className="mb-6 text-sm text-dim">
          <Link href="/" className="hover:text-ink">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-ink">المتجر</Link>
          <span className="mx-2">/</span>
          <span className="text-ink" dir="auto">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div
            className={`crate-frame tier-${product.tier} relative aspect-square w-full overflow-hidden border border-line bg-map-2`}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              unoptimized={isRemoteImage(product.image)}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={`object-cover ${soldOut ? "opacity-50 grayscale" : ""}`}
            />
            <span
              dir="ltr"
              className="absolute right-4 top-4 bg-map/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--tc)] backdrop-blur"
            >
              {tierLabel[product.tier]} crate
            </span>
          </div>

          <div className={`tier-${product.tier} flex flex-col`}>
            <p dir="ltr" className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--tc)]">
              ◢ {tierLabel[product.tier]} · ID {product.id.slice(0, 8)}
            </p>
            <h1
              dir="auto"
              className="mt-2 font-head text-[34px] font-bold leading-tight text-ink sm:text-[44px]"
            >
              {product.name}
            </h1>

            <div className="mt-5 flex items-end gap-4">
              <p dir="ltr" className="font-head text-[44px] font-bold leading-none tabular-nums text-flare">
                {product.price}
                <span className="ml-1 text-lg text-dim">DH</span>
              </p>
              {product.oldPrice && (
                <p dir="ltr" className="pb-1 font-mono text-lg text-dim line-through">
                  {product.oldPrice} DH
                </p>
              )}
            </div>
            <p className="mt-2 text-sm text-dim">
              + مصاريف التوصيل حسب المدينة (كتبان فصفحة الطلب)
            </p>

            <p
              className={`mt-5 inline-flex w-fit items-center gap-2 border px-3 py-1.5 text-sm ${
                soldOut
                  ? "border-line text-dim"
                  : lowStock
                    ? "border-hazard/40 text-hazard"
                    : "border-zone/40 text-zone"
              }`}
            >
              {soldOut
                ? "نفذت الكمية دابا"
                : lowStock
                  ? `باقي غير ${product.stock} فالستوك`
                  : "متوفر فالستوك"}
            </p>

            {product.description && (
              <div className="mt-6 whitespace-pre-line border-t border-line pt-6 leading-8 text-ink/90">
                {product.description}
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton
                name={product.name}
                price={product.price}
                image={product.image}
                stock={product.stock}
                variant="page"
              />
            </div>

            <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
              {[
                [Banknote, "الدفع عند الاستلام", "ما كتخلص والو حتى توصلك"],
                [Truck, "Ozon Express", "توصيل لجميع مدن المغرب"],
                [MessageCircle, "تأكيد فـ WhatsApp", "كتوصلك رسالة بالمجموع"],
                [ShieldCheck, "مجرب قبل الشحن", "كنشوفو كل منتج قبل ما يخرج"],
              ].map(([Icon, title, body]) => {
                const I = Icon as typeof Truck;
                return (
                  <li key={title as string} className="flex gap-3 bg-map-2 p-4">
                    <I size={20} className="mt-0.5 shrink-0 text-flare" />
                    <div>
                      <p className="font-semibold text-ink">{title as string}</p>
                      <p className="text-sm text-dim">{body as string}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-arabic text-[32px] text-ink">صناديق أخرى</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((item, i) => (
                <LootCard key={item.id} product={item} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
