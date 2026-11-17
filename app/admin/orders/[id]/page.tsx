import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { changeOrderStatus, markDelivered, retryOzon } from "../../orderActions";

export const dynamic = "force-dynamic";

const errorLabels: Record<string, string> = {
  "Order is no longer new": "الطلب ماشي جديد، تبدلات الحالة ديالو من قبل.",
  "Test order blocked": "طلب تجريبي (TEST / DO NOT SHIP): ما يمكنش يتأكد.",
  "Order already entered Ozon fulfillment": "الطلب دخل لـ Ozon من قبل.",
  "WhatsApp already processed this order": "الزبون جاوب على WhatsApp من قبل.",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; done?: string; ozon?: string; xp?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error: actionError, done, ozon: ozonSendStatus, xp } = await searchParams;

  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id,customer_name,phone,city,address,total,delivery_fee,status,created_at")
    .eq("id", id)
    .eq("source", "modox_v2")
    .maybeSingle();

  if (orderError) throw new Error("Could not load order");
  if (!order) notFound();

  const [itemsResult, whatsappResult, ozonResult] = await Promise.all([
    supabaseAdmin
      .from("order_items")
      .select("product_id,quantity,price")
      .eq("order_id", id),
    supabaseAdmin
      .from("whatsapp_order_confirmations")
      .select("status,message_id,responded_at")
      .eq("order_id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("ozon_fulfillments")
      .select("status,tracking_number,last_error")
      .eq("order_id", id)
      .maybeSingle(),
  ]);

  if (itemsResult.error || whatsappResult.error || ozonResult.error) {
    console.error("Order details lookup failed", {
      items: itemsResult.error?.message,
      whatsapp: whatsappResult.error?.message,
      ozon: ozonResult.error?.message,
    });
    throw new Error("Could not load order details");
  }

  const items = itemsResult.data ?? [];
  const ids = [...new Set(items.map(item => item.product_id))];

  const productResult = ids.length
    ? await supabaseAdmin.from("products").select("id,name").in("id", ids)
    : { data: [], error: null };

  if (productResult.error) {
    throw new Error("Could not load product names");
  }

  const productNames = new Map(
    (productResult.data ?? []).map(p => [p.id, p.name])
  );

  const whatsapp = whatsappResult.data;
  const ozon = ozonResult.data;

  // XP tables may be missing until the accounts migration runs; the order
  // page must still work, so these lookups never throw.
  const [deliveryResult, rewardResult] = await Promise.all([
    supabaseAdmin.from("order_deliveries").select("delivered_at").eq("order_id", id).maybeSingle(),
    supabaseAdmin.from("reward_claims").select("xp_spent").eq("order_id", id).maybeSingle(),
  ]);
  const delivered = deliveryResult.data;
  const reward = rewardResult.data;

  const testOrder =
    order.customer_name?.toUpperCase().includes("TEST") ||
    order.address?.toUpperCase().includes("DO NOT SHIP");

  const card = "rounded-2xl border border-white/10 bg-map-2 p-5";

  return (
    <main dir="rtl" className="min-h-screen bg-map p-5 text-white md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/orders" className="text-flare">
          ← الرجوع للطلبات
        </Link>

        <h1 className="mt-6 text-3xl font-black text-flare">
          تفاصيل الطلب
        </h1>

        <p className="mt-2 break-all text-xs text-zinc-500">
          {order.id}
        </p>

        {testOrder && (
          <div className="mt-5 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 font-bold text-yellow-300">
            طلب تجريبي محتمل — لا ترسله للشحن
          </div>
        )}

        {done && (
          <div role="status" className="mt-5 rounded-xl border border-flare/40 bg-flare/10 p-4 font-bold text-flare">
            {done === "confirmed"
              ? "تم تأكيد الطلب."
              : done === "delivered"
                ? `تسجل الطلب كمسلَّم. الزبون خدا ${Number(xp) || 0} XP.`
                : "تم إلغاء الطلب ورجع المخزون."}
          </div>
        )}

        {reward && (
          <div className="mt-5 rounded-xl border border-flare/40 bg-flare/10 p-4 font-bold text-flare">
            🎁 هدية Legendary: المنتج فابور، الزبون كيخلص غير التوصيل ({reward.xp_spent} XP تحسبو).
          </div>
        )}

        {order.status === "confirmed" && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {delivered ? (
              <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300">
                ✅ تسلَّم وتخلص ({new Date(delivered.delivered_at).toLocaleDateString("fr-MA")})
              </p>
            ) : (
              <form action={markDelivered}>
                <input type="hidden" name="orderId" value={order.id} />
                <button
                  type="submit"
                  className="rounded-xl border border-flare/60 px-6 py-3 font-black text-flare hover:bg-flare/10"
                >
                  تسلَّم وتخلص (عطي XP)
                </button>
              </form>
            )}
          </div>
        )}

        {ozonSendStatus && (
          <div
            role="status"
            className={`mt-3 rounded-xl border p-4 font-bold ${
              ozonSendStatus === "created"
                ? "border-flare/40 bg-flare/10 text-flare"
                : "border-orange-500/40 bg-orange-500/10 text-orange-300"
            }`}
          >
            {ozonSendStatus === "created"
              ? "تصيفط الطلب لـ Ozon Express وتصاوب الكولي."
              : ozonSendStatus === "disabled"
                ? "Ozon مسدود دابا: الكولي ما تصاوبش."
                : ozonSendStatus === "already_claimed"
                  ? "الطلب دخل لـ Ozon من قبل."
                  : "Ozon ما قبلش الطلب. شوف الخانة ديال Ozon Express لتحت."}
          </div>
        )}

        {actionError && (
          <div role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 font-bold text-red-300">
            {errorLabels[actionError] ?? "ما تبدلاتش الحالة: " + actionError}
          </div>
        )}

        {order.status === "new" && (
          <div className="mt-5 flex flex-wrap gap-3">
            <form action={changeOrderStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="action" value="confirmed" />
              <button
                type="submit"
                disabled={testOrder}
                className="rounded-xl bg-flare px-6 py-3 font-black text-black hover:bg-[#ff9445] disabled:cursor-not-allowed disabled:opacity-40"
              >
                تأكيد الطلب
              </button>
            </form>

            <form action={changeOrderStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="action" value="cancelled" />
              <button
                type="submit"
                disabled={testOrder}
                className="rounded-xl border border-red-500/50 px-6 py-3 font-black text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                إلغاء الطلب
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <section className={card}>
            <h2 className="mb-4 text-xl font-bold">معلومات الزبون</h2>
            <div className="space-y-3 text-sm">
              <p>الاسم: {order.customer_name}</p>
              <p dir="ltr" className="text-right">الهاتف: {order.phone}</p>
              <p>المدينة: {order.city}</p>
              <p>العنوان: {order.address}</p>
              <p>حالة الطلب: <strong>{order.status}</strong></p>
              <p>
                التاريخ: {order.created_at
                  ? new Date(order.created_at).toLocaleString("fr-MA")
                  : "—"}
              </p>
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-xl font-bold">المبلغ</h2>
            <p className="text-sm text-zinc-400">المجموع شامل التوصيل</p>
            <p className="mt-2 text-4xl font-black text-flare">
              {order.total} DH
            </p>
            <p className="mt-4 text-sm">
              التوصيل: {order.delivery_fee ?? 0} DH
            </p>
            <p className="mt-2 text-sm">
              المنتجات: {order.total - (order.delivery_fee ?? 0)} DH
            </p>
          </section>
        </div>

        <section className={`${card} mt-5`}>
          <h2 className="mb-4 text-xl font-bold">المنتجات المطلوبة</h2>

          {items.length === 0 ? (
            <p className="text-zinc-400">لا توجد تفاصيل منتجات مسجلة.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.product_id}-${index}`}
                  className="flex flex-wrap justify-between gap-3 border-b border-white/10 pb-3"
                >
                  <div>
                    <p className="font-bold">
                      {productNames.get(item.product_id) ?? "منتج غير معروف"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      الكمية: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-flare">
                    {item.price} DH × {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <section className={card}>
            <h2 className="mb-3 text-xl font-bold">WhatsApp</h2>
            <p>الحالة: {whatsapp?.status ?? "لم يتم الإرسال"}</p>
            <p className="mt-2 break-all text-xs text-zinc-500">
              Message ID: {whatsapp?.message_id ?? "—"}
            </p>
          </section>

          <section className={card}>
            <h2 className="mb-3 text-xl font-bold">Ozon Express</h2>
            <p>الحالة: {ozon?.status ?? "لم يتم إنشاء الشحنة"}</p>
            <p className="mt-2">
              Tracking: {ozon?.tracking_number ?? "—"}
            </p>
            {ozon?.last_error && (
              <p className="mt-3 break-words text-sm text-orange-300">
                {ozon.last_error}
              </p>
            )}
            {order.status === "confirmed" && ozon?.status === "failed" && (
              <form action={retryOzon} className="mt-4">
                <input type="hidden" name="orderId" value={order.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-flare px-5 py-2 font-black text-black hover:bg-[#ff9445]"
                >
                  عاود صيفط لـ Ozon
                </button>
              </form>
            )}
          </section>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          التأكيد هنا كيبدل حالة الطلب وكيصيفطو لـ Ozon Express إلا كان Ozon مفعل.
        </p>
      </div>
    </main>
  );
}
