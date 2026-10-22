import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";

const sections = [
  {
    title: "Gestion des Produits",
    description: "إضافة وتعديل المنتجات والصور والعروض",
    href: "/admin/products",
    icon: "📦",
  },
  {
    title: "Gestion des Commandes",
    description: "الطلبات ومعلومات الزبناء والتوصيل",
    href: "/admin/orders",
    icon: "🛒",
  },
  {
    title: "Gestion de Stock",
    description: "المخزون والمنتجات المنخفضة والمنتهية",
    href: "/admin/stock",
    icon: "📋",
  },
  {
    title: "Analytics",
    description: "المبيعات والإحصائيات",
    href: "/admin/analytics",
    icon: "📊",
  },
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main dir="rtl" className="min-h-screen bg-[#050807] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-green-400">
            MODOX ADMIN V2
          </h1>
          <p className="mt-3 text-zinc-400">
            لوحة التحكم الرئيسية
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map(section => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl border border-green-500/30 bg-[#101713] p-7 transition hover:bg-green-500/10"
            >
              <span className="text-4xl">{section.icon}</span>
              <h2 className="mt-4 text-xl font-black text-green-400">
                {section.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}