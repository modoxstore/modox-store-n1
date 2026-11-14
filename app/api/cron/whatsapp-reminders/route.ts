import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getTestRecipients,
  isRecipientAllowed,
  sendOrderConfirmation,
} from "@/lib/whatsapp";

export const runtime = "nodejs";

// Called every hour by a Supabase pg_cron job.
// Re-sends the same confirmation template once when the customer has not
// answered 12 hours after the first message and the order is still new.
// Safe to call at any time: each order gets at most one reminder (claimed
// in the database before sending), so extra calls send nothing.
export async function GET() {
  if (process.env.WHATSAPP_SENDING_ENABLED !== "true") {
    return NextResponse.json({ skipped: "sending disabled" });
  }

  const now = Date.now();
  const olderThan = new Date(now - 12 * 3600_000).toISOString();
  const newerThan = new Date(now - 48 * 3600_000).toISOString();

  const { data: rows, error } = await supabaseAdmin
    .from("whatsapp_order_confirmations")
    .select(
      "order_id,phone,orders!inner(id,status,customer_name,address,total,source)"
    )
    .eq("status", "sent")
    .is("reminder_sent_at", null)
    .lt("created_at", olderThan)
    .gt("created_at", newerThan)
    .eq("orders.status", "new")
    .eq("orders.source", "modox_v2")
    .limit(20);

  if (error) {
    console.error("Reminder lookup failed:", error.message);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const order = (Array.isArray(row.orders) ? row.orders[0] : row.orders) as {
      id: string;
      customer_name: string | null;
      address: string | null;
      total: number;
    };

    const isTest =
      /TEST/i.test(order.customer_name ?? "") ||
      /DO NOT SHIP/i.test(order.address ?? "");

    if (
      !isRecipientAllowed(row.phone) ||
      (isTest && getTestRecipients() === null)
    ) {
      skipped++;
      continue;
    }

    // Claim the reminder first so a parallel run can never send it twice.
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("whatsapp_order_confirmations")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("order_id", order.id)
      .eq("status", "sent")
      .is("reminder_sent_at", null)
      .select("order_id");

    if (claimError || !claimed?.length) {
      skipped++;
      continue;
    }

    try {
      const response = await sendOrderConfirmation({
        phone: row.phone,
        customerName: order.customer_name ?? "",
        orderId: order.id,
        total: order.total,
      });

      const messageId = response?.messages?.[0]?.id;

      if (messageId) {
        await supabaseAdmin
          .from("whatsapp_order_confirmations")
          .update({ reminder_message_id: messageId })
          .eq("order_id", order.id);
      }

      sent++;
    } catch (sendError) {
      console.error(
        "Reminder send failed:",
        sendError instanceof Error ? sendError.message : "Unknown error"
      );
    }
  }

  console.info("WhatsApp reminders", { sent, skipped });
  return NextResponse.json({ sent, skipped });
}
