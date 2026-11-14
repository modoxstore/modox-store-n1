// Shared, side-effect-free helpers for product display (server and client).

export type Tier = "common" | "rare" | "epic" | "legend";

// Rarity follows the price band, so the crate color tells the price range.
export function tierFor(price: number): Tier {
  if (price >= 200) return "legend";
  if (price >= 120) return "epic";
  if (price >= 60) return "rare";
  return "common";
}

export const tierLabel: Record<Tier, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legend: "Legendary",
};

export const tierOrder: Tier[] = ["legend", "epic", "rare", "common"];

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// New studio photos (night-map style). A product keeps its own image
// from the admin unless it still uses one of these original files.
const studioPhotos: Record<string, string> = {
  "/images/cartoon-fan.png": "/images/v2/cartoon-fan.webp",
  "/images/smart-pack.png": "/images/v2/smart-pack.webp",
  "/images/airpods-apple.png": "/images/v2/ecouteurs-tws.webp",
  "/images/powerbank9000w.png": "/images/v2/powerbank-9000.webp",
  "/images/airpods-premium.png": "/images/v2/ecouteurs-tws-pro.webp",
  "/images/capybara-fan.png": "/images/v2/capybara-fan.webp",
  "/images/baseus65w.png": "/images/v2/baseus-65w.webp",
  "/images/wova240w.png": "/images/v2/wova-240w.webp",
  "/images/Casque.png": "/images/v2/casque-wireless.webp",
  "/images/charger4in1.png": "/images/v2/charger-4in1.webp",
  "/images/s6-cooler.png": "/images/v2/s6-cooler.webp",
  "/images/JC-21S.png": "/images/v2/JC-21S.webp",
  "/images/JC-22S.png": "/images/v2/JC-22S.webp",
  "/images/fd-u2.png": "/images/v2/usb-c-hub-fd-u2.webp",
  "/images/bluetooth-keyboard.png": "/images/v2/bluetooth-keyboard.webp",
  "/images/mosquito.png": "/images/v2/mosquito-swatter.webp",
  "/images/finger-sleeves.png": "/images/v2/finger-sleeves.webp",
  "/images/rgb-cooler.png": "/images/v2/rgb-cooler.webp",
  "/images/S38.PNG": "/images/v2/s38-cooler.webp",
  "/images/I51.PNG": "/images/v2/s51-cooler.webp",
  "/images/XS06.PNG": "/images/v2/xs06-cooler.webp",
  "/images/XS09.PNG": "/images/v2/xs09-cooler.webp",
};

export function displayImage(image: string): string {
  return studioPhotos[image] ?? image;
}

export function isRemoteImage(image: string): boolean {
  return image.includes("/storage/v1/object/public/");
}
