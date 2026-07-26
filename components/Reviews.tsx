import { Star } from "lucide-react";

const reviews = [
  {
    name: "يوسف - الدار البيضاء",
    text: "أفضل مبرد جربتو، فرق كبير أثناء اللعب وما بقاتش السخونية.",
  },
  {
    name: "حمزة - الرباط",
    text: "التوصيل كان سريع والمنتج وصل بحالة ممتازة.",
  },
  {
    name: "سفيان - مراكش",
    text: "الجودة ممتازة وكيخدم مزيان مع Free Fire وPUBG.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-[#020504] py-24">
      <div className="mx-auto max-w-[1450px] px-6">
        <div className="mb-14 text-center">
          <p className="font-bold text-green-400">
            آراء الزبناء
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            ماذا قال عملاؤنا؟
          </h2>

          <p className="mt-4 text-zinc-500">
            بعض آراء العملاء الذين اقتنوا منتجات MODOX.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl border border-white/10 bg-[#070b0a] p-8 transition hover:border-green-400/40"
            >
              <div className="mb-4 flex gap-1 text-green-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              <p className="leading-8 text-zinc-300">
                "{review.text}"
              </p>

              <p className="mt-6 font-black text-white">
                {review.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}