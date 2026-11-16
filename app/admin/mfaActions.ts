"use server";

import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";

// Checks the 6-digit code from the authenticator app. On success the
// session is upgraded to aal2 and the admin can open every page.
export async function verifyAdminCode(formData: FormData) {
  const { supabase } = await requireAdminUser();

  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");

  if (!/^[0-9a-f-]{36}$/i.test(factorId) || !/^\d{6}$/.test(code)) {
    redirect("/admin/mfa?error=1");
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) {
    console.warn("Admin 2FA code rejected");
    redirect("/admin/mfa?error=1");
  }

  redirect("/admin");
}
