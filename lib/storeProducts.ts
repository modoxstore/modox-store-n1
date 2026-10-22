import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getStoreProducts() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,name,price,stock,image,active,old_price,promo_end")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Store products error:", error.message);
    throw new Error("Could not load products");
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock ?? 0,
    image: product.image || "/icon.png",
    oldPrice: product.old_price ?? undefined,
    promoEnd: product.promo_end ?? undefined,
    rating: 5,
    reviews: 0,
  }));
}
