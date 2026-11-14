import { tierLabel, tierOrder } from "@/lib/catalog";

const range: Record<string, string> = {
  legend: "200+ DH",
  epic: "120–199 DH",
  rare: "60–119 DH",
  common: "< 60 DH",
};

export default function TierLegend() {
  return (
    <ul
      dir="ltr"
      className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-dim"
    >
      {tierOrder.map((tier) => (
        <li key={tier} className={`tier-${tier} flex items-center gap-2`}>
          <i className="inline-block h-2.5 w-2.5 rotate-45 bg-[var(--tc)]" />
          {tierLabel[tier]}
          <span className="text-dim/70 normal-case">{range[tier]}</span>
        </li>
      ))}
    </ul>
  );
}
