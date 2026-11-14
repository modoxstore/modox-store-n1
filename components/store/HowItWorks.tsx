const steps = [
  {
    title: "اختار الصندوق",
    body: "زيد المنتجات للسلة ودخل الاسم، الهاتف، المدينة والعنوان.",
  },
  {
    title: "أكد فـ WhatsApp",
    body: "كتوصلك رسالة فيها المجموع مع التوصيل، كتبرك على تأكيد الطلب.",
  },
  {
    title: "خلص ملي توصلك",
    body: "Ozon Express كيجيبها لباب الدار، والخلاص كيكون كاش عند الاستلام.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-28 border-b border-line">
      <ol className="mx-auto grid max-w-[1280px] gap-px bg-line md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 bg-map px-4 py-6 sm:px-6">
            <span className="font-display text-[40px] leading-none text-flare" dir="ltr">
              {i + 1}
            </span>
            <div>
              <h3 className="font-arabic text-[21px] text-ink">{step.title}</h3>
              <p className="mt-1 text-[15px] leading-7 text-dim">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
