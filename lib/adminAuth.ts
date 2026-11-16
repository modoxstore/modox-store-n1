import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Signed-in admin, before the second factor (used by the 2FA page).
export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const adminId = process.env.ADMIN_USER_ID;

  if (error || !user || !adminId || user.id !== adminId) {
    redirect("/admin/login");
  }

  return { supabase, user };
}

// Every admin page and action: password AND authenticator code (aal2).
export async function requireAdmin() {
  const { supabase, user } = await requireAdminUser();

  const { data: aal, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error || aal?.currentLevel !== "aal2") {
    redirect("/admin/mfa");
  }

  return user;
}
