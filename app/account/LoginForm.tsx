"use client";

import { useActionState } from "react";
import { requestLoginCode, verifyLoginCode, type LoginState } from "./actions";

const initial: LoginState = { step: "phone" };

export default function LoginForm() {
  const [sendState, sendAction, sending] = useActionState(requestLoginCode, initial);
  const [verifyState, verifyAction, verifying] = useActionState(verifyLoginCode, initial);

  // Once a code was sent, the code form is shown until the user goes back.
  const showCode = sendState.step === "code" && verifyState.step !== "phone";
  const phone = sendState.phone ?? "";
  const error = showCode ? verifyState.error : sendState.error ?? verifyState.error;

  return (
    <div className="mt-8 max-w-md border border-line bg-map-2 p-6">
      {!showCode ? (
        <form action={sendAction} className="space-y-4">
          <label htmlFor="phone" className="block text-sm text-dim">
            رقم الهاتف (نفس الرقم اللي كتطلب بيه)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="06XXXXXXXX"
            required
            dir="ltr"
            className="w-full border border-line bg-map p-4 text-center font-mono text-xl text-ink outline-none focus:border-flare"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-flare p-4 font-arabic text-[20px] text-[#140a02] transition hover:bg-zone disabled:opacity-60"
          >
            {sending ? "كنصيفطو الكود..." : "صيفط ليا الكود فـ WhatsApp"}
          </button>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="phone" value={phone} />
          <p className="text-sm text-dim">
            صيفطنا كود ديال 6 أرقام لـ WhatsApp ديال{" "}
            <span dir="ltr" className="font-mono text-ink">+{phone}</span>
          </p>
          <label htmlFor="code" className="block text-sm text-dim">الكود</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            dir="ltr"
            className="w-full border border-line bg-map p-4 text-center font-mono text-2xl tracking-[0.5em] text-ink outline-none focus:border-flare"
          />
          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-flare p-4 font-arabic text-[20px] text-[#140a02] transition hover:bg-zone disabled:opacity-60"
          >
            {verifying ? "كنتحققو..." : "دخول"}
          </button>
        </form>
      )}

      {showCode && (
        <form action={sendAction} className="mt-3 text-center">
          <input type="hidden" name="phone" value={phone} />
          <button type="submit" disabled={sending} className="text-sm text-dim underline hover:text-flare">
            ما وصلكش؟ صيفط كود جديد
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 border border-hazard/40 bg-hazard/10 p-3 text-sm text-hazard">
          {error}
        </p>
      )}
    </div>
  );
}
