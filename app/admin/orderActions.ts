"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Confirms or cancels a new V2 order from the admin.
// admin_change_v2_order_status checks the order is still "new",
// blocks test orders, and puts stock back on cancel.
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

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  if (error) {
    console.error("Admin status change failed:", error.message);
    redirect(
      `/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/admin/orders/${orderId}?done=${action}`);
}
