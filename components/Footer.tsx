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
      className="border-t border-green-500/10 bg-[#020504] text-white"
    >
      <div className="mx-auto grid max-w-[1450px] gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400 text-xl font-black text-black">
              M
            </div>

            <div>
              <h2 className="text-xl font-black">
                MODOX STORE
              </h2>

              <p className="text-xs text-zinc-500">
                Gaming Accessories
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-zinc-500">
            إكسسوارات Gaming احترافية، تبريد قوي للهواتف،
            جودة مضمونة وتوصيل لجميع مدن المغرب.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-black">
            روابط سريعة
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-400">
            <Link href="/" className="hover:text-green-400">
              الرئيسية
            </Link>

            <Link href="/#products" className="hover:text-green-400">
              المنتجات
            </Link>

            <Link href="/#about" className="hover:text-green-400">
              من نحن
            </Link>

            <Link href="/checkout" className="hover:text-green-400">
              إتمام الطلب
            </Link>
          </div>
        </div>

        {/* Customer */}
        <div>
          <h3 className="text-lg font-black">
            خدمة الزبناء
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-400">
            <a
              href="https://wa.me/212708055197"
              target="_blank"
              rel="noreferrer"
              className="hover:text-green-400"
            >
              WhatsApp
            </a>

            <p>الدفع عند الاستلام</p>

            <p>التوصيل لجميع المدن</p>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-black">
            تابعنا
          </h3>

          <p className="mt-5 text-sm text-zinc-500">
            تابع MODOX للحصول على آخر المنتجات والعروض.
          </p>

          <div className="mt-5 flex gap-3">
            <a
              href="https://www.instagram.com/modoxstore_/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-green-400 hover:text-green-400"
            >
              <Camera size={20} />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-green-400 hover:text-green-400"
            >
              <Music2 size={20} />
            </a>

            <a
              href="https://wa.me/212708872257"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-400/30 bg-green-400/5 text-green-400 transition hover:bg-green-400 hover:text-black"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-[1450px] flex-col items-center justify-between gap-3 px-6 text-xs text-zinc-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} MODOX STORE. جميع الحقوق محفوظة.
          </p>

          <p>
            الدفع عند الاستلام • التوصيل لجميع مدن المغرب
          </p>
        </div>
      </div>
    </footer>
  );
}