"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function savePromotion(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const price = Number(form.get("price"));
  const oldText = String(form.get("old_price") ?? "").trim();
  const endText = String(form.get("promo_end") ?? "").trim();
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) || !Number.isSafeInteger(price) || price < 0) throw new Error("Invalid product or price");
  let old_price: number | null = null;
  let promo_end: string | null = null;
  if (oldText || endText) {
    const old = Number(oldText);
    const date = new Date(endText);
    if (!oldText || !endText || !Number.isSafeInteger(old) || old <= price || !Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) throw new Error("Invalid promotion");
    old_price = old;
    promo_end = date.toISOString();
  }
  const { error } = await supabaseAdmin.from("products").update({ price, old_price, promo_end }).eq("id", id);
  if (error) throw new Error("Could not save promotion");
  revalidatePath("/admin/products"); revalidatePath("/"); revalidatePath("/shop");
}
