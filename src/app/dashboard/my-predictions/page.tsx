"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";
type Filter = "active" | "won" | "lost" | "long";

type Prediction = {
  id: number;
  type: Filter;
  eventBg: string;
  eventEn: string;
  choiceBg: string;
  choiceEn: string;
  points: number;
  date: string;
  statusBg: string;
  statusEn: string;
};

const predictions: Prediction[] = [
  {
    id: 1,
    type: "active",
    eventBg: "Arsenal срещу Liverpool",
    eventEn: "Arsenal vs Liverpool",
    choiceBg: "Arsenal",
    choiceEn: "Arsenal",
    points: 100,
    date: "26.09.2026 15:00",
    statusBg: "АКТИВНА",
    statusEn: "ACTIVE",
  },
  {
    id: 2,
    type: "won",
    eventBg: "Григор Димитров срещу Новак Джокович",
    eventEn: "Grigor Dimitrov vs Novak Djokovic",
    choiceBg: "Григор Димитров",
    choiceEn: "Grigor Dimitrov",
    points: 250,
    date: "25.09.2026 17:30",
    statusBg: "ПОЗНАТА",
    statusEn: "WON",
  },
  {
    id: 3,
    type: "lost",
    eventBg: "Lakers срещу Celtics",
    eventEn: "Lakers vs Celtics",
    choiceBg: "Lakers",
    choiceEn: "Lakers",
    points: 300,
    date: "24.09.2026 21:00",
    statusBg: "НЕПОЗНАТА",
    statusEn: "LOST",
  },
  {
    id: 4,
    type: "long",
    eventBg: "Кой ще стане шампион на България?",
    eventEn: "Who will become Bulgarian champion?",
    choiceBg: "Лудогорец",
    choiceEn: "Ludogorets",
    points: 1000,
    date: "20.09.2026",
    statusBg: "ДЪЛГОСРОЧНА",
    statusEn: "LONG-TERM",
  },
];

export default function MyPredictionsPage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [filter, setFilter] = useState<Filter>("active");

  const t =
    language === "bg"
      ? {
          title: "Моите прогнози",
          subtitle: "Следи всички свои прогнози и техния статус",
          back: "Обратно към таблото",
          active: "Активни",
          won: "Познати",
          lost: "Непознати",
          long: "Дългосрочни",
          choice: "Избор",
          points: "Точки",
          date: "Дата / час",
          noItems: "Няма прогнози в тази категория.",
        }
      : {
          title: "My Predictions",
          subtitle: "Track all your predictions and their status",
          back: "Back to dashboard",
          active: "Active",
          won: "Won",
          lost: "Lost",
          long: "Long-Term",
          choice: "Choice",
          points: "Points",
          date: "Date / time",
          noItems: "No predictions in this category.",
        };

  const filteredPredictions = predictions.filter(
    (prediction) => prediction.type === filter
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "active", label: t.active },
    { value: "won", label: t.won },
    { value: "lost", label: t.lost },
    { value: "long", label: t.long },
  ];

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
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const isActive = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-400 bg-emerald-500 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-400"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {filteredPredictions.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
              {t.noItems}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPredictions.map((prediction) => (
                <article
                  key={prediction.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          prediction.type === "won"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : prediction.type === "lost"
                            ? "bg-red-500/10 text-red-300"
                            : prediction.type === "long"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-sky-500/10 text-sky-300"
                        }`}
                      >
                        {language === "bg"
                          ? prediction.statusBg
                          : prediction.statusEn}
                      </span>

                      <h2 className="mt-4 text-xl font-bold">
                        {language === "bg"
                          ? prediction.eventBg
                          : prediction.eventEn}
                      </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-right">
                      <p className="text-xs text-slate-500">
                        {t.points}
                      </p>
                      <p className="text-lg font-bold text-emerald-400">
                        {prediction.points.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.choice}
                      </p>
                      <p className="mt-2 font-semibold">
                        {language === "bg"
                          ? prediction.choiceBg
                          : prediction.choiceEn}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.date}
                      </p>
                      <p className="mt-2 font-semibold">
                        {prediction.date}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}