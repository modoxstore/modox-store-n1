import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prepareOzonStockOrder } from "@/lib/ozonFulfillment";

export async function sendConfirmedOrderToOzon(orderId: string) {
  if (process.env.OZON_STOCK_ENABLED !== "true") {
    return { status: "disabled" as const };
  }

  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error("Ozon credentials missing");
  }

  // Validate order and products before claiming fulfillment.
  const prepared = await prepareOzonStockOrder(orderId);

  if (
    !Number.isSafeInteger(prepared.productAmount) ||
    prepared.productAmount <= 0
  ) {
    throw new Error("Invalid product COD amount");
  }

  const { data: claimed, error: claimError } =
    await supabaseAdmin.rpc("claim_ozon_fulfillment", {
      p_order_id: orderId,
    });

  if (claimError) throw new Error("Ozon claim failed");

  if (claimed !== true) {
    return { status: "already_claimed" as const };
  }

  // From this point, never automatically retry the shipment.
  // Network failure may mean Ozon created the parcel.
  const updateFulfillment = async (
    status: "created" | "needs_review",
    tracking: string | null,
    response: unknown,
    lastError: string | null
  ) => {
    const { error } = await supabaseAdmin
      .from("ozon_fulfillments")
      .update({
        status,
        tracking_number: tracking,
        ozon_response: response,
        last_error: lastError,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .eq("status", "processing");

    if (error) {
      console.error("Ozon fulfillment persistence failed");
    }
  };

  try {
    const form = new FormData();

    for (const [key, value] of Object.entries(
      prepared.formFields
    )) {
      form.set(key, String(value));
    }

    form.set("parcel-price", String(prepared.productAmount));
    form.set("parcel-stock", "1");

    const url =
      "https://api.ozonexpress.ma/customers/" +
      encodeURIComponent(clientId) + "/" +
      encodeURIComponent(apiKey) + "/add-parcel";

    const response = await fetch(url, {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const raw = await response.text();

    let result: Record<string, unknown>;

    try {
      result = JSON.parse(raw);
    } catch {
      result = { unrecognized_response: true };
    }

    const checkApi = result.CHECK_API as
      | { RESULT?: string; MESSAGE?: string }
      | undefined;

    const tracking = result["TRACKING-NUMBER"];

    if (
      response.ok &&
      checkApi?.RESULT !== "ERROR" &&
      typeof tracking === "string" &&
      tracking.trim().length > 0
    ) {
      await updateFulfillment(
        "created",
        tracking.trim(),
        result,
        null
      );

      return {
        status: "created" as const,
        trackingNumber: tracking.trim(),
      };
    }

    await updateFulfillment(
      "needs_review",
      null,
      result,
      "Ozon response requires review"
    );

    return { status: "needs_review" as const };
  } catch {
    await updateFulfillment(
      "needs_review",
      null,
      { network_error: true },
      "Network error or timeout; check Ozon before retrying"
    );

    return { status: "needs_review" as const };
  }
}
