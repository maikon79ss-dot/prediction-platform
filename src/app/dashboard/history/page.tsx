"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";
type HistoryFilter = "all" | "won" | "lost" | "refund";

type HistoryItem = {
  id: number;
  type: HistoryFilter;
  eventBg: string;
  eventEn: string;
  choiceBg: string;
  choiceEn: string;
  resultBg: string;
  resultEn: string;
  pointsUsed: number;
  balanceChange: number;
  date: string;
};

const historyItems: HistoryItem[] = [
  {
    id: 1,
    type: "won",
    eventBg: "Григор Димитров срещу Новак Джокович",
    eventEn: "Grigor Dimitrov vs Novak Djokovic",
    choiceBg: "Григор Димитров",
    choiceEn: "Grigor Dimitrov",
    resultBg: "Правилна прогноза",
    resultEn: "Correct prediction",
    pointsUsed: 250,
    balanceChange: 250,
    date: "25.09.2026 20:15",
  },
  {
    id: 2,
    type: "lost",
    eventBg: "Lakers срещу Celtics",
    eventEn: "Lakers vs Celtics",
    choiceBg: "Lakers",
    choiceEn: "Lakers",
    resultBg: "Неправилна прогноза",
    resultEn: "Incorrect prediction",
    pointsUsed: 300,
    balanceChange: -300,
    date: "24.09.2026 23:10",
  },
  {
    id: 3,
    type: "won",
    eventBg: "Arsenal срещу Liverpool",
    eventEn: "Arsenal vs Liverpool",
    choiceBg: "Arsenal",
    choiceEn: "Arsenal",
    resultBg: "Правилна прогноза",
    resultEn: "Correct prediction",
    pointsUsed: 100,
    balanceChange: 100,
    date: "23.09.2026 17:20",
  },
  {
    id: 4,
    type: "refund",
    eventBg: "Отменено спортно събитие",
    eventEn: "Cancelled sports event",
    choiceBg: "Прогнозата е анулирана",
    choiceEn: "Prediction cancelled",
    resultBg: "Точките са върнати",
    resultEn: "Points refunded",
    pointsUsed: 500,
    balanceChange: 500,
    date: "22.09.2026 19:45",
  },
];

export default function HistoryPage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const t =
    language === "bg"
      ? {
          title: "История",
          subtitle: "Архив на приключилите прогнози",
          back: "Обратно към таблото",
          all: "Всички",
          won: "Познати",
          lost: "Непознати",
          refund: "Върнати",
          choice: "Избор",
          result: "Резултат",
          pointsUsed: "Използвани точки",
          balanceChange: "Промяна в баланса",
          date: "Дата / час",
          noItems: "Няма записи в тази категория.",
        }
      : {
          title: "History",
          subtitle: "Archive of settled predictions",
          back: "Back to dashboard",
          all: "All",
          won: "Won",
          lost: "Lost",
          refund: "Refunded",
          choice: "Choice",
          result: "Result",
          pointsUsed: "Points used",
          balanceChange: "Balance change",
          date: "Date / time",
          noItems: "No records in this category.",
        };

  const filters: { value: HistoryFilter; label: string }[] = [
    { value: "all", label: t.all },
    { value: "won", label: t.won },
    { value: "lost", label: t.lost },
    { value: "refund", label: t.refund },
  ];

  const visibleItems =
    filter === "all"
      ? historyItems
      : historyItems.filter((item) => item.type === filter);

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
          {visibleItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
              {t.noItems}
            </div>
          ) : (
            <div className="space-y-4">
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.type === "won"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : item.type === "lost"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-violet-500/10 text-violet-300"
                        }`}
                      >
                        {item.type === "won"
                          ? t.won
                          : item.type === "lost"
                          ? t.lost
                          : t.refund}
                      </span>

                      <h2 className="mt-4 text-xl font-bold">
                        {language === "bg"
                          ? item.eventBg
                          : item.eventEn}
                      </h2>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {t.balanceChange}
                      </p>

                      <p
                        className={`mt-2 text-2xl font-bold ${
                          item.balanceChange >= 0
                            ? "text-emerald-400"
                            : "text-red-300"
                        }`}
                      >
                        {item.balanceChange > 0 ? "+" : ""}
                        {item.balanceChange.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.choice}
                      </p>

                      <p className="mt-2 font-semibold">
                        {language === "bg"
                          ? item.choiceBg
                          : item.choiceEn}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.result}
                      </p>

                      <p className="mt-2 font-semibold">
                        {language === "bg"
                          ? item.resultBg
                          : item.resultEn}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.pointsUsed}
                      </p>

                      <p className="mt-2 font-semibold">
                        {item.pointsUsed.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.date}
                      </p>

                      <p className="mt-2 font-semibold">{item.date}</p>
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