import "server-only";

type OrderMessage = {
  phone: string;
  customerName: string;
  orderId: string;
  total: number;
};

export async function sendOrderConfirmation(order: OrderMessage) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION;

  if (!token || !phoneId || !version) {
    throw new Error("WhatsApp configuration missing");
  }

  const recipient = order.phone.replace(/\D/g, "");

  if (!/^212[567]\d{8}$/.test(recipient)) {
    throw new Error("Invalid Moroccan phone number");
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
          name: "modox_order_confirmation1",
          language: { code: "ar" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.customerName },
                { type: "text", text: order.orderId },
                { type: "text", text: String(order.total) },
              ],
            },
          ],
        },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("WhatsApp API error:", error?.error?.code);
    throw new Error("WhatsApp message could not be sent");
  }

  return response.json();
}
