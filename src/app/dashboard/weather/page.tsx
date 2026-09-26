"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "bg" | "en";

const weatherOptions = [
  {
    bg: "Снеговалеж",
    en: "Snow",
  },
  {
    bg: "Слънчево",
    en: "Sunny",
  },
  {
    bg: "Облачно",
    en: "Cloudy",
  },
  {
    bg: "Дъждовно",
    en: "Rainy",
  },
  {
    bg: "Слънце с дъжд",
    en: "Sun & Rain",
  },
  {
    bg: "Слънце с облак",
    en: "Sun & Clouds",
  },
];

export default function WeatherPage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [selected, setSelected] = useState("");
  const [points, setPoints] = useState(100);
  const [message, setMessage] = useState("");

  const t =
    language === "bg"
      ? {
          title: "Времето",
          subtitle: "Дневна прогноза за времето",
          back: "Обратно към таблото",
          open: "ОТВОРЕНО",
          predictionWindow: "Прогнозиране",
          time: "09:00 – 11:00",
          minimum: "Минимум: 100 точки",
          question: "Какво ще бъде времето днес?",
          instruction: "Избери една от възможностите",
          points: "Точки",
          confirm: "Потвърди прогноза",
          chooseFirst: "Първо избери прогноза за времето.",
          minimumError: "Минималната прогноза е 100 точки.",
          success: "Прогнозата за времето е приета.",
          infoTitle: "Как работи дневната прогноза",
          info1: "Прогнозите са отворени всеки ден от 09:00 до 11:00.",
          info2: "След 11:00 нови прогнози не се приемат.",
          info3:
            "По-късно официалният резултат ще се определя автоматично чрез метеорологични данни.",
          info4:
            "При правилна прогноза точките се начисляват след потвърждаване на резултата.",
        }
      : {
          title: "Weather",
          subtitle: "Daily weather prediction",
          back: "Back to dashboard",
          open: "OPEN",
          predictionWindow: "Prediction window",
          time: "09:00 – 11:00",
          minimum: "Minimum: 100 points",
          question: "What will the weather be today?",
          instruction: "Choose one option",
          points: "Points",
          confirm: "Confirm prediction",
          chooseFirst: "Choose a weather prediction first.",
          minimumError: "The minimum prediction is 100 points.",
          success: "Weather prediction submitted.",
          infoTitle: "How the daily prediction works",
          info1: "Predictions are open every day from 09:00 to 11:00.",
          info2: "After 11:00, new predictions are closed.",
          info3:
            "Later, the official result will be determined automatically using weather data.",
          info4:
            "Correct predictions receive points after the result is confirmed.",
        };

  function handleSubmit() {
    if (!selected) {
      setMessage(t.chooseFirst);
      return;
    }

    if (points < 100) {
      setMessage(t.minimumError);
      return;
    }

    setMessage(t.success);
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

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-sky-500/20 bg-slate-900 p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-300">
                {t.open}
              </span>

              <h2 className="mt-5 text-3xl font-bold">
                {t.question}
              </h2>

              <p className="mt-3 text-slate-400">
                {t.predictionWindow}:{" "}
                <span className="font-semibold text-white">
                  {t.time}
                </span>
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {t.minimum}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-sm font-semibold text-slate-300">
              {t.instruction}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {weatherOptions.map((option) => {
                const label =
                  language === "bg" ? option.bg : option.en;

                const isSelected = selected === option.en;

                return (
                  <button
                    key={option.en}
                    type="button"
                    onClick={() => setSelected(option.en)}
                    className={`rounded-2xl border px-4 py-5 text-left font-semibold transition ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-500 text-slate-950"
                        : "border-slate-700 bg-slate-950 hover:border-sky-400"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 max-w-md">
            <label className="mb-2 block text-sm text-slate-400">
              {t.points}
            </label>

            <input
              type="number"
              min="100"
              value={points}
              onChange={(event) =>
                setPoints(Number(event.target.value) || 0)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
            />

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400"
            >
              {t.confirm}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
              {message}
            </div>
          )}
        </div>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h3 className="text-2xl font-bold">{t.infoTitle}</h3>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[t.info1, t.info2, t.info3, t.info4].map(
              (item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >
                  <p className="text-sm font-bold text-sky-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {item}
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}