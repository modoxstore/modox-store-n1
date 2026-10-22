import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,name,stock,price,active,ozon_ref")
    .order("name");

  if (error) throw new Error("Unable to load stock");

  const products = data ?? [];
  const outOfStock = products.filter(p => p.stock <= 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);

  return (
    <main dir="rtl" className="min-h-screen bg-[#050807] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-green-400">← Dashboard</Link>
        <h1 className="my-8 text-3xl font-black text-green-400">
          Gestion de Stock
        </h1>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["عدد المنتجات", products.length],
            ["مخزون منخفض", lowStock.length],
            ["نفاد المخزون", outOfStock.length],
          ].map(([label,value]) => (
            <div key={String(label)}
              className="rounded-2xl border border-green-500/20 bg-[#101713] p-5">
              <p className="text-zinc-400">{label}</p>
              <h2 className="mt-3 text-3xl font-black text-green-400">{value}</h2>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#101713]">
          <table className="w-full min-w-[650px] text-right">
            <thead className="border-b border-white/10 text-green-400">
              <tr>
                {["المنتج","الكمية","الحالة","مرجع Ozon","الظهور"].map(title => (
                  <th key={title} className="p-4">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-white/10">
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    {p.stock <= 0 ? "نفد" : p.stock <= 5 ? "منخفض" : "متوفر"}
                  </td>
                  <td className="p-4" dir="ltr">{p.ozon_ref ?? "—"}</td>
                  <td className="p-4">{p.active ? "ظاهر" : "مخفي"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-xs text-zinc-500">
          الكميات من Supabase، وقد تختلف عن المخزون الفعلي عند Ozon.
          تعديل الكميات متاح من Gestion des Produits.
        </p>
      </div>
    </main>
  );
}