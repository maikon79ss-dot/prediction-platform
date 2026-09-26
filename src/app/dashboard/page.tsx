"use client";

import { useState } from "react";

type Language = "bg" | "en";

type Market = {
  type: string;
  categoryBg: string;
  categoryEn: string;
  eventBg: string;
  eventEn: string;
  starts: string;
  status: string;
  optionsBg: string[];
  optionsEn: string[];
};

type UserPrediction = {
  event: string;
  option: string;
  points: number;
};

const markets: Market[] = [
  {
    type: "football",
    categoryBg: "Футбол",
    categoryEn: "Football",
    eventBg: "Arsenal срещу Liverpool",
    eventEn: "Arsenal vs Liverpool",
    starts: "15:00",
    status: "OPEN",
    optionsBg: ["Домакин", "Равен", "Гост"],
    optionsEn: ["Home", "Draw", "Away"],
  },
  {
    type: "tennis",
    categoryBg: "Тенис",
    categoryEn: "Tennis",
    eventBg: "Григор Димитров срещу Новак Джокович",
    eventEn: "Grigor Dimitrov vs Novak Djokovic",
    starts: "17:30",
    status: "OPEN",
    optionsBg: ["Григор Димитров", "Новак Джокович"],
    optionsEn: ["Grigor Dimitrov", "Novak Djokovic"],
  },
  {
    type: "weather",
    categoryBg: "Време",
    categoryEn: "Weather",
    eventBg: "Какво ще бъде времето днес?",
    eventEn: "What will the weather be today?",
    starts: "09:00 – 11:00",
    status: "OPEN",
    optionsBg: [
      "Снеговалеж",
      "Слънчево",
      "Облачно",
      "Дъждовно",
      "Слънце и дъжд",
      "Слънце и облаци",
    ],
    optionsEn: [
      "Snow",
      "Sunny",
      "Cloudy",
      "Rainy",
      "Sun & Rain",
      "Sun & Clouds",
    ],
  },
];

