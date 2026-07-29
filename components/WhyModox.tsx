import {
  ShieldCheck,
  ThumbsUp,
  Truck,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
  icon: ThumbsUp,
  title: "منتجات احترافية",
  description: "إكسسوارات Gaming مختارة بعناية لتمنحك أفضل تجربة.",
},
  {
    icon: ShieldCheck,
    title: "جودة مضمونة",
    description: "كل منتج يتم فحصه قبل الشحن لضمان أفضل تجربة.",
  },
  {
    icon: Truck,
    title: "توصيل سريع",
    description: "شحن إلى جميع مدن المغرب مع الدفع عند الاستلام.",
  },
  {
    icon: MessageCircle,
    title: "دعم سريع",
    description: "نرد على استفساراتك عبر WhatsApp بأسرع وقت.",
  },
];

export default function WhyModox() {
  return (
    <section
      id="why-modox"
      dir="rtl"
      className="relative overflow-hidden bg-[#020504] py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(34,197,94,.06),transparent_30%)]" />

      <div className="relative mx-auto grid max-w-[1500px] gap-16 px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        {/* Right */}
        <div>
          <span className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-black text-green-400">
            لماذا MODOX؟
          </span>

          <h2 className="mt-6 text-4xl font-black leading-tight text-white lg:text-6xl">
            متجر صُمم
            <span className="text-green-400"> للاعبين </span>
            وليس للبيع فقط.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            هدفنا هو توفير أفضل إكسسوارات Gaming بأسعار مناسبة مع تجربة شراء
            بسيطة، توصيل سريع، ودعم حقيقي بعد البيع.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "الدفع عند الاستلام",
              "توصيل لجميع مدن المغرب",
              "منتجات مختارة بعناية",
              "دعم سريع عبر WhatsApp",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={22}
                  className="text-green-400"
                />

                <span className="font-bold text-zinc-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Left */}
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-green-400/40"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400/10 text-green-400 transition group-hover:scale-110">
                  <Icon size={30} />
                </div>

                <h3 className="text-xl font-black text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}