import type { Metadata } from "next";
import type { ReactNode } from "react";
import StoreHeader from "@/components/store/StoreHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "كيفاش MODOX STORE كيجمع ويستعمل ويحمي المعلومات ديال الزبناء، بما فيها رسائل WhatsApp الخاصة بالطلبات.",
};

const updated = "14 نونبر 2026";

const sections: { title: string; body: ReactNode }[] = [
  {
    title: "شكون حنا",
    body: (
      <p>
        MODOX STORE متجر مغربي فالإنترنت (modox.ma) كيبيع إكسسوارات Gaming
        والهواتف، مع التوصيل لجميع مدن المغرب والدفع عند الاستلام.
      </p>
    ),
  },
  {
    title: "المعلومات اللي كنجمعو",
    body: (
      <ul className="list-disc space-y-2 pr-5">
        <li>الاسم الكامل، رقم الهاتف، المدينة والعنوان اللي كتكتب فصفحة الطلب.</li>
        <li>تفاصيل الطلب: المنتجات، الكمية، الثمن ومصاريف التوصيل.</li>
        <li>الجواب ديالك على رسالة WhatsApp ديال الطلب (تأكيد أو إلغاء).</li>
        <li>
          معلومات تقنية مجهولة على الزيارات (بحال الصفحات والجهاز) باش نحسنو
          الموقع، بلا ما نعرفو شكون نتا.
        </li>
      </ul>
    ),
  },
  {
    title: "علاش كنستعملوها",
    body: (
      <ul className="list-disc space-y-2 pr-5">
        <li>باش نسجلو الطلب ديالك ونوجدوه ونوصلوه ليك.</li>
        <li>
          باش نصيفطو ليك رسالة WhatsApp فيها تفاصيل الطلب باش تأكدو أو تلغيه،
          غير إلا وافقتي على هادشي فصفحة الطلب.
        </li>
        <li>باش نتواصلو معاك إلا كان شي مشكل فالطلب أو التوصيل.</li>
        <li>باش نحميو المتجر من الطلبات المزورة والاستعمال المفرط.</li>
      </ul>
    ),
  },
  {
    title: "رسائل WhatsApp",
    body: (
      <>
        <p>
          كنستعملو WhatsApp Business Platform ديال Meta غير للرسائل المتعلقة
          بالطلب ديالك. ما كنصيفطوش إشهارات بهاد الطريقة.
        </p>
        <p className="mt-3">
          تقدر توقف هاد الرسائل فأي وقت: ما تختارش الموافقة فصفحة الطلب، ولا
          صيفط لينا &quot;STOP&quot; فـ WhatsApp.
        </p>
      </>
    ),
  },
  {
    title: "مع من كنشاركو المعلومات",
    body: (
      <>
        <p>ما كنبيعوش المعلومات ديالك. كنشاركو غير اللي خاص مع هادو:</p>
        <ul className="mt-3 list-disc space-y-2 pr-5">
          <li>Ozon Express: الاسم، الهاتف، المدينة والعنوان باش يوصلو الطلب.</li>
          <li>Meta (WhatsApp): رقم الهاتف، الاسم ورقم الطلب باش توصلك الرسالة.</li>
          <li>Supabase وVercel: الاستضافة وقاعدة البيانات ديال الموقع.</li>
          <li>Google: ممكن يستعمل cookies إلا كانت إعلانات فالموقع.</li>
        </ul>
      </>
    ),
  },
  {
    title: "شحال كنخليوها",
    body: (
      <p>
        كنحتفظو بمعلومات الطلب الوقت اللي خاص للتوصيل، خدمة ما بعد البيع
        والحسابات القانونية، ومن بعد كنمسحوها ولا كنخليوها بلا ما تعرف بيك.
      </p>
    ),
  },
  {
    title: "الحقوق ديالك",
    body: (
      <p>
        تقدر تطلب تشوف، تصحح ولا تمسح المعلومات ديالك، ولا توقف رسائل WhatsApp.
        صيفط لينا فـ WhatsApp وغادي نجاوبوك فأقرب وقت. هاد الحقوق محمية
        بالقانون المغربي 09-08 المتعلق بحماية المعطيات الشخصية.
      </p>
    ),
  },
  {
    title: "الحماية",
    body: (
      <p>
        المعلومات ديالك محفوظة فقاعدة بيانات محمية، والوصول ليها محدود لإدارة
        المتجر. الاتصال بالموقع مشفر (HTTPS).
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <StoreHeader />

      <main dir="rtl" className="min-h-screen bg-[#020504] px-5 pt-12 pb-20 text-white">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-bold text-green-400">MODOX STORE</p>

          <h1 className="mt-2 text-4xl font-black">سياسة الخصوصية</h1>

          <p className="mt-3 text-sm text-zinc-500">آخر تحديث: {updated}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <h2 className="mb-3 text-xl font-black text-green-400">
                  {section.title}
                </h2>
                <div className="leading-8 text-zinc-300">{section.body}</div>
              </section>
            ))}

            <section className="rounded-2xl border border-green-400/20 bg-green-400/[0.05] p-6">
              <h2 className="mb-3 text-xl font-black">تواصل معانا</h2>
              <p className="leading-8 text-zinc-300">
                WhatsApp:{" "}
                <a
                  href="https://wa.me/212708270909"
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                  className="font-bold text-green-400 underline"
                >
                  +212 708 270 909
                </a>
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
