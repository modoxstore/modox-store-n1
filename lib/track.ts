// Sends shop events to the Meta and TikTok pixels when they are loaded.
// Both pixels are switched on by their public ID env vars; without them
// these calls do nothing.

type Item = { name: string; price: number; quantity?: number };

type PixelWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (event: string, data?: object, options?: object) => void };
};

function send(meta: string, tiktok: string, data: object, eventId?: string) {
  if (typeof window === "undefined") return;
  const w = window as PixelWindow;
  try {
    w.fbq?.("track", meta, data, eventId ? { eventID: eventId } : undefined);
    w.ttq?.track(tiktok, data, eventId ? { event_id: eventId } : undefined);
  } catch {
    // Tracking must never break the shop.
  }
}

function contents(items: Item[]) {
  return items.map((item) => ({
    content_id: item.name,
    content_name: item.name,
    content_type: "product",
    quantity: item.quantity ?? 1,
    price: item.price,
  }));
}

export function trackViewContent(item: Item) {
  send("ViewContent", "ViewContent", {
    content_ids: [item.name],
    content_name: item.name,
    content_type: "product",
    contents: contents([item]),
    value: item.price,
    currency: "MAD",
  });
}

export function trackAddToCart(item: Item) {
  send("AddToCart", "AddToCart", {
    content_ids: [item.name],
    content_name: item.name,
    content_type: "product",
    contents: contents([item]),
    value: item.price,
    currency: "MAD",
  });
}

export function trackCheckout(items: Item[], value: number) {
  send("InitiateCheckout", "InitiateCheckout", {
    content_ids: items.map((i) => i.name),
    contents: contents(items),
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    value,
    currency: "MAD",
  });
}

export function trackPurchase(orderId: string, items: Item[], value: number) {
  send(
    "Purchase",
    "CompletePayment",
    {
      content_ids: items.map((i) => i.name),
      contents: contents(items),
      content_type: "product",
      value,
      currency: "MAD",
    },
    orderId
  );
}
