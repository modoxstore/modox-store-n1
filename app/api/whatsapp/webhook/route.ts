import { processWhatsAppConfirmation } from "@/lib/whatsappConfirmation";
import { CANCEL_PREFIX, CONFIRM_PREFIX } from "@/lib/whatsapp";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    token &&
    params.get("hub.mode") === "subscribe" &&
    params.get("hub.verify_token") === token &&
    params.get("hub.challenge")
  ) {
    return new Response(params.get("hub.challenge"), {
      status: 200,
    });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const secret = process.env.META_APP_SECRET;

  if (!secret) {
    return new Response("Not configured", { status: 503 });
  }

  const signature = request.headers.get("x-hub-signature-256");

  if (!signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const raw = Buffer.from(await request.arrayBuffer());

  const expected = createHmac("sha256", secret)
    .update(raw)
    .digest();

  const received = Buffer.from(signature.slice(7), "hex");

  if (
    received.length !== expected.length ||
    !timingSafeEqual(expected, received)
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: any;

  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  let detected = 0;

  for (const entry of event.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      // Delivery updates from Meta (sent / delivered / read / failed).
      // Meta accepting a send does not mean it was delivered, so a
      // "failed" status marks the confirmation row as failed.
      for (const status of change.value?.statuses ?? []) {
        const errors = (status.errors ?? []).map(
          (e: { code?: number; title?: string; error_data?: { details?: string } }) => ({
            code: e.code,
            title: e.title,
            details: e.error_data?.details,
          })
        );

        console.info("WhatsApp status", {
          status: status.status,
          messageId: status.id,
          errors,
        });

        if (status.status === "failed" && typeof status.id === "string") {
          const { error } = await supabaseAdmin
            .from("whatsapp_order_confirmations")
            .update({ status: "failed" })
            .eq("message_id", status.id)
            .eq("status", "sent");

          if (error) console.error("Could not mark WhatsApp message failed");
        }
      }

      for (const message of change.value?.messages ?? []) {
        const text =
          message.type === "button"
            ? message.button?.text
            : message.type === "interactive"
              ? message.interactive?.button_reply?.title
              : null;

        const payload: unknown =
          message.type === "button" ? message.button?.payload : null;

        // Prefer the per-order payload; fall back to the button title
        // for messages sent before payloads were added.
        let action: "confirmed" | "cancelled" | null = null;
        let payloadOrderId: string | undefined;

        if (typeof payload === "string" && payload.startsWith(CONFIRM_PREFIX)) {
          action = "confirmed";
          payloadOrderId = payload.slice(CONFIRM_PREFIX.length);
        } else if (typeof payload === "string" && payload.startsWith(CANCEL_PREFIX)) {
          action = "cancelled";
          payloadOrderId = payload.slice(CANCEL_PREFIX.length);
        } else if (text === "تأكيد الطلب") {
          action = "confirmed";
        } else if (text === "إلغاء الطلب") {
          action = "cancelled";
        }

        const originalMessageId = message.context?.id;
        const customerPhone = message.from;

        if (action && originalMessageId && customerPhone) {
          detected++;

          // Still disabled unless WHATSAPP_CONFIRMATION_ENABLED=true
          await processWhatsAppConfirmation({
            messageId: originalMessageId,
            phone: customerPhone,
            action,
            payloadOrderId,
          });
        }
      }
    }
  }

  console.info("WhatsApp webhook processed", {
    detected,
    safeMode: true,
  });

  return NextResponse.json({ received: true });
}
