// Black Friday 2026. The look is shown until END; prices themselves live in
// the products table (price + old_price + promo_end) and go back
// automatically after promo_end (see the black_friday migration).

export const BLACK_FRIDAY_END = "2026-11-30T23:59:59+01:00";
export const BLACK_FRIDAY_HERO_SLUG = "s6-phone-cooler";

export function isBlackFriday(now = Date.now()) {
  return now < new Date(BLACK_FRIDAY_END).getTime();
}

export function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

export function isCooler(name: string) {
  return /cooler/i.test(name);
}
