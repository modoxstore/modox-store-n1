import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

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

  const testOrder =
    order.customer_name?.toUpperCase().includes("TEST") ||
    order.address?.toUpperCase().includes("DO NOT SHIP");

  const card = "rounded-2xl border border-white/10 bg-[#101713] p-5";

  return (
    <main dir="rtl" className="min-h-screen bg-[#050807] p-5 text-white md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/orders" className="text-green-400">
          ← الرجوع للطلبات
        </Link>

        <h1 className="mt-6 text-3xl font-black text-green-400">
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
            <p className="mt-2 text-4xl font-black text-green-400">
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
                  <p className="font-bold text-green-400">
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
          </section>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          عرض المعلومات فقط — لا توجد أي عملية إرسال أو تغيير حالة.
        </p>
      </div>
    </main>
  );
}
