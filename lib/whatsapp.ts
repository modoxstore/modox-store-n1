import "server-only";

type OrderMessage = {
  phone: string;
  customerName: string;
  orderId: string;
  total: number;
};

// Quick reply payloads carry the order ID so the webhook can check
// that the button belongs to the order linked to the original message.
export const CONFIRM_PREFIX = "confirm:";
export const CANCEL_PREFIX = "cancel:";

/**
 * While WHATSAPP_TEST_RECIPIENTS is set (comma-separated, 2126XXXXXXXX),
 * messages go ONLY to those numbers. Leave it set until testing is done;
 * remove it in Vercel to start messaging real customers.
 */
export function getTestRecipients(): string[] | null {
  const raw = process.env.WHATSAPP_TEST_RECIPIENTS?.trim();
  if (!raw) return null;

  return raw
    .split(",")
    .map((value) => value.replace(/\D/g, ""))
    .filter((value) => /^212[567]\d{8}$/.test(value));
}

export function isRecipientAllowed(phone: string): boolean {
  const testRecipients = getTestRecipients();
  return testRecipients === null || testRecipients.includes(phone);
}

export async function sendOrderConfirmation(order: OrderMessage) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION;
  const templateName =
    process.env.WHATSAPP_TEMPLATE_NAME || "modox_order_confirmation1";
  const templateLanguage =
    process.env.WHATSAPP_TEMPLATE_LANGUAGE || "ar";

  if (!token || !phoneId || !version) {
    throw new Error("WhatsApp configuration missing");
  }

  const recipient = order.phone.replace(/\D/g, "");

  if (!/^212[567]\d{8}$/.test(recipient)) {
    throw new Error("Invalid Moroccan phone number");
  }

  if (!isRecipientAllowed(recipient)) {
    throw new Error("Recipient not in WHATSAPP_TEST_RECIPIENTS");
  }

  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.customerName },
                { type: "text", text: order.orderId },
                { type: "text", text: String(order.total) },
              ],
            },
            // Button order in the template: 0 = تأكيد الطلب, 1 = إلغاء الطلب
            {
              type: "button",
              sub_type: "quick_reply",
              index: "0",
              parameters: [
                { type: "payload", payload: CONFIRM_PREFIX + order.orderId },
              ],
            },
            {
              type: "button",
              sub_type: "quick_reply",
              index: "1",
              parameters: [
                { type: "payload", payload: CANCEL_PREFIX + order.orderId },
              ],
            },
          ],
        },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.error("WhatsApp API error:", error?.error?.code);
    throw new Error("WhatsApp message could not be sent");
  }

  // Meta accepting the request does not mean the message was delivered.
  return response.json();
}
