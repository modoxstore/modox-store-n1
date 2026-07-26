import {
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10+",
    title: "عميل سعيد",
  },
  {
    icon: PackageCheck,
    value: "10+",
    title: "طلب تم تسليمه",
  },
  {
    icon: Truck,
    value: "24-48H",
    title: "مدة التوصيل",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    title: "جودة مضمونة",
  },
];

export default function Stats() {
  return (
    <section className="bg-[#020504] py-12" dir="rtl">
      <div className="mx-auto grid max-w-[1450px] gap-5 px-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#070b0a] p-7 text-center transition hover:-translate-y-1 hover:border-green-400/30"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                <Icon size={28} />
              </div>

              <h3 className="text-3xl font-black text-green-400">
                {item.value}
              </h3>

              <p className="mt-2 text-zinc-400">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
