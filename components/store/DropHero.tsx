import Link from "next/link";
import TopoCanvas from "./TopoCanvas";

const facts = [
  { label: "الدفع", value: "عند الاستلام" },
  { label: "التوصيل", value: "لجميع المدن" },
  { label: "التأكيد", value: "فـ WhatsApp" },
];

export default function DropHero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <TopoCanvas />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-20 lg:pt-16">
        <div className="anim-rise">
          <div
            dir="ltr"
            className="mb-5 flex flex-wrap justify-end gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-dim"
          >
            <span><span className="text-flare">◢</span> Grid 33.57N / 7.59W</span>
            <span><span className="text-flare">◢</span> Drop zone: Maroc</span>
            <span><span className="text-flare">◢</span> Squad: Modox</span>
          </div>

          <h1 className="font-arabic text-[44px] leading-[1.05] text-ink sm:text-[64px] lg:text-[78px]">
            نزل فالماب،
            <span className="block text-flare">اللوت كيوصلك لباب الدار.</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-[17px] leading-8 text-dim">
            إكسسوارات Gaming والهاتف مختارين بيد MODOX: مبردات، سماعات، شواحن
            وكابلات. كتطلب، كنأكدو معاك فـ WhatsApp، وOzon Express كيوصلها
            ليك وتخلص ملي تشد.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#crates"
              className="cut-corners bg-flare px-7 py-4 font-arabic text-[19px] text-[#140a02] transition hover:-translate-y-0.5"
            >
              حل الصناديق ↓
            </Link>
            <Link
              href="/shop"
              className="border border-line bg-map-2/80 px-7 py-4 font-arabic text-[19px] text-ink transition hover:border-flare"
            >
              جميع المنتجات
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 border border-line bg-map/60 backdrop-blur">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={`px-4 py-3 ${i > 0 ? "border-r border-line" : ""}`}
              >
                <dt className="text-xs text-dim">{fact.label}</dt>
                <dd className="mt-1 font-arabic text-[17px] text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Drop zone: the supply crate falls into the safe circle. */}
        <div
          aria-hidden="true"
          className="relative mx-auto aspect-square w-full max-w-[400px]"
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="96" fill="rgb(255 122 26 / 0.06)" />
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="#9ba1aa"
              strokeOpacity="0.5"
              strokeDasharray="3 6"
            />
            <circle
              className="anim-zone"
              cx="100"
              cy="100"
              r="58"
              fill="rgb(255 179 71 / 0.07)"
              stroke="#ffb347"
              strokeWidth="2"
            />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#2a2f37" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#2a2f37" />
          </svg>

          <span className="anim-ping absolute left-1/2 top-1/2 -ml-[10px] -mt-[10px] h-5 w-5 rounded-full border-2 border-flare" />

          <div className="anim-crate absolute left-1/2 top-1/2 -ml-[46px] -mt-[104px] w-[92px]">
            <svg viewBox="0 0 84 100" className="h-auto w-full overflow-visible">
              <path d="M6 30 Q42 -8 78 30 Z" fill="#ff7a1a" />
              <path
                d="M6 30 Q24 18 42 30 Q60 18 78 30"
                fill="none"
                stroke="#140a02"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <g stroke="#9ba1aa" strokeWidth="1">
                <line x1="8" y1="30" x2="26" y2="62" />
                <line x1="76" y1="30" x2="58" y2="62" />
                <line x1="42" y1="30" x2="42" y2="62" />
              </g>
              <rect x="22" y="62" width="40" height="34" fill="#3a2c12" stroke="#ffd23f" strokeWidth="2" />
              <path d="M22 62 L62 96 M62 62 L22 96" stroke="#ffd23f" strokeWidth="1.5" opacity="0.7" />
              <text x="42" y="83" textAnchor="middle" fontSize="8" fill="#ffd23f" fontFamily="monospace">
                M
              </text>
            </svg>
          </div>

          <div
            dir="ltr"
            className="absolute inset-x-0 -bottom-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em]"
          >
            <span className="text-zone">Safe zone</span>
            <span className="text-dim">Cash on delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}
