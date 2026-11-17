// XP rules. 1 XP per DH of products in a delivered order (delivery excluded).
// Reaching LEGENDARY_XP unlocks one free product priced under
// REWARD_MAX_PRICE; the customer pays delivery only and the XP is spent.

export const LEGENDARY_XP = 2000;
export const REWARD_MAX_PRICE = 300;

export const xpLevels = [
  { key: "common", label: "Common", ar: "عادي", min: 0 },
  { key: "rare", label: "Rare", ar: "نادر", min: 500 },
  { key: "epic", label: "Epic", ar: "ملحمي", min: 1000 },
  { key: "legendary", label: "Legendary", ar: "أسطوري", min: LEGENDARY_XP },
] as const;

export type XpLevel = (typeof xpLevels)[number];

export function levelFor(xp: number): XpLevel {
  let level: XpLevel = xpLevels[0];
  for (const item of xpLevels) {
    if (xp >= item.min) level = item;
  }
  return level;
}

export function nextLevel(xp: number): XpLevel | null {
  return xpLevels.find((item) => item.min > xp) ?? null;
}

export function normalizeMoroccanPhone(raw: string): string | null {
  const clean = raw.replace(/[\s+()-]/g, "");
  const phone = clean.startsWith("0") ? "212" + clean.slice(1) : clean;
  return /^212[567]\d{8}$/.test(phone) ? phone : null;
}
