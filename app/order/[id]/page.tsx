import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Check, Package, Plane, Truck, X } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import ElapsedClock from "@/components/store/ElapsedClock";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "تتبع الطلب",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function OrderTrackingPage({ params }: Props) {
  await connection();
  const { id } = await params;

  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) notFound();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id,customer_name,phone,city,total,delivery_fee,status,created_at")
    .eq("id", id)
    .eq("source", "modox_v2")
    .maybeSingle();

  if (!order) notFound();

  const [itemsResult, waResult, ozonResult] = await Promise.all([
    supabaseAdmin
      .from("order_items")
      .select("quantity,price,products(name)")
      .eq("order_id", id),
    supabaseAdmin
      .from("whatsapp_order_confirmations")
      .select("status")
      .eq("order_id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("ozon_fulfillments")
      .select("status,tracking_number")
      .eq("order_id", id)
      .maybeSingle(),
  ]);

  const items = (itemsResult.data ?? []).map((item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    return {
      name: (product as { name?: string } | null)?.name ?? "منتج",
      quantity: item.quantity,
      price: item.price,
    };
  });

  const cancelled = order.status === "cancelled";
  const confirmed = order.status === "confirmed";
  const shipped = ozonResult.data?.status === "created";
  const tracking = ozonResult.data?.tracking_number ?? null;
  const firstName = (order.customer_name ?? "").trim().split(/\s+/)[0];
  const phoneEnd = String(order.phone ?? "").slice(-2);

  const steps = [
    {
      icon: Package,
      title: "الدروب تسجل",
      body: "الطلب ديالك وصلنا وتحجز ليك الستوك.",
      done: true,
    },
    {
      icon: Check,
      title: "تأكيد فـ WhatsApp",
      body:
        waResult.data?.status === "sent"
          ? "صيفطنا ليك رسالة، برك على «تأكيد الطلب»."
          : "كتوصلك رسالة فيها المجموع، برك على «تأكيد الطلب».",
      done: confirmed || shipped,
    },
    {
      icon: Truck,
      title: "عند Ozon Express",
      body: tracking ? `رقم التتبع: ${tracking}` : "ملي تأكد، كنصيفطوها لـ Ozon.",
      done: shipped,
    },
    {
      icon: Plane,
      title: "كتوصلك لباب الدار",
      body: "كتخلص كاش ملي تشد الطلب.",
      done: false,
    },
  ];

  const current = cancelled ? -1 : steps.findIndex((s) => !s.done);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto min-h-screen max-w-[960px] px-4 py-10 sm:px-6">
        <p dir="ltr" className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-flare">
          Drop #{order.id.slice(0, 8)}
        </p>
        <h1 className="mt-1 font-arabic text-[38px] leading-tight text-ink sm:text-[50px]">
          {cancelled ? "الطلب تلغى" : `مرحبا ${firstName}، الدروب ديالك فالطريق`}
        </h1>

        <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
          <div className="bg-map-2 p-4">
            <p className="text-xs text-dim">الوقت من التسجيل</p>
            <p className="mt-1 font-head text-2xl font-bold text-flare">
              <ElapsedClock since={order.created_at} />
            </p>
          </div>
          <div className="bg-map-2 p-4">
            <p className="text-xs text-dim">المدينة</p>
            <p className="mt-1 text-lg text-ink">{order.city}</p>
          </div>
          <div className="bg-map-2 p-4">
            <p className="text-xs text-dim">المجموع مع التوصيل</p>
            <p dir="ltr" className="mt-1 text-right font-head text-2xl font-bold text-ink">
              {order.total} DH
            </p>
          </div>
        </div>

        {cancelled ? (
          <div className="mt-8 flex items-start gap-3 border border-line bg-map-2 p-5 text-dim">
            <X className="mt-0.5 shrink-0" />
            <p>هاد الطلب تلغى. إلا بغيتي تعاود، دوز طلب جديد من المتجر.</p>
          </div>
        ) : (
          <ol className="relative mt-10 space-y-6 border-r-2 border-line pr-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isCurrent = i === current;
              return (
                <li key={step.title} className="relative">
                  <span
                    className={`absolute -right-[49px] top-0 flex h-9 w-9 items-center justify-center border-2 ${
                      step.done
                        ? "border-flare bg-flare text-[#140a02]"
                        : isCurrent
                          ? "anim-zone border-flare bg-map text-flare"
                          : "border-line bg-map text-dim"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <h2 className={`font-arabic text-[22px] ${step.done || isCurrent ? "text-ink" : "text-dim"}`}>
                    {step.title}
                  </h2>
                  <p className="mt-1 text-[15px] text-dim">{step.body}</p>
                </li>
              );
            })}
          </ol>
        )}

        <section className="mt-10 border border-line bg-map-2">
          <h2 className="border-b border-line px-5 py-3 font-arabic text-[20px] text-ink">محتوى الصندوق</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.name} className="flex justify-between gap-4 px-5 py-3">
                <span dir="auto" className="text-ink">
                  {item.name} <span className="text-dim">× {item.quantity}</span>
                </span>
                <span dir="ltr" className="font-mono text-dim">{item.price * item.quantity} DH</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 px-5 py-3 text-dim">
              <span>التوصيل Ozon Express</span>
              <span dir="ltr" className="font-mono">{order.delivery_fee ?? 0} DH</span>
            </li>
          </ul>
        </section>

        <p className="mt-6 text-sm text-dim">
          الهاتف: ••••••••{phoneEnd} · حفظ هاد الصفحة باش ترجع تشوف الطلب ديالك فأي وقت.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block border border-line bg-map-2 px-6 py-3 font-arabic text-[18px] text-ink transition hover:border-flare"
        >
          رجع للمتجر
        </Link>
      </main>
      <Footer />
    </>
  );
}
