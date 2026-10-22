"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  customer_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  total: number;
  delivery_fee: number | null;
  status: string | null;
  created_at: string | null;
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return orders.filter(order => {
      if (status !== "all" && order.status !== status) return false;

      if (!search) return true;

      return [
        order.id,
        order.customer_name,
        order.phone,
        order.city,
        order.address,
      ].some(value => String(value ?? "").toLowerCase().includes(search));
    });
  }, [orders, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const counts = {
    all: orders.length,
    new: orders.filter(o => o.status === "new").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const statuses = [
    { value: "all", label: "جميع الطلبات" },
    { value: "new", label: "جديدة" },
    { value: "confirmed", label: "مؤكدة" },
    { value: "cancelled", label: "ملغاة" },
  ] as const;

  return (
    <>
      <div className="mb-6 rounded-2xl border border-green-500/20 bg-[#101713] p-5">
        <input
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="بحث بالاسم، الهاتف، المدينة أو رقم الطلب..."
          className="w-full rounded-xl border border-white/10 bg-[#080d0a] p-4 text-white outline-none focus:border-green-400"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map(item => (
            <button
              type="button"
              key={item.value}
              onClick={() => {
                setStatus(item.value);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                status === item.value
                  ? "bg-green-400 text-black"
                  : "border border-white/10 bg-black/30 text-zinc-300 hover:border-green-400/40"
              }`}
            >
              {item.label} ({counts[item.value]})
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          النتائج: {filtered.length} من أصل {orders.length} طلب محمّل
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#101713]">
        <table className="w-full min-w-[1000px] text-right text-sm">
          <thead className="border-b border-white/10 text-green-400">
            <tr>
              {["التاريخ","الزبون","الهاتف","المدينة","العنوان","المبلغ","التوصيل","الحالة"].map(h => (
                <th key={h} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map(order => (
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
                </td>
                <td className="p-4" dir="ltr">{order.phone || "—"}</td>
                <td className="p-4">{order.city || "—"}</td>
                <td className="max-w-xs p-4">{order.address || "—"}</td>
                <td className="p-4 font-bold text-green-400">{order.total} DH</td>
                <td className="p-4">{order.delivery_fee ?? 0} DH</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 ${
                    order.status === "confirmed"
                      ? "bg-green-500/10 text-green-400"
                      : order.status === "cancelled"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-300"
                  }`}>
                    {order.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
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
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded-xl border border-green-500/30 px-5 py-2 text-green-400 disabled:opacity-30"
          >
            السابقة
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="rounded-xl bg-green-400 px-5 py-2 font-bold text-black disabled:opacity-30"
          >
            التالية
          </button>
        </div>
      </div>
    </>
  );
}
