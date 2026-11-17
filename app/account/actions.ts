"use server";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  accountsEnabled,
  endSession,
  getCurrentCustomer,
  getXpBalance,
  hashLoginCode,
  startSession,
} from "@/lib/customerAuth";
import { sendLoginCode } from "@/lib/whatsapp";
import { sendAndSaveConfirmation } from "@/lib/whatsappSendAndSave";
import { getStoreProductBySlug } from "@/lib/storeProducts";
import { LEGENDARY_XP, REWARD_MAX_PRICE, normalizeMoroccanPhone } from "@/lib/xp";

export type LoginState = {
  step: "phone" | "code";
  phone?: string;
  error?: string;
};

async function allowed(identifier: string) {
  const { data, error } = await supabaseAdmin.rpc("check_checkout_rate_limit", {
    p_identifier_hash: createHash("sha256").update(identifier).digest("hex"),
  });
  return !error && data === true;
}

async function clientIp() {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

export async function requestLoginCode(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!accountsEnabled()) return { step: "phone", error: "الحسابات مازال ما تفتحاتش." };

  const phone = normalizeMoroccanPhone(String(formData.get("phone") ?? ""));
  if (!phone) return { step: "phone", error: "دخل رقم مغربي صحيح (06 / 07 / 05)." };

  const ip = await clientIp();
  if (!ip) return { step: "phone", error: "ما قدرناش نتحققو من الطلب. عاود جرب." };

  const [ipOk, phoneOk] = await Promise.all([
    allowed("login-ip:" + ip),
    allowed("login:" + phone),
  ]);
  if (!ipOk || !phoneOk) {
    return { step: "phone", error: "بزاف ديال المحاولات. جرب من بعد ساعة." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  const { error } = await supabaseAdmin.from("customer_login_codes").insert({
    phone,
    code_hash: hashLoginCode(phone, code),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (error) {
    console.error("Login code save failed:", error.message);
    return { step: "phone", error: "وقع مشكل. عاود جرب." };
  }

  try {
    await sendLoginCode(phone, code);
  } catch (sendError) {
    console.error(
      "Login code send failed:",
      sendError instanceof Error ? sendError.message : "unknown"
    );
    return { step: "phone", error: "ما قدرناش نصيفطو الكود فـ WhatsApp. تأكد من الرقم." };
  }

  return { step: "code", phone };
}

export async function verifyLoginCode(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const phone = normalizeMoroccanPhone(String(formData.get("phone") ?? ""));
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");

  if (!phone) return { step: "phone", error: "دخل الرقم من جديد." };
  if (!/^\d{6}$/.test(code)) {
    return { step: "code", phone, error: "الكود فيه 6 أرقام." };
  }

  const { data: customerId, error } = await supabaseAdmin.rpc(
    "verify_customer_login_code",
    { p_phone: phone, p_code_hash: hashLoginCode(phone, code) }
  );

  if (error || !customerId) {
    return {
      step: "code",
      phone,
      error: "الكود غالط ولا سالا الوقت ديالو (10 دقايق). جرب مرة أخرى ولا طلب كود جديد.",
    };
  }

  await startSession(String(customerId));
  redirect("/account");
}

export async function logout() {
  await endSession();
  redirect("/account");
}

// Legendary reward: one product under REWARD_MAX_PRICE, free; the customer
// pays delivery only. The order goes through the normal flow (WhatsApp
// confirmation, then Ozon with COD = delivery fee).
export async function claimReward(formData: FormData) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account");

  const slug = String(formData.get("product") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const cityId = Number(formData.get("cityId"));
  const back = `/account/reward?product=${encodeURIComponent(slug)}`;

  if (name.length < 3 || name.length > 80 || address.length < 6 || address.length > 200) {
    redirect(`${back}&error=form`);
  }
  if (!Number.isInteger(cityId) || cityId <= 0) redirect(`${back}&error=city`);

  if ((await getXpBalance(customer.phone)) < LEGENDARY_XP) redirect("/account");

  const { product } = await getStoreProductBySlug(slug);
  if (!product || product.price >= REWARD_MAX_PRICE || product.stock < 1) {
    redirect("/account?error=product");
  }

  const { data: orderId, error } = await supabaseAdmin.rpc(
    "create_modox_v2_order_idempotent",
    {
      p_checkout_key: randomUUID(),
      p_customer_name: name,
      p_phone: customer.phone,
      p_city_id: cityId,
      p_address: address,
      p_items: [{ name: product.name, quantity: 1 }],
    }
  );

  if (error || !orderId) {
    console.error("Reward order failed:", error?.message);
    redirect(`${back}&error=order`);
  }

  const { data: ok, error: finalizeError } = await supabaseAdmin.rpc(
    "finalize_legendary_reward",
    {
      p_order_id: orderId,
      p_phone: customer.phone,
      p_xp_cost: LEGENDARY_XP,
      p_max_price: REWARD_MAX_PRICE,
    }
  );

  if (finalizeError || ok !== true) {
    console.error("Reward finalize refused:", finalizeError?.message ?? "rules");
    // Put the stock back: the order must not stay as a paid order.
    await supabaseAdmin.rpc("admin_change_v2_order_status", {
      p_order_id: orderId,
      p_action: "cancelled",
    });
    redirect("/account?error=reward");
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id,phone,customer_name,total")
    .eq("id", orderId)
    .maybeSingle();

  if (order) {
    try {
      await sendAndSaveConfirmation({
        id: order.id,
        phone: order.phone,
        customerName: order.customer_name,
        total: order.total,
      });
    } catch (sendError) {
      console.error("Reward WhatsApp not sent", sendError);
    }
  }

  revalidatePath("/account");
  redirect(`/order/${orderId}`);
}
