"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "هل المبرد يركب على جميع الهواتف؟",
    a: "نعم، المبردات متوافقة مع أغلب الهواتف والأجهزة اللوحية.",
  },
  {
    q: "كم يستغرق التوصيل؟",
    a: "عادة بين 24 و48 ساعة حسب المدينة.",
  },
  {
    q: "هل يوجد الدفع عند الاستلام؟",
    a: "نعم، يمكنك الدفع عند استلام الطلب.",
  },
  {
    q: "هل يوجد ضمان؟",
    a: "نعم، جميع منتجات MODOX مضمونة ضد عيوب التصنيع.",
  },
  {
    q: "كيف أتواصل معكم؟",
    a: "يمكنك التواصل معنا مباشرة عبر WhatsApp.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#020504] py-24" dir="rtl">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <p className="font-bold text-green-400">
            الأسئلة الشائعة
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            عندك سؤال؟
          </h2>

          <p className="mt-4 text-zinc-500">
            أكثر الأسئلة التي نتوصل بها.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#070b0a]"
            >
              <button
                onClick={() =>
                  setOpen(open === index ? null : index)
                }
                className="flex w-full items-center justify-between px-6 py-5 text-right"
              >
                <span className="font-bold text-white">
                  {faq.q}
                </span>

                <ChevronDown
                  className={`transition ${
                    open === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open === index && (
                <div className="border-t border-white/10 px-6 py-5 text-zinc-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}