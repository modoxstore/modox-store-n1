import Link from "next/link";
import {
  BatteryCharging,
  Gamepad2,
  Headphones,
  Keyboard,
  Smartphone,
  Snowflake,
} from "lucide-react";


const categories = [
  {
    title: "مبردات الهاتف",
    description: "حافظ على أداء الهاتف أثناء اللعب",
    href: "/shop?category=phone-coolers",
    icon: Snowflake,
  },
  {
    title: "أدوات التحكم",
    description: "تحكم أفضل ودقة أكبر داخل اللعبة",
    href: "/shop?category=controllers",
    icon: Gamepad2,
  },
  {
    title: "السماعات",
    description: "صوت واضح وتجربة Gaming أقوى",
    href: "/shop?category=audio",
    icon: Headphones,
  },
  {
    title: "الشحن والطاقة",
    description: "شواحن وPower Banks للاستخدام اليومي",
    href: "/shop?category=charging",
    icon: BatteryCharging,
  },
  {
    title: "إكسسوارات الهاتف",
    description: "منتجات عملية لحماية وتطوير هاتفك",
    href: "/shop?category=mobile-accessories",
    icon: Smartphone,
  },
  {
    title: "Gaming Gear",
    description: "كيبورد، ماوس وإكسسوارات اللاعبين",
    href: "/shop?category=gaming-gear",
    icon: Keyboard,
  },
];

export default function Categories() {
  return (
    <section
  id="categories"
  dir="rtl"
  className="relative overflow-hidden border-y border-white/5 bg-[#030706] py-20"
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,255,128,0.06),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(0,140,255,0.05),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-black tracking-wide text-green-400">
            استكشف المتجر
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            تسوق حسب التصنيف
          </h2>

          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            اختر التصنيف المناسب واكتشف منتجات Gaming وإكسسوارات الهاتف
            المختارة بعناية.
          </p>
        </div>

        {/* Categories grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-green-400/35 hover:bg-green-400/[0.05]"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-green-400/0 blur-3xl transition duration-500 group-hover:bg-green-400/10" />

                <div className="relative flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-green-400/20 bg-green-400/10 text-green-400 transition duration-300 group-hover:scale-110 group-hover:border-green-400/40">
                    <Icon size={28} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white transition group-hover:text-green-400">
                      {category.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {category.description}
                    </p>

                    <p className="mt-4 text-sm font-bold text-green-400">
                      اكتشف المنتجات
                      <span className="mr-2 inline-block transition-transform group-hover:-translate-x-1">
                        ←
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}