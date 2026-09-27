"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [language, setLanguage] = useState<"bg" | "en">("bg");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const t =
    language === "bg"
      ? {
          title: "Вход в акаунта",
          subtitle: "Влез, за да продължиш към своето табло и прогнози.",
          email: "Имейл",
          password: "Парола",
          login: "Вход",
          loggingIn: "Влизане...",
          noAccount: "Нямаш акаунт?",
          create: "Създай акаунт",
          back: "Обратно към началната страница",
          error: "Грешка при вход.",
          wrongCredentials: "Невалиден имейл или парола.",
          success: "Успешен вход.",
        }
      : {
          title: "Login to your account",
          subtitle: "Sign in to continue to your dashboard and predictions.",
          email: "Email",
          password: "Password",
          login: "Login",
          loggingIn: "Signing in...",
          noAccount: "Don't have an account?",
          create: "Create account",
          back: "Back to homepage",
          error: "Login failed.",
          wrongCredentials: "Invalid email or password.",
          success: "Login successful.",
        };

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      setMessage(t.success);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/user-not-found" ||
        error?.code === "auth/wrong-password"
      ) {
        setMessage(t.wrongCredentials);
      } else {
        setMessage(
          `${t.error} ${error?.code ? `(${error.code})` : ""}`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-400"
          >
            Prediction Platform
          </Link>

          <div className="flex rounded-xl border border-slate-700 p-1">
            <button
              type="button"
              onClick={() => setLanguage("bg")}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                language === "bg"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300"
              }`}
            >
              BG
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                language === "en"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Prediction Platform
            </p>

            <h1 className="mt-4 text-3xl font-bold">{t.title}</h1>

            <p className="mt-3 text-slate-400">{t.subtitle}</p>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {t.email}
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {t.password}
                </label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t.loggingIn : t.login}
              </button>
            </form>

            {message && (
              <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                {message}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-slate-400">
              {t.noAccount}{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                {t.create}
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-6 text-center">
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-white"
              >
                ← {t.back}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}