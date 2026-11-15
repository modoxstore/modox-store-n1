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
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartContext";
import DropSequence from "@/components/store/DropSequence";
export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [placed, setPlaced] = useState<{
    orderId: string;
    images: string[];
    city: string;
  } | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cityId, setCityId] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [zones, setZones] = useState<
    { city_id: number; name: string; delivered_price: number }[]
  >([]);
  const [citiesError, setCitiesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/ozon/cities")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load cities");
        return response.json();
      })
      .then((result) => {
        if (!cancelled) setZones(result.cities ?? []);
      })
      .catch(() => {
        if (!cancelled) setCitiesError("تعذر تحميل المدن");
      });

    return () => { cancelled = true; };
  }, []);

  const selectedZone = zones.find(
    (zone) => zone.city_id === Number(cityId)
  );
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutKeyRef = useRef<string | null>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  // Anti-spam: hidden field bots fill in, and when the form was opened.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const openedAtRef = useRef<number | null>(null);

  useEffect(() => {
    openedAtRef.current = Date.now();
  }, []);


  const sendOrder = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting || items.length === 0) return;

    // Every order is confirmed on WhatsApp, so the box must be ticked.
    if (!whatsappConsent) {
      setConsentError(false);
      requestAnimationFrame(() => setConsentError(true));
      consentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      consentRef.current?.focus({ preventScroll: true });
      return;
    }

    if (!checkoutKeyRef.current) {
      checkoutKeyRef.current = crypto.randomUUID();
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutKey: checkoutKeyRef.current,
          customerName: fullName.trim(),
          phone: phone.trim(),
          cityId: Number(cityId),
          address: address.trim(),
          whatsappConsent,
          website: honeypotRef.current?.value ?? "",
          fillMs: openedAtRef.current ? Date.now() - openedAtRef.current : 0,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "تعذر تسجيل الطلب");
      }

      // Drop animation, then the order tracking page.
      setPlaced({
        orderId: result.orderId,
        images: items.map((item) => item.image),
        city: selectedZone?.name ?? "",
      });
      clearCart();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "وقع مشكل أثناء تسجيل الطلب"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placed) {
    return (
      <DropSequence
        orderId={placed.orderId}
        images={placed.images}
        city={placed.city}
      />
    );
  }

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-map px-5 text-white"
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
            className="mt-7 inline-block rounded-xl bg-flare px-8 py-4 font-black text-black transition hover:bg-[#ff9445]"
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
      className="min-h-screen bg-map px-5 py-10 text-white"
    >
      <div className="mx-auto max-w-[1250px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-zinc-400 transition hover:text-flare"
        >
          <ArrowRight size={19} />
          الرجوع للمتجر
        </Link>

        <div className="mb-10">
          <p className="text-sm font-bold text-flare">
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
            {/* Honeypot: hidden from people, filled in by bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                ref={honeypotRef}
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-flare/10 text-flare">
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
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-flare"
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
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-flare"
                  />
                </div>
              </label>


              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-300">
                  المدينة / المنطقة
                </span>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={citySearch}
                    onChange={(event) => {
                      setCitySearch(event.target.value);
                      setCityId("");
                      setShowCities(true);
                    }}
                    onFocus={() => setShowCities(true)}
                    placeholder="قلب على المدينة أو المنطقة..."
                    className="w-full rounded-xl border border-white/10 bg-[#111] p-4 text-white outline-none focus:border-flare"
                  />

                  {showCities && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#151515] shadow-2xl">
                      {zones
                        .filter((zone) =>
                          zone.name.toLowerCase().includes(
                            citySearch.trim().toLowerCase()
                          )
                        )
                        .slice(0, 30)
                        .map((zone) => (
                          <button
                            type="button"
                            key={zone.city_id}
                            onClick={() => {
                              setCityId(String(zone.city_id));
                              setCitySearch(zone.name);
                              setShowCities(false);
                            }}
                            className="flex w-full justify-between border-b border-white/5 px-4 py-3 text-right hover:bg-flare/10"
                          >
                            <span>{zone.name}</span>
                            <span className="text-flare">
                              {zone.delivered_price} DH
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                {citiesError && (
                  <p className="mt-2 text-sm text-red-400">
                    {citiesError}
                  </p>
                )}
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
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-flare"
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
                className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-flare"
              />
            </label>

            <div className="mt-6 rounded-2xl border border-flare/20 bg-flare/[0.05] p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-flare"
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

            <label
              htmlFor="whatsapp-consent"
              className={`mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                consentError && !whatsappConsent
                  ? "consent-alert border-flare bg-flare/10"
                  : whatsappConsent
                    ? "border-flare/50 bg-flare/5"
                    : "border-white/10 bg-black/30"
              }`}
            >
              <input
                ref={consentRef}
                id="whatsapp-consent"
                type="checkbox"
                aria-required="true"
                aria-describedby="whatsapp-consent-help"
                checked={whatsappConsent}
                onChange={(event) => {
                  setWhatsappConsent(event.target.checked);
                  if (event.target.checked) setConsentError(false);
                }}
                className="mt-1 h-5 w-5 shrink-0 accent-[#ff7a1a]"
              />

              <span className="text-sm leading-6 text-zinc-300">
                موافق نتوصل برسالة WhatsApp من MODOX STORE فيها تفاصيل الطلب ديالي باش نأكدو ولا نلغيه.
                <span className="text-flare"> (ضروري)</span>
                <span
                  id="whatsapp-consent-help"
                  className={`mt-1 block font-bold text-flare ${
                    consentError && !whatsappConsent ? "" : "hidden"
                  }`}
                >
                  كوشي هنا باش يدوز الطلب: التأكيد كيكون غير فـ WhatsApp.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !selectedZone}
              className="mt-7 w-full rounded-xl bg-flare px-6 py-4 text-lg font-black text-black transition hover:bg-[#ff9445] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "جاري تسجيل الطلب..."
                : "تأكيد الطلب"}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <ShoppingBag className="text-flare" />

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

                    <p className="font-black text-flare">
                      {item.price * item.quantity} DH
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-3 flex justify-between text-sm">
                <span>المنتجات</span>
                <span>{totalPrice} DH</span>
              </div>
              <div className="mb-4 flex justify-between text-sm">
                <span>التوصيل Ozon Express</span>
                <span>
                  {selectedZone
                    ? selectedZone.delivered_price + " DH"
                    : "اختار المدينة"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  المجموع
                </span>

                <span className="text-3xl font-black text-flare">
                  {totalPrice + (selectedZone?.delivered_price ?? 0)} DH
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
