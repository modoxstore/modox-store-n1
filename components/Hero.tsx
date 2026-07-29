import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:bg-left"
        style={{
          backgroundImage: "url('/images/hero-bg.webp')",
        }}
      />

      {/* Dark overlay on the right for the text */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/85 via-black/35 to-transparent" />

      {/* Mobile overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/25 lg:hidden" />

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Green glow behind the Arabic content */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_42%,rgba(0,255,128,0.12),transparent_34%)]" />

      {/* Hero content */}
      <div className="relative z-10 flex min-h-screen w-full items-center px-5 pb-12 pt-[120px] sm:px-8 md:px-12 lg:px-16 lg:pb-14 lg:pt-[80px] xl:px-24 2xl:px-32">
        {/* Arabic text on the right */}
        <div className="w-full max-w-[820px] text-center lg:ml-auto lg:mr-[4vw] lg:text-right">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-black/40 px-5 py-2.5 text-sm font-black text-green-400 backdrop-blur-md">
            <span>🎮</span>
            <span>إكسسوارات Gaming مختارة للاعبين</span>
          </div>

          {/* Main title */}
          <h1 className="mt-7 text-5xl font-black leading-[1.12] tracking-tight text-white sm:text-6xl md:text-7xl xl:text-[88px] 2xl:text-[104px]">
            كل ما يحتاجه

            <span className="mt-2 block text-green-400">
              اللاعب المحترف
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-[650px] text-base leading-8 text-zinc-300 sm:text-lg md:text-[22px] md:leading-9 lg:mx-0">
            اكتشف أفضل إكسسوارات الألعاب والهواتف، من السماعات وأدوات
            التحكم إلى الشواحن والمبردات، لتطوير تجربتك واللعب بأقصى أداء.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              href="#products"
              className="inline-flex min-w-[175px] items-center justify-center gap-3 rounded-xl bg-green-400 px-8 py-4 text-base font-black text-black shadow-lg shadow-green-500/20 transition duration-300 hover:-translate-y-1 hover:bg-green-300"
            >
              <ShoppingCart size={21} />
              تسوق الآن
            </Link>

            <Link
              href="shop"
              className="inline-flex min-w-[190px] items-center justify-center gap-3 rounded-xl border border-white/20 bg-black/30 px-8 py-4 text-base font-black text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-green-400/50 hover:bg-green-400/10"
            >
              شاهد المنتجات
              <ArrowLeft size={21} />
            </Link>
          </div>

          {/* Benefits — clean single row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 border-t border-white/10 pt-6 lg:justify-start">
            <div className="flex items-center gap-2.5">
              <Truck
                size={22}
                className="shrink-0 text-green-400"
              />

              <div className="text-right">
                <p className="text-sm font-black text-white">
                  توصيل سريع
                </p>

                <p className="text-[11px] text-zinc-400">
                  لجميع مدن المغرب
                </p>
              </div>
            </div>

            <span className="hidden h-9 w-px bg-white/15 sm:block" />

            <div className="flex items-center gap-2.5">
              <Banknote
                size={22}
                className="shrink-0 text-green-400"
              />

              <div className="text-right">
                <p className="text-sm font-black text-white">
                  الدفع عند الاستلام
                </p>

                <p className="text-[11px] text-zinc-400">
                  خلص ملي يوصلك الطلب
                </p>
              </div>
            </div>

            <span className="hidden h-9 w-px bg-white/15 sm:block" />

            <div className="flex items-center gap-2.5">
              <ShieldCheck
                size={22}
                className="shrink-0 text-green-400"
              />

              <div className="text-right">
                <p className="text-sm font-black text-white">
                  ضمان الجودة
                </p>

                <p className="text-[11px] text-zinc-400">
                  منتجات مجربة ومختارة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}