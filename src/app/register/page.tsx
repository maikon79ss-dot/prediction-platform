"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [language, setLanguage] = useState<"bg" | "en">("bg");

  const t =
    language === "bg"
      ? {
          title: "Създай акаунт",
          subtitle:
            "Регистрирай се и започни с 10 000 виртуални точки.",
          name: "Име",
          email: "Имейл",
          password: "Парола",
          confirm: "Повтори паролата",
          register: "Създай акаунт",
          already: "Вече имаш акаунт?",
          login: "Вход",
          back: "Обратно към началната страница",
          bonus: "Стартов баланс: 10 000 точки",
        }
      : {
          title: "Create an account",
          subtitle:
            "Register and start with 10,000 virtual points.",
          name: "Name",
          email: "Email",
          password: "Password",
          confirm: "Confirm password",
          register: "Create account",
          already: "Already have an account?",
          login: "Login",
          back: "Back to homepage",
          bonus: "Starting balance: 10,000 points",
        };

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

            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              {t.bonus}
            </div>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {t.name}
                </label>

                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {t.email}
                </label>

                <input
                  type="email"
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
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {t.confirm}
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400"
              >
                {t.register}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {t.already}{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                {t.login}
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