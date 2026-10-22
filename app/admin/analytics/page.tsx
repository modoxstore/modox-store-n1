import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id,total,status,created_at")
    .eq("source", "modox_v2")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw new Error("Unable to load analytics");

  const orders = data ?? [];
  const confirmed = orders.filter(o => o.status === "confirmed");
  const cancelled = orders.filter(o => o.status === "cancelled");
  const revenue = confirmed.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const stats = [
    { title: "عدد الطلبات V2", value: orders.length },
    { title: "الطلبات المؤكدة", value: confirmed.length },
    { title: "الطلبات الملغاة", value: cancelled.length },
    { title: "قيمة الطلبات المؤكدة", value: `${revenue} DH` },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#050807] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-green-400">← Dashboard</Link>
        <h1 className="my-8 text-3xl font-black text-green-400">Analytics</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map(item => (
            <div key={item.title}
              className="rounded-2xl border border-green-500/20 bg-[#101713] p-6">
              <p className="text-zinc-400">{item.title}</p>
              <h2 className="mt-4 text-3xl font-black text-green-400">
                {item.value}
              </h2>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-zinc-500">
          إحصائيات طلبات V2 فقط. المجموع يشمل التوصيل،
          والبيانات مقتصرة على آخر 1000 طلب.
        </p>
      </div>
    </main>
  );
}