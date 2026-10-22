import { sendAndSaveConfirmation } from "@/lib/whatsappSendAndSave";

import { NextRequest, NextResponse } from "next/server";

import { createHash } from "node:crypto";

async function checkRateLimit(identifier: string) {
  const hash = createHash("sha256")
    .update(identifier)
    .digest("hex");

  const { data, error } = await supabaseAdmin.rpc(
    "check_checkout_rate_limit",
    { p_identifier_hash: hash }
  );

  if (error) {
    console.error("Rate limit error:", error.message);
    return false;
  }

  return data === true;
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Do not accept real orders until idempotency and rate limits are ready.
  if (process.env.CHECKOUT_V2_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Checkout V2 is not enabled yet." },
      { status: 503 }
    );
  }

  try {
    const raw = await request.text();
    if (raw.length > 10000) {
      return NextResponse.json(
        { error: "Request too large" }, { status: 413 }
      );
    }

    const body = JSON.parse(raw);
    const { checkoutKey, customerName, phone, cityId, address, items } = body;

    if (
      typeof checkoutKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(checkoutKey) ||
      typeof customerName !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !Number.isInteger(cityId) ||
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 20
    ) {
      return NextResponse.json(
        { error: "Invalid order" }, { status: 400 }
      );
    }

    if (items.some((item) =>
      typeof item?.name !== "string" ||
      item.name.length < 1 ||
      item.name.length > 200 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    )) {
      return NextResponse.json(
        { error: "Invalid cart" }, { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[\s+()-]/g, "");
    const normalizedPhone = cleanPhone.startsWith("0")
      ? "212" + cleanPhone.slice(1)
      : cleanPhone;

    if (!/^212[567]\d{8}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Invalid Moroccan phone" }, { status: 400 }
      );
    }


    const ip = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim();

    // Reject requests without a trusted client IP.
    if (!ip) {
      return NextResponse.json(
        { error: "Unable to validate request origin" },
        { status: 400 }
      );
    }

    const [ipAllowed, phoneAllowed] = await Promise.all([
      checkRateLimit("ip:" + ip),
      checkRateLimit("phone:" + normalizedPhone),
    ]);

    if (!ipAllowed || !phoneAllowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Try again later." },
        { status: 429 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "create_modox_v2_order_idempotent",
      {
        p_checkout_key: checkoutKey,
        p_customer_name: customerName.trim(),
        p_phone: normalizedPhone,
        p_city_id: cityId,
        p_address: address.trim(),
        p_items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      }
    );

    if (error) {
      console.error("Order RPC failed:", error.message);
      return NextResponse.json(
        { error: "Unable to create order. Check cart and delivery city." },
        { status: 400 }
      );
    }

    // Checkout and order creation must succeed independently of WhatsApp.
    if (process.env.WHATSAPP_SENDING_ENABLED === "true") {
      const { data: order, error: lookupError } = await supabaseAdmin
        .from("orders")
        .select("id,phone,customer_name,total,address,source,status")
        .eq("id", data)
        .eq("source", "modox_v2")
        .maybeSingle();

      if (lookupError || !order) {
        console.error("WhatsApp order lookup failed");
      } else if (
        order.status === "new" &&
        !/TEST/i.test(order.customer_name ?? "") &&
        !/DO NOT SHIP/i.test(order.address ?? "")
      ) {
        try {
          await sendAndSaveConfirmation({
            id: order.id,
            phone: order.phone,
            customerName: order.customer_name,
            total: order.total,
          });
        } catch (error) {
          console.error("WhatsApp confirmation not completed", error);
        }
      }
    }
    return NextResponse.json(
      { success: true, orderId: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Invalid request" }, { status: 400 }
    );
  }
}
