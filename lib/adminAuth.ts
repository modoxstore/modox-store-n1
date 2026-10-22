import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const adminId = process.env.ADMIN_USER_ID;

  if (error || !user || !adminId || user.id !== adminId) {
    redirect("/admin/login");
  }

  return user;
}
