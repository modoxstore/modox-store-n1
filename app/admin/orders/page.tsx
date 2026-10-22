import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const statuses = ["all", "new", "confirmed", "cancelled"] as const;

type SearchParams = {
  page?: string | string[];
  status?: string | string[];
  q?: string | string[];
};

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function ordersUrl(page: number, status: string, q: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  return `/admin/orders?${params.toString()}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const requestedPage = Number(first(params.page));

  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, 100000)
      : 1;

  const rawStatus = first(params.status);
  const status = statuses.includes(
    rawStatus as (typeof statuses)[number]
  ) ? rawStatus : "all";

  // Only allow safe characters inside PostgREST filter syntax.
  const q = first(params.q)
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .slice(0, 60);

  function baseQuery() {
    let query = supabaseAdmin
      .from("orders")
      .select(
        "id,customer_name,phone,city,address,total,delivery_fee,status,created_at",
        { count: "exact" }
      )
      .eq("source", "modox_v2");

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `customer_name.ilike.${pattern},phone.ilike.${pattern},city.ilike.${pattern},address.ilike.${pattern}`
      );
    }

    return query;
  }

  const countResult = await baseQuery().range(0, 0);

  if (countResult.error) {
    console.error("Admin orders count error:", countResult.error.message);
    throw new Error("Could not load orders count");
  }

  const total = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const from = (currentPage - 1) * PAGE_SIZE;

  const { data, error } = await baseQuery()
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("Admin orders error:", error.message);
    throw new Error("Could not load orders");
  }

  const rows = data ?? [];

  return (
    <main dir="rtl" className="min-h-screen bg-[#050807] p-5 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-green-400">
              Gestion des Commandes
            </h1>
            <p className="mt-2 text-zinc-400">
              جميع طلبات V2 — بحث وفلاتر مباشرة من Supabase
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-green-500/30 px-5 py-3 text-green-400"
          >
            الرجوع للوحة التحكم
          </Link>
        </header>

        <section className="mb-6 rounded-2xl border border-green-500/20 bg-[#101713] p-5">
          <form method="get" className="flex flex-wrap gap-3">
            <input
              name="q"
              type="search"
              maxLength={60}
              defaultValue={q}
              placeholder="اسم الزبون، الهاتف، المدينة أو العنوان..."
              className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-[#080d0a] p-3 text-white"
            />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              className="rounded-xl bg-green-400 px-6 py-3 font-bold text-black"
            >
              بحث
            </button>
            <Link
              href="/admin/orders"
              className="rounded-xl border border-white/20 px-5 py-3 text-zinc-300"
            >
              مسح البحث
            </Link>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "جميع الطلبات"],
              ["new", "جديدة"],
              ["confirmed", "مؤكدة"],
              ["cancelled", "ملغاة"],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={ordersUrl(1, value, q)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  status === value
                    ? "bg-green-400 text-black"
                    : "border border-white/10 bg-black/30 text-zinc-300"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="mt-4 text-sm text-zinc-400">
            النتائج: {total} طلب
          </p>
        </section>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#101713]">
          <table className="w-full min-w-[1000px] text-right text-sm">
            <thead className="border-b border-white/10 text-green-400">
              <tr>
                {[
                  "التاريخ", "الزبون", "الهاتف", "المدينة",
                  "العنوان", "المبلغ", "التوصيل", "الحالة",
                ].map(title => (
                  <th key={title} className="p-4">{title}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map(order => {
                const testOrder =
                  (order.customer_name ?? "").toUpperCase().includes("TEST") ||
                  (order.address ?? "").toUpperCase().includes("DO NOT SHIP");

                return (
                  <tr key={order.id} className="border-b border-white/10">
                    <td className="p-4">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("fr-MA")
                        : "—"}
                    </td>
                    <td className="p-4 font-bold">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-green-400 hover:underline"
                      >
                        {order.customer_name || "—"}
                      </Link>
                      {testOrder && (
                        <span className="mr-2 rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
                          TEST
                        </span>
                      )}
                    </td>
                    <td className="p-4" dir="ltr">{order.phone || "—"}</td>
                    <td className="p-4">{order.city || "—"}</td>
                    <td className="max-w-xs p-4">{order.address || "—"}</td>
                    <td className="p-4 font-bold text-green-400">
                      {order.total} DH
                    </td>
                    <td className="p-4">{order.delivery_fee ?? 0} DH</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 ${
                        order.status === "confirmed"
                          ? "bg-green-500/10 text-green-400"
                          : order.status === "cancelled"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-300"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-zinc-400">
                    ما كاين حتى طلب مطابق للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#101713] p-4">
          <p className="text-sm text-zinc-400">
            الصفحة {currentPage} من {totalPages}
          </p>

          <div className="flex gap-3">
            {currentPage > 1 ? (
              <Link
                href={ordersUrl(currentPage - 1, status, q)}
                className="rounded-xl border border-green-500/30 px-5 py-2 text-green-400"
              >
                السابقة
              </Link>
            ) : (
              <span className="rounded-xl border border-white/10 px-5 py-2 text-zinc-600">
                السابقة
              </span>
            )}

            {currentPage < totalPages ? (
              <Link
                href={ordersUrl(currentPage + 1, status, q)}
                className="rounded-xl bg-green-400 px-5 py-2 font-bold text-black"
              >
                التالية
              </Link>
            ) : (
              <span className="rounded-xl bg-zinc-800 px-5 py-2 text-zinc-500">
                التالية
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
