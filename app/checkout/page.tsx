"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const sendOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      alert("السلة فارغة");
      return;
    }

    const productsText = items
  .map(
    (item) =>
      `${item.name}
السعر: ${item.price} DH
الكمية: ${item.quantity}
المجموع: ${item.price * item.quantity} DH`,
  )
  .join("\n\n");

    const message = `
طلب جديد من MODOX STORE 

الاسم الكامل: ${fullName}
رقم الهاتف: ${phone}
المدينة: ${city}
العنوان: ${address}

المنتجات:
${productsText}

المجموع: ${totalPrice} DH
طريقة الدفع: الدفع عند الاستلام

ملاحظة:
${note || "لا توجد ملاحظة"}
    `.trim();

    // بدل هاد الرقم برقم WhatsApp ديال المتجر
    // كتب الرقم بلا + وبلا مسافات
    const storeWhatsApp = "212708872257";

    const whatsappUrl = `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#020504] px-5 text-white"
      >
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <ShoppingBag
            size={65}
            className="mx-auto text-zinc-700"
          />

          <h1 className="mt-6 text-3xl font-black">
            السلة فارغة
          </h1>

          <p className="mt-3 text-zinc-500">
            أضف أحد المنتجات قبل إتمام الطلب.
          </p>

          <Link
            href="/#products"
            className="mt-7 inline-block rounded-xl bg-green-400 px-8 py-4 font-black text-black transition hover:bg-green-300"
          >
            عرض المنتجات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#020504] px-5 py-10 text-white"
    >
      <div className="mx-auto max-w-[1250px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-zinc-400 transition hover:text-green-400"
        >
          <ArrowRight size={19} />
          الرجوع للمتجر
        </Link>

        <div className="mb-10">
          <p className="text-sm font-bold text-green-400">
            MODOX STORE
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            إتمام الطلب
          </h1>

          <p className="mt-3 text-zinc-500">
            دخل المعلومات ديالك وتأكد من المنتجات قبل إرسال الطلب.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
          <form
            onSubmit={sendOrder}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-8"
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                <User size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  معلومات الزبون
                </h2>

                <p className="text-sm text-zinc-500">
                  تأكد أن المعلومات صحيحة.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-300">
                  الاسم الكامل
                </span>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="مثال: محمد العلوي"
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-green-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-300">
                  رقم الهاتف
                </span>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="06XXXXXXXX"
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-green-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-300">
                  المدينة
                </span>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="مثال: الدار البيضاء"
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-green-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-300">
                  العنوان الكامل
                </span>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute right-4 top-5 text-zinc-500"
                  />

                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="الحي، الزنقة، رقم الدار..."
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-green-400"
                  />
                </div>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-zinc-300">
                ملاحظة إضافية
              </span>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="مثال: عيط ليا قبل التوصيل..."
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-green-400"
              />
            </label>

            <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/[0.05] p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-green-400"
                />

                <div>
                  <p className="font-black">
                    الدفع عند الاستلام
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    ما غادي تخلص والو دابا. الأداء كيكون ملي يوصلك الطلب.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-xl bg-green-400 px-6 py-4 text-lg font-black text-black transition hover:bg-green-300"
            >
              إرسال الطلب عبر WhatsApp
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <ShoppingBag className="text-green-400" />

              <h2 className="text-xl font-black">
                ملخص الطلب
              </h2>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.name}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-1 items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        الكمية: {item.quantity}
                      </p>
                    </div>

                    <p className="font-black text-green-400">
                      {item.price * item.quantity} DH
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  المجموع
                </span>

                <span className="text-3xl font-black text-green-400">
                  {totalPrice} DH
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-zinc-600">
                مصاريف التوصيل تقدر تزيد حسب المدينة، إلا كانت عندك تسعيرة خاصة بالتوصيل.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}