import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  MessageCircle,
  Music2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      dir="rtl"
      className="relative overflow-hidden border-t border-white/10 bg-[#020504] text-white"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.08),transparent_40%)]" />

      <div className="relative mx-auto grid max-w-[1500px] gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="MODOX"
              width={56}
              height={56}
              className="rounded-2xl border border-green-400/20 bg-black/40 p-2"
            />

            <div>
              <h2 className="text-xl font-black tracking-wider">
                MODOX
              </h2>

              <p className="text-xs uppercase tracking-[0.25em] text-green-400">
                Gaming Store
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-sm text-sm leading-7 text-zinc-400">
            MODOX هو متجر مغربي متخصص في إكسسوارات Gaming
            والهواتف، نوفر منتجات مختارة بعناية مع جودة عالية،
            توصيل سريع، والدفع عند الاستلام.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-black">
            روابط سريعة
          </h3>

          <div className="mt-6 flex flex-col gap-4 text-sm text-zinc-400">
            <Link
              href="/"
              className="transition hover:text-green-400"
            >
              الرئيسية
            </Link>

            <Link
              href="/shop"
              className="transition hover:text-green-400"
            >
              جميع المنتجات
            </Link>

            <Link
              href="/#products"
              className="transition hover:text-green-400"
            >
              الأكثر مبيعاً
            </Link>

            <Link
              href="/#why-modox"
              className="transition hover:text-green-400"
            >
              لماذا MODOX؟
            </Link>
          </div>
        </div>

        {/* Customer */}
        <div>
          <h3 className="text-lg font-black">
            خدمة الزبناء
          </h3>

          <div className="mt-6 space-y-4 text-sm text-zinc-400">
            <a
              href="https://wa.me/212708270909"
              target="_blank"
              rel="noreferrer"
              className="block transition hover:text-green-400"
            >
              WhatsApp
            </a>

            <p>الدفع عند الاستلام</p>

            <p>التوصيل لجميع مدن المغرب</p>

            <p>دعم سريع 7 أيام في الأسبوع</p>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-black">
            تابعنا
          </h3>

          <p className="mt-6 text-sm leading-7 text-zinc-400">
            تابع MODOX لمعرفة أحدث المنتجات والعروض.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="https://www.instagram.com/modoxstore_/"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-pink-500 hover:text-pink-400"
            >
              <Camera size={20} />
            </a>

            <a
              href="#"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white hover:text-white"
            >
              <Music2 size={20} />
            </a>

            <a
              href="https://wa.me/212708270909"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-400/30 bg-green-400/10 text-green-400 transition hover:bg-green-400 hover:text-black"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-zinc-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} MODOX STORE. جميع الحقوق محفوظة.
          </p>

          <p>
            🇲🇦 صنع في المغرب • توصيل سريع • الدفع عند الاستلام
          </p>
        </div>
      </div>
    </footer>
  );
}