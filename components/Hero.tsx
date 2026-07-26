import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-b border-green-500/10 bg-[#020504]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_40%)]" />

      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-green-400/5 blur-3xl" />

      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full border border-green-400/10" />

      <div className="relative mx-auto flex min-h-[62vh] max-w-[1000px] items-center justify-center px-6 py-10 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="font-black text-green-400">
            أداء ثابت، تبريد احترافي
          </p>

          <h1 className="mt-6 text-5xl font-black leading-[1.25] text-white md:text-7xl">
            لا تدع حرارة هاتفك

            <span className="mt-2 block text-green-400">
              تهزمك!
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-9 text-zinc-400">
            مبردات احترافية مصممة خصيصاً للاعبين، تبريد سريع،
            أداء أقوى وانتصارات أكثر.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="#products"
              className="inline-flex items-center gap-3 rounded-xl bg-green-400 px-7 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-300"
            >
              <ShoppingCart size={20} />
              اطلب الآن
            </Link>

            <Link
              href="#products"
              className="inline-flex items-center gap-3 rounded-xl border border-green-400/40 px-7 py-4 font-black text-white transition hover:bg-green-400/10"
            >
              عرض المنتجات
              <ArrowLeft size={20} />
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-right transition hover:border-green-400/30">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                <Truck size={22} />
              </div>

              <div>
                <p className="font-black text-white">
                  توصيل سريع
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  لجميع مدن المغرب
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-right transition hover:border-green-400/30">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-black text-white">
                  ضمان الجودة
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  منتجات مختارة بعناية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}