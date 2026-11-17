import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import StoreHeader from "@/components/store/StoreHeader";
import Footer from "@/components/Footer";
import { claimReward } from "../actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentCustomer, getXpBalance } from "@/lib/customerAuth";
import { getStoreProductBySlug } from "@/lib/storeProducts";
import { isRemoteImage } from "@/lib/catalog";
import { LEGENDARY_XP, REWARD_MAX_PRICE } from "@/lib/xp";

export const metadata: Metadata = {
  title: "الهدية ديال Legendary",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  form: "عمر الإسم (3 حروف على الأقل) والعنوان كامل.",
  city: "ختار المدينة.",
  order: "ما قدرناش نسجلو الطلب. عاود جرب.",
};

type Props = { searchParams: Promise<{ product?: string; error?: string }> };

export default async function RewardPage({ searchParams }: Props) {
  await connection();
  const { product: slug = "", error } = await searchParams;

  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account");

  const [xp, { product }, citiesResult] = await Promise.all([
    getXpBalance(customer.phone),
    getStoreProductBySlug(slug),
    supabaseAdmin
      .from("ozon_cities")
      .select("city_id,name,delivered_price")
      .order("name", { ascending: true })
      .limit(1000),
  ]);

  if (xp < LEGENDARY_XP) redirect("/account");
  if (!product || product.price >= REWARD_MAX_PRICE || product.stock < 1) {
    redirect("/account?error=product");
  }

  const cities = citiesResult.data ?? [];

  return (
    <>
      <StoreHeader />
      <main className="mx-auto min-h-screen max-w-[900px] px-4 py-10 sm:px-6">
        <p dir="ltr" className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-flare">
          Legendary reward
        </p>
        <h1 className="mt-1 font-arabic text-[38px] leading-tight text-ink sm:text-[48px]">
          الهدية ديالك فابور
        </h1>
        <p className="mt-2 text-dim">
          كتخلص غير التوصيل عند الاستلام. كيتحسبو ليك {LEGENDARY_XP} XP (عندك {xp}).
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-[220px_1fr]">
          <div className="border border-line bg-map-2">
            <div className="relative aspect-square bg-map">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="220px"
                className="object-contain p-4"
                unoptimized={isRemoteImage(product.image)}
              />
            </div>
            <div className="p-3">
              <p dir="auto" className="text-ink">{product.name}</p>
              <p className="mt-1 font-mono text-sm">
                <span className="text-dim line-through">{product.price} DH</span>{" "}
                <span className="text-flare">0 DH</span>
              </p>
            </div>
          </div>

          <form action={claimReward} className="space-y-4 border border-line bg-map-2 p-6">
            <input type="hidden" name="product" value={product.slug} />

            <div>
              <label htmlFor="name" className="block text-sm text-dim">الإسم الكامل</label>
              <input id="name" name="name" required minLength={3} maxLength={80} autoComplete="name"
                className="mt-1 w-full border border-line bg-map p-3 text-ink outline-none focus:border-flare" />
            </div>

            <div>
              <label htmlFor="cityId" className="block text-sm text-dim">المدينة (ثمن التوصيل)</label>
              <select id="cityId" name="cityId" required defaultValue=""
                className="mt-1 w-full border border-line bg-map p-3 text-ink outline-none focus:border-flare">
                <option value="" disabled>ختار المدينة</option>
                {cities.map((city) => (
                  <option key={city.city_id} value={city.city_id}>
                    {city.name} — {city.delivered_price} DH
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm text-dim">العنوان</label>
              <input id="address" name="address" required minLength={6} maxLength={200} autoComplete="street-address"
                className="mt-1 w-full border border-line bg-map p-3 text-ink outline-none focus:border-flare" />
            </div>

            <p className="text-sm text-dim">
              كتوصلك رسالة WhatsApp باش تأكد الطلب، بحال أي طلب عادي.
            </p>

            {error && errors[error] && (
              <p role="alert" className="border border-hazard/40 bg-hazard/10 p-3 text-sm text-hazard">
                {errors[error]}
              </p>
            )}

            <button type="submit" className="w-full bg-flare p-4 font-arabic text-[20px] text-[#140a02] transition hover:bg-zone">
              خود الهدية
            </button>
            <Link href="/account" className="block text-center text-sm text-dim underline hover:text-ink">
              رجع
            </Link>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
