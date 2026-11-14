"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { tierLabel, tierOrder, type Tier } from "@/lib/catalog";
import type { StoreProduct } from "@/lib/storeProducts";
import LootCard from "./LootCard";

export default function ShopGrid({
  products,
  initialQuery = "",
}: {
  products: StoreProduct[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [tier, setTier] = useState<Tier | "all">("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (tier === "all" || p.tier === tier) &&
        (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, query, tier]);

  const chip = (active: boolean) =>
    `border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
      active ? "border-flare text-flare" : "border-line text-dim hover:text-ink"
    }`;

  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <label htmlFor="shop-search" className="relative block">
          <span className="sr-only">قلب على منتج</span>
          <Search
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-dim"
          />
          <input
            id="shop-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="قلب على منتج: مبرد، كابل، سماعة..."
            className="w-full border border-line bg-map-2 py-3.5 pl-4 pr-11 text-ink outline-none placeholder:text-dim/60 focus:border-hazard"
          />
        </label>

        <div className="flex flex-wrap gap-2" dir="ltr">
          <button type="button" className={chip(tier === "all")} onClick={() => setTier("all")}>
            All
          </button>
          {tierOrder.map((t) => (
            <button
              key={t}
              type="button"
              className={`${chip(tier === t)} tier-${t}`}
              onClick={() => setTier(t)}
            >
              <i className="ml-0 mr-2 inline-block h-2 w-2 rotate-45 bg-[var(--tc)]" />
              {tierLabel[t]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="border border-dashed border-line p-10 text-center text-dim">
          ما لقينا حتى منتج بهاد البحث. جرب كلمة أخرى ولا اختار All.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, i) => (
            <LootCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
