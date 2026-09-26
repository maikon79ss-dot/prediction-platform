"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";

type RankingUser = {
  id: number;
  name: string;
  points: number;
  predictions: number;
  correct: number;
  accuracy: number;
};

const users: RankingUser[] = [
  {
    id: 1,
    name: "Alexander",
    points: 28450,
    predictions: 192,
    correct: 148,
    accuracy: 77.1,
  },
  {
    id: 2,
    name: "Maria",
    points: 25100,
    predictions: 175,
    correct: 131,
    accuracy: 74.9,
  },
  {
    id: 3,
    name: "Stefan",
    points: 22150,
    predictions: 147,
    correct: 103,
    accuracy: 70.1,
  },
  {
    id: 4,
    name: "Daniel",
    points: 19800,
    predictions: 160,
    correct: 109,
    accuracy: 68.1,
  },
  {
    id: 5,
    name: "Elena",
    points: 17600,
    predictions: 135,
    correct: 89,
    accuracy: 65.9,
  },
];

export default function RankingsPage() {
  const [language, setLanguage] = useState<Language>("bg");

  const t =
    language === "bg"
      ? {
          title: "Класация",
          subtitle: "Най-добрите прогнозисти в платформата",
          back: "Обратно към таблото",
          rank: "Място",
          user: "Потребител",
          points: "Точки",
          predictions: "Прогнози",
          correct: "Познати",
          accuracy: "Точност",
          yourPosition: "Твоята позиция",
          infoTitle: "Как се определя класацията",
          infoText:
            "Класацията се базира основно на общия брой точки, като допълнително се показват броят прогнози, познатите прогнози и процентът точност.",
        }
      : {
          title: "Rankings",
          subtitle: "Top predictors on the platform",
          back: "Back to dashboard",
          rank: "Rank",
          user: "User",
          points: "Points",
          predictions: "Predictions",
          correct: "Correct",
          accuracy: "Accuracy",
          yourPosition: "Your position",
          infoTitle: "How rankings are calculated",
          infoText:
            "Rankings are based primarily on total points, while total predictions, correct predictions and accuracy are also displayed.",
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
        <div className="rounded-3xl border border-emerald-500/20 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-emerald-400">
            {t.yourPosition}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-4xl font-bold">#3</p>
              <p className="mt-2 text-slate-400">Stefan</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">{t.points}</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">
                22,150
              </p>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                    {t.rank}
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                    {t.user}
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                    {t.points}
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                    {t.predictions}
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                    {t.correct}
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                    {t.accuracy}
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-800 last:border-b-0 ${
                      user.name === "Stefan"
                        ? "bg-emerald-500/5"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? "bg-amber-400 text-slate-950"
                            : index === 1
                            ? "bg-slate-300 text-slate-950"
                            : index === 2
                            ? "bg-orange-400 text-slate-950"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      {user.name}
                    </td>

                    <td className="px-6 py-5 font-bold text-emerald-400">
                      {user.points.toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {user.predictions}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {user.correct}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {user.accuracy.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-2xl font-bold">{t.infoTitle}</h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {t.infoText}
          </p>
        </section>
      </section>
    </main>
  );
}