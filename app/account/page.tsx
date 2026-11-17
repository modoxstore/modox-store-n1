import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Gift, Lock } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";
import { logout } from "./actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { accountsEnabled, getCurrentCustomer, getXpBalance } from "@/lib/customerAuth";
import { getStoreProducts } from "@/lib/storeProducts";
import { isRemoteImage } from "@/lib/catalog";
import { LEGENDARY_XP, REWARD_MAX_PRICE, levelFor, nextLevel, xpLevels } from "@/lib/xp";

export const metadata: Metadata = {
  title: "الحساب ديالي",
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  new: "كيتسنى التأكيد",
  confirmed: "مأكد",
  cancelled: "ملغي",
};

const errors: Record<string, string> = {
  product: "هاد المنتج ما بقاش متوفر للهدية. ختار واحد آخر.",
  reward: "ما قدرناش نسجلو الهدية. تأكد من الـ XP وعاود جرب.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AccountPage({ searchParams }: Props) {
  await connection();
  const { error } = await searchParams;

  if (!accountsEnabled()) {
    return (
      <Shell>
        <h1 className="font-arabic text-[40px] text-ink">الحساب و XP</h1>
        <p className="mt-4 text-dim">قريباً: كل طلب كيجمع ليك XP، وملي توصل Legendary كتاخد منتج فابور.</p>
      </Shell>
    );
  }

  const customer = await getCurrentCustomer();

  if (!customer) {
    return (
      <Shell>
        <p dir="ltr" className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-flare">
          Player login
        </p>
        <h1 className="mt-1 font-arabic text-[40px] leading-tight text-ink sm:text-[50px]">
          دخل للحساب ديالك
        </h1>
        <p className="mt-3 max-w-xl text-dim">
          كل درهم كتشري بيه = 1 XP. ملي توصل {LEGENDARY_XP} XP (Legendary) كتختار منتج
          أقل من {REWARD_MAX_PRICE} DH فابور، وكتخلص غير التوصيل.
        </p>
        <LoginForm />
      </Shell>
    );
  }

  const [xp, ordersResult, historyResult, products] = await Promise.all([
    getXpBalance(customer.phone),
    supabaseAdmin
      .from("orders")
      .select("id,total,status,created_at")
      .eq("phone", customer.phone)
      .eq("source", "modox_v2")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("xp_events")
      .select("id,amount,reason,created_at")
      .eq("phone", customer.phone)
      .order("created_at", { ascending: false })
      .limit(20),
    getStoreProducts(),
  ]);

  const level = levelFor(xp);
  const next = nextLevel(xp);
  const progress = Math.min(100, Math.round((xp / LEGENDARY_XP) * 100));
  const unlocked = xp >= LEGENDARY_XP;
  const rewards = products.filter((p) => p.price < REWARD_MAX_PRICE && p.stock > 0);
  const orders = ordersResult.data ?? [];
  const history = historyResult.data ?? [];

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p dir="ltr" className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-flare">
            Player •••{customer.phone.slice(-4)}
          </p>
          <h1 className="mt-1 font-arabic text-[40px] leading-tight text-ink sm:text-[50px]">
            الحساب ديالي
          </h1>
        </div>
        <form action={logout}>
          <button type="submit" className="border border-line px-4 py-2 text-sm text-dim hover:border-flare hover:text-ink">
            خروج
          </button>
        </form>
      </div>

      {error && errors[error] && (
        <p role="alert" className="mt-6 border border-hazard/40 bg-hazard/10 p-3 text-hazard">
          {errors[error]}
        </p>
      )}

      <section className="mt-8 border border-line bg-map-2 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-head text-5xl font-bold text-flare" dir="ltr">
            {xp} <span className="text-2xl text-dim">XP</span>
          </p>
          <p className="font-arabic text-[24px] text-ink">
            {level.ar} <span dir="ltr" className="font-mono text-sm text-dim">{level.label}</span>
          </p>
        </div>

        <div className="mt-5 h-3 w-full bg-map" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={LEGENDARY_XP}>
          <div className="h-full bg-flare transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div dir="ltr" className="mt-2 flex justify-between font-mono text-[11px] text-dim">
          {xpLevels.map((item) => (
            <span key={item.key} className={xp >= item.min ? "text-flare" : ""}>
              {item.label} {item.min}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm text-dim">
          {next
            ? `باقي ليك ${next.min - xp} XP باش توصل ${next.ar} (${next.label}).`
            : "وصلتي Legendary! ختار الهدية ديالك تحت."}{" "}
          الـ XP كيتزاد ملي كيتسلم الطلب وتخلصو (1 XP لكل درهم، بلا التوصيل).
        </p>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-arabic text-[26px] text-ink">
          {unlocked ? <Gift className="text-flare" /> : <Lock className="text-dim" />}
          الهدية ديال Legendary
        </h2>
        <p className="mt-1 text-sm text-dim">
          أي منتج أقل من {REWARD_MAX_PRICE} DH فابور، كتخلص غير التوصيل. كيتحسبو ليك {LEGENDARY_XP} XP.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
          {rewards.map((product) => {
            const card = (
              <>
                <div className="relative aspect-square bg-map">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className={`object-contain p-3 ${unlocked ? "" : "opacity-40 grayscale"}`}
                    unoptimized={isRemoteImage(product.image)}
                  />
                </div>
                <div className="p-3">
                  <p dir="auto" className="line-clamp-2 text-sm text-ink">{product.name}</p>
                  <p className="mt-1 font-mono text-xs text-dim">
                    <span className="line-through">{product.price} DH</span>{" "}
                    <span className={unlocked ? "text-flare" : ""}>فابور</span>
                  </p>
                </div>
              </>
            );
            return unlocked ? (
              <Link
                key={product.id}
                href={`/account/reward?product=${encodeURIComponent(product.slug)}`}
                className="bg-map-2 transition hover:bg-map-3"
              >
                {card}
              </Link>
            ) : (
              <div key={product.id} className="bg-map-2">{card}</div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-map-2">
          <h2 className="border-b border-line px-5 py-3 font-arabic text-[20px] text-ink">الطلبات ديالي</h2>
          {orders.length === 0 ? (
            <p className="px-5 py-4 text-sm text-dim">مازال ما عندك حتى طلب بهاد الرقم.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/order/${order.id}`} className="flex justify-between gap-4 px-5 py-3 hover:bg-map-3">
                    <span className="text-sm text-ink">
                      <span dir="ltr" className="font-mono text-dim">#{order.id.slice(0, 8)}</span>{" "}
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <span dir="ltr" className="font-mono text-sm text-dim">{order.total} DH</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-line bg-map-2">
          <h2 className="border-b border-line px-5 py-3 font-arabic text-[20px] text-ink">تاريخ الـ XP</h2>
          {history.length === 0 ? (
            <p className="px-5 py-4 text-sm text-dim">الـ XP كيبان هنا ملي يتسلم أول طلب.</p>
          ) : (
            <ul className="divide-y divide-line">
              {history.map((event) => (
                <li key={event.id} className="flex justify-between gap-4 px-5 py-3 text-sm">
                  <span className="text-ink">
                    {event.reason === "order_delivered" ? "طلب تسلم" : "هدية Legendary"}
                  </span>
                  <span dir="ltr" className={`font-mono ${event.amount > 0 ? "text-flare" : "text-dim"}`}>
                    {event.amount > 0 ? "+" : ""}{event.amount} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto min-h-screen max-w-[1100px] px-4 py-10 sm:px-6">{children}</main>
      <Footer />
    </>
  );
}
