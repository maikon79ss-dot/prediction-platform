"use client";

import { useState } from "react";
import { translations, type Language } from "./translations";

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const previewMarkets = [
    {
      category: t.preview.football,
      title: t.preview.arsenal,
      detail: t.preview.arsenalTime,
    },
    {
      category: t.preview.tennis,
      title: t.preview.dimitrov,
      detail: t.preview.dimitrovTime,
    },
    {
      category: t.preview.weather,
      title: t.preview.rain,
      detail: t.preview.rainTime,
    },
  ];

  const categories = [
    t.categories.football,
    t.categories.tennis,
    t.categories.basketball,
    t.categories.weather,
    t.categories.formula1,
    t.categories.longTerm,
  ];

  const steps = [
    {
      number: "01",
      title: t.how.step1Title,
      text: t.how.step1Text,
    },
    {
      number: "02",
      title: t.how.step2Title,
      text: t.how.step2Text,
    },
    {
      number: "03",
      title: t.how.step3Title,
      text: t.how.step3Text,
    },
    {
      number: "04",
      title: t.how.step4Title,
      text: t.how.step4Text,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-400">
            Prediction Platform
          </p>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-700 p-1">
              <button
                type="button"
                onClick={() => setLanguage("bg")}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  language === "bg"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                BG
              </button>

              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  language === "en"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="/login"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
            >
              {t.nav.login}
            </a>

            <a
              href="/register"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
            >
              {t.nav.register}
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              {t.hero.eyebrow}
            </p>

            <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
              {t.hero.title1}
              <span className="block text-emerald-400">
                {t.hero.title2}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/register"
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400"
              >
                {t.hero.start}
              </a>

              <a
                href="#how-it-works"
                className="rounded-xl border border-slate-700 px-6 py-3 font-bold text-white hover:border-slate-500"
              >
                {t.hero.how}
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-500">{t.hero.note}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t.preview.label}</p>
                <h2 className="mt-1 text-2xl font-bold">{t.preview.title}</h2>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                {t.preview.liveLater}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {previewMarkets.map((market) => (
                <div
                  key={market.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-emerald-400">
                      {market.category}
                    </span>

                    <span className="text-xs text-slate-500">
                      {t.preview.open}
                    </span>
                  </div>

                  <p className="mt-2 font-semibold">{market.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {market.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
            {t.how.eyebrow}
          </p>

          <h2 className="mt-3 text-4xl font-bold">{t.how.title}</h2>

          <p className="mt-4 text-slate-400">{t.how.description}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.number}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm font-bold text-emerald-400">
                {item.number}
              </p>

              <h3 className="mt-4 text-xl font-bold">{item.title}</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
              {t.categories.eyebrow}
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {t.categories.title}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
              >
                <p className="text-lg font-bold">{category}</p>

                <p className="mt-2 text-sm text-slate-400">
                  {t.categories.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-amber-500/20 bg-slate-900 p-8">
            <p className="text-sm font-semibold text-amber-400">
              {t.longTerm.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-bold">{t.longTerm.title}</h2>

            <p className="mt-4 text-slate-400">
              {t.longTerm.description}
            </p>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-400">{t.longTerm.example}</p>

              <p className="mt-2 text-xl font-bold">{t.longTerm.question}</p>

              <p className="mt-2 text-sm text-amber-300">
                {t.longTerm.minimum}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-500/20 bg-slate-900 p-8">
            <p className="text-sm font-semibold text-sky-400">
              {t.performance.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {t.performance.title}
            </h2>

            <p className="mt-4 text-slate-400">
              {t.performance.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  {t.performance.accuracy}
                </p>

                <p className="mt-2 text-2xl font-bold">72%</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  {t.performance.ranking}
                </p>

                <p className="mt-2 text-2xl font-bold">#184</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            {t.cta.eyebrow}
          </p>

          <h2 className="mt-4 text-4xl font-bold">{t.cta.title}</h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            {t.cta.description}
          </p>

          <a
            href="/register"
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-7 py-3 font-bold text-slate-950 hover:bg-emerald-400"
          >
            {t.cta.button}
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500">
          <p>Prediction Platform</p>
          <p>{t.footer.points}</p>
        </div>
      </footer>
    </main>
  );
}