import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { displayImage, slugify, tierFor, type Tier } from "@/lib/catalog";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image: string;
  oldPrice?: number;
  promoActive: boolean;
  tier: Tier;
  rating: number;
  reviews: number;
};

export async function getStoreProducts(): Promise<StoreProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,name,description,price,stock,image,active,old_price,promo_end")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Store products error:", error.message);
    throw new Error("Could not load products");
  }

  const now = Date.now();

  return (data ?? []).map((product) => {
    const promoActive =
      !!product.old_price &&
      !!product.promo_end &&
      new Date(product.promo_end).getTime() > now;

    return {
      id: product.id,
      name: product.name,
      slug: slugify(product.name),
      description: product.description ?? null,
      price: product.price,
      stock: product.stock ?? 0,
      image: displayImage(product.image || "/icon.png"),
      oldPrice: promoActive ? product.old_price ?? undefined : undefined,
      promoActive,
      tier: tierFor(product.price),
      rating: 5,
      reviews: 0,
    };
  });
}

export async function getStoreProductBySlug(slug: string) {
  const products = await getStoreProducts();
  const product = products.find((item) => item.slug === slug) ?? null;
  return { product, products };
}
