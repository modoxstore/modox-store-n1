import { login } from "../actions";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#050807] p-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-[#101713] p-8">
        <h1 className="text-center text-3xl font-black text-green-400">
          MODOX ADMIN
        </h1>
        <p className="mt-3 text-center text-zinc-400">
          تسجيل الدخول للوحة التحكم
        </p>

        {params.error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            معلومات الدخول غير صحيحة أو الحساب غير مرخص.
          </p>
        )}

        <form action={login} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-400 p-4 font-black text-black hover:bg-green-300"
          >
            دخول Admin
          </button>
        </form>
      </div>
    </main>
  );
}
