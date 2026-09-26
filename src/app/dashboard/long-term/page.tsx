"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";

type LongTermMarket = {
  categoryBg: string;
  categoryEn: string;
  questionBg: string;
  questionEn: string;
  closesBg: string;
  closesEn: string;
};

const longTermMarkets: LongTermMarket[] = [
  {
    categoryBg: "Футбол",
    categoryEn: "Football",
    questionBg: "Кой ще стане шампион на България?",
    questionEn: "Who will become Bulgarian champion?",
    closesBg: "Затваря преди решаващата част от сезона",
    closesEn: "Closes before the decisive part of the season",
  },
  {
    categoryBg: "Футбол",
    categoryEn: "Football",
    questionBg: "Кой ще спечели Купата на България?",
    questionEn: "Who will win the Bulgarian Cup?",
    closesBg: "Затваря преди финалната фаза",
    closesEn: "Closes before the final stage",
  },
  {
    categoryBg: "Футбол",
    categoryEn: "Football",
    questionBg: "Кой ще спечели Premier League?",
    questionEn: "Who will win the Premier League?",
    closesBg: "Сезонна прогноза",
    closesEn: "Season prediction",
  },
  {
    categoryBg: "Футбол",
    categoryEn: "Football",
    questionBg: "Кой ще спечели Champions League?",
    questionEn: "Who will win the Champions League?",
    closesBg: "Турнирна прогноза",
    closesEn: "Tournament prediction",
  },
  {
    categoryBg: "Тенис",
    categoryEn: "Tennis",
    questionBg: "Кой ще спечели Wimbledon?",
    questionEn: "Who will win Wimbledon?",
    closesBg: "Затваря преди началото на турнира",
    closesEn: "Closes before the tournament starts",
  },
  {
    categoryBg: "Тенис",
    categoryEn: "Tennis",
    questionBg: "Кой ще спечели US Open?",
    questionEn: "Who will win the US Open?",
    closesBg: "Затваря преди началото на турнира",
    closesEn: "Closes before the tournament starts",
  },
  {
    categoryBg: "Тенис",
    categoryEn: "Tennis",
    questionBg: "Кой ще спечели Roland Garros?",
    questionEn: "Who will win Roland Garros?",
    closesBg: "Затваря преди началото на турнира",
    closesEn: "Closes before the tournament starts",
  },
  {
    categoryBg: "Баскетбол",
    categoryEn: "Basketball",
    questionBg: "Кой ще стане шампион на NBA?",
    questionEn: "Who will win the NBA Championship?",
    closesBg: "Сезонна прогноза",
    closesEn: "Season prediction",
  },
  {
    categoryBg: "Баскетбол",
    categoryEn: "Basketball",
    questionBg: "Кой ще спечели EuroLeague?",
    questionEn: "Who will win the EuroLeague?",
    closesBg: "Сезонна прогноза",
    closesEn: "Season prediction",
  },
  {
    categoryBg: "Формула 1",
    categoryEn: "Formula 1",
    questionBg: "Кой ще стане световен шампион във Formula 1?",
    questionEn: "Who will become Formula 1 World Champion?",
    closesBg: "Сезонна прогноза",
    closesEn: "Season prediction",
  },
  {
    categoryBg: "Формула 1",
    categoryEn: "Formula 1",
    questionBg: "Кой конструктор ще спечели шампионата?",
    questionEn: "Which constructor will win the championship?",
    closesBg: "Сезонна прогноза",
    closesEn: "Season prediction",
  },
  {
    categoryBg: "Хокей",
    categoryEn: "Hockey",
    questionBg: "Кой ще спечели Stanley Cup?",
    questionEn: "Who will win the Stanley Cup?",
    closesBg: "Сезонна прогноза",
    closesEn: "Season prediction",
  },
];

const filters = [
  { bg: "Всички", en: "All", value: "all" },
  { bg: "Футбол", en: "Football", value: "Football" },
  { bg: "Тенис", en: "Tennis", value: "Tennis" },
  { bg: "Баскетбол", en: "Basketball", value: "Basketball" },
  { bg: "Формула 1", en: "Formula 1", value: "Formula 1" },
  { bg: "Хокей", en: "Hockey", value: "Hockey" },
];

export default function LongTermPage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [activeFilter, setActiveFilter] = useState("all");

  const t =
    language === "bg"
      ? {
          title: "Дългосрочни прогнози",
          subtitle: "Сезонни и турнирни пазари от различни спортове",
          back: "Обратно към таблото",
          minimum: "Минимум: 1 000 точки",
          open: "ОТВОРЕНО",
          view: "Виж пазара",
          infoTitle: "Как работят дългосрочните прогнози",
          infoText:
            "Точките остават заключени до приключване на събитието. След потвърждаване на официалния резултат правилните прогнози получават точките си обратно плюс печалбата в точки.",
        }
      : {
          title: "Long-Term Predictions",
          subtitle: "Season and tournament markets across different sports",
          back: "Back to dashboard",
          minimum: "Minimum: 1,000 points",
          open: "OPEN",
          view: "View market",
          infoTitle: "How long-term predictions work",
          infoText:
            "Points remain locked until the event is completed. After the official result is confirmed, correct predictions receive their points back plus the points profit.",
        };

  const visibleMarkets =
    activeFilter === "all"
      ? longTermMarkets
      : longTermMarkets.filter((market) => market.categoryEn === activeFilter);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
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
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-amber-400 bg-amber-400 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-400"
                }`}
              >
                {language === "bg" ? filter.bg : filter.en}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleMarkets.map((market) => (
            <article
              key={market.questionEn}
              className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  {language === "bg"
                    ? market.categoryBg
                    : market.categoryEn}
                </span>

                <span className="text-xs font-bold text-emerald-400">
                  {t.open}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold">
                {language === "bg"
                  ? market.questionBg
                  : market.questionEn}
              </h2>

              <p className="mt-3 text-sm text-slate-400">
                {language === "bg"
                  ? market.closesBg
                  : market.closesEn}
              </p>

              <p className="mt-2 text-sm font-semibold text-amber-300">
                {t.minimum}
              </p>

              <button
                type="button"
                className="mt-6 w-full rounded-xl border border-amber-400 px-5 py-3 font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950"
              >
                {t.view}
              </button>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h3 className="text-2xl font-bold">{t.infoTitle}</h3>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {t.infoText}
          </p>
        </section>
      </section>
    </main>
  );
}