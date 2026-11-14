"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendConfirmedOrderToOzon } from "@/lib/ozonSend";

// Confirms or cancels a new V2 order from the admin.
// admin_change_v2_order_status checks the order is still "new",
// blocks test orders, and puts stock back on cancel.
// A confirmation also creates the Ozon parcel (when Ozon is enabled),
// the same way a WhatsApp confirmation does.
export async function changeOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (
    !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(orderId) ||
    !["confirmed", "cancelled"].includes(action)
  ) {
    redirect("/admin/orders");
  }

  const { error } = await supabaseAdmin.rpc("admin_change_v2_order_status", {
    p_order_id: orderId,
    p_action: action,
  });

  if (error) {
    console.error("Admin status change failed:", error.message);
    revalidatePath(`/admin/orders/${orderId}`);
    redirect(
      `/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`
    );
  }

  let ozon = "";

  if (action === "confirmed") {
    try {
      const result = await sendConfirmedOrderToOzon(orderId);
      ozon = result.status;
    } catch (ozonError) {
      console.error(
        "Admin Ozon send failed:",
        ozonError instanceof Error ? ozonError.message : "Unknown error"
      );
      ozon = "error";
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  redirect(
    `/admin/orders/${orderId}?done=${action}${ozon ? `&ozon=${ozon}` : ""}`
  );
}

// Sends a confirmed order to Ozon again after Ozon refused it
// (status "failed"). sendConfirmedOrderToOzon only clears "failed"
// attempts, so a parcel that may exist is never sent twice.
export async function retryOzon(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");

  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(orderId)) {
    redirect("/admin/orders");
  }

  let ozon = "error";

  try {
    const result = await sendConfirmedOrderToOzon(orderId);
    ozon = result.status;
  } catch (ozonError) {
    console.error(
      "Admin Ozon retry failed:",
      ozonError instanceof Error ? ozonError.message : "Unknown error"
    );
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?ozon=${ozon}`);
}
