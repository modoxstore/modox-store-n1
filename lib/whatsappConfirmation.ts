import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendConfirmedOrderToOzon } from "@/lib/ozonSend";

type ConfirmationAction = "confirmed" | "cancelled";

type ConfirmationInput = {
  messageId: string;
  phone: string;
  action: ConfirmationAction;
};

export async function processWhatsAppConfirmation(
  input: ConfirmationInput
): Promise<boolean> {
  // Keep confirmation disabled until testing is complete.
  if (process.env.WHATSAPP_CONFIRMATION_ENABLED !== "true") {
    console.info("WhatsApp confirmation: SAFE MODE");
    return false;
  }

  if (
    !/^wamid\./.test(input.messageId) ||
    !/^212[567]\d{8}$/.test(input.phone) ||
    !["confirmed", "cancelled"].includes(input.action)
  ) {
    return false;
  }

  // Returns the order ID only for a new, valid confirmation.
  const { data: orderId, error } = await supabaseAdmin.rpc(
    "confirm_whatsapp_order_v2",
    {
      p_message_id: input.messageId,
      p_phone: input.phone,
      p_action: input.action,
    }
  );

  if (error) {
    console.error("WhatsApp confirmation RPC failed:", error.code);
    throw new Error("Could not process WhatsApp confirmation");
  }

  // Cancelled or duplicate replies must not create shipments.
  if (!orderId) {
    return false;
  }

  // No shipment is created unless explicitly enabled.
  if (process.env.OZON_STOCK_ENABLED !== "true") {
    console.info("Ozon fulfillment disabled for confirmed order");
    return true;
  }

  try {
    const result = await sendConfirmedOrderToOzon(orderId);

    console.info("Ozon fulfillment status:", result.status);
  } catch (error) {
    console.error(
      "Ozon fulfillment requires attention:",
      error instanceof Error ? error.message : "Unknown error"
    );
    // The order remains confirmed.
    // Do not retry a potentially submitted shipment blindly.
  }

  return true;
}
