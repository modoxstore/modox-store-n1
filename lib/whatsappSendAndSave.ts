import "server-only";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmation } from "./whatsapp";

type Order = {
  id: string;
  phone: string;
  customerName: string;
  total: number;
};

export async function sendAndSaveConfirmation(order: Order) {
  if (process.env.WHATSAPP_SENDING_ENABLED !== "true") {
    return { status: "disabled" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server configuration");
  }

  const phone = order.phone.replace(/\D/g, "");

  if (!/^212[567]\d{8}$/.test(phone)) {
    throw new Error("Invalid recipient phone");
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Reserve the order once before sending.
  const { error: reservationError } = await supabase
    .from("whatsapp_order_confirmations")
    .insert({
      order_id: order.id,
      phone,
      status: "pending",
    });

  if (reservationError) {
    throw new Error("Confirmation already reserved or database error");
  }

  try {
    const response = await sendOrderConfirmation({
      phone,
      customerName: order.customerName,
      orderId: order.id,
      total: order.total,
    });

    const messageId = response?.messages?.[0]?.id;

    if (!messageId) {
      throw new Error("Missing WhatsApp message ID");
    }

    const { error: updateError } = await supabase
      .from("whatsapp_order_confirmations")
      .update({
        message_id: messageId,
        status: "sent",
      })
      .eq("order_id", order.id)
      .eq("status", "pending");

    if (updateError) {
      throw new Error("Could not save WhatsApp message ID");
    }

    return { status: "sent" };
  } catch (error) {
    await supabase
      .from("whatsapp_order_confirmations")
      .update({ status: "failed" })
      .eq("order_id", order.id)
      .eq("status", "pending");

    throw error;
  }
}
