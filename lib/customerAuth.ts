import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Customer accounts: phone number + 6-digit code sent on WhatsApp.
// Sessions are random tokens in an httpOnly cookie; only their SHA-256
// hash is stored, so a database leak does not expose live sessions.

export const SESSION_COOKIE = "modox_account";
const SESSION_DAYS = 30;

export function accountsEnabled() {
  return process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === "true";
}

export function hashLoginCode(phone: string, code: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing server key");
  return createHmac("sha256", key).update(`${phone}:${code}`).digest("hex");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function startSession(customerId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabaseAdmin.from("customer_sessions").insert({
    token_hash: hashToken(token),
    customer_id: customerId,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error("Could not start session");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export type Customer = { id: string; phone: string };

export async function getCurrentCustomer(): Promise<Customer | null> {
  if (!accountsEnabled()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const { data } = await supabaseAdmin
    .from("customer_sessions")
    .select("expires_at,customers(id,phone)")
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  const customer = Array.isArray(data?.customers)
    ? data?.customers[0]
    : data?.customers;

  return customer ? { id: customer.id, phone: customer.phone } : null;
}

export async function endSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await supabaseAdmin
      .from("customer_sessions")
      .delete()
      .eq("token_hash", hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getXpBalance(phone: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("customer_xp_balance", {
    p_phone: phone,
  });
  if (error) {
    console.error("XP balance error:", error.message);
    return 0;
  }
  return typeof data === "number" ? data : 0;
}
