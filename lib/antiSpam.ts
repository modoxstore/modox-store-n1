// Checkout spam filters: cheap checks that stop bots and fake data
// before an order is created or a WhatsApp message is sent.

const MIN_FILL_MS = 4000;

// Characters and fragments that never appear in a real name or address
// but are typical of injection probes (' OR '1'='1, <script>, --, ...).
const CODE_LIKE =
  /[<>{}\[\]`$\\;=]|--|\/\*|\*\/|\b(select|insert|update|delete|drop|union|script|onerror|onload|javascript|alert)\b|'\s*or\s*'/i;

// Placeholder or keyboard-mash phone numbers (0600000000, 0655555555, 0612345678...).
function isFakePhone(normalized: string) {
  const local = normalized.slice(3); // 9 digits after 212
  if (/(\d)\1{5,}/.test(local)) return true; // 6+ same digits in a row
  const sequences = ["12345678", "23456789", "98765432", "87654321", "01234567"];
  if (sequences.some((s) => local.includes(s))) return true;
  if (/^(\d{2})\1{3,}/.test(local.slice(1))) return true; // 5656565..
  return false;
}

export type SpamCheck = { ok: true } | { ok: false; reason: string; message: string };

export function checkOrderForSpam(input: {
  honeypot: unknown;
  fillMs: unknown;
  customerName: string;
  address: string;
  normalizedPhone: string;
}): SpamCheck {
  // Hidden field: people never see it, bots fill every input.
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") {
    return { ok: false, reason: "honeypot", message: "تعذر تسجيل الطلب. عاود من بعد شوية." };
  }

  // Filled faster than a person can type a name, phone and address.
  if (typeof input.fillMs !== "number" || input.fillMs < MIN_FILL_MS) {
    return { ok: false, reason: "too-fast", message: "تعذر تسجيل الطلب. عاود من بعد شوية." };
  }

  const name = input.customerName.trim();
  const address = input.address.trim();

  if (CODE_LIKE.test(name) || CODE_LIKE.test(address)) {
    return {
      ok: false,
      reason: "code-like",
      message: "الاسم ولا العنوان فيه رموز ماشي عادية. كتب الاسم والعنوان الحقيقيين.",
    };
  }

  if (!/[\p{L}]{2,}/u.test(name)) {
    return { ok: false, reason: "bad-name", message: "كتب الاسم الكامل ديالك." };
  }

  if (isFakePhone(input.normalizedPhone)) {
    return {
      ok: false,
      reason: "fake-phone",
      message: "رقم الهاتف ماشي صحيح. دخل الرقم ديالك اللي فيه WhatsApp.",
    };
  }

  return { ok: true };
}