export default function DashboardPage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [balance, setBalance] = useState(10000);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [message, setMessage] = useState("");

  const t =
    language === "bg"
      ? {
          dashboard: "Табло",
          welcome: "Добре дошъл",
          subtitle: "Твоето табло за прогнози",
          available: "Налични",
          locked: "Заключени",
          points: "точки",
          predictions: "Прогнози",
          correct: "Познати",
          accuracy: "Точност",
          ranking: "Класиране",
          upcoming: "Предстоящи събития",
          openPredictions: "Отворени прогнози",
          dailyMinimum: "Минимум за ежедневна прогноза: 100 точки",
          startsAt: "Период / начало",
          amount: "Точки",
          makePrediction: "Потвърди прогноза",
          longTerm: "Дългосрочна прогноза",
          leagueQuestion: "Кой ще спечели Premier League?",
          minimum1000: "Минимум: 1 000 точки",
          viewMarket: "Виж прогнозата",
          weatherPrediction: "Прогноза за времето",
          rainQuestion: "Какво ще бъде времето днес?",
          closes: "Прогнозите са отворени от 09:00 до 11:00",
          chooseOption: "Избери резултат преди да потвърдиш.",
          minimumError: "Минималната прогноза е 100 точки.",
          balanceError: "Нямаш достатъчно точки в баланса.",
          success: "Прогнозата е приета успешно.",
          myPredictions: "Моите прогнози",
          noPredictions: "Все още нямаш направени прогнози.",
          menu: [
            "Преглед",
            "Спорт на живо",
            "Футбол",
            "Тенис",
            "Баскетбол",
            "Време",
            "Дългосрочни",
            "Моите прогнози",
            "Баланс",
            "Класация",
            "История",
            "Профил",
          ],
        }
      : {
          dashboard: "Dashboard",
          welcome: "Welcome back",
          subtitle: "Your prediction dashboard",
          available: "Available",
          locked: "Locked",
          points: "points",
          predictions: "Predictions",
          correct: "Correct",
          accuracy: "Accuracy",
          ranking: "Ranking",
          upcoming: "Upcoming events",
          openPredictions: "Open Predictions",
          dailyMinimum: "Daily minimum: 100 points",
          startsAt: "Period / start",
          amount: "Points",
          makePrediction: "Confirm prediction",
          longTerm: "Long-term prediction",
          leagueQuestion: "Who will win the Premier League?",
          minimum1000: "Minimum: 1,000 points",
          viewMarket: "View market",
          weatherPrediction: "Weather prediction",
          rainQuestion: "What will the weather be today?",
          closes: "Predictions are open from 09:00 to 11:00",
          chooseOption: "Choose an outcome before confirming.",
          minimumError: "The minimum prediction is 100 points.",
          balanceError: "You do not have enough points.",
          success: "Prediction submitted successfully.",
          myPredictions: "My Predictions",
          noPredictions: "You have not made any predictions yet.",
          menu: [
            "Overview",
            "Live Sports",
            "Football",
            "Tennis",
            "Basketball",
            "Weather",
            "Long-Term",
            "My Predictions",
            "Balance",
            "Rankings",
            "History",
            "Profile",
          ],
        };

  function handlePrediction(market: Market) {
    const key = market.eventEn;
    const selected = selectedOptions[key];
    const amount = amounts[key] ?? 100;

    if (!selected) {
      setMessage(t.chooseOption);
      return;
    }

    if (amount < 100) {
      setMessage(t.minimumError);
      return;
    }

    if (amount > balance) {
      setMessage(t.balanceError);
      return;
    }

    const event =
      language === "bg" ? market.eventBg : market.eventEn;

    setBalance((current) => current - amount);

    setPredictions((current) => [
      ...current,
      {
        event,
        option: selected,
        points: amount,
      },
    ]);

    setSelectedOptions((current) => ({
      ...current,
      [key]: "",
    }));

    setAmounts((current) => ({
      ...current,
      [key]: 100,
    }));

    setMessage(t.success);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 lg:block">
          <div className="border-b border-slate-800 px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Prediction Platform
            </p>
            <h1 className="mt-2 text-xl font-bold">{t.dashboard}</h1>
          </div>

          <nav className="space-y-1 p-4">
            {t.menu.map((item, index) => (
              <button
                key={item}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  index === 0
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-800 bg-slate-950/95">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-8">
              <div>
                <p className="text-sm text-slate-400">{t.welcome}</p>
                <h2 className="text-2xl font-bold">{t.subtitle}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
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

                <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {t.available}
                  </p>
                  <p className="text-xl font-bold text-emerald-400">
                    {balance.toLocaleString()} {t.points}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {t.locked}
                  </p>
                  <p className="text-xl font-bold">
                    {predictions
                      .reduce((sum, item) => sum + item.points, 0)
                      .toLocaleString()}{" "}
                    {t.points}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={t.predictions}
                value={String(predictions.length)}
              />
              <StatCard label={t.correct} value="0" />
              <StatCard label={t.accuracy} value="—" />
              <StatCard label={t.ranking} value="—" />
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
                {message}
              </div>
            )}

            <section className="mt-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    {t.upcoming}
                  </p>
                  <h3 className="text-3xl font-bold">{t.openPredictions}</h3>
                </div>

                <p className="text-sm text-slate-400">
                  {t.dailyMinimum}
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {markets.map((market) => {
                  const key = market.eventEn;

                  const category =
                    language === "bg"
                      ? market.categoryBg
                      : market.categoryEn;

                  const event =
                    language === "bg"
                      ? market.eventBg
                      : market.eventEn;

                  const options =
                    language === "bg"
                      ? market.optionsBg
                      : market.optionsEn;

                  return (
                    <article
                      key={key}
                      className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                          {category}
                        </span>

                        <span className="text-xs font-bold text-emerald-400">
                          {market.status}
                        </span>
                      </div>

                      <h4 className="mt-5 text-xl font-bold">
                        {event}
                      </h4>

                      <p className="mt-3 text-sm text-slate-400">
                        {t.startsAt}: {market.starts}
                      </p>

                      <div
                        className={`mt-6 grid gap-2 ${
                          options.length === 3
                            ? "grid-cols-3"
                            : "grid-cols-2"
                        }`}
                      >
                        {options.map((option) => {
                          const isSelected =
                            selectedOptions[key] === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((current) => ({
                                  ...current,
                                  [key]: option,
                                }))
                              }
                              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                isSelected
                                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                                  : "border-slate-700 hover:border-emerald-400"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-sm text-slate-400">
                          {t.amount}
                        </label>

                        <input
                          type="number"
                          min="100"
                          value={amounts[key] ?? 100}
                          onChange={(event) =>
                            setAmounts((current) => ({
                              ...current,
                              [key]:
                                Number(event.target.value) || 0,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePrediction(market)}
                        className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400"
                      >
                        {t.makePrediction}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-12">
              <div className="mb-5">
                <p className="text-sm font-medium text-emerald-400">
                  {t.myPredictions}
                </p>
              </div>

              {predictions.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
                  {t.noPredictions}
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.map((prediction, index) => (
                    <div
                      key={`${prediction.event}-${index}`}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <p className="font-bold">
                        {prediction.event}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {prediction.option}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-emerald-400">
                        {prediction.points.toLocaleString()}{" "}
                        {t.points}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6">
                <p className="text-sm font-medium text-amber-400">
                  {t.longTerm}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {t.leagueQuestion}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  {t.minimum1000}
                </p>

                <button className="mt-6 rounded-xl border border-amber-400 px-5 py-3 font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950">
                  {t.viewMarket}
                </button>
              </div>

              <div className="rounded-3xl border border-sky-500/20 bg-slate-900 p-6">
                <p className="text-sm font-medium text-sky-400">
                  {t.weatherPrediction}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {t.rainQuestion}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  {t.closes}
                </p>

                <button className="mt-6 rounded-xl border border-sky-400 px-5 py-3 font-bold text-sky-300 hover:bg-sky-400 hover:text-slate-950">
                  {t.viewMarket}
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}