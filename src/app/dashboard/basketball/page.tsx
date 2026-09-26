"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";

type BasketballMatch = {
  leagueBg: string;
  leagueEn: string;
  team1: string;
  team2: string;
  start: string;
};

const matches: BasketballMatch[] = [
  {
    leagueBg: "NBA",
    leagueEn: "NBA",
    team1: "Los Angeles Lakers",
    team2: "Boston Celtics",
    start: "21:00",
  },
  {
    leagueBg: "Евролига",
    leagueEn: "EuroLeague",
    team1: "Olympiacos",
    team2: "Real Madrid",
    start: "20:30",
  },
  {
    leagueBg: "Евролига",
    leagueEn: "EuroLeague",
    team1: "Fenerbahce",
    team2: "Panathinaikos",
    start: "19:45",
  },
];

const longTermMarkets = [
  {
    bg: "Кой ще стане шампион на NBA?",
    en: "Who will win the NBA Championship?",
  },
  {
    bg: "Кой ще спечели EuroLeague?",
    en: "Who will win the EuroLeague?",
  },
  {
    bg: "Кой ще стане MVP на NBA?",
    en: "Who will win the NBA MVP award?",
  },
  {
    bg: "Кой ще спечели финала на EuroLeague?",
    en: "Who will win the EuroLeague Final?",
  },
];

export default function BasketballPage() {
  const [language, setLanguage] = useState<Language>("bg");

  const t =
    language === "bg"
      ? {
          title: "Баскетбол",
          subtitle: "Предстоящи баскетболни прогнози",
          back: "Обратно към таблото",
          open: "ОТВОРЕНО",
          start: "Начало",
          minimum: "Минимум: 100 точки",
          points: "Точки",
          confirm: "Потвърди прогноза",
          leagues: "Първенства и турнири",
          longTerm: "Дългосрочни баскетболни прогнози",
          longTermMinimum: "Минимум: 1 000 точки",
          view: "Виж пазара",
        }
      : {
          title: "Basketball",
          subtitle: "Upcoming basketball predictions",
          back: "Back to dashboard",
          open: "OPEN",
          start: "Starts",
          minimum: "Minimum: 100 points",
          points: "Points",
          confirm: "Confirm prediction",
          leagues: "Leagues and tournaments",
          longTerm: "Long-term basketball predictions",
          longTermMinimum: "Minimum: 1,000 points",
          view: "View market",
        };

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
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-400">
            {t.leagues}
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {matches.map((match) => (
            <article
              key={`${match.team1}-${match.team2}`}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                  {language === "bg"
                    ? match.leagueBg
                    : match.leagueEn}
                </span>

                <span className="text-xs font-bold text-emerald-400">
                  {t.open}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold">
                {match.team1} vs {match.team2}
              </h2>

              <p className="mt-3 text-sm text-slate-400">
                {t.start}: {match.start}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {t.minimum}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button className="rounded-xl border border-slate-700 px-3 py-3 text-sm font-semibold hover:border-emerald-400">
                  {match.team1}
                </button>

                <button className="rounded-xl border border-slate-700 px-3 py-3 text-sm font-semibold hover:border-emerald-400">
                  {match.team2}
                </button>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-slate-400">
                  {t.points}
                </label>

                <input
                  type="number"
                  min="100"
                  defaultValue="100"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <button className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400">
                {t.confirm}
              </button>
            </article>
          ))}
        </div>

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold text-amber-400">
              {t.longTerm}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {longTermMarkets.map((market) => (
              <article
                key={market.en}
                className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6"
              >
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  LONG-TERM
                </span>

                <h3 className="mt-5 text-xl font-bold">
                  {language === "bg" ? market.bg : market.en}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  {t.longTermMinimum}
                </p>

                <button className="mt-6 rounded-xl border border-amber-400 px-5 py-3 font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950">
                  {t.view}
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}