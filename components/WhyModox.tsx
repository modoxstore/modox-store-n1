import {
  ShieldCheck,
  Snowflake,
  Truck,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    icon: Snowflake,
    title: "تبريد قوي",
    description: "يحافظ على برودة الهاتف أثناء اللعب لفترات طويلة.",
  },
  {
    icon: ShieldCheck,
    title: "جودة مضمونة",
    description: "كل المنتجات يتم اختبارها قبل شحنها.",
  },
  {
    icon: Truck,
    title: "توصيل سريع",
    description: "التوصيل إلى جميع مدن المغرب.",
  },
  {
    icon: MessageCircle,
    title: "دعم عبر WhatsApp",
    description: "الرد السريع على جميع الاستفسارات.",
  },
];

export default function WhyModox() {
  return (
    <section
      id="about"
      dir="rtl"
      className="bg-[#020504] py-24"
    >
      <div className="mx-auto max-w-[1450px] px-6">
        <div className="mb-14 text-center">
          <p className="text-green-400 font-bold">
            لماذا MODOX؟
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            لماذا يختارنا اللاعبون؟
          </h2>

          <p className="mt-4 text-zinc-500">
            منتجات احترافية، جودة عالية، ودعم سريع لكل طلب.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-[#070b0a] p-8 transition hover:-translate-y-1 hover:border-green-400/40"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-black text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-zinc-500">
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