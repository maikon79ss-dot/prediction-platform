"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";

export default function ProfilePage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [name, setName] = useState("Stefan");
  const [email, setEmail] = useState("stefan@example.com");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>("bg");
  const [message, setMessage] = useState("");

  const t =
    language === "bg"
      ? {
          title: "Профил",
          subtitle: "Управлявай основната информация за своя акаунт",
          back: "Обратно към таблото",
          name: "Име",
          email: "Имейл",
          preferredLanguage: "Предпочитан език",
          registered: "Регистрация",
          predictions: "Общо прогнози",
          accuracy: "Точност",
          balance: "Текущ баланс",
          save: "Запази промените",
          saved: "Профилът е запазен успешно.",
          stats: "Статистика на акаунта",
          accountInfo: "Информация за акаунта",
          futureTitle: "Допълнителни настройки",
          futureText:
            "По-късно тук ще добавим държава, часова зона и основно местоположение за дневните прогнози за времето.",
          bulgarian: "Български",
          english: "English",
        }
      : {
          title: "Profile",
          subtitle: "Manage the basic information for your account",
          back: "Back to dashboard",
          name: "Name",
          email: "Email",
          preferredLanguage: "Preferred language",
          registered: "Registered",
          predictions: "Total predictions",
          accuracy: "Accuracy",
          balance: "Current balance",
          save: "Save changes",
          saved: "Profile saved successfully.",
          stats: "Account statistics",
          accountInfo: "Account information",
          futureTitle: "Additional settings",
          futureText:
            "Later we will add country, time zone and primary location for the daily weather predictions here.",
          bulgarian: "Bulgarian",
          english: "English",
        };

  function handleSave() {
    setMessage(t.saved);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Prediction Platform
            </p>

            <h1 className="mt-2 text-3xl font-bold">{t.title}</h1>

            <p className="mt-1 text-sm text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-slate-500"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-2xl font-bold">{t.accountInfo}</h2>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {t.name}
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {t.email}
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {t.preferredLanguage}
                </label>

                <select
                  value={preferredLanguage}
                  onChange={(event) =>
                    setPreferredLanguage(event.target.value as Language)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="bg">{t.bulgarian}</option>
                  <option value="en">{t.english}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400"
              >
                {t.save}
              </button>

              {message && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
                  {message}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-2xl font-bold">{t.stats}</h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">{t.registered}</p>
                <p className="mt-2 text-xl font-bold">20.09.2026</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">{t.predictions}</p>
                <p className="mt-2 text-3xl font-bold">147</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">{t.accuracy}</p>
                <p className="mt-2 text-3xl font-bold">70.1%</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">{t.balance}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  22,150
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-sky-500/20 bg-slate-900 p-7">
          <h2 className="text-2xl font-bold">{t.futureTitle}</h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {t.futureText}
          </p>
        </section>
      </section>
    </main>
  );
}