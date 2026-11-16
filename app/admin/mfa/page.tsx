import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";
import { verifyAdminCode } from "../mfaActions";

export const dynamic = "force-dynamic";

export default async function AdminMfaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdminUser();
  const { error: codeError } = await searchParams;

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect("/admin");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp?.[0] ?? null;

  let enrollment: { id: string; qr: string; secret: string } | null = null;

  if (!verified) {
    // First time: remove half-finished setups, then create a new one.
    for (const factor of factors?.all ?? []) {
      if (factor.status !== "verified") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "MODOX admin",
    });

    if (error || !data) {
      throw new Error("Could not start 2FA setup");
    }

    enrollment = {
      id: data.id,
      qr: data.totp.qr_code.startsWith("data:")
        ? data.totp.qr_code
        : `data:image/svg+xml;utf-8,${data.totp.qr_code}`,
      secret: data.totp.secret,
    };
  }

  const factorId = verified?.id ?? enrollment!.id;

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-map p-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-flare/20 bg-map-2 p-8">
        <h1 className="text-center text-3xl font-black text-flare">التحقق بخطوتين</h1>

        {enrollment ? (
          <>
            <p className="mt-4 text-center text-zinc-300">
              ضروري تفعّل 2FA باش تدخل للإدارة. سكاني هاد الكود بـ Google Authenticator ولا Microsoft Authenticator.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enrollment.qr}
              alt="QR code ديال التحقق بخطوتين"
              className="mx-auto mt-6 h-52 w-52 rounded-xl bg-white p-2"
            />
            <p className="mt-4 text-center text-xs text-zinc-400">
              إلا ما خدمش السكان، دخل هاد الكود يدوياً:
            </p>
            <p dir="ltr" className="mt-1 select-all break-all text-center font-mono text-sm text-zinc-200">
              {enrollment.secret}
            </p>
          </>
        ) : (
          <p className="mt-4 text-center text-zinc-300">
            دخل الكود ديال 6 أرقام اللي كيبان فتطبيق Authenticator.
          </p>
        )}

        {codeError && (
          <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            الكود غالط ولا سالا الوقت ديالو. جرب الكود الجديد.
          </p>
        )}

        <form action={verifyAdminCode} className="mt-6 space-y-4">
          <input type="hidden" name="factorId" value={factorId} />
          <label htmlFor="code" className="block text-sm">الكود</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            dir="ltr"
            className="w-full rounded-xl border border-white/10 bg-black p-4 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-flare"
          />
          <button type="submit" className="w-full rounded-xl bg-flare p-4 font-black text-black hover:bg-[#ff9445]">
            تأكيد
          </button>
        </form>
      </div>
    </main>
  );
}
